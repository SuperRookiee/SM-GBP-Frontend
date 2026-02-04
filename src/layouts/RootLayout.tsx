import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/sidebar/AppSidebar.tsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.tsx";
import { useResetStore } from "@/hooks/useResetStore";
import { useGridStore } from "@/stores/gridStore";

// 공통 레이아웃과 헤더를 제공하는 루트 레이아웃 함수
const RootLayout = () => {
    const resetGridStore = useGridStore((state) => state.resetStore);

    // Grid 페이지를 벗어나면 스토어 상태를 초기화합니다.
    useResetStore("/grid", resetGridStore);

    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <SidebarTrigger className="-ml-1" />
                <ScrollArea className="h-full">
                    <main className="min-h-0 flex-1">
                        <Outlet/>
                    </main>
                </ScrollArea>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default RootLayout;