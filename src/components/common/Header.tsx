import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// 전역 헤더 컴포넌트 함수
const Header = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme) {
      return storedTheme === "dark";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle("dark", isDark);
    window.localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <header className="border-b border-zinc-200/70 bg-white/70 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link className="text-sm font-semibold tracking-tight" to="/">
          GBP Demo
        </Link>
        {/* 전역 네비게이션 */}
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">홈</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/grid">Grid</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            onClick={() => setIsDark((prev) => !prev)}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
