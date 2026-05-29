import { CatRelationshipType } from "../../infra/db";
import { sendPushNotification } from "../../infra/fcm";
import {
  ForbiddenError,
  NotFoundError,
  PreconditionFailedError,
} from "../../lib/error";
import type { CursorQuery } from "../../lib/pagination";
import { CareRecordRepository } from "../cat/care-record.repository";
import { getEmotion } from "../cat/lib/emotion";
import { getAge, getAgeGroup } from "../cat/lib/growth";
import { CatRepository } from "../cat/repository";
import { ConsensusRepository } from "../consensus/repository";
import { NotificationRepository } from "../notification/repository";
import { PersonalityRepository } from "../personality/repository";
import { CatPersonalityVector } from "./lib/personality-vector";
import { RelationshipRepository } from "./repository";

type PersonalityRow = Awaited<
  ReturnType<typeof RelationshipRepository.findFriendCandidates>
>[number];

export abstract class RelationshipService {
  private static catRepository = CatRepository;
  private static careRecordRepository = CareRecordRepository;
  private static personalityRepository = PersonalityRepository;
  private static relationshipRepository = RelationshipRepository;
  private static notificationRepository = NotificationRepository;
  private static consensusRepository = ConsensusRepository;

  // Matching exclusion rules:
  //   — My state (skip checks, applied before any candidate lookup) —
  //   Rule 1.  My personality test incomplete         → skip matching entirely
  //   Rule 2.  I already have an active romance       → skip love matching entirely
  //   — Per-target: exclude from all candidates —
  //   Rule 3.  Target's personality test incomplete   → exclude from all candidates
  //   — Per-target: exclude from friend candidates —
  //   Rule 4.  Already friends                        → exclude from friend candidates
  //   Rule 5.  Already my lover (COUPLE)              → exclude from friend candidates
  //   Rule 6.  Already my spouse (MARRIED)            → exclude from friend candidates
  //   — Per-target: include in friend candidates (with modifier) —
  //   Rule 7.  Previously unfriended (UNFRIENDED)     → include in friend candidates, apply -10 score penalty
  //   Rule 8.  Previously broke up (BREAKUP)          → include in friend candidates (no extra penalty)
  //   — Per-target: exclude from love candidates —
  //   Rule 9.  Already my lover (COUPLE)              → exclude from love candidates
  //   Rule 10. Already my spouse (MARRIED)            → exclude from love candidates
  //   Rule 11. Target has an active lover             → exclude from love candidates
  //   Rule 12. Target is married                      → exclude from love candidates

  static async match({ catId }: { catId: string }) {
    const [cat, personality] = await Promise.all([
      this.catRepository.findById({ catId }),
      this.personalityRepository.findCatPersonalityRecord({ catId }),
    ]);

    if (!cat) throw new NotFoundError(`Cat not found: ${catId}`);
    if (!personality)
      throw new NotFoundError(`Cat personality not found: ${catId}`);

    // Rule 1
    if (personality.remainingCount !== 0)
      throw new PreconditionFailedError(
        `Personality test incomplete: ${catId}`,
      );

    const [
      friendTargets,
      loveTargets,
      unfriendedIds,
      unfriendedScorePenalty,
      friendProbSameSex,
      friendProbDiffSex,
      loveProb,
    ] = await Promise.all([
      this.relationshipRepository.findFriendCandidates({ catId }),
      this.relationshipRepository.findLoveCandidates({ catId }),
      this.relationshipRepository.findUnfriendedIds({ catId }),
      this.consensusRepository.findValue(
        "RELATIONSHIP.UNFRIENDED_SCORE_PENALTY",
      ),
      this.consensusRepository.findValue(
        "RELATIONSHIP.FRIEND_MATCH_PROBABILITY_SAME_SEX",
      ),
      this.consensusRepository.findValue(
        "RELATIONSHIP.FRIEND_MATCH_PROBABILITY_DIFF_SEX",
      ),
      this.consensusRepository.findValue("RELATIONSHIP.LOVE_MATCH_PROBABILITY"),
    ]);

    const sex = cat.sex;
    const myPersonality = { catId, sex, ...personality };
    const unfriendedSet = new Set(unfriendedIds);
    const vector = new CatPersonalityVector(myPersonality);

    const bestFriendCandidate = this.rankFriendCandidates(
      friendTargets,
      vector,
      sex,
      unfriendedSet,
      unfriendedScorePenalty,
    )[0];

    // If a friend candidate exists, roll for friendship first.
    // On success, love matching is skipped entirely.
    // Same-sex friendships form more easily than opposite-sex ones.
    if (bestFriendCandidate) {
      const probability = bestFriendCandidate.isSameSex
        ? friendProbSameSex
        : friendProbDiffSex;

      if (Math.random() < probability) {
        await this.relationshipRepository.create({
          catId,
          targetCatId: bestFriendCandidate.catId,
          type: CatRelationshipType.FRIEND,
        });
        await this.sendMatchNotification(cat, "friend");
        return;
      }
    }

    // Rule 2: Already in an active romance → skip love matching entirely
    const hasActiveRomance = await this.relationshipRepository.hasActiveRomance(
      { catId },
    );

    if (hasActiveRomance) return;

    const bestLoveCandidate = this.rankLoveCandidates(
      loveTargets,
      vector,
      sex,
    )[0];

    if (bestLoveCandidate && Math.random() < loveProb) {
      await this.relationshipRepository.create({
        catId,
        targetCatId: bestLoveCandidate.catId,
        type: CatRelationshipType.COUPLE,
      });
      await this.sendMatchNotification(cat, "love");
    }
  }

  private static rankFriendCandidates(
    targets: PersonalityRow[],
    vector: CatPersonalityVector,
    mySex: string | null,
    unfriendedSet: Set<string>,
    unfriendedScorePenalty: number,
  ) {
    return targets
      .map((target) => ({
        catId: target.catId,
        isSameSex: target.sex === mySex,
        // Rule 7: apply penalty for previously unfriended cats
        score: Math.max(
          0,
          vector.calculateFriendScore(new CatPersonalityVector(target)) -
            (unfriendedSet.has(target.catId) ? unfriendedScorePenalty : 0),
        ),
      }))
      .toSorted((a, b) => b.score - a.score);
  }

  private static rankLoveCandidates(
    targets: PersonalityRow[],
    vector: CatPersonalityVector,
    mySex: string | null,
  ) {
    return targets
      .map((target) => ({
        catId: target.catId,
        isSameSex: target.sex === mySex,
        score: vector.calculateLoveScore(new CatPersonalityVector(target)),
      }))
      .toSorted((a, b) => b.score - a.score);
  }

  private static async sendMatchNotification(
    cat: NonNullable<Awaited<ReturnType<typeof CatRepository.findById>>>,
    type: "friend" | "love",
  ) {
    if (!cat) return;

    const fcmTokens = await this.notificationRepository.findTokensByUserId({
      userId: cat.servantId,
    });

    const title = type === "friend" ? "New Friend!" : "New Love!";
    const body =
      type === "friend"
        ? `Your cat ${cat.name} just made a new friend!`
        : `Your cat ${cat.name} just found a new love!`;

    const failedTokens: string[] = [];

    for (const fcm of fcmTokens) {
      try {
        await sendPushNotification({
          token: fcm.token,
          title,
          body,
        });
      } catch {
        failedTokens.push(fcm.token);
      }
    }

    await this.notificationRepository.deleteFcmTokens({
      tokens: failedTokens,
    });
  }

  static async getOverview({ catId }: { catId: string }) {
    const [romanceRows, friendRows, friendCount] = await Promise.all([
      this.relationshipRepository.findRomance({ catId }),
      this.relationshipRepository.findRecentFriends({ catId }),
      this.relationshipRepository.countFriends({ catId }),
    ]);
    const mapRow = (row: (typeof romanceRows)[number]) => ({
      type: row.type,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      catId: row.catId,
      catName: row.catName,
      catSex: row.catSex,
      growth: {
        value: row.growth,
        age: getAge(row.growth),
        ageGroup: getAgeGroup(row.growth),
      },
      emotion: {
        value: row.emotion,
        emoji: getEmotion(row.emotion).emoji,
        level: getEmotion(row.emotion).level,
      },
    });
    const coupleRow = romanceRows.find((r) => r.type === CatRelationshipType.COUPLE);
    const marriedRow = romanceRows.find((r) => r.type === CatRelationshipType.MARRIED);
    return {
      friendCount,
      couple: coupleRow ? mapRow(coupleRow) : null,
      married: marriedRow ? mapRow(marriedRow) : null,
      friends: friendRows.map(mapRow),
    };
  }

  static async getFriendList({
    catId,
    cursor,
    limit,
  }: { catId: string } & CursorQuery) {
    const [result, count] = await Promise.all([
      this.relationshipRepository.findFriendsCursor({ catId, cursor, limit }),
      this.relationshipRepository.countFriends({ catId }),
    ]);

    return {
      ...result,
      count,
      items: result.items.map((row) => ({
        id: row.id,
        type: row.type,
        updatedAt: row.updatedAt,
        catId: row.catId,
        catName: row.catName,
        catSex: row.catSex,
        growth: {
          value: row.growth,
          age: getAge(row.growth),
          ageGroup: getAgeGroup(row.growth),
        },
        emotion: {
          value: row.emotion,
          emoji: getEmotion(row.emotion).emoji,
          level: getEmotion(row.emotion).level,
        },
      })),
    };
  }

  static async getHistory({
    catId,
    userId,
    cursor,
    limit,
  }: { catId: string; userId: string } & CursorQuery) {
    const cat = await this.catRepository.findById({ catId });
    if (!cat) throw new NotFoundError(`Cat not found: ${catId}`);
    if (cat.servantId !== userId) throw new ForbiddenError();

    const result = await this.relationshipRepository.findHistoryCursor({
      catId,
      cursor,
      limit,
    });
    return {
      ...result,
      items: result.items.map((row) => ({
        id: row.id,
        catId: row.catId,
        catName: row.catName,
        catSex: row.catSex,
        type: row.type,
        createdAt: row.createdAt,
        growth: {
          value: row.growth,
          age: getAge(row.growth),
          ageGroup: getAgeGroup(row.growth),
        },
        emotion: {
          value: row.emotion,
          emoji: getEmotion(row.emotion).emoji,
          level: getEmotion(row.emotion).level,
        },
      })),
    };
  }

  static async getUpdates({
    catId,
    userId,
  }: {
    catId: string;
    userId: string;
  }) {
    const cat = await this.catRepository.findById({ catId });
    if (!cat) throw new NotFoundError(`Cat not found: ${catId}`);
    if (cat.servantId !== userId) throw new ForbiddenError();

    const [latest] = await this.careRecordRepository.findLatestByCatId({
      catId,
      limit: 1,
    });

    const rows = latest
      ? await this.relationshipRepository.findHistory({
          catId,
          after: latest.id,
          limit: 1,
        })
      : [];

    const row = rows[0];
    const current = row
      ? {
          id: row.id,
          catId: row.catId,
          catName: row.catName,
          catSex: row.catSex,
          type: row.type,
          createdAt: row.createdAt,
          growth: {
            value: row.growth,
            age: getAge(row.growth),
            ageGroup: getAgeGroup(row.growth),
          },
          emotion: {
            value: row.emotion,
            emoji: getEmotion(row.emotion).emoji,
            level: getEmotion(row.emotion).level,
          },
        }
      : null;

    return { current };
  }
}
