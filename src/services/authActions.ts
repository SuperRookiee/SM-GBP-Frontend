import { buildSessionId, demoLogin, demoLogout } from "@/apis/demo/auth.ts";
import { broadcastLogout, clearSession, setSession } from "@/auth/sessionManager.ts";
import { useUserStore } from "@/stores/userStore.ts";

export const login = async (username: string, password: string) => {
    const { user } = await demoLogin(username, password);
    const sessionId = buildSessionId(user.id);
    setSession(sessionId);
    const { setUser, setInitialized } = useUserStore.getState();
    setUser(user);
    setInitialized(true);
    return user;
};

export const logout = async () => {
    await demoLogout();
    clearSession();
    const { clearUser, setInitialized } = useUserStore.getState();
    clearUser();
    setInitialized(true);
    broadcastLogout();
};
