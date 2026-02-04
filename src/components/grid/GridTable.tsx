import { Activity, type ReactNode, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import GRID_CONSTANTS from "@/constants/grid.constants";
import type { GridColumn, GridFilterOption, GridRow } from "@/interface/grid.interface";
import { useGridStore } from "@/stores/gridStore";

interface GridTableClientProps {
    initialData: GridRow[];
    isLoading?: boolean;
    title: string;
    description?: string;
    columns: GridColumn[];
    filterOptions: GridFilterOption[];
    searchLabel?: string;
    searchPlaceholder?: string;
    filterLabel?: string;
    captionRenderer?: (count: number) => ReactNode;
}

// Grid 데이터를 보여주는 테이블 컴포넌트 함수
const GridTable = ({
    initialData,
    isLoading = false,
    title,
    description,
    columns,
    filterOptions,
    searchLabel = "검색",
    searchPlaceholder = "검색어를 입력하세요",
    filterLabel = "검색 조건",
    captionRenderer = (count) => `총 ${count} 건`,
}: GridTableClientProps) => {
    const storedData = useGridStore((state) => state.data);
    const data = storedData.length > 0 ? storedData : initialData;
    const query = useGridStore((state) => state.query);
    const filterKey = useGridStore((state) => state.filterKey);
    const sortKey = useGridStore((state) => state.sortKey);
    const sortDirection = useGridStore((state) => state.sortDirection);
    const page = useGridStore((state) => state.page);
    const setData = useGridStore((state) => state.setData);
    const setQuery = useGridStore((state) => state.setQuery);
    const setFilterKey = useGridStore((state) => state.setFilterKey);
    const setSort = useGridStore((state) => state.setSort);
    const setPage = useGridStore((state) => state.setPage);

    // #. 최초 로드 시 스토어 데이터가 비어 있으면 초기 데이터를 주입합니다.
    useEffect(() => {
        if (storedData.length === 0)
            setData(initialData);
    }, [storedData.length, initialData, setData]);

    // #. 검색어 및 필터 조건에 따라 데이터를 필터링합니다.
    const filteredRows = useMemo(() => {
        if (!query.trim()) return data;

        const normalized = query.toLowerCase();
        const fields: Array<keyof GridRow> =
            filterKey === "all" ? ["id", "customer", "email", "role", "status"] : [filterKey];

        return data.filter((row) =>
            fields
                .map((field) => String(row[field]))
                .join(" ")
                .toLowerCase()
                .includes(normalized),
        );
    }, [data, filterKey, query]);

    // #. 선택된 정렬 기준으로 데이터를 정렬합니다.
    const sortedRows = useMemo(() => {
        if (!sortKey) return filteredRows;

        const sorted = [...filteredRows].sort((a, b) => {
            const left = String(a[sortKey]);
            const right = String(b[sortKey]);
            return left.localeCompare(right, "ko");
        });

        return sortDirection === "asc" ? sorted : sorted.reverse();
    }, [filteredRows, sortDirection, sortKey]);

    // #. 페이지네이션 계산에 필요한 값들을 준비합니다.
    const totalPages = Math.max(Math.ceil(sortedRows.length / GRID_CONSTANTS.pageSize), 1);
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * GRID_CONSTANTS.pageSize;
    const rows = sortedRows.slice(startIndex, startIndex + GRID_CONSTANTS.pageSize,);
    const hasData = data.length > 0;

    // #. 현재 페이지가 범위를 벗어나면 스토어 페이지를 보정합니다.
    useEffect(() => {
        if (!hasData) return;
        if (page !== currentPage) setPage(currentPage);
    }, [currentPage, hasData, page, setPage]);

    const previousPage = currentPage > 1 ? currentPage - 1 : null;
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;

    // #. 화면에 표시할 페이지 번호 범위를 계산합니다.
    const pageWindowStart =
        Math.floor((currentPage - 1) / GRID_CONSTANTS.pageWindow) *
        GRID_CONSTANTS.pageWindow +
        1;
    const pageWindowEnd = Math.min(
        totalPages,
        pageWindowStart + GRID_CONSTANTS.pageWindow - 1,
    );
    const pageNumbers = Array.from(
        { length: pageWindowEnd - pageWindowStart + 1 },
        (_, index) => pageWindowStart + index,
    );

    // #. 정렬 방향 표시를 반환하는 함수
    const sortIndicator = (key: keyof GridRow) => {
        if (sortKey !== key) return null;

        return (
            <span className="ml-1 text-xs text-zinc-400">
              {sortDirection === "asc" ? "▲" : "▼"}
            </span>
        );
    };

    const skeletonRows = Array.from({ length: 6 }, (_, index) => `skeleton-${index}`);

    return (
        <section
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {description}
                        </p>
                    )}
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
                    <div className="w-full sm:w-40">
                        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            {filterLabel}
                        </label>
                        <Select
                            value={filterKey}
                            onValueChange={(value) => setFilterKey(value as "all" | keyof GridRow)}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="검색 조건 선택"/>
                            </SelectTrigger>
                            <SelectContent>
                                {filterOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full sm:w-72">
                        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            {searchLabel}
                        </label>
                        <Input
                            className="mt-2"
                            placeholder={searchPlaceholder}
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Table>
                <TableCaption>
                    <Activity mode={isLoading ? "visible" : "hidden"}>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-28"/>
                            <Skeleton className="h-4 w-12"/>
                        </div>
                    </Activity>
                    <Activity mode={isLoading ? "hidden" : "visible"}>
                        {captionRenderer(sortedRows.length)}
                    </Activity>
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => {
                            const isSortable = column.sortable ?? true;
                            return (
                                <TableHead key={column.key} className={column.headerClassName}>
                                    {isSortable ? (
                                        <Button
                                            className="h-auto justify-start px-0 py-0 text-left text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setSort(column.key)}
                                        >
                                            {column.label}
                                            {sortIndicator(column.key)}
                                        </Button>
                                    ) : (
                                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                            {column.label}
                                        </span>
                                    )}
                                </TableHead>
                            );
                        })}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading
                        ? skeletonRows.map((key) => (
                            <TableRow key={key}>
                                {columns.map((column) => (
                                    <TableCell key={`${key}-${column.key}`}>
                                        <Skeleton className="h-4 w-24"/>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                        : rows.map((row) => (
                            <TableRow key={row.id}>
                                {columns.map((column) => (
                                    <TableCell key={`${row.id}-${column.key}`} className={column.cellClassName}>
                                        {column.render ? column.render(row) : String(row[column.key])}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                </TableBody>
            </Table>

            <div className="mt-6 flex flex-col gap-4 border-t border-zinc-200 pt-4 text-sm text-zinc-500
                            dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(1)}
                        disabled={currentPage === 1}
                    >
                        처음
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => previousPage && setPage(previousPage)}
                        disabled={!previousPage}
                    >
                        이전
                    </Button>

                    {pageNumbers.map((pageNumber) =>
                        <Button
                            key={pageNumber}
                            className={
                                pageNumber === currentPage
                                    ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 dark:border-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                                    : undefined
                            }
                            type="button"
                            variant={pageNumber === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNumber)}
                        >
                            {pageNumber}
                        </Button>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => nextPage && setPage(nextPage)}
                        disabled={!nextPage}
                    >
                        다음
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        마지막
                    </Button>
                </div>
            </div>
        </section>
    );
}

export default GridTable;
