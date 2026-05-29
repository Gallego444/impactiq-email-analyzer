import { getAccessToken } from "@auth0/nextjs-auth0";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function getGoogleAccessTokenFromSession(
  req: NextRequest,
  sessionRes: NextResponse
): Promise<string> {
  try {
    const { accessToken } = await getAccessToken(req, sessionRes);
    if (!accessToken) {
      throw new Error("No hay token de Google. Cierra sesión y vuelve a entrar.");
    }
    return accessToken;
  } catch {
    throw new Error("No hay token de Google. Cierra sesión y vuelve a entrar.");
  }
}