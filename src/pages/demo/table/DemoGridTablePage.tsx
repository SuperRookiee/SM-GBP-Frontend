import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, ChevronDown, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDemoGridTableSampleDataApi } from "@/apis/demo/demoGridTable.api.ts";
import { DEFAULT_TABLE } from "@/constants/table.constants.tsx";
import { useGridTablePageStore } from "@/stores/page/demo/gridTablePage.store.ts";
import { cn } from "@/utils/utils.ts";
import type { DemoGridCategory, DemoGridStatus, IDemoGridTableRow } from "@/interface/demo/IDemoGridTable.interface.ts";
import DemoAgGridTable from "@/components/table/demo/DemoAgGridTable.tsx";
import DemoToastGridTable from "@/components/table/demo/DemoToastGridTable.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import style from "@/styles/demoGridTable.module.css";

const STATUS_OPTIONS: DemoGridStatus[] = ["판매중", "품절", "품절임박"];
const CATEGORY_OPTIONS: DemoGridCategory[] = ["전자기기", "생활용품", "패션", "사무용품"];

const defaultColumnVisibility: Record<string, boolean> = {
    id: true,
    product: true,
    category: true,
    price: true,
    stock: true,
    status: true,
    launchDate: true,
    discontinued: true,
};

const withRowClassName = (rows: IDemoGridTableRow[]) =>
    rows.map((row) => ({
        ...row,
        _attributes: {
            className: {
                row: row.stock <= 3 ? ["row-low-stock"] : row.discontinued === "Y" ? ["row-discontinued"] : [],
            },
        },
    }));

const formatDate = (value?: string) => {
    if (!value) return "날짜 선택";
    return format(new Date(value), "yyyy-MM-dd", { locale: ko });
};

const DatePickerField = ({ label, value, onChange }: { label: string; value?: string; onChange: (value?: string) => void }) => (
    <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !value && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 size-4" />
                    {formatDate(value)}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value ? new Date(value) : undefined}
                    onSelect={(selectedDate) => onChange(selectedDate ? format(selectedDate, "yyyy-MM-dd") : "")}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    </div>
);

const MultiCheckboxField = <T extends string,>({
    label,
    options,
    selected,
    onToggle,
}: {
  label: string;
  options: T[];
  selected: T[];
  onToggle: (next: T[]) => void;
}) => (
        <div className="flex flex-col gap-2">
            <Label>{label}</Label>
            <div className="flex flex-wrap gap-3 rounded-md border p-2">
                {options.map((option) => {
                    const checked = selected.includes(option);

                    return (
                        <div key={option} className="inline-flex items-center gap-2">
                            <Checkbox
                                id={`${label}-${option}`}
                                checked={checked}
                                onCheckedChange={(state) => {
                                    if (state === true) onToggle([...selected, option]);
                                    else onToggle(selected.filter((item) => item !== option));
                                }}
                            />
                            <Label htmlFor={`${label}-${option}`} className="font-normal">{option}</Label>
                        </div>
                    );
                })}
            </div>
        </div>
    );

const DemoGridTablePage = () => {
    const draft = useGridTablePageStore((state) => state.draft);
    const applied = useGridTablePageStore((state) => state.applied);
    const sorters = useGridTablePageStore((state) => state.sorters);
    const setDraftKeyword = useGridTablePageStore((state) => state.setDraftKeyword);
    const setDraftDateFrom = useGridTablePageStore((state) => state.setDraftDateFrom);
    const setDraftDateTo = useGridTablePageStore((state) => state.setDraftDateTo);
    const setDraftIncludeDiscontinued = useGridTablePageStore((state) => state.setDraftIncludeDiscontinued);
    const setDraftCategories = useGridTablePageStore((state) => state.setDraftCategories);
    const setDraftStatuses = useGridTablePageStore((state) => state.setDraftStatuses);
    const setSorters = useGridTablePageStore((state) => state.setSorters);
    const applyFilters = useGridTablePageStore((state) => state.applyFilters);
    const resetFilters = useGridTablePageStore((state) => state.resetFilters);

    const [frozenEnabled, setFrozenEnabled] = useState(true);
    const [eventMessage, setEventMessage] = useState("이벤트 로그가 여기에 표시됩니다.");
    const [columnVisible, setColumnVisible] = useState<Record<string, boolean>>(defaultColumnVisibility);
    const [emptyMode, setEmptyMode] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(DEFAULT_TABLE.pageSize);
    const [activeTab, setActiveTab] = useState("toast-ui");
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);

    const { data, isLoading, isFetching, isError, refetch } = useQuery({
        queryKey: ["demoGridTable", { applied, sorters }],
        queryFn: () => getDemoGridTableSampleDataApi({ ...applied, sorters }),
        staleTime: 20_000,
        refetchOnWindowFocus: false,
    });

    const resolvedRows = useMemo(() => (emptyMode ? [] : (data ?? [])), [data, emptyMode]);
    const total = resolvedRows.length;
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const previousPage = currentPage > 1 ? currentPage - 1 : null;
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;
    const pageWindowStart = Math.max(1, currentPage - Math.floor(DEFAULT_TABLE.pageWindow / 2));
    const pageWindowEnd = Math.min(totalPages, pageWindowStart + DEFAULT_TABLE.pageWindow - 1);
    const pageNumbers = useMemo(() => Array.from({ length: pageWindowEnd - pageWindowStart + 1 }, (_, index) => pageWindowStart + index), [pageWindowEnd, pageWindowStart]);

    const gridRows = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return withRowClassName(resolvedRows.slice(start, start + pageSize));
    }, [currentPage, pageSize, resolvedRows]);

    const handleToggleColumn = useCallback((columnName: string, visible: boolean) => {
        setColumnVisible((prev) => ({ ...prev, [columnName]: visible }));
    }, []);

    return (
        <div className={`space-y-4 ${style.demoGridPlayground}`}>
            <Collapsible open={isFilterPanelOpen} onOpenChange={setIsFilterPanelOpen}>
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <CardTitle>Grid Table</CardTitle>
                                <CardDescription>같은 store를 공유하면서 Toast UI / AG Grid를 비교합니다.</CardDescription>
                            </div>
                            <CollapsibleTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <ChevronDown className={cn("size-4 transition-transform", isFilterPanelOpen && "rotate-180")} />
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="grid-search">전체 검색</Label>
                                    <Input id="grid-search" value={draft.keyword} onChange={(event) => setDraftKeyword(event.target.value)} placeholder="상품명/카테고리/상태 검색" />
                                </div>

                                <DatePickerField label="출시일 시작" value={draft.dateFrom} onChange={setDraftDateFrom} />
                                <DatePickerField label="출시일 종료" value={draft.dateTo} onChange={setDraftDateTo} />

                                <div className="flex items-end gap-2">
                                    <Button type="button" onClick={() => {
                                        applyFilters();
                                        setPage(1);
                                        setEmptyMode(false);
                                        setEventMessage("검색 조건 반영 완료");
                                    }}>
                                        <Search className="size-4" />검색
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <MultiCheckboxField label="카테고리" options={CATEGORY_OPTIONS} selected={draft.categories} onToggle={setDraftCategories} />
                                <MultiCheckboxField label="상태" options={STATUS_OPTIONS} selected={draft.statuses} onToggle={setDraftStatuses} />
                            </div>

                            <div className="flex flex-wrap items-center gap-4 border-t pt-4">
                                <div className="inline-flex items-center gap-2">
                                    <Checkbox id="includeDiscontinued" checked={draft.includeDiscontinued} onCheckedChange={(checked) => setDraftIncludeDiscontinued(checked === true)} />
                                    <Label htmlFor="includeDiscontinued">단종 포함</Label>
                                </div>

                                <Button variant="outline" onClick={() => {
                                    setSorters([{ key: "price", direction: "asc" }, { key: "stock", direction: "desc" }]);
                                    setPage(1);
                                    setEmptyMode(false);
                                    setEventMessage("멀티 정렬 실행: price ASC + stock DESC");
                                    refetch();
                                }}>
              멀티 정렬 실행
                                </Button>

                                <Button variant="outline" onClick={() => {
                                    setEmptyMode(true);
                                    setEventMessage("Empty data 상태 확인 완료");
                                }}>
              Empty 상태
                                </Button>

                                <Button variant="secondary" onClick={() => {
                                    resetFilters();
                                    setPage(1);
                                    setPageSize(DEFAULT_TABLE.pageSize);
                                    setFrozenEnabled(true);
                                    setSorters([]);
                                    setEmptyMode(false);
                                    setColumnVisible(defaultColumnVisibility);
                                    setEventMessage("필터/정렬/상태 초기화 완료");
                                    refetch();
                                }}>
              초기화
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground">
              적용된 조건: 검색어({applied.keyword || "-"}) / 기간({applied.dateFrom || "-"} ~ {applied.dateTo || "-"}) /
              카테고리({applied.categories.join(", ") || "전체"}) / 상태({applied.statuses.join(", ") || "전체"})
                            </p>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
                <TabsList>
                    <TabsTrigger value="toast-ui">Toast UI</TabsTrigger>
                    <TabsTrigger value="ag-grid">AG Grid</TabsTrigger>
                </TabsList>

                <TabsContent value="toast-ui" forceMount className={cn("space-y-4", activeTab !== "toast-ui" && "hidden")}>
                    <DemoToastGridTable
                        rows={gridRows}
                        isLoading={isLoading}
                        isFetching={isFetching}
                        isError={isError}
                        eventMessage={eventMessage}
                        setEventMessage={setEventMessage}
                        columnVisible={columnVisible}
                        onToggleColumn={handleToggleColumn}
                        frozenEnabled={frozenEnabled}
                        onToggleFrozen={setFrozenEnabled}
                        visible={activeTab === "toast-ui"}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        pageNumbers={pageNumbers}
                        previousPage={previousPage}
                        nextPage={nextPage}
                        totalCount={total}
                        pageSize={pageSize}
                        onPageSizeChange={setPageSize}
                        onPageChange={setPage}
                        categoryOptions={CATEGORY_OPTIONS}
                        statusOptions={STATUS_OPTIONS}
                    />
                </TabsContent>

                <TabsContent value="ag-grid" forceMount className={cn("space-y-4", activeTab !== "ag-grid" && "hidden")}>
                    <DemoAgGridTable
                        rows={gridRows}
                        isLoading={isLoading}
                        isFetching={isFetching}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        pageNumbers={pageNumbers}
                        previousPage={previousPage}
                        nextPage={nextPage}
                        totalCount={total}
                        pageSize={pageSize}
                        onPageSizeChange={setPageSize}
                        onPageChange={setPage}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default DemoGridTablePage;
