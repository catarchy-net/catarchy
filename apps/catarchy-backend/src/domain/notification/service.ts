import { sendMultiplePushNotification } from "../../infra/fcm";
import { NotificationRepository } from "./repository";

export abstract class NotificationService {
  private static notificationRepository = NotificationRepository;

  static async registerToken({
    userId,
    token,
  }: {
    userId: string;
    token: string;
  }) {
    return this.notificationRepository.upsertFcmToken({ userId, token });
  }

  static async unregisterToken({ token }: { token: string }) {
    return this.notificationRepository.deleteFcmToken({ token });
  }

  static async broadcastToAll({
    title,
    body,
    url,
  }: {
    title: string;
    body: string;
    url?: string;
  }) {
    const rows = await this.notificationRepository.findAllTokens();
    const result = await sendMultiplePushNotification({
      tokens: rows.map((row) => row.token),
      title,
      body,
      url,
    });

    return result;
  }
}
