export type SignupSelectOption = {
    value: string;
    labelKey: string;
};

export type SignupCorporationCountryGroup = {
    corporationCode: string;
    countries: string[];
};

export type SignupAuthorityGroup = {
    authorityCode: string;
    corporations: SignupCorporationCountryGroup[];
};

export type TermKey = "service" | "privacy" | "overseas" | "marketing";
