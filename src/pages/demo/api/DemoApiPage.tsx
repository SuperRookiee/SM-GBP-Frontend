import { useEffect, useState } from "react";
import { GetSampleListApi } from "@/apis/demo/sample.api.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ApiResult = Record<string, unknown> | unknown[];

const DemoApiPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ApiResult | null>(null);

    useEffect(() => {
        const request = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await GetSampleListApi();
                setResult(data);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        void request();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Demo API</CardTitle>
                <CardDescription>
                    <code>/api/sample/list</code>를 호출합니다.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
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