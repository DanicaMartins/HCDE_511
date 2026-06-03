export function Annotation({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-secondary">
      {children}
    </span>
  );
}
