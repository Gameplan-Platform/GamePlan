import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const APP_URL = process.env.APP_URL || "http://localhost:5173";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  if (!resend) {
    console.log("──────────────────────────────────────");
    console.log("VERIFICATION EMAIL (dev mode - no RESEND_API_KEY set)");
    console.log(`To: ${email}`);
    console.log(`Link: ${verifyUrl}`);
    console.log("──────────────────────────────────────");
    return;
  }

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your GamePlan account",
    html: `
      <h2>Welcome to GamePlan</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${verifyUrl}">Verify Email</a>
      <p>If you didn't create an account, you can ignore this email.</p>
    `,
  });
}
