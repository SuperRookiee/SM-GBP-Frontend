import {type JSX, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {z} from "zod";
import {SIGNUP_AFFILIATION_GROUPS} from "@/constants/affiliation.constants.ts";
import {SIGNUP_AUTHORITY_OPTIONS} from "@/constants/authority.constants.ts";
import {SIGNUP_PERMISSION_LEVEL_OPTIONS} from "@/constants/permissionLevel.constants.ts";
import {SIGNUP_PHONE_CODE_OPTIONS} from "@/constants/phoneCode.constants.ts";
import type {TermKey} from "@/types/signup.types.ts";
import {PasswordInput} from "@/components/common/PasswordInput.tsx";
import AgreementTermDialog from "@/components/dialog/AgreementTermDialog.tsx";
import SignupCompleteDialog from "@/components/dialog/SignupCompleteDialog.tsx";
import {FieldBlock} from "@/components/signup/FieldBlock.tsx";
import {SectionTitle} from "@/components/signup/SectionTitle.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
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
};

type TermMeta = {
    label: string;
    required: boolean;
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
};

const MOCK_TAKEN_EMAILS = ["admin@samsung.com", "test@samsung.com"];

const SignupPage = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [form, setForm] = useState<FormValues>(DEFAULT_FORM);
    const [agreements, setAgreements] = useState<Record<TermKey, boolean>>({service: false, privacy: false, overseas: false, marketing: false});
    const [generatedAuthCode, setGeneratedAuthCode] = useState("");
    const [isEmailDuplicateChecked, setIsEmailDuplicateChecked] = useState(false);
    const [isEmailAvailable, setIsEmailAvailable] = useState(false);
    const [emailDuplicateMessage, setEmailDuplicateMessage] = useState("");
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [emailAuthMessage, setEmailAuthMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [openTerm, setOpenTerm] = useState<TermKey | null>(null);
    const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

    // #. 약관 타입별 라벨/본문을 한곳에서 관리한다.
    const termMeta = useMemo<Record<TermKey, TermMeta>>(() => ({
        service: {
            label: t("signup.terms.service.label"),
            required: true,
            title: t("signup.terms.service.title"),
            body: t("signup.terms.service.body", {returnObjects: true}) as string[],
        },
        privacy: {
            label: t("signup.terms.privacy.label"),
            required: true,
            title: t("signup.terms.privacy.title"),
            body: t("signup.terms.privacy.body", {returnObjects: true}) as string[],
        },
        overseas: {
            label: t("signup.terms.overseas.label"),
            required: true,
            title: t("signup.terms.overseas.title"),
            body: t("signup.terms.overseas.body", {returnObjects: true}) as string[],
        },
        marketing: {
            label: t("signup.terms.marketing.label"),
            required: false,
            title: t("signup.terms.marketing.title"),
            body: t("signup.terms.marketing.body", {returnObjects: true}) as string[],
        },
    }), [t]);

    // #. 약관 전체 동의 여부를 계산한다.
    const allAgreed = useMemo(() => Object.values(agreements).every(Boolean), [agreements]);

    // #. 제출 시 재사용할 유효성 검사 스키마를 메모이징한다.
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
                    code: "custom",
                    path: ["form", "confirmPassword"],
                    message: "signup.errors.confirmPassword",
                });
            }

            if (!value.agreements.service || !value.agreements.privacy || !value.agreements.overseas) {
                ctx.addIssue({
                    code: "custom",
                    path: ["agreements", "all"],
                    message: "signup.errors.requiredAgreement",
                });
            }
            if (!value.agreements.service) {
                ctx.addIssue({
                    code: "custom",
                    path: ["agreements", "service"],
                    message: "signup.errors.requiredServiceAgreement",
                });
            }
            if (!value.agreements.privacy) {
                ctx.addIssue({
                    code: "custom",
                    path: ["agreements", "privacy"],
                    message: "signup.errors.requiredPrivacyAgreement",
                });
            }
            if (!value.agreements.overseas) {
                ctx.addIssue({
                    code: "custom",
                    path: ["agreements", "overseas"],
                    message: "signup.errors.requiredOverseasAgreement",
                });
            }
        });
    }, []);

    // #. 필드별 에러 목록을 조회한다.
    const getErrors = (key: string) => (submitted ? (validationErrors[key] || []) : []);
    // #. 에러 키를 번역 문구로 변환한다.
    const getErrorMessages = (key: string) => getErrors(key).map((errorKey) => t(errorKey));

    // #. 단일 필드 값을 갱신한다.
    const onChangeField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
        setForm((prev) => ({...prev, [key]: value}));
    };

    // #. 권역 변경 시 법인/국가를 초기화한다.
    const onChangeAuthority = (value: string) => {
        setForm((prev) => ({...prev, authority: value, corporation: "", country: ""}));
    };

    // #. 법인 변경 시 국가를 초기화한다.
    const onChangeCorporation = (value: string) => {
        setForm((prev) => ({...prev, corporation: value, country: ""}));
    };

    // #. 이메일 인증코드를 발송(생성)한다.
    const onSendAuthCode = () => {
        const email = form.email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setIsEmailVerified(false);
            setEmailAuthMessage("유효한 이메일을 먼저 입력해 주세요.");
            return;
        }
        if (!isEmailDuplicateChecked || !isEmailAvailable) {
            setIsEmailVerified(false);
            setEmailAuthMessage("이메일 중복확인을 먼저 완료해 주세요.");
            return;
        }

        const nextCode = String(Math.floor(100000 + Math.random() * 900000));
        setGeneratedAuthCode(nextCode);
        setIsEmailVerified(false);
        setEmailAuthMessage("인증코드가 발송되었습니다. 메일로 받은 코드를 입력해 주세요.");
    };

    // #. 입력한 인증코드의 유효성을 확인한다.
    const onCompleteAuth = () => {
        const inputCode = form.authCode.trim();
        if (!generatedAuthCode) {
            setIsEmailVerified(false);
            setEmailAuthMessage("먼저 인증코드를 발송해 주세요.");
            return;
        }

        if (inputCode === generatedAuthCode) {
            setIsEmailVerified(true);
            setEmailAuthMessage("이메일 인증이 완료되었습니다.");
            return;
        }

        setIsEmailVerified(false);
        setEmailAuthMessage("인증코드가 일치하지 않습니다.");
    };

    // #. 이메일 중복 여부를 목업 규칙으로 확인한다.
    const onCheckDuplicate = () => {
        const email = form.email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setIsEmailDuplicateChecked(false);
            setIsEmailAvailable(false);
            setEmailDuplicateMessage("유효한 이메일을 먼저 입력해 주세요.");
            return;
        }

        const isTaken = MOCK_TAKEN_EMAILS.includes(email) || email.includes("duplicate") || email.includes("taken");
        setIsEmailDuplicateChecked(true);
        setIsEmailAvailable(!isTaken);
        setEmailDuplicateMessage(isTaken ? "이미 사용 중인 이메일입니다." : "사용 가능한 이메일입니다.");
    };

    // #. 선택된 권역 기준 법인 목록을 계산한다.
    const filteredCorporationOptions = useMemo<DynamicSelectOption[]>(() => {
        if (!form.authority || form.authority === "default") return [];

        const groups = form.authority === "all"
            ? SIGNUP_AFFILIATION_GROUPS
            : SIGNUP_AFFILIATION_GROUPS.filter((group) => group.authorityCode === form.authority);

        const corporationCodes = groups.flatMap((group) => group.corporations.map((corp) => corp.corporationCode));
        const uniqueCorporationCodes = Array.from(new Set(corporationCodes));
        return uniqueCorporationCodes.map((corporationCode) => ({value: corporationCode, label: corporationCode}));
    }, [form.authority]);

    // #. 선택된 권역/법인 기준 국가 목록을 계산한다.
    const filteredCountryOptions = useMemo<DynamicSelectOption[]>(() => {
        if (!form.authority || form.authority === "default") return [];

        const groups = form.authority === "all"
            ? SIGNUP_AFFILIATION_GROUPS
            : SIGNUP_AFFILIATION_GROUPS.filter((group) => group.authorityCode === form.authority);

        const countries = !form.corporation || form.corporation === "all" || form.corporation === "default"
            ? groups.flatMap((group) => group.corporations.flatMap((corp) => corp.countries))
            : groups
                .flatMap((group) => group.corporations)
                .find((corp) => corp.corporationCode === form.corporation)?.countries ?? [];

        const uniqueCountries = Array.from(new Set(countries));
        return uniqueCountries.map((country) => ({value: country, label: country}));
    }, [form.authority, form.corporation]);

    // #. 전체 동의 체크 시 개별 약관 상태를 일괄 반영한다.
    const onToggleAll = (checked: boolean) => {
        setAgreements({
            service: checked,
            privacy: checked,
            overseas: checked,
            marketing: checked,
        });
    };

    // #. 약관 개별 동의 상태를 변경한다.
    const onToggleAgreement = (key: TermKey, checked: boolean) => {
        setAgreements((prev) => ({...prev, [key]: checked}));
    };

    // #. 제출 시 스키마 검증 후 에러를 매핑하거나 완료 다이얼로그를 연다.
    const onSubmit: FormOnSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);

        const result = signupSchema.safeParse({form, agreements});
        if (!result.success) {
            const nextErrors: Record<string, string[]> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path.join(".");
                if (!nextErrors[path]) nextErrors[path] = [];
                nextErrors[path].push(issue.message);
            });
            if (!isEmailDuplicateChecked || !isEmailAvailable) {
                if (!nextErrors["form.email"]) nextErrors["form.email"] = [];
                nextErrors["form.email"].push("이메일 중복확인을 완료해 주세요.");
            }
            if (!isEmailVerified) {
                if (!nextErrors["form.authCode"]) nextErrors["form.authCode"] = [];
                nextErrors["form.authCode"].push("이메일 인증을 완료해 주세요.");
            }
            setValidationErrors(nextErrors);
            return;
        }

        const nextErrors: Record<string, string[]> = {};
        if (!isEmailDuplicateChecked || !isEmailAvailable) {
            nextErrors["form.email"] = ["이메일 중복확인을 완료해 주세요."];
        }
        if (!isEmailVerified) {
            nextErrors["form.authCode"] = ["이메일 인증을 완료해 주세요."];
        }
        if (Object.keys(nextErrors).length > 0) {
            setValidationErrors(nextErrors);
            return;
        }

        const submitPayload = {form, agreements};
        console.log("signup submit payload", submitPayload);
        setValidationErrors({});
        setOpenCompleteDialog(true);
    };

    return (
        <>
            <Card className="mx-auto w-full max-w-5xl border shadow-sm">
                <CardContent className="space-y-8 pt-8">
                    {/* 회원가입 페이지 타이틀/안내 문구 영역 */}
                    <section className="space-y-3">
                        <p className="text-3xl font-bold tracking-tight">{t("signup.title")}</p>
                        <p className="text-base leading-6 text-foreground/90">
                            {t("signup.intro1")}<br/>
                            {t("signup.intro2")}
                        </p>
                    </section>

                    <form onSubmit={onSubmit} className="space-y-8">
                        {/* 소속 정보 입력 영역 */}
                        <section className="space-y-3">
                            <SectionTitle title={t("signup.sections.affiliation")} required hint={t("signup.requiredHint")}/>
                            <div className="grid gap-3 md:grid-cols-3">
                                {/* 관할 조직(Authority) 선택: 사용자의 소속 권역/본부를 지정 */}
                                <FieldBlock label={t("signup.fields.authority")} required errors={getErrorMessages("form.authority")}>
                                    <Select value={form.authority} onValueChange={onChangeAuthority}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("signup.placeholders.select")}/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SIGNUP_AUTHORITY_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>{t(option.labelKey)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FieldBlock>

                                {/* 법인(Corporation) 선택: 계정을 생성할 법인 단위를 지정 */}
                                <FieldBlock label={t("signup.fields.corporation")} required
                                            errors={getErrorMessages("form.corporation")}>
                                    <Select value={form.corporation} onValueChange={onChangeCorporation}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("signup.placeholders.select")}/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">{t("signup.options.corporation.default")}</SelectItem>
                                            <SelectItem value="all">{t("signup.options.corporation.all")}</SelectItem>
                                            {filteredCorporationOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FieldBlock>

                                {/* 국가(Country) 선택(선택값): 필요 시 소속 국가를 추가 지정 */}
                                <FieldBlock label={t("signup.fields.countryOptional")}>
                                    <Select value={form.country} onValueChange={(value) => onChangeField("country", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("signup.placeholders.select")}/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">{t("signup.options.country.default")}</SelectItem>
                                            <SelectItem value="all">{t("signup.options.country.all")}</SelectItem>
                                            {filteredCountryOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FieldBlock>
                            </div>
                        </section>

                        {/* 개인 정보 입력 영역 */}
                        <section className="space-y-3">
                            <SectionTitle title={t("signup.sections.personal")} required hint={t("signup.requiredHint")}/>

                            <div className="grid gap-3 md:grid-cols-2">
                                {/* 이름 입력: 사용자 실명 입력 */}
                                <FieldBlock label={t("signup.fields.name")} required errors={getErrorMessages("form.name")}>
                                    <Input value={form.name} onChange={(e) => onChangeField("name", e.target.value)}/>
                                </FieldBlock>
                                {/* 부서명 입력: 사용자 소속 부서/팀명 입력 */}
                                <FieldBlock label={t("signup.fields.department")} required errors={getErrorMessages("form.department")}>
                                    <Input value={form.department} onChange={(e) => onChangeField("department", e.target.value)}/>
                                </FieldBlock>
                            </div>

                            {/* 휴대폰번호 입력: 국가번호 + 전화번호 본문을 함께 저장 */}
                            <FieldBlock label={t("signup.fields.phone")} required errors={getErrorMessages("form.phone")}>
                                <div className="grid gap-2 md:grid-cols-[160px_1fr]">
                                    {/* 휴대폰 국가번호 선택: 예) +82, +1 */}
                                    <Select value={form.phoneCountry} onValueChange={(value) => onChangeField("phoneCountry", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("signup.placeholders.countryCode")}/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SIGNUP_PHONE_CODE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>{t(option.labelKey)}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {/* 휴대폰 번호 본문 입력: 숫자만 허용(유효성 검사에서 검증) */}
                                    <Input
                                        value={form.phone}
                                        onChange={(e) => onChangeField("phone", e.target.value.replace(/\D/g, ""))}
                                        placeholder={t("signup.placeholders.phoneNumber")}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                    />
                                </div>
                            </FieldBlock>

                            {/* 이메일/인증코드 입력: 중복확인 -> 인증번호 발송 -> 인증완료 순서로 사용 */}
                            <FieldBlock label={t("signup.fields.emailId")} required
                                        errors={[...getErrorMessages("form.email"), ...getErrorMessages("form.authCode")]}>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {/* 이메일 주소 입력 */}
                                        <Input
                                            value={form.email}
                                            onChange={(e) => {
                                                onChangeField("email", e.target.value);
                                                setIsEmailDuplicateChecked(false);
                                                setIsEmailAvailable(false);
                                                setEmailDuplicateMessage("");
                                                setGeneratedAuthCode("");
                                                onChangeField("authCode", "");
                                                setIsEmailVerified(false);
                                                setEmailAuthMessage("");
                                            }}
                                            placeholder={t("signup.placeholders.email")}
                                            className="min-w-56 flex-1"
                                        />
                                        <Button type="button" variant="secondary" onClick={onCheckDuplicate}>{t("signup.buttons.checkDuplicate")}</Button>
                                        <Button type="button" onClick={onSendAuthCode} disabled={!isEmailDuplicateChecked || !isEmailAvailable}>
                                            {generatedAuthCode ? "인증코드 재발송" : t("signup.buttons.sendAuthCode")}
                                        </Button>
                                    </div>
                                    {emailDuplicateMessage ? (
                                        <p className={`text-sm ${isEmailAvailable ? "text-emerald-600" : "text-destructive"}`}>{emailDuplicateMessage}</p>
                                    ) : null}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {/* 이메일로 수신한 6자리 인증코드 입력 */}
                                        <Input
                                            value={form.authCode}
                                            onChange={(e) => onChangeField("authCode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            placeholder={t("signup.placeholders.authCode")}
                                            className="min-w-44 flex-1"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                        />
                                        <Button type="button" variant="outline" onClick={onCompleteAuth}>{t("signup.buttons.completeAuth")}</Button>
                                    </div>
                                    {emailAuthMessage ? (
                                        <p className={`text-sm ${isEmailVerified ? "text-emerald-600" : "text-destructive"}`}>{emailAuthMessage}</p>
                                    ) : null}
                                    {/* FIXME: 백엔드 연동 전 테스트용 인증코드 표시 */}
                                    <p className="text-xs text-muted-foreground">test auth code: {generatedAuthCode || "-"}</p>
                                </div>
                            </FieldBlock>

                            {/* 비밀번호 입력: 영문 대/소문자, 숫자, 특수문자 포함 8~12자 규칙 */}
                            <FieldBlock label={t("signup.fields.password")} required errors={getErrorMessages("form.password")}>
                                <PasswordInput
                                    value={form.password}
                                    onChange={(e) => onChangeField("password", e.target.value)}
                                    showLabel={t("login.showPassword")}
                                    hideLabel={t("login.hidePassword")}
                                />
                            </FieldBlock>

                            {/* 비밀번호 확인 입력: 비밀번호 필드와 동일한 값인지 검증 */}
                            <FieldBlock label={t("signup.fields.confirmPassword")} required
                                        errors={getErrorMessages("form.confirmPassword")}>
                                <PasswordInput
                                    value={form.confirmPassword}
                                    onChange={(e) => onChangeField("confirmPassword", e.target.value)}
                                    showLabel={t("login.showPassword")}
                                    hideLabel={t("login.hidePassword")}
                                />
                            </FieldBlock>
                        </section>

                        {/* 권한 레벨 선택 영역 */}
                        <section className="space-y-3">
                            <SectionTitle title={t("signup.sections.permission")} required hint={t("signup.requiredHint")}/>
                            {/* 권한 레벨 선택: 가입 후 시스템에서 사용할 계정 권한 등급 */}
                            <FieldBlock label={t("signup.fields.permissionLevel")} required
                                        errors={getErrorMessages("form.permissionLevel")}>
                                <Select value={form.permissionLevel} onValueChange={(value) => onChangeField("permissionLevel", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("signup.placeholders.select")}/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SIGNUP_PERMISSION_LEVEL_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>{t(option.labelKey)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FieldBlock>
                        </section>

                        {/* 약관 동의 및 상세 보기 영역 */}
                        <section className="space-y-3">
                            <div className="space-y-2 rounded-md border p-4">
                                <Label className="flex cursor-pointer items-center gap-2 text-base">
                                    <Checkbox checked={allAgreed} onCheckedChange={(checked) => onToggleAll(checked === true)}/>
                                    {t("signup.agreements.all")}
                                </Label>

                                <div className="space-y-2 pl-0.5">
                                    {(Object.keys(termMeta) as TermKey[]).map((key) => (
                                        <div key={key} className="flex items-center gap-2 text-sm">
                                            <Checkbox checked={agreements[key]}
                                                      onCheckedChange={(checked) => onToggleAgreement(key, checked === true)}/>
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
                                        <p key={`agreements-all-${index}`} className="text-sm text-destructive">{error}</p>
                                    ))}
                                    {getErrorMessages("agreements.service").map((error, index) => (
                                        <p key={`agreements-service-${index}`} className="text-sm text-destructive">{error}</p>
                                    ))}
                                    {getErrorMessages("agreements.privacy").map((error, index) => (
                                        <p key={`agreements-privacy-${index}`} className="text-sm text-destructive">{error}</p>
                                    ))}
                                    {getErrorMessages("agreements.overseas").map((error, index) => (
                                        <p key={`agreements-overseas-${index}`} className="text-sm text-destructive">{error}</p>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 하단 액션 버튼 영역 */}
                        <div className="flex items-center justify-center gap-3 border-t pt-5">
                            <Button type="button" variant="secondary" className="min-w-32"
                                    onClick={() => navigate("/login")}>{t("signup.buttons.moveToMain")}</Button>
                            <Button type="submit" className="min-w-32">{t("signup.buttons.apply")}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <AgreementTermDialog
                open={openTerm !== null}
                title={openTerm ? termMeta[openTerm].title : ""}
                description="약관 전문 내용을 확인하고 동의 여부를 선택할 수 있습니다."
                body={openTerm ? termMeta[openTerm].body : []}
                confirmLabel={t("signup.buttons.agree")}
                onOpenChange={(open) => setOpenTerm(open ? openTerm : null)}
                onConfirm={() => {
                    if (openTerm) onToggleAgreement(openTerm, true);
                    setOpenTerm(null);
                }}
            />

            <SignupCompleteDialog
                open={openCompleteDialog}
                title={t("signup.completeDialog.title")}
                description="회원가입 신청 완료 안내와 후속 절차를 확인할 수 있습니다."
                lines={[t("signup.completeDialog.line1"), t("signup.completeDialog.line2"), t("signup.completeDialog.line3")]}
                confirmLabel={t("signup.buttons.confirm")}
                onOpenChange={setOpenCompleteDialog}
                onConfirm={() => navigate("/login")}
            />
        </>
    );
};

export default SignupPage;




