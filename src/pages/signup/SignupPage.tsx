import { type ReactNode, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { cn } from "@/utils/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

type TermKey = "service" | "privacy" | "overseas" | "marketing";

type FormValues = {
    authority: string;
    corporation: string;
    country: string;
    name: string;
    department: string;
    phoneCountry: string;
    phone: string;
    email: string;
    authCode: string;
    password: string;
    confirmPassword: string;
    permissionLevel: string;
};

type TermMeta = {
    label: string;
    required: boolean;
    title: string;
    body: string[];
};

const DEFAULT_FORM: FormValues = {
    authority: "",
    corporation: "",
    country: "",
    name: "",
    department: "",
    phoneCountry: "+82",
    phone: "",
    email: "",
    authCode: "",
    password: "",
    confirmPassword: "",
    permissionLevel: "",
};

const SignupPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [form, setForm] = useState<FormValues>(DEFAULT_FORM);
    const [agreements, setAgreements] = useState<Record<TermKey, boolean>>({
        service: false,
        privacy: false,
        overseas: false,
        marketing: false,
    });
    const [submitted, setSubmitted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [openTerm, setOpenTerm] = useState<TermKey | null>(null);
    const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

    // 약관 타입별 라벨/본문을 한곳에서 관리한다.
    const termMeta = useMemo<Record<TermKey, TermMeta>>(
        () => ({
            service: {
                label: t("signup.terms.service.label"),
                required: true,
                title: t("signup.terms.service.title"),
                body: t("signup.terms.service.body", { returnObjects: true }) as string[],
            },
            privacy: {
                label: t("signup.terms.privacy.label"),
                required: true,
                title: t("signup.terms.privacy.title"),
                body: t("signup.terms.privacy.body", { returnObjects: true }) as string[],
            },
            overseas: {
                label: t("signup.terms.overseas.label"),
                required: true,
                title: t("signup.terms.overseas.title"),
                body: t("signup.terms.overseas.body", { returnObjects: true }) as string[],
            },
            marketing: {
                label: t("signup.terms.marketing.label"),
                required: false,
                title: t("signup.terms.marketing.title"),
                body: t("signup.terms.marketing.body", { returnObjects: true }) as string[],
            },
        }),
        [t],
    );

    const allAgreed = useMemo(() => Object.values(agreements).every(Boolean), [agreements]);

    // 제출 시 재사용할 유효성 검사 스키마를 메모이징한다.
    const signupSchema = useMemo(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d+$/;
        const authCodeRegex = /^\d{6}$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,12}$/;

        return z.object({
            form: z.object({
                authority: z.string().trim().min(1, "signup.errors.authority"),
                corporation: z.string().trim().min(1, "signup.errors.corporation"),
                country: z.string(),
                name: z.string().trim().min(1, "signup.errors.name"),
                department: z.string().trim().min(1, "signup.errors.department"),
                phoneCountry: z.string(),
                phone: z.string().trim()
                    .min(1, "signup.errors.phone")
                    .refine((value) => phoneRegex.test(value), "signup.errors.phoneInvalid"),
                email: z.string().trim()
                    .min(1, "signup.errors.emailRequired")
                    .refine((value) => emailRegex.test(value), "signup.errors.emailInvalid"),
                authCode: z.string().trim()
                    .min(1, "signup.errors.authCodeRequired")
                    .refine((value) => authCodeRegex.test(value), "signup.errors.authCodeInvalid"),
                password: z.string().trim()
                    .min(1, "signup.errors.passwordRequired")
                    .refine((value) => passwordRegex.test(value), "signup.errors.passwordRule"),
                confirmPassword: z.string().trim().min(1, "signup.errors.confirmPasswordRequired"),
                permissionLevel: z.string().trim().min(1, "signup.errors.permissionLevel"),
            }),
            agreements: z.object({
                service: z.boolean(),
                privacy: z.boolean(),
                overseas: z.boolean(),
                marketing: z.boolean(),
            }),
        }).superRefine((value, ctx) => {
            if (value.form.password && value.form.confirmPassword && value.form.password !== value.form.confirmPassword) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["form", "confirmPassword"],
                    message: "signup.errors.confirmPassword",
                });
            }

            if (!value.agreements.service || !value.agreements.privacy || !value.agreements.overseas) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["agreements", "all"],
                    message: "signup.errors.requiredAgreement",
                });
            }
            if (!value.agreements.service) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["agreements", "service"],
                    message: "signup.errors.requiredServiceAgreement",
                });
            }
            if (!value.agreements.privacy) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["agreements", "privacy"],
                    message: "signup.errors.requiredPrivacyAgreement",
                });
            }
            if (!value.agreements.overseas) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["agreements", "overseas"],
                    message: "signup.errors.requiredOverseasAgreement",
                });
            }
        });
    }, []);

    const getErrors = (key: string) => (submitted ? (validationErrors[key] || []) : []);
    const getErrorMessages = (key: string) => getErrors(key).map((errorKey) => t(errorKey));

    const onChangeField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    // 전체 동의 체크 시 개별 약관 상태를 일괄 반영한다.
    const onToggleAll = (checked: boolean) => {
        setAgreements({
            service: checked,
            privacy: checked,
            overseas: checked,
            marketing: checked,
        });
    };

    const onToggleAgreement = (key: TermKey, checked: boolean) => {
        setAgreements((prev) => ({ ...prev, [key]: checked }));
    };

    // 제출 시 스키마 검증 후 에러를 매핑하거나 완료 다이얼로그를 연다.
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        const result = signupSchema.safeParse({ form, agreements });
        if (!result.success) {
            const nextErrors: Record<string, string[]> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path.join(".");
                if (!nextErrors[path]) nextErrors[path] = [];
                nextErrors[path].push(issue.message);
            });
            setValidationErrors(nextErrors);
            return;
        }

        setValidationErrors({});
        setOpenCompleteDialog(true);
    };

    return (
        <>
            <main className="px-4 py-8">
                <Card className="mx-auto w-full max-w-5xl border shadow-sm">
                    <CardContent className="space-y-8 pt-8">
                        <section className="space-y-3">
                            <p className="text-3xl font-bold tracking-tight">{t("signup.title")}</p>
                            <p className="text-base leading-6 text-foreground/90">
                                {t("signup.intro1")}<br/>
                                {t("signup.intro2")}
                            </p>
                        </section>

                        <form onSubmit={onSubmit} className="space-y-8">
                            <section className="space-y-3">
                                <SectionTitle title={t("signup.sections.affiliation")} required hint={t("signup.requiredHint")} />
                                <div className="grid gap-3 md:grid-cols-3">
                                    <FieldBlock label={t("signup.fields.authority")} required errors={getErrorMessages("form.authority")}>
                                        <Select value={form.authority} onValueChange={(value) => onChangeField("authority", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("signup.placeholders.select")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="default">{t("signup.options.authority.default")}</SelectItem>
                                                <SelectItem value="hq">{t("signup.options.authority.hq")}</SelectItem>
                                                <SelectItem value="asia">{t("signup.options.authority.asia")}</SelectItem>
                                                <SelectItem value="europe">{t("signup.options.authority.europe")}</SelectItem>
                                                <SelectItem value="latam">{t("signup.options.authority.latam")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FieldBlock>

                                    <FieldBlock label={t("signup.fields.corporation")} required errors={getErrorMessages("form.corporation")}>
                                        <Select value={form.corporation} onValueChange={(value) => onChangeField("corporation", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("signup.placeholders.select")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t("signup.options.corporation.all")}</SelectItem>
                                                <SelectItem value="sec">{t("signup.options.corporation.sec")}</SelectItem>
                                                <SelectItem value="sdc">{t("signup.options.corporation.sdc")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FieldBlock>

                                    <FieldBlock label={t("signup.fields.countryOptional")}>
                                        <Select value={form.country} onValueChange={(value) => onChangeField("country", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("signup.placeholders.select")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kr">{t("signup.options.country.kr")}</SelectItem>
                                                <SelectItem value="us">{t("signup.options.country.us")}</SelectItem>
                                                <SelectItem value="uk">{t("signup.options.country.uk")}</SelectItem>
                                                <SelectItem value="de">{t("signup.options.country.de")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FieldBlock>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <SectionTitle title={t("signup.sections.personal")} required hint={t("signup.requiredHint")} />

                                <div className="grid gap-3 md:grid-cols-2">
                                    <FieldBlock label={t("signup.fields.name")} required errors={getErrorMessages("form.name")}>
                                        <Input value={form.name} onChange={(e) => onChangeField("name", e.target.value)} />
                                    </FieldBlock>
                                    <FieldBlock label={t("signup.fields.department")} required errors={getErrorMessages("form.department")}>
                                        <Input value={form.department} onChange={(e) => onChangeField("department", e.target.value)} />
                                    </FieldBlock>
                                </div>

                                <FieldBlock label={t("signup.fields.phone")} required errors={getErrorMessages("form.phone")}>
                                    <div className="grid gap-2 md:grid-cols-[160px_1fr]">
                                        <Select value={form.phoneCountry} onValueChange={(value) => onChangeField("phoneCountry", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("signup.placeholders.countryCode")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="+82">{t("signup.options.phoneCode.kr")}</SelectItem>
                                                <SelectItem value="+1">{t("signup.options.phoneCode.us")}</SelectItem>
                                                <SelectItem value="+44">{t("signup.options.phoneCode.uk")}</SelectItem>
                                                <SelectItem value="+49">{t("signup.options.phoneCode.de")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            value={form.phone}
                                            onChange={(e) => onChangeField("phone", e.target.value)}
                                            placeholder={t("signup.placeholders.phoneNumber")}
                                        />
                                    </div>
                                </FieldBlock>

                                <FieldBlock label={t("signup.fields.emailId")} required errors={[...getErrorMessages("form.email"), ...getErrorMessages("form.authCode")]}>
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Input
                                                value={form.email}
                                                onChange={(e) => onChangeField("email", e.target.value)}
                                                placeholder={t("signup.placeholders.email")}
                                                className="min-w-56 flex-1"
                                            />
                                            <Button type="button" variant="secondary">{t("signup.buttons.checkDuplicate")}</Button>
                                            <Button type="button">{t("signup.buttons.sendAuthCode")}</Button>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Input
                                                value={form.authCode}
                                                onChange={(e) => onChangeField("authCode", e.target.value)}
                                                placeholder={t("signup.placeholders.authCode")}
                                                className="min-w-44 flex-1"
                                            />
                                            <Button type="button" variant="outline">{t("signup.buttons.completeAuth")}</Button>
                                        </div>
                                    </div>
                                </FieldBlock>

                                <FieldBlock label={t("signup.fields.password")} required errors={getErrorMessages("form.password")}>
                                    <PasswordInput
                                        value={form.password}
                                        onChange={(value) => onChangeField("password", value)}
                                        show={showPassword}
                                        onToggleShow={() => setShowPassword((prev) => !prev)}
                                    />
                                </FieldBlock>

                                <FieldBlock label={t("signup.fields.confirmPassword")} required errors={getErrorMessages("form.confirmPassword")}>
                                    <PasswordInput
                                        value={form.confirmPassword}
                                        onChange={(value) => onChangeField("confirmPassword", value)}
                                        show={showConfirmPassword}
                                        onToggleShow={() => setShowConfirmPassword((prev) => !prev)}
                                    />
                                </FieldBlock>
                            </section>

                            <section className="space-y-3">
                                <SectionTitle title={t("signup.sections.permission")} required hint={t("signup.requiredHint")} />
                                <FieldBlock label={t("signup.fields.permissionLevel")} required errors={getErrorMessages("form.permissionLevel")}>
                                    <Select value={form.permissionLevel} onValueChange={(value) => onChangeField("permissionLevel", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("signup.placeholders.select")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">{t("signup.options.permissionLevel.default")}</SelectItem>
                                            <SelectItem value="hq_manager">{t("signup.options.permissionLevel.hqManager")}</SelectItem>
                                            <SelectItem value="hq_admin">{t("signup.options.permissionLevel.hqAdmin")}</SelectItem>
                                            <SelectItem value="store_manager">{t("signup.options.permissionLevel.storeManager")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FieldBlock>
                            </section>

                            <section className="space-y-3">
                                <div className="space-y-2 rounded-md border p-4">
                                    <Label className="flex cursor-pointer items-center gap-2 text-base">
                                        <Checkbox checked={allAgreed} onCheckedChange={(checked) => onToggleAll(checked === true)} />
                                        {t("signup.agreements.all")}
                                    </Label>

                                    <div className="space-y-2 pl-0.5">
                                        {(Object.keys(termMeta) as TermKey[]).map((key) => (
                                            <div key={key} className="flex items-center gap-2 text-sm">
                                                <Checkbox checked={agreements[key]} onCheckedChange={(checked) => onToggleAgreement(key, checked === true)} />
                                                <span>{termMeta[key].label}</span>
                                                <button
                                                    type="button"
                                                    className="font-semibold underline underline-offset-2"
                                                    onClick={() => setOpenTerm(key)}
                                                >
                                                    {t("signup.buttons.viewFull")}
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-1">
                                        {getErrorMessages("agreements.all").map((error, index) => (
                                            <p key={`agreements-all-${index}`} className="text-sm text-destructive">!! {error}</p>
                                        ))}
                                        {getErrorMessages("agreements.service").map((error, index) => (
                                            <p key={`agreements-service-${index}`} className="text-sm text-destructive">!! {error}</p>
                                        ))}
                                        {getErrorMessages("agreements.privacy").map((error, index) => (
                                            <p key={`agreements-privacy-${index}`} className="text-sm text-destructive">!! {error}</p>
                                        ))}
                                        {getErrorMessages("agreements.overseas").map((error, index) => (
                                            <p key={`agreements-overseas-${index}`} className="text-sm text-destructive">!! {error}</p>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <div className="flex items-center justify-center gap-3 border-t pt-5">
                                <Button type="button" variant="secondary" className="min-w-32" onClick={() => navigate("/login")}>{t("signup.buttons.moveToMain")}</Button>
                                <Button type="submit" className="min-w-32">{t("signup.buttons.apply")}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>

            <Dialog open={openTerm !== null} onOpenChange={(open) => setOpenTerm(open ? openTerm : null)}>
                <DialogContent className="max-h-[80svh] overflow-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{openTerm ? termMeta[openTerm].title : ""}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-sm leading-6">
                        {openTerm ? termMeta[openTerm].body.map((line) => <p key={line}>{line}</p>) : null}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            onClick={() => {
                                if (openTerm) onToggleAgreement(openTerm, true);
                                setOpenTerm(null);
                            }}
                        >
                            {t("signup.buttons.agree")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={openCompleteDialog} onOpenChange={setOpenCompleteDialog}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{t("signup.completeDialog.title")}</DialogTitle>
                    </DialogHeader>
                    <p className="text-center text-base leading-7">
                        {t("signup.completeDialog.line1")}<br/>
                        {t("signup.completeDialog.line2")}<br/>
                        {t("signup.completeDialog.line3")}
                    </p>
                    <DialogFooter className="sm:justify-center">
                        <Button type="button" onClick={() => navigate("/login")}>{t("signup.buttons.confirm")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

type SectionTitleProps = {
    title: string;
    required?: boolean;
    hint?: string;
};

const SectionTitle = ({ title, required, hint }: SectionTitleProps) => {
    return (
        <div className="flex items-center justify-between border-b pb-2">
            <p className="text-2xl font-bold">{title}</p>
            {required ? <p className="text-sm text-destructive">{hint}</p> : null}
        </div>
    );
};

type FieldBlockProps = {
    label: string;
    required?: boolean;
    errors?: string[];
    children: ReactNode;
};

const FieldBlock = ({ label, required, errors = [], children }: FieldBlockProps) => {
    return (
        <div className="rounded-md border">
            <div className="grid gap-0 md:grid-cols-[170px_1fr]">
                <div className="flex items-center bg-muted px-4 py-3 text-sm font-semibold">
                    {label} {required ? "*" : ""}
                </div>
                <div className="space-y-1 px-3 py-2">
                    {children}
                    {errors.map((error, index) => (
                        <p key={`${error}-${index}`} className="text-sm text-destructive">!! {error}</p>
                    ))}
                </div>
            </div>
        </div>
    );
};

type PasswordInputProps = {
    value: string;
    onChange: (value: string) => void;
    show: boolean;
    onToggleShow: () => void;
};

const PasswordInput = ({ value, onChange, show, onToggleShow }: PasswordInputProps) => {
    return (
        <div className="relative">
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                type={show ? "text" : "password"}
                className={cn("pr-10")}
            />
            <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={onToggleShow}
            >
                {show ? <Eye className="size-4"/> : <EyeOff className="size-4"/>}
            </button>
        </div>
    );
};

export default SignupPage;
