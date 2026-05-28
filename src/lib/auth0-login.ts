/** Ruta de destino tras login exitoso (callback Auth0). */
export const POST_LOGIN_REDIRECT = "/dashboard";

/** Scopes solicitados a Auth0 (incluye refresh token de Auth0). */
export const AUTH0_LOGIN_SCOPE =
  "openid profile email offline_access";

/** Scopes adicionales enviados al proveedor Google. */
export const GOOGLE_CONNECTION_SCOPE =
  "https://www.googleapis.com/auth/gmail.readonly";

/** Parámetros de autorización para login con Google + Gmail (usados también en route.ts). */
export const googleLoginAuthorizationParams = {
  connection: "google-oauth2",
  scope: AUTH0_LOGIN_SCOPE,
  connection_scope: GOOGLE_CONNECTION_SCOPE,
  access_type: "offline" as const,
  prompt: "consent" as const,
};
