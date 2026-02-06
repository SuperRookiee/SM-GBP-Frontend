import type { IUserInterface } from "@/interface/IUser.interface";
import type { DemoGridColumn, DemoGridFilterOption } from "@/types/demoGrid.types";

export const USER_TABLE_FILTER_OPTIONS: DemoGridFilterOption<IUserInterface>[] = [
    { value: "all", label: "전체" },
    { value: "id", label: "사용자 ID" },
    { value: "name", label: "이름" },
    { value: "user_id", label: "User ID" },
    { value: "role", label: "권한" },
];

export const USER_TABLE_COLUMNS: DemoGridColumn<IUserInterface>[] = [
    { key: "id", label: "ID", cellClassName: "font-medium" },
    { key: "name", label: "이름" },
    { key: "role", label: "권한" },
    { key: "user_id", label: "User ID" },
];
