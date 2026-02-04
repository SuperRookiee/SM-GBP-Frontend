import { ChartLineIcon, ChevronRightIcon, HomeIcon, LifeBuoy, Send, Settings2Icon, ShoppingCartIcon, UserIcon } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Collapsible, CollapsibleContent, CollapsibleTrigger, } from '@/components/ui/collapsible'
import { Field } from "@/components/ui/field.tsx";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item.tsx";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail, useSidebar } from '@/components/ui/sidebar'

const AppSidebar = () => {
    const { isMobile, setOpenMobile } = useSidebar();

    const handleMenuClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    }

    const menu = {
        navMain: [
            {
                title: "Demo",
                url: "#",
                icon: <HomeIcon/>,
                isActive: true,
                items: [
                    { title: "Index", url: "/demo/index" },
                    { title: "Grid", url: "/demo/grid" },
                    { title: "Chart", url: "/demo/chart" },
                    { title: "Popup", url: "/demo/popup" },
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
            { title: "User", url: "#", icon: <UserIcon/> },
            { title: "Settings", url: "#", icon: <Settings2Icon/> },
        ],
        navSecondary: [
            { title: "sample_secondary 1", url: "#", icon: <LifeBuoy/> },
            { title: "sample_secondary 2", url: "#", icon: <Send/> },
        ],
    }

    return (
        <Sidebar variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/" onClick={handleMenuClick}>
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
                        {menu.navMain.map((item) => (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={item.isActive}
                            >
                                <SidebarMenuItem>
                                    {item.items?.length ? (
                                        // 서브가 있으면: 메뉴 버튼 자체가 토글 트리거
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton tooltip={item.title} isActive={item.isActive}>
                                                {item.icon}
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                    ) : (
                                        // 서브가 없으면: 기존처럼 링크 이동
                                        <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                                            <Link to={item.url} onClick={handleMenuClick}>
                                                {item.icon}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    )}
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
                                                    {item.items.map(subItem =>
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton asChild>
                                                                <Link to={subItem.url} onClick={handleMenuClick}>
                                                                    <span>{subItem.title}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    )}
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
                            {menu.navSecondary.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild size="sm">
                                        <Link to={item.url} onClick={handleMenuClick}>
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