import { Delete, Get, Post, Put } from "@/utils/http.ts";
import type {
    ISampleApiItem,
    ISampleListRequest,
    ISampleListResponse,
    ISampleUpsertPayload,
} from "@/interfaces/demo/ISample.interface.ts";
import type { IApiResponse } from "@/interfaces/IApiResponse.ts";

// 샘플 목록을 조회합니다.
export const GetSampleListApi = (params: ISampleListRequest) => {
    return Get<IApiResponse<ISampleListResponse>>("/sample/orm/list", params);
};

// 샘플 단건 상세를 조회합니다.
export const GetSampleDetailApi = (id: number) => {
    return Get<IApiResponse<ISampleApiItem>>(`/sample/orm/${id}`);
};

// 샘플을 신규 등록합니다.
export const CreateSampleApi = (payload: ISampleUpsertPayload) => {
    return Post<IApiResponse<ISampleApiItem>>("/sample/orm", payload);
};

// 샘플을 수정합니다.
export const UpdateSampleApi = (id: number, payload: ISampleUpsertPayload) => {
    return Put<IApiResponse<ISampleApiItem>>(`/sample/orm/${id}`, payload);
};

// 샘플을 삭제합니다.
export const DeleteSampleApi = (id: number) => {
    return Delete<IApiResponse<string>>(`/sample/orm/${id}`);
};

// 키워드로 샘플 목록을 검색합니다.
export const SearchSampleApi = (keyword: string, params: Pick<ISampleListRequest, "page" | "size">) => {
    return Get<IApiResponse<ISampleListResponse>>("/sample/orm/search", {
        keyword,
        ...params,
        offset: (params.page - 1) * params.size,
    });
};
