import {
  type ConsensusKey,
  ConsensusValueType,
} from "@catarchy/shared/constants/consensus";

export type { ConsensusKey };

export const CONSENSUS_DEFINITIONS = {
  "CAT.COOLDOWN_HOUR_BETWEEN_CARE": ConsensusValueType.NUMBER,
  "CAT.GROWTH_PER_CARE": ConsensusValueType.NUMBER,
  "CAT.EMOTION_PER_CARE": ConsensusValueType.NUMBER,
  "CAT.EMOTION_DECREASE": ConsensusValueType.NUMBER,
  "CAT.EMOTION_DECREASE_FREQUENCY_HOUR": ConsensusValueType.NUMBER,
  "CAT.MAX_GROWTH": ConsensusValueType.NUMBER,
  "RELATIONSHIP.UNFRIENDED_SCORE_PENALTY": ConsensusValueType.NUMBER,
  "RELATIONSHIP.FRIEND_MATCH_PROBABILITY_SAME_SEX": ConsensusValueType.NUMBER,
  "RELATIONSHIP.FRIEND_MATCH_PROBABILITY_DIFF_SEX": ConsensusValueType.NUMBER,
  "RELATIONSHIP.LOVE_MATCH_PROBABILITY": ConsensusValueType.NUMBER,
} as const satisfies Record<ConsensusKey, ConsensusValueType>;

type ValueTypeMap = {
  [ConsensusValueType.NUMBER]: number;
  [ConsensusValueType.STRING]: string;
  [ConsensusValueType.BOOLEAN]: boolean;
};

export type ConsensusValue<K extends ConsensusKey> =
  ValueTypeMap[(typeof CONSENSUS_DEFINITIONS)[K]];
