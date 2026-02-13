import { Get } from "@/utils/http.ts";
import type { IApiResponse } from "@/interface/IApiResponse.ts";

export interface ISampleApiItem {
    id: number;
    name: string;
    description: string;
    category: string;
    status: string;
    priority: number;
    quantity: number;
    price: number;
    rate: number;
    active: boolean;
    dueDate: string | null;
    memo: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ISampleListResponse {
    content: ISampleApiItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface ISampleListRequest {
    page: number;
    size: number;
    query?: string;
    filterKey?: string;
    sortKey?: string;
    sortDirection?: "asc" | "desc";
}

export const GetSampleListApi = (params: ISampleListRequest) => {
    return Get<IApiResponse<ISampleListResponse>>("/sample/orm/list", params);
};
