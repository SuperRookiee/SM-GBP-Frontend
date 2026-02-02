"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GRID_CONSTANTS from "@/constants/grid.constants";
import type { GridRow } from "@/interface/grid.interface";
import { useGridStore } from "@/stores/gridStore";

interface AGGridTableProps {
  initialData: GridRow[];
}

const AGGridTable = ({ initialData }: AGGridTableProps) => {
  const storedData = useGridStore((state) => state.data);
  const data = storedData.length > 0 ? storedData : initialData;
  const query = useGridStore((state) => state.query);
  const filterKey = useGridStore((state) => state.filterKey);
  const page = useGridStore((state) => state.page);
  const setData = useGridStore((state) => state.setData);
  const setQuery = useGridStore((state) => state.setQuery);
  const setFilterKey = useGridStore((state) => state.setFilterKey);
  const setPage = useGridStore((state) => state.setPage);

  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [displayedRowCount, setDisplayedRowCount] = useState(0);

  useEffect(() => {
    if (storedData.length === 0) {
      setData(initialData);
    }
  }, [initialData, setData, storedData.length]);

  const columnDefs = useMemo<ColDef<GridRow>[]>(
    () => [
      { field: "id", headerName: "문서 번호", minWidth: 140 },
      { field: "customer", headerName: "담당자", minWidth: 140 },
      { field: "email", headerName: "이메일", minWidth: 220 },
      { field: "role", headerName: "역할", minWidth: 140 },
      {
        field: "status",
        headerName: "상태",
        minWidth: 140,
        cellRenderer: (params: { value: string }) => (
          <span className="inline-flex items-center rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:text-zinc-200">
            {params.value}
          </span>
        ),
      },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
    }),
    [],
  );

  const totalPages = Math.max(
    Math.ceil(displayedRowCount / GRID_CONSTANTS.pageSize),
    1,
  );
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    if (!gridApi) return;

    if (!query.trim()) {
      gridApi.setGridOption("quickFilterText", "");
      gridApi.setFilterModel(null);
      gridApi.onFilterChanged();
      setDisplayedRowCount(gridApi.getDisplayedRowCount());
      return;
    }

    if (filterKey === "all") {
      gridApi.setFilterModel(null);
      gridApi.setGridOption("quickFilterText", query);
    } else {
      gridApi.setGridOption("quickFilterText", "");
      gridApi.setFilterModel({
        [filterKey]: {
          filterType: "text",
          type: "contains",
          filter: query,
        },
      });
    }

    gridApi.onFilterChanged();
    setDisplayedRowCount(gridApi.getDisplayedRowCount());
  }, [filterKey, gridApi, query]);

  useEffect(() => {
    if (!gridApi) return;

    const updateDisplayedRowCount = () => {
      setDisplayedRowCount(gridApi.getDisplayedRowCount());
    };

    // rowData 변경/필터/정렬/모델 갱신 등, 표시 row count가 바뀌는 시점들
    gridApi.addEventListener("modelUpdated", updateDisplayedRowCount);
    gridApi.addEventListener("filterChanged", updateDisplayedRowCount);
    gridApi.addEventListener("sortChanged", updateDisplayedRowCount);
    gridApi.addEventListener("paginationChanged", updateDisplayedRowCount);

    // 초기값도 필요하면 "동기 호출" 대신 스케줄링 (lint 통과)
    queueMicrotask(updateDisplayedRowCount);
    // 또는: requestAnimationFrame(updateDisplayedRowCount);
    // 또는: setTimeout(updateDisplayedRowCount, 0);

    return () => {
      gridApi.removeEventListener("modelUpdated", updateDisplayedRowCount);
      gridApi.removeEventListener("filterChanged", updateDisplayedRowCount);
      gridApi.removeEventListener("sortChanged", updateDisplayedRowCount);
      gridApi.removeEventListener("paginationChanged", updateDisplayedRowCount);
    };
  }, [gridApi]);


  useEffect(() => {
    if (!gridApi) {
      return;
    }

    gridApi.paginationGoToPage(currentPage - 1);
  }, [currentPage, gridApi]);

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page, setPage]);

  const previousPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  const pageWindowStart =
    Math.floor((currentPage - 1) / GRID_CONSTANTS.pageWindow) *
      GRID_CONSTANTS.pageWindow +
    1;
  const pageWindowEnd = Math.min(
    totalPages,
    pageWindowStart + GRID_CONSTANTS.pageWindow - 1,
  );
  const pageNumbers = Array.from(
    { length: pageWindowEnd - pageWindowStart + 1 },
    (_, index) => pageWindowStart + index,
  );

  const handleGridReady = (event: GridReadyEvent) => {
    setGridApi(event.api);
    setDisplayedRowCount(event.api.getDisplayedRowCount());
  };

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            거래 내역 목록
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            검색 조건은 저장되어 새로고침 후에도 유지됩니다.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
          <div className="w-full sm:w-40">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              검색 조건
            </label>
            <Select
              value={filterKey}
              onValueChange={(value) =>
                setFilterKey(value as "all" | keyof GridRow)
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="검색 조건 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="id">문서 번호</SelectItem>
                <SelectItem value="customer">담당자</SelectItem>
                <SelectItem value="email">이메일</SelectItem>
                <SelectItem value="role">역할</SelectItem>
                <SelectItem value="status">상태</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-72">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              검색
            </label>
            <Input
              className="mt-2"
              placeholder="검색어를 입력하세요"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="ag-theme-quartz h-[480px] w-full">
        <AgGridReact<GridRow>
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination
          paginationPageSize={GRID_CONSTANTS.pageSize}
          suppressPaginationPanel
          onGridReady={handleGridReady}
          onFilterChanged={() =>
            setDisplayedRowCount(gridApi?.getDisplayedRowCount() ?? 0)
          }
        />
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-zinc-200 pt-4 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage(1)}
            disabled={currentPage === 1}
          >
            처음
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => previousPage && setPage(previousPage)}
            disabled={!previousPage}
          >
            이전
          </Button>

          {pageNumbers.map((pageNumber) => (
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
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => nextPage && setPage(nextPage)}
            disabled={!nextPage}
          >
            다음
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            마지막
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AGGridTable;
