import { Activity, type ReactNode, useEffect, useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";
import { DEFAULT_TABLE } from "@/constants/table.constants.tsx";
import type { DemoDataTableColumn, DemoDataTableFilterOption } from "@/types/demoDataTable.types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    tableHeightClassName?: string;
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
    tableHeightClassName = "h-[420px]",
}: IGridTableClientProps<T>) => {
    const [draftQuery, setDraftQuery] = useState(query);
    const [draftFilterKey, setDraftFilterKey] = useState<"all" | keyof T>(filterKey);
    const [columnFilterSearch, setColumnFilterSearch] = useState<Partial<Record<keyof T, string>>>({});
    const [columnSelectedValues, setColumnSelectedValues] = useState<Partial<Record<keyof T, string[]>>>({});
    const [internalSelectedRowIds, setInternalSelectedRowIds] = useState<Array<string | number>>([]);

    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    useEffect(() => {
        if (isLoading) return;
        if (total <= 0) return;
        if (page !== currentPage) onPageChange(currentPage);
    }, [currentPage, isLoading, onPageChange, page, total]);

    useEffect(() => setDraftQuery(query), [query]);
    useEffect(() => setDraftFilterKey(filterKey), [filterKey]);

    const getColumnRawValue = (row: T, key: keyof T) => {
        const value = row[key];
        if (value === undefined || value === null) return "";
        return String(value);
    };

    const filterableColumns = useMemo(
        () => columns.filter((column) => column.filterable).map((column) => column.key as keyof T),
        [columns],
    );

    const columnFilterOptions = useMemo(() => {
        const map = new Map<keyof T, string[]>();

        filterableColumns.forEach((key) => {
            const distinctValues = Array.from(new Set(rows.map((row) => getColumnRawValue(row, key)).filter(Boolean)));
            map.set(key, distinctValues);
        });

        return map;
    }, [filterableColumns, rows]);

    const filteredRows = useMemo(() => {
        return rows.filter((row) =>
            columns.every((column) => {
                if (!column.filterable) return true;

                const key = column.key as keyof T;
                const selectedValues = columnSelectedValues[key] ?? [];
                if (selectedValues.length === 0) return true;

                return selectedValues.includes(getColumnRawValue(row, key));
            }),
        );
    }, [columnSelectedValues, columns, rows]);

    const effectiveSelectedRowIds = onSelectedRowIdsChange ? selectedRowIds : internalSelectedRowIds;
    const selectedRowIdSet = useMemo(() => new Set(effectiveSelectedRowIds), [effectiveSelectedRowIds]);
    const allVisibleIds = useMemo(() => filteredRows.map((row) => getRowId(row)), [filteredRows, getRowId]);

    const isAllRowsSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedRowIdSet.has(id));
    const isSomeRowsSelected = allVisibleIds.some((id) => selectedRowIdSet.has(id));

    const previousPage = currentPage > 1 ? currentPage - 1 : null;
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;

    const pageWindowStart = Math.floor((currentPage - 1) / DEFAULT_TABLE.pageWindow) * DEFAULT_TABLE.pageWindow + 1;
    const pageWindowEnd = Math.min(totalPages, pageWindowStart + DEFAULT_TABLE.pageWindow - 1);
    const pageNumbers = useMemo(() =>
        Array.from({ length: pageWindowEnd - pageWindowStart + 1 }, (_, index) => pageWindowStart + index),
    [pageWindowEnd, pageWindowStart]);

    const sortIndicator = (key: keyof T) => {
        if (sortKey !== key) return null;
        return <span className="ml-1 text-xs text-muted-foreground">{sortDirection === "asc" ? "▲" : "▼"}</span>;
    };

    const skeletonRows = Array.from({ length: 6 }, (_, index) => `skeleton-${index}`);

    const onClickSearch = () => {
        onFilterChange(draftFilterKey);
        onQueryChange(draftQuery);
        onPageChange(1);
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

    const onChangeColumnSearch = (key: keyof T, value: string) => {
        setColumnFilterSearch((prev) => ({ ...prev, [key]: value }));
    };

    const onToggleColumnFilterValue = (key: keyof T, value: string, checked: boolean) => {
        setColumnSelectedValues((prev) => {
            const current = prev[key] ?? [];
            const next = checked ? [...new Set([...current, value])] : current.filter((item) => item !== value);
            return { ...prev, [key]: next };
        });
        onPageChange(1);
    };

    const onToggleColumnSelectAll = (key: keyof T, checked: boolean) => {
        setColumnSelectedValues((prev) => {
            const allValues = columnFilterOptions.get(key) ?? [];
            return { ...prev, [key]: checked ? allValues : [] };
        });
        onPageChange(1);
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
                        <Select value={String(draftFilterKey)} onValueChange={(value) => setDraftFilterKey(value as "all" | keyof T)}>
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
                                onChange={(event) => setDraftQuery(event.target.value)}
                            />
                            <Button type="button" variant="outline" size="icon" onClick={onClickSearch} aria-label="검색">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <ScrollArea className={`w-full rounded-md border ${tableHeightClassName}`}>
                <Table>
                    <TableHeader className="sticky top-0 z-20 bg-card">
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
                                const columnKey = column.key as keyof T;
                                const selectedCount = (columnSelectedValues[columnKey] ?? []).length;

                                return (
                                    <TableHead key={String(column.key)} className={`bg-card ${column.headerClassName ?? ""}`}>
                                        <div className="flex items-center gap-1">
                                            {isSortable ? (
                                                <Button
                                                    className="h-auto justify-start px-0 py-0 text-left text-muted-foreground hover:text-foreground"
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => onSortChange(columnKey)}
                                                >
                                                    {column.label}
                                                    {sortIndicator(columnKey)}
                                                </Button>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">{column.label}</span>
                                            )}

                                            {column.filterable && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                            aria-label={`${column.label} 필터 열기`}
                                                        >
                                                            <Filter className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-56 p-2" align="start">
                                                        <DropdownMenuLabel className="px-1 py-1 text-xs text-muted-foreground">
                                                            {column.label} 필터
                                                        </DropdownMenuLabel>
                                                        <Input
                                                            value={columnFilterSearch[columnKey] ?? ""}
                                                            onChange={(event) => onChangeColumnSearch(columnKey, event.target.value)}
                                                            placeholder="Search..."
                                                            className="mb-2 h-8"
                                                        />
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuCheckboxItem
                                                            checked={selectedCount === 0 || selectedCount === (columnFilterOptions.get(columnKey)?.length ?? 0)}
                                                            onCheckedChange={(checked) => onToggleColumnSelectAll(columnKey, checked === true)}
                                                            className="capitalize"
                                                        >
                                                            (Select All)
                                                        </DropdownMenuCheckboxItem>
                                                        {(columnFilterOptions.get(columnKey) ?? [])
                                                            .filter((value) =>
                                                                value.toLowerCase().includes((columnFilterSearch[columnKey] ?? "").toLowerCase()),
                                                            )
                                                            .map((value) => (
                                                                <DropdownMenuCheckboxItem
                                                                    key={`${String(columnKey)}-${value}`}
                                                                    checked={(columnSelectedValues[columnKey] ?? []).includes(value)}
                                                                    onCheckedChange={(checked) =>
                                                                        onToggleColumnFilterValue(columnKey, value, checked === true)
                                                                    }
                                                                >
                                                                    {value}
                                                                </DropdownMenuCheckboxItem>
                                                            ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </TableHead>
                                );
                            })}
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
            </ScrollArea>

            <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
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
                    <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(1)} disabled={currentPage === 1}>처음</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => previousPage && onPageChange(previousPage)} disabled={!previousPage}>이전</Button>
                    {pageNumbers.map((pageNumber) =>
                        <Button
                            key={pageNumber}
                            className={pageNumber === currentPage ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90" : undefined}
                            type="button"
                            variant={pageNumber === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(pageNumber)}
                        >
                            {pageNumber}
                        </Button>,
                    )}
                    <Button type="button" variant="outline" size="sm" onClick={() => nextPage && onPageChange(nextPage)} disabled={!nextPage}>다음</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>마지막</Button>
                </div>
            </div>
        </section>
    );
};

export default DataTable;
