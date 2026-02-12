import { Get } from "@/utils/http.ts";
import type { ApiResult, ErrorType } from "@/enums/api-result.enum.ts";

export interface IFieldError {
    field: string;
    reason: string;
}

export interface IErrorDetail {
    type: ErrorType | string;
    detail: string;
    instance: string;
    fieldErrors: IFieldError[] | null;
}

export interface IApiResponse<T> {
    result: ApiResult;
    code: string;
    message: string;
    data: T | null;
    error: IErrorDetail | null;
}

export interface ISampleApiItem {
    id: number;
    name: string;
    description: string;
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
    return Get<IApiResponse<ISampleApiItem[]>>("/sample/list", params);
};
