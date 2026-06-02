import {
  handleAuth,
  handleLogin,
} from "@auth0/nextjs-auth0";
import type { NextRequest } from "next/server";
import { POST_LOGIN_REDIRECT } from "@/lib/auth0-login";

const LOGIN_AUTHORIZATION_PARAMS = {
  connection: "google-oauth2",
  scope: "openid profile email offline_access",
  connection_scope: "https://www.googleapis.com/auth/gmail.readonly",
  access_type: "offline",
  prompt: "consent",
} as const;

const authHandler = handleAuth({
  login: handleLogin({
    returnTo: POST_LOGIN_REDIRECT,
    authorizationParams: LOGIN_AUTHORIZATION_PARAMS,
  }),
});

type AuthRouteContext = {
  params: Promise<{ auth0: string }>;
};

async function handleAuthRoute(
  req: NextRequest,
  context: AuthRouteContext
): Promise<Response> {
  const params = await context.params;
  return authHandler(req, { params }) as Promise<Response>;
}

export const GET = handleAuthRoute;
export const POST = handleAuthRoute;