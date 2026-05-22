import type { InferSelectModel } from "drizzle-orm";
import type { catPersonality } from "../../../infra/db";
import { type AgeGroup as AgeGroupType } from "../constants/growth";

interface CarePromptParams {
  catName: string;
  mood: string;
  ageGroup: AgeGroupType;
  personality?: InferSelectModel<typeof catPersonality> | null;
  localDateTime?: string;
}

export function buildCarePrompt({
  catName,
  mood,
  ageGroup,
  personality,
  localDateTime,
}: CarePromptParams) {
  return {
    system: `Describe a cat's behavior/Lang: en-US/Pattern: "[Name] verb object [adverb/adjective phrase]."/1~2 sentences/Plain text only${personality ? "/Follow the big5 personality traits(10-scale)" : ""}`,
    prompt: `${catName}, mood:${mood}, age:${ageGroup}${personality ? `, O:${personality.openness} C:${personality.conscientiousness} E:${personality.extraversion} A:${personality.agreeableness} N:${personality.neuroticism}` : ""}${localDateTime ? `, datetime:${localDateTime}` : ""}"`,
  };
}
