import axios, { type AxiosError, type AxiosResponse } from "axios";
import type { ApiResponse, ErrorDetail } from "@/types/sample.types";

export class ApiRequestError extends Error {
    code: string;
    detail: ErrorDetail | null;

    constructor(message: string, code: string, detail: ErrorDetail | null) {
        super(message);
        this.name = "ApiRequestError";
        this.code = code;
        this.detail = detail;
    }
}

export class NetworkRequestError extends Error {
    constructor(message = "Network error") {
        super(message);
        this.name = "NetworkRequestError";
    }
}

export const apiClient = axios.create({
    baseURL: "/api",
    timeout: 10_000,
});

apiClient.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<unknown>>) => {
        const envelope = response.data;

        if (envelope.result === "FAIL") {
            throw new ApiRequestError(
                envelope.error?.detail ?? envelope.message,
                envelope.code,
                envelope.error,
            );
        }

        response.data = envelope.data as ApiResponse<unknown>;
        return response;
    },
    (error: AxiosError<ApiResponse<null>>) => {
        if (!error.response) {
            throw new NetworkRequestError("Unable to connect to server. Please try again.");
        }

        const envelope = error.response.data;
        if (envelope) {
            throw new ApiRequestError(
                envelope.error?.detail ?? envelope.message,
                envelope.code,
                envelope.error,
            );
        }

        throw error;
    },
);
