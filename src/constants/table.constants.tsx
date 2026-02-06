import { ActionMenu } from "@/components/common/ActionMenu";
import type { ActionItem } from "@/types/ActionItem.type.ts";
import type { IDemoDataTableRow } from "@/interface/IDemoDataTable.interface.ts";
import type { DemoDataTableColumn, DemoDataTableFilterOption } from "@/types/demoDataTable.types.ts";
import type { UserColumn, UserFilterOption } from "@/types/user.types.ts";

/** Demo Data Table **/
export const DEMO_DATA_TABLE_FILTER_OPTIONS: DemoDataTableFilterOption[] = [
    { value: "all", label: "전체" },
    { value: "id", label: "문서 번호" },
    { value: "customer", label: "담당자" },
    { value: "email", label: "이메일" },
    { value: "role", label: "역할" },
    { value: "status", label: "상태" },
];

export const DEMO_DATA_TABLE_ACTION_MENU_CONFIG = {
    columnLabel: "액션",
    menuLabel: "행 작업",
    maxItems: 3,
    actions: [
        {
            id: "view",
            label: "상세 보기",
            onSelect: (row: IDemoDataTableRow) => {
                console.info("상세 보기", row);
            },
        },
        {
            id: "copy",
            label: "이메일 복사",
            onSelect: (row: IDemoDataTableRow) => {
                console.info("이메일 복사", row.email);
            },
        },
        {
            id: "edit",
            label: "담당자 수정",
            onSelect: (row: IDemoDataTableRow) => {
                console.info("담당자 수정", row.customer);
            },
        },
        {
            id: "remove",
            label: "삭제",
            destructive: true,
            onSelect: (row: IDemoDataTableRow) => {
                console.info("삭제", row.id);
            },
        },
    ] satisfies ActionItem<IDemoDataTableRow>[],
};

const DEMO_DATA_TABLE_ACTION_ITEMS = DEMO_DATA_TABLE_ACTION_MENU_CONFIG.actions.slice(
    0,
    DEMO_DATA_TABLE_ACTION_MENU_CONFIG.maxItems,
);

export const DEMO_DATA_TABLE_COLUMNS: DemoDataTableColumn[] = [
    { key: "id", label: "문서 번호", cellClassName: "font-medium" },
    { key: "customer", label: "담당자" },
    { key: "email", label: "이메일" },
    { key: "role", label: "역할" },
    {
        key: "status",
        label: "상태",
        render: (row) =>
            <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground">
                {row.status}
            </span>
    },
    {
        key: "actions",
        label: DEMO_DATA_TABLE_ACTION_MENU_CONFIG.columnLabel,
        sortable: false,
        headerClassName: "text-right",
        cellClassName: "text-right",
        render: (row) => (
            <ActionMenu
                row={row}
                actions={DEMO_DATA_TABLE_ACTION_ITEMS}
                label={DEMO_DATA_TABLE_ACTION_MENU_CONFIG.menuLabel}
            />
        ),
    },
];

/** User **/
export const USER_TABLE_FILTER_OPTIONS: UserFilterOption[] = [
    { value: "all", label: "전체" },
    { value: "id", label: "사용자 ID" },
    { value: "name", label: "이름" },
    { value: "user_id", label: "User ID" },
    { value: "role", label: "권한" },
];

export const USER_TABLE_COLUMNS: UserColumn[] = [
    { key: "id", label: "ID", cellClassName: "font-medium" },
    { key: "name", label: "이름" },
    { key: "role", label: "권한" },
    { key: "user_id", label: "User ID" },
];
