import { render } from "@react-email/components";
import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

interface MailMessage {
  from?: string;
  to: string;
  subject: string;
  template: React.JSX.Element;
}

export function createEmailClient(sender: SendEmail) {
  return {
    async send({ to, from, subject, template }: MailMessage) {
      from ??= "me@mail.com"; // default sender
      const html = await render(template);
      const text = await render(template, { plainText: true });
      console.log({ to, subject, html, text });

      const msg = createMimeMessage();
      msg.setSender({ name: "Sender", addr: from });
      msg.setRecipient(to);
      msg.setSubject(subject);
      msg.addMessage({
        contentType: "text/html",
        data: html,
      });

      const message = new EmailMessage(from, to, html);
      await sender.send(message);
    },
  };
}

export type EmailClient = ReturnType<typeof createEmailClient>;
