import { render } from "@react-email/components";
import nodemailer from "nodemailer";

import { env } from "~/config/env.server";

interface MailMessage {
  from?: string;
  to: string;
  subject: string;
  template: React.JSX.Element;
}

class Mailer {
  private transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.NODE_ENV === "production",
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  async send({ to, from, subject, template }: MailMessage) {
    from ??= "me@mail.com"; // default sender
    const html = await render(template);
    const text = await render(template, { plainText: true });
    await new Promise((resolve, reject) => {
      this.transporter.sendMail(
        { to, from, subject, html, text },
        (err, info) => {
          if (err) reject(err);
          console.log(nodemailer.getTestMessageUrl(info));
          resolve(info);
        }
      );
    });
  }
}

export interface EmailTemplate<T> {
  (data: T): Promise<string>;
}

/**
 * Mailer is the core interface for sending emails.
 *
 * For the sake of simplicity, it is set up with nodemailer and SMTP transport,
 * but for the production environment we can easily replace it by a professional
 * email service like Resend or MailGun.
 */
export const mailer = new Mailer();
