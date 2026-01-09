import { Outlet } from "react-router-dom";

import Header from "@/components/common/Header";
import { ScrollArea } from "@/components/ui/scroll-area";

// #. 공통 레이아웃과 헤더를 제공하는 루트 레이아웃 함수
const RootLayout = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <Header />
      <main className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <Outlet />
        </ScrollArea>
      </main>
    </div>
  );
};

export default RootLayout;
