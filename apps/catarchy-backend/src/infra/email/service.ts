import { Resend } from "resend";
import { ExternalServiceError } from "../../lib/error";

let _resend: Resend | null = null;

export const initEmail = (apiKey: string) => {
  if (_resend) return;
  _resend = new Resend(apiKey);
};

export abstract class EmailService {
  private static get fromAddress() {
    return "Catarchy <noreply@catarchy.net>";
  }

  private static get client() {
    if (!_resend) throw new Error("Email not initialized");
    return _resend;
  }

  static async sendMail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    const { error } = await this.client.emails.send({
      from: this.fromAddress,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Failed to send email:", error);
      throw new ExternalServiceError("Failed to send email");
    }
  }
}
