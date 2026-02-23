import { useActionState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import type { SampleDetailFieldName, SampleDetailFormState, SampleDetailFormValues } from "@/types/demo/sampleDetailPage.type.ts";
import SubmitButton from "@/components/common/SubmitButton.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const roleEnum = z.enum(["designer", "developer", "manager"]);

const initialSampleDetailFormState: SampleDetailFormState = {
    status: "idle",
    message: "",
    values: {},
};

function ErrorMsg({ field, errors }: { field: SampleDetailFieldName; errors?: Record<string, string[]> }) {
    const error = errors?.[field];
    return error ? <p className="text-xs font-medium text-destructive mt-1">{error[0]}</p> : null;
}

const DemoFormPage = () => {
    const { t } = useTranslation();

    const sampleDetailFormSchema = useMemo(() => z.object({
        name: z.string().trim().min(2, t("formDemo.validation.nameMin")),
        email: z.string().trim().email(t("formDemo.validation.emailInvalid")),
        age: z.coerce.number().int().min(18, t("formDemo.validation.ageMin")).max(120),
        role: z
            .preprocess((v) => (v === "" ? undefined : v), roleEnum.optional())
            .refine((v) => v !== undefined, { message: t("formDemo.validation.roleRequired") }),
        message: z.string().trim().min(10, t("formDemo.validation.messageMin")).max(200).optional().or(z.literal("")),
    }), [t]);

    const [state, formAction] = useActionState(
        async (_prevState: SampleDetailFormState, formData: FormData): Promise<SampleDetailFormState> => {
            const rawValues = Object.fromEntries(formData);
            const result = sampleDetailFormSchema.safeParse(rawValues);

            if (!result.success) {
                return {
                    status: "error",
                    message: t("formDemo.globalError"),
                    errors: z.flattenError(result.error).fieldErrors,
                    values: rawValues as Partial<SampleDetailFormValues>,
                };
            }

            return {
                status: "success",
                message: t("formDemo.success", { name: result.data.name }),
                values: result.data,
            };
        },
        initialSampleDetailFormState,
    );

    return (
        <div className="flex flex-col md:flex-row min-h-screen gap-6">
            <Card className="flex-5 h-full">
                <CardHeader>
                    <CardTitle>{t("formDemo.title")}</CardTitle>
                    <CardDescription>{t("formDemo.description")}</CardDescription>
                </CardHeader>

                <CardContent className="h-full">
                    <form action={formAction} className="space-y-6">
                        {state.message ? (
                            <div
                                className={[
                                    "rounded-md px-3 py-2 text-sm",
                                    state.status === "success"
                                        ? "bg-primary/10 text-primary"
                                        : state.status === "error"
                                            ? "bg-destructive/10 text-destructive"
                                            : "bg-muted text-foreground",
                                ].join(" ")}
                            >
                                {state.message}
                            </div>
                        ) : null}

                        <div className="space-y-2">
                            <Label htmlFor="name">{t("table.name")}</Label>
                            <Input id="name" name="name" defaultValue={state.values.name ?? ""} placeholder={t("formDemo.namePlaceholder")} className="focus-visible:ring-primary"/>
                            <ErrorMsg field="name" errors={state.errors}/>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">{t("table.email")}</Label>
                            <Input id="email" name="email" type="email" defaultValue={state.values.email ?? ""} placeholder={t("formDemo.emailPlaceholder")} className="focus-visible:ring-primary"/>
                            <ErrorMsg field="email" errors={state.errors}/>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="age">{t("formDemo.age")}</Label>
                            <Input id="age" name="age" type="number" defaultValue={state.values.age ?? ""} placeholder={t("formDemo.agePlaceholder")} className="focus-visible:ring-primary" min={18}/>
                            <ErrorMsg field="age" errors={state.errors}/>
                        </div>

                        <div className="space-y-2">
                            <Label>{t("table.role")}</Label>
                            <Select name="role" defaultValue={state.values.role ?? undefined}>
                                <SelectTrigger className="focus-visible:ring-primary">
                                    <SelectValue placeholder={t("formDemo.rolePlaceholder")}/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="designer">{t("formDemo.role.designer")}</SelectItem>
                                    <SelectItem value="developer">{t("formDemo.role.developer")}</SelectItem>
                                    <SelectItem value="manager">{t("formDemo.role.manager")}</SelectItem>
                                </SelectContent>
                            </Select>
                            <ErrorMsg field="role" errors={state.errors}/>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">{t("formDemo.messageOptional")}</Label>
                            <Textarea
                                id="message"
                                name="message"
                                defaultValue={state.values.message ?? ""}
                                placeholder={t("formDemo.messagePlaceholder")}
                                className="min-h-28 focus-visible:ring-primary"
                            />
                            <ErrorMsg field="message" errors={state.errors}/>
                        </div>

                        <div className="flex justify-end">
                            <SubmitButton pendingText={t("formDemo.pending")} submitText={t("formDemo.submit")}/>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <Card className="flex-2 h-full rounded-xl bg-slate-950 p-6 text-slate-50 shadow-2xl flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">{t("formDemo.previewTitle")}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-400">{t("formDemo.previewBadge")}</span>
                </div>
                <pre className="text-sm leading-relaxed font-mono text-emerald-400 overflow-auto max-h-150">
                    {JSON.stringify(state, null, 2)}
                </pre>
            </Card>
        </div>
    );
};

export default DemoFormPage;
