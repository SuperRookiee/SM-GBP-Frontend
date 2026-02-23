import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const DemoTypography = () => {
    const { t } = useTranslation();

    return (
        <div className="p-8 space-y-8">
            <Card className="p-8 space-y-6">
                <div>
                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">{t("typography.title")}</h1>
                    <p className="text-muted-foreground mt-2">{t("typography.description")}</p>
                </div>

                <Separator/>

                <div className="space-y-4">
                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">h1. {t("typography.heading")}</h1>
                    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">h2. {t("typography.heading")}</h2>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">h3. {t("typography.heading")}</h3>
                    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">h4. {t("typography.heading")}</h4>
                </div>

                <Separator/>

                <div className="space-y-4">
                    <p className="leading-7">{t("typography.paragraph1.prefix")} <span className="font-medium">{t("typography.leadingToken")}</span> {t("typography.paragraph1.suffix")}</p>
                    <p className="leading-7 text-muted-foreground">{t("typography.paragraph2")}</p>
                    <p className="text-lg text-muted-foreground">{t("typography.lead")}</p>
                </div>

                <Separator/>

                <div className="space-y-4">
                    <p>{t("typography.inlinePrefix")} <code className="bg-muted px-1.5 py-0.5 rounded text-sm">{t("typography.codeToken")}</code> {t("typography.inlineSuffix")}</p>
                    <blockquote className="mt-6 border-l-2 pl-6 italic">{t("typography.quote")}</blockquote>
                </div>

                <Separator/>

                <div className="space-y-4">
                    <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                        <li>{t("typography.bullet1")}</li>
                        <li>{t("typography.bullet2")}</li>
                        <li>{t("typography.bullet3")}</li>
                    </ul>

                    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
                        <li>{t("typography.ordered1")}</li>
                        <li>{t("typography.ordered2")}</li>
                        <li>{t("typography.ordered3")}</li>
                    </ol>
                </div>
            </Card>
        </div>
    );
};

export default DemoTypography;
