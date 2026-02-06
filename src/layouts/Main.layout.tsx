import { Outlet } from "react-router-dom";
import { useDemoDataTableStore } from "@/stores/page/demoDataTable.store.ts";
import useLogout from "@/hooks/useLogout.tsx";
import { useResetStore } from "@/hooks/useResetStore";
import ThemeToggle from "@/components/common/ThemeToggle.tsx";
import AppSidebar from "@/components/sidebar/AppSidebar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.tsx";

// 공통 레이아웃
const MainLayout = () => {
    const { logout } = useLogout();

    // #. 페이지를 벗어나면 스토어 상태를 초기화
    const resetDataTableStore = useDemoDataTableStore((state) => state.resetStore);
    useResetStore("/demo/data_table", resetDataTableStore);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex h-svh flex-col">
                <header className="flex h-12 shrink-0 items-center gap-2 px-4 justify-between">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Button size="xs" onClick={logout}>Logout</Button>
                    </div>
                </header>

                <ScrollArea className="flex-1">
                    <main className="px-4 py-2">
                        <Outlet />
                    </main>
                </ScrollArea>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default MainLayout;
