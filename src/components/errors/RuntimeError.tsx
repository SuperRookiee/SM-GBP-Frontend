import { AlertTriangle } from "lucide-react";
import type { FallbackProps } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RuntimeError = ({ error, resetErrorBoundary }: FallbackProps) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const message = error instanceof Error ? error.message : t("runtimeError.fallback");

    return (
        <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center text-center translate-y-32 gap-6">
                <div className="flex flex-col items-center gap-3">
                    <AlertTriangle className="size-10 text-destructive"/>
                    <h1 className="text-3xl font-semibold tracking-tight">{t("runtimeError.title")}</h1>
                    <p className="text-sm text-muted-foreground">{t("runtimeError.description")}</p>
                    <p className="text-xs text-muted-foreground break-all max-w-md">{message}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => resetErrorBoundary()}>{t("common.retry")}</Button>
                    <Button onClick={() => navigate("/")}>{t("common.home")}</Button>
                </div>
            </div>
        </div>
    );
};

export default RuntimeError;
