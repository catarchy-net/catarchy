import Elysia from "elysia";
import { EmailService } from "./service";
import { type Env } from "../../lib/env";

export const emailRouter = (_env: Env) =>
  new Elysia({
    prefix: "/email",
    tags: ["Email"],
  }).decorate("service", EmailService);
