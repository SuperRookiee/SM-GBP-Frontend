import {useActionState, useEffect, useState} from "react";
import {useFormStatus} from "react-dom";
import {useTranslation} from "react-i18next";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {REMEMBER_ID_COOKIE_KEY, REMEMBER_ID_COOKIE_MAX_AGE} from "@/constants/auth.constant.ts";
import {useAuthStore} from "@/stores/auth.store.ts";
import {getCookie, removeCookie, setCookie} from "@/utils/cookie.ts";
import {PasswordInput} from "@/components/common/PasswordInput.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {USER_SAMPLE_DATA} from "@/tests/data/user.test.ts";

type LoginFormState = {
    submitted: boolean;
};

interface LoginSubmitButtonProps {
    disabled: boolean;
    text: string;
};

const findUserByLoginId = (loginId: string) =>
    USER_SAMPLE_DATA.find((user) => user.user_id.toLowerCase() === loginId.trim().toLowerCase());

const LoginSubmitButton = ({disabled, text}: LoginSubmitButtonProps) => {
    const {pending} = useFormStatus();

    return (
        <Button type="submit" className="h-9 md:mt-8.5 md:min-w-24 md:self-start" disabled={disabled || pending}>
            {text}
        </Button>
    );
};

const LoginPage = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const setUser = useAuthStore((s) => s.setUser);
    const savedId = getCookie(REMEMBER_ID_COOKIE_KEY) ?? "";
    const [id, setId] = useState(savedId);
    const [password, setPassword] = useState("");
    const [rememberId, setRememberId] = useState(Boolean(savedId));
    const from = location.state?.from?.pathname || "/"; // 인증이 필요한 페이지에서 넘어왔다면 원래 경로로 보낸다.

    const [formState, loginAction, isPending] = useActionState(
        (_prevState: LoginFormState, formData: FormData): LoginFormState => {
            const submittedId = String(formData.get("id") ?? "").trim();
            const submittedPassword = String(formData.get("password") ?? "").trim();
            const matchedUser = findUserByLoginId(submittedId);

            // #. 임시 로그인 규칙: ID는 user_id, 비밀번호는 password와 일치해야 로그인 성공
            if (matchedUser && submittedPassword === matchedUser.password) {
                if (rememberId) setCookie(REMEMBER_ID_COOKIE_KEY, submittedId, REMEMBER_ID_COOKIE_MAX_AGE);
                else removeCookie(REMEMBER_ID_COOKIE_KEY);

                setUser(matchedUser);
                navigate(from, {replace: true});
            }

            return {submitted: true};
        },
        {submitted: false},
    );

    const matchedUser = findUserByLoginId(id);
    const showIdError = formState.submitted && !matchedUser;
    const showPasswordError = formState.submitted && !!matchedUser && password.trim() !== matchedUser.password;
    const isFormReady = id.trim().length > 0 && password.trim().length > 0;

    // 아이디 저장 체크 상태에 따라 쿠키를 동기화
    useEffect(() => {
        if (!rememberId) {
            removeCookie(REMEMBER_ID_COOKIE_KEY);
            return;
        }

        if (id.trim()) setCookie(REMEMBER_ID_COOKIE_KEY, id.trim(), REMEMBER_ID_COOKIE_MAX_AGE);
    }, [id, rememberId]);

    return (
        <main className="relative flex min-h-full items-center justify-center px-4 py-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,hsl(var(--muted))_0%,transparent_55%)]"/>
            <Card className="w-full max-w-6xl border shadow-sm">
                <CardContent className="pt-6">
                    <form action={loginAction} className="space-y-4">
                        <p className="pb-2 text-center text-4xl font-extrabold tracking-tight">{t("login.wellcomeTitle")}</p>
                        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                            <div className="space-y-2">
                                <div className="flex min-h-7 items-center justify-between gap-2">
                                    <Label htmlFor="id">{t("login.emailLabel")} *</Label>
                                    <div className="inline-flex items-center gap-2">
                                        <Checkbox id="remember-id" checked={rememberId} onCheckedChange={(checked) => setRememberId(checked === true)}/>
                                        <Label htmlFor="remember-id">{t("login.rememberId")}</Label>
                                    </div>
                                </div>
                                <Input
                                    id="id"
                                    name="id"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    placeholder={t("login.emailPlaceholder")}
                                    autoComplete="username"
                                />
                                <p className="min-h-4 text-xs text-destructive" aria-live="polite">
                                    {showIdError ? t("login.emailError") : "\u00A0"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex min-h-7 items-center">
                                    <Label htmlFor="password">{t("login.password")} *</Label>
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t("login.passwordPlaceholder")}
                                    autoComplete="current-password"
                                    showLabel={t("login.showPassword")}
                                    hideLabel={t("login.hidePassword")}
                                />
                                <p className="min-h-4 text-xs text-destructive" aria-live="polite">
                                    {showPasswordError ? t("login.passwordError") : "\u00A0"}
                                </p>
                            </div>

                            <LoginSubmitButton disabled={!isFormReady || isPending} text={t("login.submit")}/>
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
                                <Link to="/sign-up" className="font-semibold text-primary underline underline-offset-2">
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


