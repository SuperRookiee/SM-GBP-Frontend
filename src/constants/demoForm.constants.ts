import { z } from "zod";

const roleEnum = z.enum(["designer", "developer", "manager"]);

export const formSchema = z.object({
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
