import { render } from "@react-email/components";
import { Resend } from "resend";

export interface EmailClient {
  send(message: EmailMessage): Promise<void>;
}

interface EmailMessage {
  to: string;
  subject: string;
  template: React.JSX.Element;
}

export function createEmailClient(resendKey: string): EmailClient {
  return {
    async send({ to, subject, template }) {
      const from = "me@mail.com"; // default sender

      if (import.meta.env.MODE === "production") {
        const resend = new Resend(resendKey);
        const response = await resend.emails.send({
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
    },
  };
}
