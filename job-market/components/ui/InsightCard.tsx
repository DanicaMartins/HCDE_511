import { cn } from "@/lib/utils";

export function InsightCard({
  title,
  children,
  className,
  compact,
  ...rest
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={cn("card-editorial", compact ? "p-5" : "p-6 md:p-8", className)}
      {...rest}
    >
      {title && (
        <h3 className="font-serif text-lg font-normal text-foreground md:text-xl">{title}</h3>
      )}
      <div className={cn(title && "mt-3", "text-sm leading-relaxed text-secondary")}>
        {children}
      </div>
    </aside>
  );
}
