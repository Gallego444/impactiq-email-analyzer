import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-response";
import type { AppAuth0Session } from "@/lib/auth0-session";
import { isValidDateString } from "@/lib/date-range";
import { fetchGmailMessages } from "@/lib/gmail";
import {
  getGoogleAccessTokenFromSession,
  GoogleTokenError,
} from "@/lib/get-google-access-token";

export async function GET(req: NextRequest) {
  const sessionRes = new NextResponse();

  try {
    const session = (await getSession(req, sessionRes)) as AppAuth0Session | null;
    if (!session?.user) {
      return apiJson({ error: "No autenticado." }, 401, sessionRes);
    }

    const startDate = req.nextUrl.searchParams.get("startDate");
    const endDate = req.nextUrl.searchParams.get("endDate");

    if (!startDate || !endDate) {
      return apiJson(
        { error: "startDate y endDate son obligatorios (YYYY-MM-DD)." },
        400,
        sessionRes
      );
    }

    if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
      return apiJson(
        { error: "Formato de fecha inválido. Use YYYY-MM-DD." },
        400,
        sessionRes
      );
    }

    let googleAccessToken: string;

    try {
      googleAccessToken = await getGoogleAccessTokenFromSession(
        session,
        req,
        sessionRes
      );
    } catch (tokenError: unknown) {
      if (tokenError instanceof GoogleTokenError) {
        return apiJson(
          {
            error: tokenError.message,
            needsGoogleConnect: tokenError.needsGoogleConnect,
            connectUrl: tokenError.connectUrl,
          },
          tokenError.status,
          sessionRes
        );
      }
      throw tokenError;
    }

    const { emails, total } = await fetchGmailMessages(
      googleAccessToken,
      startDate,
      endDate
    );

    return apiJson({ emails, total }, 200, sessionRes);
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };

    console.error("Gmail route error:", error);

    if (err.code === 401) {
      return apiJson(
        {
          error:
            "Token de Google inválido o sin scope gmail.readonly. Cierra sesión y vuelve a iniciar sesión aceptando permisos de Gmail.",
        },
        401,
        sessionRes
      );
    }

    if (err.code === 403) {
      return apiJson(
        {
          error:
            "Sin permisos para leer Gmail. Verifica gmail.readonly en Auth0 (connection_scope) y en Google Cloud.",
        },
        403,
        sessionRes
      );
    }

    if (err.code === 429) {
      return apiJson(
        { error: "Límite de solicitudes de Gmail alcanzado. Intenta más tarde." },
        429,
        sessionRes
      );
    }

    return apiJson(
      {
        error:
          err.message ??
          "Error al obtener emails de Gmail. Revisa la configuración de la API.",
      },
      500,
      sessionRes
    );
  }
}
