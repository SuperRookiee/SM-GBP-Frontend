import type { User } from "@/types/User.ts";
import { demoMe } from "@/apis/demo/auth.ts";
import { useUserStore } from "@/stores/userStore.ts";

const SESSION_STORAGE_KEY = "demo-session-id";
const CHANNEL_NAME = "auth-session";
const REQUEST_TIMEOUT_MS = 600;

type SessionMessage =
    | { type: "REQUEST_SESSION" }
    | { type: "RESPONSE_SESSION"; sessionId: string; user: User }
    | { type: "LOGOUT" };

let channel: BroadcastChannel | null = null;
let listenerAttached = false;

// BroadcastChannel 인스턴스를 생성/재사용한다.
const getChannel = () => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
        return null;
    }

    if (!channel) {
        channel = new BroadcastChannel(CHANNEL_NAME);
    }

    return channel;
};

// 탭 간 메시지 리스너를 1회만 등록한다.
const ensureChannelListener = () => {
    if (listenerAttached) return;

    const activeChannel = getChannel();
    if (!activeChannel) return;

    activeChannel.addEventListener("message", async (event) => {
        const message = event.data as SessionMessage | undefined;
        if (!message) return;

        if (message.type === "REQUEST_SESSION") {
            const sessionId = getSessionId();
            if (!sessionId) return;

            const storedUser = useUserStore.getState().user;
            if (storedUser) {
                activeChannel.postMessage({ type: "RESPONSE_SESSION", sessionId, user: storedUser });
                return;
            }

            try {
                const { user } = await demoMe(sessionId);
                activeChannel.postMessage({ type: "RESPONSE_SESSION", sessionId, user });
            } catch {
                return;
            }
        }

        if (message.type === "LOGOUT") {
            clearSession();
            useUserStore.getState().clearUser();
        }
    });

    listenerAttached = true;
};

// 현재 탭의 sessionStorage에 저장된 세션 ID 조회
export const getSessionId = () => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
};

// 세션 ID를 저장하고 메시지 리스너를 활성화한다.
export const setSession = (sessionId: string) => {
    if (typeof window === "undefined") return;
    ensureChannelListener();
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
};

// 세션 ID를 삭제한다.
export const clearSession = () => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
};

// 다른 탭에 로그아웃을 전파한다.
export const broadcastLogout = () => {
    const activeChannel = getChannel();
    activeChannel?.postMessage({ type: "LOGOUT" } satisfies SessionMessage);
};

// 앱 시작 시 세션 복구 (현재 탭 또는 다른 탭에 요청)
export const bootstrapSession = async (): Promise<User | null> => {
    ensureChannelListener();

    const sessionId = getSessionId();
    if (sessionId) {
        try {
            const { user } = await demoMe(sessionId);
            return user;
        } catch {
            clearSession();
            return null;
        }
    }

    const activeChannel = getChannel();
    if (!activeChannel) return null;

    return new Promise((resolve) => {
        const timeoutId = window.setTimeout(() => {
            activeChannel.removeEventListener("message", onMessage);
            resolve(null);
        }, REQUEST_TIMEOUT_MS);

        const onMessage = (event: MessageEvent) => {
            const message = event.data as SessionMessage | undefined;
            if (!message || message.type !== "RESPONSE_SESSION") return;

            window.clearTimeout(timeoutId);
            activeChannel.removeEventListener("message", onMessage);
            setSession(message.sessionId);
            resolve(message.user);
        };

        activeChannel.addEventListener("message", onMessage);
        activeChannel.postMessage({ type: "REQUEST_SESSION" } satisfies SessionMessage);
    });
};
