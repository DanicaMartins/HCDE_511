import { cn } from "@/lib/utils";

const CAT_CLASS: Record<string, string> = {
  "Knowledge Work": "bg-knowledge-bg text-knowledge border-knowledge-border",
  "Care & Service": "bg-care-bg text-care border-care-border",
  "Tech & Engineering": "bg-tech-bg text-tech border-tech-border",
};

export function CategoryPill({ category, className }: { category: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        CAT_CLASS[category] ?? "border-border bg-surface-muted text-muted",
        className
      )}
    >
      {category.split(" ")[0]}
    </span>
  );
}
