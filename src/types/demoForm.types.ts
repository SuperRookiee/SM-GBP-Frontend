import type { z } from "zod";
import { formSchema } from "@/constants/demoForm.constants";

export type FormValues = z.infer<typeof formSchema>;

export type FormState = {
  status: "idle" | "error" | "success";
  message: string;
  errors?: Record<string, string[]>;
  values: Partial<FormValues>;
};

export type FieldName = Extract<keyof FormValues, string>;
