import { cn } from "@/lib/utils";

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground transition-colors",
        "placeholder:text-muted focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/20",
        className
      )}
    />
  );
}
