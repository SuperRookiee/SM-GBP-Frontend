import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDemoDataTableSampleDataApi } from "@/apis/demoDataTable.api";
import { GRID_CONSTANTS } from "@/constants/grid.constants.ts";
import { DEMO_DATA_TABLE_COLUMNS, DEMO_DATA_TABLE_FILTER_OPTIONS } from "@/constants/table.constants.tsx";
import { useDemoDataTableStore } from "@/stores/page/dataTable.store.ts";
import type { DemoDataTableResponse } from "@/types/demoDataTable.types";
import DataTable from "@/components/table/DataTable";

const DemoDataTablePage = () => {
    const query = useDemoDataTableStore((s) => s.query);
    const filterKey = useDemoDataTableStore((s) => s.filterKey);
    const sortKey = useDemoDataTableStore((s) => s.sortKey);
    const sortDirection = useDemoDataTableStore((s) => s.sortDirection);
    const page = useDemoDataTableStore((s) => s.page);
    const setPage = useDemoDataTableStore((s) => s.setPage);
    const setQuery = useDemoDataTableStore((s) => s.setQuery);
    const setFilterKey = useDemoDataTableStore((s) => s.setFilterKey);
    const setSort = useDemoDataTableStore((s) => s.setSort);
    const pageSize = GRID_CONSTANTS.pageSize;

    // #. page가 0 이하로 가는 방지
    useEffect(() => {
        if (page < 1) setPage(1);
    }, [page, setPage]);

    const { data, isLoading, isFetching, isError } = useQuery<DemoDataTableResponse>({
        queryKey: ["demoDataTable", "rows", { page, pageSize, query, filterKey, sortKey, sortDirection}],
        queryFn: async () =>  await getDemoDataTableSampleDataApi({ page, pageSize, query, filterKey, sortKey, sortDirection}), // 서버에서 rows는 pageSize만큼, total은 전체 count(*) 내려줘야 함
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        placeholderData: prev => prev, // 이전 페이지 데이터를 잠깐 유지해서 깜빡임 줄이기
    });

    const rows = data?.rows ?? [];
    const total = data?.total ?? 0;

    if (isError) {
        return (
            <div className="p-6">
                <p className="text-sm text-destructive">데이터를 불러오지 못했습니다.</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-full items-center justify-center">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                <header className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Demo DataTable</p>
                    <h1 className="text-3xl font-semibold tracking-tight">Demo DataTable</h1>
                    <p className="text-sm text-muted-foreground">
                        서버에서 페이지 단위로 rows를 받고, total은 전체 건수를 받는 예시입니다.
                    </p>
                </header>
                <DataTable
                    title="거래 내역 목록"
                    description="검색 조건은 저장되어 새로고침 후에도 유지됩니다."
                    rows={rows}
                    total={total}
                    pageSize={pageSize}
                    isLoading={isLoading || isFetching}
                    filterOptions={DEMO_DATA_TABLE_FILTER_OPTIONS}
                    columns={DEMO_DATA_TABLE_COLUMNS}
                    query={query}
                    filterKey={filterKey}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    page={page}
                    onQueryChange={setQuery}
                    onFilterChange={setFilterKey}
                    onSortChange={setSort}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
};

export default DemoDataTablePage;
