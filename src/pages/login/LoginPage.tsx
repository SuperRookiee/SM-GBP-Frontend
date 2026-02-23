import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store.ts";
import LoginForm from "@/components/sign/demo/LoginForm.tsx";

const LoginPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const setUser = useAuthStore((s) => s.setUser);
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");

    const from = location.state?.from?.pathname || "/";

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (id === "1" && password === "1") {
            setUser({ id: 1, name: t("login.admin"), role: "admin", user_id: "admin" });
            navigate(from, { replace: true });
        } else {
            alert(t("login.failed"));
        }
    };

    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm id={id} password={password} onIdChange={setId} onPasswordChange={setPassword} onSubmit={handleLogin} />
            </div>
        </div>
    );
};

export default LoginPage;
