import { useTranslation } from "react-i18next";
import DemoEditor from "@/components/editor/demo/DemoEditor.tsx";

const DemoEditorPage = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6 p-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("editorPage.title")}</h1>
                <p className="text-muted-foreground mt-2">{t("editorPage.description")}</p>
            </div>
            <DemoEditor/>
        </div>
    );
};

export default DemoEditorPage;
