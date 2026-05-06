import { eq } from "drizzle-orm";
import { getDatabase, table } from "../../infra/db";
import { ConsensusValueType } from "../../infra/db/schema";
import { cache } from "../../infra/cache";
import { NotFoundError } from "../../lib/error";
import {
  CONSENSUS_DEFINITIONS,
  type ConsensusKey,
  type ConsensusValue,
} from "./definitions";

const PREFIX = "consensus:";
const NAME_SUFFIX = ":name";
const PURPOSE_SUFFIX = ":purpose";

function parseValue(
  raw: string,
  valueType: ConsensusValueType,
): string | number | boolean {
  switch (valueType) {
    case ConsensusValueType.NUMBER:
      return Number(raw);
    case ConsensusValueType.BOOLEAN:
      return raw === "true";
    default:
      return raw;
  }
}

function cacheSetMeta(key: ConsensusKey, name: string, purpose: string) {
  cache.set(PREFIX + key + NAME_SUFFIX, name);
  cache.set(PREFIX + key + PURPOSE_SUFFIX, purpose);
}

export abstract class ConsensusRepository {
  static async getAllValues() {
    return Promise.all(
      (Object.keys(CONSENSUS_DEFINITIONS) as ConsensusKey[]).map((key) =>
        ConsensusRepository.getValueWithMeta(key),
      ),
    );
  }

  static async getValueWithMeta<K extends ConsensusKey>(key: K) {
    const valueType = CONSENSUS_DEFINITIONS[key];
    const cacheKey = PREFIX + key;

    const cachedValue = cache.get(cacheKey);
    const cachedName = cache.get(cacheKey + NAME_SUFFIX);
    const cachedPurpose = cache.get(cacheKey + PURPOSE_SUFFIX);

    if (cachedValue !== undefined && cachedName !== undefined && cachedPurpose !== undefined) {
      return {
        key,
        value: parseValue(cachedValue, valueType) as ConsensusValue<K>,
        name: cachedName,
        purpose: cachedPurpose,
      };
    }

    const db = getDatabase();
    const [row] = await db
      .select({
        value: table.consensus.value,
        name: table.consensus.name,
        purpose: table.consensus.purpose,
      })
      .from(table.consensus)
      .where(eq(table.consensus.key, key))
      .limit(1);

    if (!row)
      throw new NotFoundError(`Consensus key "${key}" not found in database.`);

    cache.set(cacheKey, row.value);
    cacheSetMeta(key, row.name, row.purpose);

    return {
      key,
      value: parseValue(row.value, valueType) as ConsensusValue<K>,
      name: row.name,
      purpose: row.purpose,
    };
  }

  static async getValue<K extends ConsensusKey>(
    key: K,
  ): Promise<ConsensusValue<K>> {
    const valueType = CONSENSUS_DEFINITIONS[key];

    const cacheKey = PREFIX + key;
    const cached = cache.get(cacheKey);
    if (cached !== undefined)
      return parseValue(cached, valueType) as ConsensusValue<K>;

    const db = getDatabase();
    const [row] = await db
      .select({
        value: table.consensus.value,
        name: table.consensus.name,
        purpose: table.consensus.purpose,
      })
      .from(table.consensus)
      .where(eq(table.consensus.key, key))
      .limit(1);

    if (!row)
      throw new NotFoundError(`Consensus key "${key}" not found in database.`);

    cache.set(cacheKey, row.value);
    cacheSetMeta(key, row.name, row.purpose);

    return parseValue(row.value, valueType) as ConsensusValue<K>;
  }

  static async setValue<K extends ConsensusKey>(
    key: K,
    value: ConsensusValue<K>,
  ) {
    const db = getDatabase();
    const raw = String(value);

    await db
      .update(table.consensus)
      .set({ value: raw })
      .where(eq(table.consensus.key, key));

    cache.set(PREFIX + key, raw);
  }

  static invalidate(key: ConsensusKey) {
    cache.delete(PREFIX + key);
    cache.delete(PREFIX + key + NAME_SUFFIX);
    cache.delete(PREFIX + key + PURPOSE_SUFFIX);
  }
}
