import { useCallback, useEffect, useRef } from "react";
import Grid from "tui-grid";
import "tui-grid/dist/tui-grid.css";
import type { DemoGridCategory, DemoGridStatus, IDemoGridTableRow } from "@/interface/demo/IDemoGridTable.interface.ts";
import Pagination from "@/components/table/Pagination.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Label } from "@/components/ui/label.tsx";

type Props = {
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
}: Props) => {
    const gridWrapperRef = useRef<HTMLDivElement | null>(null);
    const gridInstanceRef = useRef<Grid | null>(null);

    const applyGridData = useCallback((nextRows: IDemoGridTableRow[]) => {
        gridInstanceRef.current?.resetData(nextRows);
    }, []);

    useEffect(() => {
        let grid: Grid | null = null;
        let frameId: number;

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
                    { header: "상품 ID", name: "id", align: "center", width: 100, sortable: true, filter: "text" },
                    { header: "상품명", name: "product", minWidth: 180, sortable: true, filter: "text", editor: "text" },
                    {
                        header: "카테고리",
                        name: "category",
                        align: "center",
                        width: 140,
                        sortable: true,
                        filter: "select",
                        editor: { type: "select", options: { listItems: categoryOptions.map((value) => ({ text: value, value })) } },
                    },
                    {
                        header: "가격",
                        name: "price",
                        align: "right",
                        width: 140,
                        sortable: true,
                        editor: "text",
                        formatter: ({ value }: { value: unknown }) => `${Number(value).toLocaleString()}원`,
                    },
                    { header: "재고", name: "stock", align: "right", width: 100, sortable: true, filter: "number", editor: "text" },
                    { header: "출시일", name: "launchDate", align: "center", width: 160, sortable: true, filter: "date" },
                    {
                        header: "상태",
                        name: "status",
                        align: "center",
                        width: 140,
                        sortable: true,
                        filter: "select",
                        editor: { type: "select", options: { listItems: statusOptions.map((value) => ({ text: value, value })) } },
                    },
                    { header: "단종", name: "discontinued", align: "center", width: 100, sortable: true },
                ],
                columnOptions: { resizable: true },
                rowHeaders: ["rowNum", "checkbox"],
                bodyHeight: "fitToParent",
                copyOptions: { useFormattedValue: true },
                summary: {
                    height: 40,
                    position: "bottom",
                    columnContent: {
                        product: { template: () => "합계" },
                        price: { template: (valueMap: { sum: number }) => `₩${Number(valueMap.sum).toLocaleString()}` },
                        stock: { template: (valueMap: { sum: number }) => `재고 ${valueMap.sum}` },
                    },
                },
            });

            grid.setFrozenColumnCount(frozenEnabled ? 2 : 0);
            grid.on("click", (event) => {
                const typedEvent = event as { rowKey: number; columnName: string };
                setEventMessage(`Toast UI 셀 클릭: rowKey=${typedEvent.rowKey}, column=${typedEvent.columnName}`);
            });
            grid.on("afterChange", () => setEventMessage("Toast UI 편집 완료"));
            gridInstanceRef.current = grid;
        };

        initGrid();

        return () => {
            if (frameId) cancelAnimationFrame(frameId);
            grid?.destroy();
            gridInstanceRef.current = null;
        };
    }, [categoryOptions, frozenEnabled, rows, setEventMessage, statusOptions]);

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
                        <Label htmlFor="frozenColumn">Frozen Column(앞 2개)</Label>
                    </div>
                </div>

                <div>
                    <p className="mb-2 text-sm font-medium">컬럼 표시/숨김</p>
                    <div className="flex flex-wrap gap-4">
                        {Object.keys(columnVisible).map((column) => (
                            <div key={column} className="inline-flex items-center gap-2">
                                <Checkbox id={`column-${column}`} checked={columnVisible[column]} onCheckedChange={(checked) => onToggleColumn(column, checked === true)} />
                                <Label htmlFor={`column-${column}`}>{column}</Label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-90">
                    <div className="text-sm text-muted-foreground">
                        이벤트 로그: {eventMessage}
                        {(isLoading || isFetching) && " · 데이터 로딩 중"}
                        {isError && " · 데이터 조회 실패"}
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
                caption={`총 ${totalCount} 건`}
            />
        </Card>
    );
};

export default DemoToastGridTable;
