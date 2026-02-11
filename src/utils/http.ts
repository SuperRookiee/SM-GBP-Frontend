import type { AxiosError, AxiosRequestConfig } from "axios";
import axios from "axios";

// #. Axios 인스턴스 생성
const apiClient = axios.create({
    baseURL: import.meta.env.MIRACLE_API_HOST,
    withCredentials: true,  // 쿠키 포함 요청 (CORS 대응)
    timeout: 10_000,
});

// TODO 현재는 localStorage 사용 - 추후 쿠키/메모리 방식으로 교체 가능하도록 분리
// #.토큰 저장소 추상화
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

// Refresh 응답 타입
type RefreshResponse = {
    accessToken: string;
    refreshToken?: string;
};

// #. Refresh 동시 요청 방지 상태 관리
let isRefreshing = false;// 현재 refresh 요청 진행 여부
let refreshQueue: Array<(token: string | null) => void> = []; // refresh 완료 후 재시도할 요청 대기열


// #. Refresh 대기열 등록
const enqueue = (cb: (token: string | null) => void) => refreshQueue.push(cb);

// #.  Refresh 완료 후 대기 요청 처리 - token이 null이면 실패 처리
const flushQueue = (token: string | null) => {
    refreshQueue.forEach((cb) => cb(token));
    refreshQueue = [];
};

/**
 * AccessToken 재발급 로직
 * refreshToken 존재 여부 확인
 * /auth/refresh 호출
 * accessToken 저장
 * refreshToken이 갱신되면 함께 저장
 */
async function refreshAccessToken(): Promise<string> {
    const refreshToken = tokenStore.getRefreshToken();

    // refreshToken 없으면 즉시 실패
    if (!refreshToken) throw new Error("No refresh token");

    //  Refresh API 호출
    const { data } = await apiClient.post<RefreshResponse>(
        "/auth/refresh",
        null,
        { headers: { "X-Refresh-Token": refreshToken } }
    );

    // 신규 토큰 저장
    tokenStore.setAccessToken(data.accessToken);
    if (data.refreshToken) tokenStore.setRefreshToken(data.refreshToken);

    return data.accessToken;
}

/**
 * Response 인터셉터
 * 모든 요청에 accessToken / refreshToken 자동 첨부
 */
apiClient.interceptors.request.use((config) => {
    const accessToken = tokenStore.getAccessToken();
    const refreshToken = tokenStore.getRefreshToken();

    config.headers = config.headers ?? {};

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (refreshToken) {
        config.headers["X-Refresh-Token"] = refreshToken;
    }

    return config;
});

/**
 * Response 인터셉터
 * 401 발생 시 refresh 후 원 요청 재시도
 * 동시 401 발생 시 refresh 중복 호출 방지
 */
apiClient.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
        const status = err.response?.status;
        const original = err.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

        // 401이 아니거나 이미 재시도한 요청이면 그대로 실패 반환
        if (status !== 401 || !original || original._retry) {
            return Promise.reject(err);
        }

        original._retry = true;

        // 이미 refresh 진행 중이면 대기열에 등록
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

        // refresh 시작
        isRefreshing = true;

        try {
            const newToken = await refreshAccessToken();

            // 대기 중이던 요청들 재실행
            flushQueue(newToken);

            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${newToken}`;

            return apiClient(original);
        } catch (refreshErr) {
            // refresh 실패 시 토큰 정리
            flushQueue(null);
            tokenStore.clear();
            return Promise.reject(refreshErr);
        } finally {
            isRefreshing = false;
        }
    }
);

// #. 공통 HTTP 함수
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
