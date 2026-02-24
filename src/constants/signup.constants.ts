import type {SignupAuthorityGroup, SignupSelectOption} from "@/types/signup.types.ts";

// 권역 옵션
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

// 전화번호 국가 코드
export const SIGNUP_PHONE_CODE_OPTIONS: SignupSelectOption[] = [
    {value: "+82", labelKey: "signup.options.phoneCode.kr"},
    {value: "+1", labelKey: "signup.options.phoneCode.us"},
    {value: "+44", labelKey: "signup.options.phoneCode.uk"},
    {value: "+49", labelKey: "signup.options.phoneCode.de"},
];

// 계정 권한 레벨 옵션 (default: 일반 사용자, corporation_staff: 법인 직원, corporation_admin: 법인 관리자, hq_staff: 본사 직원, hq_admin: 본사 관리자)
export const SIGNUP_PERMISSION_LEVEL_OPTIONS: SignupSelectOption[] = [
    {value: "default", labelKey: "signup.options.permissionLevel.default"},
    {value: "corporation_staff", labelKey: "signup.options.permissionLevel.corporationStaff"},
    {value: "corporation_admin", labelKey: "signup.options.permissionLevel.corporationAdmin"},
    {value: "hq_staff", labelKey: "signup.options.permissionLevel.hqStaff"},
    {value: "hq_admin", labelKey: "signup.options.permissionLevel.hqAdmin"},
];

// 권역 > 법인 > 국가 구조를 관리하는 기준 데이터
export const SIGNUP_AFFILIATION_GROUPS: SignupAuthorityGroup[] = [
    {
        authorityCode: "africa",
        corporations: [
            {corporationCode: "SEEA", countries: ["KENYA", "TANZANIA"]},
            {corporationCode: "SEWA", countries: ["GHANA", "NIGERIA", "SENEGAL"]},
        ],
    },
    {
        authorityCode: "cis",
        corporations: [
            {corporationCode: "SERC", countries: ["AZERBAIJAN", "RUSSIA"]},
        ],
    },
    {
        authorityCode: "europe",
        corporations: [
            {corporationCode: "SEAD", countries: ["CROATIA", "SERBIA", "SLOVENIA"]},
            {corporationCode: "SEB", countries: ["ESTONIA", "LATVIA", "LITHUANIA"]},
            {corporationCode: "SEBN", countries: ["BELGIUM", "NETHERLANDS"]},
            {corporationCode: "SECZ", countries: ["CZECH", "SLOVAK"]},
            {corporationCode: "SEI", countries: ["FRANCE", "HUNGARY", "ITALY", "PORTUGAL", "SPAIN"]},
            {corporationCode: "SEPOL", countries: ["POLAND"]},
            {corporationCode: "SEROM", countries: ["BULGARIA", "ROMANIA"]},
            {corporationCode: "SEUC", countries: ["UKRAINE"]},
            {corporationCode: "SEUK", countries: ["UK"]},
        ],
    },
    {
        authorityCode: "great_china",
        corporations: [
            {corporationCode: "SCIC", countries: ["西部大区", "东北大区", "华南大区", "华北大区", "华东大区"]},
            {corporationCode: "SEHK", countries: ["HONG KONG"]},
            {corporationCode: "SET", countries: ["TAIWAN"]},
        ],
    },
    {
        authorityCode: "latin_america",
        corporations: [
            {corporationCode: "SAMCOL", countries: ["COLOMBIA"]},
            {corporationCode: "SEASA", countries: ["ARGENTINA", "BOLIVIA", "CHILE", "BRAZIL", "GUATEMALA", "PARAGUAY"]},
            {corporationCode: "SEPR", countries: ["REP. DOMINICANA", "PERU"]},
            {corporationCode: "SEM", countries: ["MEXICO"]},
        ],
    },
    {
        authorityCode: "middle_east",
        corporations: [
            {corporationCode: "IRAN", countries: ["IRAN"]},
            {corporationCode: "SEIL", countries: ["ISRAEL", "PALESTINE"]},
            {corporationCode: "SELV", countries: ["JORDAN", "LIBYA", "MOROCCO", "TUNISIA"]},
            {corporationCode: "SEPAK", countries: ["PAKISTAN"]},
            {corporationCode: "SESAR", countries: ["SAUDI ARABIA"]},
            {corporationCode: "SETK", countries: ["TURKIYE"]},
            {corporationCode: "SGE", countries: ["BAHRAIN", "KUWAIT", "OMAN", "QATAR", "UAE"]},
        ],
    },
    {
        authorityCode: "north_america",
        corporations: [
            {corporationCode: "SEA", countries: ["USA"]},
            {corporationCode: "SECA", countries: ["CANADA"]},
        ],
    },
    {
        authorityCode: "se_asia",
        corporations: [
            {corporationCode: "SAVINA", countries: ["VIETNAM"]},
            {corporationCode: "SEAU", countries: ["AUSTRALIA"]},
            {corporationCode: "SEIN", countries: ["INDONESIA"]},
            {corporationCode: "SEPCO", countries: ["PHILIPPINES"]},
            {corporationCode: "SESP", countries: ["SINGAPORE"]},
            {corporationCode: "SME", countries: ["MALAYSIA"]},
            {corporationCode: "TSE", countries: ["CAMBODIA", "LAOS", "MYANMAR", "THAILAND"]},
        ],
    },
    {
        authorityCode: "sw_asia",
        corporations: [
            {corporationCode: "BANGLADESH", countries: ["BANGLADESH"]},
            {corporationCode: "NEPAL", countries: ["NEPAL"]},
            {corporationCode: "SIEL", countries: ["INDIA"]},
        ],
    },
];
