import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ApiResult = Record<string, unknown> | unknown[];

const DemoApiPage = () => {
    const apiHost = useMemo(() => import.meta.env.MIRACLE_API_HOST as string | undefined, []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ApiResult | null>(null);

    useEffect(() => {
        const request = async () => {
            if (!apiHost) {
                setError("MIRACLE_API_HOST 값이 설정되지 않았습니다.");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${apiHost}/api/sample/list`, {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`API 요청 실패: ${response.status}`);
                }

                const data = (await response.json()) as ApiResult;
                setResult(data);
            } catch (err) {
                const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        void request();
    }, [apiHost]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Demo API</CardTitle>
                <CardDescription>
                    MIRACLE_API_HOST 기준으로 <code>/api/sample/list</code>를 호출합니다.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                    API Host: <span className="font-medium text-foreground">{apiHost ?? "(미설정)"}</span>
                </p>
                {loading ? <p>요청 중...</p> : null}
                {error ? <p className="text-destructive">{error}</p> : null}
                {result ? (
                    <pre className="rounded-md bg-muted p-3 text-xs overflow-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                ) : null}
            </CardContent>
        </Card>
    );
};

export default DemoApiPage;
