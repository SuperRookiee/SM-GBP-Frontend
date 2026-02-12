import { type ReactNode, useMemo } from "react";
import { TrendingUpIcon } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart.tsx";

export type PieChartDatum = Record<string, number | string>;

export type PieChartCardProps = {
  title: string;
  description: string;
  footerTitle: ReactNode;
  footerSubtitle: ReactNode;
  data: PieChartDatum[];
  config: ChartConfig;
  dataKey: string;
  nameKey: string;
  centerLabel: string;
};

const PieChartCard = ({
    title,
    description,
    footerTitle,
    footerSubtitle,
    data,
    config,
    dataKey,
    nameKey,
    centerLabel,
}: PieChartCardProps) => {
    const totalValue = useMemo(() => {
        return data.reduce((acc, curr) => acc + Number(curr[dataKey] ?? 0), 0);
    }, [data, dataKey]);

    return (
        <Card className="w-full">
            <CardHeader className="items-center pb-0">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={data}
                            dataKey={dataKey}
                            nameKey={nameKey}
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {totalValue.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    {centerLabel}
                                                </tspan>
                                            </text>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <div className="flex items-center gap-2 leading-none font-medium">
                    {footerTitle} <TrendingUpIcon className="size-4" />
                </div>
                <div className="text-muted-foreground leading-none">{footerSubtitle}</div>
            </CardFooter>
        </Card>
    );
};

export default PieChartCard;
