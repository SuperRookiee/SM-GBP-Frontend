import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MENU } from "@/constants/menu.constants.tsx";
import { cn } from "@/utils/utils.ts";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuLink,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu.tsx";

const AppGnb = () => {
    const { t } = useTranslation();

    return (
        <div className="border-b bg-background">
            <div className="border-b px-4 py-2">
                <Link to="/" className="text-2xl font-black tracking-tight">SAMSUNG</Link>
            </div>
            <div className="bg-zinc-900 px-2 py-0.5 text-white">
                <NavigationMenu className="max-w-none justify-start">
                    <NavigationMenuList className="w-full flex-wrap justify-start gap-0 space-x-0">
                        {MENU.navMain.map(item => (
                            <NavigationMenuItem key={item.titleKey}>
                                <NavigationMenuLink asChild>
                                    <Link
                                        to={item.url === "#" ? "/" : item.url}
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            "h-auto rounded-none bg-transparent px-4 py-1.5 text-lg font-semibold text-white hover:bg-zinc-700 hover:text-white"
                                        )}
                                    >
                                        {t(item.titleKey)}
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
            <div className="bg-zinc-100 px-4 py-4">
                <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
                    {MENU.navMain.map(item => (
                        <div key={`${item.titleKey}-depth2`} className="space-y-2">
                            <p className="text-base font-semibold text-zinc-900">{t(item.titleKey)}</p>
                            <ul className="space-y-1">
                                {(item.items?.length ? item.items : [{ titleKey: item.titleKey, url: item.url }]).map(subItem => (
                                    <li key={`${item.titleKey}-${subItem.titleKey}`}>
                                        <Link
                                            className="text-sm text-zinc-700 hover:text-zinc-950 hover:underline"
                                            to={subItem.url === "#" ? "/" : subItem.url}
                                        >
                                            {t(subItem.titleKey)}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AppGnb;
