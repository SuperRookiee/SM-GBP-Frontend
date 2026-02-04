import { MoreHorizontalIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu'
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

const AppSidebar = () => {
    const data = {
        navMain: [
            {
                title: "Getting Started",
                url: "#",
                items: [
                    {
                        title: "Installation",
                        url: "#",
                    },
                    {
                        title: "Project Structure",
                        url: "#",
                    },
                ],
            },
            {
                title: "Building Your Application",
                url: "#",
                items: [
                    {
                        title: "Routing",
                        url: "#",
                    },
                    {
                        title: "Data Fetching",
                        url: "#",
                        isActive: true,
                    },
                    {
                        title: "Rendering",
                        url: "#",
                    },
                    {
                        title: "Caching",
                        url: "#",
                    },
                    {
                        title: "Styling",
                        url: "#",
                    },
                    {
                        title: "Optimizing",
                        url: "#",
                    },
                    {
                        title: "Configuring",
                        url: "#",
                    },
                    {
                        title: "Testing",
                        url: "#",
                    },
                    {
                        title: "Authentication",
                        url: "#",
                    },
                    {
                        title: "Deploying",
                        url: "#",
                    },
                    {
                        title: "Upgrading",
                        url: "#",
                    },
                    {
                        title: "Examples",
                        url: "#",
                    },
                ],
            },
            {
                title: "API Reference",
                url: "#",
                items: [
                    {
                        title: "Components",
                        url: "#",
                    },
                    {
                        title: "File Conventions",
                        url: "#",
                    },
                    {
                        title: "Functions",
                        url: "#",
                    },
                    {
                        title: "next.config.js Options",
                        url: "#",
                    },
                    {
                        title: "CLI",
                        url: "#",
                    },
                    {
                        title: "Edge Runtime",
                        url: "#",
                    },
                ],
            },
            {
                title: "Architecture",
                url: "#",
                items: [
                    {
                        title: "Accessibility",
                        url: "#",
                    },
                    {
                        title: "Fast Refresh",
                        url: "#",
                    },
                    {
                        title: "Next.js Compiler",
                        url: "#",
                    },
                    {
                        title: "Supported Browsers",
                        url: "#",
                    },
                    {
                        title: "Turbopack",
                        url: "#",
                    },
                ],
            },
        ],
    }

    return (
        <Sidebar variant="floating">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {data.navMain.map((item) => (
                            <DropdownMenu key={item.title}>
                                <SidebarMenuItem>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuButton
                                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                                            {item.title}{" "}
                                            <MoreHorizontalIcon className="ml-auto"/>
                                        </SidebarMenuButton>
                                    </DropdownMenuTrigger>
                                    {item.items?.length ? (
                                        <DropdownMenuContent side="right" align="start">
                                            <DropdownMenuGroup>
                                                {item.items.map((subItem) => (
                                                    <DropdownMenuItem asChild key={subItem.title}>
                                                        <a href={subItem.url}>{subItem.title}</a>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    ) : null}
                                </SidebarMenuItem>
                            </DropdownMenu>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};

export default AppSidebar;