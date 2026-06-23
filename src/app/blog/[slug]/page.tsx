import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPost } from "@/lib/posts";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) return {};
  return { title: `${post.title} — Harsh Tiwary` };
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10 opacity-0 animate-fade-in">
        <Link
          href="/blog"
          className="text-xs opacity-40 hover:opacity-70 transition-opacity"
        >
          ← blog
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-4 mb-1">
          {post.title}
        </h1>
        {post.date && (
          <p className="text-xs opacity-40">{post.date}</p>
        )}
      </div>

      <div
        className="prose opacity-0 animate-fade-in stagger-1"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </div>
  );
}
