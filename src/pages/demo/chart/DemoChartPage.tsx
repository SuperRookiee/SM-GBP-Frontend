import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import AreaChartCard from "@/components/chart/demo/AreaChartCard.tsx";
import BarChartCard from "@/components/chart/demo/BarChartCard.tsx";
import LineChartCard from "@/components/chart/demo/LineChartCard.tsx";
import PieChartCard from "@/components/chart/demo/PieChartCard.tsx";
import RadarChartCard from "@/components/chart/demo/RadarChartCard.tsx";
import RadialChartCard from "@/components/chart/demo/RadialChartCard.tsx";
import type { ChartConfig } from "@/components/ui/chart.tsx";

const DemoChartPage = () => {
    const { t } = useTranslation();

    const areaChartData = useMemo(() => [
        { month: t("chartPage.month.january"), desktop: 186 },
        { month: t("chartPage.month.february"), desktop: 305 },
        { month: t("chartPage.month.march"), desktop: 237 },
        { month: t("chartPage.month.april"), desktop: 73 },
        { month: t("chartPage.month.may"), desktop: 209 },
        { month: t("chartPage.month.june"), desktop: 214 },
    ], [t]);

    const barChartData = useMemo(() => [
        { month: t("chartPage.month.january"), desktop: 186, mobile: 80 },
        { month: t("chartPage.month.february"), desktop: 305, mobile: 200 },
        { month: t("chartPage.month.march"), desktop: 237, mobile: 120 },
        { month: t("chartPage.month.april"), desktop: 73, mobile: 190 },
        { month: t("chartPage.month.may"), desktop: 209, mobile: 130 },
        { month: t("chartPage.month.june"), desktop: 214, mobile: 140 },
    ], [t]);

    const lineChartData = barChartData;
    const radarChartData = barChartData;

    const pieChartData = [
        { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
        { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
        { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
        { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
        { browser: "other", visitors: 190, fill: "var(--color-other)" },
    ];

    const radialChartData = [
        {
            browser: "safari",
            visitors: 1260,
            visitor_rate: 75,
            fill: "var(--color-safari)",
        },
    ];

    const areaChartConfig = {
        desktop: {
            label: t("chartPage.desktop"),
            color: "var(--chart-1)",
        },
    } satisfies ChartConfig;

    const barChartConfig = {
        desktop: {
            label: t("chartPage.desktop"),
            color: "var(--chart-1)",
        },
        mobile: {
            label: t("chartPage.mobile"),
            color: "var(--chart-2)",
        },
    } satisfies ChartConfig;

    const lineChartConfig = barChartConfig;

    const pieChartConfig = {
        visitors: { label: t("chartPage.visitors") },
        chrome: { label: t("chartPage.browser.chrome"), color: "var(--chart-1)" },
        safari: { label: t("chartPage.browser.safari"), color: "var(--chart-2)" },
        firefox: { label: t("chartPage.browser.firefox"), color: "var(--chart-3)" },
        edge: { label: t("chartPage.browser.edge"), color: "var(--chart-4)" },
        other: { label: t("chartPage.browser.other"), color: "var(--chart-5)" },
    } satisfies ChartConfig;

    const radarChartConfig = barChartConfig;

    const radialChartConfig = {
        visitors: { label: t("chartPage.visitors") },
        safari: { label: t("chartPage.browser.safari"), color: "var(--chart-2)" },
    } satisfies ChartConfig;

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <p className="text-sm font-semibold text-muted-foreground">{t("menu.demo")}</p>
                <h1 className="text-2xl font-semibold tracking-tight">{t("menu.chart")}</h1>
                <p className="text-sm text-muted-foreground">{t("chartPage.description")}</p>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <AreaChartCard
                    title={t("chartPage.area.title")}
                    description={t("chartPage.periodJanJun")}
                    footerTitle={t("chartPage.trendingUp")}
                    footerSubtitle={t("chartPage.totalVisitors6Months")}
                    data={areaChartData}
                    config={areaChartConfig}
                    dataKey="desktop"
                />
                <BarChartCard
                    title={t("chartPage.bar.title")}
                    description={t("chartPage.periodJanJun")}
                    footerTitle={t("chartPage.trendingUp")}
                    footerSubtitle={t("chartPage.totalVisitors6Months")}
                    data={barChartData}
                    config={barChartConfig}
                    seriesKeys={["desktop", "mobile"]}
                />
                <LineChartCard
                    title={t("chartPage.line.title")}
                    description={t("chartPage.periodJanJun")}
                    footerTitle={t("chartPage.trendingUp")}
                    footerSubtitle={t("chartPage.totalVisitors6Months")}
                    data={lineChartData}
                    config={lineChartConfig}
                    seriesKeys={["desktop", "mobile"]}
                />
                <RadialChartCard
                    title={t("chartPage.radial.title")}
                    description={t("chartPage.periodJanJun")}
                    footerTitle={t("chartPage.trendingUp")}
                    footerSubtitle={t("chartPage.totalVisitors6Months")}
                    data={radialChartData}
                    config={radialChartConfig}
                    dataKey="visitors"
                    rateKey="visitor_rate"
                    centerLabel={t("chartPage.visitors")}
                />
                <RadarChartCard
                    title={t("chartPage.radar.title")}
                    description={t("chartPage.periodJanJun")}
                    footerTitle={t("chartPage.trendingUp")}
                    footerSubtitle={t("chartPage.totalVisitors6Months")}
                    data={radarChartData}
                    config={radarChartConfig}
                    seriesKeys={["desktop", "mobile"]}
                />
                <PieChartCard
                    title={t("chartPage.pie.title")}
                    description={t("chartPage.periodJanJun")}
                    footerTitle={t("chartPage.trendingUp")}
                    footerSubtitle={t("chartPage.totalVisitors6Months")}
                    data={pieChartData}
                    config={pieChartConfig}
                    dataKey="visitors"
                    nameKey="browser"
                    centerLabel={t("chartPage.visitors")}
                />
            </div>
        </div>
    );
};

export default DemoChartPage;

