import { useEffect } from "react";
import { bootstrapSession } from "@/auth/sessionManager.ts";
import { useUserStore } from "@/stores/userStore.ts";

// 앱 최초 진입 시 세션 복구를 실행한다.
const useBootstrapAuth = () => {
    const setUser = useUserStore((s) => s.setUser);
    const clearUser = useUserStore((s) => s.clearUser);
    const setInitialized = useUserStore((s) => s.setInitialized);

    useEffect(() => {
        let active = true;

        const boot = async () => {
            try {
                const user = await bootstrapSession();
                if (!active) return;

                if (user) {
                    setUser(user);
                } else {
                    clearUser();
                }
            } finally {
                if (active) {
                    setInitialized(true);
                }
            }
        };

        boot();

        return () => {
            active = false;
        };
    }, [setUser, clearUser, setInitialized]);
};

export default useBootstrapAuth;
