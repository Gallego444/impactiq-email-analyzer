const GOOGLE_CONNECTION = "google-oauth2";
const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

interface TokenExchangeResponse {
  access_token: string;
  expires_in: number;
  token_type?: string;
  scope?: string;
}

interface ManagementIdentity {
  provider?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface GoogleTokensFromManagement {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface ManagementUser {
  identities?: ManagementIdentity[];
}

function getAuth0Domain(): string {
  const issuer = process.env.AUTH0_ISSUER_BASE_URL?.trim();
  if (!issuer) {
    throw new Error("AUTH0_ISSUER_BASE_URL no está configurado.");
  }
  return issuer.replace(/\/$/, "");
}

function getAuth0ClientCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.AUTH0_CLIENT_ID?.trim();
  const clientSecret = process.env.AUTH0_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("AUTH0_CLIENT_ID o AUTH0_CLIENT_SECRET no están configurados.");
  }
  return { clientId, clientSecret };
}

/**
 * Intercambia el refresh token de Auth0 por un access token de Google (Token Vault / federated grant).
 */
export async function exchangeGoogleAccessToken(
  auth0RefreshToken: string
): Promise<TokenExchangeResponse> {
  const domain = getAuth0Domain();
  const { clientId, clientSecret } = getAuth0ClientCredentials();

  const response = await fetch(`${domain}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type:
        "urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token",
      client_id: clientId,
      client_secret: clientSecret,
      subject_token: auth0RefreshToken,
      subject_token_type: "urn:ietf:params:oauth:token-type:refresh_token",
      requested_token_type:
        "http://auth0.com/oauth/token-type/federated-connection-access-token",
      connection: GOOGLE_CONNECTION,
    }),
  });

  const text = await response.text();
  console.log(
    "[GoogleToken] exchange HTTP status:",
    response.status,
    "body:",
    text.slice(0, 500)
  );

  let data: TokenExchangeResponse & { error?: string; error_description?: string };

  try {
    data = JSON.parse(text) as TokenExchangeResponse & {
      error?: string;
      error_description?: string;
    };
  } catch {
    throw new Error(
      `Auth0 token exchange falló (${response.status}): respuesta no válida.`
    );
  }

  if (!response.ok || !data.access_token) {
    const detail = data.error_description ?? data.error ?? text;
    throw new Error(
      `No se pudo obtener token de Google vía Auth0 (${response.status}): ${detail}`
    );
  }

  return data;
}

async function getManagementApiToken(): Promise<string | null> {
  const m2mClientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID?.trim();
  const m2mClientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET?.trim();
  if (!m2mClientId || !m2mClientSecret) {
    return null;
  }

  const domain = getAuth0Domain();
  const response = await fetch(`${domain}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: m2mClientId,
      client_secret: m2mClientSecret,
      audience: `${domain}/api/v2/`,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { access_token?: string };
  return data.access_token ?? null;
}

/**
 * Lee tokens de la identidad google-oauth2 vía Management API (opcional).
 */
export async function fetchGoogleTokensFromManagementApi(
  userId: string
): Promise<GoogleTokensFromManagement | null> {
  const managementToken = await getManagementApiToken();
  if (!managementToken) {
    return null;
  }

  const domain = getAuth0Domain();
  const response = await fetch(
    `${domain}/api/v2/users/${encodeURIComponent(userId)}`,
    {
      headers: { Authorization: `Bearer ${managementToken}` },
    }
  );

  if (!response.ok) {
    return null;
  }

  const user = (await response.json()) as ManagementUser;
  const googleIdentity = user.identities?.find(
    (id) => id.provider === GOOGLE_CONNECTION
  );

  if (!googleIdentity) {
    return null;
  }

  return {
    accessToken: googleIdentity.access_token,
    refreshToken: googleIdentity.refresh_token,
    expiresIn: googleIdentity.expires_in,
  };
}

export function applyGoogleTokenToSession(
  session: { googleAccessToken?: string; googleAccessTokenExpiresAt?: number },
  accessToken: string,
  expiresIn: number
): void {
  session.googleAccessToken = accessToken;
  session.googleAccessTokenExpiresAt =
    Math.floor(Date.now() / 1000) + expiresIn;
}

export { GOOGLE_CONNECTION, GMAIL_READONLY_SCOPE };
