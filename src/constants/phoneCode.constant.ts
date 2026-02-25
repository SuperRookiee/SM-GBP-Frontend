import type {SelectOption} from "@/types/common.types.ts";

// #. 휴대폰 국가코드 옵션 목록
export const PHONE_CODE_OPTIONS: SelectOption[] = [
    {value: "+82", labelKey: "signup.options.phoneCode.kr"},
    {value: "+1", labelKey: "signup.options.phoneCode.us"},
    {value: "+44", labelKey: "signup.options.phoneCode.uk"},
    {value: "+49", labelKey: "signup.options.phoneCode.de"},
];
