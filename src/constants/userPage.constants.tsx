import type { IDemoGridRow } from "@/interface/IDemoGrid.interface";
import type { DemoGridColumn, DemoGridFilterOption } from "@/types/demoGrid.types";

export const USER_TABLE_FILTER_OPTIONS: DemoGridFilterOption[] = [
    { value: "all", label: "전체" },
    { value: "id", label: "사용자 ID" },
    { value: "customer", label: "이름" },
    { value: "email", label: "이메일" },
    { value: "role", label: "권한" },
    { value: "status", label: "상태" },
];

export const USER_TABLE_COLUMNS: DemoGridColumn<IDemoGridRow>[] = [
    { key: "id", label: "사용자 ID", cellClassName: "font-medium" },
    { key: "customer", label: "이름" },
    { key: "email", label: "이메일" },
    { key: "role", label: "권한" },
    {
        key: "status",
        label: "상태",
        render: (row) => (
            <span className="inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground">
                {row.status}
            </span>
        ),
    },
];
