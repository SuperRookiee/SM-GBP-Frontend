import type { Role } from "@/enums/role.ts";

export interface IUser {
    id: number;
    name: string;
    role: Role;
    user_id: string;
}

export interface IUserSampleDataParams {
    page: number;
    pageSize: number;
    query?: string;
    filterKey?: "all" | keyof IUser;
    sortKey?: keyof IUser | null;
    sortDirection?: "asc" | "desc";
}
