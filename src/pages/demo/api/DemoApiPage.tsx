import { useEffect } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { GetSampleListApi, type ISampleApiItem } from "@/apis/demo/sample.api.ts";
import { GC_TIME, STALE_TIME } from "@/constants/query.constants.ts";
import { SAMPLE_TABLE_COLUMNS, SAMPLE_TABLE_FILTER } from "@/constants/table.constants.tsx";
import { useSamplePageStore } from "@/stores/page/demo/sample.store.ts";
import DataTable from "@/components/table/DataTable";
import { ApiResultEnum, ErrorResultCodeEnum, SuccessResultCodeEnum } from "@/enums/apiResult.enum.ts";

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
    const size = useSamplePageStore((s) => s.size);
    const setSize = useSamplePageStore((s) => s.setSize);

    useEffect(() => {
        if (page < 1) setPage(1);
    }, [page, setPage]);

    const { data, isLoading, isFetching, isError, error } = useQuery({
        queryKey: ["sample", "list", { page, size, search, filterKey, sortKey, sortDirection }],
        queryFn: ({ queryKey }) => {
            const [, , params] = queryKey as [string, string, {
                page: number;
                size: number;
                search: string;
                filterKey: string;
                sortKey: string | null;
                sortDirection: "asc" | "desc";
            }];
            return GetSampleListApi({ ...params, query: params.search, sortKey: params.sortKey ?? undefined });
        },
        placeholderData: keepPreviousData,
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
    });

    const hasSuccessfulResponse = data?.result === ApiResultEnum.SUCCESS && data.code === SuccessResultCodeEnum.OK;
    const pageData = hasSuccessfulResponse ? data.data : null;

    const apiError = data?.result === ApiResultEnum.FAIL ? data.error : null;
    const apiErrorCode = data?.result === ApiResultEnum.FAIL ? data.code : null;
    const queryErrorMessage = error instanceof Error ? error.message : null;

    const rows: ISampleApiItem[] = pageData?.content ?? [];
    const total = pageData?.totalElements ?? 0;
    const totalPages = pageData?.totalPages;

    useEffect(() => {
        if (!hasSuccessfulResponse || totalPages === undefined) return;
        const safeTotalPages = Math.max(totalPages, 1);
        if (page > safeTotalPages) setPage(safeTotalPages);
    }, [hasSuccessfulResponse, page, setPage, totalPages]);

    return (
        <div className="flex min-h-full min-w-0 items-center justify-center overflow-hidden">
            <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6 overflow-hidden">
                <header className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Demo API</p>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Sample API DataTable
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        /sample/list 응답 데이터를 공통 DataTable 컴포넌트로 조회합니다.
                    </p>
                </header>

                {isError || data?.result === ApiResultEnum.FAIL ? (
                    <div
                        className="flex h-64 flex-col items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-6 text-center">
                        <p className="text-sm font-medium text-destructive">
                            {`[${apiErrorCode ?? ErrorResultCodeEnum.INTERNAL_ERROR}] ${apiError?.detail ?? queryErrorMessage ?? "데이터를 불러오지 못했습니다."}`}
                        </p>
                        {apiError?.fieldErrors?.length ? (
                            <ul className="space-y-1 text-xs text-destructive/80">
                                {apiError.fieldErrors.map((fieldError) => (
                                    <li key={`${fieldError.field}-${fieldError.reason}`}>
                                        {fieldError.field}: {fieldError.reason}
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                ) : (
                    <DataTable
                        title="샘플 목록"
                        description="검색 조건은 상태 스토어에 저장되어 새로고침 후에도 유지됩니다."
                        rows={rows}
                        total={total}
                        pageSize={size}
                        isLoading={isLoading}
                        isFetching={isFetching}
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
                        onPageSizeChange={setSize}
                    />
                )}
            </div>
        </div>
    );
};

export default DemoApiPage;
