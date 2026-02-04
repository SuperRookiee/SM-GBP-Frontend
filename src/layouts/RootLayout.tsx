import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/sidebar/AppSidebar.tsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.tsx";
import { useResetStore } from "@/hooks/useResetStore";
import { useDemoGridStore } from "@/stores/demoGridStore";

// 공통 레이아웃
const RootLayout = () => {
    // #. 페이지를 벗어나면 스토어 상태를 초기화
    const resetGridStore = useDemoGridStore((state) => state.resetStore);
    useResetStore("/grid", resetGridStore);

    return (
        <SidebarProvider className="bg-background">
            <AppSidebar/>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                </header>
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
