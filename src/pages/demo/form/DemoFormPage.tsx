import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { z } from "zod";

const formSchema = z.object({
    name: z.string().trim().min(2, "이름을 2자 이상 입력해주세요."),
    email: z.string().trim().email("올바른 이메일 주소를 입력해주세요."),
    age: z.coerce.number({ invalid_type_error: "나이를 숫자로 입력해주세요." })
        .int("정수로 입력해주세요.")
        .min(18, "18세 이상만 가능합니다.")
        .max(120, "120세 이하로 입력해주세요."),
    role: z.enum(["designer", "developer", "manager"], {
        errorMap: () => ({ message: "역할을 선택해주세요." }),
    }),
    message: z.preprocess(
        (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
        z.string().trim().min(10, "메시지는 10자 이상 입력해주세요.").max(200, "200자 이하로 입력해주세요.").optional(),
    ),
});

type FormState = {
    status: "idle" | "error" | "success";
    message: string;
    errors: Record<string, string[]>;
    values: Record<string, FormDataEntryValue>;
};

const initialState: FormState = {
    status: "idle",
    message: "",
    errors: {},
    values: {},
};

const SubmitButton = () => {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={pending}
        >
            {pending ? "처리 중..." : "제출"}
        </button>
    );
};

const DemoFormPage = () => {
    const action = async (_prevState: FormState, formData: FormData): Promise<FormState> => {
        const rawValues = Object.fromEntries(formData.entries());
        const result = formSchema.safeParse(rawValues);

        if (!result.success) {
            return {
                status: "error",
                message: "입력값을 다시 확인해주세요.",
                errors: result.error.flatten().fieldErrors,
                values: rawValues,
            };
        }

        return {
            status: "success",
            message: `${result.data.name}님, 폼이 정상적으로 제출되었습니다!`,
            errors: {},
            values: result.data,
        };
    };

    const [state, formAction] = useActionState(action, initialState);

    const renderError = (field: keyof typeof state.errors) =>
        state.errors[field]?.map((error) => (
            <p key={error} className="text-xs text-rose-500">
                {error}
            </p>
        ));

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Demo Form</h1>
                <p className="mt-2 text-sm text-slate-600">
                    React 19의 form action과 zod 유효성 검사를 활용한 샘플입니다.
                </p>
            </div>

            <form action={formAction} className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm font-medium text-slate-800">
                        이름
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        defaultValue={state.values.name?.toString() ?? ""}
                        className="h-10 rounded-md border border-slate-300 px-3 text-sm focus:border-slate-400 focus:outline-none"
                        placeholder="홍길동"
                    />
                    {renderError("name")}
                </div>

                <div className="grid gap-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-800">
                        이메일
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={state.values.email?.toString() ?? ""}
                        className="h-10 rounded-md border border-slate-300 px-3 text-sm focus:border-slate-400 focus:outline-none"
                        placeholder="sample@gbp.com"
                    />
                    {renderError("email")}
                </div>

                <div className="grid gap-2">
                    <label htmlFor="age" className="text-sm font-medium text-slate-800">
                        나이
                    </label>
                    <input
                        id="age"
                        name="age"
                        type="number"
                        defaultValue={state.values.age?.toString() ?? ""}
                        className="h-10 rounded-md border border-slate-300 px-3 text-sm focus:border-slate-400 focus:outline-none"
                        placeholder="18"
                        min={18}
                        max={120}
                    />
                    {renderError("age")}
                </div>

                <div className="grid gap-2">
                    <label htmlFor="role" className="text-sm font-medium text-slate-800">
                        역할
                    </label>
                    <select
                        id="role"
                        name="role"
                        defaultValue={state.values.role?.toString() ?? ""}
                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:border-slate-400 focus:outline-none"
                    >
                        <option value="" disabled>
                            선택해주세요
                        </option>
                        <option value="designer">디자이너</option>
                        <option value="developer">개발자</option>
                        <option value="manager">기획자</option>
                    </select>
                    {renderError("role")}
                </div>

                <div className="grid gap-2">
                    <label htmlFor="message" className="text-sm font-medium text-slate-800">
                        메시지 (선택)
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        rows={4}
                        defaultValue={state.values.message?.toString() ?? ""}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                        placeholder="하고 싶은 말을 남겨주세요."
                    />
                    {renderError("message")}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="text-sm text-slate-600">
                        {state.status === "success" && <p className="text-emerald-600">{state.message}</p>}
                        {state.status === "error" && <p className="text-rose-600">{state.message}</p>}
                    </div>
                    <SubmitButton />
                </div>
            </form>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-700">폼 데이터 미리보기</p>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-700">
                    {JSON.stringify(state.values, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default DemoFormPage;
