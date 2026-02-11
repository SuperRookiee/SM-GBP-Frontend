import { Get } from "@/utils/http.ts";

export interface ISampleApiItem {
    id: number;
    name: string;
    description: string;
}

export interface ISampleListApiResponse {
    code: string;
    data: ISampleApiItem[];
    message: string;
    success: boolean;
}

export interface ISampleListParams {
    page: number;
    pageSize: number;
    query?: string;
    filterKey?: string;
    sortKey?: string;
    sortDirection?: "asc" | "desc";
}

export const GetSampleListApi = (params: ISampleListParams) => {
    return Get<ISampleListApiResponse>("/sample/list", params);
};
