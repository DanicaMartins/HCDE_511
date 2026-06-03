export function CompareLegend({
  primaryLabel,
  compareLabel,
  primaryColor = "#4A7A5A",
  compareColor = "#9B8BB8",
  compareItems,
}: {
  primaryLabel: string;
  compareLabel?: string;
  primaryColor?: string;
  compareColor?: string;
  compareItems?: Array<{ label: string; color: string; dash?: string }>;
}) {
  if (compareItems && compareItems.length > 1) {
    return (
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted">
        <span className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-6" style={{ backgroundColor: primaryColor }} />
          {primaryLabel}
        </span>
        {compareItems.map((item) => (
          <span key={item.label} className="flex items-center gap-2">
            <span
              className="inline-block w-6 border-t-2"
              style={{
                borderColor: item.color,
                borderStyle: item.dash === "dot" ? "dotted" : "dashed",
              }}
            />
            {item.label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap gap-5 text-[11px] text-muted transition-opacity duration-200">
      <span className="flex items-center gap-2">
        <span className="inline-block h-0.5 w-6" style={{ backgroundColor: primaryColor }} />
        {primaryLabel}
      </span>
      {compareLabel && (
        <span className="flex items-center gap-2">
          <span
            className="inline-block w-6 border-t-2 border-dotted"
            style={{ borderColor: compareColor }}
          />
          {compareLabel}
        </span>
      )}
    </div>
  );
}
