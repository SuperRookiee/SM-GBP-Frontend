import {useMemo, useState} from "react";
import {RotateCcwIcon, SearchIcon} from "lucide-react";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {SIGNUP_AUTHORITY_OPTIONS, CORPORATION_LABEL_KEY_BY_CODE, COUNTRY_GROUPS, COUNTRY_LABEL_KEY_BY_CODE} from "@/constants/country.constant.ts";
import {type DemoDataTableColumn, type DemoDataTableFilterOption} from "@/types/demo/demoDataTable.types.ts";
import DataTable from "@/components/table/DataTable";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

type CountryAuthority = (typeof COUNTRY_GROUPS)[number]["authorityCode"];
type Authority = "all" | CountryAuthority;
type Corporation = "all" | string;
type Country = "all" | string;
type PermissionLevel = "all" | "corpStaff" | "corpAdmin" | "hqStaff" | "hqAdmin";
type Approval = "all" | "approved" | "pending";

type AdminListRow = {
    id: number;
    authority: Exclude<Authority, "all">;
    corporation: Exclude<Corporation, "all">;
    country: Exclude<Country, "all">;
    userId: string;
    affiliation: string;
    permissionLevel: Exclude<PermissionLevel, "all">;
    requestDate: string;
    approval: Exclude<Approval, "all">;
};

const SAMPLE_ROWS: Omit<AdminListRow, "id">[] = [
    {authority: "africa", corporation: "SEEA", country: "KENYA", userId: "sjkssikee", affiliation: "△△△△△ 팀", permissionLevel: "corpStaff", requestDate: "2026-02-20", approval: "pending"},
    {authority: "africa", corporation: "SEEA", country: "KENYA", userId: "keny02", affiliation: "○○○○○○○○ 팀", permissionLevel: "corpStaff", requestDate: "2026-02-20", approval: "pending"},
    {authority: "north_america", corporation: "SEA", country: "USA", userId: "gildongee", affiliation: "△△△△△ 팀", permissionLevel: "corpAdmin", requestDate: "2026-02-01", approval: "approved"},
    {authority: "europe", corporation: "SEAD", country: "CROATIA", userId: "cristinana", affiliation: "○○○○○팀", permissionLevel: "corpStaff", requestDate: "2026-01-08", approval: "approved"},
    {authority: "europe", corporation: "SEAD", country: "SERBIA", userId: "andy", affiliation: "○○○○○1212팀", permissionLevel: "corpStaff", requestDate: "2026-01-02", approval: "approved"},
    {authority: "cis", corporation: "SEA", country: "USA", userId: "maxim00", affiliation: "★★★★ 운영팀", permissionLevel: "hqStaff", requestDate: "2025-12-12", approval: "approved"},
];

const ADMIN_LIST_ROWS: AdminListRow[] = Array.from({length: 150}, (_, index) => {
    const seed = SAMPLE_ROWS[index % SAMPLE_ROWS.length];
    const day = String((index % 28) + 1).padStart(2, "0");
    return {
        ...seed,
        id: index + 1,
        userId: `${seed.userId}${String(index + 1).padStart(3, "0")}`,
        requestDate: `2026-02-${day}`,
    };
});

const AdminListPage = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [authority, setAuthority] = useState<Authority>("all");
    const [corporation, setCorporation] = useState<Corporation>("all");
    const [country, setCountry] = useState<Country>("all");
    const [permissionLevels, setPermissionLevels] = useState<PermissionLevel[]>(["all"]);
    const [approvals, setApprovals] = useState<Approval[]>(["all"]);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(50);
    const [query, setQuery] = useState("");
    const [filterKey, setFilterKey] = useState<"all" | keyof AdminListRow>("all");
    const [sortKey, setSortKey] = useState<keyof AdminListRow | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    const permissionLevelCandidates: Array<Exclude<PermissionLevel, "all">> = ["corpStaff", "corpAdmin", "hqStaff", "hqAdmin"];
    const approvalCandidates: Array<Exclude<Approval, "all">> = ["approved", "pending"];
    const authorityFilterOptions = useMemo(() => [
        {value: "all" as const, label: t("common.all")},
        ...SIGNUP_AUTHORITY_OPTIONS
            .filter((option) => option.value !== "default" && option.value !== "all")
            .map((option) => ({value: option.value as CountryAuthority, label: t(option.labelKey)})),
    ],[t]);
    const corporationFilterOptions = useMemo(() => [
        {value: "all", label: t("common.all")},
        ...Array.from(
            new Set(
                COUNTRY_GROUPS.flatMap((group) =>
                    group.corporations.map((corp) => corp.corporationCode),
                ),
            ),
        ).map((code) => ({
            value: code,
            label: CORPORATION_LABEL_KEY_BY_CODE[code] ? t(CORPORATION_LABEL_KEY_BY_CODE[code]) : code,
        })),
    ], [t] );
    const countryFilterOptions = useMemo(() => [
        {value: "all", label: t("common.all")},
        ...Array.from(
            new Set(
                COUNTRY_GROUPS.flatMap((group) =>
                    group.corporations.flatMap((corp) => corp.countries),
                ),
            ),
        ).map((countryCode) => ({
            value: countryCode,
            label: COUNTRY_LABEL_KEY_BY_CODE[countryCode] ? t(COUNTRY_LABEL_KEY_BY_CODE[countryCode]) : countryCode,
        })),
    ], [t]);
    const authorityLabelByCode = useMemo(
        () =>
            Object.fromEntries(
                SIGNUP_AUTHORITY_OPTIONS
                    .filter((option) => option.value !== "default" && option.value !== "all")
                    .map((option) => [option.value, t(option.labelKey)]),
            ),
        [t],
    );

    // #. '전체' 선택 시 빈 배열로 간주하는 공통 헬퍼다.
    const getActiveValues = <T extends string>(values: T[], allKey: T) => (values.includes(allKey) ? [] : values);
    // #. 그룹 체크박스가 '전체' 상태인지 계산한다.
    const isAllSelected = <T extends string>(values: T[], allKey: T) => values.includes(allKey);
    // #. 그룹 체크박스(전체/개별) 토글 로직을 처리한다.
    const toggleGroupedCheckbox = <T extends string>(
        current: T[],
        value: T,
        allKey: T,
        candidates: T[],
        setValue: (next: T[]) => void,
    ) => {
        if (value === allKey) {
            setValue([allKey]);
            return;
        }
        const withoutAll = current.filter((item) => item !== allKey);
        const exists = withoutAll.includes(value);
        const next = exists ? withoutAll.filter((item) => item !== value) : [...withoutAll, value];
        if (next.length === 0 || next.length === candidates.length) {
            setValue([allKey]);
            return;
        }
        setValue(next);
    };

    // #. 선택한 필터 조건으로 기본 목록을 필터링한다.
    const baseFilteredRows = useMemo(() => {
        const selectedPermissionLevels = getActiveValues(permissionLevels, "all");
        const selectedApprovals = getActiveValues(approvals, "all");

        return ADMIN_LIST_ROWS.filter((row) => {
            const authorityMatched = authority === "all" || row.authority === authority;
            const corporationMatched = corporation === "all" || row.corporation === corporation;
            const countryMatched = country === "all" || row.country === country;
            const permissionMatched = selectedPermissionLevels.length === 0 || selectedPermissionLevels.includes(row.permissionLevel);
            const approvalMatched = selectedApprovals.length === 0 || selectedApprovals.includes(row.approval);
            return authorityMatched && corporationMatched && countryMatched && permissionMatched && approvalMatched;
        });
    }, [approvals, authority, corporation, country, permissionLevels]);

    // #. 검색어/검색키로 2차 검색 결과를 계산한다.
    const searchedRows = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) return baseFilteredRows;
        return baseFilteredRows.filter((row) => {
            if (filterKey === "all") {
                return [row.userId, row.affiliation, row.authority, row.corporation, row.country].join(" ").toLowerCase().includes(keyword);
            }
            return String(row[filterKey]).toLowerCase().includes(keyword);
        });
    }, [baseFilteredRows, filterKey, query]);

    // #. 현재 정렬 키/방향으로 목록을 정렬한다.
    const sortedRows = useMemo(() => {
        if (!sortKey) return searchedRows;
        return [...searchedRows].sort((a, b) => {
            const first = String(a[sortKey]);
            const second = String(b[sortKey]);
            return sortDirection === "asc" ? first.localeCompare(second) : second.localeCompare(first);
        });
    }, [searchedRows, sortDirection, sortKey]);

    // #. 현재 페이지/사이즈 기준으로 페이징 데이터를 만든다.
    const pagedRows = useMemo(() => {
        const start = (page - 1) * size;
        return sortedRows.slice(start, start + size);
    }, [page, size, sortedRows]);

    // #. 데이터테이블 컬럼 정의를 구성한다.
    const columns: DemoDataTableColumn<AdminListRow>[] = [
        {key: "authority", label: t("adminSettingPage.columns.authority"), width: 130, render: (row) => authorityLabelByCode[row.authority] ?? row.authority},
        {
            key: "corporation",
            label: t("adminSettingPage.columns.corporation"),
            width: 120,
            render: (row) => CORPORATION_LABEL_KEY_BY_CODE[row.corporation] ? t(CORPORATION_LABEL_KEY_BY_CODE[row.corporation]) : row.corporation,
        },
        {
            key: "country",
            label: t("adminSettingPage.columns.country"),
            width: 120,
            render: (row) => COUNTRY_LABEL_KEY_BY_CODE[row.country] ? t(COUNTRY_LABEL_KEY_BY_CODE[row.country]) : row.country,
        },
        {key: "userId", label: t("adminSettingPage.columns.userId"), width: 200},
        {key: "affiliation", label: t("adminSettingPage.columns.affiliation"), width: 180},
        {key: "permissionLevel", label: t("adminSettingPage.columns.permissionLevel"), width: 150, render: (row) => t(`adminSettingPage.permission.levels.${row.permissionLevel}`)},
        {key: "requestDate", label: t("adminSettingPage.columns.requestDate"), width: 130},
        {
            key: "approval",
            label: t("adminSettingPage.columns.approval"),
            width: 120,
            render: (row) =>
                row.approval === "pending"
                    ? <span className="font-medium text-red-600">{t("adminSettingPage.approval.pending")}</span>
                    : t("adminSettingPage.approval.approved"),
        },
    ];

    // #. 데이터테이블 상단 검색 필터 옵션을 구성한다.
    const filterOptions: DemoDataTableFilterOption<AdminListRow>[] = [
        {value: "all", label: t("common.all")},
        {value: "userId", label: t("adminSettingPage.columns.userId")},
        {value: "affiliation", label: t("adminSettingPage.columns.affiliation")},
        {value: "authority", label: t("adminSettingPage.columns.authority")},
        {value: "corporation", label: t("adminSettingPage.columns.corporation")},
        {value: "country", label: t("adminSettingPage.columns.country")},
    ];

    return (
        <div className="mx-auto flex w-full max-w-8xl flex-col gap-4">
            {/* 검색 조건 필터 영역 */}
            <Card className="rounded-none border-dashed">
                <CardContent className="space-y-3">
                    {/* 권역/법인/국가 선택 필터 */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label>{t("adminSettingPage.allList.filters.authority")}</Label>
                            <Select value={authority} onValueChange={(value) => setAuthority(value as Authority)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {authorityFilterOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t("adminSettingPage.allList.filters.corporation")}</Label>
                            <Select value={corporation} onValueChange={(value) => setCorporation(value as Corporation)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {corporationFilterOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t("adminSettingPage.allList.filters.country")}</Label>
                            <Select value={country} onValueChange={(value) => setCountry(value as Country)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {countryFilterOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* 권한 레벨 체크박스 필터 */}
                    <div className="space-y-2">
                        <Label>{t("adminSettingPage.allList.filters.permissionLevel")}</Label>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 border p-3">
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={isAllSelected(permissionLevels, "all")}
                                    onCheckedChange={() => toggleGroupedCheckbox(permissionLevels, "all", "all", ["all", ...permissionLevelCandidates], setPermissionLevels)}
                                />
                                {t("common.all")}
                            </label>
                            {permissionLevelCandidates.map((item) => (
                                <label key={item} className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={permissionLevels.includes(item) && !isAllSelected(permissionLevels, "all")}
                                        onCheckedChange={() => toggleGroupedCheckbox(permissionLevels, item, "all", permissionLevelCandidates, setPermissionLevels)}
                                    />
                                    {t(`adminSettingPage.permission.levels.${item}`)}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 승인 여부 체크박스 필터 */}
                    <div className="space-y-2">
                        <Label>{t("adminSettingPage.allList.filters.approval")}</Label>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 border p-3">
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={isAllSelected(approvals, "all")}
                                    onCheckedChange={() => toggleGroupedCheckbox(approvals, "all", "all", ["all", ...approvalCandidates], setApprovals)}
                                />
                                {t("common.all")}
                            </label>
                            {approvalCandidates.map((item) => (
                                <label key={item} className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={approvals.includes(item) && !isAllSelected(approvals, "all")}
                                        onCheckedChange={() => toggleGroupedCheckbox(approvals, item, "all", approvalCandidates, setApprovals)}
                                    />
                                    {t(`adminSettingPage.approval.${item}`)}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 검색/초기화 액션 버튼 */}
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setAuthority("all");
                                setCorporation("all");
                                setCountry("all");
                                setPermissionLevels(["all"]);
                                setApprovals(["all"]);
                                setFilterKey("all");
                                setQuery("");
                                setPage(1);
                            }}
                        >
                            <RotateCcwIcon className="h-4 w-4"/>
                            {t("adminSettingPage.reset")}
                        </Button>
                        <Button type="button" onClick={() => setPage(1)}>
                            <SearchIcon className="h-4 w-4"/>
                            {t("common.search")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 관리자 목록 데이터테이블 */}
            <DataTable
                title={t("common.totalCount", "", {count: sortedRows.length})}
                rows={pagedRows}
                total={sortedRows.length}
                pageSize={size}
                pageSizeOptions={[50]}
                columns={columns}
                filterOptions={filterOptions}
                query={query}
                filterKey={filterKey}
                sortKey={sortKey}
                sortDirection={sortDirection}
                page={page}
                onQueryChange={setQuery}
                onFilterChange={setFilterKey}
                onSortChange={(key) => {
                    if (sortKey === key) setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
                    else {
                        setSortKey(key);
                        setSortDirection("asc");
                    }
                }}
                onPageChange={setPage}
                onPageSizeChange={setSize}
                searchPlaceholder={t("adminSettingPage.searchPlaceholder")}
                tableHeightClassName="h-120"
                showToolbar={false}
                // #. 우측 상단의 권한 정보 등록 이동 버튼
                headerRight={
                    <Button type="button" variant="outline" onClick={() => navigate("/admin-settings/permission-register")}>
                        {t("menu.adminPermissionInfoRegister")}
                    </Button>
                }
            />
        </div>
    );
};

export default AdminListPage;


