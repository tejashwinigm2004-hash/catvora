import nodemailer from 'nodemailer';
const tx = process.env.SMTP_USER ? nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: +process.env.SMTP_PORT || 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
}) : null;

export async function notify(subject, text, replyTo) {
  if (!tx) return;
  try {
    await tx.sendMail({ from: process.env.SMTP_USER, to: process.env.NOTIFY_TO, subject, text });
    if (replyTo) await tx.sendMail({
      from: process.env.SMTP_USER, to: replyTo, subject: 'We received your request | CATVORA Technology',
      text: 'Thanks for reaching out. Our team will contact you shortly.\n\nCATVORA Technology',
    });
  } catch (e) { console.error('Mail failed:', e.message); } // never fail the request because of email
}
