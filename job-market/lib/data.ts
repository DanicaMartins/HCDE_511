import type { StoryData } from "./types";

import aggregate from "../public/data/monthly_aggregate.json";
import sectors from "../public/data/monthly_by_sector.json";
import titles from "../public/data/sector_titles.json";
import crosswalk from "../public/data/automation_crosswalk.json";
import aiModels from "../public/data/ai_models.json";
import storyMeta from "../public/data/story_meta.json";

export const STORY_DATA: StoryData = {
  aggregate: aggregate as StoryData["aggregate"],
  sectors: sectors as StoryData["sectors"],
  titles: titles as Record<string, string>,
  crosswalk: crosswalk as StoryData["crosswalk"],
  ai_models: aiModels as StoryData["ai_models"],
  story_meta: storyMeta as StoryData["story_meta"],
};
