import { Elysia } from "elysia";
import { AppError } from "../lib/error";

export interface CustomErrorResponse {
  message: string;
  data?: unknown;
}

export const errorHandler = new Elysia({ name: "errorHandler" })
  .onError(({ code, error, set }) => {
    if (error instanceof AppError) {
      set.status = error.code;

      let response: CustomErrorResponse = {
        message: error.message,
      };

      if (error.data) {
        response["data"] = error.data;
      }

      return response;
    }

    if (code === "VALIDATION") {
      set.status = 422;
      return { message: error.message };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { message: "Not Found" };
    }

    // Catch-all for unknown errors
    set.status = 500;

    if (error instanceof Error) {
      console.error("Unexpected error:", error.message, error.stack);
    } else {
      console.error("Unexpected error:", error);
    }

    return { message: "Internal Server Error" };
  })
  .as("global");
