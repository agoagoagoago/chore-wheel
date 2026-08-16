export type ChoreCategory = "kitchen" | "bathroom" | "bedroom" | "living" | "laundry" | "outdoor" | "general" | "pets";

export type Frequency = "daily" | "weekly" | "monthly" | "occasional";
export type Effort = "quick" | "medium" | "long";
/** Youngest group a chore is usually suitable for, with adult judgement. */
export type AgeGroup = "younger" | "school" | "teen";

export type Chore = {
  id: string;
  name: string;
  category: ChoreCategory;
  frequency: Frequency;
  effort: Effort;
  /** Suitable for children (with the caveats shown on the kids page). */
  kidFriendly?: boolean;
  /** If kidFriendly, the youngest group it typically suits. */
  minAge?: AgeGroup;
  description?: string;
};

export type Template = {
  id: string;
  name: string;
  tagline: string;
  choreIds: string[];
  /** Optional note shown when the template is loaded (e.g. supervision caveat). */
  note?: string;
  group: "household" | "kids" | "rooms" | "situations";
};
