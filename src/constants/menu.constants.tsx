import { ChartLineIcon, HomeIcon, LifeBuoy, Send, Settings2Icon, ShoppingCartIcon } from "lucide-react";

export const MENU = {
    navMain: [
        {
            titleKey: "menu.businessInfo",
            url: "#",
            icon: <ChartLineIcon/>,
            isActive: true,
            items: [
                { titleKey: "menu.businessList", url: "#" },
                { titleKey: "menu.groupManagement", url: "#" },
                { titleKey: "menu.businessCategoryCreate", url: "#" },
                { titleKey: "menu.businessInfoCreate", url: "#" },
            ],
        },
        {
            titleKey: "menu.productInfo",
            url: "#",
            icon: <ShoppingCartIcon/>,
            items: [
                { titleKey: "menu.productList", url: "#" },
                { titleKey: "menu.productCategoryCreate", url: "#" },
                { titleKey: "menu.productInfoCreate", url: "#" },
            ],
        },
        {
            titleKey: "menu.imageInfo",
            url: "#",
            icon: <HomeIcon/>,
            items: [
                { titleKey: "menu.imageList", url: "#" },
                { titleKey: "menu.logoUpload", url: "#" },
                { titleKey: "menu.coverUpload", url: "#" },
                { titleKey: "menu.businessImageUpload", url: "#" },
            ],
        },
        {
            titleKey: "menu.reservationSettings",
            url: "#",
            icon: <HomeIcon/>,
            items: [
                { titleKey: "menu.reservationList", url: "#" },
                { titleKey: "menu.reservationSettingsCreate", url: "#" },
            ],
        },
        {
            titleKey: "menu.postManagement",
            url: "#",
            icon: <HomeIcon/>,
            items: [
                { titleKey: "menu.postList", url: "#" },
                { titleKey: "menu.postInfoCreate", url: "#" },
            ],
        },
        {
            titleKey: "menu.reviewManagement",
            url: "#",
            icon: <HomeIcon/>,
            items: [
                { titleKey: "menu.reviewList", url: "#" },
                { titleKey: "menu.reviewRequestCreate", url: "#" },
            ],
        },
        {
            titleKey: "menu.qnaManagement",
            url: "#",
            icon: <HomeIcon/>,
            items: [
                { titleKey: "menu.qnaList", url: "#" },
            ],
        },
        {
            titleKey: "menu.adminSettings",
            url: "#",
            icon: <Settings2Icon/>,
            items: [
                { titleKey: "menu.adminList", url: "#" },
                { titleKey: "menu.permissionInfoCreate", url: "#" },
                { titleKey: "menu.notice", url: "#" },
            ],
        },
        {
            titleKey: "menu.demo",
            url: "#",
            icon: <HomeIcon/>,
            items: [
                { titleKey: "menu.dataTable", url: "/demo/data_table" },
                { titleKey: "menu.gridTable", url: "/demo/grid_table" },
                { titleKey: "menu.chart", url: "/demo/chart" },
                { titleKey: "menu.form", url: "/demo/form" },
                { titleKey: "menu.dialog", url: "/demo/dialog" },
                { titleKey: "menu.api", url: "/demo/api" },
                { titleKey: "menu.typography", url: "/demo/typography" },
                { titleKey: "menu.editor", url: "/demo/editor" },
                { titleKey: "menu.notFound", url: "/demo/not_found" },
            ],
        },
    ],
    navSecondary: [
        { titleKey: "menu.sampleSecondary1", url: "#", icon: <LifeBuoy/> },
        { titleKey: "menu.sampleSecondary2", url: "#", icon: <Send/> },
    ],
};
