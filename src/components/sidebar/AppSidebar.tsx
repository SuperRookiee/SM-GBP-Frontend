import { ChartLineIcon, ChevronRightIcon, HomeIcon, LifeBuoy, Send, Settings2Icon, ShoppingCartIcon, UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
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
                title: "Demo",
                url: "#",
                icon: <HomeIcon/>,
                isActive: true,
                items: [
                    { title: "Index", url: "/demo/index" },
                    { title: "Grid", url: "/demo/grid" },
                ],
            },
            {
                title: "Sample 1",
                url: "#",
                icon: <ChartLineIcon/>,
                items: [
                    {
                        title: "Sample 1-1",
                        url: "#",
                    },
                    {
                        title: "Sample 1-2",
                        url: "#",
                    },
                ],
            },
            {
                title: "Sample 2",
                url: "#",
                icon: <ShoppingCartIcon/>,
                items: [
                    {
                        title: "Sample 2-1",
                        url: "#",
                    },
                    {
                        title: "Sample 2-2",
                        url: "#",
                    },
                ],
            },
            {
                title: "User",
                url: "#",
                icon: <UserIcon/>,
            },
            {
                title: "Settings",
                url: "#",
                icon: <Settings2Icon/>,
            },
        ],
        navSecondary: [
            {
                title: "sample_secondary 1",
                url: "#",
                icon: <LifeBuoy/>,
            },
            {
                title: "sample_secondary 2",
                url: "#",
                icon: <Send/>,
            },
        ],
    }

    return (
        <Sidebar variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/">
                                <Item className="p-0" size="xs">
                                    <ItemContent>
                                        <ItemTitle className="text-sm">GBP</ItemTitle>
                                        <ItemDescription>v1.0.0</ItemDescription>
                                    </ItemContent>
                                </Item>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Demo</SidebarGroupLabel>
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
                                        <Link to={item.url}>
                                            {item.icon}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                    {item.items?.length ? (
                                        <>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuAction className="data-[state=open]:rotate-90">
                                                    <ChevronRightIcon/>
                                                    <span className="sr-only">Toggle</span>
                                                </SidebarMenuAction>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton asChild>
                                                                <Link to={subItem.url}>
                                                                    <span>{subItem.title}</span>
                                                                </Link>
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
                                        <Link to={item.url}>
                                            {item.icon}
                                            <span>{item.title}</span>
                                        </Link>
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
                                Lorem ipsum dolor sit amet
                            </CardTitle>
                            <CardDescription>
                                consectetur adipiscing elit. Integer semper, ante at malesuada aliquam, metus ante
                                condimentum arcu
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
                                        Lorem ipsum
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