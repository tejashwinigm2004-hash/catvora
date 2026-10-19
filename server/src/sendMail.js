import nodemailer from 'nodemailer';

// Sends an email to one person. If SMTP is not set up (for example on your computer),
// it prints the message in the terminal instead, so you can still test.
export async function sendMail(to, subject, text) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log(`\n[mail not configured] To: ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }
  const t = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await t.sendMail({ from: MAIL_FROM || SMTP_USER, to, subject, text });
}