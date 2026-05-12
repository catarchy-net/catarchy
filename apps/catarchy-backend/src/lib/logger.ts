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
    console.log(`[INF] ${message}`, ...args);
  },
};
