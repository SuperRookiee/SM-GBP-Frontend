import {Bell, LogOut} from "lucide-react";
import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";
import {useAuthStore} from "@/stores/auth.store.ts";
import useLogout from "@/hooks/useLogout.tsx";
import LanguageToggle from "@/components/common/LanguageToggle.tsx";
import ThemeToggle from "@/components/common/ThemeToggle.tsx";
import {Button} from "@/components/ui/button.tsx";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu.tsx";

const Header = () => {
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const { logout } = useLogout();
    const notificationItems = [
        { id: "1", message: t("header.notice.admin"), date: t("header.notice.datePlaceholder") },
        { id: "2", message: t("header.notice.joinRequest"), date: t("header.notice.datePlaceholder") },
        { id: "3", message: t("header.notice.reservation"), date: t("header.notice.datePlaceholder") },
        { id: "4", message: t("header.notice.admin"), date: t("header.notice.datePlaceholder") },
        { id: "5", message: t("header.notice.joinRequest"), date: t("header.notice.datePlaceholder") },
        { id: "6", message: t("header.notice.reservation"), date: t("header.notice.datePlaceholder") },
        { id: "7", message: t("header.notice.admin"), date: t("header.notice.datePlaceholder") },
    ];

    return (
        <header className="flex items-center justify-between border-b px-4 py-2">
            <Link to={user ? "/" : "/login"} className="text-2xl font-black">SAMSUNG</Link>
            <div className="flex items-center gap-2">
                {user ? (
                    <Link to="/my_page" className="text-sm text-muted-foreground hover:underline">
                        {t("header.greeting", {name: user.name})}
                    </Link>
                ) : null}
                <ThemeToggle/>
                <LanguageToggle/>
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="relative" aria-label={t("header.notice.title")}>
                                <Bell className="size-4" />
                                {notificationItems.length > 0 ? (
                                    <span className="absolute -right-1 -top-1 min-w-4 rounded bg-destructive px-1 text-center text-[10px] font-semibold text-destructive-foreground">
                                        {notificationItems.length}
                                    </span>
                                ) : null}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-72 p-2">
                            <p className="px-2 py-1 text-sm font-semibold">{t("header.notice.title")}</p>
                            <ul className="space-y-1">
                                {notificationItems.map((item) => (
                                    <li key={item.id} className="rounded-md px-2 py-1.5 hover:bg-accent">
                                        <p className="text-sm">{item.message}</p>
                                        <p className="text-xs text-muted-foreground">{item.date}</p>
                                    </li>
                                ))}
                            </ul>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : null}
                {user ? (
                    <Button onClick={logout} variant="ghost">
                        <LogOut className="size-3.5" />
                        {t("common.logout")}
                    </Button>
                ) : null}
            </div>
        </header>
    );
};

export default Header;

