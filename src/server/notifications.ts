import { createServerFn } from "@tanstack/react-start";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { getTwilioClient, getTwilioPhoneNumber } from "./twilioService";

// ---------------------------------------------------------------------------
// Service initialisation helpers — never cache null; always re-read env vars
// ---------------------------------------------------------------------------

const getResend = (): Resend | null => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[Notifications] RESEND_API_KEY is not set. Emails will not be sent.");
    return null;
  }
  return new Resend(apiKey);
};

/**
 * Admin Supabase client — required to read auth.users (email) and profiles (phone).
 * Uses the SERVICE_ROLE_KEY which must NEVER be exposed to the client.
 */
const getAdminSupabase = () => {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceKey) {
    console.warn(
      "[Notifications] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing. " +
        "Cannot fetch user contact info via admin client.",
    );
    return null;
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

// ---------------------------------------------------------------------------
// Notification types
// ---------------------------------------------------------------------------

export type NotificationType =
  | "bid_placed"      // Farmer gets notified when a buyer places a bid
  | "bid_confirmed"   // Buyer gets notified when their bid is accepted (confirmed)
  | "bid_rejected"    // Buyer gets notified when their bid is rejected
  | "order_delivered"; // All parties get notified when order is delivered

export interface NotificationData {
  type: NotificationType;
  targetUserId: string;
  payload: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Contact resolution — always use admin client to avoid RLS restrictions
// ---------------------------------------------------------------------------

interface UserContact {
  email: string | null;
  phone: string | null;
  fullName: string | null;
}

async function resolveContact(userId: string): Promise<UserContact> {
  const admin = getAdminSupabase();
  let email: string | null = null;
  let phone: string | null = null;
  let fullName: string | null = null;

  if (!admin) {
    console.error(
      `[Notifications] Admin client unavailable — cannot resolve contact for user ${userId}`,
    );
    return { email, phone, fullName };
  }

  // Fetch email from auth.users (requires SERVICE_ROLE_KEY)
  const { data: authUser, error: authErr } = await admin.auth.admin.getUserById(userId);
  if (authErr) {
    console.error(`[Notifications] Failed to fetch auth user ${userId}:`, authErr.message);
  } else {
    email = authUser?.user?.email ?? null;
  }

  // Fetch phone + full_name from public.profiles (also uses admin to bypass RLS)
  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .select("phone, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (profileErr) {
    console.error(`[Notifications] Failed to fetch profile for ${userId}:`, profileErr.message);
  } else {
    phone = profile?.phone ?? null;
    fullName = profile?.full_name ?? null;
  }

  return { email, phone, fullName };
}

// ---------------------------------------------------------------------------
// Message builders
// ---------------------------------------------------------------------------

interface MessageContent {
  subject: string;
  html: string;
  sms: string;
}

function buildMessage(type: NotificationType, payload: Record<string, unknown>): MessageContent {
  const productName = String(payload.productName ?? "your product");
  const bidPrice = payload.bidPrice ? `₹${payload.bidPrice}` : "";
  const totalPrice = payload.totalPrice ? `₹${payload.totalPrice}` : "";

  switch (type) {
    case "bid_placed":
      return {
        subject: `🌾 New Bid on "${productName}" — Vivasayi`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
            <h2 style="color:#16a34a;margin-bottom:8px">New Bid Received!</h2>
            <p>A buyer has placed a bid on your listing <strong>${productName}</strong>.</p>
            <table style="border-collapse:collapse;width:100%;margin:16px 0">
              <tr><td style="padding:8px;background:#f9fafb;font-weight:600">Bid Amount</td><td style="padding:8px">${bidPrice} / unit</td></tr>
              <tr><td style="padding:8px;background:#f9fafb;font-weight:600">Quantity</td><td style="padding:8px">${payload.quantity ?? ""}</td></tr>
            </table>
            <p>Log in to <strong>Vivasayi</strong> to review and accept or reject this bid.</p>
            <a href="${process.env.APP_URL ?? "https://vivasayi.app"}/marketplace" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#16a34a;color:#fff;border-radius:6px;text-decoration:none">View Bids</a>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">Vivasayi Marketplace · Real-time Agricultural Trading</p>
          </div>`,
        sms: `Vivasayi: New bid on "${productName}" — ${bidPrice}/unit. Log in to review now.`,
      };

    case "bid_confirmed":
      return {
        subject: `🎉 Your Bid was Accepted — "${productName}" — Vivasayi`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
            <h2 style="color:#16a34a;margin-bottom:8px">Congratulations! Your Bid was Accepted 🎉</h2>
            <p>The farmer has accepted your bid for <strong>${productName}</strong>.</p>
            <table style="border-collapse:collapse;width:100%;margin:16px 0">
              <tr><td style="padding:8px;background:#f9fafb;font-weight:600">Product</td><td style="padding:8px">${productName}</td></tr>
              <tr><td style="padding:8px;background:#f9fafb;font-weight:600">Total Price</td><td style="padding:8px">${totalPrice}</td></tr>
            </table>
            <p>An order has been created. Track its progress in your dashboard.</p>
            <a href="${process.env.APP_URL ?? "https://vivasayi.app"}/orders" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#16a34a;color:#fff;border-radius:6px;text-decoration:none">Track Order</a>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">Vivasayi Marketplace · Real-time Agricultural Trading</p>
          </div>`,
        sms: `Vivasayi: 🎉 Bid ACCEPTED for "${productName}"! Total: ${totalPrice}. Check your orders now.`,
      };

    case "bid_rejected":
      return {
        subject: `Your Bid on "${productName}" was not accepted — Vivasayi`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
            <h2 style="color:#dc2626;margin-bottom:8px">Bid Not Accepted</h2>
            <p>Unfortunately the farmer has rejected your bid for <strong>${productName}</strong>.</p>
            <p>Don't worry — there are many more products on the marketplace!</p>
            <a href="${process.env.APP_URL ?? "https://vivasayi.app"}/marketplace" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#16a34a;color:#fff;border-radius:6px;text-decoration:none">Browse Marketplace</a>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">Vivasayi Marketplace · Real-time Agricultural Trading</p>
          </div>`,
        sms: `Vivasayi: Your bid on "${productName}" was not accepted. Browse more crops at Vivasayi.`,
      };

    case "order_delivered":
      return {
        subject: `✅ Order Delivered — "${productName}" — Vivasayi`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
            <h2 style="color:#16a34a;margin-bottom:8px">Order Successfully Delivered ✅</h2>
            <p>The order for <strong>${productName}</strong> has been marked as <strong>delivered</strong>.</p>
            <p>Thank you for trading on Vivasayi!</p>
            <a href="${process.env.APP_URL ?? "https://vivasayi.app"}/orders" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#16a34a;color:#fff;border-radius:6px;text-decoration:none">View Orders</a>
            <p style="color:#9ca3af;font-size:12px;margin-top:24px">Vivasayi Marketplace · Real-time Agricultural Trading</p>
          </div>`,
        sms: `Vivasayi: ✅ Order for "${productName}" has been delivered. Thank you for using Vivasayi!`,
      };

    default:
      return {
        subject: "Vivasayi Notification",
        html: `<p>You have a new notification on Vivasayi.</p>`,
        sms: "Vivasayi: You have a new notification. Check the app.",
      };
  }
}

// ---------------------------------------------------------------------------
// Delivery helpers
// ---------------------------------------------------------------------------

async function sendEmail(
  resend: Resend,
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: "Vivasayi Marketplace <notifications@vivasayi.app>",
      to,
      subject,
      html,
    });
    if (error) {
      console.error("[Notifications] Resend error:", error);
      return false;
    }
    console.info(`[Notifications] Email sent to ${to} — "${subject}"`);
    return true;
  } catch (err) {
    console.error("[Notifications] Email exception:", err);
    return false;
  }
}

async function sendSms(to: string, body: string): Promise<boolean> {
  const client = getTwilioClient();
  const from = getTwilioPhoneNumber();

  if (!client || !from) return false;

  try {
    const msg = await client.messages.create({ body, from, to });
    console.info(`[Notifications] SMS sent to ${to} — SID: ${msg.sid}`);
    return true;
  } catch (err) {
    console.error("[Notifications] SMS exception:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Public server function — called from client routes via TanStack Start
// ---------------------------------------------------------------------------

export const sendNotification = createServerFn({ method: "POST" })
  .inputValidator((d: NotificationData) => d)
  .handler(async ({ data }) => {
    const { type, targetUserId, payload } = data;

    // 1. Resolve contact info using the admin client (bypasses RLS)
    const { email, phone, fullName } = await resolveContact(targetUserId);

    if (!email && !phone) {
      const msg = `No contact info found for user ${targetUserId}. Notification not sent.`;
      console.warn(`[Notifications] ${msg}`);
      return { success: false, error: msg, results: { email: false, sms: false } };
    }

    // 2. Build message content
    const { subject, html, sms: smsBody } = buildMessage(type, payload);

    const results = { email: false, sms: false };

    // 3. Send email
    const resend = getResend();
    if (resend && email) {
      results.email = await sendEmail(resend, email, subject, html);
    } else if (!resend) {
      console.warn("[Notifications] Email skipped — Resend not configured.");
    } else if (!email) {
      console.warn(`[Notifications] Email skipped — no email for user ${targetUserId}.`);
    }

    // 4. Send SMS
    if (phone) {
      results.sms = await sendSms(phone, smsBody);
    } else {
      console.warn(`[Notifications] SMS skipped — no phone for user ${targetUserId}.`);
    }

    const success = results.email || results.sms;
    console.info(
      `[Notifications] ${type} → user ${targetUserId} (${fullName ?? "unknown"}) | ` +
        `email=${results.email} sms=${results.sms}`,
    );

    return { success, results };
  });

