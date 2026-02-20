import type { ReactNode } from "react";
import { TrendingUpIcon } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart.tsx";

export type LineChartDatum = {
  month: string;
  [key: string]: number | string;
};

interface ILineChartCardProps {
  title: string;
  description: string;
  footerTitle: ReactNode;
  footerSubtitle: ReactNode;
  data: LineChartDatum[];
  config: ChartConfig;
  seriesKeys: string[];
};

const LineChartCard = ({
    title,
    description,
    footerTitle,
    footerSubtitle,
    data,
    config,
    seriesKeys,
}: ILineChartCardProps) => {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={config}>
                    <LineChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => String(value).slice(0, 3)}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        {seriesKeys.map((key) => (
                            <Line
                                key={key}
                                dataKey={key}
                                type="monotone"
                                stroke={`var(--color-${key})`}
                                strokeWidth={2}
                                dot={false}
                            />
                        ))}
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="grid gap-2">
                    <div className="flex items-center gap-2 leading-none font-medium">
                        {footerTitle} <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 leading-none">
                        {footerSubtitle}
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
};

export default LineChartCard;
