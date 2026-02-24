import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserSampleDataApi } from "@/apis/user.api";
import { GC_TIME, STALE_TIME } from "@/constants/query.constants.ts";
import { getUserTableColumns, getUserTableFilter } from "@/constants/table.constants.tsx";
import { useUserPageStore } from "@/stores/page/userPage.store.ts";
import DataTable from "@/components/table/DataTable";

// #. 사용자 목록 페이지 컴포넌트다.
const UserPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        search,
        filterKey,
        sortKey,
        sortDirection,
        page,
        size,
        setSearch,
        setFilterKey,
        setSort,
        setPage,
        setSize
    } = useUserPageStore();

    const { data, isLoading, isFetching, isError } = useQuery({
        queryKey: ["users", { page, size, search, filterKey, sortKey, sortDirection }],
        queryFn: async () => getUserSampleDataApi({ page, pageSize: size, query: search, filterKey, sortKey, sortDirection }),
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        placeholderData: (prev) => prev,
    });

    const rows = data?.rows ?? [];
    const total = data?.total ?? 0;

    if (isError) {
        return (
            <div className="p-6">
                <p className="text-sm text-destructive">{t("user.loadError")}</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-full items-center justify-center">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                <header className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">{t("user.management")}</p>
                    <h1 className="text-3xl font-semibold tracking-tight">{t("user.title")}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t("user.description")}
                    </p>
                </header>
                <DataTable
                    title={t("user.tableTitle")}
                    description={t("user.tableDescription")}
                    rows={rows}
                    total={total}
                    pageSize={size}
                    isLoading={isLoading || isFetching}
                    filterOptions={getUserTableFilter(t)}
                    columns={getUserTableColumns(t)}
                    query={search}
                    filterKey={filterKey}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    page={page}
                    onQueryChange={setSearch}
                    onFilterChange={setFilterKey}
                    onSortChange={setSort}
                    onPageChange={setPage}
                    onPageSizeChange={setSize}
                    enableSelect
                    searchPlaceholder={t("user.searchPlaceholder")}
                    onRowClick={(row) => navigate(`/user/${row.id}`)}
                />
            </div>
        </div>
    );
};

export default UserPage;

