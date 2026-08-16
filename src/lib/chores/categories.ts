import type { ChoreCategory, Effort, Frequency, AgeGroup } from "./types";

export const CATEGORIES: { id: ChoreCategory; label: string; blurb: string }[] = [
  { id: "kitchen", label: "Kitchen", blurb: "Daily dishes and surfaces plus the deeper jobs that keep the kitchen hygienic." },
  { id: "bathroom", label: "Bathroom", blurb: "Small room, high traffic. Short frequent cleans beat rare marathons." },
  { id: "bedroom", label: "Bedroom", blurb: "Bedding, floors and clutter — mostly weekly, mostly quick." },
  { id: "living", label: "Living areas", blurb: "Shared spaces everyone uses and nobody feels responsible for." },
  { id: "laundry", label: "Laundry", blurb: "Split the cycle: wash, dry, fold, put away — each is a separate chore." },
  { id: "outdoor", label: "Outdoor", blurb: "Yard, bins, entryway and car. Seasonal and weather dependent." },
  { id: "general", label: "Whole home", blurb: "Floors, dusting, trash and the errands that touch every room." },
  { id: "pets", label: "Pets", blurb: "Feeding and cleaning up after animals. Good rotation candidates." },
];

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  occasional: "Occasional",
};

export const EFFORT_LABEL: Record<Effort, string> = {
  quick: "Quick (≈5–10 min)",
  medium: "Medium (≈15–30 min)",
  long: "Long (30+ min)",
};

export const AGE_LABEL: Record<AgeGroup, string> = {
  younger: "Younger kids",
  school: "School-age kids",
  teen: "Teens",
};

export const categoryLabel = (id: ChoreCategory) => CATEGORIES.find((c) => c.id === id)?.label ?? id;
