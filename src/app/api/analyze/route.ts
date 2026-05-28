import Anthropic from "@anthropic-ai/sdk";
import { getSession } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";
import { apiJson, parseRequestJson } from "@/lib/api-response";
import type { AnalysisResult, AnalyzeRequestBody, EmailItem } from "@/lib/types";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

function buildPrompt(
  emails: EmailItem[],
  startDate: string,
  endDate: string,
  focus?: string,
  language?: string
): string {
  const emailList = emails
    .map(
      (e, i) =>
        `${i + 1}. Asunto: ${e.subject}\n   De: ${e.from}\n   Fecha: ${e.date}\n   Vista previa: ${e.snippet}`
    )
    .join("\n\n");

  const lang = language ?? "español";
  const focusLine = focus
    ? `\nEnfócate especialmente en: ${focus}`
    : "";

  return `Eres un analista experto de comunicación por email. Analiza los siguientes ${emails.length} emails del período ${startDate} al ${endDate}.
Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin texto adicional) con esta estructura exacta:
{
  "resumenEjecutivo": "string",
  "temasPrincipales": [{"titulo": "string", "descripcion": "string", "cantidad": number}],
  "emailsUrgentes": [{"asunto": "string", "remitente": "string", "razon": "string"}],
  "remitentesTop": [{"nombre": "string", "email": "string", "cantidad": number}],
  "patrones": ["string"],
  "recomendaciones": ["string"],
  "estadisticas": {
    "totalEmails": number,
    "fechaMasActiva": "string",
    "promedioPerDia": number
  }
}

Idioma de la respuesta: ${lang}.${focusLine}

Emails:
${emailList}`;
}

function parseAnalysisJson(text: string): AnalysisResult {
  const trimmed = text.trim();
  const jsonStart = trimmed.indexOf("{");
  const jsonEnd = trimmed.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("La respuesta de IA no contiene JSON válido.");
  }

  const jsonStr = trimmed.slice(jsonStart, jsonEnd + 1);

  let parsed: AnalysisResult;
  try {
    parsed = JSON.parse(jsonStr) as AnalysisResult;
  } catch {
    throw new Error("No se pudo parsear el JSON devuelto por la IA.");
  }

  if (
    typeof parsed.resumenEjecutivo !== "string" ||
    !Array.isArray(parsed.temasPrincipales) ||
    !Array.isArray(parsed.emailsUrgentes) ||
    !Array.isArray(parsed.remitentesTop) ||
    !Array.isArray(parsed.patrones) ||
    !Array.isArray(parsed.recomendaciones) ||
    !parsed.estadisticas
  ) {
    throw new Error("El JSON de análisis no tiene la estructura esperada.");
  }

  return parsed;
}

export async function POST(req: NextRequest) {
  const sessionRes = new NextResponse();

  try {
    const session = await getSession(req, sessionRes);
    if (!session?.user) {
      return apiJson({ error: "No autenticado." }, 401, sessionRes);
    }

    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

    if (!apiKey) {
      return apiJson(
        { error: "ANTHROPIC_API_KEY no está configurada en el servidor." },
        500,
        sessionRes
      );
    }

    const body = await parseRequestJson<AnalyzeRequestBody>(req);

    if (!body) {
      return apiJson(
        { error: "Cuerpo de solicitud JSON inválido o vacío." },
        400,
        sessionRes
      );
    }

    const { emails, startDate, endDate, focus, language } = body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return apiJson(
        { error: "Se requiere al menos un email para analizar." },
        400,
        sessionRes
      );
    }

    if (!startDate || !endDate) {
      return apiJson(
        { error: "startDate y endDate son obligatorios." },
        400,
        sessionRes
      );
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: buildPrompt(emails, startDate, endDate, focus, language),
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return apiJson(
        { error: "La IA no devolvió texto de análisis." },
        500,
        sessionRes
      );
    }

    const result = parseAnalysisJson(textBlock.text);
    return apiJson(result, 200, sessionRes);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Analyze route error:", error);

    const message =
      err.message?.includes("JSON") || err.message?.includes("json")
        ? err.message
        : err.message ?? "Error al analizar emails con IA.";

    return apiJson({ error: message }, 500, sessionRes);
  }
}