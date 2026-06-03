export function StoryNav() {
  return (
    <nav className="sticky top-0 z-30 -mx-6 flex h-nav animate-fade-in items-center justify-between border-b border-border/50 bg-background/70 px-6 backdrop-blur-md backdrop-saturate-150 md:-mx-8 md:px-8">
      <a
        href="#hero"
        className="font-serif text-lg text-foreground no-underline transition-colors hover:text-secondary"
      >
        AI and the Job Market
      </a>
      <a
        href="#datasets-used"
        className="font-sans text-sm text-muted no-underline transition-colors hover:text-foreground"
      >
        Datasets used
      </a>
    </nav>
  );
}
