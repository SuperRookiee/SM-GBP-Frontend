import { useTranslation } from "react-i18next";

const PageLayout = () => {
    const { t } = useTranslation();

    return (
        <div>
            <section>{t("layout.page.title")}</section>
            <section>{t("layout.page.main")}</section>
            <section>{t("layout.page.footer")}</section>
        </div>
    );
};

export default PageLayout;
