import {useCallback, useEffect, useRef} from "react";
import {useTranslation} from "react-i18next";
import Grid from "tui-grid";
import "tui-grid/dist/tui-grid.css";
import Pagination from "@/components/table/Pagination.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Label} from "@/components/ui/label.tsx";
import type {DemoGridCategory, DemoGridStatus, IDemoGridTableRow} from "@/interfaces/demo/IDemoGridTable.interface.ts";

interface Props {
  rows: IDemoGridTableRow[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  eventMessage: string;
  setEventMessage: (message: string) => void;
  columnVisible: Record<string, boolean>;
  onToggleColumn: (columnName: string, visible: boolean) => void;
  frozenEnabled: boolean;
  onToggleFrozen: (enabled: boolean) => void;
  visible: boolean;
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  previousPage: number | null;
  nextPage: number | null;
  totalCount: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onPageChange: (page: number) => void;
  categoryOptions: DemoGridCategory[];
  statusOptions: DemoGridStatus[];
  categoryLabelMap: Record<DemoGridCategory, string>;
  statusLabelMap: Record<DemoGridStatus, string>;
};

const DemoToastGridTable = ({
    rows,
    isLoading,
    isFetching,
    isError,
    eventMessage,
    setEventMessage,
    columnVisible,
    onToggleColumn,
    frozenEnabled,
    onToggleFrozen,
    visible,
    currentPage,
    totalPages,
    pageNumbers,
    previousPage,
    nextPage,
    totalCount,
    pageSize,
    onPageSizeChange,
    onPageChange,
    categoryOptions,
    statusOptions,
    categoryLabelMap,
    statusLabelMap,
}: Props) => {
    const { t } = useTranslation();
    const gridWrapperRef = useRef<HTMLDivElement | null>(null);
    const gridInstanceRef = useRef<Grid | null>(null);
    const getColumnLabel = useCallback((column: string) => {
        const keyMap: Record<string, string> = {
            id: "demoGrid.columns.id",
            product: "demoGrid.columns.product",
            category: "demoGrid.columns.category",
            price: "demoGrid.columns.price",
            stock: "demoGrid.columns.stock",
            launchDate: "demoGrid.columns.launchDate",
            status: "demoGrid.columns.status",
            discontinued: "demoGrid.columns.discontinued",
        };

        return keyMap[column] ? t(keyMap[column]) : column;
    }, [t]);

    const applyGridData = useCallback((nextRows: IDemoGridTableRow[]) => {
        gridInstanceRef.current?.resetData(nextRows);
    }, []);

    useEffect(() => {
        let grid: Grid | null = null;
        let frameId: number;

// #. 토스트 그리드 인스턴스를 초기화
        const initGrid = () => {
            const el = gridWrapperRef.current;
            if (!el) return;

            if (el.clientHeight === 0) {
                frameId = requestAnimationFrame(initGrid);
                return;
            }

            grid = new Grid({
                el,
                data: rows,
                columns: [
                    { header: t("demoGrid.columns.id"), name: "id", align: "center", width: 100, sortable: true, filter: "text" },
                    { header: t("demoGrid.columns.product"), name: "product", minWidth: 180, sortable: true, filter: "text", editor: "text" },
                    {
                        header: t("demoGrid.columns.category"),
                        name: "category",
                        align: "center",
                        width: 140,
                        sortable: true,
                        filter: "select",
                        editor: { type: "select", options: { listItems: categoryOptions.map((value) => ({ text: categoryLabelMap[value], value })) } },
                    },
                    {
                        header: t("demoGrid.columns.price"),
                        name: "price",
                        align: "right",
                        width: 140,
                        sortable: true,
                        editor: "text",
                        formatter: ({ value }: { value: unknown }) => `${Number(value).toLocaleString()}${t("demoGrid.currencyUnit")}`,
                    },
                    { header: t("demoGrid.columns.stock"), name: "stock", align: "right", width: 100, sortable: true, filter: "number", editor: "text" },
                    { header: t("demoGrid.columns.launchDate"), name: "launchDate", align: "center", width: 160, sortable: true, filter: "date" },
                    {
                        header: t("demoGrid.columns.status"),
                        name: "status",
                        align: "center",
                        width: 140,
                        sortable: true,
                        filter: "select",
                        editor: { type: "select", options: { listItems: statusOptions.map((value) => ({ text: statusLabelMap[value], value })) } },
                    },
                    { header: t("demoGrid.columns.discontinued"), name: "discontinued", align: "center", width: 100, sortable: true },
                ],
                columnOptions: { resizable: true },
                rowHeaders: ["rowNum", "checkbox"],
                bodyHeight: "fitToParent",
                copyOptions: { useFormattedValue: true },
                summary: {
                    height: 40,
                    position: "bottom",
                    columnContent: {
                        product: { template: () => t("toastGrid.summaryTotal") },
                        price: { template: (valueMap: { sum: number }) => `₩${Number(valueMap.sum).toLocaleString()}` },
                        stock: { template: (valueMap: { sum: number }) => t("toastGrid.summaryStock", { sum: valueMap.sum }) },
                    },
                },
            });

            grid.setFrozenColumnCount(frozenEnabled ? 2 : 0);
            grid.on("click", (event) => {
                const typedEvent = event as { rowKey: number; columnName: string };
                setEventMessage(t("toastGrid.cellClick", { rowKey: typedEvent.rowKey, column: typedEvent.columnName }));
            });
            grid.on("afterChange", () => setEventMessage(t("toastGrid.editDone")));
            gridInstanceRef.current = grid;
        };

        initGrid();

        return () => {
            if (frameId) cancelAnimationFrame(frameId);
            grid?.destroy();
            gridInstanceRef.current = null;
        };
    }, [categoryLabelMap, categoryOptions, frozenEnabled, rows, setEventMessage, statusLabelMap, statusOptions, t]);

    useEffect(() => {
        applyGridData(rows);
    }, [applyGridData, rows]);

    useEffect(() => {
        if (!visible) return;

        const rafId = window.requestAnimationFrame(() => {
            (gridInstanceRef.current as Grid & { refreshLayout?: () => void } | null)?.refreshLayout?.();
        });

        return () => window.cancelAnimationFrame(rafId);
    }, [visible]);

    return (
        <Card className="pb-0">
            <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="inline-flex items-center gap-2">
                        <Checkbox id="frozenColumn" checked={frozenEnabled} onCheckedChange={(checked) => onToggleFrozen(checked === true)} />
                        <Label htmlFor="frozenColumn">{t("toastGrid.frozenColumn")}</Label>
                    </div>
                </div>

                <div>
                    <p className="mb-2 text-sm font-medium">{t("toastGrid.columnVisibility")}</p>
                    <div className="flex flex-wrap gap-4">
                        {Object.keys(columnVisible).map((column) => (
                            <div key={column} className="inline-flex items-center gap-2">
                                <Checkbox id={`column-${column}`} checked={columnVisible[column]} onCheckedChange={(checked) => onToggleColumn(column, checked === true)} />
                                <Label htmlFor={`column-${column}`}>{getColumnLabel(column)}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-90">
                    <div className="text-sm text-muted-foreground">
                        {t("toastGrid.eventLog")}: {eventMessage}
                        {(isLoading || isFetching) && ` · ${t("toastGrid.loading")}`}
                        {isError && ` · ${t("toastGrid.error")}`}
                    </div>
                    <div ref={gridWrapperRef} className="h-full" />
                </div>
            </CardContent>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageNumbers={pageNumbers}
                previousPage={previousPage}
                nextPage={nextPage}
                totalCount={totalCount}
                isLoading={isLoading || isFetching}
                pageSize={pageSize}
                onPageSizeChange={onPageSizeChange}
                onPageChange={onPageChange}
                caption={t("common.totalCount", { count: totalCount })}
            />
        </Card>
    );
};

export default DemoToastGridTable;


