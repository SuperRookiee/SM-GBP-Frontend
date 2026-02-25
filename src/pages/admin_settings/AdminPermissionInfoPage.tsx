import {type JSX, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {z} from "zod";
import {SIGNUP_AUTHORITY_OPTIONS, CORPORATION_LABEL_KEY_BY_CODE, COUNTRY_GROUPS, COUNTRY_LABEL_KEY_BY_CODE} from "@/constants/country.constant.ts";
import {PERMISSION_LEVEL_OPTIONS} from "@/constants/permissionLevel.constant.ts";
import {PHONE_CODE_OPTIONS} from "@/constants/phoneCode.constant.ts";
import {useAuthStore} from "@/stores/auth.store.ts";
import type {AgreementTermKey} from "@/types/common.types.ts";
import {PasswordInput} from "@/components/common/PasswordInput.tsx";
import AgreementTermDialog from "@/components/dialog/AgreementTermDialog.tsx";
import {FieldBlock} from "@/components/sign_up/FieldBlock.tsx";
import {SectionTitle} from "@/components/sign_up/SectionTitle.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent, CardHeader} from "@/components/ui/card.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

type FormOnSubmit = NonNullable<JSX.IntrinsicElements["form"]["onSubmit"]>;

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
    approvalStatus: string;
};

type TermMeta = {
    label: string;
    title: string;
    body: string[];
};

type DynamicSelectOption = {
    value: string;
    label: string;
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
    approvalStatus: "",
};

const MOCK_TAKEN_EMAILS = ["admin@samsung.com", "test@samsung.com"];

const AdminPermissionInfoPage = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const [form, setForm] = useState<FormValues>(DEFAULT_FORM);
    const [agreements, setAgreements] = useState<Record<AgreementTermKey, boolean>>({service: false, privacy: false, overseas: false, marketing: false});
    const [generatedAuthCode, setGeneratedAuthCode] = useState("");
    const [isEmailDuplicateChecked, setIsEmailDuplicateChecked] = useState(false);
    const [isEmailAvailable, setIsEmailAvailable] = useState(false);
    const [emailDuplicateMessage, setEmailDuplicateMessage] = useState("");
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [emailAuthMessage, setEmailAuthMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [openTerm, setOpenTerm] = useState<AgreementTermKey | null>(null);
    const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

    // #. 등록 폼 검증에 사용할 zod 스키마를 구성한다.
    const registerSchema = useMemo(() => {
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
                phone: z.string().trim().min(1, "signup.errors.phone").refine((value) => phoneRegex.test(value), "signup.errors.phoneInvalid"),
                email: z.string().trim().min(1, "signup.errors.emailRequired").refine((value) => emailRegex.test(value), "signup.errors.emailInvalid"),
                authCode: z.string().trim().min(1, "signup.errors.authCodeRequired").refine((value) => authCodeRegex.test(value), "signup.errors.authCodeInvalid"),
                password: z.string().trim().min(1, "signup.errors.passwordRequired").refine((value) => passwordRegex.test(value), "signup.errors.passwordRule"),
                confirmPassword: z.string().trim().min(1, "signup.errors.confirmPasswordRequired"),
                permissionLevel: z.string().trim().min(1, "signup.errors.permissionLevel"),
                approvalStatus: z.string().trim().min(1, "adminSettingPage.permission.errors.approvalStatus"),
            }),
            agreements: z.object({
                service: z.boolean(),
                privacy: z.boolean(),
                overseas: z.boolean(),
                marketing: z.boolean(),
            }),
        }).superRefine((value, ctx) => {
            if (value.form.password && value.form.confirmPassword && value.form.password !== value.form.confirmPassword) {
                ctx.addIssue({code: "custom", path: ["form", "confirmPassword"], message: "signup.errors.confirmPassword"});
            }
            if (!value.agreements.service || !value.agreements.privacy || !value.agreements.overseas) {
                ctx.addIssue({code: "custom", path: ["agreements", "all"], message: "signup.errors.requiredAgreement"});
            }
            if (!value.agreements.service) ctx.addIssue({code: "custom", path: ["agreements", "service"], message: "signup.errors.requiredServiceAgreement"});
            if (!value.agreements.privacy) ctx.addIssue({code: "custom", path: ["agreements", "privacy"], message: "signup.errors.requiredPrivacyAgreement"});
            if (!value.agreements.overseas) ctx.addIssue({code: "custom", path: ["agreements", "overseas"], message: "signup.errors.requiredOverseasAgreement"});
        });
    }, []);

    // #. 약관 타입별 라벨/제목/본문 메타 정보를 구성한다.
    const termMeta = useMemo<Record<AgreementTermKey, TermMeta>>(() => ({
        service: {label: t("signup.terms.service.label"), title: t("signup.terms.service.title"), body: t("signup.terms.service.body", {returnObjects: true}) as string[]},
        privacy: {label: t("signup.terms.privacy.label"), title: t("signup.terms.privacy.title"), body: t("signup.terms.privacy.body", {returnObjects: true}) as string[]},
        overseas: {label: t("signup.terms.overseas.label"), title: t("signup.terms.overseas.title"), body: t("signup.terms.overseas.body", {returnObjects: true}) as string[]},
        marketing: {label: t("signup.terms.marketing.label"), title: t("signup.terms.marketing.title"), body: t("signup.terms.marketing.body", {returnObjects: true}) as string[]},
    }), [t]);

    // #. 전체 약관 동의 여부를 계산한다.
    const allAgreed = useMemo(() => Object.values(agreements).every(Boolean), [agreements]);
    // #. 승인일시 표시용 오늘 날짜(YYYY-MM-DD)를 계산한다.
    const approvalDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
    // #. 제출 이후 필드별 에러 목록을 조회한다.
    const getErrors = (key: string) => (submitted ? (validationErrors[key] || []) : []);
    // #. 에러 키를 번역 문구로 변환한다.
    const getErrorMessages = (key: string) => getErrors(key).map((errorKey) => `${t(errorKey)}`);

    // #. 단일 필드 값을 갱신한다.
    const onChangeField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => setForm((prev) => ({...prev, [key]: value}));
    // #. 권역 변경 시 법인/국가 값을 초기화한다.
    const onChangeAuthority = (value: string) => setForm((prev) => ({...prev, authority: value, corporation: "", country: ""}));
    // #. 법인 변경 시 국가 값을 초기화한다.
    const onChangeCorporation = (value: string) => setForm((prev) => ({...prev, corporation: value, country: ""}));

    // #. 선택한 권역 기준 법인 옵션 목록을 계산한다.
    const filteredCorporationOptions = useMemo<DynamicSelectOption[]>(() => {
        if (!form.authority || form.authority === "default") return [];
        const groups = form.authority === "all" ? COUNTRY_GROUPS : COUNTRY_GROUPS.filter((group) => group.authorityCode === form.authority);
        const codes = Array.from(new Set(groups.flatMap((group) => group.corporations.map((corp) => corp.corporationCode))));
        return codes.map((value) => ({
            value,
            label: CORPORATION_LABEL_KEY_BY_CODE[value] ? t(CORPORATION_LABEL_KEY_BY_CODE[value]) : value,
        }));
    }, [form.authority, t]);

    // #. 선택한 권역/법인 기준 국가 옵션 목록을 계산한다.
    const filteredCountryOptions = useMemo<DynamicSelectOption[]>(() => {
        if (!form.authority || form.authority === "default") return [];
        const groups = form.authority === "all" ? COUNTRY_GROUPS : COUNTRY_GROUPS.filter((group) => group.authorityCode === form.authority);
        const countries = !form.corporation || form.corporation === "all" || form.corporation === "default"
            ? groups.flatMap((group) => group.corporations.flatMap((corp) => corp.countries))
            : groups.flatMap((group) => group.corporations).find((corp) => corp.corporationCode === form.corporation)?.countries ?? [];
        const uniqueCountries = Array.from(new Set(countries));
        return uniqueCountries.map((value) => ({
            value,
            label: COUNTRY_LABEL_KEY_BY_CODE[value] ? t(COUNTRY_LABEL_KEY_BY_CODE[value]) : value,
        }));
    }, [form.authority, form.corporation, t]);

    // #. 이메일 중복 여부를 목업 규칙으로 확인한다.
    const onCheckDuplicate = () => {
        const email = form.email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setIsEmailDuplicateChecked(false);
            setIsEmailAvailable(false);
            setEmailDuplicateMessage(t("adminSettingPage.permission.registerForm.messages.invalidEmailFirst"));
            return;
        }
        const isTaken = MOCK_TAKEN_EMAILS.includes(email) || email.includes("duplicate") || email.includes("taken");
        setIsEmailDuplicateChecked(true);
        setIsEmailAvailable(!isTaken);
        setEmailDuplicateMessage(
            isTaken
                ? t("adminSettingPage.permission.registerForm.messages.emailTaken")
                : t("adminSettingPage.permission.registerForm.messages.emailAvailable"),
        );
    };

    // #. 이메일 인증코드를 발송(생성)한다.
    const onSendAuthCode = () => {
        const email = form.email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setIsEmailVerified(false);
            setEmailAuthMessage(t("adminSettingPage.permission.registerForm.messages.invalidEmailFirst"));
            return;
        }
        if (!isEmailDuplicateChecked || !isEmailAvailable) {
            setIsEmailVerified(false);
            setEmailAuthMessage(t("adminSettingPage.permission.registerForm.messages.duplicateCheckFirst"));
            return;
        }
        const nextCode = String(Math.floor(100000 + Math.random() * 900000));
        setGeneratedAuthCode(nextCode);
        setIsEmailVerified(false);
        setEmailAuthMessage(t("adminSettingPage.permission.registerForm.messages.codeSent"));
    };

    // #. 입력한 이메일 인증코드 일치 여부를 확인한다.
    const onCompleteAuth = () => {
        if (!generatedAuthCode) {
            setIsEmailVerified(false);
            setEmailAuthMessage(t("adminSettingPage.permission.registerForm.messages.sendCodeFirst"));
            return;
        }
        if (form.authCode.trim() === generatedAuthCode) {
            setIsEmailVerified(true);
            setEmailAuthMessage(t("adminSettingPage.permission.registerForm.messages.emailVerified"));
            return;
        }
        setIsEmailVerified(false);
        setEmailAuthMessage(t("adminSettingPage.permission.registerForm.messages.codeMismatch"));
    };

    // #. 제출 시 zod 검증 후 에러를 매핑하거나 완료 다이얼로그를 연다.
    const onSubmit: FormOnSubmit = (event) => {
        event.preventDefault();
        setSubmitted(true);

        const result = registerSchema.safeParse({form, agreements});
        if (!result.success) {
            const nextErrors: Record<string, string[]> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path.join(".");
                if (!nextErrors[path]) nextErrors[path] = [];
                nextErrors[path].push(issue.message);
            });
            if (!isEmailDuplicateChecked || !isEmailAvailable) {
                if (!nextErrors["form.email"]) nextErrors["form.email"] = [];
                nextErrors["form.email"].push("adminSettingPage.permission.errors.emailDuplicate");
            }
            if (!isEmailVerified) {
                if (!nextErrors["form.authCode"]) nextErrors["form.authCode"] = [];
                nextErrors["form.authCode"].push("adminSettingPage.permission.errors.emailVerify");
            }
            setValidationErrors(nextErrors);
            return;
        }

        const nextErrors: Record<string, string[]> = {};
        if (!isEmailDuplicateChecked || !isEmailAvailable) nextErrors["form.email"] = ["adminSettingPage.permission.errors.emailDuplicate"];
        if (!isEmailVerified) nextErrors["form.authCode"] = ["adminSettingPage.permission.errors.emailVerify"];
        if (Object.keys(nextErrors).length > 0) {
            setValidationErrors(nextErrors);
            return;
        }

        setValidationErrors({});
        setOpenCompleteDialog(true);
    };

    return (
        <>
            {/* 권한정보 등록 메인 카드 */}
            <Card className="mx-auto w-full border shadow-sm">
                {/* 상단 안내 문구 */}
                <CardHeader>
                    <p className="text-base leading-7 text-foreground/90">
                        {t("adminSettingPage.permission.registerIntro.line1")}
                        <br/>
                        {t("adminSettingPage.permission.registerIntro.line2")}
                    </p>
                </CardHeader>
                <CardContent className="space-y-8 pt-8">
                    <form onSubmit={onSubmit} className="space-y-8">
                        {/* 1. 소속 정보 */}
                        <section className="space-y-3">
                            <SectionTitle title={t("adminSettingPage.permission.registerForm.sectionTitles.affiliation")} required
                                          hint={t("signup.requiredHint")}/>
                            <div className="grid gap-3 md:grid-cols-3">
                                <FieldBlock label={t("signup.fields.authority")} required errors={getErrorMessages("form.authority")}>
                                    <Select value={form.authority} onValueChange={onChangeAuthority}>
                                        <SelectTrigger><SelectValue placeholder={t("signup.placeholders.select")}/></SelectTrigger>
                                        <SelectContent>{SIGNUP_AUTHORITY_OPTIONS.map((option) => <SelectItem key={option.value}
                                                                                                             value={option.value}>{t(option.labelKey)}</SelectItem>)}</SelectContent>
                                    </Select>
                                </FieldBlock>
                                <FieldBlock label={t("signup.fields.corporation")} required errors={getErrorMessages("form.corporation")}>
                                    <Select value={form.corporation} onValueChange={onChangeCorporation}>
                                        <SelectTrigger><SelectValue placeholder={t("signup.placeholders.select")}/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">{t("signup.options.corporation.default")}</SelectItem>
                                            <SelectItem value="all">{t("signup.options.corporation.all")}</SelectItem>
                                            {filteredCorporationOptions.map((option) => <SelectItem key={option.value}
                                                                                                    value={option.value}>{option.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </FieldBlock>
                                <FieldBlock label={t("signup.fields.countryOptional")}>
                                    <Select value={form.country} onValueChange={(value) => onChangeField("country", value)}>
                                        <SelectTrigger><SelectValue placeholder={t("signup.placeholders.select")}/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">{t("signup.options.country.default")}</SelectItem>
                                            <SelectItem value="all">{t("signup.options.country.all")}</SelectItem>
                                            {filteredCountryOptions.map((option) => <SelectItem key={option.value}
                                                                                                value={option.value}>{option.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </FieldBlock>
                            </div>
                        </section>

                        {/* 2. 개인 정보 */}
                        <section className="space-y-3">
                            <SectionTitle title={t("adminSettingPage.permission.registerForm.sectionTitles.personal")} required
                                          hint={t("signup.requiredHint")}/>
                            <div className="grid gap-3 md:grid-cols-2">
                                <FieldBlock label={t("signup.fields.name")} required errors={getErrorMessages("form.name")}>
                                    <Input value={form.name} onChange={(event) => onChangeField("name", event.target.value)}/>
                                </FieldBlock>
                                <FieldBlock label={t("signup.fields.department")} required errors={getErrorMessages("form.department")}>
                                    <Input value={form.department} onChange={(event) => onChangeField("department", event.target.value)}/>
                                </FieldBlock>
                            </div>

                            <FieldBlock label={t("signup.fields.phone")} required errors={getErrorMessages("form.phone")}>
                                <div className="grid gap-2 md:grid-cols-[170px_1fr]">
                                    <Select value={form.phoneCountry} onValueChange={(value) => onChangeField("phoneCountry", value)}>
                                        <SelectTrigger><SelectValue placeholder={t("signup.placeholders.countryCode")}/></SelectTrigger>
                                        <SelectContent>{PHONE_CODE_OPTIONS.map((option) => <SelectItem key={option.value}
                                                                                                              value={option.value}>{t(option.labelKey)}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <Input value={form.phone}
                                           onChange={(event) => onChangeField("phone", event.target.value.replace(/\D/g, ""))}
                                           inputMode="numeric" pattern="[0-9]*"/>
                                </div>
                                <p className="text-sm text-muted-foreground">{t("adminSettingPage.permission.registerForm.phoneHint")}</p>
                            </FieldBlock>

                            <FieldBlock label={t("signup.fields.emailId")} required
                                        errors={[...getErrorMessages("form.email"), ...getErrorMessages("form.authCode")]}>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Input
                                            value={form.email}
                                            onChange={(event) => {
                                                onChangeField("email", event.target.value);
                                                setIsEmailDuplicateChecked(false);
                                                setIsEmailAvailable(false);
                                                setEmailDuplicateMessage("");
                                                setGeneratedAuthCode("");
                                                onChangeField("authCode", "");
                                                setIsEmailVerified(false);
                                                setEmailAuthMessage("");
                                            }}
                                            className="min-w-56 flex-1"
                                        />
                                        <Button type="button" variant="secondary"
                                                onClick={onCheckDuplicate}>{t("signup.buttons.checkDuplicate")}</Button>
                                        <Button type="button" onClick={onSendAuthCode}
                                                disabled={!isEmailDuplicateChecked || !isEmailAvailable}>
                                            {generatedAuthCode ? t("adminSettingPage.permission.registerForm.resendAuthCode") : t("signup.buttons.sendAuthCode")}
                                        </Button>
                                    </div>
                                    {emailDuplicateMessage ?
                                        <p className={`text-sm ${isEmailAvailable ? "text-emerald-600" : "text-destructive"}`}>{`${emailDuplicateMessage}`}</p> : null}

                                    <div className="flex flex-wrap items-center gap-2">
                                        <Input value={form.authCode}
                                               onChange={(event) => onChangeField("authCode", event.target.value.replace(/\D/g, "").slice(0, 6))}
                                               className="min-w-44 flex-1" inputMode="numeric" pattern="[0-9]*"/>
                                        <Button type="button" variant="outline"
                                                onClick={onCompleteAuth}>{t("signup.buttons.completeAuth")}</Button>
                                    </div>
                                    {emailAuthMessage ?
                                        <p className={`text-sm ${isEmailVerified ? "text-emerald-600" : "text-destructive"}`}>{`${emailAuthMessage}`}</p> : null}
                                </div>
                            </FieldBlock>

                            <FieldBlock label={t("signup.fields.password")} required errors={getErrorMessages("form.password")}>
                                <PasswordInput value={form.password} onChange={(event) => onChangeField("password", event.target.value)}
                                               showLabel={t("login.showPassword")} hideLabel={t("login.hidePassword")}/>
                                <p className="text-sm text-muted-foreground">{t("adminSettingPage.permission.registerForm.passwordHint")}</p>
                            </FieldBlock>

                            <FieldBlock label={t("signup.fields.confirmPassword")} required
                                        errors={getErrorMessages("form.confirmPassword")}>
                                <PasswordInput value={form.confirmPassword}
                                               onChange={(event) => onChangeField("confirmPassword", event.target.value)}
                                               showLabel={t("login.showPassword")} hideLabel={t("login.hidePassword")}/>
                                <p className="text-sm text-muted-foreground">{t("adminSettingPage.permission.registerForm.passwordHint")}</p>
                            </FieldBlock>
                        </section>

                        {/* 3. 권한 설정 */}
                        <section className="space-y-3">
                            <SectionTitle title={t("adminSettingPage.permission.registerForm.sectionTitles.permission")} required
                                          hint={t("signup.requiredHint")}/>
                            <FieldBlock label={t("signup.fields.permissionLevel")} required
                                        errors={getErrorMessages("form.permissionLevel")}>
                                <Select value={form.permissionLevel} onValueChange={(value) => onChangeField("permissionLevel", value)}>
                                    <SelectTrigger><SelectValue placeholder={t("signup.placeholders.select")}/></SelectTrigger>
                                    <SelectContent>{PERMISSION_LEVEL_OPTIONS.map((option) => <SelectItem key={option.value}
                                                                                                                value={option.value}>{t(option.labelKey)}</SelectItem>)}</SelectContent>
                                </Select>
                            </FieldBlock>

                            <div className="rounded-md border bg-muted/30 p-4 text-sm leading-7 text-muted-foreground">
                                <p className="font-semibold text-foreground">{t("adminSettingPage.permission.registerForm.permissionGuide.title")}</p>
                                <p>{t("adminSettingPage.permission.registerForm.permissionGuide.line1")}</p>
                                <p>{t("adminSettingPage.permission.registerForm.permissionGuide.line2")}</p>
                                <p>{t("adminSettingPage.permission.registerForm.permissionGuide.line3")}</p>
                                <p>{t("adminSettingPage.permission.registerForm.permissionGuide.line4")}</p>
                                <p>{t("adminSettingPage.permission.registerForm.permissionGuide.line5")}</p>
                            </div>
                        </section>

                        {/* 4. 승인 담당자 정보 */}
                        <section className="space-y-3">
                            <SectionTitle title={t("adminSettingPage.permission.registerForm.sectionTitles.approver")}/>
                            <FieldBlock label={t("adminSettingPage.permission.registerForm.approvalStatusLabel")} required
                                        errors={getErrorMessages("form.approvalStatus")}>
                                <div className="max-w-md">
                                    <Select value={form.approvalStatus} onValueChange={(value) => onChangeField("approvalStatus", value)}>
                                        <SelectTrigger><SelectValue placeholder={t("signup.placeholders.select")}/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="approved">{t("adminSettingPage.approval.approved")}</SelectItem>
                                            <SelectItem value="pending">{t("adminSettingPage.approval.pending")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </FieldBlock>
                            <FieldBlock label={t("adminSettingPage.permission.registerForm.approverInfoLabel")}>
                                <p className="text-sm font-semibold">{user?.user_id ?? "-"} / {approvalDate}</p>
                            </FieldBlock>
                        </section>

                        {/* 약관 동의 */}
                        <section className="space-y-3">
                            <div className="space-y-2 rounded-md border p-4">
                                <label className="flex cursor-pointer items-center gap-2 text-base font-semibold">
                                    <Checkbox checked={allAgreed}
                                              onCheckedChange={(checked) => setAgreements({service: checked === true, privacy: checked === true, overseas: checked === true, marketing: checked === true})}/>
                                    {t("adminSettingPage.permission.registerForm.agreeAll")}
                                </label>
                                <div className="space-y-2 pl-0.5 text-sm">
                                    {(Object.keys(termMeta) as AgreementTermKey[]).map((key) => (
                                        <div key={key} className="flex items-center gap-2">
                                            <Checkbox checked={agreements[key]}
                                                      onCheckedChange={(checked) => setAgreements((prev) => ({...prev, [key]: checked === true}))}/>
                                            <span>{termMeta[key].label}</span>
                                            <button type="button" className="font-semibold underline underline-offset-2"
                                                    onClick={() => setOpenTerm(key)}>
                                                {t("adminSettingPage.permission.registerForm.viewFull")}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-1">
                                    {getErrorMessages("agreements.all").map((error, index) => <p key={`agreements-all-${index}`}
                                                                                                 className="text-sm text-destructive">{error}</p>)}
                                    {getErrorMessages("agreements.service").map((error, index) => <p key={`agreements-service-${index}`}
                                                                                                     className="text-sm text-destructive">{error}</p>)}
                                    {getErrorMessages("agreements.privacy").map((error, index) => <p key={`agreements-privacy-${index}`}
                                                                                                     className="text-sm text-destructive">{error}</p>)}
                                    {getErrorMessages("agreements.overseas").map((error, index) => <p key={`agreements-overseas-${index}`}
                                                                                                      className="text-sm text-destructive">{error}</p>)}
                                </div>
                            </div>
                        </section>

                        {/* 하단 액션 버튼 */}
                        <div className="flex items-center justify-center gap-3 border-t pt-5">
                            <Button
                                type="button"
                                variant="secondary"
                                className="min-w-32"
                                onClick={() => navigate("/admin_settings/list")}
                            >
                                {t("adminSettingPage.permission.registerForm.cancel")}
                            </Button>
                            <Button type="submit" className="min-w-32">{t("adminSettingPage.permission.registerForm.complete")}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* 약관 전문보기 다이얼로그 */}
            <AgreementTermDialog
                open={openTerm !== null}
                title={openTerm ? termMeta[openTerm].title : ""}
                description=""
                body={openTerm ? termMeta[openTerm].body : []}
                confirmLabel={t("signup.buttons.agree")}
                onOpenChange={(open) => setOpenTerm(open ? openTerm : null)}
                onConfirm={() => {
                    if (openTerm) setAgreements((prev) => ({...prev, [openTerm]: true}));
                    setOpenTerm(null);
                }}
            />

            {/* 등록 완료 안내 다이얼로그 */}
            <Dialog open={openCompleteDialog} onOpenChange={setOpenCompleteDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t("adminSettingPage.permission.registerForm.dialog.title")}</DialogTitle>
                    </DialogHeader>
                    <p className="text-center text-base leading-7">
                        {t("adminSettingPage.permission.registerForm.dialog.line1")}
                        <br/>
                        {t("adminSettingPage.permission.registerForm.dialog.line2")}
                    </p>
                    <DialogFooter className="sm:justify-center">
                        <Button type="button"
                                onClick={() => setOpenCompleteDialog(false)}>{t("adminSettingPage.permission.registerForm.dialog.confirm")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AdminPermissionInfoPage;









