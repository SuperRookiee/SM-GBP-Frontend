import { useActionState } from "react";
import { z } from "zod";
import SubmitButton from "@/components/common/SubmitButton.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const roleEnum = z.enum(["designer", "developer", "manager"]);

const formSchema = z.object({
    name: z.string().trim().min(2, "이름을 2자 이상 입력해주세요."),
    email: z.string().trim().email("올바른 이메일 주소를 입력해주세요."),
    age: z.coerce.number().int().min(18, "18세 이상만 가능").max(120),
    role: z
        .preprocess((v) => (v === "" ? undefined : v), roleEnum.optional())
        .refine((v) => v !== undefined, {
            message: "역할을 선택해주세요.",
        }),
    message: z.string().trim().min(10, "10자 이상").max(200).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

type FormState = {
    status: "idle" | "error" | "success";
    message: string;
    errors?: Record<string, string[]>;
    values: Partial<FormValues>;
};

type FieldName = Extract<keyof FormValues, string>;

function ErrorMsg({ field, errors }: { field: FieldName; errors?: Record<string, string[]> }) {
    const error = errors?.[field];
    return error ? <p className="text-xs font-medium text-destructive mt-1">{error[0]}</p> : null;
}

const DemoFormPage = () => {
    const [state, formAction] = useActionState(
        async (_prevState: FormState, formData: FormData): Promise<FormState> => {
            const rawValues = Object.fromEntries(formData);
            const result = formSchema.safeParse(rawValues);

            if (!result.success) {
                return {
                    status: "error",
                    message: "입력값을 다시 확인해주세요.",
                    errors: z.flattenError(result.error).fieldErrors,
                    values: rawValues as Partial<FormValues>,
                };
            }

            // 성공 로직
            return {
                status: "success",
                message: `${result.data.name}님, 제출 완료!`,
                values: result.data,
            };
        },
        { status: "idle", message: "", values: {} }
    );

    return (
        <div className="flex flex-col md:flex-row min-h-screen gap-6">
            <Card className="flex-5 h-full">
                <CardHeader>
                    <CardTitle>Demo Form</CardTitle>
                    <CardDescription>검증 예제</CardDescription>
                </CardHeader>

                <CardContent className="h-full">
                    <form action={formAction} className="space-y-6">
                        {/* 전체 메시지 */}
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
                            <Label htmlFor="name">이름</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={state.values.name ?? ""}
                                placeholder="이름"
                                className="focus-visible:ring-primary"
                            />
                            <ErrorMsg field="name" errors={state.errors}/>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">이메일</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={state.values.email ?? ""}
                                placeholder="hong@example.com"
                                className="focus-visible:ring-primary"
                            />
                            <ErrorMsg field="email" errors={state.errors}/>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="age">나이</Label>
                            <Input
                                id="age"
                                name="age"
                                type="number"
                                defaultValue={state.values.age ?? ""}
                                placeholder="18"
                                className="focus-visible:ring-primary"
                                min={18}
                            />
                            <ErrorMsg field="age" errors={state.errors}/>
                        </div>

                        <div className="space-y-2">
                            <Label>역할</Label>
                            <Select name="role" defaultValue={state.values.role ?? undefined}>
                                <SelectTrigger className="focus-visible:ring-primary">
                                    <SelectValue placeholder="선택하세요"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="designer">Designer</SelectItem>
                                    <SelectItem value="developer">Developer</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                </SelectContent>
                            </Select>
                            <ErrorMsg field="role" errors={state.errors}/>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">메시지 (선택)</Label>
                            <Textarea
                                id="message"
                                name="message"
                                defaultValue={state.values.message ?? ""}
                                placeholder="10자 이상 입력하면 검증됩니다."
                                className="min-h-28 focus-visible:ring-primary"
                            />
                            <ErrorMsg field="message" errors={state.errors}/>
                        </div>

                        <div className="flex justify-end">
                            <SubmitButton pendingText="처리 중..." submitText="제출하기"/>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <Card className="flex-2 h-full rounded-xl bg-slate-950 p-6 text-slate-50 shadow-2xl flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Live State Preview</h4>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-400">TypeScript Validated</span>
                </div>
                <pre className="text-sm leading-relaxed font-mono text-emerald-400 overflow-auto max-h-150">
                    {JSON.stringify(state, null, 2)}
                </pre>
            </Card>
        </div>
    );
};

export default DemoFormPage;
