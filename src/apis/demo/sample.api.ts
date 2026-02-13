import { Get } from "@/utils/http.ts";
import type { IApiResponse } from "@/interface/IApiResponse.ts";

export interface ISampleApiItem {
    id: number;
    name: string;
    description: string;
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
