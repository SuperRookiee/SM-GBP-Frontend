import { Activity, type ReactNode, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { GRID_CONSTANTS } from "@/constants/grid.constants.ts";
import type { DemoDataTableColumn, DemoDataTableFilterOption } from "@/types/demoDataTable.types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
    enableSelect?: boolean;
    selectedRowIds?: Array<string | number>;
    onSelectedRowIdsChange?: (selectedRowIds: Array<string | number>) => void;
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
    enableSelect = false,
    selectedRowIds = [],
    onSelectedRowIdsChange,
}: IGridTableClientProps<T>) => {
    const [draftQuery, setDraftQuery] = useState(query);
    const [draftFilterKey, setDraftFilterKey] = useState<"all" | keyof T>(filterKey);
    const [columnFilters, setColumnFilters] = useState<Partial<Record<keyof T, string>>>({});
    const [internalSelectedRowIds, setInternalSelectedRowIds] = useState<Array<string | number>>([]);

    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    useEffect(() => {
        if (isLoading) return;
        if (total <= 0) return;

        if (page !== currentPage) onPageChange(currentPage);
    }, [currentPage, isLoading, onPageChange, page, total]);

    useEffect(() => {
        setDraftQuery(query);
    }, [query]);

    useEffect(() => {
        setDraftFilterKey(filterKey);
    }, [filterKey]);

    const filteredRows = useMemo(() => {
        return rows.filter((row) =>
            columns.every((column) => {
                if (!column.filterable) return true;
                const filterValue = columnFilters[column.key as keyof T]?.trim();
                if (!filterValue) return true;

                const rawValue = row[column.key as keyof T];
                if (rawValue === undefined || rawValue === null) return false;

                return String(rawValue).toLowerCase().includes(filterValue.toLowerCase());
            }),
        );
    }, [columnFilters, columns, rows]);

    const effectiveSelectedRowIds = onSelectedRowIdsChange ? selectedRowIds : internalSelectedRowIds;

    const selectedRowIdSet = useMemo(() => new Set(effectiveSelectedRowIds), [effectiveSelectedRowIds]);
    const allVisibleIds = useMemo(() => filteredRows.map((row) => getRowId(row)), [filteredRows, getRowId]);

    const isAllRowsSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedRowIdSet.has(id));
    const isSomeRowsSelected = allVisibleIds.some((id) => selectedRowIdSet.has(id));

    const previousPage = currentPage > 1 ? currentPage - 1 : null;
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;

    const pageWindowStart = Math.floor((currentPage - 1) / GRID_CONSTANTS.pageWindow) * GRID_CONSTANTS.pageWindow + 1;
    const pageWindowEnd = Math.min(totalPages, pageWindowStart + GRID_CONSTANTS.pageWindow - 1);
    const pageNumbers = useMemo(() =>
        Array.from({ length: pageWindowEnd - pageWindowStart + 1 }, (_, index) => pageWindowStart + index),
    [pageWindowEnd, pageWindowStart]);

    const sortIndicator = (key: keyof T) => {
        if (sortKey !== key) return null;
        return <span className="ml-1 text-xs text-muted-foreground">{sortDirection === "asc" ? "▲" : "▼"}</span>;
    };

    const skeletonRows = Array.from({ length: 6 }, (_, index) => `skeleton-${index}`);

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

    const onChangeColumnFilter = (key: keyof T, value: string) => {
        setColumnFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const onToggleSelectAll = (checked: boolean | "indeterminate") => {
        if (checked === true) {
            const merged = new Set([...effectiveSelectedRowIds, ...allVisibleIds]);
            const nextSelected = Array.from(merged);
            if (onSelectedRowIdsChange) onSelectedRowIdsChange(nextSelected);
            else setInternalSelectedRowIds(nextSelected);
            return;
        }

        const visibleIdSet = new Set(allVisibleIds);
        const nextSelected = effectiveSelectedRowIds.filter((id) => !visibleIdSet.has(id));
        if (onSelectedRowIdsChange) onSelectedRowIdsChange(nextSelected);
        else setInternalSelectedRowIds(nextSelected);
    };

    const onToggleSelectRow = (rowId: string | number, checked: boolean | "indeterminate") => {
        if (checked === true) {
            const merged = new Set([...effectiveSelectedRowIds, rowId]);
            const nextSelected = Array.from(merged);
            if (onSelectedRowIdsChange) onSelectedRowIdsChange(nextSelected);
            else setInternalSelectedRowIds(nextSelected);
            return;
        }

        const nextSelected = effectiveSelectedRowIds.filter((id) => id !== rowId);
        if (onSelectedRowIdsChange) onSelectedRowIdsChange(nextSelected);
        else setInternalSelectedRowIds(nextSelected);
    };

    return (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
                    <div className="w-full sm:w-40">
                        <label className="text-xs font-medium text-muted-foreground">{filterLabel}</label>
                        <Select value={String(draftFilterKey)} onValueChange={onChangeFilterKey}>
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="검색 조건 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {filterOptions.map((option) =>
                                    <SelectItem key={String(option.value)} value={String(option.value)}>
                                        {option.label}
                                    </SelectItem>,
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full sm:w-72">
                        <label className="text-xs font-medium text-muted-foreground">{searchLabel}</label>
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
                <TableHeader className="sticky top-0 z-10 bg-card">
                    <TableRow className="bg-card hover:bg-card">
                        {enableSelect && (
                            <TableHead className="w-10 bg-card">
                                <Checkbox
                                    checked={isAllRowsSelected ? true : (isSomeRowsSelected ? "indeterminate" : false)}
                                    onCheckedChange={onToggleSelectAll}
                                    aria-label="전체 선택"
                                />
                            </TableHead>
                        )}
                        {columns.map((column) => {
                            const isSortable = column.sortable ?? true;
                            return (
                                <TableHead key={String(column.key)} className={`bg-card ${column.headerClassName ?? ""}`}>
                                    {isSortable ? (
                                        <Button
                                            className="h-auto justify-start px-0 py-0 text-left text-muted-foreground hover:text-foreground"
                                            type="button"
                                            variant="ghost"
                                            onClick={() => onClickSort(column.key as keyof T)}
                                        >
                                            {column.label}
                                            {sortIndicator(column.key as keyof T)}
                                        </Button>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">{column.label}</span>
                                    )}
                                </TableHead>
                            );
                        })}
                    </TableRow>
                    <TableRow className="bg-card hover:bg-card">
                        {enableSelect && <TableHead className="w-10 bg-card" />}
                        {columns.map((column) => (
                            <TableHead key={`filter-${String(column.key)}`} className="bg-card">
                                {column.filterable ? (
                                    <Input
                                        value={columnFilters[column.key as keyof T] ?? ""}
                                        onChange={(event) => onChangeColumnFilter(column.key as keyof T, event.target.value)}
                                        placeholder={`${column.label} 필터`}
                                        className="h-8"
                                    />
                                ) : (
                                    <span className="text-xs text-muted-foreground">-</span>
                                )}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading
                        ? skeletonRows.map((key) =>
                            <TableRow key={key}>
                                {enableSelect && (
                                    <TableCell className="w-10">
                                        <Skeleton className="h-4 w-4" />
                                    </TableCell>
                                )}
                                {columns.map((column) =>
                                    <TableCell key={`${key}-${String(column.key)}`}>
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>,
                                )}
                            </TableRow>,
                        )
                        : filteredRows.map((row) => {
                            const rowId = getRowId(row);
                            return (
                                <TableRow key={rowId}>
                                    {enableSelect && (
                                        <TableCell className="w-10">
                                            <Checkbox
                                                checked={selectedRowIdSet.has(rowId)}
                                                onCheckedChange={(checked) => onToggleSelectRow(rowId, checked)}
                                                aria-label={`행 선택 ${String(rowId)}`}
                                            />
                                        </TableCell>
                                    )}
                                    {columns.map((column) =>
                                        <TableCell key={`${rowId}-${String(column.key)}`} className={column.cellClassName}>
                                            {column.render ? column.render(row) : String(row[column.key as keyof T])}
                                        </TableCell>,
                                    )}
                                </TableRow>
                            );
                        })}
                    {!isLoading && filteredRows.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length + (enableSelect ? 1 : 0)}
                                className="py-8 text-center text-sm text-muted-foreground"
                            >
                                조건에 맞는 데이터가 없습니다.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4 text-sm text-muted-foreground
                            sm:flex-row sm:items-center sm:justify-between">
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
                                    ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                                    : undefined
                            }
                            type="button"
                            variant={pageNumber === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(pageNumber)}
                        >
                            {pageNumber}
                        </Button>,
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
