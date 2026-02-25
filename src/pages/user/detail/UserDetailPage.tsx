import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserDetailSampleDataApi } from "@/apis/user.api.ts";
import { SIGNUP_AUTHORITY_OPTIONS, CORPORATION_LABEL_KEY_BY_CODE } from "@/constants/country.constant.ts";
import { GC_TIME, STALE_TIME } from "@/constants/query.constant.ts";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { RoleEnum } from "@/enums/role.enum.ts";

// #. 사용자 상세 페이지 컴포넌트다.
const UserDetailPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const userId = Number(id);
    const isInvalidId = Number.isNaN(userId);

    const { data, isLoading } = useQuery({
        queryKey: ["user", "detail", userId],
        queryFn: () => getUserDetailSampleDataApi(userId),
        enabled: !isInvalidId,
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        refetchOnWindowFocus: false,
    });

    const roleLabelMap: Record<RoleEnum, string> = {
        [RoleEnum.ADMIN]: t("user.role.admin"),
        [RoleEnum.USER]: t("user.role.user"),
        [RoleEnum.GUEST]: t("user.role.guest"),
    };
    const authorityLabelMap = Object.fromEntries(
        SIGNUP_AUTHORITY_OPTIONS
            .filter((option) => option.value !== "default" && option.value !== "all")
            .map((option) => [option.value, t(option.labelKey)]),
    );

    const resolvedError = isInvalidId
        ? t("user.invalidId")
        : !isLoading && !data
            ? t("user.notFound")
            : null;

    return (
        <div className="flex min-h-full items-center justify-center">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                <header className="space-y-2">
                    <div className="flex items-center justify-start">
                        <Button variant="outline" onClick={() => navigate("/user")}>
                            {t("user.backToList")}
                        </Button>
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground">{t("user.management")}</p>
                    <h1 className="text-3xl font-semibold tracking-tight">{t("user.detailTitle", { id: id ?? "-" })}</h1>
                    <p className="text-sm text-muted-foreground">{t("user.detailDescription")}</p>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>{t("user.tableTitle")}</CardTitle>
                        <CardDescription>{t("user.detailCardDescription")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p className="text-sm text-muted-foreground">{t("user.loadingDetail")}</p>
                        ) : resolvedError ? (
                            <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                                {resolvedError}
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">{t("table.docNo")}</p>
                                    <p className="text-sm font-medium">{data?.id}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">{t("table.name")}</p>
                                    <p className="text-sm font-medium">{data?.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">{t("table.permission")}</p>
                                    <p className="text-sm font-medium">{data ? roleLabelMap[data.role] : "-"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">{t("user.userIdLabel")}</p>
                                    <p className="text-sm font-medium">{data?.user_id}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">{t("signup.fields.authority")}</p>
                                    <p className="text-sm font-medium">{data?.authority ? authorityLabelMap[data.authority] ?? data.authority : "-"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">{t("signup.fields.corporation")}</p>
                                    <p className="text-sm font-medium">{data?.corporation ? (CORPORATION_LABEL_KEY_BY_CODE[data.corporation] ? t(CORPORATION_LABEL_KEY_BY_CODE[data.corporation]) : data.corporation) : "-"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">{t("signup.fields.countryOptional")}</p>
                                    <p className="text-sm font-medium">{data?.country}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">{t("signup.fields.department")}</p>
                                    <p className="text-sm font-medium">{data?.department}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">{t("signup.fields.phone")}</p>
                                    <p className="text-sm font-medium">{data ? `${data.phone_country} ${data.phone_number}` : "-"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">{t("signup.fields.permissionLevel")}</p>
                                    <p className="text-sm font-medium">{data?.permission_level}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UserDetailPage;




