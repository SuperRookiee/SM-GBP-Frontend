import * as React from "react";
import { GalleryVerticalEnd } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";

interface ILoginFormProps extends React.ComponentProps<"div"> {
    id: string;
    password: string;
    onIdChange: (v: string) => void;
    onPasswordChange: (v: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

const LoginForm = ({ id, password, onIdChange, onPasswordChange, onSubmit, className, ...props }: ILoginFormProps) => {
    const { t } = useTranslation();

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form onSubmit={onSubmit}>
                <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <a href="#" className="flex flex-col items-center gap-2 font-medium">
                            <div className="flex size-8 items-center justify-center rounded-md"><GalleryVerticalEnd className="size-6"/></div>
                            <span className="sr-only">Acme Inc.</span>
                        </a>
                        <h1 className="text-xl font-bold">{t("login.welcome")}</h1>
                        <FieldDescription>{t("login.noAccount")} <a href="#">{t("login.signup")}</a></FieldDescription>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="id">{t("login.id")}</FieldLabel>
                        <Input id="id" type="text" placeholder="1" required value={id} onChange={(e) => onIdChange(e.target.value)} autoComplete="username" />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="password">{t("login.password")}</FieldLabel>
                        <Input id="password" type="password" placeholder="1" required value={password} onChange={(e) => onPasswordChange(e.target.value)} autoComplete="current-password" />
                    </Field>

                    <Field><Button type="submit" className="w-full">{t("login.submit")}</Button></Field>
                    <FieldSeparator>{t("login.or")}</FieldSeparator>

                    <Field className="grid gap-4 sm:grid-cols-2">
                        <Button variant="outline" type="button">{t("login.continueApple")}</Button>
                        <Button variant="outline" type="button">{t("login.continueGoogle")}</Button>
                    </Field>
                </FieldGroup>
            </form>

            <FieldDescription className="px-6 text-center">
                {t("login.termsPrefix")} <a href="#">{t("login.terms")}</a> {t("login.and")} <a href="#">{t("login.privacy")}</a>{t("login.termsSuffix")}
            </FieldDescription>
        </div>
    );
};

export default LoginForm;
