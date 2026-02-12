import type { ApiResult, ErrorType } from "@/enums/apiResult.enum.ts";

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
