import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getDemoDataTableSampleDataApi } from "@/apis/demo/demoDataTable.api.ts";
import { GC_TIME, STALE_TIME } from "@/constants/query.constants.ts";
import { getDemoDataTableColumns, getDemoDataTableFilter } from "@/constants/table.constants.tsx";
import { useDataTablePageStore } from "@/stores/page/demo/dataTablePage.store.ts";
import type { DemoDataTableResponse } from "@/types/demo/demoDataTable.types.ts";
import DataTable from "@/components/table/DataTable";

const DemoDataTablePage = () => {
    const { t } = useTranslation();
    const search = useDataTablePageStore((s) => s.search);
    const filterKey = useDataTablePageStore((s) => s.filterKey);
    const sortKey = useDataTablePageStore((s) => s.sortKey);
    const sortDirection = useDataTablePageStore((s) => s.sortDirection);
    const page = useDataTablePageStore((s) => s.page);
    const setPage = useDataTablePageStore((s) => s.setPage);
    const setSearch = useDataTablePageStore((s) => s.setSearch);
    const setFilterKey = useDataTablePageStore((s) => s.setFilterKey);
    const setSort = useDataTablePageStore((s) => s.setSort);
    const size = useDataTablePageStore((s) => s.size);
    const setSize = useDataTablePageStore((s) => s.setSize);

    // #. page가 0 이하로 가는 방지
    useEffect(() => {
        if (page < 1) setPage(1);
    }, [page, setPage]);

    const { data, isLoading, isFetching, isError } = useQuery<DemoDataTableResponse>({
        queryKey: ["demoGridTable", "rows", { page, size, search, filterKey, sortKey, sortDirection}],
        queryFn: async () =>  await getDemoDataTableSampleDataApi({ page, pageSize: size, query: search, filterKey, sortKey, sortDirection}), // 서버에서 rows는 pageSize만큼, total은 전체 count(*) 내려줘야 함
        placeholderData: keepPreviousData,
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const rows = data?.rows ?? [];
    const total = data?.total ?? 0;

    if (isError) {
        return (
            <div className="p-6">
                <p className="text-sm text-destructive">{t("demo.loadError")}</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-full min-w-0 items-center justify-center">
            <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6">
                <header className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">{t("demo.sectionTable")}</p>
                    <h1 className="text-3xl font-semibold tracking-tight">{t("demo.dataTableTitle")}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t("demo.dataTableDescription")}
                    </p>
                </header>
                <DataTable
                    title={t("demo.dataTableTitle")}
                    description={t("demo.dataTableDesc")}
                    rows={rows}
                    total={total}
                    pageSize={size}
                    isLoading={isLoading || isFetching}
                    filterOptions={getDemoDataTableFilter(t)}
                    columns={getDemoDataTableColumns(t)}
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
                />
            </div>
        </div>
    );
};

export default DemoDataTablePage;
