import { Elysia } from "elysia";
import { AppError } from "../lib/error";
import { logger } from "../lib/logger";

export interface CustomErrorResponse {
  message: string;
  data?: unknown;
}

export const errorHandler = new Elysia({ name: "errorHandler" })
  .onError(({ code, error, set }) => {
    const requestId =
      (set.headers as Record<string, string>)["X-Request-Id"] ?? "unknown";

    if (error instanceof AppError) {
      set.status = error.code;
      logger.error(requestId, error);

      const response: CustomErrorResponse = { message: error.message };
      if (error.data) response.data = error.data;
      return response;
    }

    if (code === "VALIDATION") {
      set.status = 422;
      logger.error(requestId, error);
      return { message: "Wrong input" };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { message: "Not Found" };
    }

    set.status = 500;
    logger.error(requestId, error);
    return { message: "Internal Server Error" };
  })
  .as("global");
