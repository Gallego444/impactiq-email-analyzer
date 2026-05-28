import { NextResponse } from "next/server";

export function mergeSessionCookies(
  response: NextResponse,
  sessionRes: NextResponse
): NextResponse {
  sessionRes.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });
  return response;
}

export function apiJson(
  data: unknown,
  status: number,
  sessionRes?: NextResponse
): NextResponse {
  const response = NextResponse.json(data, { status });
  if (sessionRes) {
    return mergeSessionCookies(response, sessionRes);
  }
  return response;
}

export async function parseRequestJson<T>(req: Request): Promise<T | null> {
  try {
    const text = await req.text();
    if (!text.trim()) {
      return null;
    }
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
