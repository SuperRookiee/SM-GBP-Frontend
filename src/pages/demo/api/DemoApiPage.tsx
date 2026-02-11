import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetSampleListApi } from "@/apis/demo/sample.api.ts";
import { SAMPLE_TABLE_COLUMNS, SAMPLE_TABLE_FILTER } from "@/constants/table.constants.tsx";
import { useSamplePageStore } from "@/stores/page/demo/sample.store.ts";
import DataTable from "@/components/table/DataTable";

const DemoApiPage = () => {
    const search = useSamplePageStore((s) => s.search);
    const filterKey = useSamplePageStore((s) => s.filterKey);
    const sortKey = useSamplePageStore((s) => s.sortKey);
    const sortDirection = useSamplePageStore((s) => s.sortDirection);
    const page = useSamplePageStore((s) => s.page);
    const setPage = useSamplePageStore((s) => s.setPage);
    const setSearch = useSamplePageStore((s) => s.setSearch);
    const setFilterKey = useSamplePageStore((s) => s.setFilterKey);
    const setSort = useSamplePageStore((s) => s.setSort);
    const pageSize = useSamplePageStore((s) => s.pageSize);
    const setPageSize = useSamplePageStore((s) => s.setPageSize);

    useEffect(() => {
        if (page < 1) setPage(1);
    }, [page, setPage]);

    const { data, isLoading, isFetching, isError } = useQuery({
        queryKey: ["sample", "list", { page, pageSize, search, filterKey, sortKey, sortDirection }],
        queryFn: ({ queryKey }) => {
            const [, , params] = queryKey as [string, string, {
                page: number;
                pageSize: number;
                search: string;
                filterKey: string;
                sortKey: string | null;
                sortDirection: "asc" | "desc";
            }];
            return GetSampleListApi({ ...params, query: params.search, sortKey: params.sortKey ?? undefined });
        },
        staleTime: 30_000,
        gcTime: 5 * 60_000,
    });

    const allRows = data?.data ?? [];
    const trimmedQuery = search.trim().toLowerCase();

    const filteredRows = allRows.filter((row) => {
        if (!trimmedQuery) return true;

        const fields = filterKey === "all"
            ? Object.values(row)
            : [row[filterKey]];

        return fields.some((value) => String(value).toLowerCase().includes(trimmedQuery));
    });

    const sortedRows = [...filteredRows].sort((a, b) => {
        if (!sortKey) return 0;

        const aValue = String(a[sortKey]);
        const bValue = String(b[sortKey]);
        const compared = aValue.localeCompare(bValue, "ko", { numeric: true });

        return sortDirection === "asc" ? compared : -compared;
    });

    const total = sortedRows.length;
    const startIndex = (page - 1) * pageSize;
    const rows = sortedRows.slice(startIndex, startIndex + pageSize);

    if (isError) {
        return (
            <div className="p-6">
                <p className="text-sm text-destructive">데이터를 불러오지 못했습니다.</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-full min-w-0 items-center justify-center overflow-hidden">
            <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6 overflow-hidden">
                <header className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Demo API</p>
                    <h1 className="text-3xl font-semibold tracking-tight">Sample API DataTable</h1>
                    <p className="text-sm text-muted-foreground">
                        /sample/list 응답 데이터를 공통 DataTable 컴포넌트로 조회합니다.
                    </p>
                </header>
                <DataTable
                    title="샘플 목록"
                    description="검색 조건은 상태 스토어에 저장되어 새로고침 후에도 유지됩니다."
                    rows={rows}
                    total={total}
                    pageSize={pageSize}
                    isLoading={isLoading || isFetching}
                    filterOptions={SAMPLE_TABLE_FILTER}
                    columns={SAMPLE_TABLE_COLUMNS}
                    query={search}
                    filterKey={filterKey}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    page={page}
                    onQueryChange={setSearch}
                    onFilterChange={setFilterKey}
                    onSortChange={setSort}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                />
            </div>
        </div>
    );
};

export default DemoApiPage;
