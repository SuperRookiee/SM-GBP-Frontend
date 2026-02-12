import { useMemo, useState } from "react";
import { AllCommunityModule, ModuleRegistry, type ColDef, type SelectionChangedEvent } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import type { IDemoGridTableRow } from "@/interface/demo/IDemoGridTable.interface.ts";
import Pagination from "@/components/table/Pagination.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";

ModuleRegistry.registerModules([AllCommunityModule]);

type Props = {
  rows: IDemoGridTableRow[];
  isLoading: boolean;
  isFetching: boolean;
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  previousPage: number | null;
  nextPage: number | null;
  totalCount: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onPageChange: (page: number) => void;
};

const columnDefs: ColDef<IDemoGridTableRow>[] = [
  { field: "id", headerName: "상품 ID", width: 110, checkboxSelection: true, headerCheckboxSelection: true },
  { field: "product", headerName: "상품명", flex: 1, minWidth: 180, editable: true },
  { field: "category", headerName: "카테고리", width: 140 },
  {
    field: "price",
    headerName: "가격",
    width: 140,
    editable: true,
    valueFormatter: (params) => `${Number(params.value ?? 0).toLocaleString()}원`,
  },
  { field: "stock", headerName: "재고", width: 110, editable: true },
  { field: "launchDate", headerName: "출시일", width: 160 },
  { field: "status", headerName: "상태", width: 120 },
  { field: "discontinued", headerName: "단종", width: 100 },
];

const DemoAgGridTable = ({
  rows,
  isLoading,
  isFetching,
  currentPage,
  totalPages,
  pageNumbers,
  previousPage,
  nextPage,
  totalCount,
  pageSize,
  onPageSizeChange,
  onPageChange,
}: Props) => {
  const [quickFilter, setQuickFilter] = useState("");
  const [selectedCount, setSelectedCount] = useState(0);

  const filteredRows = useMemo(() => {
    const keyword = quickFilter.trim().toLowerCase();
    if (!keyword) return rows;

    return rows.filter((row) => {
      const searchable = `${row.id} ${row.product} ${row.category} ${row.status} ${row.launchDate}`.toLowerCase();
      return searchable.includes(keyword);
    });
  }, [quickFilter, rows]);

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-1">
            <p className="text-sm font-medium">AG Grid Quick Filter</p>
            <Input value={quickFilter} onChange={(event) => setQuickFilter(event.target.value)} placeholder="상품명/카테고리/상태 검색" />
          </div>
          <p className="text-sm text-muted-foreground">선택된 행: {selectedCount}개</p>
        </div>

        <div className="ag-theme-quartz h-[520px] w-full">
          <AgGridReact
            rowData={filteredRows}
            columnDefs={columnDefs}
            defaultColDef={{ sortable: true, filter: true, floatingFilter: true, resizable: true }}
            rowSelection="multiple"
            animateRows
            sideBar
            onSelectionChanged={(event: SelectionChangedEvent<IDemoGridTableRow>) => {
              setSelectedCount(event.api.getSelectedRows().length);
            }}
          />
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

export default DemoAgGridTable;
