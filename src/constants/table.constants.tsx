import type { IDemoDataTableRow } from "@/interface/demo/IDemoDataTable.interface.ts";
import type { ISampleRow } from "@/interface/demo/ISample.interface.ts";
import type { ActionItem } from "@/types/ActionItem.type.ts";
import type { DemoDataTableColumn, DemoDataTableFilterOption } from "@/types/demo/demoDataTable.types.ts";
import type { UserColumn, UserFilterOption } from "@/types/user.types.ts";
import ActionMenu from "@/components/common/ActionMenu";

/** Default **/
export const DEFAULT_TABLE = {
    pageSize: 10,
    pageWindow: 5,
} as const;

/** Select Column **/
export const SELECT_COL_SIZE = 28;

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
            href: (row: IDemoDataTableRow) => `/demo/grid_table/${row.id}`,
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
    { key: "id", label: "문서 번호", width: 100, cellClassName: "font-medium", filterable: true },
    { key: "customer", label: "담당자", width: 140, filterable: true },
    { key: "email", label: "이메일", width: 280, filterable: true },
    { key: "role", label: "역할", width: 120, filterable: true },
    {
        key: "status",
        label: "상태",
        width: 100,
        filterable: true,
        render: row => (
            <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-medium">
                {row.status}
            </span>
        ),
    },
    {
        key: "actions",
        label: "",
        sortable: false,
        width: 56,
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

/** Sample Data Table **/
export const SAMPLE_TABLE_FILTER: DemoDataTableFilterOption<ISampleRow>[] = [
    { value: "all", label: "전체" },
    { value: "id", label: "ID" },
    { value: "name", label: "이름" },
    { value: "description", label: "설명" },
];

export const SAMPLE_TABLE_COLUMNS: DemoDataTableColumn<ISampleRow>[] = [
    { key: "id", label: "ID", width: 100, cellClassName: "font-medium", filterable: true },
    { key: "name", label: "이름", width: 180, filterable: true },
    { key: "description", label: "설명", width: 420, filterable: true },
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
    { key: "id", label: "ID", width: 100, cellClassName: "font-medium", filterable: true },
    { key: "name", label: "이름", width: 160, filterable: true },
    { key: "role", label: "권한", width: 140, filterable: true },
    { key: "user_id", label: "User ID", width: 180, filterable: true },
];
