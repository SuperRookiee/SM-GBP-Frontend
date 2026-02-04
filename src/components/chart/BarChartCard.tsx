import type { ReactNode } from "react";
import { TrendingUpIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export type BarChartDatum = {
  month: string;
  [key: string]: number | string;
};

export type BarChartCardProps = {
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
}: BarChartCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => String(value).slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            {seriesKeys.map((key) => (
              <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={4} />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        <div className="flex gap-2 leading-none font-medium">
          {footerTitle} <TrendingUpIcon className="size-4" />
        </div>
        <div className="text-muted-foreground leading-none">{footerSubtitle}</div>
      </CardFooter>
    </Card>
  );
};

export default BarChartCard;
