import { Get } from "@/utils/http.ts";


export const GetSampleListApi = async () => {
    return Get("/sample/list");
};