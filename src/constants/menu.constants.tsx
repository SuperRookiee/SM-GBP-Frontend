import { ChartLineIcon, HomeIcon, LifeBuoy, Send, Settings2Icon, ShoppingCartIcon, UserIcon } from "lucide-react";

export const MENU = {
    navMain: [
        {
            titleKey: "menu.demo",
            url: "#",
            icon: <HomeIcon/>,
            isActive: true,
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
        {
            titleKey: "menu.sample1",
            url: "#",
            icon: <ChartLineIcon/>,
            items: [
                { titleKey: "menu.sample11", url: "#" },
                { titleKey: "menu.sample12", url: "#" },
            ],
        },
        {
            titleKey: "menu.sample2",
            url: "#",
            icon: <ShoppingCartIcon/>,
            items: [
                { titleKey: "menu.sample21", url: "#" },
                { titleKey: "menu.sample22", url: "#" },
            ],
        },
        { titleKey: "menu.user", url: "/user", icon: <UserIcon/> },
        { titleKey: "menu.settings", url: "#", icon: <Settings2Icon/> },
    ],
    navSecondary: [
        { titleKey: "menu.sampleSecondary1", url: "#", icon: <LifeBuoy/> },
        { titleKey: "menu.sampleSecondary2", url: "#", icon: <Send/> },
    ],
};
