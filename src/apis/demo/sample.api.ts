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

export const GetSampleListApi = async () => {
    return Get<ISampleListApiResponse>("/sample/list");
};
