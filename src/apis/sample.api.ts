import { apiClient } from "@/apis/apiClient";
import type {
    PageResponse,
    SampleFormValues,
    SampleItem,
    SampleSearchParams,
} from "@/types/sample.types";

const SAMPLE_BASE_PATH = "/sample/orm";

export const getSampleList = (params: SampleSearchParams) =>
    apiClient
        .get<PageResponse<SampleItem>>(`${SAMPLE_BASE_PATH}/list`, { params })
        .then((response) => response.data);

export const getSampleById = (id: number) =>
    apiClient.get<SampleItem>(`${SAMPLE_BASE_PATH}/${id}`).then((response) => response.data);

export const createSample = (data: SampleFormValues) =>
    apiClient.post<SampleItem>(`${SAMPLE_BASE_PATH}/`, data).then((response) => response.data);

export const updateSample = (id: number, data: SampleFormValues) =>
    apiClient.put<SampleItem>(`${SAMPLE_BASE_PATH}/${id}`, data).then((response) => response.data);

export const deleteSample = (id: number) =>
    apiClient.delete<null>(`${SAMPLE_BASE_PATH}/${id}`).then((response) => response.data);

export const searchSample = (params: SampleSearchParams) =>
    apiClient
        .get<PageResponse<SampleItem>>(`${SAMPLE_BASE_PATH}/search`, { params })
        .then((response) => response.data);
