import type { HTMLAttributes } from "react";
import { cn } from "@/utils/utils";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div
    className={cn("animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800", className)}
    {...props}
  />
);

export { Skeleton };
