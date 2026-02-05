import { useNavigate } from "react-router-dom";
import { logout as logoutAction } from "@/services/authActions.ts";

const UseLogout = () => {
    const navigate = useNavigate();

    const logout = async () => {
        await logoutAction();
        navigate("/login", { replace: true });
    };

    return { logout };
};

export default UseLogout;
