import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeMatvis from "rehype-matvis";
import rehypeShiki from "@shikijs/rehype";
import rehypeStringify from "rehype-stringify";

const postsDir = path.join(process.cwd(), "posts");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  description?: string;
  readingTime: number;
  draft?: boolean;
};

function formatDate(data: { date?: string }): string {
  if (!data.date) return "";
  const d = new Date(data.date);
  return `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}/${d.getUTCFullYear()}`;
}

export type Post = PostMeta & {
  contentHtml: string;
};

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDir)) return [];
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(postsDir, f), "utf8");
      const { data, content } = matter(raw);
      if (data.draft) return null;
      return {
        slug,
        title: data.title ?? slug,
        date: formatDate(data),
        description: data.description,
        readingTime: Math.max(1, Math.round(content.trim().split(/\s+/).filter(Boolean).length / 200)),
      };
    })
    .filter((p) => p !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPost(slug: string): Promise<Post | null> {
  const filePath = path.join(postsDir, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  if (data.draft) return null;
  const processed = await remark()
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeMatvis)
    .use(rehypeShiki, {
      themes: { light: "github-light", dark: "github-dark" },
    })
    .use(rehypeStringify)
    .process(content);
  return {
    slug,
    title: data.title ?? slug,
    date: formatDate(data),
    description: data.description,
    readingTime: Math.max(1, Math.round(content.trim().split(/\s+/).filter(Boolean).length / 200)),
    contentHtml: processed.toString(),
  };
}
