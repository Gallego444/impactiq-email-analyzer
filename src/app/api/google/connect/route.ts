import { getSession } from "@auth0/nextjs-auth0";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  buildGoogleAuthorizeUrl,
  getGoogleOAuthConfig,
  GOOGLE_OAUTH_STATE_COOKIE,
} from "@/lib/google-oauth-direct";

export async function GET(req: NextRequest) {
  const session = await getSession(req, new NextResponse());
  if (!session?.user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const config = getGoogleOAuthConfig();
  if (!config) {
    const returnTo = req.nextUrl.searchParams.get("returnTo") ?? "/dashboard";
    return NextResponse.redirect(
      new URL(
        `${returnTo}?gmail_error=${encodeURIComponent("Faltan GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env.local")}`,
        req.url
      )
    );
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const authorizeUrl = buildGoogleAuthorizeUrl(state);
  return NextResponse.redirect(authorizeUrl);
}
