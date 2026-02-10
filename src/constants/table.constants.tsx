import type { IDemoDataTableRow } from "@/interface/IDemoDataTable.interface.ts";
import type { ActionItem } from "@/types/ActionItem.type.ts";
import type { DemoDataTableColumn, DemoDataTableFilterOption } from "@/types/demoDataTable.types.ts";
import type { UserColumn, UserFilterOption } from "@/types/user.types.ts";
import ActionMenu from "@/components/common/ActionMenu";

export const DEFAULT_TABLE = {
    pageSize: 5,
    pageWindow: 5,
} as const;

/** Demo Data Table **/
export const DEMO_DATA_TABLE_FILTER: DemoDataTableFilterOption[] = [
    { value: "all", label: "전체" },
    { value: "id", label: "문서 번호" },
    { value: "customer", label: "담당자" },
    { value: "email", label: "이메일" },
    { value: "role", label: "역할" },
    { value: "status", label: "상태" },
];

export const DEMO_DATA_TABLE_ACTION = {
    columnLabel: "",
    menuLabel: "Actions",
    maxItems: 4,
    actions: [
        {
            id: "view",
            label: "상세 보기",
            href: (row: IDemoDataTableRow) => `/demo/data_table/${row.id}`,
        },
        {
            id: "copy",
            label: "이메일 복사",
            onSelect: (row: IDemoDataTableRow) => console.info("이메일 복사", row.email),
        },
        {
            id: "edit",
            label: "담당자 수정",
            onSelect: (row: IDemoDataTableRow) => console.info("담당자 수정", row.customer),
        },
        {
            id: "remove",
            label: "삭제",
            destructive: true,
            onSelect: (row: IDemoDataTableRow) => console.info("삭제", row.id),
        },
    ] satisfies ActionItem<IDemoDataTableRow>[],
};

export const DEMO_DATA_TABLE_COLUMNS: DemoDataTableColumn[] = [
    { key: "id", label: "문서 번호", cellClassName: "font-medium", filterable: true },
    { key: "customer", label: "담당자", filterable: true },
    { key: "email", label: "이메일", filterable: true },
    { key: "role", label: "역할", filterable: true },
    {
        key: "status",
        label: "상태",
        filterable: true,
        render: row =>
            <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground">
                {row.status}
            </span>
    },
    {
        key: "actions",
        label: DEMO_DATA_TABLE_ACTION.columnLabel,
        sortable: false,
        headerClassName: "text-right",
        cellClassName: "text-right",
        render: row =>
            <ActionMenu
                row={row}
                actions={DEMO_DATA_TABLE_ACTION.actions}
                maxItems={DEMO_DATA_TABLE_ACTION.maxItems}
                label={DEMO_DATA_TABLE_ACTION.menuLabel}
            />
    },
];

/** User **/
export const USER_TABLE_FILTER: UserFilterOption[] = [
    { value: "all", label: "전체" },
    { value: "id", label: "ID" },
    { value: "name", label: "이름" },
    { value: "user_id", label: "User ID" },
    { value: "role", label: "권한" },
];

export const USER_TABLE_COLUMNS: UserColumn[] = [
    { key: "id", label: "ID", cellClassName: "font-medium", filterable: true },
    { key: "name", label: "이름", filterable: true },
    { key: "role", label: "권한", filterable: true },
    { key: "user_id", label: "User ID", filterable: true },
];
