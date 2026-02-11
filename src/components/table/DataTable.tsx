import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";
import { DEFAULT_TABLE, SELECT_COL_SIZE } from "@/constants/table.constants.tsx";
import type { DemoDataTableColumn, DemoDataTableFilterOption } from "@/types/demoDataTable.types";
import TablePagination from "@/components/table/Pagination.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface IGridTableClientProps<T> {
    // 필수 데이터 및 제목 설정
    title: string;                             // 테이블 제목
    rows: T[];                                 // 테이블에 표시할 데이터 배열
    total: number;                             // 전체 데이터 개수
    columns: DemoDataTableColumn<T>[];         // 컬럼 설정 배열
    // 페이지네이션 관련
    page: number;                              // 현재 페이지 번호
    pageSize: number;                          // 한 페이지당 표시할 행 수
    pageSizeOptions?: number[];                // 페이지 크기 선택 옵션 목록
    // 검색 및 필터링 상태
    query: string;                             // 검색어 문자열
    filterKey: "all" | keyof T;                // 현재 선택된 검색 필터 키
    filterOptions: DemoDataTableFilterOption<T>[]; // 상단 검색 조건 옵션
    // 정렬 관련 상태
    sortKey: keyof T | null;                   // 현재 정렬 기준 컬럼 키
    sortDirection: "asc" | "desc";             // 정렬 방향 (오름차순/내림차순)
    // 이벤트 핸들러 (부모 컴포넌트 통신)
    onPageChange: (page: number) => void;      // 페이지 변경 핸들러
    onQueryChange: (query: string) => void;    // 검색어 변경 핸들러
    onSortChange: (key: keyof T) => void;      // 정렬 변경 핸들러
    onFilterChange: (filterKey: "all" | keyof T) => void; // 검색 필터 변경 핸들러
    onPageSizeChange?: (pageSize: number) => void; // 페이지 크기 변경 핸들러
    // 선택(Checkbox) 기능 관련
    enableSelect?: boolean;                    // 체크박스 선택 기능 활성화 여부
    selectedRowIds?: Array<string | number>;   // 외부에서 제어되는 선택된 행 ID 목록
    onSelectedRowIdsChange?: (selectedRowIds: Array<string | number>) => void; // 선택 행 변경 핸들러
    // UI 레이아웃 및 라벨 설정
    description?: string;                      // 테이블 설명
    isLoading?: boolean;                       // 로딩 상태 여부
    searchLabel?: string;                      // 검색창 라벨 텍스트
    searchPlaceholder?: string;                // 검색창 플레이스홀더
    filterLabel?: string;                      // 필터 선택창 라벨 텍스트
    tableHeightClassName?: string;             // 테이블 높이 조절 CSS 클래스
    // 렌더링 및 유틸리티
    getRowId?: (row: T) => string | number;    // 각 행의 고유 ID를 가져오는 함수
    captionRenderer?: (total: number) => ReactNode; // 총 건수 표시 렌더러
}

const getColumnWidthStyle = (width?: string | number) => {
    if (width === undefined) return undefined;
    const computedWidth = typeof width === "number" ? `${width}px` : width;
    return { width: computedWidth, minWidth: computedWidth, maxWidth: computedWidth };
};

const DataTable = <T, >({
                            rows, total, pageSize, title, description, columns, filterOptions,
                            query, filterKey, sortKey, sortDirection, page,
                            onQueryChange, onFilterChange, onSortChange, onPageChange, onPageSizeChange,
                            isLoading = false,
                            searchLabel = "검색",
                            searchPlaceholder = "검색어를 입력하세요",
                            filterLabel = "검색 조건",
                            getRowId = (row) => (row as { id: string | number }).id,
                            captionRenderer = (count) => `총 ${count} 건`,
                            enableSelect = false,
                            selectedRowIds = [],
                            onSelectedRowIdsChange,
                            tableHeightClassName = "h-105",
                            pageSizeOptions = [5, 10, 25, 50, 100],
                        }: IGridTableClientProps<T>) => {
    const [draftQuery, setDraftQuery] = useState(query);
    const [draftFilterKey, setDraftFilterKey] = useState<"all" | keyof T>(filterKey);
    const [columnFilterSearch, setColumnFilterSearch] = useState<Partial<Record<keyof T, string>>>({});
    const [columnSelectedValues, setColumnSelectedValues] = useState<Partial<Record<keyof T, string[]>>>({});
    const [internalSelectedRowIds, setInternalSelectedRowIds] = useState<Array<string | number>>([]);
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    // #. 페이지 유효성 검사 및 보정 로직
    useEffect(() => {
        if (isLoading) return;
        if (total <= 0) return;
        if (page !== currentPage) onPageChange(currentPage);
    }, [currentPage, isLoading, onPageChange, page, total]);

    // #. 외부 query 값이 바뀔 때 내부 입력값 동기화
    useEffect(() => setDraftQuery(query), [query]);
    // #. 외부 filterKey 값이 바뀔 때 내부 필터값 동기화
    useEffect(() => setDraftFilterKey(filterKey), [filterKey]);

    // #. 행 데이터에서 특정 키의 값을 문자열로 추출하는 함수
    const getColumnRawValue = (row: T, key: keyof T) => {
        const value = row[key];
        if (value === undefined || value === null) return "";
        return String(value);
    };

    // #. 컬럼 설정 중 필터링이 가능한 컬럼들만 추출
    const filterableColumns = useMemo(
        () => columns.filter((column) => column.filterable).map((column) => column.key as keyof T),
        [columns],
    );

    // #. 각 컬럼별로 필터 목록에 표시할 고유 값들을 추출
    const columnFilterOptions = useMemo(() => {
        const map = new Map<keyof T, string[]>();

        filterableColumns.forEach((key) => {
            const distinctValues = Array.from(new Set(rows.map((row) => getColumnRawValue(row, key)).filter(Boolean)));
            map.set(key, distinctValues);
        });

        return map;
    }, [filterableColumns, rows]);

    // #. 컬럼별 개별 필터링 조건에 따라 행 데이터를 필터링
    const filteredRows = useMemo(() => {
        return rows.filter((row) =>
            columns.every((column) => {
                if (!column.filterable) return true;

                const key = column.key as keyof T;
                const selectedValues = columnSelectedValues[key];
                if (selectedValues === undefined) return true;
                if (selectedValues.length === 0) return false;

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

    // #. 상단 검색 버튼 클릭 시 검색 조건과 검색어를 부모로 전달
    const onClickSearch = () => {
        onFilterChange(draftFilterKey);
        onQueryChange(draftQuery);
        onPageChange(1);
    };

    // #. 헤더 체크박스 클릭 시 전체 행 선택/해제 처리
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

    // #. 개별 행의 체크박스 클릭 시 선택 상태 토글
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

    // #. 컬럼별 필터 내의 검색어 입력 처리
    const onChangeColumnSearch = (key: keyof T, value: string) => {
        setColumnFilterSearch((prev) => ({ ...prev, [key]: value }));
    };

    // #. 컬럼별 필터 목록에서 특정 항목 선택/해제
    const onToggleColumnFilterValue = (key: keyof T, value: string, checked: boolean) => {
        setColumnSelectedValues((prev) => {
            const allValues = columnFilterOptions.get(key) ?? [];
            const current = prev[key] ?? allValues;
            const next = checked
                ? [...new Set([...current, value])]
                : current.filter((item) => item !== value);

            return { ...prev, [key]: next };
        });
        onPageChange(1);
    };

    // #. 특정 컬럼의 필터 항목 전체 선택/해제
    const onToggleColumnSelectAll = (key: keyof T, checked: boolean) => {
        setColumnSelectedValues((prev) => {
            const allValues = columnFilterOptions.get(key) ?? [];
            return { ...prev, [key]: checked ? allValues : [] };
        });
        onPageChange(1);
    };

    // #. 페이지당 표시할 행 수 변경 시 호출

    return (
        <Card className="mx-auto w-full min-w-0 shadow-sm max-w-112.5
                        sm:max-w-160 md:max-w-3xl lg:max-w-5xl xl:max-w-308.75">
            <CardHeader className="flex justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
                    <div className="w-full sm:w-40">
                        <label className="text-xs font-medium text-muted-foreground">{filterLabel}</label>
                        <Select value={String(draftFilterKey)}
                                onValueChange={(value) => setDraftFilterKey(value as "all" | keyof T)}>
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="검색 조건 선택"/>
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
                                <Search className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="w-full min-w-0 rounded-md border">
                    <ScrollArea className={`w-full ${tableHeightClassName}`}>
                        <Table className="min-w-full w-max table-fixed">
                            <TableHeader className="sticky top-0 z-20 bg-card">
                                <TableRow className="bg-card hover:bg-card">
                                    {enableSelect &&
                                        <TableHead
                                            className="border-r border-border/40 p-0"
                                            style={{
                                                width: `${SELECT_COL_SIZE}px`,
                                                minWidth: `${SELECT_COL_SIZE}px`,
                                                maxWidth: `${SELECT_COL_SIZE}px`
                                            }}
                                        >
                                            <div className="flex h-full w-full items-center justify-center p-1">
                                                <Checkbox
                                                    checked={isAllRowsSelected ? true : isSomeRowsSelected ? "indeterminate" : false}
                                                    onCheckedChange={onToggleSelectAll}
                                                    aria-label="전체 선택"
                                                />
                                            </div>
                                        </TableHead>
                                    }
                                    {columns.map((column, index) => {
                                        const isSortable = column.sortable ?? true;
                                        const columnKey = column.key as keyof T;
                                        const selectedValues = columnSelectedValues[columnKey];
                                        const totalFilterOptionCount = (columnFilterOptions.get(columnKey) ?? []).length;
                                        const effectiveSelectedValues = selectedValues ?? (columnFilterOptions.get(columnKey) ?? []);
                                        const selectedCount = effectiveSelectedValues.length;
                                        const isFilterActive = totalFilterOptionCount > 0
                                            && selectedCount < totalFilterOptionCount;

                                        return (
                                            <TableHead key={String(column.key)}
                                                       style={getColumnWidthStyle(column.width)}
                                                       className={`bg-card ${column.headerClassName ?? ""} ${index === columns.length - 1 ? "" : "border-r border-border/40"}`}>
                                                <div className="flex min-w-0 items-center gap-1 pr-2">
                                                    {isSortable ? (
                                                        <Button
                                                            className="h-auto min-w-0 max-w-full truncate justify-start px-0 py-0 text-left text-muted-foreground hover:text-foreground"
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => onSortChange(columnKey)}
                                                        >
                                                            {column.label}
                                                            {sortIndicator(columnKey)}
                                                        </Button>
                                                    ) : (
                                                        <span
                                                            className="truncate text-sm text-muted-foreground">{column.label}</span>
                                                    )}

                                                    {column.filterable && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className={`relative h-7 w-7 ${isFilterActive ? "text-primary hover:text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                                                    aria-label={`${column.label} 필터 열기`}
                                                                >
                                                                    <Filter className="h-3.5 w-3.5"/>
                                                                    {isFilterActive && <span
                                                                        className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary"/>}
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-56 p-2 overflow-x-auto"
                                                                                 align="start">
                                                                <DropdownMenuLabel
                                                                    className="px-1 py-1 text-xs text-muted-foreground">
                                                                    {column.label} 필터
                                                                </DropdownMenuLabel>
                                                                <Input
                                                                    value={columnFilterSearch[columnKey] ?? ""}
                                                                    onChange={(event) => onChangeColumnSearch(columnKey, event.target.value)}
                                                                    placeholder="Search..."
                                                                    className="mb-2 h-8"
                                                                />
                                                                <DropdownMenuSeparator/>
                                                                <ScrollArea className="h-60 w-full">
                                                                    <div className="min-w-max pr-2">
                                                                        <DropdownMenuCheckboxItem
                                                                            checked={selectedCount === totalFilterOptionCount
                                                                                ? true
                                                                                : selectedCount === 0
                                                                                    ? false
                                                                                    : "indeterminate"}
                                                                            onSelect={(event) => event.preventDefault()}
                                                                            onCheckedChange={(checked) => onToggleColumnSelectAll(columnKey, checked === true)}
                                                                            className="capitalize whitespace-nowrap"
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
                                                                                    checked={effectiveSelectedValues.includes(value)}
                                                                                    onSelect={(event) => event.preventDefault()}
                                                                                    onCheckedChange={(checked) =>
                                                                                        onToggleColumnFilterValue(columnKey, value, checked === true)
                                                                                    }
                                                                                    className="whitespace-nowrap"
                                                                                >
                                                                                    {value}
                                                                                </DropdownMenuCheckboxItem>
                                                                            ))}
                                                                    </div>
                                                                </ScrollArea>
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
                                                <TableCell className="w-2 border-r border-border/40">
                                                    <Skeleton className="h-4 w-4"/>
                                                </TableCell>
                                            )}
                                            {columns.map((column, columnIndex) =>
                                                <TableCell
                                                    key={`${key}-${String(column.key)}`}
                                                    style={getColumnWidthStyle(column.width)}
                                                    className={`${columnIndex === columns.length - 1 ? "" : "border-r border-border/40"}`.trim()}
                                                >
                                                    <Skeleton className="h-4 w-24"/>
                                                </TableCell>,
                                            )}
                                        </TableRow>,
                                    )
                                    : filteredRows.map((row) => {
                                        const rowId = getRowId(row);
                                        return (
                                            <TableRow key={rowId}>
                                                {enableSelect && (
                                                    <TableCell
                                                        className="border-r border-border/40 p-0"
                                                        style={{
                                                            width: `${SELECT_COL_SIZE}px`,
                                                            minWidth: `${SELECT_COL_SIZE}px`,
                                                            maxWidth: `${SELECT_COL_SIZE}px`,
                                                        }}
                                                    >
                                                        <div
                                                            className="flex h-full w-full items-center justify-center p-1">
                                                            <Checkbox
                                                                checked={selectedRowIdSet.has(rowId)}
                                                                onCheckedChange={(checked) => onToggleSelectRow(rowId, checked)}
                                                                aria-label={`행 선택 ${String(rowId)}`}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                )}
                                                {columns.map((column) =>
                                                        <TableCell
                                                            key={`${rowId}-${String(column.key)}`}
                                                            style={getColumnWidthStyle(column.width)}
                                                            className={`
                                                            ${column.cellClassName ?? ""}
                                                            overflow-hidden
                                                            text-ellipsis
                                                            whitespace-nowrap
                                                            ${columns[columns.length - 1]?.key === column.key ? "" : "border-r border-border/40"}
                                                        `}
                                                        >
                                                            <div className="truncate">
                                                                {column.render ? column.render(row) : String(row[column.key as keyof T])}
                                                            </div>
                                                        </TableCell>
                                                    ,
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
                </div>
            </CardContent>

            <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageNumbers={pageNumbers}
                previousPage={previousPage}
                nextPage={nextPage}
                totalCount={total}
                caption={captionRenderer(total)}
                isLoading={isLoading}
                pageSize={pageSize}
                pageSizeOptions={pageSizeOptions}
                onPageSizeChange={onPageSizeChange}
                onPageChange={onPageChange}
            />
        </Card>
    );
};

export default DataTable;