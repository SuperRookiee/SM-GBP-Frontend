import AreaChartCard from "@/components/chart/AreaChartCard";
import BarChartCard from "@/components/chart/BarChartCard";
import LineChartCard from "@/components/chart/LineChartCard";
import PieChartCard from "@/components/chart/PieChartCard";
import RadarChartCard from "@/components/chart/RadarChartCard";
import RadialChartCard from "@/components/chart/RadialChartCard";
import { type ChartConfig } from "@/components/ui/chart";

const DemoChartPage = () => {
    return (
        <div className="p-6 space-y-6">
            <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                    Demo
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">Charts</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Recharts + shadcn/ui Chart examples
                </p>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <AreaChartCard
                    title="Area Chart"
                    description="Showing total visitors for the last 6 months"
                    footerTitle="Trending up by 5.2% this month"
                    footerSubtitle="January - June 2024"
                    data={areaChartData}
                    config={areaChartConfig}
                    dataKey="desktop"
                />
                <BarChartCard
                    title="Bar Chart - Multiple"
                    description="January - June 2024"
                    footerTitle="Trending up by 5.2% this month"
                    footerSubtitle="Showing total visitors for the last 6 months"
                    data={barChartData}
                    config={barChartConfig}
                    seriesKeys={["desktop", "mobile"]}
                />
                <LineChartCard
                    title="Line Chart - Multiple"
                    description="January - June 2024"
                    footerTitle="Trending up by 5.2% this month"
                    footerSubtitle="Showing total visitors for the last 6 months"
                    data={lineChartData}
                    config={lineChartConfig}
                    seriesKeys={["desktop", "mobile"]}
                />
                <RadialChartCard
                    title="Radial Chart - Shape"
                    description="January - June 2024"
                    footerTitle="Trending up by 5.2% this month"
                    footerSubtitle="Showing total visitors for the last 6 months"
                    data={radialChartData}
                    config={radialChartConfig}
                    dataKey="visitors"
                    centerLabel="Visitors"
                />
                <RadarChartCard
                    title="Radar Chart - Multiple"
                    description="Showing total visitors for the last 6 months"
                    footerTitle="Trending up by 5.2% this month"
                    footerSubtitle="January - June 2024"
                    data={radarChartData}
                    config={radarChartConfig}
                    seriesKeys={["desktop", "mobile"]}
                />
                <PieChartCard
                    title="Pie Chart - Donut with Text"
                    description="January - June 2024"
                    footerTitle="Trending up by 5.2% this month"
                    footerSubtitle="Showing total visitors for the last 6 months"
                    data={pieChartData}
                    config={pieChartConfig}
                    dataKey="visitors"
                    nameKey="browser"
                    centerLabel="Visitors"
                />
            </div>
        </div>
    );
};

export default DemoChartPage;

const areaChartData = [
    { month: "January", desktop: 186 },
    { month: "February", desktop: 305 },
    { month: "March", desktop: 237 },
    { month: "April", desktop: 73 },
    { month: "May", desktop: 209 },
    { month: "June", desktop: 214 },
];

const areaChartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

const barChartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
];

const barChartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--chart-1)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

const lineChartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
];

const lineChartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--chart-1)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

const pieChartData = [
    { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
    { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
    { browser: "firefox", visitors: 287, fill: "var(--color-firefox)" },
    { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
    { browser: "other", visitors: 190, fill: "var(--color-other)" },
];

const pieChartConfig = {
    visitors: { label: "Visitors" },
    chrome: { label: "Chrome", color: "var(--chart-1)" },
    safari: { label: "Safari", color: "var(--chart-2)" },
    firefox: { label: "Firefox", color: "var(--chart-3)" },
    edge: { label: "Edge", color: "var(--chart-4)" },
    other: { label: "Other", color: "var(--chart-5)" },
} satisfies ChartConfig;

const radarChartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
];

const radarChartConfig = {
    desktop: { label: "Desktop", color: "var(--chart-1)" },
    mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig;

const radialChartData = [{ browser: "safari", visitors: 1260, fill: "var(--color-safari)" }];

const radialChartConfig = {
    visitors: { label: "Visitors" },
    safari: { label: "Safari", color: "var(--chart-2)" },
} satisfies ChartConfig;
