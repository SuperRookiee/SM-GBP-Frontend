import { ChevronRightIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { MENU } from "@/constants/menu.constants.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Collapsible, CollapsibleContent, CollapsibleTrigger, } from '@/components/ui/collapsible'
import { Field } from "@/components/ui/field.tsx";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item.tsx";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail, useSidebar } from '@/components/ui/sidebar'

const AppSidebar = () => {
    const { isMobile, setOpenMobile } = useSidebar();

    const handleMenuClick = () => {
        if (isMobile) setOpenMobile(false);
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
                                        <ItemTitle className="text-sm">Miracle</ItemTitle>
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
                        {MENU.navMain.map(item =>
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
                                        // 서브가 없으면: 링크 이동
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
                        )}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup className="mt-auto">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {MENU.navSecondary.map(item =>
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild size="sm">
                                        <Link to={item.url} onClick={handleMenuClick}>
                                            {item.icon}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
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
