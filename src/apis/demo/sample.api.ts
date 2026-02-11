import { Get } from "@/utils/http.ts";

// TODO interface 분리
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

export interface ISampleListRequest {
    page: number;
    pageSize: number;
    query?: string;
    filterKey?: string;
    sortKey?: string;
    sortDirection?: "asc" | "desc";
}

export const GetSampleListApi = (params: ISampleListRequest) => {
    return Get<ISampleListApiResponse>("/sample/list", params);
};
