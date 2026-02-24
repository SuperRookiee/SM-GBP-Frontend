import {useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {z} from "zod";
import {SIGNUP_AFFILIATION_GROUPS} from "@/constants/affiliation.constants.ts";
import {SIGNUP_AUTHORITY_OPTIONS} from "@/constants/authority.constants.ts";
import {SIGNUP_PERMISSION_LEVEL_OPTIONS} from "@/constants/permissionLevel.constants.ts";
import {SIGNUP_PHONE_CODE_OPTIONS} from "@/constants/phoneCode.constants.ts";
import {useAuthStore} from "@/stores/auth.store.ts";
import type {TermKey} from "@/types/signup.types.ts";
import {PasswordInput} from "@/components/common/PasswordInput.tsx";
import AgreementTermDialog from "@/components/dialog/AgreementTermDialog.tsx";
import {FieldBlock} from "@/components/signup/FieldBlock.tsx";
import {SectionTitle} from "@/components/signup/SectionTitle.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import type {IUser} from "@/interfaces/IUser.ts";

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

type AgreementState = {
    service: boolean;
    privacy: boolean;
    overseas: boolean;
    marketing: boolean;
};

type TermMeta = {
    label: string;
    title: string;
    body: string[];
};

interface IMyPageContentProps {
    user: IUser;
}

const MyPage = () => {
    const user = useAuthStore((state) => state.user);
    if (!user) return null;
    return <MyPageContent key={`${user.id}-${user.user_id}`} user={user}/>;
};

const MyPageContent = ({user}: IMyPageContentProps) => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [form, setForm] = useState<FormValues>(() => ({
        authority: user?.authority ?? "",
        corporation: user?.corporation ?? "",
        country: user?.country ?? "",
        name: user?.name ?? "",
        department: user?.department ?? "",
        phoneCountry: user?.phone_country ?? "+82",
        phone: user?.phone_number ?? "",
        email: user?.user_id ?? "",
        authCode: "",
        password: "",
        confirmPassword: "",
        permissionLevel: user?.permission_level ?? "",
    }));

    const [agreements, setAgreements] = useState<AgreementState>({
        service: user?.agreements?.service ?? true,
        privacy: user?.agreements?.privacy ?? true,
        overseas: user?.agreements?.overseas ?? true,
        marketing: user?.agreements?.marketing ?? false,
    });
    const [openTerm, setOpenTerm] = useState<TermKey | null>(null);
    const [openWithdrawDialog, setOpenWithdrawDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

    // #.선택된 권역 기준으로 법인 코드 목록을 필터링한다.
    const filteredCorporations = useMemo(() => {
        if (!form.authority) return [];

        const groups =
            form.authority === "all"
                ? SIGNUP_AFFILIATION_GROUPS
                : SIGNUP_AFFILIATION_GROUPS.filter((g) => g.authorityCode === form.authority);

        return Array.from(
            new Set(groups.flatMap((g) =>
                g.corporations.map((c) => c.corporationCode)
            ))
        );
    }, [form.authority]);

    // #.선택된 권역/법인 기준으로 국가 목록을 필터링한다.
    const filteredCountries = useMemo(() => {
        if (!form.authority) return [];

        const groups =
            form.authority === "all"
                ? SIGNUP_AFFILIATION_GROUPS
                : SIGNUP_AFFILIATION_GROUPS.filter(
                    (g) => g.authorityCode === form.authority
                );

        const countries = form.corporation
            ? groups
            .flatMap((g) => g.corporations)
            .find((c) => c.corporationCode === form.corporation)
            ?.countries ?? []
            : groups.flatMap((g) =>
                g.corporations.flatMap((c) => c.countries)
            );

        return Array.from(new Set(countries));
    }, [form.authority, form.corporation]);

    // #.약관 전체 동의 여부를 계산한다.
    const allAgreed = useMemo(
        () => Object.values(agreements).every(Boolean),
        [agreements]
    );
    // #.회원정보 수정 버튼 활성화 여부를 위한 최소 필수 검증 스키마다.
    const myPageRequiredSchema = useMemo(() => (
        z.object({
            form: z.object({
                authority: z.string().trim().min(1),
                corporation: z.string().trim().min(1),
                country: z.string(),
                name: z.string().trim().min(1),
                department: z.string().trim().min(1),
                phoneCountry: z.string(),
                phone: z.string().trim().min(1),
                email: z.string().trim().min(1),
                authCode: z.string(),
                password: z.string().trim().min(1),
                confirmPassword: z.string().trim().min(1),
                permissionLevel: z.string().trim().min(1),
            }),
            agreements: z.object({
                service: z.literal(true),
                privacy: z.literal(true),
                overseas: z.literal(true),
                marketing: z.boolean(),
            }),
        }).superRefine((value, ctx) => {
            if (value.form.password !== value.form.confirmPassword) {
                ctx.addIssue({
                    code: "custom",
                    path: ["form", "confirmPassword"],
                    message: "signup.errors.confirmPassword",
                });
            }
        })
    ), []);

    // #.회원정보 수정 시 사용할 상세 유효성 검사 스키마를 구성한다.
    const myPageSchema = useMemo(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d+$/;
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
                authCode: z.string(),
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

    // #. 최소 필수 검증 결과를 기준으로 수정 버튼 활성화 여부를 계산한다.
    const canUpdate = useMemo(
        () => myPageRequiredSchema.safeParse({form, agreements}).success,
        [myPageRequiredSchema, form, agreements]
    );

    // #. 약관별 라벨/제목/본문 메타 정보를 구성한다.
    const termMeta = useMemo<Record<TermKey, TermMeta>>(() => ({
        service: {
            label: t("signup.terms.service.label"),
            title: t("signup.terms.service.title"),
            body: t("signup.terms.service.body", {returnObjects: true}) as string[],
        },
        privacy: {
            label: t("signup.terms.privacy.label"),
            title: t("signup.terms.privacy.title"),
            body: t("signup.terms.privacy.body", {returnObjects: true}) as string[],
        },
        overseas: {
            label: t("signup.terms.overseas.label"),
            title: t("signup.terms.overseas.title"),
            body: t("signup.terms.overseas.body", {returnObjects: true}) as string[],
        },
        marketing: {
            label: t("signup.terms.marketing.label"),
            title: t("signup.terms.marketing.title"),
            body: t("signup.terms.marketing.body", {returnObjects: true}) as string[],
        },
    }), [t]);

    // #. 제출 이후 필드별 에러 목록을 조회한다.
    const getErrors = (key: string) => (submitted ? (validationErrors[key] || []) : []);
    // #. 에러 키를 번역 문자열로 변환한다.
    const getErrorMessages = (key: string) => getErrors(key).map((errorKey) => t(errorKey));

    // #.단일 필드 값을 변경한다.
    const onChangeField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
        setForm((prev) => ({...prev, [key]: value}));
    };

    // #.권역 변경 시 법인/국가를 초기화한다.
    const onChangeAuthority = (value: string) => {
        setForm((prev) => ({
            ...prev,
            authority: value,
            corporation: "",
            country: "",
        }));
    };

    // #.법인 변경 시 국가를 초기화한다.
    const onChangeCorporation = (value: string) => {
        setForm((prev) => ({
            ...prev,
            corporation: value,
            country: "",
        }));
    };

    // #.전체 동의 체크 상태를 모든 약관에 일괄 반영한다.
    const onToggleAll = (checked: boolean) => {
        setAgreements({
            service: checked,
            privacy: checked,
            overseas: checked,
            marketing: checked,
        });
    };

    // #.개별 약관 동의 상태를 변경한다.
    const onToggleAgreement = (key: TermKey, checked: boolean) => {
        setAgreements((prev) => ({...prev, [key]: checked}));
    };

    // #. 필수 조건 충족 시에만 수정 요청을 수행한다.
    const onClickUpdate = () => {
        setSubmitted(true);
        const result = myPageSchema.safeParse({form, agreements});
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

        // TODO : API 연동하여 회원정보 수정 요청 수행
        console.log("my_page update payload", {form, agreements});
    };

    const onConfirmWithdraw = () => {
        setOpenWithdrawDialog(false);
        navigate("/login");
    };

    return (
        <>
            <Card className="mx-auto w-full max-w-6xl border shadow-sm">
                <CardContent className="space-y-8 pt-8">
                    <form className="space-y-8">
                        <section className="space-y-3">
                            <SectionTitle title={t("signup.sections.affiliation")} required hint={t("signup.requiredHint")}/>

                            <div className="grid gap-3 md:grid-cols-3">
                                <FieldBlock label={t("signup.fields.authority")} required errors={getErrorMessages("form.authority")}>
                                    <Select value={form.authority} onValueChange={onChangeAuthority}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("signup.placeholders.select")}/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SIGNUP_AUTHORITY_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {t(option.labelKey)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FieldBlock>

                                <FieldBlock label={t("signup.fields.corporation")} required errors={getErrorMessages("form.corporation")}>
                                    <Select value={form.corporation} onValueChange={onChangeCorporation}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("signup.placeholders.select")}/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredCorporations.map((corp) => (
                                                <SelectItem key={corp} value={corp}>
                                                    {corp}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FieldBlock>

                                <FieldBlock label={t("signup.fields.countryOptional")}>
                                    <Select value={form.country} onValueChange={(value) => onChangeField("country", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("signup.placeholders.select")}/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredCountries.map((country) => (
                                                <SelectItem key={country} value={country}>
                                                    {country}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FieldBlock>
                            </div>
                        </section>
                        <section className="space-y-3">
                            <SectionTitle title={t("signup.sections.personal")} required hint={t("signup.requiredHint")}/>

                            <div className="grid gap-3 md:grid-cols-2">
                                <FieldBlock label={t("signup.fields.name")} required errors={getErrorMessages("form.name")}>
                                    <Input value={form.name} onChange={(e) => onChangeField("name", e.target.value)}/>
                                </FieldBlock>

                                <FieldBlock label={t("signup.fields.department")} required errors={getErrorMessages("form.department")}>
                                    <Input value={form.department} onChange={(e) => onChangeField("department", e.target.value)}/>
                                </FieldBlock>
                            </div>

                            <FieldBlock label={t("signup.fields.phone")} required errors={getErrorMessages("form.phone")}>
                                <div className="grid gap-2 md:grid-cols-[170px_1fr]">
                                    <Select value={form.phoneCountry} onValueChange={(value) => onChangeField("phoneCountry", value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("signup.placeholders.countryCode")}/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SIGNUP_PHONE_CODE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {t(option.labelKey)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        value={form.phone}
                                        onChange={(e) => onChangeField("phone", e.target.value.replace(/\D/g, ""))}
                                        placeholder={t("signup.placeholders.phoneNumber")}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                    />
                                </div>
                            </FieldBlock>

                            <FieldBlock label={t("signup.fields.emailId")} required errors={getErrorMessages("form.email")}>
                                <Input
                                    value={form.email}
                                    onChange={(e) => onChangeField("email", e.target.value)}
                                    placeholder={t("signup.placeholders.email")}
                                />
                            </FieldBlock>

                            <FieldBlock label={t("signup.fields.password")} required errors={getErrorMessages("form.password")}>
                                <PasswordInput value={form.password} onChange={(e) => onChangeField("password", e.target.value)}/>
                            </FieldBlock>

                            <FieldBlock label={t("signup.fields.confirmPassword")} required
                                        errors={getErrorMessages("form.confirmPassword")}>
                                <PasswordInput value={form.confirmPassword}
                                               onChange={(e) => onChangeField("confirmPassword", e.target.value)}/>
                            </FieldBlock>
                        </section>

                        <section className="space-y-3">
                            <SectionTitle title={t("signup.sections.permission")} required hint={t("signup.requiredHint")}/>

                            <FieldBlock label={t("signup.fields.permissionLevel")} required
                                        errors={getErrorMessages("form.permissionLevel")}>
                                <Select value={form.permissionLevel} onValueChange={(value) => onChangeField("permissionLevel", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("signup.placeholders.select")}/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SIGNUP_PERMISSION_LEVEL_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {t(option.labelKey)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FieldBlock>
                        </section>

                        <section className="space-y-3">
                            <div className="rounded-md border p-4 space-y-2">
                                <Label className="flex items-center gap-2 text-base">
                                    <Checkbox checked={allAgreed} onCheckedChange={(checked) => onToggleAll(checked === true)}/>
                                    {t("signup.agreements.all")}
                                </Label>

                                <div className="space-y-2 text-sm">
                                    {(Object.keys(termMeta) as TermKey[]).map((key) => (
                                        <div key={key} className="flex items-center gap-2">
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

                        <div className="flex items-center justify-center gap-3 border-t pt-5">
                            <Button type="button" variant="secondary" onClick={() => setOpenWithdrawDialog(true)}>
                                {t("myPage.buttons.withdraw")}
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => navigate("/")}>
                                {t("signup.buttons.moveToMain")}
                            </Button>
                            <Button type="button" onClick={onClickUpdate} disabled={!canUpdate}>
                                {t("myPage.buttons.update")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <AgreementTermDialog
                open={openTerm !== null}
                title={openTerm ? termMeta[openTerm].title : ""}
                description=""
                body={openTerm ? termMeta[openTerm].body : []}
                confirmLabel={t("signup.buttons.agree")}
                onOpenChange={(open) => setOpenTerm(open ? openTerm : null)}
                onConfirm={() => {
                    if (openTerm) onToggleAgreement(openTerm, true);
                    setOpenTerm(null);
                }}
            />

            <Dialog open={openWithdrawDialog} onOpenChange={setOpenWithdrawDialog}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>회원가입 탈퇴</DialogTitle>
                        <DialogDescription>
                            회원가입 탈퇴를 신청 하시겠습니까?
                            <br/>
                            관리자 승인 후 최종 완료되며, 회원탈퇴가 완료되면 해당 웹사이트는 동일한 아이디로 접속이 불가능 합니다.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button type="button" onClick={onConfirmWithdraw}>예</Button>
                        <Button type="button" variant="outline" onClick={() => setOpenWithdrawDialog(false)}>아니오</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MyPage;
