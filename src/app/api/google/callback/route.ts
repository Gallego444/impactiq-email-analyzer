import { getSession, updateSession } from "@auth0/nextjs-auth0";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { applyGoogleTokenToSession } from "@/lib/auth0-google-token";
import type { AppAuth0Session } from "@/lib/auth0-session";
import {
  exchangeGoogleAuthCode,
  GOOGLE_OAUTH_STATE_COOKIE,
} from "@/lib/google-oauth-direct";

export async function GET(req: NextRequest) {
  const returnTo = "/dashboard";
  const errorRedirect = (message: string) =>
    NextResponse.redirect(
      new URL(
        `${returnTo}?gmail_error=${encodeURIComponent(message)}`,
        req.url
      )
    );

  const sessionRes = new NextResponse();
  const session = (await getSession(req, sessionRes)) as AppAuth0Session | null;
  if (!session?.user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const params = req.nextUrl.searchParams;
  const error = params.get("error");
  if (error) {
    return errorRedirect(`Google rechazó la autorización: ${error}`);
  }

  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state) {
    return errorRedirect("Respuesta de Google incompleta.");
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(GOOGLE_OAUTH_STATE_COOKIE);

  if (!savedState || savedState !== state) {
    return errorRedirect("Estado OAuth inválido. Intenta conectar Gmail de nuevo.");
  }

  try {
    const tokens = await exchangeGoogleAuthCode(code);
    applyGoogleTokenToSession(session, tokens.access_token, tokens.expires_in);
    if (tokens.refresh_token) {
      session.googleRefreshToken = tokens.refresh_token;
    }
    await updateSession(req, sessionRes, session);

    const response = NextResponse.redirect(
      new URL(`${returnTo}?gmail_connected=1`, req.url)
    );
    sessionRes.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });
    return response;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al conectar Gmail.";
    return errorRedirect(message);
  }
}
