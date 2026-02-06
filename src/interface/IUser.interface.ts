import type { Role } from "@/enums/role.ts";

export interface IUserInterface {
    id: number;
    name: string;
    role: Role;
    user_id: string;
}

export interface IUserSampleDataParams {
    page: number;
    pageSize: number;
    query?: string;
    filterKey?: "all" | keyof IUserInterface;
    sortKey?: keyof IUserInterface | null;
    sortDirection?: "asc" | "desc";
}
