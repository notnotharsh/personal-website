"use client";

import { Github, ExternalLink } from "lucide-react";

const projects = [
  {
    title: "EasyIEX",
    description:
      "A C++ tool for processing market data from PCAP files from the IEX exchange. Built for aspiring quantitative developers and researchers, it handles millions of trades per day with a focus on low-latency processing of TOPS and DEEP files.",
    tech: ["C++", "Apache Arrow"],
    github: "https://github.com/notnotharsh/easyiex",
  },
  {
    title: "Spectral Element Methods",
    description:
      "Implementations of spectral element methods for solving Poisson and Laplace PDEs on regular and deformed domains. Features mesh deformation via Laplace equation solutions and modified differentiation matrices for deformed geometries.",
    tech: ["MATLAB", "Python", "NumPy", "SciPy"],
    github: "https://github.com/notnotharsh/sem",
  },
  {
    title: "Adjacent Music",
    description:
      "A web app that analyzes your Spotify listening habits and recommends tracks from adjacent genres. It identifies your primary genres, finds related ones, and suggests songs with matching audio features like danceability and valence.",
    tech: ["JavaScript", "Node.js", "Spotify API"],
    github: "https://github.com/notnotharsh/adjacent-music",
    live: "https://adjacent-music.onrender.com",
  },
];

export default function Projects() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12 uppercase opacity-0 animate-fade-in">
        Projects
      </h1>

      <div className="grid grid-cols-1 gap-4">
        {projects.map((project, i) => (
          <div
            key={project.title}
            className={`card p-5 flex flex-col opacity-0 animate-fade-in stagger-${i + 1}`}
          >
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-sm font-bold">
                {project.title}
              </h2>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-40 hover:opacity-100 transition-opacity"
                  aria-label={`${project.title} on GitHub`}
                >
                  <Github size={14} />
                </a>
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-40 hover:opacity-100 transition-opacity"
                    aria-label={`${project.title} live demo`}
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>

            <p className="text-xs opacity-60 leading-relaxed mb-4 flex-1">
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
