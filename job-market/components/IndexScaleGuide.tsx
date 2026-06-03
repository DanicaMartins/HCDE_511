/** Index scale legend matching the left-rail mockup (symmetric pink/white/green gradient). */
export function IndexScaleGuide() {
  const ticks = [60, 80, 100, 120, 140];

  return (
    <div className="mt-4">
      <div className="relative">
        <p className="mb-2 text-center text-[11px] font-medium leading-snug text-foreground">
          Baseline (the normal of job postings)
        </p>

        <div className="relative flex h-3 w-full overflow-hidden rounded-sm" aria-hidden>
          <div
            className="h-full flex-1"
            style={{
              background: "linear-gradient(90deg, var(--dusty-rose) 0%, #ffffff 100%)",
            }}
          />
          <div
            className="h-full flex-1"
            style={{
              background: "linear-gradient(90deg, #ffffff 0%, var(--above-baseline) 100%)",
            }}
          />
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-foreground" />
        </div>
      </div>

      <div className="relative mt-1.5">
        <div className="flex justify-between">
          {ticks.map((t) => (
            <div key={t} className="flex flex-col items-center">
              <span
                className={`mb-0.5 block h-2 w-px ${t === 100 ? "bg-foreground" : "bg-border"}`}
                aria-hidden
              />
              <span
                className={`text-[11px] tabular-nums ${
                  t === 100 ? "font-semibold text-foreground" : "text-muted"
                }`}
              >
                {t}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex justify-between gap-2 text-[10px] leading-snug">
        <span className="max-w-[42%] text-left" style={{ color: "var(--dusty-rose)" }}>
          20% fewer job postings than Feb 2020
        </span>
        <span className="max-w-[42%] text-right" style={{ color: "var(--above-baseline)" }}>
          20% higher job postings than Feb 2020
        </span>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Feb 2020 is taken as the baseline — the most recent pre-COVID (normal) era for comparing
        posting volume over time.
      </p>
    </div>
  );
}
