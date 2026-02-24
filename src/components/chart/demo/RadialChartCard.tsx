import type { ReactNode } from "react";
import { TrendingUpIcon } from "lucide-react";
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart.tsx";

export type RadialChartDatum = Record<string, number | string>;

interface IRadialChartCardProps {
    title: string;
    description: string;
    footerTitle: ReactNode;
    footerSubtitle: ReactNode;
    data: RadialChartDatum[];
    config: ChartConfig;
    dataKey: string;    // 중앙에 표시할 메인 데이터 키
    rateKey?: string;   // 호의 비율을 결정할 데이터 키
    centerLabel: string;
};

const RadialChartCard = (props: IRadialChartCardProps) => {
    const firstData = props.data[0] ?? {};
    const centerValue = Number(firstData[props.dataKey] ?? 0);

    /**
     * 비율(rate) 계산 로직:
     * 1. rateKey가 명시적으로 들어오면 해당 키의 값을 사용합니다.
     * 2. rateKey가 없으면 dataKey의 값을 그대로 비율로 사용합니다.
     */
    const currentRate = Number(firstData[props.rateKey ?? props.dataKey] ?? 0);

    // 12시 방향(90도)에서 시작하여 시계 방향으로 비율만큼 회전
    // 100%일 때 360도를 다 채우도록 계산
    const startAngle = 90;
    const endAngle = 90 - (Math.min(currentRate, 100) / 100) * 360;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{props.title}</CardTitle>
                <CardDescription>{props.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={props.config} className="mx-auto aspect-square max-h-45">
                    <RadialBarChart
                        data={props.data}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        innerRadius={70}
                        outerRadius={90}
                    >
                        <PolarGrid
                            gridType="circle"
                            radialLines={false}
                            stroke="none"
                            className="first:fill-muted last:fill-background"
                            polarRadius={[86, 74]}
                        />
                        <RadialBar
                            dataKey={props.dataKey}
                            background
                            cornerRadius={10}
                            activeShape={false}
                        />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
                                                    className="fill-foreground text-4xl font-bold"
                                                >
                                                    {centerValue.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    {props.centerLabel}
                                                </tspan>
                                            </text>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </PolarRadiusAxis>
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <div className="flex items-center gap-2 leading-none font-medium">
                    {props.footerTitle} <TrendingUpIcon className="size-4"/>
                </div>
                <div className="text-muted-foreground leading-none">{props.footerSubtitle}</div>
            </CardFooter>
        </Card>
    );
};

export default RadialChartCard;
