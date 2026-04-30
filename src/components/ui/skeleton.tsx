import { cn } from "@/lib/utils";

// قطعة هيكل عظمي بسيطة قابلة للتركيب
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-saei-purple-100/70",
        className
      )}
      {...props}
    />
  );
}
