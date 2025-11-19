import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { validationEmail } from './templates/validation.email';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    const host = this.config.get('SMTP_HOST') || 'localhost';
    const port = Number(this.config.get('SMTP_PORT') || 1025);
    const user = this.config.get('SMTP_USER') || undefined;
    const pass = this.config.get('SMTP_PASS') || undefined;

    const opts: SMTPTransport.Options = {
      host,
      port,
      secure: false,
    };

    if (user && pass) {
      opts.auth = { user, pass } as any;
    }

    this.transporter = nodemailer.createTransport(opts);
  }

  async sendVerificationEmail(to: string, firstName: string, token: string) {
    const baseUrl = this.config.get('APP_URL') || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/user/verify?token=${encodeURIComponent(token)}`;

    const html = validationEmail(firstName, verifyUrl);

    const mail = {
      from: this.config.get('MAIL_FROM') || 'no-reply@example.com',
      to,
      subject: 'Activation de votre compte',
      html,
    };

    try {
      const info = await this.transporter.sendMail(mail);
      this.logger.log(`Sent verification email to ${to}: ${info.messageId}`);
      return info;
    } catch (err) {
      this.logger.error('Failed to send verification email', err as any);
      throw err;
    }
  }

  async sendMail(opts: nodemailer.SendMailOptions) {
    return this.transporter.sendMail(opts as any);
  }
}
