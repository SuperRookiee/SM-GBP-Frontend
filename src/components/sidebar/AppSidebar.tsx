import { ChevronRightIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MENU } from "@/constants/menu.constant.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Collapsible, CollapsibleContent, CollapsibleTrigger, } from '@/components/ui/collapsible'
import { Field } from "@/components/ui/field.tsx";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item.tsx";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail, useSidebar } from '@/components/ui/sidebar'

const AppSidebar = () => {
    const { isMobile, setOpenMobile } = useSidebar();
    const { t } = useTranslation();

// #. 메뉴 클릭 시 사이드바 닫기 동작을 처리한다.
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
                                        <ItemTitle className="text-sm">{t("sidebar.brand")}</ItemTitle>
                                        <ItemDescription>{t("sidebar.version")}</ItemDescription>
                                    </ItemContent>
                                </Item>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>{t("sidebar.group")}</SidebarGroupLabel>
                    <SidebarMenu>
                        {MENU.navMain.map(item =>
                            <Collapsible
                                key={item.titleKey}
                                asChild
                                defaultOpen={item.isActive}
                            >
                                <SidebarMenuItem>
                                    {item.items?.length ? (
                                        // 서브가 있으면: 메뉴 버튼 자체가 토글 트리거
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton tooltip={t(item.titleKey)} isActive={item.isActive}>
                                                {item.icon}
                                                <span>{t(item.titleKey)}</span>
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                    ) : (
                                        // 서브가 없으면: 링크 이동
                                        <SidebarMenuButton asChild tooltip={t(item.titleKey)} isActive={item.isActive}>
                                            <Link to={item.url} onClick={handleMenuClick}>
                                                {item.icon}
                                                <span>{t(item.titleKey)}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    )}
                                    {item.items?.length ? (
                                        <>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuAction className="data-[state=open]:rotate-90">
                                                    <ChevronRightIcon/>
                                                    <span className="sr-only">{t("sidebar.toggle")}</span>
                                                </SidebarMenuAction>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items.map(subItem =>
                                                        <SidebarMenuSubItem key={subItem.titleKey}>
                                                            <SidebarMenuSubButton asChild>
                                                                <Link to={subItem.url} onClick={handleMenuClick}>
                                                                    <span>{t(subItem.titleKey)}</span>
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
                                <SidebarMenuItem key={item.titleKey}>
                                    <SidebarMenuButton asChild size="sm">
                                        <Link to={item.url} onClick={handleMenuClick}>
                                            {item.icon}
                                            <span>{t(item.titleKey)}</span>
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
                            <CardTitle className="text-sm">{t("sidebar.cardTitle")}</CardTitle>
                            <CardDescription>{t("sidebar.cardDescription")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form>
                                <Field>
                                    <SidebarInput type="email" placeholder={t("sidebar.emailPlaceholder")}/>
                                    <Button
                                        className="bg-sidebar-primary text-sidebar-primary-foreground w-full"
                                        size="sm"
                                    >
                                        {t("sidebar.subscribe")}
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

