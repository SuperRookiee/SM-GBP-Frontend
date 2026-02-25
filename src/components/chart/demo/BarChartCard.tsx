import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import ChartCardFooter from "@/components/chart/demo/ChartCardFooter.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart.tsx";

export type BarChartDatum = {
    month: string;
    [key: string]: number | string;
};

interface IBarChartCardProps {
    title: string;
    description: string;
    footerTitle: ReactNode;
    footerSubtitle: ReactNode;
    data: BarChartDatum[];
    config: ChartConfig;
    seriesKeys: string[];
};

const BarChartCard = ({
    title,
    description,
    footerTitle,
    footerSubtitle,
    data,
    config,
    seriesKeys,
}: IBarChartCardProps) => {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={config}>
                    <BarChart accessibilityLayer data={data}>
                        <CartesianGrid vertical={false}/>
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => String(value).slice(0, 3)}
                        />
                        <ChartTooltip cursor={false} content={
                            <ChartTooltipContent
                                indicator="dashed"
                                accessibilityLayer={false}
                                active={false} payload={[]}
                                coordinate={undefined} activeIndex={undefined}/>
                        }/>
                        {seriesKeys.map((key) => (
                            <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={4}/>
                        ))}
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <ChartCardFooter
                title={footerTitle}
                subtitle={footerSubtitle}
                className="flex-col items-start gap-2"
                contentClassName="flex gap-2 leading-none font-medium"
                subtitleClassName="text-muted-foreground leading-none"
            />
        </Card>
    );
};

export default BarChartCard;
