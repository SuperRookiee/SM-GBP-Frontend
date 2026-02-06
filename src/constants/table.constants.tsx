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
]

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
