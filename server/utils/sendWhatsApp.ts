import twilio from "twilio";

// ✅ Create Twilio client ONCE
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
);

export async function sendWhatsAppMessage(to: string, message: string) {
  console.log("📤 WhatsApp send attempt");
  console.log("FROM (TWILIO_WHATSAPP_FROM):", process.env.TWILIO_WHATSAPP_FROM);
  console.log("TO (ADMIN_WHATSAPP_NUMBER):", to);

  const result = await client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
    to: `whatsapp:${to}`,
    body: message,
  });

  console.log("✅ WhatsApp message SID:", result.sid);

  return result;
}
