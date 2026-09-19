import { NextRequest, NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPayload = {
  email?: string;
  name?: string;
  message?: string;
  source?: string;
  service?: string;
  /** Optional signature as a PNG data URL, drawn or typed on the form. */
  signature?: string;
  signatureMethod?: string;
};

const SERVICES = ["Social media", "Website", "Both", "Other"];
const SIGNATURE_PREFIX = "data:image/png;base64,";
const MAX_SIGNATURE_CHARS = 300_000;

// In-memory store for local/demo purposes. Swap for a real database or
// email provider (Resend, Postmark, etc.) before shipping to production.
const submissions: Array<ContactPayload & { receivedAt: string }> = [];

export async function POST(req: NextRequest) {
  let body: ContactPayload;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Expected a JSON request body." },
      { status: 400 }
    );
  }

  const email = body.email?.trim();

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 422 }
    );
  }

  if (body.message && body.message.length > 4000) {
    return NextResponse.json(
      { error: "Message is too long." },
      { status: 422 }
    );
  }

  if (body.service && !SERVICES.includes(body.service)) {
    return NextResponse.json(
      { error: "Choose one of the listed services." },
      { status: 422 }
    );
  }

  if (
    body.signature &&
    (!body.signature.startsWith(SIGNATURE_PREFIX) ||
      body.signature.length > MAX_SIGNATURE_CHARS)
  ) {
    return NextResponse.json(
      { error: "That signature could not be used. Please try again." },
      { status: 422 }
    );
  }

  submissions.push({
    email,
    name: body.name?.trim(),
    message: body.message?.trim(),
    service: body.service,
    signature: body.signature,
    signatureMethod: body.signatureMethod,
    source: body.source ?? "unknown",
    receivedAt: new Date().toISOString(),
  });

  const message =
    body.source === "hero-audit"
      ? "You're on the list. Check your inbox shortly."
      : "Thanks, we'll reply within one business day.";

  return NextResponse.json({ ok: true, message }, { status: 200 });
}

export async function GET() {
  // Lightweight endpoint for local debugging of submissions during development.
  return NextResponse.json({ count: submissions.length });
}
