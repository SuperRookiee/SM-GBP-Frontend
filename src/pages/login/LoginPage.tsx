import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "@/components/sign/demo/LoginForm.tsx";
import { login as loginAction } from "@/services/authActions.ts";

// 데모 로그인 페이지
const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");

    const from = location.state?.from?.pathname || "/";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await loginAction(id, password);
            navigate(from, { replace: true });
        } catch {
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
