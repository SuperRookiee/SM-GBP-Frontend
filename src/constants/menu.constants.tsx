import { ChartLineIcon, HomeIcon, LifeBuoy, Send, Settings2Icon, ShoppingCartIcon, UserIcon } from "lucide-react";

// Menu structure
export const MENU = {
    navMain: [
        {
            title: "Demo",
            URL: "#",
            icon: <HomeIcon/>,
            isActive: true,
            items: [
                { title: "Data Table", URL: "/demo/data_table" },
                { title: "Grid Table", URL: "/demo/grid_table" },
                { title: "Chart", URL: "/demo/chart" },
                { title: "Form", URL: "/demo/form" },
                { title: "Dialog", URL: "/demo/dialog" },
                { title: "API", URL: "/demo/api" },
                { title: "404", URL: "/demo/not_found" },
            ],
        },
        {
            title: "Sample 1",
            URL: "#",
            icon: <ChartLineIcon/>,
            items: [
                { title: "Sample 1-1", URL: "#" },
                { title: "Sample 1-2", URL: "#" },
            ],
        },
        {
            title: "Sample 2",
            URL: "#",
            icon: <ShoppingCartIcon/>,
            items: [
                { title: "Sample 2-1", URL: "#" },
                { title: "Sample 2-2", URL: "#" },
            ],
        },
        { title: "User", URL: "/user", icon: <UserIcon/> },
        { title: "Settings", URL: "#", icon: <Settings2Icon/> },
    ],
    navSecondary: [
        { title: "sample_secondary 1", URL: "#", icon: <LifeBuoy/> },
        { title: "sample_secondary 2", URL: "#", icon: <Send/> },
    ],
}
