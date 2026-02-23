import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";
import { useDataTablePageStore } from "@/stores/page/demo/dataTablePage.store.ts";
import { useSamplePageStore } from "@/stores/page/demo/sample.store.ts";
import { useUserPageStore } from "@/stores/page/userPage.store.ts";
import useLogout from "@/hooks/useLogout.tsx";
import LanguageToggle from "@/components/common/LanguageToggle.tsx";
import { useResetStore } from "@/hooks/useResetStore";
import ThemeToggle from "@/components/common/ThemeToggle.tsx";
import RuntimeError from "@/components/errors/RuntimeError.tsx";
import AppSidebar from "@/components/sidebar/AppSidebar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar.tsx";

// 공통 레이아웃
const MainLayout = () => {
    const { t } = useTranslation();
    const { logout } = useLogout();
    const location = useLocation();
    const resetDataTablePageStore = useDataTablePageStore(state => state.reset);
    const resetUserPageStore = useUserPageStore(state => state.reset);
    const resetSamplePageStore = useSamplePageStore(state => state.reset);

    // #. 페이지를 벗어나면 스토어 상태를 초기화
    useResetStore("/demo/table", resetDataTablePageStore);
    useResetStore("/demo/api", resetSamplePageStore);
    useResetStore("/user", resetUserPageStore);

    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset className="flex h-svh min-w-0 flex-col overflow-hidden">
                <header className="flex h-12 shrink-0 items-center gap-2 px-4 justify-between">
                    <SidebarTrigger className="-ml-1"/>
                    <div className="flex items-center gap-2">
                        <LanguageToggle/>
                        <ThemeToggle/>
                        <Button size="xs" onClick={logout}>{t("common.logout")}</Button>
                    </div>
                </header>
                <ScrollArea className="flex-1">
                    <main className="min-w-0 px-4 py-2">
                        <ErrorBoundary resetKeys={[location.pathname]} FallbackComponent={RuntimeError}>
                            <Outlet/>
                        </ErrorBoundary>
                    </main>
                </ScrollArea>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default MainLayout;
