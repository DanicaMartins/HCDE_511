export function MethodologySection() {
  return (
    <section id="methodology" className="section-shell">
      <details className="card-editorial p-6 md:p-8">
        <summary className="cursor-pointer font-serif text-xl text-foreground md:text-2xl">
          How we measure (index &amp; data)
        </summary>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-secondary">
          <p>
            <strong className="text-foreground">Posting index:</strong> % of Feb 1, 2020 posting
            volume (100 = same day). Not raw job counts, employment, or wages.
          </p>
          <p>
            <strong className="text-foreground">Drawdown:</strong> Latest index minus that
            sector&rsquo;s peak month index.
          </p>
          <p>
            <strong className="text-foreground">Automation score:</strong> O*NET degree of
            automation matched via sector job titles.
          </p>
          <p>
            <strong className="text-foreground">AI releases:</strong> OpenAI/Anthropic publication
            months — context only, not causation.
          </p>
        </div>
      </details>
      <div className="mt-8 card-editorial border-l-4 border-l-rose p-6 md:p-8">
        <strong className="block text-foreground">What this does not show</strong>
        <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-muted">
          <li>Indeed does not publish raw posting counts here — only indexed change from Feb 2020.</li>
          <li>100 is a reference day, not a &ldquo;healthy&rdquo; labor market target.</li>
          <li>Correlation between AI releases and posting trends is not causation.</li>
          <li>National totals near 100 can hide sectors still far below their peaks.</li>
        </ul>
      </div>
    </section>
  );
}
