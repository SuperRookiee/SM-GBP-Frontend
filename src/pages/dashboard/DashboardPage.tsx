import { useTranslation } from "react-i18next";

const DashboardPage = () => {
    const { t } = useTranslation();

    return (
        <section className="h-full flex items-center justify-center">
            <div className="space-y-2 text-center translate-y-40">
                <p className="text-sm font-semibold text-muted-foreground">Miracle Web</p>
                <h1 className="text-3xl font-semibold tracking-tight">Miracle</h1>
                <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
            </div>
        </section>
    );
};

export default DashboardPage;
