export type SampleDetailFormValues = {
    name: string;
    email: string;
    age: number;
    role: "designer" | "developer" | "manager";
    message?: string;
};

export type SampleDetailFormState = {
    status: "idle" | "error" | "success";
    message: string;
    errors?: Record<string, string[]>;
    values: Partial<SampleDetailFormValues>;
};

export type SampleDetailFieldName = Extract<keyof SampleDetailFormValues, string>;
