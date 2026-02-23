import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { REMEMBER_ID_COOKIE_KEY, REMEMBER_ID_COOKIE_MAX_AGE } from "@/constants/auth.constants.ts";
import { useAuthStore } from "@/stores/auth.store.ts";
import { getCookie, removeCookie, setCookie } from "@/utils/cookie.ts";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";

const LoginPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const setUser = useAuthStore((s) => s.setUser);
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [rememberId, setRememberId] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const from = location.state?.from?.pathname || "/";
    const showIdError = submitted && id !== "1";
    const showPasswordError = submitted && password !== "1";

    useEffect(() => {
        const savedId = getCookie(REMEMBER_ID_COOKIE_KEY);
        if (!savedId) return;

        setId(savedId);
        setRememberId(true);
    }, []);

    useEffect(() => {
        if (!rememberId) {
            removeCookie(REMEMBER_ID_COOKIE_KEY);
            return;
        }

        if (id.trim()) setCookie(REMEMBER_ID_COOKIE_KEY, id.trim(), REMEMBER_ID_COOKIE_MAX_AGE);
    }, [id, rememberId]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        if (id === "1" && password === "1") {
            if (rememberId) setCookie(REMEMBER_ID_COOKIE_KEY, id.trim(), REMEMBER_ID_COOKIE_MAX_AGE);
            else removeCookie(REMEMBER_ID_COOKIE_KEY);
            setUser({ id: 1, name: t("login.admin"), role: "admin", user_id: "admin" });
            navigate(from, { replace: true });
        }
    };

    return (
        <main className="relative flex min-h-full items-center justify-center px-4 py-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,hsl(var(--muted))_0%,transparent_55%)]" />
            <Card className="w-full max-w-6xl border shadow-sm">
                <CardContent className="pt-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <p className="pb-2 text-center text-4xl font-extrabold tracking-tight">{t("login.wellcomeTitle")}</p>
                        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                            <div className="space-y-2">
                                <div className="flex min-h-7 items-center justify-between gap-2">
                                    <Label htmlFor="id">{t("login.emailLabel")} *</Label>
                                    <div className="inline-flex items-center gap-2">
                                        <Checkbox id="remember-id" checked={rememberId} onCheckedChange={(checked) => setRememberId(checked === true)} />
                                        <Label htmlFor="remember-id">{t("login.rememberId")}</Label>
                                    </div>
                                </div>
                                <Input
                                    id="id"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    placeholder={t("login.emailPlaceholder")}
                                    autoComplete="username"
                                />
                                {showIdError ? <p className="text-xs text-destructive">{t("login.emailError")}</p> : null}
                            </div>

                            <div className="space-y-2">
                                <div className="flex min-h-7 items-center">
                                    <Label htmlFor="password">{t("login.password")} *</Label>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t("login.passwordPlaceholder")}
                                        autoComplete="current-password"
                                        type={showPassword ? "text" : "password"}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                                    >
                                        {showPassword ? <Eye className="size-4"/> : <EyeOff className="size-4"/>}
                                    </button>
                                </div>
                                {showPasswordError ? <p className="text-xs text-destructive">{t("login.passwordError")}</p> : null}
                            </div>

                            <Button type="submit" className="h-9 md:min-w-24">
                                {t("login.submit")}
                            </Button>
                        </div>

                        <div className="border-t pt-3 text-sm text-muted-foreground">
                            <p className="py-1">
                                <span className="mr-1 text-foreground">1.</span>
                                {t("login.forgotPasswordPrefix")}{" "}
                                <Link to="/forgot-password" className="font-semibold text-primary underline underline-offset-2">
                                    {t("login.forgotPasswordLink")}
                                </Link>
                            </p>
                            <p className="py-1">
                                <span className="mr-1 text-foreground">2.</span>
                                {t("login.signupPrefix")}{" "}
                                <Link to="/signup" className="font-semibold text-primary underline underline-offset-2">
                                    {t("login.signup")}
                                </Link>
                            </p>
                            <p className="py-1">
                                <span className="mr-1 text-foreground">3.</span>
                                {t("login.customerHelp")} <span className="font-semibold text-foreground">{t("login.customerCenterTel")}</span>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
};

export default LoginPage;
