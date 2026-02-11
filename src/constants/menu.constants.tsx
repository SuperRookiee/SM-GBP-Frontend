import { ChartLineIcon, HomeIcon, LifeBuoy, Send, Settings2Icon, ShoppingCartIcon, UserIcon } from "lucide-react";

// Menu structure
export const MENU = {
    navMain: [
        {
            title: "Demo",
            url: "#",
            icon: <HomeIcon/>,
            isActive: true,
            items: [
                { title: "DataTable", url: "/demo/data_table" },
                { title: "Chart", url: "/demo/chart" },
                { title: "Form", url: "/demo/form" },
                { title: "Dialog", url: "/demo/dialog" },
                { title: "GridTable", url: "/demo/grid_table" },
                { title: "404", url: "/demo/not_found" },
            ],
        },
        {
            title: "Sample 1",
            url: "#",
            icon: <ChartLineIcon/>,
            items: [
                { title: "Sample 1-1", url: "#" },
                { title: "Sample 1-2", url: "#" },
            ],
        },
        {
            title: "Sample 2",
            url: "#",
            icon: <ShoppingCartIcon/>,
            items: [
                { title: "Sample 2-1", url: "#" },
                { title: "Sample 2-2", url: "#" },
            ],
        },
        { title: "User", url: "/user", icon: <UserIcon/> },
        { title: "Settings", url: "#", icon: <Settings2Icon/> },
    ],
    navSecondary: [
        { title: "sample_secondary 1", url: "#", icon: <LifeBuoy/> },
        { title: "sample_secondary 2", url: "#", icon: <Send/> },
    ],
}
