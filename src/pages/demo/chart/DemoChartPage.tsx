import AreaChartCard from "@/components/chart/demo/AreaChartCard.tsx";
import BarChartCard from "@/components/chart/demo/BarChartCard.tsx";
import LineChartCard from "@/components/chart/demo/LineChartCard.tsx";
import PieChartCard from "@/components/chart/demo/PieChartCard.tsx";
import RadarChartCard from "@/components/chart/demo/RadarChartCard.tsx";
import RadialChartCard from "@/components/chart/demo/RadialChartCard.tsx";
import {
    areaChartConfig,
    areaChartData,
    barChartConfig,
    barChartData,
    lineChartConfig,
    lineChartData,
    pieChartConfig,
    pieChartData,
    radarChartConfig,
    radarChartData,
    radialChartConfig,
    radialChartData,
} from "@/constants/demoChart.constants";

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
                    rateKey="visitor_rate"
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
