import type { IApiResponse } from "@/interface/IApiResponse.ts";
import { Delete, Get, Post, Put } from "@/utils/http.ts";

export interface ISampleApiItem {
    id: number;
    name: string;
    description: string;
    category: string;
    status: string;
    priority: number;
    quantity: number;
    price: number | string;
    rate: number;
    active: boolean;
    dueDate: string | null;
    memo: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ISampleUpsertPayload {
    name: string;
    description: string;
    category: string;
    status: string;
    priority: number;
    quantity: number;
    price: number | string;
    rate: number;
    active: boolean;
    dueDate: string | null;
    memo: string | null;
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

export const GetSampleDetailApi = (id: number) => {
    return Get<IApiResponse<ISampleApiItem>>(`/sample/orm/${id}`);
};

export const CreateSampleApi = (payload: ISampleUpsertPayload) => {
    return Post<IApiResponse<ISampleApiItem>>("/sample/orm", payload);
};

export const UpdateSampleApi = (id: number, payload: ISampleUpsertPayload) => {
    return Put<IApiResponse<ISampleApiItem>>(`/sample/orm/${id}`, payload);
};

export const DeleteSampleApi = (id: number) => {
    return Delete<IApiResponse<string>>(`/sample/orm/${id}`);
};

export const SearchSampleApi = (keyword: string, params: Pick<ISampleListRequest, "page" | "size">) => {
    return Get<IApiResponse<ISampleListResponse>>("/sample/orm/search", {
        keyword,
        ...params,
        offset: (params.page - 1) * params.size,
    });
};
