"use client";

import { useEffect } from "react";
import { validateStoryData } from "@/lib/validate-story-data";

export function StoryDataGuard() {
  useEffect(() => {
    const { ok, warnings } = validateStoryData();
    if (!ok) {
      console.warn("[StoryDataGuard]", warnings.join("; "));
    }
  }, []);
  return null;
}
