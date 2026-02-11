import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, Search } from "lucide-react";
import Grid from "tui-grid";
import { useQuery } from "@tanstack/react-query";
import "tui-grid/dist/tui-grid.css";
import { getDemoGridTableSampleDataApi } from "@/apis/demo/demoGridTable.api.ts";
import { DEFAULT_TABLE } from "@/constants/table.constants.tsx";
import { useGridTablePageStore } from "@/stores/page/demo/gridTablePage.store.ts";
import { cn } from "@/utils/utils.ts";
import type { DemoGridCategory, DemoGridStatus, IDemoGridTableRow } from "@/interface/demo/IDemoGridTable.interface.ts";
import Pagination from "@/components/table/Pagination.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
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

const MultiCheckboxField = <T extends string>({
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
  const gridWrapperRef = useRef<HTMLDivElement | null>(null);
  const gridInstanceRef = useRef<Grid | null>(null);
  const loadingTimeoutRef = useRef<number | null>(null);

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
  const [manualLoading, setManualLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_TABLE.pageSize);

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
  const pageNumbers = useMemo(() =>
    Array.from({ length: pageWindowEnd - pageWindowStart + 1 }, (_, index) => pageWindowStart + index),
  [pageWindowEnd, pageWindowStart]);

  const gridRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return withRowClassName(resolvedRows.slice(start, start + pageSize));
  }, [currentPage, pageSize, resolvedRows]);


  const applyGridData = useCallback((nextRows: IDemoGridTableRow[]) => {
    if (!gridInstanceRef.current) return;
    gridInstanceRef.current.resetData(nextRows);
  }, []);

  const clearManualLoading = useCallback(() => {
    if (loadingTimeoutRef.current !== null) {
      window.clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    setManualLoading(false);
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

  useEffect(() => {
    let grid: Grid | null = null;
    let frameId: number;

    const initGrid = () => {
      const el = gridWrapperRef.current;
      if (!el) return;

      // height가 아직 0이면 다음 프레임까지 대기
      if (el.clientHeight === 0) {
        frameId = requestAnimationFrame(initGrid);
        return;
      }

      grid = new Grid({
        el,
        data: gridRows,
        columns: [
          { header: "상품 ID", name: "id", align: "center", width: 100, sortable: true, validation: { required: true, dataType: "number", min: 1 } },
          { header: "상품명", name: "product", minWidth: 180, sortable: true, editor: "text", filter: { type: "text", showApplyBtn: true, showClearBtn: true }, validation: { required: true } },
          {
            header: "카테고리",
            name: "category",
            align: "center",
            width: 140,
            sortable: true,
            editor: { type: "select", options: { listItems: CATEGORY_OPTIONS.map((value) => ({ text: value, value })) } },
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
          { header: "출시일", name: "launchDate", align: "center", width: 160, sortable: true, editor: { type: "datePicker", options: { format: "yyyy-MM-dd", timepicker: false } } },
          {
            header: "상태",
            name: "status",
            align: "center",
            width: 140,
            sortable: true,
            editor: { type: "select", options: { listItems: STATUS_OPTIONS.map((value) => ({ text: value, value })) } },
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
      });

      grid.on("click", (event) => {
        const ev = event as { rowKey?: number | string; columnName?: string };
        setEventMessage(`onClick: rowKey=${String(ev.rowKey)} / column=${ev.columnName ?? "-"}`);
      });

      grid.on("afterChange", () => {
        setEventMessage("셀 편집 완료");
      });

      gridInstanceRef.current = grid;
    };

    frameId = requestAnimationFrame(initGrid);

    return () => {
      cancelAnimationFrame(frameId);

      if (loadingTimeoutRef.current !== null) {
        window.clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }

      grid?.destroy();
      gridInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    applyGridData(gridRows);
  }, [applyGridData, gridRows]);

  return (
    <div className="flex min-h-full min-w-0 items-center justify-center overflow-hidden">
      <div className={`${style.demoGridPlayground} mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-4 overflow-hidden p-2`}>
        <header className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Demo GridTable</p>
          <h1 className="text-3xl font-semibold tracking-tight">TOAST UI Grid Feature Playground</h1>
          <p className="text-sm text-muted-foreground">돋보기 버튼을 눌렀을 때만 필터가 적용됩니다.</p>
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
                <Input id="grid-search" value={draft.keyword} onChange={(event) => setDraftKeyword(event.target.value)}
                       placeholder="상품명/카테고리/상태 검색"/>
              </div>

              <DatePickerField label="출시일 시작" value={draft.dateFrom} onChange={setDraftDateFrom}/>
              <DatePickerField label="출시일 종료" value={draft.dateTo} onChange={setDraftDateTo}/>

              <div className="flex items-end gap-2">
                <Button type="button" onClick={() => {
                  applyFilters();
                  setPage(1);
                  setEmptyMode(false);
                  setEventMessage("검색 조건 반영 완료");
                }}>
                  <Search className="size-4"/>
                  검색
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <MultiCheckboxField label="카테고리" options={CATEGORY_OPTIONS} selected={draft.categories}
                                  onToggle={setDraftCategories}/>
              <MultiCheckboxField label="상태" options={STATUS_OPTIONS} selected={draft.statuses}
                                  onToggle={setDraftStatuses}/>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t pt-4">
              <div className="inline-flex items-center gap-2">
                <Checkbox id="frozenColumn" checked={frozenEnabled}
                          onCheckedChange={(checked) => handleFrozenToggle(checked === true)}/>
                <Label htmlFor="frozenColumn">Frozen Column(앞 2개)</Label>
              </div>
              <div className="inline-flex items-center gap-2">
                <Checkbox id="includeDiscontinued" checked={draft.includeDiscontinued}
                          onCheckedChange={(checked) => setDraftIncludeDiscontinued(checked === true)}/>
                <Label htmlFor="includeDiscontinued">단종 포함</Label>
              </div>

              <Button variant="outline" onClick={() => {
                setSorters([{ key: "price", direction: "asc" }, { key: "stock", direction: "desc" }]);
                setPage(1);
                setEventMessage("멀티 정렬 실행: price ASC + stock DESC");
                setEmptyMode(false);
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

              <Button variant="outline" onClick={() => {
                const grid = gridInstanceRef.current;
                if (!grid) return;
                clearManualLoading();
                setManualLoading(true);
                setEventMessage("Loading 상태 표시 중...");
                loadingTimeoutRef.current = window.setTimeout(() => {
                  loadingTimeoutRef.current = null;
                  setManualLoading(false);
                  applyGridData(gridRows);
                  setEventMessage("Loading 상태 해제 확인 완료");
                }, 900);
              }}>
                Loading 상태
              </Button>

              <Button variant="secondary" onClick={() => {
                const grid = gridInstanceRef.current;
                clearManualLoading();
                resetFilters();
                setPage(1);
                setPageSize(DEFAULT_TABLE.pageSize);
                setFrozenEnabled(true);
                setSorters([]);
                setEmptyMode(false);
                setColumnVisible(defaultColumnVisibility);
                Object.keys(defaultColumnVisibility).forEach((column) => grid?.showColumn(column));
                refetch();
                setEventMessage("필터/정렬/상태 초기화 완료");
              }}>
                초기화
              </Button>
            </div>

            <div className="border-t pt-4">
              <p className="mb-2 text-sm font-medium">컬럼 표시/숨김</p>
              <div className="flex flex-wrap gap-4">
                {Object.keys(columnVisible).map((column) => (
                    <div key={column} className="inline-flex items-center gap-2">
                      <Checkbox id={`column-${column}`} checked={columnVisible[column]}
                                onCheckedChange={(checked) => handleToggleColumn(column, checked === true)}/>
                      <Label htmlFor={`column-${column}`}>{column}</Label>
                    </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              적용된 조건: 검색어({applied.keyword || "-"}) / 기간({applied.dateFrom || "-"} ~ {applied.dateTo || "-"}) /
              카테고리({applied.categories.join(", ") || "전체"}) / 상태({applied.statuses.join(", ") || "전체"})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="h-100">
              <div className="text-sm text-muted-foreground">
                이벤트 로그: {eventMessage}
                {(isLoading || isFetching || manualLoading) && " · 데이터 로딩 중"}
                {isError && " · 데이터 조회 실패"}
              </div>
              <div ref={gridWrapperRef} className="h-full"/>
            </div>
          </CardContent>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageNumbers={pageNumbers}
            previousPage={previousPage}
            nextPage={nextPage}
            totalCount={total}
            isLoading={isLoading || isFetching}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onPageChange={setPage}
            caption={`총 ${total} 건`}
          />
        </Card>
      </div>
    </div>
  );
};

export default DemoGridTablePage;
