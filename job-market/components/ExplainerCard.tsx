export function ExplainerCard() {
  return (
    <aside className="card-editorial sticky top-[calc(var(--nav-height)+1rem)] p-6 md:p-8">
      <h3 className="font-serif text-2xl font-normal text-foreground">How to read the Index</h3>
      <div
        className="mt-5 h-3 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, var(--dusty-rose) 0%, var(--border) 45%, var(--above-baseline) 100%)",
        }}
        aria-hidden
      />
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>60</span>
        <span>80</span>
        <span>100</span>
        <span>120</span>
        <span>160</span>
      </div>
      <div className="mt-6 space-y-3 text-sm leading-relaxed text-secondary">
        <p>
          <strong className="text-foreground">100</strong> = same posting volume as Feb 2020
        </p>
        <p>
          <strong className="text-foreground">160</strong> = 60% more postings than Feb 2020
        </p>
        <p>
          <strong className="text-foreground">72</strong> = 28% fewer postings than Feb 2020
        </p>
        <p className="pt-2">The index shows change over time, not raw job counts.</p>
        <p>We use an index so different sectors can be compared on the same scale.</p>
        <p className="text-xs text-muted">100 is not good or bad — only the Feb 2020 reference.</p>
      </div>
    </aside>
  );
}
