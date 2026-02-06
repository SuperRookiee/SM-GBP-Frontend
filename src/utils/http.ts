import type { AxiosError, AxiosRequestConfig } from "axios";
import axios from "axios";

const apiClient = axios.create({
    baseURL: "/api",
    withCredentials: true,
    timeout: 15_000,
});

const tokenStore = {
    getAccessToken: () => localStorage.getItem("accessToken"),
    setAccessToken: (token: string) => localStorage.setItem("accessToken", token),
    getRefreshToken: () => localStorage.getItem("refreshToken"),
    setRefreshToken: (token: string) => localStorage.setItem("refreshToken", token),
    clear: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    },
};

type RefreshResponse = { accessToken: string; refreshToken?: string };

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const enqueue = (cb: (token: string | null) => void) => refreshQueue.push(cb);
const flushQueue = (token: string | null) => {
    refreshQueue.forEach((cb) => cb(token));
    refreshQueue = [];
};

async function refreshAccessToken(): Promise<string> {
    const refreshToken = tokenStore.getRefreshToken();

    // refreshToken이 없다면 바로 실패
    if (!refreshToken) throw new Error("No refresh token");

    // refresh API 엔드포인트 / 응답 형식 : 프로젝트에 맞게 수정
    const { data } = await apiClient.post<RefreshResponse>(
        "/auth/refresh",
        null,
        { headers: { "X-Refresh-Token": refreshToken } }
    );

    tokenStore.setAccessToken(data.accessToken);
    if (data.refreshToken) tokenStore.setRefreshToken(data.refreshToken);

    return data.accessToken;
}

// Request: access/refresh 자동 첨부
apiClient.interceptors.request.use((config) => {
    const accessToken = tokenStore.getAccessToken();
    const refreshToken = tokenStore.getRefreshToken();

    config.headers = config.headers ?? {};

    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    if (refreshToken) config.headers["X-Refresh-Token"] = refreshToken;

    return config;
});

// Response: 401이면 refresh → 원 요청 재시도 (중복 refresh 방지 queue)
apiClient.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
        const status = err.response?.status;
        const original = err.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

        if (status !== 401 || !original || original._retry) {
            return Promise.reject(err);
        }

        original._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                enqueue((token) => {
                    if (!token) return reject(err);
                    original.headers = original.headers ?? {};
                    original.headers.Authorization = `Bearer ${token}`;
                    resolve(apiClient(original));
                });
            });
        }

        isRefreshing = true;

        try {
            const newToken = await refreshAccessToken();
            flushQueue(newToken);

            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${newToken}`;

            return apiClient(original);
        } catch (refreshErr) {
            flushQueue(null);
            tokenStore.clear();
            return Promise.reject(refreshErr);
        } finally {
            isRefreshing = false;
        }
    }
);

// ---- 공통 함수들 ----
export const Get = <T>(url: string, params?: unknown, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, { ...config, params }).then((r) => r.data);

export const Post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((r) => r.data);

export const Put = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((r) => r.data);

export const Patch = <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((r) => r.data);

export const Delete = <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((r) => r.data);
