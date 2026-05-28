const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export const GMAIL_OAUTH_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
].join(" ");

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
}

export function getGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const baseUrl =
    process.env.AUTH0_BASE_URL?.trim() ?? "http://localhost:3000";

  if (!clientId || !clientSecret) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    redirectUri: `${baseUrl.replace(/\/$/, "")}/api/google/callback`,
  };
}

export function buildGoogleAuthorizeUrl(state: string): string {
  const config = getGoogleOAuthConfig();
  if (!config) {
    throw new Error(
      "GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET deben estar en .env.local (mismas credenciales que la conexión Google en Auth0 / Google Cloud)."
    );
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: GMAIL_OAUTH_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleAuthCode(
  code: string
): Promise<GoogleTokenResponse> {
  const config = getGoogleOAuthConfig();
  if (!config) {
    throw new Error("Google OAuth no configurado.");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = (await response.json()) as GoogleTokenResponse & {
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.error_description ??
        data.error ??
        `Error al intercambiar código Google (${response.status})`
    );
  }

  return data;
}

export async function refreshGoogleAccessToken(
  refreshToken: string
): Promise<GoogleTokenResponse> {
  const config = getGoogleOAuthConfig();
  if (!config) {
    throw new Error("Google OAuth no configurado.");
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "refresh_token",
    }),
  });

  const data = (await response.json()) as GoogleTokenResponse & {
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.error_description ??
        data.error ??
        `Error al refrescar token Google (${response.status})`
    );
  }

  return data;
}

export const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";
