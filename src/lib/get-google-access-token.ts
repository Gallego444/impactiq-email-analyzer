import { updateSession } from "@auth0/nextjs-auth0";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  applyGoogleTokenToSession,
  fetchGoogleTokensFromManagementApi,
} from "@/lib/auth0-google-token";
import {
  type AppAuth0Session,
  isGoogleTokenValid,
} from "@/lib/auth0-session";
import {
  getGoogleOAuthConfig,
  refreshGoogleAccessToken,
} from "@/lib/google-oauth-direct";

const LOG_PREFIX = "[GoogleToken]";

export const GOOGLE_CONNECT_PATH = "/api/google/connect?returnTo=/dashboard";

export class GoogleTokenError extends Error {
  constructor(
    message: string,
    public readonly status: number = 401,
    public readonly needsGoogleConnect: boolean = false,
    public readonly connectUrl: string = GOOGLE_CONNECT_PATH
  ) {
    super(message);
    this.name = "GoogleTokenError";
  }
}

/**
 * Obtiene un access token de Google válido para Gmail API.
 * Prioridad: caché sesión → refresh Google directo → Management API → error con enlace connect.
 */
export async function getGoogleAccessTokenFromSession(
  session: AppAuth0Session,
  req: NextRequest,
  sessionRes: NextResponse
): Promise<string> {
  if (isGoogleTokenValid(session) && session.googleAccessToken) {
    return session.googleAccessToken;
  }

  if (session.googleRefreshToken) {
    try {
      const refreshed = await refreshGoogleAccessToken(session.googleRefreshToken);
      applyGoogleTokenToSession(
        session,
        refreshed.access_token,
        refreshed.expires_in
      );
      if (refreshed.refresh_token) {
        session.googleRefreshToken = refreshed.refresh_token;
      }
      await updateSession(req, sessionRes, session);
      return refreshed.access_token;
    } catch (refreshError) {
      console.error(`${LOG_PREFIX} Refresh Google directo falló:`, refreshError);
    }
  }

  const userId = session.user?.sub;
  if (typeof userId === "string") {
    try {
      const fromMgmt = await fetchGoogleTokensFromManagementApi(userId);
      if (fromMgmt?.accessToken) {
        applyGoogleTokenToSession(
          session,
          fromMgmt.accessToken,
          fromMgmt.expiresIn ?? 3600
        );
        if (fromMgmt.refreshToken) {
          session.googleRefreshToken = fromMgmt.refreshToken;
        }
        await updateSession(req, sessionRes, session);
        return fromMgmt.accessToken;
      }
      if (fromMgmt?.refreshToken) {
        const refreshed = await refreshGoogleAccessToken(fromMgmt.refreshToken);
        applyGoogleTokenToSession(
          session,
          refreshed.access_token,
          refreshed.expires_in
        );
        session.googleRefreshToken =
          refreshed.refresh_token ?? fromMgmt.refreshToken;
        await updateSession(req, sessionRes, session);
        return refreshed.access_token;
      }
    } catch (mgmtError) {
      console.error(`${LOG_PREFIX} Management API falló:`, mgmtError);
    }
  }

  const hasGoogleOAuth = Boolean(getGoogleOAuthConfig());

  throw new GoogleTokenError(
    hasGoogleOAuth
      ? "Gmail no está conectado. Serás redirigido para autorizar el acceso a tu correo."
      : "Configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env.local (credenciales OAuth de Google Cloud, las mismas que usa Auth0).",
    401,
    hasGoogleOAuth,
    GOOGLE_CONNECT_PATH
  );
}
