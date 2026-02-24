import type {SignupSelectOption} from "@/types/signup.types.ts";

// #. 권한 레벨 선택 옵션 목록이다.
export const SIGNUP_PERMISSION_LEVEL_OPTIONS: SignupSelectOption[] = [
    {value: "default", labelKey: "signup.options.permissionLevel.default"},
    {value: "corporation_staff", labelKey: "signup.options.permissionLevel.corporationStaff"},
    {value: "corporation_admin", labelKey: "signup.options.permissionLevel.corporationAdmin"},
    {value: "hq_staff", labelKey: "signup.options.permissionLevel.hqStaff"},
    {value: "hq_admin", labelKey: "signup.options.permissionLevel.hqAdmin"},
];

// #. 권한 레벨 문자열을 내부 value로 매핑한다.
export const PERMISSION_LEVEL_VALUE_MAP: Record<string, string> = {
    "법인 실무자": "corporation_staff",
    "법인 총괄관리자": "corporation_admin",
    "HQ 수행사": "hq_staff",
    "HQ 총괄관리자": "hq_admin",
    corporation_staff: "corporation_staff",
    corporation_admin: "corporation_admin",
    hq_staff: "hq_staff",
    hq_admin: "hq_admin",
};
