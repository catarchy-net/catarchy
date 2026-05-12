import Elysia, { StatusMap } from "elysia";
import { authGuard } from "../auth/guard";
import { notificationModel } from "./model";
import { NotificationService } from "./service";

export const notificationRouter = () => {
  return new Elysia({
    prefix: "/notification",
    tags: ["Notification"],
  })
    .decorate("notificationService", NotificationService)
    .use(notificationModel)
    .use(authGuard())
    .post(
      "/token",
      async ({ user, notificationService, body }) => {
        return notificationService.registerToken({
          userId: user.id,
          token: body.token,
        });
      },
      {
        body: "notification.register-token.body",
        response: {
          [StatusMap.OK]: "notification.register-token.response",
        },
      },
    )
    .delete(
      "/token",
      async ({ notificationService, body }) => {
        await notificationService.unregisterToken({ token: body.token });
      },
      {
        body: "notification.register-token.body",
      },
    );
};
