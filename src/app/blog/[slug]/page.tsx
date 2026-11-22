import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LayoutList } from "lucide-react";
import { getAllPosts, getPost } from "@/lib/posts";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return { title: `${post.title} — Harsh Tiwary` };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const posts = getAllPosts();
  const index = posts.findIndex((p) => p.slug === post.slug);
  const prevPost = index >= 0 && index < posts.length - 1 ? posts[index + 1] : null;
  const nextPost = index > 0 ? posts[index - 1] : null;

  const navCardBase =
    "glass-card p-4 flex-1 flex flex-col transition-colors duration-200 hover:border-[var(--hover-border)]";

  const PostNavCard = ({
    post: p,
    direction,
  }: {
    post: (typeof posts)[number] | null;
    direction: "prev" | "next";
  }) => {
    const isPrev = direction === "prev";
    if (!p) {
      return (
        <div
          className={navCardBase}
          style={{ opacity: 0.4 }}
        >
          <div
            className="flex items-center gap-1.5 mb-1 text-xs font-medium"
            style={{ color: "var(--muted)" }}
          >
            {isPrev && <ArrowLeft size={14} />}
            {isPrev ? "Previous" : "Next"}
            {!isPrev && <ArrowRight size={14} />}
          </div>
          <span className="text-sm" style={{ color: "var(--muted)" }}>
            —
          </span>
        </div>
      );
    }

    return (
      <Link href={`/blog/${p.slug}`} className={`${navCardBase} items-start`}>
        <div
          className="flex items-center gap-1.5 mb-1 text-xs font-medium"
          style={{ color: "var(--accent)" }}
        >
          {isPrev && <ArrowLeft size={14} />}
          {isPrev ? "Previous" : "Next"}
          {!isPrev && <ArrowRight size={14} />}
        </div>
        <span className="text-sm font-medium line-clamp-2">{p.title}</span>
      </Link>
    );
  };

  return (
    <div className="pb-8">
      {/* Post card */}
      <article
        className="glass-card overflow-hidden mb-4 animate-fade-up"
        style={{ opacity: 0, animationFillMode: "forwards" }}
      >
        {/* Header */}
        <header
          className="px-6 md:px-10 pt-8 pb-6 text-center"
          style={{ borderBottom: "1px solid var(--divider)" }}
        >
          <h1 className="font-heading text-3xl font-bold tracking-tight mb-3">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm" style={{ color: "var(--muted)" }}>
              {post.date}
            </span>
            <span
              className="w-[3px] h-[3px] rounded-full shrink-0"
              style={{ background: "var(--accent)" }}
            />
            <span className="text-sm" style={{ color: "var(--muted)" }}>
              {post.readingTime} min read
            </span>
          </div>
        </header>

        {/* Content */}
        <div className="px-6 md:px-10 py-8">
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </div>
      </article>

      {/* Navigation */}
      <div className="flex gap-3 items-stretch animate-fade-up stagger-1">
        <PostNavCard post={prevPost} direction="prev" />

        <Link
          href="/"
          className="glass-card px-4 py-3 flex flex-col items-center justify-center gap-1 hover:border-[var(--hover-border)] transition-colors duration-200"
          style={{ color: "var(--muted)" }}
        >
          <LayoutList size={16} />
          <span className="text-xs font-medium whitespace-nowrap">
            All Posts
          </span>
        </Link>

        <PostNavCard post={nextPost} direction="next" />
      </div>
    </div>
  );
}
