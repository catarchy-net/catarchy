import { InferSelectModel } from "drizzle-orm";

import { ai } from "../../infra/ai";
import { table } from "../../infra/db";
import { CareRecordRepository } from "./care-record.repository";
import { getEmotion } from "./constants/emotion";
import { getAgeGroup } from "./constants/growth";

function getTimePeriod(): string {
  const hour = new Date().getUTCHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

export abstract class CareReportHandler {
  private static careRecordRepository = CareRecordRepository;

  static async handleCareReport({
    catRecordId,
    cat,
    catStat,
  }: {
    catRecordId: string;
    cat: InferSelectModel<typeof table.cat>;
    catStat: InferSelectModel<typeof table.catStat>;
  }) {
    let message = "";

    const mood = getEmotion(catStat.emotion).level;
    const ageGroup = getAgeGroup(catStat.growth);
    const timePeriod = getTimePeriod();

    try {
      const { text } = await ai.ask(
        // "anthropic/claude-haiku-4-5",
        // "xai/grok-4-fast-non-reasoning",
        // "xai/grok-4.3",
        "openai/gpt-4.1-nano",
        {
          maxOutputTokens: 50,
          temperature: 0.8,
          system: `Describe a cat's behavior/Lang: en-US/Pattern: "[Name(no-capitalize)] verb object [adverb/adjective phrase]."/1~2 sentences/Plain text only/Reflect time of day in behavior`,
          prompt: `${cat.name}, mood:${mood}, age:${ageGroup}, time:${timePeriod}`,
        },
      );

      message = text.trim();
    } catch (error) {
      console.error("Error generating care message:", error);
      message = `${cat.name} enjoyed the care and purrs contentedly.`;
    }

    await this.careRecordRepository.updateCareMessage({
      id: catRecordId,
      message,
    });
  }
}
