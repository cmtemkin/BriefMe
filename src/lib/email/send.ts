/**
 * Postmark email sending integration.
 * Sends rendered HTML digest emails.
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
  textBody: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const apiKey = process.env.POSTMARK_API_KEY;
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || "morning@briefme.app";

  if (!apiKey) {
    console.warn("POSTMARK_API_KEY not configured, skipping email send");
    return false;
  }

  try {
    const response = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": apiKey,
      },
      body: JSON.stringify({
        From: `BriefMe <${fromAddress}>`,
        To: options.to,
        Subject: options.subject,
        HtmlBody: options.htmlBody,
        TextBody: options.textBody,
        MessageStream: "outbound",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Postmark error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}
