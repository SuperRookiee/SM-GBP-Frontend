import type { IDemoGridRow } from "@/interface/demoGrid.interface";
import type { DemoGridColumn, DemoGridFilterOption } from "@/types/demoGrid.types";

export const DEMO_GRID_FILTER_OPTIONS: DemoGridFilterOption[] = [
    { value: "all", label: "전체" },
    { value: "id", label: "문서 번호" },
    { value: "customer", label: "담당자" },
    { value: "email", label: "이메일" },
    { value: "role", label: "역할" },
    { value: "status", label: "상태" },
];

export const DEMO_GRID_COLUMNS: DemoGridColumn<IDemoGridRow>[] = [
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
];
