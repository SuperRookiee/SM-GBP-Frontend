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

const getChannel = () => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
        return null;
    }

    if (!channel) {
        channel = new BroadcastChannel(CHANNEL_NAME);
    }

    return channel;
};

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

export const getSessionId = () => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
};

export const setSession = (sessionId: string) => {
    if (typeof window === "undefined") return;
    ensureChannelListener();
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
};

export const clearSession = () => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
};

export const broadcastLogout = () => {
    const activeChannel = getChannel();
    activeChannel?.postMessage({ type: "LOGOUT" } satisfies SessionMessage);
};

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
