/** Campos extra en la sesión Auth0 v3 para el token de Google (Gmail). */
export interface GoogleTokenFields {
  googleAccessToken?: string;
  googleAccessTokenExpiresAt?: number;
  /** Refresh token de Google (OAuth directo, no Auth0). */
  googleRefreshToken?: string;
}

export type AppAuth0Session = GoogleTokenFields & {
  user: Record<string, unknown> & { sub?: string };
  idToken?: string;
  accessToken?: string;
  accessTokenScope?: string;
  accessTokenExpiresAt?: number;
  refreshToken?: string;
  [key: string]: unknown;
};

export function isGoogleTokenValid(session: GoogleTokenFields): boolean {
  if (!session.googleAccessToken || !session.googleAccessTokenExpiresAt) {
    return false;
  }
  const now = Math.floor(Date.now() / 1000);
  return session.googleAccessTokenExpiresAt > now + 60;
}
