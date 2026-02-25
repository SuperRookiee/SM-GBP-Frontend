export type CountryGroup = {
    corporationCode: string;
    countries: string[];
};

export type AuthorityCountryGroup = {
    authorityCode: string;
    corporations: CountryGroup[];
};
