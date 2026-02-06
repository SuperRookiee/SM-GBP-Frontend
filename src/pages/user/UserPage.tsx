import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserSampleDataApi } from "@/apis/user.api";
import { GRID_CONSTANTS } from "@/constants/grid.constants.ts";
import { USER_TABLE_COLUMNS, USER_TABLE_FILTER_OPTIONS } from "@/constants/table.constants.tsx";
import type { IUser } from "@/interface/IUser.ts";
import DataTable from "@/components/table/DataTable";
import { useUserPageStore } from "@/stores/user.page.store.ts";

const UserPage = () => {
    const {
        query,
        filterKey,
        sortKey,
        sortDirection,
        page,
        setQuery,
        setFilterKey,
        setSort,
        setPage,
        reset,
    } = useUserPageStore();
    const pageSize = GRID_CONSTANTS.pageSize;

    const { data, isLoading, isFetching, isError } = useQuery({
        queryKey: ["users", { page, pageSize, query, filterKey, sortKey, sortDirection }],
        queryFn: async () => getUserSampleDataApi({ page, pageSize, query, filterKey, sortKey, sortDirection }),
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        placeholderData: (prev) => prev,
    });

    const rows = data?.rows ?? [];
    const total = data?.total ?? 0;

    useEffect(() => () => reset(), [reset]);

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
                    <p className="text-sm font-semibold text-muted-foreground">User Management</p>
                    <h1 className="text-3xl font-semibold tracking-tight">User Page</h1>
                    <p className="text-sm text-muted-foreground">
                        사용자 ID와 권한 정보를 한 번에 확인할 수 있는 목록입니다.
                    </p>
                </header>
                <DataTable
                    title="사용자 목록"
                    description="검색 및 정렬 결과는 페이지 이동 시 유지됩니다."
                    rows={rows}
                    total={total}
                    pageSize={pageSize}
                    isLoading={isLoading || isFetching}
                    filterOptions={USER_TABLE_FILTER_OPTIONS}
                    columns={USER_TABLE_COLUMNS}
                    query={query}
                    filterKey={filterKey}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    page={page}
                    onQueryChange={setQuery}
                    onFilterChange={setFilterKey}
                    onSortChange={setSort}
                    onPageChange={setPage}
                    searchPlaceholder="이름, 권한, User ID로 검색"
                />
            </div>
        </div>
    );
};

export default UserPage;
