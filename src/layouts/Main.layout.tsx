import {ErrorBoundary} from "react-error-boundary";
import {Outlet, useLocation} from "react-router-dom";
import {useDataTablePageStore} from "@/stores/page/demo/dataTablePage.store.ts";
import {useSamplePageStore} from "@/stores/page/demo/sample.store.ts";
import {useUserPageStore} from "@/stores/page/userPage.store.ts";
import {useResetStore} from "@/hooks/useResetStore";
import AppBreadcrumb from "@/components/common/AppBreadcrumb.tsx";
import Header from "@/components/common/Header.tsx";
import RuntimeError from "@/components/errors/RuntimeError.tsx";
import GNB from "@/components/sidebar/GNB.tsx";
import {ScrollArea} from "@/components/ui/scroll-area";

const MainLayout = () => {
    const location = useLocation();
    const resetDataTablePageStore = useDataTablePageStore((state) => state.reset);
    const resetUserPageStore = useUserPageStore((state) => state.reset);
    const resetSamplePageStore = useSamplePageStore((state) => state.reset);

    useResetStore("/demo/table", resetDataTablePageStore);
    useResetStore("/demo/api", resetSamplePageStore);
    useResetStore("/user", resetUserPageStore);

    return (
        <div className="flex h-svh min-w-0 flex-col overflow-hidden">
            {/* 헤더 */}
            <Header/>
            {/* GNB */}
            <GNB/>
            <ScrollArea className="flex-1">
                <main className="min-w-0 px-4 py-2">
                    {/* Breadcrumb */}
                    <AppBreadcrumb className="mb-2"/>
                    <ErrorBoundary resetKeys={[location.pathname]} FallbackComponent={RuntimeError}>
                        <Outlet/>
                    </ErrorBoundary>
                </main>
            </ScrollArea>
        </div>
    );
};

export default MainLayout;
