import {useTranslation} from "react-i18next";

const DashboardPage = () => {
    const {t} = useTranslation();

    return (
        <section className="h-full p-4 md:p-6">
            <div className="space-y-10">
                <div className="space-y-4">
                    <h2 className="border-l-2 border-muted-foreground/30 pl-3 text-3xl font-semibold text-foreground/80">
                        {t("dashboard.sections.store.title")}
                    </h2>
                    <div className="flex h-44 items-center justify-center bg-muted text-2xl font-semibold text-foreground/60 md:h-56">
                        {t("dashboard.sections.store.placeholder")}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="border-l-2 border-muted-foreground/30 pl-3 text-3xl font-semibold text-foreground/80">
                        {t("dashboard.sections.google.title")}
                    </h2>
                    <div className="flex h-44 items-center justify-center bg-muted text-2xl font-semibold text-foreground/60 md:h-56">
                        {t("dashboard.sections.google.placeholder")}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="border-l-2 border-muted-foreground/30 pl-3 text-3xl font-semibold text-foreground/80">
                        {t("dashboard.sections.review.title")}
                    </h2>
                    <div className="flex h-44 items-center justify-center bg-muted text-2xl font-semibold text-foreground/60 md:h-56">
                        {t("dashboard.sections.review.placeholder")}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DashboardPage;
