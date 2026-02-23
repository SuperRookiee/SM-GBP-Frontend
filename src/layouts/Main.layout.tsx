import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useDataTablePageStore } from "@/stores/page/demo/dataTablePage.store.ts";
import { useSamplePageStore } from "@/stores/page/demo/sample.store.ts";
import { useUserPageStore } from "@/stores/page/userPage.store.ts";
import { useResetStore } from "@/hooks/useResetStore";
import Header from "@/components/common/Header.tsx";
import RuntimeError from "@/components/errors/RuntimeError.tsx";
import AppGnb from "@/components/sidebar/AppGnb.tsx";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";

const MainLayout = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const resetDataTablePageStore = useDataTablePageStore(state => state.reset);
    const resetUserPageStore = useUserPageStore(state => state.reset);
    const resetSamplePageStore = useSamplePageStore(state => state.reset);
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const segmentTitleMap: Record<string, string> = {
        demo: "menu.demo",
        data_table: "menu.dataTable",
        grid_table: "menu.gridTable",
        chart: "menu.chart",
        form: "menu.form",
        dialog: "menu.dialog",
        api: "menu.api",
        typography: "menu.typography",
        editor: "menu.editor",
        not_found: "menu.notFound",
        user: "menu.user",
        new: "sampleDetail.create",
    };

    // #. Breadcrumb 생성
    const breadcrumbs = pathSegments.map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
        const isIdUnderApi = pathSegments[index - 1] === "api" && segment !== "new";
        const isIdUnderUser = pathSegments[index - 1] === "user";
        const title = segmentTitleMap[segment]
            ? t(segmentTitleMap[segment])
            : (isIdUnderApi || isIdUnderUser)
                ? segment
                : segment.replaceAll("_", " ");

        return { href, title };
    });

    useResetStore("/demo/table", resetDataTablePageStore);
    useResetStore("/demo/api", resetSamplePageStore);
    useResetStore("/user", resetUserPageStore);

    return (
        <div className="flex h-svh min-w-0 flex-col overflow-hidden">
            <Header/>
            <AppGnb/>
            <ScrollArea className="flex-1">
                <main className="min-w-0 px-4 py-2">
                    <Breadcrumb className="mb-2">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                {breadcrumbs.length === 0 ? (
                                    <BreadcrumbPage>{t("common.home")}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to="/">{t("common.home")}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {breadcrumbs.map((item, index) => {
                                const isLast = index === breadcrumbs.length - 1;

                                return (
                                    <BreadcrumbItem key={item.href}>
                                        <BreadcrumbSeparator />
                                        {isLast ? (
                                            <BreadcrumbPage>{item.title}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link to={item.href}>{item.title}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                );
                            })}
                        </BreadcrumbList>
                    </Breadcrumb>
                    <ErrorBoundary resetKeys={[location.pathname]} FallbackComponent={RuntimeError}>
                        <Outlet/>
                    </ErrorBoundary>
                </main>
            </ScrollArea>
        </div>
    );
};

export default MainLayout;
