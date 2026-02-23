import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AllCommunityModule, type ColDef, ModuleRegistry, type SelectionChangedEvent } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import type { IDemoGridTableRow } from "@/interfaces/demo/IDemoGridTable.interface.ts";
import DialogGridRowHandler from "@/components/dialog/demo/DialogGridRowHandler.tsx";
import { myTheme } from "@/components/table/demo/demoAgGridTheme.ts";
import Pagination from "@/components/table/Pagination.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
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
    const { t } = useTranslation();
    const [quickFilter, setQuickFilter] = useState("");
    const [selectedCount, setSelectedCount] = useState(0);
    const [selectedRows, setSelectedRows] = useState<IDemoGridTableRow[]>([]);

    const columnDefs = useMemo<ColDef<IDemoGridTableRow>[]>(() => [
        { field: "id", headerName: t("demoGrid.columns.id"), width: 110, checkboxSelection: true, headerCheckboxSelection: true, pinned: "left" },
        { field: "product", headerName: t("demoGrid.columns.product"), flex: 1, minWidth: 180, editable: true },
        { field: "category", headerName: t("demoGrid.columns.category"), width: 140 },
        {
            field: "price",
            headerName: t("demoGrid.columns.price"),
            width: 140,
            editable: true,
            valueFormatter: (params) => `${Number(params.value ?? 0).toLocaleString()}${t("demoGrid.currencyUnit")}`,
        },
        { field: "stock", headerName: t("demoGrid.columns.stock"), width: 110, editable: true },
        { field: "launchDate", headerName: t("demoGrid.columns.launchDate"), width: 160 },
        { field: "status", headerName: t("demoGrid.columns.status"), width: 120, pinned: "right" },
        { field: "discontinued", headerName: t("demoGrid.columns.discontinued"), width: 100 },
    ], [t]);

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
                        <p className="text-sm font-medium">{t("agGrid.quickFilterTitle")}</p>
                        <Input
                            value={quickFilter}
                            onChange={(event) => setQuickFilter(event.target.value)}
                            placeholder={t("agGrid.quickFilterPlaceholder")}
                        />
                    </div>
                    <div className="space-y-2 text-right text-sm text-muted-foreground">
                        <p>{t("agGrid.selectedRows", { count: selectedCount })}</p>
                        <p>{t("agGrid.pinHelp")}</p>
                        <DialogGridRowHandler selectedRows={selectedRows}/>
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
                caption={t("common.totalCount", { count: totalCount })}
            />
        </Card>
    );
};

export default DemoAgGridTable;
