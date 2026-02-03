import { Activity } from "react";
import { Outlet, useNavigation } from "react-router-dom";
import Header from "@/components/common/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useResetStore } from "@/hooks/useResetStore";
import { useGridStore } from "@/stores/gridStore";

// #. 공통 레이아웃과 헤더를 제공하는 루트 레이아웃 함수
const RootLayout = () => {
    const resetGridStore = useGridStore((state) => state.resetStore);
    const navigation = useNavigation();
    const isLoading = navigation.state === "loading";

    // Grid 페이지를 벗어나면 스토어 상태를 초기화합니다.
    useResetStore("/grid", resetGridStore);

    return (
        <div
            className="flex h-screen flex-col overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
            <ScrollArea className="h-full">
                <Header/>
                <main className="min-h-0 flex-1">
                    {isLoading ? (
                        <div className="flex min-h-[200px] items-center justify-center">
                            <Activity/>
                        </div>
                    ) : (
                        <Outlet/>
                    )}
                </main>
            </ScrollArea>
        </div>
    );
};

export default RootLayout;
