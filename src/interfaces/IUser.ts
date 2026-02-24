import type { Role } from "@/enums/role.ts";

export interface IUser {
    id: number;
    name: string;
    role: Role;
    user_id: string;
    password: string;
    authority: string;
    corporation: string;
    country: string;
    department: string;
    phone_country: string;
    phone_number: string;
    permission_level: string;
    agreements: {
        service: true;
        privacy: true;
        overseas: true;
        marketing: boolean;
    };
}

export interface IUserSampleDataParams {
    page: number;
    pageSize: number;
    query?: string;
    filterKey?: "all" | keyof IUser;
    sortKey?: keyof IUser | null;
    sortDirection?: "asc" | "desc";
}
