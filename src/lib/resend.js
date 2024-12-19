// import { Resend } from 'resend';

// export const resend = new Resend(process.env.RESEND_API_KEY);
import nodemailer from 'nodemailer';

export const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    }
  });