import { render } from "@react-email/components";
import { Resend } from "resend";

export type EmailClient = Mailer;

export function createEmailClient(resendKey: string): EmailClient {
  const resend = new Resend(resendKey);
  const mailer = new ResendMailer(resend);
  return mailer;
}

interface Mailer {
  send(message: MailerMessage): Promise<void>;
}

interface MailerMessage {
  to: string;
  subject: string;
  template: React.JSX.Element;
}

class ResendMailer implements Mailer {
  constructor(private resend: Resend) {}

  async send({ to, subject, template }: MailerMessage) {
    const from = "me@mail.com"; // default sender

    if (import.meta.env.MODE === "production") {
      const response = await this.resend.emails.send({
        from,
        to,
        subject,
        react: template,
      });
      if (response.error) throw response.error;
    } else {
      const html = await render(template);
      const text = await render(template, { plainText: true });
      console.log("Email you'd have sent: ", { to, subject, html, text });
    }
  }
}
