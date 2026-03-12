import { Injectable } from "@nestjs/common";
import { SETTINGS } from "../settings/settings";
import { Resend } from "resend";

export type SendEmailParams = {
    to: string;
    subject: string;
    html: string;
};

@Injectable()
export class MailerService {
    private client: Resend | null = null;

    private getClient(): Resend | null {
        if (!this.client) {
            if (!SETTINGS.RESEND_API_KEY) {
                console.error("[mail] No RESEND_API_KEY provided!");
                return null;
            }
            this.client = new Resend(SETTINGS.RESEND_API_KEY);
        }
        return this.client;
    }

    async send({ to, subject, html }: SendEmailParams): Promise<void> {
        const client = this.getClient();

        if (!client) {
            return;
        }

        await client.emails.send({
            from: SETTINGS.MAIL_FROM,
            to,
            subject,
            html,
        });
    }
}
