"use client";

import { IndexScaleGuide } from "./IndexScaleGuide";
import { CHART_COLORS } from "@/lib/chart-theme";
import type { NationalInsightId } from "@/lib/national-insight-highlight";
import { getAiReleaseInsights, getNationalInsights } from "@/lib/national-insights";
import { useStory } from "@/lib/story-context";
import { cn } from "@/lib/utils";

const INSIGHT_ACTIVE_STYLES: Record<NationalInsightId, string> = {
  peak: "border-l-[3px] border-l-above-baseline bg-[#EFF5F2]/80",
  current: "border-l-[3px] border-l-soft-blue bg-[#E8EEF5]/80",
  covid: "border-l-[3px] border-l-[#E8A0A8] bg-[#F5EBE8]/80",
};

export function NationalSidebar({
  activeInsight,
  onInsightSelect,
}: {
  activeInsight: NationalInsightId | null;
  onInsightSelect: (id: NationalInsightId) => void;
}) {
  const { data } = useStory();
  const national = getNationalInsights(data);
  const ai = getAiReleaseInsights(data);

  const insights: { id: NationalInsightId; label: string }[] = [
    {
      id: "peak",
      label: `${national.peakMonthLabel} was the highest month for US job posting (${national.peakIndex} peak index)`,
    },
    {
      id: "current",
      label: `The current index is ${national.currentIndex} still ${national.pctBelowPeak}% below the peak`,
    },
    {
      id: "covid",
      label: `During COVID the job postings dropped by ${national.covidDropPoints} points vs the Feb 2020 baseline`,
    },
  ];

  return (
    <aside className="national-rail">
      <section className="national-rail-section">
        <h3 className="font-serif text-xl font-normal leading-tight text-foreground">
          How to read the Index
        </h3>
        <IndexScaleGuide />
      </section>

      <section className="national-rail-section">
        <h3 className="font-serif text-xl font-normal leading-tight text-foreground">Key Insights</h3>
        <ol className="mt-3 list-none space-y-2 p-0">
          {insights.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onInsightSelect(item.id)}
                aria-pressed={activeInsight === item.id}
                className={cn(
                  "w-full cursor-pointer rounded-r-md py-2 pl-4 pr-2 text-left text-sm leading-relaxed text-secondary transition-colors",
                  "hover:bg-surface-muted",
                  activeInsight === item.id
                    ? INSIGHT_ACTIVE_STYLES[item.id]
                    : "border-l-[3px] border-l-transparent"
                )}
              >
                <span className="mr-1.5 font-medium text-muted">{i + 1}.</span>
                {item.label}
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section className="national-rail-section flex-1">
        <h3 className="font-serif text-xl font-normal leading-tight text-foreground">
          No. of AI Model Releases per month
        </h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-secondary">
          <li>
            Peak month: {ai.peakMonthLabel} ({ai.peakTotal} releases)
          </li>
          <li>
            AI acceleration era: {ai.accelerationStartLabel} to {ai.accelerationEndLabel}
          </li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-5 text-xs text-secondary">
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: CHART_COLORS.anthropic }}
            />
            Anthropic
          </span>
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: CHART_COLORS.openai }}
            />
            OpenAI
          </span>
        </div>
      </section>
    </aside>
  );
}
