import { getEnv } from "../../lib/env";

const FCM_PROJECT_ID = "catarchy-general";
const FCM_ENDPOINT = `https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_ID}/messages:send`;
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

function base64url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/\\n/g, "\n") // literal \n → actual newline (when coming from env var)
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(b64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

async function getAccessToken(): Promise<string> {
  const env = getEnv();
  const email = env.FIREBASE_SERVICE_ACCOUNT_EMAIL!;
  const privateKeyPem = env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY!;

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(
    new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" }))
      .buffer as ArrayBuffer,
  );
  const payload = base64url(
    new TextEncoder().encode(
      JSON.stringify({
        iss: email,
        scope: "https://www.googleapis.com/auth/firebase.messaging",
        aud: GOOGLE_TOKEN_ENDPOINT,
        exp: now + 3600,
        iat: now,
      }),
    ).buffer as ArrayBuffer,
  );

  const signingInput = `${header}.${payload}`;
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(signingInput).buffer as ArrayBuffer,
  );

  const jwt = `${signingInput}.${base64url(signature)}`;

  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const json = (await res.json()) as { access_token?: string; error?: string };
  if (!json.access_token) {
    throw new Error(`FCM token exchange failed: ${JSON.stringify(json)}`);
  }
  return json.access_token;
}

export async function sendPushNotification({
  token,
  title,
  body,
  url,
}: {
  token: string;
  title: string;
  body: string;
  url?: string;
}) {
  const accessToken = await getAccessToken();

  const message: Record<string, unknown> = {
    token,
    webpush: {
      headers: { Urgency: "high" },
      notification: {
        title,
        body,
        icon: "/icons/icon-192x192.png",
        require_interaction: true,
      },
      ...(url && { fcm_options: { link: url } }),
    },
    ...(url && { data: { url } }),
  };

  const res = await fetch(FCM_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  return {
    success: res.ok,
    error: res.ok ? undefined : await res.text(),
  };
}

export async function sendMultiplePushNotification({
  tokens,
  title,
  body,
  url,
}: {
  tokens: string[];
  title: string;
  body: string;
  url?: string;
}) {
  const results = await Promise.allSettled(
    tokens.map((token) => sendPushNotification({ token, title, body, url })),
  );

  const failed = results.filter((r) => r.status === "rejected");

  return {
    total: tokens.length,
    failed,
  };
}
