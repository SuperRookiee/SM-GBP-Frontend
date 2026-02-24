import { CircleSlash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center text-center translate-y-32 gap-6">
                <div className="flex flex-col items-center gap-3">
                    <CircleSlash className="size-10 text-muted-foreground" />
                    <h1 className="text-3xl font-semibold tracking-tight">{t("notFound.title")}</h1>
                    <p className="text-xs text-muted-foreground">{t("notFound.description")}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(-1)}>{t("notFound.back")}</Button>
                    <Button onClick={() => navigate("/")}>{t("common.home")}</Button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
