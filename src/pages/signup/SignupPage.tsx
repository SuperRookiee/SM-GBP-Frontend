import {useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {z} from "zod";
import {PasswordInput} from "@/components/common/PasswordInput.tsx";
import {FieldBlock} from "@/components/signup/FieldBlock.tsx";
import {SectionTitle} from "@/components/signup/SectionTitle.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

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
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [form, setForm] = useState<FormValues>(DEFAULT_FORM);
    const [agreements, setAgreements] = useState<Record<TermKey, boolean>>({service: false, privacy: false, overseas: false, marketing: false});
    const [submitted, setSubmitted] = useState(false);
    const [openTerm, setOpenTerm] = useState<TermKey | null>(null);
    const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

    // #. 약관 타입별 라벨/본문을 한곳에서 관리한다.
    const termMeta = useMemo<Record<TermKey, TermMeta>>(
        () => ({
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
        }),
        [t],
    );

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

    const getErrors = (key: string) => (submitted ? (validationErrors[key] || []) : []);
    const getErrorMessages = (key: string) => getErrors(key).map((errorKey) => t(errorKey));

    const onChangeField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
        setForm((prev) => ({...prev, [key]: value}));
    };

    // #. 전체 동의 체크 시 개별 약관 상태를 일괄 반영한다.
    const onToggleAll = (checked: boolean) => {
        setAgreements({
            service: checked,
            privacy: checked,
            overseas: checked,
            marketing: checked,
        });
    };

    const onToggleAgreement = (key: TermKey, checked: boolean) => {
        setAgreements((prev) => ({...prev, [key]: checked}));
    };

    // #. 제출 시 스키마 검증 후 에러를 매핑하거나 완료 다이얼로그를 연다.
    const onSubmit = (e: React.FormEvent) => {
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
                                        <Select value={form.authority} onValueChange={(value) => onChangeField("authority", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("signup.placeholders.select")}/>
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

                                    {/* 법인(Corporation) 선택: 계정을 생성할 법인 단위를 지정 */}
                                    <FieldBlock label={t("signup.fields.corporation")} required
                                                errors={getErrorMessages("form.corporation")}>
                                        <Select value={form.corporation} onValueChange={(value) => onChangeField("corporation", value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t("signup.placeholders.select")}/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t("signup.options.corporation.all")}</SelectItem>
                                                <SelectItem value="sec">{t("signup.options.corporation.sec")}</SelectItem>
                                                <SelectItem value="sdc">{t("signup.options.corporation.sdc")}</SelectItem>
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
                                                <SelectItem value="kr">{t("signup.options.country.kr")}</SelectItem>
                                                <SelectItem value="us">{t("signup.options.country.us")}</SelectItem>
                                                <SelectItem value="uk">{t("signup.options.country.uk")}</SelectItem>
                                                <SelectItem value="de">{t("signup.options.country.de")}</SelectItem>
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
                                                <SelectItem value="+82">{t("signup.options.phoneCode.kr")}</SelectItem>
                                                <SelectItem value="+1">{t("signup.options.phoneCode.us")}</SelectItem>
                                                <SelectItem value="+44">{t("signup.options.phoneCode.uk")}</SelectItem>
                                                <SelectItem value="+49">{t("signup.options.phoneCode.de")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {/* 휴대폰 번호 본문 입력: 숫자만 허용(유효성 검사에서 검증) */}
                                        <Input
                                            value={form.phone}
                                            onChange={(e) => onChangeField("phone", e.target.value)}
                                            placeholder={t("signup.placeholders.phoneNumber")}
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
                                                onChange={(e) => onChangeField("email", e.target.value)}
                                                placeholder={t("signup.placeholders.email")}
                                                className="min-w-56 flex-1"
                                            />
                                            <Button type="button" variant="secondary">{t("signup.buttons.checkDuplicate")}</Button>
                                            <Button type="button">{t("signup.buttons.sendAuthCode")}</Button>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* 이메일로 수신한 6자리 인증코드 입력 */}
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
                                            <SelectItem value="default">{t("signup.options.permissionLevel.default")}</SelectItem>
                                            <SelectItem value="hq_manager">{t("signup.options.permissionLevel.hqManager")}</SelectItem>
                                            <SelectItem value="hq_admin">{t("signup.options.permissionLevel.hqAdmin")}</SelectItem>
                                            <SelectItem
                                                value="store_manager">{t("signup.options.permissionLevel.storeManager")}</SelectItem>
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
            </main>

            {/* 약관 전문 확인 다이얼로그 */}
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

            {/* 회원가입 완료 안내 다이얼로그 */}
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

export default SignupPage;
