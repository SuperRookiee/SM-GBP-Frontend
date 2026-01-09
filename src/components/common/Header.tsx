import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

// #. 전역 헤더 컴포넌트 함수
const Header = () => {
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
        </nav>
      </div>
    </header>
  );
};

export default Header;
