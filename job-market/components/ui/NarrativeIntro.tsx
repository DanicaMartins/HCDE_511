export function NarrativeIntro({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-10 max-w-2xl text-base leading-relaxed text-secondary md:text-lg">
      {children}
    </p>
  );
}
