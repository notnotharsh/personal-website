"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      aria-label={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed top-5 md:top-8 right-5 md:right-8 z-20 w-12 h-12 rounded-full glass-card flex items-center justify-center transition-colors duration-200 hover:border-[var(--accent)]"
      style={{ color: "var(--accent)" }}
    >
      {mounted ? (
        theme === "dark" ? <Moon size={20} /> : <Sun size={20} />
      ) : (
        <Sun size={20} />
      )}
    </button>
  );
}
