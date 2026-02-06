import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/stores/user.store.ts";

const UseLogout = () => {
    const navigate = useNavigate();
    const clearUser = useUserStore((s) => s.clearUser);

    const logout = () => {
        clearUser(); // Store 초기화
        navigate("/login", { replace: true }); // 로그인 화면으로 이동
    };

    return { logout };
};

export default UseLogout;