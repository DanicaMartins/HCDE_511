export type NationalInsightId = "peak" | "current" | "covid";

export const INSIGHT_MARKER_COLORS: Record<NationalInsightId, string> = {
  peak: "#4A7A5A",
  current: "#5B8DBF",
  covid: "#E8A0A8",
};
