import { AlertTriangle } from "lucide-react"
import type { FallbackProps } from "react-error-boundary"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

/**
 * Runtime Error
 */
const RuntimeError = ({ error, resetErrorBoundary }: FallbackProps) => {
    const navigate = useNavigate()
    const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."

    return (
        <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center text-center translate-y-32 gap-6">

                <div className="flex flex-col items-center gap-3">
                    <AlertTriangle className="size-10 text-destructive"/>

                    <h1 className="text-3xl font-semibold tracking-tight">
                        문제가 발생했습니다
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        예상치 못한 오류가 발생했습니다.
                    </p>

                    <p className="text-xs text-muted-foreground break-all max-w-md">
                        {message ?? "잠시 후 다시 시도해주세요."}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            resetErrorBoundary()
                        }}
                    >
                        다시 시도
                    </Button>

                    <Button onClick={() => navigate("/")}>
                        홈으로
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default RuntimeError;