import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store.ts";

// #. 로그아웃 기능을 제공하는 훅이다.
const UseLogout = () => {
    const navigate = useNavigate();
    const clearUser = useAuthStore((s) => s.clearUser);

// #. 로그아웃 처리와 이동을 수행한다.
    const logout = () => {
        clearUser(); // Store 초기화
        navigate("/login", { replace: true }); // 로그인 화면으로 이동
    };

    return { logout };
};

export default UseLogout;

