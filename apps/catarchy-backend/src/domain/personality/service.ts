import { PersonalityQuestionKeyed } from "../../infra/db/schema";
import { ForbiddenError } from "../../lib/error";
import { CatRepository } from "../cat/repository";
import { PersonalityRepository } from "./repository";

export abstract class PersonalityService {
  private static personalityRepository = PersonalityRepository;
  private static catRepository = CatRepository;

  static async getCatPersonality({
    userId,
    catId,
  }: {
    userId: string;
    catId: string;
  }) {
    const cat = await this.catRepository.findByServantId({
      servantId: userId,
      catId,
    });

    if (!cat) {
      throw new ForbiddenError(
        "Can't get personality for a cat that doesn't belong to you",
      );
    }

    return this.personalityRepository.getCatPersonality({ catId });
  }

  static async getProgress({
    userId,
    catId,
  }: {
    userId: string;
    catId: string;
  }) {
    const cat = await this.catRepository.findByServantId({
      servantId: userId,
      catId,
    });

    if (!cat) {
      throw new ForbiddenError(
        "Can't get personality progress for a cat that doesn't belong to you",
      );
    }

    const [totalCount, remainingCount] = await Promise.all([
      this.personalityRepository.getQuestionCount(),
      this.personalityRepository.getRemainingQuestionCount({
        catId,
      }),
    ]);

    return {
      totalCount,
      remainingCount,
    };
  }

  static async getOneRandomQuestion({
    userId,
    catId,
  }: {
    userId: string;
    catId: string;
  }) {
    const cat = await this.catRepository.findByServantId({
      servantId: userId,
      catId,
    });

    if (!cat) {
      throw new ForbiddenError(
        "Can't get question for a cat that doesn't belong to you",
      );
    }

    return this.personalityRepository.getOneRandomQuestion({
      catId,
    });
  }

  static async submitAnswer({
    userId,
    catId,
    questionId,
    answer,
  }: {
    userId: string;
    catId: string;
    questionId: string;
    answer: number;
  }) {
    const cat = await this.catRepository.findByServantId({
      servantId: userId,
      catId,
    });

    if (!cat) {
      throw new ForbiddenError(
        "Can't submit answer for a cat that doesn't belong to you",
      );
    }

    await this.personalityRepository.saveAnswer({
      catId,
      answer,
      questionId,
    });

    const remainingCount =
      await this.personalityRepository.getRemainingQuestionCount({
        catId,
      });

    if (remainingCount > 0) {
      return {
        isCompleted: false,
      };
    }

    const results = await this.personalityRepository.getAllResult({ catId });
    const scores = this.calculatePersonality(results);

    await this.personalityRepository.createCatPersonality({
      catId,
      ...scores,
    });

    return {
      isCompleted: true,
    };
  }

  private static calculatePersonality(
    results: { keyed: string; domain: string; answer: number }[],
  ) {
    const rawSums = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0,
    };
    const counts = { ...rawSums };

    for (const { keyed, domain, answer } of results) {
      const value =
        keyed === PersonalityQuestionKeyed.MINUS ? 6 - answer : answer;
      rawSums[domain as keyof typeof rawSums] += value;
      counts[domain as keyof typeof counts]++;
    }

    const normalized = {} as typeof rawSums;
    for (const domain of Object.keys(rawSums) as (keyof typeof rawSums)[]) {
      const n = counts[domain];
      const avg = n === 0 ? 1 : rawSums[domain] / n; // average keyed score, range [1, 5]
      normalized[domain] = Math.round((avg - 1) * 2.5); // scale to [0, 10]
    }

    return normalized;
  }
}
