import type {SignupSelectOption} from "@/types/signup.types.ts";

// #. 권역 선택 옵션 목록이다.
export const SIGNUP_AUTHORITY_OPTIONS: SignupSelectOption[] = [
    {value: "default", labelKey: "signup.options.authority.default"},
    {value: "all", labelKey: "signup.options.authority.all"},
    {value: "africa", labelKey: "signup.options.authority.africa"},
    {value: "cis", labelKey: "signup.options.authority.cis"},
    {value: "europe", labelKey: "signup.options.authority.europe"},
    {value: "great_china", labelKey: "signup.options.authority.greatChina"},
    {value: "latin_america", labelKey: "signup.options.authority.latinAmerica"},
    {value: "middle_east", labelKey: "signup.options.authority.middleEast"},
    {value: "north_america", labelKey: "signup.options.authority.northAmerica"},
    {value: "se_asia", labelKey: "signup.options.authority.seAsia"},
    {value: "sw_asia", labelKey: "signup.options.authority.swAsia"},
];
