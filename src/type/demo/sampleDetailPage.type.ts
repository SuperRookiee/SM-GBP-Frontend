import type { z } from "zod";
import type { sampleDetailFormSchema } from "@/pages/demo/form/sampleDetailPage.schema.ts";

export type SampleDetailFormValues = z.infer<typeof sampleDetailFormSchema>;

export type SampleDetailFormState = {
    status: "idle" | "error" | "success";
    message: string;
    errors?: Record<string, string[]>;
    values: Partial<SampleDetailFormValues>;
};

export type SampleDetailFieldName = Extract<keyof SampleDetailFormValues, string>;
