"use client";

import { PenLine } from "lucide-react";

export default function Blog() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-center mb-12 text-stone-900 dark:text-stone-100 opacity-0 animate-fade-in-up">
        Blog
      </h1>

      <div className="glass-card p-16 text-center opacity-0 animate-fade-in-up stagger-1">
        <PenLine
          size={40}
          className="mx-auto mb-4 text-amber-500/50"
        />
        <p className="text-stone-500 dark:text-stone-400 text-lg">
          Posts coming soon.
        </p>
        <p className="text-stone-400 dark:text-stone-500 text-sm mt-2">
          Stay tuned.
        </p>
      </div>
    </div>
  );
}
