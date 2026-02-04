import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "@/stores/userStore";
import LoginForm from "@/components/sign/LoginForm.tsx";

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const setUser = useUserStore((s) => s.setUser);
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");

    const from = location.state?.from?.pathname || "/";

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // FIXME: 실제 로그인 로직으로 교체 필요
        if (id === "1" && password === "1") {
            setUser({
                id: "1",
                name: "관리자",
                role: "ADMIN",
            });

            navigate(from, { replace: true });
        } else {
            alert("아이디 또는 비밀번호가 틀렸습니다.");
        }
    };

    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm
                    id={id}
                    password={password}
                    onIdChange={setId}
                    onPasswordChange={setPassword}
                    onSubmit={handleLogin}
                />
            </div>
        </div>
    );
};

export default LoginPage;