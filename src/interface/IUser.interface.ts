import type { Role } from "@/enums/role.ts";

export interface IUserInterface {
    id: number;
    name: string;
    role: Role;
    user_id: string;
}