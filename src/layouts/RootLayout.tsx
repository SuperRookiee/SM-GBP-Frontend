import { Outlet } from "react-router-dom";
import ThemeToggle from "@/components/common/ThemeToggle.tsx";
import AppSidebar from "@/components/sidebar/AppSidebar.tsx";
import { Button } from "@/components/ui/button.tsx";
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
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <header className="flex h-12 shrink-0 items-center gap-2 px-4 justify-between">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex items-center gap-2">
                        <ThemeToggle/>
                        <Button size='xs'>Logout</Button>
                    </div>
                </header>
                <ScrollArea className="h-full min-w-xl">
                    <Outlet/>
                </ScrollArea>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default RootLayout;
