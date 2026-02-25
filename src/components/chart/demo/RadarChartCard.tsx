import type { ReactNode } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import ChartCardFooter from "@/components/chart/demo/ChartCardFooter.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart.tsx";

export type RadarChartDatum = {
  month: string;
  [key: string]: number | string;
};

interface IRadarChartCardProps {
  title: string;
  description: string;
  footerTitle: ReactNode;
  footerSubtitle: ReactNode;
  data: RadarChartDatum[];
  config: ChartConfig;
  seriesKeys: string[];
};

const RadarChartCard = ({
    title,
    description,
    footerTitle,
    footerSubtitle,
    data,
    config,
    seriesKeys,
}: IRadarChartCardProps) => {
    return (
        <Card className="w-full">
            <CardHeader className="items-center pb-4">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
                <ChartContainer config={config} className="mx-auto aspect-square max-h-62.5">
                    <RadarChart data={data}>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                        <PolarAngleAxis dataKey="month" />
                        <PolarGrid />
                        {seriesKeys.map((key) => (
                            <Radar
                                key={key}
                                dataKey={key}
                                fill={`var(--color-${key})`}
                                fillOpacity={key === seriesKeys[0] ? 0.6 : 1}
                            />
                        ))}
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            <ChartCardFooter
                title={footerTitle}
                subtitle={footerSubtitle}
                className="flex-col gap-2"
            />
        </Card>
    );
};

export default RadarChartCard;
