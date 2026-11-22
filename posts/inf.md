---
title: "building a cpu inference engine from first principles"
date: 2026-08-07
description: aka making LLaMa 8B go as fast as possible on an AMD Zen 3
draft: true
---

## Part 0: What is This?

This is more or less an educational project. I want to actaully understand LLM inference by building it myself.

I had the idea a couple of months ago to see if I could build an inference engine on my CPU, specifically tailored to serve one model on my personal computer as fast as possible. I have an [AMD Ryzen 9 6900HX](https://www.techpowerup.com/cpu-specs/ryzen-9-6900hx.c2529) and decided on serving [LLAmA 3.1 8B](https://huggingface.co/meta-llama/Llama-3.1-8B). I'm writing this post in the hopes that it may be useful to someone who's interested in learning inference fundamentals from the ground up.

Because it's an educational project, I'm limiting my usage of AI. All of this blog is hand-written, and so is the bulk of the coding (random things like setting up the CMake structure are not, though). This means I took a LOT longer than I could have otherwise taken (a frontier model could probably one-shot this whole blog and more), but at least I understand what's happening behind the scenes! 

Before going through this post, I'd recommend being familiar with the basics of C++, computer architecture, transformers, and ML performance engineering. Here are some resources I would specifically recommend:
- ["The Illustrated Transformer"](https://jalammar.github.io/illustrated-transformer/): one of my favorite introductions to transformers.
- ["How to Scale Your Model"](https://jax-ml.github.io/scaling-book/): the JAX scaling book.

## Part 1: Tensor Class

Say we want to serve a model on our CPU. The first thing we need to do is to get something that holds the data. In machine learning, data is stored in tensors, which are multidimensional arrays. We want to make sure we can build a container that stores both the data (in any dimension) and the metadata needed to interpret it. Everything we do after this will interact with the tensor container we build, so we should design it very carefully.

Specifically, here are a few things our Tensor container has to get right:
- **They have to be data-type agnostic** because tensor data can be 32-bit floats, 16-bit floats, or more compactly quantized formats, so we should store the raw bytes.
- **Their metadata should specify the number of elements to skip on each dimension** (a property called stride). For a contiguous tensor, the stride can be derived from the shape, but as soon as we slice or transpose a tensor, that's no longer true.
- **Copying should be an explicit operation** and any view (e.g. slicing) should return a view of the same storage, just different metadata (shape, stride, and offset). This is because copies are expensive and will kill our hot path.
- **Tensors are aware whether they are contiguous** which means that the strides match what they would be if the tensor was a fresh row-major allocation. This is necessary because optimized SIMD kernels will assume the inner loop has a stride of 1.

To that end, it seems natural to have a `Tensor` wrap a `shared_ptr<vector<byte>>`, and include a bunch of metadata around shape, strides as `vector<size_t>`. That plus data type and byte offset so that kernels know how to read the tensor:
```cpp
class Tensor {
    // ...
    std::shared_ptr<std::vector<uint8_t>> storage_;
    size_t byte_offset_;
    std::vector<size_t> shape_;
    std::vector<size_t> strides_;
    DType dtype_;
    // ...
}
```

We can then extend this tensor to support reshape operations. Assuming a tensor is contiguous, a reshape operation creates a new tensor with the same bytes but a different shape and set of strides. Consider a `Tensor` around a 3x4 matrix, where each cell shows the element's byte offset (the dtype is `int8`, so offsets are in bytes):

$$
\underbrace{
\begin{bmatrix}
0 & 1 & 2 & 3 \\
4 & 5 & 6 & 7 \\
8 & 9 & 10 & 11
\end{bmatrix}
}_{\text{shape } [3,4],\ \text{strides } [4,1]}
$$

A reshape operation can create another `Tensor` around the same data (so no copies) but since the shape and stride metadata are different, it's now a 2x6 matrix over the same 12 bytes:

$$
\underbrace{
\begin{bmatrix}
0 & 1 & 2 & 3 & 4 & 5 \\
6 & 7 & 8 & 9 & 10 & 11
\end{bmatrix}
}_{\text{shape } [2,6],\ \text{strides } [6,1]}
$$

We can do this just by changing metadata:
```cpp
Tensor Tensor::reshape(std::vector<size_t> new_shape) const {
    assert(is_contiguous());

    size_t new_numel = 1;
    for (size_t dim : new_shape) {
        new_numel *= dim;
    }

    assert(new_numel == numel()); // numel() is number of elements
    
    std::vector<size_t> new_strides(new_shape.size(), 1);
    for (int i = static_cast<int>(new_shape.size()) - 2; i >= 0; --i) {
        new_strides[i] = new_strides[i + 1] * new_shape[i + 1];
    }
    return Tensor{storage_, byte_offset_, new_shape, new_strides, dtype_};
}
```

We can also support slice operations: just erase the element in the shape and strides array. The data inside the `shared_ptr` remains unchanged. For example, consider a `Tensor` around a 3x4 matrix (cells show byte offsets):

$$
\underbrace{
\begin{bmatrix}
0 & 1 & 2 & 3 \\
4 & 5 & 6 & 7 \\
8 & 9 & 10 & 11
\end{bmatrix}
}_{\text{shape } [3,4],\ \text{strides } [4,1]}
$$

Slice it to get the first column as a 1D vector of size 3 — the elements are byte offsets 0, 4, and 8 (stride 4, no longer contiguous):

$$
\underbrace{
\begin{bmatrix}
0 & 4 & 8
\end{bmatrix}
}_{\text{shape } [3],\ \text{strides } [4]}
$$

We can do this by deleting the corresponding element in the shape and strides array:

```cpp
Tensor Tensor::slice(size_t dim, size_t index) const {
    std::vector<size_t> new_shape = shape_;
    std::vector<size_t> new_strides = strides_;
    new_shape.erase(new_shape.begin() + static_cast<std::ptrdiff_t>(dim));
    new_strides.erase(new_strides.begin() + static_cast<std::ptrdiff_t>(dim));
    return Tensor{storage_, byte_offset_ + (index * strides_[dim] * dtype_itemsize(dtype_)),
                  new_shape, new_strides, dtype_};
}
```

Similarly, we can support a "make contiguous" operation that **does** a copy: it returns a new owning `Tensor` with data copied into a fresh contiguous layout. We can do this by iterating through every position in our shape/stride vectors to add the data corresponding to an element to the vector of bytes that make up the resulting `Tensor`:

```cpp
Tensor Tensor::contiguous() const {
    std::vector<uint8_t> new_storage_vector(nbytes());
    std::vector<size_t> position(rank(), 0);
    for (size_t i = 0; i < numel(); i++) {
        int pos_index = static_cast<int>(rank()) - 1;
        while (pos_index >= 0 && position[pos_index] == shape_[pos_index]) {
            position[pos_index] = 0;
            pos_index--;
            position[pos_index]++;
        }

        size_t storage_index =
            std::inner_product(position.begin(), position.end(), strides_.begin(), 0UZ);
        storage_index *= dtype_itemsize(dtype_);
        storage_index += byte_offset_;

        for (size_t byte_index = 0; byte_index < dtype_itemsize(dtype_); byte_index++) {
            new_storage_vector[(i * dtype_itemsize(dtype_)) + byte_index] =
                (*storage_)[storage_index + byte_index];
        }

        position[rank() - 1]++;
    }

    std::shared_ptr<std::vector<uint8_t>> new_storage =
        std::make_shared<std::vector<uint8_t>>(new_storage_vector);
    std::vector<size_t> new_shape{shape_};
    std::vector<size_t> new_strides(rank(), 1);

    for (int i = static_cast<int>(shape_.size()) - 2; i >= 0; --i) {
        new_strides[i] = new_strides[i + 1] * shape_[i + 1];
    }

    return Tensor{new_storage, 0, new_shape, new_strides, dtype_};
}
```

These operations are going to come in handy later.

## Part 2: GGUF Loader

[GGUF](https://github.com/ggml-org/ggml/blob/master/docs/gguf.md) is a file format for storing models for inference with GGML. Given that the [model we want to serve](https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF) has all of its quantizations stored in GGUF, we should build a model loader that can open a GGUF model file.

Most of this is going to be pretty straightforward, but there are a couple of considerations:
- **We need to `mmap`** the model rather than reading it into a heap buffer because otherwise the model loader will block until the entire model is in RAM.
- **The GGUF loader must have metadata about the model, as well as each tensor's actual data** as all this data is necessary to serve the model. Each tensor's data is keyed by a string, and the tensor data can be in various data types, so we'll need to make sure we can accommodate all data types. 
- **Returning `Tensor` objects from the model loader should not copy** to save on latency, so instead we're going to have them point to the `mmap`ed region.

We can start by making a `GGUFFile` class (and banning copies and moves):

```cpp
class GGUFFile {
public:
    explicit GGUFFile(const std::string& path);

    ~GGUFFile();
    GGUFFile(const GGUFFile&) = delete;
    GGUFFile& operator=(const GGUFFile&) = delete;
    GGUFFile(GGUFFile&&) = delete;
    GGUFFile& operator=(GGUFFile&&) = delete;
    // ...

private:
    int fd_;
    void* mmap_ptr_;
    size_t file_size_;
    // ...
}
```

We have to be able to return metadata keyed by string. However, this metadata can have scalar (`uint8_t`, `uint16_t`, etc.) and vector (`std::vector<uint8_t>`), and we don't want to have to write out all sorts of metadata access methods:

```cpp
std::unordered_map<std::string, uint8_t> metadata_uint8_t;
std::unordered_map<std::string, std::vector<uint8_t>> metadata_vector_uint8_t;
// etc.
```

Luckily, modern C++ provides a pretty nice way of doing alias declaration for type-safe unions:
```cpp
using GGUFScalar = std::variant<uint8_t, int8_t, uint16_t, int16_t, uint32_t, int32_t, uint64_t, int64_t, float, bool, double, std::string>;
using GGUFArray = std::vector<GGUFScalar>;
using GGUFValue = std::variant<GGUFScalar, GGUFArray>;

class GGUFFile {
    // ...
    std::unordered_map<std::string, GGUFValue> metadata;
}
```

Now it's time for the tensor accessors for the actual data. In the `GGUFFile` class:
```cpp
Tensor tensor(const std::string& name) const {
    const auto& info = tensor_infos_.at(name);
    return Tensor::from_mmap(data_region_ + info.data_offset, info.data_nbytes, info.shape, info.dtype, mmap_handle_);
}
```

and adding the `from_mmap` method into the `Tensor` class:
```cpp
Tensor Tensor::from_mmap(const uint8_t* ptr, size_t nbytes, std::vector<size_t> dims, DType dtype, std::shared_ptr<void> mmap_handle) {
    std::vector<size_t> strides(dims.size(), 0);
    Tensor tensor{nullptr, 0, std::move(dims), std::move(strides), dtype};
    tensor.mmap_ptr_ = ptr;
    tensor.mmap_handle_ = std::move(mmap_handle);
    tensor.mmap_nbytes_ = nbytes;
    return tensor;
}

// using an mmap_handle defined in the Tensor class:
std::shared_ptr<void> mmap_handle_;
```

Why is the `mmap_handle_` a `shared_ptr<void>`? Remember that the whole reason we made our `Tensor` class wrap a `shared_ptr` was to make copying explicit and the data's lifetime managed. We can do the same thing here, and because `mmap_handle_` is a lifetime token, we can have it as a `shared_ptr<void>` (`void` because we can use it with whatever datatype we want as we never dereference it). `shared_ptr` allows us to specify a custom deleter, so we can `munmap` when the refcount hits 0 (so when no one's using the handle):

```cpp
mmap_handle_ = std::shared_ptr<void>(mmap_ptr_, [mapped_size](void* ptr) {
    munmap(ptr, mapped_size);
});
```

Putting it together, we can load a model and access its tensors and metadata.

## Part 3: Tokenizer

We need a tokenizer to convert text into tokens compatible with the LLaMA model we want to serve. To do this, there are some fields in our GGUF file that are particularly relevant:

```cpp
std::cout << "tokenizer.ggml.model             \"" << gguf.get_string("tokenizer.ggml.model") << "\"\n";
std::cout << "tokenizer.ggml.pre               \"" << gguf.get_string("tokenizer.ggml.pre") << "\"\n";
std::cout << "tokenizer.ggml.tokens            " << gguf.get_string_array("tokenizer.ggml.tokens").size() << " entries\n";
std::cout << "tokenizer.ggml.token_type        " << gguf.get_int32_array("tokenizer.ggml.token_type").size() << " entries\n";
std::cout << "tokenizer.ggml.merges            " << gguf.get_string_array("tokenizer.ggml.merges").size() << " entries\n";
std::cout << "tokenizer.ggml.bos_token_id      " << gguf.get_uint32("tokenizer.ggml.bos_token_id") << "\n";
std::cout << "tokenizer.ggml.eos_token_id      " << gguf.get_uint32("tokenizer.ggml.eos_token_id") << "\n";
```
outputs
```cpp
tokenizer.ggml.model             "gpt2"
tokenizer.ggml.pre               "llama-bpe"
tokenizer.ggml.tokens            128256 entries
tokenizer.ggml.token_type        128256 entries
tokenizer.ggml.merges            280147 entries
tokenizer.ggml.bos_token_id      128000
tokenizer.ggml.eos_token_id      128009
```

This tells us some information about how to tokenize text with this specific model. Since `tokenizer.ggml.model` is listed as `gpt2`, we know the tokenizer algorithm is BPE (byte-pair encoding, aka the OpenAI one). BPE does three steps at encode time:
- **Pre-tokenization**, which involves splitting the raw string into chunks using a specific regex.
- **Byte-encoding** each segment by converting each character to its UTF-8 byte sequence and mapping each byte to its corresponding byte token.
- **Applying merges** to segments by scanning them for merges with the highest priority and replacing each pair with the merged token until no more merges apply.

Let's look at pre-tokenization first. Our GGUF file specifies `tokenizer.ggml.pre` as `llama-bpe` which is specified [here](https://github.com/ggml-org/llama.cpp/blob/master/src/llama-vocab.cpp#L284-L290) in llama.cpp's source code:

```cpp
"(?i:'s|'t|'re|'ve|'m|'ll|'d)|[^\\r\\n\\p{L}\\p{N}]?\\p{L}+|\\p{N}{1,3}| ?[^\\s\\p{L}\\p{N}]+[\\r\\n]*|\\s*[\\r\\n]+|\\s+(?!\\S)|\\s+"
```

Some of the pattens in this regex, specifically `\p{L}` and `\p{N}`, are Unicode property shortcuts, which are not available in `std::regex` methods. For that reason, we'll use [PCRE2](https://pcre2project.github.io/pcre2/) for our regex.

We can loop through the string, check for and slice out matches, and drag an offset through the string. Appending them all to a `vector` means we have a list of segments returned from our pre-tokenization:

```cpp
std::vector<std::string> segments;
pcre2_match_data* match_data = pcre2_match_data_create_from_pattern(static_cast<pcre2_code*>(re_), nullptr);
PCRE2_SIZE offset = 0;

while (offset < text.size()) {
    int status = pcre2_match(static_cast<pcre2_code*>(re_), reinterpret_cast<PCRE2_SPTR>(text.data()), text.size(), offset, 0, match_data, nullptr);
    PCRE2_SIZE* ovector = pcre2_get_ovector_pointer(match_data);
    if (status < 0 || ovector[1] == offset) break;
    segments.emplace_back(text.data() + ovector[0], ovector[1] - ovector[0]);
    offset = ovector[1];
}

pcre2_match_data_free(match_data);
return segments;
```