import {Fragment} from "react";
import {useTranslation} from "react-i18next";
import {Link, useLocation} from "react-router-dom";
import {MENU} from "@/constants/menu.constant.tsx";
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator} from "@/components/ui/breadcrumb";

type BreadcrumbItemData = {
    href: string;
    title: string;
};

interface IAppBreadcrumbProps {
    className?: string;
}

const AppBreadcrumb = ({className}: IAppBreadcrumbProps) => {
    const {t} = useTranslation();
    const location = useLocation();
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const segmentTitleMap: Record<string, string> = {
        demo: "menu.demo",
        data_table: "menu.dataTable",
        grid_table: "menu.gridTable",
        chart: "menu.chart",
        form: "menu.form",
        dialog: "menu.dialog",
        api: "menu.api",
        typography: "menu.typography",
        editor: "menu.editor",
        image: "menu.image",
        not_found: "menu.notFound",
        user: "menu.user",
        "my_page": "menu.myPage",
        admin_settings: "menu.adminSetting",
        list: "menu.adminList",
        permission_register: "menu.adminPermissionInfoRegister",
        notice: "menu.adminNotice",
        new: "sampleDetail.create",
    };

    // #. 1depth 메뉴의 기본 이동 경로를 메뉴 설정에서 자동 계산한다.
    const segmentHrefMap: Record<string, string> = MENU.navMain.reduce<Record<string, string>>((acc, menu) => {
        const candidateHref = (menu.url && menu.url !== "#")
            ? menu.url
            : menu.items?.find((subItem) => subItem.url && subItem.url !== "#")?.url;

        if (!candidateHref || !candidateHref.startsWith("/")) return acc;

        const topSegment = candidateHref.split("/").filter(Boolean)[0];
        if (!topSegment) return acc;

        acc[topSegment] = candidateHref;
        return acc;
    }, {});

    const items: BreadcrumbItemData[] = pathSegments.map((segment, index) => {
        const defaultHref = `/${pathSegments.slice(0, index + 1).join("/")}`;
        const href = index === 0 && segmentHrefMap[segment] ? segmentHrefMap[segment] : defaultHref;
        const isIdUnderApi = pathSegments[index - 1] === "api" && segment !== "new";
        const isIdUnderUser = pathSegments[index - 1] === "user";
        const title = segmentTitleMap[segment]
            ? t(segmentTitleMap[segment])
            : (isIdUnderApi || isIdUnderUser)
                ? segment
                : segment.replaceAll("_", " ");

        return {href, title};
    });

    return (
        <Breadcrumb className={className}>
            <BreadcrumbList>
                <BreadcrumbItem>
                    {items.length === 0 ? (
                        <BreadcrumbPage>{t("common.home")}</BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink asChild>
                            <Link to="/">{t("common.home")}</Link>
                        </BreadcrumbLink>
                    )}
                </BreadcrumbItem>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <Fragment key={`${item.href}-${index}`}>
                            <BreadcrumbSeparator/>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{item.title}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={item.href}>{item.title}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
};

export default AppBreadcrumb;
