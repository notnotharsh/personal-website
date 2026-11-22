import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "Blog — Harsh Tiwary",
};

export default function Blog() {
  const posts = getAllPosts();

  return (
    <div className="pb-8">
      <h1
        className="font-heading text-2xl md:text-3xl font-bold tracking-tight mb-6 animate-fade-up"
        style={{ opacity: 0, animationFillMode: "forwards" }}
      >
        Posts
      </h1>

      {posts.length === 0 ? (
        <div className="glass-card p-10 text-center animate-fade-up stagger-1">
          <p style={{ color: "var(--muted)" }} className="text-sm">
            No posts yet.
          </p>
        </div>
      ) : (
        posts.map((post, i) => (
          <div
            key={post.slug}
            className="flex items-stretch gap-3 md:gap-4 animate-fade-up"
            style={{
              opacity: 0,
              animationDelay: `${0.08 + i * 0.06}s`,
              animationFillMode: "forwards",
            }}
          >
            {/* Date rail */}
            <div className="hidden md:block w-[86px] shrink-0 pt-[14px] text-right">
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--muted)" }}
              >
                {post.date}
              </span>
            </div>

            {/* Timeline dot + connecting line */}
            <div className="flex flex-col items-center w-[9px] shrink-0">
              <div
                className="w-[9px] h-[9px] rounded-full mt-[18px] shrink-0"
                style={{ background: "var(--accent)" }}
              />
              {i < posts.length - 1 && (
                <div
                  className="w-[1.5px] flex-1 min-h-[12px] mt-[5px] rounded-full"
                  style={{ background: "var(--timeline)" }}
                />
              )}
            </div>

            {/* Post card */}
            <Link href={`/blog/${post.slug}`} className="flex-1 pb-4 group">
              <div className="glass-card glass-hover p-5 h-full">
                <h2 className="text-sm font-semibold mb-1.5 tracking-tight group-hover:underline">
                  {post.title}
                </h2>

                <p
                  className="text-xs font-medium mb-2.5"
                  style={{ color: "var(--muted)" }}
                >
                  <span className="md:hidden">{post.date} · </span>
                  {post.readingTime && `${post.readingTime} min read`}
                </p>

                {post.description && (
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--muted)" }}
                  >
                    {post.description}
                  </p>
                )}
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
}
