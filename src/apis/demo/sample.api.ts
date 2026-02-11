import { Get } from "@/utils/http.ts";

export type SampleListResponse = Record<string, unknown> | unknown[];

export const GetSampleListApi = async () => {
    return Get<SampleListResponse>("/sample/list");
};