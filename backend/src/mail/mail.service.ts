import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { validationEmail, validationEmailSubjects } from './templates/validation.email';
import {
  emailSubjects,
  resetPasswordEmail,
} from './templates/reset-password.email';

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

  async sendVerificationEmail(
    to: string,
    firstName: string,
    token: string,
    locale: string = 'en',
  ) {
    const baseUrl = this.config.get('FRONTEND_URL') || 'https://oftheyear.eu';
    const verifyUrl = `${baseUrl}/${locale}/verify?token=${encodeURIComponent(token)}`;
    const html = validationEmail(firstName, verifyUrl, locale);
    const subject =
      validationEmailSubjects.validation[locale] || validationEmailSubjects.validation['en'];

    await this.sendMail({
      to,
      subject,
      html,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    token: string,
    locale: string = 'en',
  ) {
    const baseUrl = this.config.get('FRONTEND_URL') || 'https://oftheyear.eu';
    const resetUrl = `${baseUrl}/${locale}/reset-password?token=${encodeURIComponent(token)}`;
    const html = resetPasswordEmail(firstName, resetUrl, locale);
    const subject =
      emailSubjects.resetPassword[locale] || emailSubjects.resetPassword['en'];

    await this.sendMail({
      to,
      subject,
      html,
    });
  }

  /**
   * In production, send mail via Brevo REST API
   * SMTP ports 25, 465, 587 are blocked through many cloud providers for security reasons
   */
  private async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
  }) {
    const nodeEnv = this.config.get('NODE_ENV');
    
    if (nodeEnv === 'production') {
      const brevoApiKey = this.config.get('BREVO_API_KEY');
      const mailFromName = this.config.get('MAIL_FROM_NAME') || 'OfTheYear';
      const mailFromAddress = this.config.get('MAIL_FROM_ADDRESS') || this.config.get('MAIL_FROM') || 'no-reply@oftheyear.eu';

      if (!brevoApiKey) {
        this.logger.error('BREVO_API_KEY is not configured in production');
        throw new Error('Email service not configured');
      }

      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: {
              name: mailFromName,
              email: mailFromAddress,
            },
            to: [{ email: options.to }],
            subject: options.subject,
            htmlContent: options.html,
            ...(options.replyTo && { replyTo: { email: options.replyTo } }),
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          this.logger.error(`Brevo API error: ${response.status} ${errorText}`);
          throw new Error(`Failed to send email via Brevo: ${response.status}`);
        }

        const result = await response.json();
        this.logger.log(`Sent email to ${options.to} via Brevo: ${result.messageId}`);
      } catch (err) {
        this.logger.error('Failed to send email via Brevo', err as any);
        throw err;
      }
    } else {
      // Development: use nodemailer SMTP
      const mail = {
        from: this.config.get('MAIL_FROM') || 'no-reply@example.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        ...(options.replyTo && { replyTo: options.replyTo }),
      };

      try {
        const info = await this.transporter.sendMail(mail as any);
        this.logger.log(`Sent email to ${options.to}: ${info.messageId}`);
      } catch (err) {
        this.logger.error('Failed to send email via SMTP', err as any);
        throw err;
      }
    }
  }
}
