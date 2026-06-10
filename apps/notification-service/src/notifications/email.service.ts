import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from = process.env.RESEND_FROM_EMAIL ?? 'notifications@localhost';
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`RESEND_API_KEY not set — skipping email "${subject}" to ${to}`);
      return;
    }
    const { error } = await this.resend.emails.send({ from: this.from, to, subject, html });
    if (error) this.logger.error(`Failed to send email to ${to}: ${error.message}`);
  }

  replyTemplate(actorName: string, postTitle: string, link: string): string {
    return `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2>${actorName} replied to your post</h2>
        <p>Your post <strong>${postTitle || 'in the community'}</strong> has a new reply.</p>
        <a href="${link}" style="display:inline-block;padding:10px 20px;background:#6366F1;color:#fff;border-radius:6px;text-decoration:none;">View reply</a>
      </div>`;
  }

  mentionTemplate(actorName: string, link: string): string {
    return `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2>${actorName} mentioned you</h2>
        <p>You were mentioned in a comment.</p>
        <a href="${link}" style="display:inline-block;padding:10px 20px;background:#6366F1;color:#fff;border-radius:6px;text-decoration:none;">View comment</a>
      </div>`;
  }
}
