import { CircleSlash } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

/**
 * 404 Not Found
 */
const NotFound = () => {
    const navigate = useNavigate()

    return (
        <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center text-center translate-y-32 gap-6">
                <div className="flex flex-col items-center gap-3">
                    <CircleSlash className="size-10 text-muted-foreground" />

                    <h1 className="text-3xl font-semibold tracking-tight">404</h1>

                    <p className="text-sm text-muted-foreground">
                        페이지를 찾을 수 없습니다
                    </p>

                    <p className="text-xs text-muted-foreground">
                        요청하신 주소가 변경되었거나 삭제되었을 수 있습니다.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        이전 페이지
                    </Button>
                    <Button onClick={() => navigate("/")}>
                        홈으로
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default NotFound
