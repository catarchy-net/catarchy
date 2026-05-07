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
} as const satisfies Record<ConsensusKey, ConsensusValueType>;

type ValueTypeMap = {
  [ConsensusValueType.NUMBER]: number;
  [ConsensusValueType.STRING]: string;
  [ConsensusValueType.BOOLEAN]: boolean;
};

export type ConsensusValue<K extends ConsensusKey> =
  ValueTypeMap[(typeof CONSENSUS_DEFINITIONS)[K]];
