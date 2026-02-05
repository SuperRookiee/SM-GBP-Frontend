import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { login as loginAction, logout as logoutAction } from "@/services/authActions.ts";
import { useUserStore } from "@/stores/userStore.ts";

const AuthDemoPage = () => {
    const user = useUserStore((s) => s.user);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        try {
            await loginAction(username, password);
        } catch {
            alert("아이디 또는 비밀번호가 틀렸습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        await logoutAction();
        setLoading(false);
    };

    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 px-6 py-10">
            <div className="w-full max-w-2xl space-y-6 rounded-lg border border-border/60 bg-card p-6 shadow-sm">
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold">Auth Session Demo</h1>
                    <p className="text-sm text-muted-foreground">
                        Demo 계정 비밀번호는 <span className="font-medium text-foreground">password</span> 입니다.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <form className="space-y-4" onSubmit={handleLogin}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="username">Username</FieldLabel>
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    placeholder="1 or 관리자"
                                    autoComplete="username"
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="password"
                                    autoComplete="current-password"
                                />
                            </Field>
                            <Button type="submit" disabled={loading}>
                                로그인
                            </Button>
                        </FieldGroup>
                    </form>

                    <div className="space-y-3 rounded-md border border-border/60 bg-muted/30 p-4">
                        <h2 className="text-lg font-semibold">현재 상태</h2>
                        {user ? (
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>
                                    <span className="text-foreground">ID:</span> {user.id}
                                </li>
                                <li>
                                    <span className="text-foreground">이름:</span> {user.name}
                                </li>
                                <li>
                                    <span className="text-foreground">권한:</span> {user.role ?? "N/A"}
                                </li>
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">현재 로그아웃 상태입니다.</p>
                        )}

                        <Button variant="outline" onClick={handleLogout} disabled={!user || loading}>
                            로그아웃
                        </Button>
                    </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                    <FieldDescription>✅ 새로고침해도 로그인 상태가 유지됩니다.</FieldDescription>
                    <FieldDescription>✅ 새 탭을 열면 기존 탭이 살아있는 동안 자동으로 복구됩니다.</FieldDescription>
                    <FieldDescription>✅ 브라우저를 완전히 종료하면 세션이 사라져 로그아웃됩니다.</FieldDescription>
                </div>
            </div>
        </div>
    );
};

export default AuthDemoPage;
