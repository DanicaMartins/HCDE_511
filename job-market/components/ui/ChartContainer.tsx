import { cn } from "@/lib/utils";

export function ChartContainer({
  children,
  title,
  footnote,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  footnote?: string;
  className?: string;
}) {
  return (
    <div className={cn("card-editorial overflow-hidden", className)}>
      {title && (
        <h4 className="border-b border-border-subtle px-6 py-4 font-serif text-xl font-normal text-foreground">
          {title}
        </h4>
      )}
      <div className="px-4 py-5 md:px-6 md:py-6">{children}</div>
      {footnote && (
        <p className="border-t border-border-subtle px-6 py-3 text-sm italic text-muted">
          {footnote}
        </p>
      )}
    </div>
  );
}
