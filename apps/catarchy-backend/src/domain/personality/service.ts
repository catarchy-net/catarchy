import { PersonalityQuestionKeyed } from "../../infra/db/schema";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../lib/error";
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
      this.personalityRepository.getRemainingQuestionCount({ catId }),
    ]);

    return { totalCount, remainingCount };
  }

  static async getNextQuestion({
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

    return this.personalityRepository.getNextQuestion({ catId });
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

    const [question, totalCount] = await Promise.all([
      this.personalityRepository.getQuestion({ questionId }),
      this.personalityRepository.getQuestionCount(),
    ]);

    if (!question) {
      throw new NotFoundError("Question not found");
    }

    await this.personalityRepository.initCatPersonality({ catId, totalCount });

    const progress = await this.personalityRepository.getCatPersonalityProgress({ catId });
    if (!progress) throw new Error("Failed to initialize personality record");

    if (progress.remainingCount <= 0) {
      throw new ForbiddenError("Personality test is already completed");
    }

    const nextQuestion = await this.personalityRepository.getNextQuestion({ catId });
    if (!nextQuestion || nextQuestion.id !== questionId) {
      throw new BadRequestError("Submitted question does not match the next expected question");
    }

    const delta =
      question.keyed === PersonalityQuestionKeyed.MINUS ? 6 - answer : answer;

    const updated = {
      openness: progress.openness,
      conscientiousness: progress.conscientiousness,
      extraversion: progress.extraversion,
      agreeableness: progress.agreeableness,
      neuroticism: progress.neuroticism,
      remainingCount: progress.remainingCount - 1,
    };
    updated[question.domain as keyof typeof updated] += delta;

    const isCompleted = updated.remainingCount === 0;

    if (isCompleted) {
      const normalized = this.normalizeScores(updated, totalCount);
      await this.personalityRepository.updateCatPersonality({
        catId,
        ...normalized,
        remainingCount: 0,
      });
    } else {
      await this.personalityRepository.updateCatPersonality({ catId, ...updated });
    }

    return { isCompleted };
  }

  private static normalizeScores(
    rawSums: Record<string, number>,
    totalCount: number,
  ) {
    const questionsPerDomain = totalCount / 5;
    const toScale = (raw: number) =>
      Math.round(((raw / questionsPerDomain) - 1) * 2.5);

    return {
      openness: toScale(rawSums.openness),
      conscientiousness: toScale(rawSums.conscientiousness),
      extraversion: toScale(rawSums.extraversion),
      agreeableness: toScale(rawSums.agreeableness),
      neuroticism: toScale(rawSums.neuroticism),
    };
  }
}
