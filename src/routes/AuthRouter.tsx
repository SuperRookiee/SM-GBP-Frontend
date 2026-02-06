import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store.ts";

const AuthRouter = () => {
    const user = useAuthStore((s) => s.user);
    const location = useLocation();

    if (!user) {
        // 로그인 후 원래 가려던 곳으로 돌아오게 하기위한 state 저장
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
};

export default AuthRouter;
