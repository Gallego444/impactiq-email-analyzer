export async function fetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<{ data: T; response: Response }> {
  const response = await fetch(url, init);
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(
      `El servidor respondió vacío (${response.status}). Reinicia el servidor de desarrollo e inténtalo de nuevo.`
    );
  }

  let data: T;
  try {
    data = JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Respuesta inválida del servidor (${response.status}). Revisa la consola del terminal.`
    );
  }

  return { data, response };
}
