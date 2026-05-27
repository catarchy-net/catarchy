import { waitUntil } from "cloudflare:workers";

import { logger } from "../../lib/logger";

export function runInBackground(fn: () => Promise<unknown>): void {
  try {
    waitUntil(fn());
  } catch (error) {
    logger.error("Error running background task", { error });
    fn().catch((error) => {
      logger.error("Error running background task (second attempt)", { error });
    });
  }
}
