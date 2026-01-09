import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

const HomePage = () => {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          GBP Frontend
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          샘플 라우팅 홈
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Grid 예시 페이지로 이동할 수 있습니다.
        </p>
      </div>
      <Button asChild>
        <Link to="/grid">Grid 페이지로 이동</Link>
      </Button>
    </div>
  );
};

export default HomePage;
