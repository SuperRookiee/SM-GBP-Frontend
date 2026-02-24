import {useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import {MENU} from "@/constants/menu.constants.tsx";
import {cn} from "@/utils/utils.ts";
import {NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle,} from "@/components/ui/navigation-menu.tsx";

const GNB = () => {
    const { t } = useTranslation();
    const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);

    const openMenu = useMemo(() =>
        MENU.navMain.find((item) => item.titleKey === openMenuKey && item.items?.length),
    [openMenuKey]);

    return (
        <div className="relative z-40 border-b bg-background" onMouseLeave={() => setOpenMenuKey(null)}>
            <div className="bg-zinc-900 px-2 py-0.5 text-white">
                <NavigationMenu className="max-w-none justify-start">
                    <NavigationMenuList className="w-full flex-wrap justify-start gap-0 space-x-0">
                        {MENU.navMain.map((item) => (
                            <NavigationMenuItem
                                key={item.titleKey}
                                onMouseEnter={() => setOpenMenuKey(item.items?.length ? item.titleKey : null)}
                            >
                                {item.items?.length ? (
                                    <button
                                        type="button"
                                        onFocus={() => setOpenMenuKey(item.titleKey)}
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            "h-auto rounded-none bg-transparent px-4 py-1.5 text-lg font-semibold text-white hover:bg-zinc-700 hover:text-white",
                                            openMenuKey === item.titleKey && "bg-zinc-700 text-white"
                                        )}
                                    >
                                        {t(item.titleKey)}
                                    </button>
                                ) : (
                                    <NavigationMenuLink asChild>
                                        <Link
                                            to={item.url === "#" ? "/" : item.url}
                                            onFocus={() => setOpenMenuKey(null)}
                                            onMouseEnter={() => setOpenMenuKey(null)}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                "h-auto rounded-none bg-transparent px-4 py-1.5 text-lg font-semibold text-white hover:bg-zinc-700 hover:text-white"
                                            )}
                                        >
                                            {t(item.titleKey)}
                                        </Link>
                                    </NavigationMenuLink>
                                )}
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            {openMenu?.items?.length ? (
                <div className="absolute left-0 top-full w-full border-y border-zinc-700 bg-zinc-900/98 text-white backdrop-blur">
                    <div className="mx-auto grid max-w-350 grid-cols-2 gap-x-8 gap-y-1 px-8 py-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {openMenu.items.map((subItem) => (
                            <div key={subItem.titleKey} className="min-h-8">
                                {subItem.url === "#" ? (
                                    <span className="block px-2 py-1.5 text-sm text-zinc-300">{t(subItem.titleKey)}</span>
                                ) : (
                                    <Link
                                        to={subItem.url}
                                        onClick={() => setOpenMenuKey(null)}
                                        className="block rounded-md px-2 py-1.5 text-sm text-zinc-100 transition-colors hover:bg-white/10 hover:text-white"
                                    >
                                        {t(subItem.titleKey)}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default GNB;
