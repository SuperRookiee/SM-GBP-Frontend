import type {SelectOption} from "@/types/common.types.ts";

// #. 공통 권한 레벨 선택 옵션 목록
export const PERMISSION_LEVEL_OPTIONS: SelectOption[] = [
    {value: "default", labelKey: "signup.options.permissionLevel.default"},
    {value: "corporation_staff", labelKey: "signup.options.permissionLevel.corporationStaff"},
    {value: "corporation_admin", labelKey: "signup.options.permissionLevel.corporationAdmin"},
    {value: "hq_staff", labelKey: "signup.options.permissionLevel.hqStaff"},
    {value: "hq_admin", labelKey: "signup.options.permissionLevel.hqAdmin"},
];

