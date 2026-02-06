import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDemoGridSampleDataApi } from "@/apis/demoGrid.api";
import { GRID_CONSTANTS } from "@/constants/demoGrid.constants";
import { useDemoGridStore } from "@/stores/demoGridStore";
import type { DemoGridColumn, DemoGridFilterOption, IDemoGridRow } from "@/interface/demoGrid.interface";
import DataTable from "@/components/grid/DataTable";

// API 응답 타입
type DemoGridResponse = {
    rows: IDemoGridRow[];
    total: number;
};

const DemoGridPage = () => {
    const query = useDemoGridStore((s) => s.query);
    const filterKey = useDemoGridStore((s) => s.filterKey);
    const sortKey = useDemoGridStore((s) => s.sortKey);
    const sortDirection = useDemoGridStore((s) => s.sortDirection);
    const page = useDemoGridStore((s) => s.page);
    const setPage = useDemoGridStore((s) => s.setPage);
    const pageSize = GRID_CONSTANTS.pageSize;

    // #. page가 0 이하로 가는 방지
    useEffect(() => {
        if (page < 1) setPage(1);
    }, [page, setPage]);

    const { data, isLoading, isFetching, isError } = useQuery<DemoGridResponse>({
        queryKey: ["demoGrid", "rows", { page, pageSize, query, filterKey, sortKey, sortDirection}],
        queryFn: async () =>  await getDemoGridSampleDataApi({ page, pageSize, query, filterKey, sortKey, sortDirection}), // 서버에서 rows는 pageSize만큼, total은 전체 count(*) 내려줘야 함
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        placeholderData: prev => prev, // 이전 페이지 데이터를 잠깐 유지해서 깜빡임 줄이기
    });

    const rows = data?.rows ?? [];
    const total = data?.total ?? 0;

    const filterOptions: DemoGridFilterOption[] = useMemo(() => [
        { value: "all", label: "전체" },
        { value: "id", label: "문서 번호" },
        { value: "customer", label: "담당자" },
        { value: "email", label: "이메일" },
        { value: "role", label: "역할" },
        { value: "status", label: "상태" },
    ], []);

    const columns: DemoGridColumn[] = useMemo(() => [
        { key: "id", label: "문서 번호", cellClassName: "font-medium" },
        { key: "customer", label: "담당자" },
        { key: "email", label: "이메일" },
        { key: "role", label: "역할" },
        {
            key: "status",
            label: "상태",
            render: row =>
            <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground">
                {row.status}
            </span>
        },
    ],[]);

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
                    <p className="text-sm font-semibold text-muted-foreground">Demo Grid</p>
                    <h1 className="text-3xl font-semibold tracking-tight">Demo Data Table</h1>
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
                    filterOptions={filterOptions}
                    columns={columns}
                />
            </div>
        </div>
    );
};

export default DemoGridPage;