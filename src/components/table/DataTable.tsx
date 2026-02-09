import { Activity, type ReactNode, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { GRID_CONSTANTS } from "@/constants/grid.constants.ts";
import type { DemoDataTableColumn, DemoDataTableFilterOption } from "@/types/demoDataTable.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface IGridTableClientProps<T> {
    rows: T[];
    total: number;
    pageSize: number;
    isLoading?: boolean;
    title: string;
    description?: string;
    columns: DemoDataTableColumn<T>[];
    filterOptions: DemoDataTableFilterOption<T>[];
    query: string;
    filterKey: "all" | keyof T;
    sortKey: keyof T | null;
    sortDirection: "asc" | "desc";
    page: number;
    onQueryChange: (query: string) => void;
    onFilterChange: (filterKey: "all" | keyof T) => void;
    onSortChange: (key: keyof T) => void;
    onPageChange: (page: number) => void;
    searchLabel?: string;
    searchPlaceholder?: string;
    filterLabel?: string;
    getRowId?: (row: T) => string | number;
    captionRenderer?: (total: number) => ReactNode;
}

const DataTable = <T,>({
    rows, total, pageSize, title, description, columns, filterOptions,
    query, filterKey, sortKey, sortDirection, page,
    onQueryChange, onFilterChange, onSortChange, onPageChange,
    isLoading = false,
    searchLabel = "검색",
    searchPlaceholder = "검색어를 입력하세요",
    filterLabel = "검색 조건",
    getRowId = (row) => (row as { id: string | number }).id,
    captionRenderer = (count) => `총 ${count} 건`,
}: IGridTableClientProps<T>) => {
    const [draftQuery, setDraftQuery] = useState(query);
    const [draftFilterKey, setDraftFilterKey] = useState<"all" | keyof T>(filterKey);

    // #. total 기반 페이지 계산
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    // #. page가 범위 벗어나면 보정
    useEffect(() => {
        if (isLoading) return;  // 서버 응답(total)이 준비되기 전에는 clamp로 page를 덮어쓰지 않음
        if (total <= 0) return; // 데이터 0건일 땐 굳이 보정 X

        if (page !== currentPage) onPageChange(currentPage);
    }, [currentPage, isLoading, onPageChange, page, total]);

    useEffect(() => {
        setDraftQuery(query);
    }, [query]);

    useEffect(() => {
        setDraftFilterKey(filterKey);
    }, [filterKey]);

    const previousPage = currentPage > 1 ? currentPage - 1 : null;
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;

    // #.페이지 윈도우 계산
    const pageWindowStart = Math.floor((currentPage - 1) / GRID_CONSTANTS.pageWindow) * GRID_CONSTANTS.pageWindow + 1;
    const pageWindowEnd = Math.min(totalPages, pageWindowStart + GRID_CONSTANTS.pageWindow - 1);
    const pageNumbers = useMemo(() =>
        Array.from({ length: pageWindowEnd - pageWindowStart + 1 }, (_, index) => pageWindowStart + index),
    [pageWindowEnd, pageWindowStart]);

    const sortIndicator = (key: keyof T) => {
        if (sortKey !== key) return null;
        return <span className="ml-1 text-xs text-zinc-400">{sortDirection === "asc" ? "▲" : "▼"}</span>;
    };

    const skeletonRows = Array.from({ length: 6 }, (_, index) => `skeleton-${index}`);

    // #. 서버 페이징에서는 검색/필터/정렬 변경 시 보통 page=1로 리셋
    const onChangeFilterKey = (value: string) => {
        setDraftFilterKey(value as "all" | keyof T);
    };

    const onChangeQuery = (value: string) => {
        setDraftQuery(value);
    };

    const onClickSearch = () => {
        onFilterChange(draftFilterKey);
        onQueryChange(draftQuery);
        onPageChange(1);
    };

    const onClickSort = (key: keyof T) => {
        onSortChange(key);
        onPageChange(1);
    };

    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
                    {description && <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
                    <div className="w-full sm:w-40">
                        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{filterLabel}</label>
                        <Select value={String(draftFilterKey)} onValueChange={onChangeFilterKey}>
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="검색 조건 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {filterOptions.map((option) =>
                                    <SelectItem key={String(option.value)} value={String(option.value)}>
                                        {option.label}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full sm:w-72">
                        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{searchLabel}</label>
                        <div className="mt-2 flex items-center gap-2">
                            <Input
                                placeholder={searchPlaceholder}
                                value={draftQuery}
                                onChange={(event) => onChangeQuery(event.target.value)}
                            />
                            <Button type="button" variant="outline" size="icon" onClick={onClickSearch} aria-label="검색">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map(column => {
                            const isSortable = column.sortable ?? true;
                            return (
                                <TableHead key={String(column.key)} className={column.headerClassName}>
                                    {isSortable ? (
                                        <Button
                                            className="h-auto justify-start px-0 py-0 text-left text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                                            type="button"
                                            variant="ghost"
                                            onClick={() => onClickSort(column.key as keyof T)}
                                        >
                                            {column.label}
                                            {sortIndicator(column.key as keyof T)}
                                        </Button>
                                    ) : (
                                        <span className="text-sm text-zinc-500 dark:text-zinc-400">{column.label}</span>
                                    )}
                                </TableHead>
                            );
                        })}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading
                        ? skeletonRows.map(key =>
                            <TableRow key={key}>
                                {columns.map((column) =>
                                    <TableCell key={`${key}-${String(column.key)}`}>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                )}
                            </TableRow>
                        )
                        : rows.map(row =>
                            <TableRow key={getRowId(row)}>
                                {columns.map((column) =>
                                    <TableCell key={`${getRowId(row)}-${String(column.key)}`} className={column.cellClassName}>
                                        {column.render ? column.render(row) : String(row[column.key as keyof T])}
                                    </TableCell>
                                )}
                            </TableRow>
                        )}
                </TableBody>
            </Table>

            <div className="mt-4 flex flex-col gap-4 border-t border-zinc-200 pt-4 text-sm text-zinc-500
                            dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <Activity mode={isLoading ? "visible" : "hidden"}>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    </Activity>
                    <Activity mode={isLoading ? "hidden" : "visible"}>{captionRenderer(total)}</Activity>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
                        처음
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => previousPage && onPageChange(previousPage)}
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
                            onClick={() => onPageChange(pageNumber)}
                        >
                            {pageNumber}
                        </Button>
                    )}

                    <Button type="button" variant="outline" size="sm" onClick={() => nextPage && onPageChange(nextPage)} disabled={!nextPage}>
                        다음
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        마지막
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default DataTable;