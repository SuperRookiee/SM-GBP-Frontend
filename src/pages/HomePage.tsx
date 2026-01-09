import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

const HomePage = () => {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          App Router Demo
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          GBP 프론트엔드 라우팅 홈
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          중첩 라우팅 예시를 위해 Grid 페이지로 이동할 수 있습니다.
        </p>
      </div>
      <Button asChild>
        <Link to="/grid">Grid 페이지로 이동</Link>
      </Button>
    </div>
  );
};

export default HomePage;
