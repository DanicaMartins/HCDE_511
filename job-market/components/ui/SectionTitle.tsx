export function SectionTitle({
  number,
  title,
  note,
  compact = false,
}: {
  number?: string;
  title: string;
  note?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "mb-2" : "mb-6"}>
      <h2 className="font-serif font-normal text-foreground text-section-title">
        {number ? `${number}. ` : ""}
        {title}
      </h2>
      {note && (
        <p className={compact ? "mt-1 text-xs text-muted" : "mt-3 text-sm text-muted"}>
          ({note})
        </p>
      )}
    </div>
  );
}
