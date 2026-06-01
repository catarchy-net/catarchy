import {
  ChronicleEventType,
} from "@catarchy/shared/constants/chronicle";

import { ChronicleRepository } from "./repository";

export abstract class ChronicleService {
  private static chronicleRepository = ChronicleRepository;

  static async getChronicles({
    cursor,
    limit,
    type,
  }: {
    cursor?: string;
    limit: number;
    type?: ChronicleEventType;
  }) {
    return this.chronicleRepository.findManyCursor({ cursor, limit, type });
  }

  static async recordAgeChangeEvent({
    catId,
    catName,
    age,
  }: {
    catId: string;
    catName: string;
    age: number;
  }) {
    await this.chronicleRepository.create({
      type: "AGE_UP",
      body: { type: "AGE_UP", catId, catName, age },
    });
  }

  static async recordFriendshipEvent({
    catId,
    catName,
    targetCatId,
    targetCatName,
  }: {
    catId: string;
    catName: string;
    targetCatId: string;
    targetCatName: string;
  }) {
    return await this.chronicleRepository.create({
      type: "FRIENDSHIP",
      body: { type: "FRIENDSHIP", catId, catName, targetCatId, targetCatName },
    });
  }

  static async recordLoveEvent({
    catId,
    catName,
    targetCatId,
    targetCatName,
  }: {
    catId: string;
    catName: string;
    targetCatId: string;
    targetCatName: string;
  }) {
    return await this.chronicleRepository.create({
      type: "LOVE",
      body: { type: "LOVE", catId, catName, targetCatId, targetCatName },
    });
  }
}
