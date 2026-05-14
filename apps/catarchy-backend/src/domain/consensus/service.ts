import type { ConsensusKey } from "./definitions";
import { ConsensusRepository } from "./repository";

export abstract class ConsensusService {
  private static consensusRepository = ConsensusRepository;

  static async getAll() {
    return this.consensusRepository.getAllValues();
  }

  static async getOne(key: ConsensusKey) {
    return this.consensusRepository.getValueWithMeta(key);
  }
}
