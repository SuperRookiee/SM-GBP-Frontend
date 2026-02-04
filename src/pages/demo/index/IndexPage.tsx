const IndexPage = () => {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div className="space-y-2">
        {/* 홈 화면 안내 문구 */}
        <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          GBP Frontend
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          GBP
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Demo Index Page
        </p>
      </div>
    </div>
  );
};

export default IndexPage;
