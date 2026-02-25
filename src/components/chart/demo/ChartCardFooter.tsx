import type { ReactNode } from "react";
import { TrendingUpIcon } from "lucide-react";
import { CardFooter } from "@/components/ui/card.tsx";

interface IChartCardFooterProps {
    title: ReactNode;
    subtitle: ReactNode;
    className?: string;
    contentClassName?: string;
    subtitleClassName?: string;
}

const ChartCardFooter = ({
    title,
    subtitle,
    className,
    contentClassName = "flex items-center gap-2 leading-none font-medium",
    subtitleClassName = "text-muted-foreground flex items-center gap-2 leading-none",
}: IChartCardFooterProps) => {
    return (
        <CardFooter className={className}>
            <div className={contentClassName}>
                {title} <TrendingUpIcon className="size-4" />
            </div>
            <div className={subtitleClassName}>{subtitle}</div>
        </CardFooter>
    );
};

export default ChartCardFooter;
