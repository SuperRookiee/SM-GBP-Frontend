export type ApiResult = "SUCCESS" | "FAIL";

export interface FieldError {
    field: string;
    reason: string;
}

export interface ErrorDetail {
    type: string;
    detail: string;
    instance: string;
    fieldErrors?: FieldError[];
}

export interface ApiResponse<T> {
    result: ApiResult;
    code: string;
    message: string;
    data: T | null;
    error: ErrorDetail | null;
}

export interface PageRequest {
    page: number;
    size: number;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
}

export interface SampleItem {
    id: number;
    name: string;
    category: string;
    status: string;
    active: boolean;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface SampleFormValues {
    name: string;
    category: string;
    status: string;
    active: boolean;
    description?: string;
}

export interface SampleSearchParams extends PageRequest {
    name?: string;
    category?: string;
    status?: string;
    active?: boolean;
}
