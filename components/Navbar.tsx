import Link from "next/link";
import { AuthNav } from "./AuthNav";
import { ThemeToggle } from "./ThemeToggle";
import { ReactNode } from "react";

interface NavbarProps {
  children?: ReactNode;
  showExplore?: boolean;
  showGenerate?: boolean;
}

export function Navbar({ children, showExplore = true, showGenerate = false }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-sm font-bold tracking-[0.2em] uppercase text-white hover:text-cyan-400 transition-colors">
            VS Engine
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {showExplore && (
              <Link
                href="/explore"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
              >
                Explore
              </Link>
            )}
            {showGenerate && (
              <Link
                href="/"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
              >
                Generate
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {children}
          <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block" />
          <ThemeToggle />
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
