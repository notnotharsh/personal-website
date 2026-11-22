"use client";

import { Github, ExternalLink } from "lucide-react";

const projects = [
  {
    title: "EasyIEX",
    description:
      "A C++ tool for processing market data from PCAP files from the IEX exchange. Built for aspiring quantitative developers and researchers, it handles millions of trades per day with a focus on low-latency processing of TOPS and DEEP files.",
    tech: ["C++", "Apache Arrow"],
    period: "Jan 2026 – Present",
    github: "https://github.com/notnotharsh/easyiex",
  },
  {
    title: "Spectral Element Methods",
    description:
      "Implementations of spectral element methods for solving Poisson and Laplace PDEs on regular and deformed domains. Features mesh deformation via Laplace equation solutions and modified differentiation matrices for deformed geometries.",
    tech: ["MATLAB", "Python", "NumPy", "SciPy"],
    period: "May 2023 – Jul 2023",
    github: "https://github.com/notnotharsh/sem",
  },
  {
    title: "Adjacent Music",
    description:
      "A web app that analyzes your Spotify listening habits and recommends tracks from adjacent genres. It identifies your primary genres, finds related ones, and suggests songs with matching audio features like danceability and valence.",
    tech: ["JavaScript", "Node.js", "Spotify API"],
    period: "Dec 2022 – Jan 2023",
    github: "https://github.com/notnotharsh/adjacent-music",
    live: "https://adjacent-music.onrender.com",
  },
];

export default function Projects() {
  return (
    <div className="pb-8">
      <h1
        className="font-heading text-2xl md:text-3xl font-bold tracking-tight mb-6 animate-fade-up"
        style={{ opacity: 0, animationFillMode: "forwards" }}
      >
        Projects
      </h1>

      <div className="grid grid-cols-1 gap-4">
        {projects.map((project, i) => (
          <div
            key={project.title}
            className="glass-card glass-hover p-5 flex flex-col animate-fade-up"
            style={{
              opacity: 0,
              animationDelay: `${0.08 + i * 0.08}s`,
              animationFillMode: "forwards",
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-sm font-semibold">{project.title}</h2>
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {project.period}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.title} on GitHub`}
                  style={{ color: "var(--muted)" }}
                  className="transition-colors duration-200 hover:text-[var(--accent)]"
                >
                  <Github size={16} />
                </a>
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.title} live demo`}
                    style={{ color: "var(--muted)" }}
                    className="transition-colors duration-200 hover:text-[var(--accent)]"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>

            <p
              className="text-xs leading-relaxed mb-4 flex-1"
              style={{ color: "var(--muted)" }}
            >
              {project.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
