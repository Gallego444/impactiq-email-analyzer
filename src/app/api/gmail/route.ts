import { getSession, getAccessToken } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-response";
import { isValidDateString } from "@/lib/date-range";
import { fetchGmailMessages } from "@/lib/gmail";

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
      return apiJson({ error: "Formato de fecha inválido. Use YYYY-MM-DD." }, 400, sessionRes);
    }

    const { accessToken } = await getAccessToken(req, sessionRes);
    if (!accessToken) {
      return apiJson({ error: "No hay token de Google. Cierra sesión y vuelve a entrar." }, 401, sessionRes);
    }

    const { emails, total } = await fetchGmailMessages(accessToken, startDate, endDate);
    return apiJson({ emails, total }, 200, sessionRes);

  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };
    console.error("Gmail route error:", error);
    return apiJson({ error: err.message ?? "Error al obtener emails." }, 500, sessionRes);
  }
}