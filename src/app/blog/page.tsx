import Link from "next/link";
import { PenLine } from "lucide-react";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "Blog — Harsh Tiwary",
};

export default function Blog() {
  const posts = getAllPosts();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight uppercase text-center mb-12 opacity-0 animate-fade-in">
        Blog
      </h1>

      {posts.length === 0 ? (
        <div className="p-16 text-center opacity-0 animate-fade-in stagger-1">
          <PenLine size={40} className="mx-auto mb-4 text-amber-500/50" />
          <p className="text-stone-500 dark:text-stone-400 text-lg">
            Posts coming soon.
          </p>
          <p className="text-stone-400 dark:text-stone-500 text-sm mt-2">
            Stay tuned.
          </p>
        </div>
      ) : (
        <div className="space-y-4 opacity-0 animate-fade-in stagger-1">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
              <div className="card p-5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <h2 className="text-sm font-bold">{post.title}</h2>
                  <span className="text-xs opacity-40 whitespace-nowrap">
                    {post.date}
                  </span>
                </div>
                {post.description && (
                  <p className="text-xs opacity-60 leading-relaxed mt-1">
                    {post.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
