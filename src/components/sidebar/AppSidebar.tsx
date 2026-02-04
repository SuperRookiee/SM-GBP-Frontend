import { ChartLineIcon, ChevronRightIcon, FileIcon, HomeIcon, LifeBuoy, Send, Settings2Icon, ShoppingBagIcon, ShoppingCartIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Collapsible, CollapsibleContent, CollapsibleTrigger, } from '@/components/ui/collapsible'
import { Field } from "@/components/ui/field.tsx";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item.tsx";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail } from '@/components/ui/sidebar'

const AppSidebar = () => {
    const data = {
        navMain: [
            {
                title: "Dashboard",
                url: "#",
                icon: (
                    <HomeIcon
                    />
                ),
                isActive: true,
                items: [
                    {
                        title: "Overview",
                        url: "#",
                    },
                    {
                        title: "Analytics",
                        url: "#",
                    },
                ],
            },
            {
                title: "Analytics",
                url: "#",
                icon: (
                    <ChartLineIcon
                    />
                ),
                items: [
                    {
                        title: "Reports",
                        url: "#",
                    },
                    {
                        title: "Metrics",
                        url: "#",
                    },
                ],
            },
            {
                title: "Orders",
                url: "#",
                icon: (
                    <ShoppingBagIcon
                    />
                ),
                items: [
                    {
                        title: "All Orders",
                        url: "#",
                    },
                    {
                        title: "Pending",
                        url: "#",
                    },
                    {
                        title: "Completed",
                        url: "#",
                    },
                ],
            },
            {
                title: "Products",
                url: "#",
                icon: (
                    <ShoppingCartIcon
                    />
                ),
                items: [
                    {
                        title: "All Products",
                        url: "#",
                    },
                    {
                        title: "Categories",
                        url: "#",
                    },
                ],
            },
            {
                title: "Invoices",
                url: "#",
                icon: (
                    <FileIcon
                    />
                ),
            },
            {
                title: "Customers",
                url: "#",
                icon: (
                    <UserIcon
                    />
                ),
            },
            {
                title: "Settings",
                url: "#",
                icon: (
                    <Settings2Icon
                    />
                ),
            },
        ],
        navSecondary: [
            {
                title: "Support",
                url: "#",
                icon: (
                    <LifeBuoy
                    />
                ),
            },
            {
                title: "Feedback",
                url: "#",
                icon: (
                    <Send
                    />
                ),
            },
        ],
    }

    return (
        <Sidebar variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <Item className="p-0" size="xs">
                                    <ItemContent>
                                        <ItemTitle className="text-sm">Documentation</ItemTitle>
                                        <ItemDescription>v1.0.0</ItemDescription>
                                    </ItemContent>
                                </Item>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
                    <SidebarMenu>
                        {data.navMain.map((item) => (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={item.isActive}
                            >
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={item.isActive}
                                    >
                                        <a href={item.url}>
                                            {item.icon}
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                    {item.items?.length ? (
                                        <>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuAction className="data-[state=open]:rotate-90">
                                                    <ChevronRightIcon />
                                                    <span className="sr-only">Toggle</span>
                                                </SidebarMenuAction>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton asChild>
                                                                <a href={subItem.url}>
                                                                    <span>{subItem.title}</span>
                                                                </a>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </>
                                    ) : null}
                                </SidebarMenuItem>
                            </Collapsible>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup className="mt-auto">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.navSecondary.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild size="sm">
                                        <a href={item.url}>
                                            {item.icon}
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarGroup>
                    <Card size="sm" className="-mx-2">
                        <CardHeader>
                            <CardTitle className="text-sm">
                                Subscribe to our newsletter
                            </CardTitle>
                            <CardDescription>
                                Opt-in to receive updates and news about the sidebar.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form>
                                <Field>
                                    <SidebarInput type="email" placeholder="Email"/>
                                    <Button
                                        className="bg-sidebar-primary text-sidebar-primary-foreground w-full"
                                        size="sm"
                                    >
                                        Subscribe
                                    </Button>
                                </Field>
                            </form>
                        </CardContent>
                    </Card>
                </SidebarGroup>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    );
};

export default AppSidebar;