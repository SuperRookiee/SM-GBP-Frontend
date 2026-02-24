import { ChartLineIcon, HomeIcon, LifeBuoy, Send, Settings2Icon, ShoppingCartIcon, UserIcon } from "lucide-react";

export const MENU = {
    navMain: [
        {
            titleKey: "menu.businessInfoMgmt",
            url: "#",
            icon: <HomeIcon/>,
            items: [
                {titleKey: "menu.businessAllList", url: "#"},
                {titleKey: "menu.businessGroupMgmt", url: "#"},
                {titleKey: "menu.businessCategoryRegister", url: "#"},
                {titleKey: "menu.businessInfoRegister", url: "#"},
            ],
        },
        {
            titleKey: "menu.productInfoMgmt",
            url: "#",
            icon: <ChartLineIcon/>,
            items: [
                {titleKey: "menu.productAllList", url: "#"},
                {titleKey: "menu.productCategoryRegister", url: "#"},
                {titleKey: "menu.productInfoRegister", url: "#"},
            ],
        },
        {
            titleKey: "menu.imageInfoMgmt",
            url: "#",
            icon: <ShoppingCartIcon/>,
            items: [
                {titleKey: "menu.imageAllList", url: "#"},
                {titleKey: "menu.imageLogoRegister", url: "#"},
                {titleKey: "menu.imageCoverPhotoRegister", url: "#"},
                {titleKey: "menu.imageBusinessPhotoRegister", url: "#"},
            ],
        },
        {
            titleKey: "menu.reservationSettingMgmt",
            url: "#",
            icon: <UserIcon/>,
            items: [
                {titleKey: "menu.reservationAllList", url: "#"},
                {titleKey: "menu.reservationSettingRegister", url: "#"},
            ],
        },
        {
            titleKey: "menu.postMgmt",
            url: "#",
            icon: <Settings2Icon/>,
            items: [
                {titleKey: "menu.postAllList", url: "#"},
                {titleKey: "menu.postInfoRegister", url: "#"},
            ],
        },
        {
            titleKey: "menu.reviewMgmt",
            url: "#",
            icon: <ChartLineIcon/>,
            items: [
                {titleKey: "menu.reviewAllList", url: "#"},
                {titleKey: "menu.reviewRequestInfoRegister", url: "#"},
            ],
        },
        {
            titleKey: "menu.qaMgmt",
            url: "#",
            icon: <ShoppingCartIcon/>,
            items: [
                {titleKey: "menu.qaAllList", url: "#"},
            ],
        },
        {
            titleKey: "menu.adminSetting",
            url: "#",
            icon: <Settings2Icon/>,
            items: [
                {titleKey: "menu.adminAllList", url: "#"},
                {titleKey: "menu.adminPermissionInfoRegister", url: "#"},
                {titleKey: "menu.adminNotice", url: "#"},
            ],
        },
        {
            titleKey: "menu.demo",
            url: "#",
            icon: <HomeIcon/>,
            isActive: true,
            items: [
                {titleKey: "menu.dataTable", url: "/demo/data_table"},
                {titleKey: "menu.gridTable", url: "/demo/grid_table"},
                {titleKey: "menu.chart", url: "/demo/chart"},
                {titleKey: "menu.form", url: "/demo/form"},
                {titleKey: "menu.dialog", url: "/demo/dialog"},
                {titleKey: "menu.api", url: "/demo/api"},
                {titleKey: "menu.typography", url: "/demo/typography"},
                {titleKey: "menu.editor", url: "/demo/editor"},
                {titleKey: "menu.image", url: "/demo/image"},
                {titleKey: "menu.notFound", url: "/demo/not_found"},
            ],
        },
    ],
    navSecondary: [
        { titleKey: "menu.sampleSecondary1", url: "#", icon: <LifeBuoy/> },
        { titleKey: "menu.sampleSecondary2", url: "#", icon: <Send/> },
    ],
};
