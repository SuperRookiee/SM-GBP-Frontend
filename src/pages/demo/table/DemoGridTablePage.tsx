import {useCallback, useMemo, useState} from "react";
import {format} from "date-fns";
import {ko} from "date-fns/locale";
import {CalendarIcon, ChevronDown, Search} from "lucide-react";
import {useTranslation} from "react-i18next";
import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {getDemoGridTableSampleDataApi} from "@/apis/demo/demoGridTable.api.ts";
import {GC_TIME, STALE_TIME} from "@/constants/query.constant.ts";
import {DEFAULT_TABLE} from "@/constants/table.constant.tsx";
import {useGridTablePageStore} from "@/stores/page/demo/gridTablePage.store.ts";
import {cn} from "@/utils/utils.ts";
import DemoAgGridTable from "@/components/table/demo/DemoAgGridTable.tsx";
import DemoToastGridTable from "@/components/table/demo/DemoToastGridTable.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Calendar} from "@/components/ui/calendar.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import style from "@/styles/demoGridTable.module.css";
import type {DemoGridCategory, DemoGridStatus, IDemoGridTableRow} from "@/interfaces/demo/IDemoGridTable.interface.ts";

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

// #. 행 데이터에 표시용 클래스명을 합성
const withRowClassName = (rows: IDemoGridTableRow[]) =>
    rows.map((row) => ({
        ...row,
        _attributes: {
            className: {
                row: row.stock <= 3 ? ["row-low-stock"] : row.discontinued === "Y" ? ["row-discontinued"] : [],
            },
        },
    }));

const DatePickerField = ({ label, value, onChange, emptyText }: {
    label: string;
    value?: string;
    onChange: (value?: string) => void;
    emptyText: string;
}) => (
    <div className="flex flex-col gap-2">
        <Label>{label}</Label>
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !value && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 size-4"/>
                    {value ? format(new Date(value), "yyyy-MM-dd", { locale: ko }) : emptyText}
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

const MultiCheckboxField = <T extends string, >({
    label,
    options,
    selected,
    onToggle,
    labelRenderer,
}: {
    label: string;
    options: T[];
    selected: T[];
    onToggle: (next: T[]) => void;
    labelRenderer: (option: T) => string;
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
                        <Label htmlFor={`${label}-${option}`} className="font-normal">{labelRenderer(option)}</Label>
                    </div>
                );
            })}
        </div>
    </div>
);

const DemoGridTablePage = () => {
    const { t } = useTranslation();
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

    const categoryLabelMap: Record<DemoGridCategory, string> = {
        "전자기기": t("demoGrid.category.electronics"),
        "생활용품": t("demoGrid.category.household"),
        "패션": t("demoGrid.category.fashion"),
        "사무용품": t("demoGrid.category.office"),
    };

    const statusLabelMap: Record<DemoGridStatus, string> = {
        "판매중": t("demoGrid.status.onSale"),
        "품절": t("demoGrid.status.soldOut"),
        "품절임박": t("demoGrid.status.almostSoldOut"),
    };

    const [frozenEnabled, setFrozenEnabled] = useState(true);
    const [eventMessage, setEventMessage] = useState(t("demoGrid.event.default"));
    const [columnVisible, setColumnVisible] = useState<Record<string, boolean>>(defaultColumnVisibility);
    const [emptyMode, setEmptyMode] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(DEFAULT_TABLE.pageSize);
    const [activeTab, setActiveTab] = useState("toast-ui");
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);

    const { data, isLoading, isFetching, isError, refetch } = useQuery({
        queryKey: ["demoGridTable", { applied, sorters }],
        queryFn: () => getDemoGridTableSampleDataApi({ ...applied, sorters }),
        placeholderData: keepPreviousData,
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
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

    const resolvedCategories = applied.categories.map((item) => categoryLabelMap[item]).join(", ") || t("common.all");
    const resolvedStatuses = applied.statuses.map((item) => statusLabelMap[item]).join(", ") || t("common.all");

    return (
        <div className={`space-y-4 ${style.demoGridPlayground}`}>
            <Collapsible open={isFilterPanelOpen} onOpenChange={setIsFilterPanelOpen}>
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <CardTitle>{t("demoGrid.title")}</CardTitle>
                                <CardDescription>{t("demoGrid.description")}</CardDescription>
                            </div>
                            <CollapsibleTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <ChevronDown className={cn("size-4 transition-transform", isFilterPanelOpen && "rotate-180")}/>
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="grid-search">{t("demoGrid.searchLabel")}</Label>
                                    <Input
                                        id="grid-search"
                                        value={draft.keyword}
                                        onChange={(event) => setDraftKeyword(event.target.value)}
                                        placeholder={t("demoGrid.searchPlaceholder")}
                                    />
                                </div>

                                <DatePickerField
                                    label={t("demoGrid.launchDateFrom")}
                                    value={draft.dateFrom}
                                    onChange={setDraftDateFrom}
                                    emptyText={t("demoGrid.datePlaceholder")}
                                />
                                <DatePickerField
                                    label={t("demoGrid.launchDateTo")}
                                    value={draft.dateTo}
                                    onChange={setDraftDateTo}
                                    emptyText={t("demoGrid.datePlaceholder")}
                                />

                                <div className="flex items-end gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            applyFilters();
                                            setPage(1);
                                            setEmptyMode(false);
                                            setEventMessage(t("demoGrid.event.searchApplied"));
                                        }}
                                    >
                                        <Search className="size-4"/>{t("common.search")}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <MultiCheckboxField
                                    label={t("demoGrid.categoryLabel")}
                                    options={CATEGORY_OPTIONS}
                                    selected={draft.categories}
                                    onToggle={setDraftCategories}
                                    labelRenderer={(option) => categoryLabelMap[option]}
                                />
                                <MultiCheckboxField
                                    label={t("demoGrid.statusLabel")}
                                    options={STATUS_OPTIONS}
                                    selected={draft.statuses}
                                    onToggle={setDraftStatuses}
                                    labelRenderer={(option) => statusLabelMap[option]}
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-4 border-t pt-4">
                                <div className="inline-flex items-center gap-2">
                                    <Checkbox id="includeDiscontinued" checked={draft.includeDiscontinued} onCheckedChange={(checked) => setDraftIncludeDiscontinued(checked === true)}/>
                                    <Label htmlFor="includeDiscontinued">{t("demoGrid.includeDiscontinued")}</Label>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSorters([{ key: "price", direction: "asc" }, { key: "stock", direction: "desc" }]);
                                        setPage(1);
                                        setEmptyMode(false);
                                        setEventMessage(t("demoGrid.event.multiSortDone"));
                                        refetch();
                                    }}
                                >
                                    {t("demoGrid.multiSort")}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setEmptyMode(true);
                                        setEventMessage(t("demoGrid.event.emptyChecked"));
                                    }}
                                >
                                    {t("demoGrid.emptyState")}
                                </Button>

                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        resetFilters();
                                        setPage(1);
                                        setPageSize(DEFAULT_TABLE.pageSize);
                                        setFrozenEnabled(true);
                                        setSorters([]);
                                        setEmptyMode(false);
                                        setColumnVisible(defaultColumnVisibility);
                                        setEventMessage(t("demoGrid.event.resetDone"));
                                        refetch();
                                    }}
                                >
                                    {t("demoGrid.reset")}
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                {t("demoGrid.appliedSummary", {
                                    keyword: applied.keyword || "-",
                                    from: applied.dateFrom || "-",
                                    to: applied.dateTo || "-",
                                    categories: resolvedCategories,
                                    statuses: resolvedStatuses,
                                })}
                            </p>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
                <TabsList>
                    <TabsTrigger value="toast-ui">{t("demoGrid.tabs.toast")}</TabsTrigger>
                    <TabsTrigger value="ag-grid">{t("demoGrid.tabs.ag")}</TabsTrigger>
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
                        categoryLabelMap={categoryLabelMap}
                        statusLabelMap={statusLabelMap}
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

