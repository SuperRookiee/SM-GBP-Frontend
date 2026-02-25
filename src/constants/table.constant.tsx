import type { TFunction } from "i18next";
import type { ActionItem } from "@/types/actionItem.type.ts";
import type { DemoDataTableColumn, DemoDataTableFilterOption } from "@/types/demo/demoDataTable.types.ts";
import type { UserColumn, UserFilterOption } from "@/types/user.type.ts";
import ActionMenu from "@/components/common/ActionMenu";
import type { IDemoDataTableRow } from "@/interfaces/demo/IDemoDataTable.interface.ts";
import type { ISampleRow } from "@/interfaces/demo/ISample.interface.ts";

export const DEFAULT_TABLE = {
    pageSize: 10,
    pageWindow: 5,
} as const;

export const SELECT_COL_SIZE = 28;

export const getDemoDataTableFilter = (t: TFunction): DemoDataTableFilterOption[] => [
    { value: "all", label: t("common.all") },
    { value: "id", label: t("table.docNo") },
    { value: "customer", label: t("table.owner") },
    { value: "email", label: t("table.email") },
    { value: "role", label: t("table.role") },
    { value: "status", label: t("table.status") },
];

// #. 데모 테이블의 행 액션 목록을 구성한다.
const getDemoDataTableActions = (t: TFunction) => ({
    columnLabel: "",
    menuLabel: t("table.actions"),
    maxItems: 4,
    actions: [
        { id: "view", label: t("table.detail"), href: (row: IDemoDataTableRow) => `/demo/grid_table/${row.id}` },
        { id: "copy", label: t("table.copyEmail"), onSelect: (row: IDemoDataTableRow) => console.info("copy", row.email) },
        { id: "edit", label: t("table.editOwner"), onSelect: (row: IDemoDataTableRow) => console.info("edit", row.customer) },
        { id: "remove", label: t("table.remove"), destructive: true, onSelect: (row: IDemoDataTableRow) => console.info("remove", row.id) },
    ] satisfies ActionItem<IDemoDataTableRow>[],
});

export const getDemoDataTableColumns = (t: TFunction): DemoDataTableColumn[] => {
    const action = getDemoDataTableActions(t);

    return [
        { key: "id", label: t("table.docNo"), width: 100, cellClassName: "font-medium", filterable: true },
        { key: "customer", label: t("table.owner"), width: 140, filterable: true },
        { key: "email", label: t("table.email"), width: 280, filterable: true },
        { key: "role", label: t("table.role"), width: 120, filterable: true },
        {
            key: "status", label: t("table.status"), width: 100, filterable: true,
            render: row => <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-medium">{row.status}</span>,
        },
        {
            key: "actions", label: "", sortable: false, width: 56, headerClassName: "text-right", cellClassName: "text-right",
            render: row => <ActionMenu row={row} actions={action.actions} maxItems={action.maxItems} label={action.menuLabel} />,
        },
    ];
};

export const getSampleTableFilter = (t: TFunction): DemoDataTableFilterOption<ISampleRow>[] => [
    { value: "all", label: t("common.all") },
    { value: "id", label: "ID" },
    { value: "name", label: t("table.name") },
    { value: "description", label: t("table.description") },
    { value: "category", label: t("table.category") },
    { value: "status", label: t("table.status") },
    { value: "memo", label: t("table.memo") },
];

export const getSampleTableColumns = (t: TFunction): DemoDataTableColumn<ISampleRow>[] => [
    { key: "id", label: "ID", width: 80, cellClassName: "font-medium", filterable: true },
    { key: "name", label: t("table.name"), width: 140, filterable: true },
    { key: "description", label: t("table.description"), width: 200, filterable: true },
    { key: "category", label: t("table.category"), width: 120, filterable: true },
    { key: "status", label: t("table.status"), width: 110, filterable: true },
    { key: "priority", label: t("table.priority"), width: 90, filterable: true },
    { key: "quantity", label: t("table.quantity"), width: 90, filterable: true },
    { key: "price", label: t("table.price"), width: 120, filterable: true },
    { key: "rate", label: t("table.rate"), width: 90, filterable: true },
    { key: "active", label: t("table.active"), width: 80, filterable: true },
    { key: "dueDate", label: t("table.dueDate"), width: 130, filterable: true },
    { key: "memo", label: t("table.memo"), width: 200, filterable: true },
    { key: "createdAt", label: t("table.createdAt"), width: 180, filterable: true },
    { key: "updatedAt", label: t("table.updatedAt"), width: 180, filterable: true },
];

export const getUserTableFilter = (t: TFunction): UserFilterOption[] => [
    { value: "all", label: t("common.all") },
    { value: "id", label: "ID" },
    { value: "name", label: t("table.name") },
    { value: "user_id", label: "User ID" },
    { value: "role", label: t("table.permission") },
];

export const getUserTableColumns = (t: TFunction): UserColumn[] => [
    { key: "id", label: "ID", width: 100, cellClassName: "font-medium", filterable: true },
    { key: "name", label: t("table.name"), width: 160, filterable: true },
    { key: "role", label: t("table.permission"), width: 140, filterable: true },
    { key: "user_id", label: "User ID", width: 180, filterable: true },
];


