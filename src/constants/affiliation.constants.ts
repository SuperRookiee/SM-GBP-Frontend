import type {SignupAuthorityGroup} from "@/types/signup.types.ts";

// #. 권역 > 법인 > 국가 기준 데이터 목록이다.
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
