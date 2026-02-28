import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
);

export async function sendSMS(to: string, message: string) {
  console.log("📤 SMS send attempt");
  console.log("FROM:", process.env.TWILIO_SMS_FROM);
  console.log("TO:", to);

  const res = await client.messages.create({
    from: process.env.TWILIO_SMS_FROM!,
    to,
    body: message,
  });

  console.log("✅ SMS SID:", res.sid);
  return res;
}
