"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "about" },
  { href: "/projects", label: "projects" },
  { href: "/blog", label: "blog" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b-[1.5px] border-black dark:border-white">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-bold text-sm uppercase tracking-widest hover:opacity-60 transition-opacity"
        >
          Harsh Tiwary
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs uppercase tracking-wider transition-opacity ${
                pathname === link.href
                  ? "opacity-100"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1 opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1 opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1 opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-6 pb-4 space-y-2 border-t border-black/10 dark:border-white/10 pt-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block text-xs uppercase tracking-wider py-1 transition-opacity ${
                pathname === link.href
                  ? "opacity-100"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
