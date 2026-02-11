import { Suspense } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { QueryErrorResetBoundary, useSuspenseQuery, } from "@tanstack/react-query";
import { GetSampleListApi } from "@/apis/demo/sample.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";

// #. Error Fallback UI
const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
    return (
        <div className="space-y-3">
            <p className="text-destructive">{error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."}</p>
            <button
                onClick={resetErrorBoundary}
                className="text-sm underline"
            >
                다시 시도
            </button>
        </div>
    );
};

// #. 실제 데이터 렌더 컴포넌트
const DemoContent = () => {
    const { data } = useSuspenseQuery({
        queryKey: ["sample", "list"],
        queryFn: GetSampleListApi,
    });

    return (
        <pre className="rounded-md bg-muted p-3 text-xs overflow-auto">
            {JSON.stringify(data, null, 2)}
        </pre>
    );
};

const DemoApiPage = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Demo API</CardTitle>
                <CardDescription>
                    <code>/api/sample/list</code>를 호출합니다.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
                <QueryErrorResetBoundary>
                    {({ reset }) => (
                        <ErrorBoundary
                            onReset={reset}
                            FallbackComponent={ErrorFallback}
                        >
                            <Suspense fallback={<p>요청 중...</p>}>
                                <DemoContent/>
                            </Suspense>
                        </ErrorBoundary>
                    )}
                </QueryErrorResetBoundary>
            </CardContent>
        </Card>
    );
};

export default DemoApiPage;