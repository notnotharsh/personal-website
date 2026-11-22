import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin } from "lucide-react";
import { getAllPosts } from "@/lib/posts";

const experiences = [
  {
    company: "Annapurna Labs",
    role: "Software Development Engineer",
    period: "Mar 2026 – Present",
  },
  {
    company: "Amazon Web Services",
    role: "Software Development Engineer",
    period: "Mar 2025 – Mar 2026",
  },
  {
    company: "Qualcomm",
    role: "Software Engineer Intern",
    period: "May – Aug 2024",
  },
  {
    company: "Synchrony",
    role: "Data Science Intern",
    period: "Jan 2022 – May 2023",
  },
  {
    company: "University of Illinois Urbana-Champaign",
    role: "Undergraduate Research Assistant",
    period: "Feb 2023 – Apr 2024",
  },
];

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="pb-8">
      {/* Hero */}
      <section
        className="glass-card p-6 md:p-7 animate-fade-up"
        style={{ opacity: 0, animationFillMode: "forwards" }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-7 text-center sm:text-left">
          <div
            className="rounded-full overflow-hidden shrink-0 w-[104px] h-[104px] md:w-[124px] md:h-[124px]"
            style={{
              border: "3px solid var(--photo-ring)",
              boxShadow: "var(--photo-shadow)",
            }}
          >
            <Image
              src="/harsh_pfp.jpg"
              alt="Harsh Tiwary"
              width={124}
              height={124}
              className="object-cover w-full h-full"
              priority
            />
          </div>

          <div className="flex-1">
            <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight mb-1">
              Harsh Tiwary
            </h1>
            <p className="font-medium">
              Software Development Engineer at Annapurna Labs
            </p>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Seattle, WA
            </p>

            <div className="flex gap-3 flex-wrap justify-center sm:justify-start mt-4">
              <a
                href="https://github.com/notnotharsh"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                title="GitHub"
                className="social-btn"
              >
                <Github size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/harsh-tiwary/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="social-btn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        <p className="text-sm leading-relaxed mt-5">
          Hi! I&apos;m Harsh, an engineer at Annapurna Labs in Seattle, working
          on ML infrastructure and cluster observability for AWS Neuron.
          I&apos;m interested in high-performance computing and ML systems.
          Previously, I worked on applied AI at AWS, interned at Qualcomm and
          Synchrony, and did research on numerical methods and fluid dynamics at
          UIUC. I enjoy tackling problems that sit at the intersection of
          software infrastructure and applied science.
        </p>

        <div
          className="mt-6 pt-5"
          style={{ borderTop: "1px solid var(--divider)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: "var(--muted)" }}
          >
            Experience
          </p>

          {experiences.map(({ company, role, period }) => (
            <div
              key={`${company}-${period}`}
              className="flex items-baseline justify-between gap-4 py-1.5"
            >
              <p className="text-sm font-semibold">
                {company}
                <span style={{ color: "var(--muted)" }} className="font-normal">
                  {"  ·  "}
                  {role}
                </span>
              </p>
              <p
                className="text-xs font-medium whitespace-nowrap"
                style={{ color: "var(--muted)" }}
              >
                {period}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Posts */}
      <section id="posts" className="pt-6">
        <div
          className="flex items-center justify-between mb-5 animate-fade-up"
          style={{ opacity: 0, animationDelay: "0.18s", animationFillMode: "forwards" }}
        >
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            Posts
          </h2>
        </div>

        {posts.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="text-sm" style={{ color: "var(--muted)" }}>
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
                animationDelay: `${0.24 + i * 0.06}s`,
                animationFillMode: "forwards",
              }}
            >
              {/* Date rail */}
              <div
                className="hidden md:block w-[86px] shrink-0 pt-[14px] text-right"
              >
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
                  <h3
                    className="text-sm font-semibold mb-1.5 tracking-tight group-hover:underline"
                  >
                    {post.title}
                  </h3>

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
      </section>
    </div>
  );
}
