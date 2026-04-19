import twilio from "twilio";

let twilioClient: twilio.Twilio | null = null;
let cachedSid: string | null = null;
let cachedToken: string | null = null;

export function getTwilioClient(): twilio.Twilio | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();

  if (!accountSid || !authToken) {
    console.warn(
      "[Twilio] TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set. SMS will not be sent.",
    );
    return null;
  }

  // Rebuild if credentials have changed (key rotation / hot-reload support)
  if (!twilioClient || cachedSid !== accountSid || cachedToken !== authToken) {
    twilioClient = twilio(accountSid, authToken);
    cachedSid = accountSid;
    cachedToken = authToken;
  }

  return twilioClient;
}

export function getTwilioPhoneNumber(): string | null {
  const phone = process.env.TWILIO_PHONE_NUMBER?.trim();
  if (!phone) {
    console.warn("[Twilio] TWILIO_PHONE_NUMBER not set. SMS will not be sent.");
    return null;
  }
  return phone;
}
