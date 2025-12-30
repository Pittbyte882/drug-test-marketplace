import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const EMAIL_CONFIG = {
  from: "Talcada <onboarding@resend.dev>", // Use this for testing, change to your domain later
  supportEmail: "support@talcada.com",
}
