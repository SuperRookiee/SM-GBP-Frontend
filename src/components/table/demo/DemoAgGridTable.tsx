import { useMemo, useState } from "react";
import { AllCommunityModule, type ColDef, ModuleRegistry, type SelectionChangedEvent } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import type { IDemoGridTableRow } from "@/interface/demo/IDemoGridTable.interface.ts";
import { myTheme } from "@/components/table/demo/demoAgGridTheme.ts";
import Pagination from "@/components/table/Pagination.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import style from "@/styles/demoGridTable.module.css";

ModuleRegistry.registerModules([AllCommunityModule]);

interface IDemoAgGridTableProps {
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
}

const columnDefs: ColDef<IDemoGridTableRow>[] = [
    { field: "id", headerName: "상품 ID", width: 110, checkboxSelection: true, headerCheckboxSelection: true, pinned: "left" },
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
    { field: "status", headerName: "상태", width: 120, pinned: "right" },
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
}: IDemoAgGridTableProps) => {
    const [quickFilter, setQuickFilter] = useState("");
    const [selectedCount, setSelectedCount] = useState(0);
    const [selectedRows, setSelectedRows] = useState<IDemoGridTableRow[]>([]);

    const filteredRows = useMemo(() => {
        const keyword = quickFilter.trim().toLowerCase();
        if (!keyword) return rows;

        return rows.filter((row) => {
            const searchable = `${row.id} ${row.product} ${row.category} ${row.status} ${row.launchDate}`.toLowerCase();
            return searchable.includes(keyword);
        });
    }, [quickFilter, rows]);

    return (
        <Card className="pb-0">
            <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">AG Grid Quick Filter</p>
                        <Input value={quickFilter} onChange={(event) => setQuickFilter(event.target.value)} placeholder="상품명/카테고리/상태 검색" />
                    </div>
                    <div className="space-y-2 text-right text-sm text-muted-foreground">
                        <p>선택된 행: {selectedCount}개</p>
                        <p>컬럼 헤더 메뉴에서 Pin Column으로 고정 위치를 바꿀 수 있습니다.</p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline">Row Handler</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>선택한 row 정보</DialogTitle>
                                    <DialogDescription>현재 AG Grid에서 선택된 row 데이터를 표시합니다.</DialogDescription>
                                </DialogHeader>

                                {selectedRows.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">선택된 row 데이터가 없습니다.</p>
                                ) : (
                                    <div className="max-h-80 space-y-2 overflow-y-auto rounded-md border p-3 text-left">
                                        {selectedRows.map((row) => (
                                            <pre key={row.id} className="whitespace-pre-wrap text-xs">
                                                {JSON.stringify(row, null, 2)}
                                            </pre>
                                        ))}
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className={`h-90 w-full ${style.demoAgGridTheme}`}>
                    <AgGridReact
                        theme={myTheme}
                        rowData={filteredRows}
                        columnDefs={columnDefs}
                        defaultColDef={{ sortable: true, filter: true, floatingFilter: true, resizable: true }}
                        rowSelection="multiple"
                        animateRows
                        sideBar
                        onSelectionChanged={(event: SelectionChangedEvent<IDemoGridTableRow>) => {
                            const nextSelectedRows = event.api.getSelectedRows();
                            setSelectedCount(nextSelectedRows.length);
                            setSelectedRows(nextSelectedRows);
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
