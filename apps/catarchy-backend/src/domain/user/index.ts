import Elysia, { StatusMap } from "elysia";
import { withCommonError } from "../../lib/response";
import { authGuard } from "../auth/guard";
import { userModel } from "./model";
import { UserService } from "./service";

export const userRouter = () => {
  return new Elysia({
    prefix: "/user",
    tags: ["User"],
  })
    .decorate("userService", UserService)
    .use(userModel)
    .use(authGuard())
    .get(
      "/me",
      async ({ user, userService }) => {
        const { id } = user;
        return await userService.getCurrentUser({ id });
      },
      {
        response: withCommonError({
          [StatusMap["Not Found"]]: "user.not-found",
          [StatusMap.OK]: "user.current-user.response",
        }),
      },
    );
};
