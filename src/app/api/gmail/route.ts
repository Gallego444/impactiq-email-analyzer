import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-response";
import { isValidDateString } from "@/lib/date-range";
import { fetchGmailMessages } from "@/lib/gmail";

async function getGoogleTokenViaManagementApi(userId: string): Promise<string> {
  const domain = process.env.AUTH0_ISSUER_BASE_URL!.replace(/\/$/, "");
  const clientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID!;
  const clientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET!;

  const tokenRes = await fetch(`${domain}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience: `${domain}/api/v2/`,
    }),
  });

  const tokenData = await tokenRes.json() as { access_token?: string };
  if (!tokenData.access_token) throw new Error("No se pudo obtener token de Management API");

  const userRes = await fetch(`${domain}/api/v2/users/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const userData = await userRes.json() as { identities?: Array<{ provider: string; access_token?: string }> };
  const googleIdentity = userData.identities?.find(i => i.provider === "google-oauth2");

  if (!googleIdentity?.access_token) throw new Error("No hay token de Google en la identidad.");
  return googleIdentity.access_token;
}

export async function GET(req: NextRequest) {
  const sessionRes = new NextResponse();
  try {
    const session = await getSession(req, sessionRes);
    if (!session?.user) {
      return apiJson({ error: "No autenticado." }, 401, sessionRes);
    }

    const startDate = req.nextUrl.searchParams.get("startDate");
    const endDate = req.nextUrl.searchParams.get("endDate");

    if (!startDate || !endDate) {
      return apiJson({ error: "startDate y endDate son obligatorios." }, 400, sessionRes);
    }

    if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
      return apiJson({ error: "Formato de fecha inválido." }, 400, sessionRes);
    }

    const userId = session.user.sub as string;
    const googleToken = await getGoogleTokenViaManagementApi(userId);

    const { emails, total } = await fetchGmailMessages(googleToken, startDate, endDate);
    return apiJson({ emails, total }, 200, sessionRes);

  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Gmail route error:", err.message);
    return apiJson({ error: err.message ?? "Error al obtener emails." }, 500, sessionRes);
  }
}