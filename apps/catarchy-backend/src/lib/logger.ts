import { ENVIRONMENT, getEnv } from "./env";

const blue = (s: string) =>
  getEnv().ENVIRONMENT === ENVIRONMENT.LOCAL ? `\x1b[34m${s}\x1b[0m` : s;

export const logger = {
  request(requestId: string, method: string, path: string) {
    console.log(`[REQ] ${requestId} ${method} ${path}`);
  },
  response(requestId: string, status: number, method: string, path: string) {
    console.log(`[RES] ${requestId} ${status} ${method} ${path}`);
  },
  error(requestId: string, error: unknown) {
    if (error instanceof Error) {
      console.error(`[ERR] ${requestId} ${error.name}: ${error.message}`);
      if (error.stack) console.error(error.stack);
    } else {
      console.error(`[ERR] ${requestId}`, error);
    }
  },
  info(message: string, ...args: unknown[]) {
    console.log(blue(`[INF] ${message}`), ...args);
  },
};
