export const ChronicleEventType = {
  AGE_UP: "AGE_UP",
  FRIENDSHIP: "FRIENDSHIP",
  LOVE: "LOVE",
} as const;

export type ChronicleEventType =
  (typeof ChronicleEventType)[keyof typeof ChronicleEventType];

export type ChronicleEvent =
  | { type: "AGE_UP"; catId: string; catName: string; age: number }
  | {
      type: "FRIENDSHIP";
      catId: string;
      catName: string;
      targetCatId: string;
      targetCatName: string;
    }
  | {
      type: "LOVE";
      catId: string;
      catName: string;
      targetCatId: string;
      targetCatName: string;
    };
