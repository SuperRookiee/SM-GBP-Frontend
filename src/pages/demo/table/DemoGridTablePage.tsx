import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import Grid from "tui-grid";
import { useQuery } from "@tanstack/react-query";
import "tui-grid/dist/tui-grid.css";
import { getDemoGridTableSampleDataApi } from "@/apis/demoGridTable.api.ts";
import { useGridTablePageStore } from "@/stores/page/gridTablePage.store.ts";
import { cn } from "@/utils/utils.ts";
import type { IDemoGridTableRow } from "@/interface/IDemoGridTable.interface.ts";
import { Button } from "@/components/ui/button.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";

const STATUS_OPTIONS = ["판매중", "품절", "품절임박"] as const;
const CATEGORY_OPTIONS = ["전자기기", "생활용품", "패션", "사무용품"] as const;

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

const DatePickerField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (value?: string) => void;
}) => (
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

const DemoGridTablePage = () => {
  const gridWrapperRef = useRef<HTMLDivElement | null>(null);
  const gridInstanceRef = useRef<Grid | null>(null);

  const keyword = useGridTablePageStore((state) => state.keyword);
  const dateFrom = useGridTablePageStore((state) => state.dateFrom);
  const dateTo = useGridTablePageStore((state) => state.dateTo);
  const includeDiscontinued = useGridTablePageStore((state) => state.includeDiscontinued);
  const sorters = useGridTablePageStore((state) => state.sorters);
  const setKeyword = useGridTablePageStore((state) => state.setKeyword);
  const setDateFrom = useGridTablePageStore((state) => state.setDateFrom);
  const setDateTo = useGridTablePageStore((state) => state.setDateTo);
  const setIncludeDiscontinued = useGridTablePageStore((state) => state.setIncludeDiscontinued);
  const setSorters = useGridTablePageStore((state) => state.setSorters);
  const resetFilters = useGridTablePageStore((state) => state.resetFilters);

  const [rows, setRows] = useState<IDemoGridTableRow[]>([]);
  const [frozenEnabled, setFrozenEnabled] = useState(true);
  const [eventMessage, setEventMessage] = useState("이벤트 로그가 여기에 표시됩니다.");
  const [columnVisible, setColumnVisible] = useState<Record<string, boolean>>(defaultColumnVisibility);
  const [emptyMode, setEmptyMode] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);

  const { isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["demoGridTable", { keyword, dateFrom, dateTo, includeDiscontinued, sorters }],
    queryFn: () => getDemoGridTableSampleDataApi({ keyword, dateFrom, dateTo, includeDiscontinued, sorters }),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
    onSuccess: (nextRows) => setRows(nextRows),
  });

  const gridRows = useMemo(() => withRowClassName(emptyMode ? [] : rows), [rows, emptyMode]);

  const applyGridData = useCallback((nextRows: IDemoGridTableRow[]) => {
    if (!gridInstanceRef.current) return;
    gridInstanceRef.current.resetData(nextRows);
  }, []);

  const handleToggleColumn = useCallback((columnName: string, visible: boolean) => {
    const grid = gridInstanceRef.current;
    if (!grid) return;

    if (visible) grid.showColumn(columnName);
    else grid.hideColumn(columnName);

    setColumnVisible((prev) => ({ ...prev, [columnName]: visible }));
  }, []);

  const handleFrozenToggle = useCallback((enabled: boolean) => {
    const grid = gridInstanceRef.current;
    if (!grid) return;
    grid.setFrozenColumnCount(enabled ? 2 : 0);
    setFrozenEnabled(enabled);
  }, []);

  const handleAddRow = useCallback(() => {
    const nextId = rows.length ? Math.max(...rows.map((row) => row.id)) + 1 : 1;
    const newRow: IDemoGridTableRow = {
      id: nextId,
      product: "신규 상품",
      category: "전자기기",
      price: 10000,
      stock: 1,
      status: "판매중",
      launchDate: "2024-06-01",
      discontinued: "N",
    };

    const nextRows = [...rows, newRow];
    setRows(nextRows);
    applyGridData(withRowClassName(nextRows));
    setEventMessage(`행 추가: id=${nextId}`);
  }, [applyGridData, rows]);

  const handleDeleteRows = useCallback(() => {
    const grid = gridInstanceRef.current;
    if (!grid) return;

    const checkedRowKeys = grid.getCheckedRowKeys();
    if (checkedRowKeys.length === 0) {
      const focused = grid.getFocusedCell();
      if (typeof focused?.rowKey === "number") checkedRowKeys.push(focused.rowKey);
    }

    if (checkedRowKeys.length === 0) {
      setEventMessage("삭제할 행이 없습니다. 체크박스 또는 포커스를 선택해주세요.");
      return;
    }

    const nextRows = rows.filter((_, index) => !checkedRowKeys.includes(index));
    setRows(nextRows);
    applyGridData(withRowClassName(nextRows));
    setEventMessage(`행 삭제: ${checkedRowKeys.length}건`);
  }, [applyGridData, rows]);

  useEffect(() => {
    if (!gridWrapperRef.current) return;

    const grid = new Grid({
      el: gridWrapperRef.current,
      data: gridRows,
      columns: [
        { header: "상품 ID", name: "id", align: "center", width: 100, sortable: true, validation: { required: true, dataType: "number", min: 1 } },
        {
          header: "상품명",
          name: "product",
          minWidth: 180,
          sortable: true,
          editor: "text",
          filter: { type: "text", showApplyBtn: true, showClearBtn: true },
          validation: { required: true },
        },
        {
          header: "카테고리",
          name: "category",
          align: "center",
          width: 140,
          sortable: true,
          editor: { type: "select", options: { listItems: CATEGORY_OPTIONS.map((value) => ({ text: value, value })) } },
          filter: { type: "select", showApplyBtn: true, showClearBtn: true, listItems: CATEGORY_OPTIONS.map((value) => ({ text: value, value })) },
        },
        {
          header: "가격",
          name: "price",
          align: "right",
          width: 140,
          sortable: true,
          editor: "text",
          validation: { required: true, dataType: "number", min: 1000, max: 999999 },
          formatter: ({ value }: { value: unknown }) => `${Number(value).toLocaleString()}원`,
        },
        { header: "재고", name: "stock", align: "right", width: 100, sortable: true, editor: "text", validation: { required: true, dataType: "number", min: 0, max: 1000 } },
        {
          header: "출시일",
          name: "launchDate",
          align: "center",
          width: 160,
          sortable: true,
          editor: { type: "datePicker", options: { format: "yyyy-MM-dd", timepicker: false } },
        },
        {
          header: "상태",
          name: "status",
          align: "center",
          width: 140,
          sortable: true,
          editor: { type: "select", options: { listItems: STATUS_OPTIONS.map((value) => ({ text: value, value })) } },
          filter: { type: "select", showApplyBtn: true, showClearBtn: true, listItems: STATUS_OPTIONS.map((value) => ({ text: value, value })) },
        },
        {
          header: "단종",
          name: "discontinued",
          align: "center",
          width: 100,
          editor: { type: "checkbox", options: { listItems: [{ text: "Y", value: "Y" }, { text: "N", value: "N" }] } },
          formatter: ({ value }: { value: unknown }) => (value === "Y" ? "✅" : "-"),
        },
      ],
      bodyHeight: 420,
      rowHeaders: ["rowNum", "checkbox"],
      scrollX: true,
      scrollY: true,
      columnOptions: { resizable: true, frozenCount: 2 },
      pageOptions: { perPage: 8, useClient: true },
    });

    grid.on("click", (event) => {
      const ev = event as { rowKey?: number | string; columnName?: string };
      setEventMessage(`onClick: rowKey=${String(ev.rowKey)} / column=${ev.columnName ?? "-"}`);
    });

    grid.on("afterChange", () => {
      const currentData = grid.getData() as IDemoGridTableRow[];
      setRows(
        currentData.map((row) => ({
          ...row,
          id: Number(row.id),
          price: Number(row.price),
          stock: Number(row.stock),
        })),
      );
    });

    gridInstanceRef.current = grid;

    return () => {
      grid.destroy();
      gridInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    applyGridData(gridRows);
  }, [applyGridData, gridRows]);

  return (
    <div className="flex min-h-full min-w-0 items-center justify-center overflow-hidden">
      <div className="demo-grid-playground mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-4 overflow-hidden p-2">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Demo GridTable</p>
          <h1 className="text-3xl font-semibold tracking-tight">TOAST UI Grid Feature Playground</h1>
          <p className="text-sm text-muted-foreground">Shadcn UI 기반 컨트롤 패널 + API 시뮬레이션으로 동작합니다.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Control Panel</CardTitle>
            <CardDescription>멀티 정렬, Empty 상태, Loading 상태를 버튼으로 확인할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="grid-search">전체 검색</Label>
                <Input
                  id="grid-search"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="상품명/카테고리/상태 검색"
                />
              </div>

              <DatePickerField label="출시일 시작" value={dateFrom} onChange={setDateFrom} />
              <DatePickerField label="출시일 종료" value={dateTo} onChange={setDateTo} />

              <div className="flex items-end gap-2">
                <Button type="button" onClick={handleAddRow}>행 추가</Button>
                <Button type="button" variant="outline" onClick={handleDeleteRows}>선택 행 삭제</Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t pt-4">
              <div className="inline-flex items-center gap-2">
                <Checkbox id="frozenColumn" checked={frozenEnabled} onCheckedChange={(checked) => handleFrozenToggle(checked === true)} />
                <Label htmlFor="frozenColumn">Frozen Column(앞 2개)</Label>
              </div>
              <div className="inline-flex items-center gap-2">
                <Checkbox
                  id="includeDiscontinued"
                  checked={includeDiscontinued}
                  onCheckedChange={(checked) => setIncludeDiscontinued(checked === true)}
                />
                <Label htmlFor="includeDiscontinued">단종 포함</Label>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setSorters([
                    { key: "price", direction: "asc" },
                    { key: "stock", direction: "desc" },
                  ]);
                  setEventMessage("멀티 정렬 실행: price ASC + stock DESC");
                  setEmptyMode(false);
                }}
              >
                멀티 정렬 실행
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setEmptyMode(true);
                  setEventMessage("Empty data 상태 확인 완료");
                }}
              >
                Empty 상태
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const grid = gridInstanceRef.current;
                  if (!grid) return;
                  setManualLoading(true);
                  grid.showLoading();
                  setEventMessage("Loading 상태 표시 중...");
                  window.setTimeout(() => {
                    grid.hideLoading();
                    setManualLoading(false);
                    applyGridData(gridRows);
                    setEventMessage("Loading 상태 해제 확인 완료");
                  }, 900);
                }}
              >
                Loading 상태
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  resetFilters();
                  setFrozenEnabled(true);
                  setColumnVisible(defaultColumnVisibility);
                  setSorters([]);
                  setEmptyMode(false);
                  refetch();
                  setEventMessage("필터/정렬/상태 초기화 완료");
                }}
              >
                초기화
              </Button>
            </div>

            <div className="border-t pt-4">
              <p className="mb-2 text-sm font-medium">컬럼 표시/숨김</p>
              <div className="flex flex-wrap gap-4">
                {Object.keys(columnVisible).map((column) => (
                  <div key={column} className="inline-flex items-center gap-2">
                    <Checkbox
                      id={`column-${column}`}
                      checked={columnVisible[column]}
                      onCheckedChange={(checked) => handleToggleColumn(column, checked === true)}
                    />
                    <Label htmlFor={`column-${column}`}>{column}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 text-sm text-muted-foreground">
              이벤트 로그: {eventMessage}
              {(isLoading || isFetching || manualLoading) && " · 데이터 로딩 중"}
              {isError && " · 데이터 조회 실패"}
            </div>
            <div ref={gridWrapperRef} />
          </CardContent>
        </Card>

        <style>
          {`
            .demo-grid-playground .tui-grid-body-area tr:hover td {
              background: rgba(96, 165, 250, 0.12) !important;
            }
            .demo-grid-playground .tui-grid-row.row-low-stock td {
              background: rgba(251, 191, 36, 0.12);
            }
            .demo-grid-playground .tui-grid-row.row-discontinued td {
              color: #9ca3af;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default DemoGridTablePage;
