"use client";

import { Mail } from "lucide-react";
import { POST_LOGIN_REDIRECT } from "@/lib/auth0-login";

function GoogleIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const features = [
  { icon: "📧", label: "Lectura de Gmail" },
  { icon: "🤖", label: "Análisis con IA" },
  { icon: "📊", label: "Resumen inteligente" },
] as const;

export function LoginPage() {
  const handleLogin = () => {
    const returnTo = encodeURIComponent(POST_LOGIN_REDIRECT);
    window.location.href = `/api/auth/login?returnTo=${returnTo}`;
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-blue-950 to-violet-950 px-4 py-12 sm:px-6">
      <div className="particles" aria-hidden="true" />

      <main className="animate-fade-in relative z-10 mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-violet-500/30 sm:h-24 sm:w-24">
          <Mail className="h-10 w-10 text-white sm:h-12 sm:w-12" strokeWidth={1.5} />
        </div>

        <h1 className="mb-3 bg-gradient-to-r from-blue-200 via-white to-violet-200 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl md:text-5xl">
          ImpactIQ Mail Analyzer
        </h1>

        <p className="mb-4 text-lg font-medium text-blue-100/90 sm:text-xl">
          Analiza tus emails con inteligencia artificial
        </p>

        <p className="mb-10 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
          Conecta tu Gmail y obtén resúmenes automáticos, detección de prioridades
          y análisis inteligente de cada conversación.
        </p>

        <ul className="mb-10 flex w-full max-w-sm flex-col gap-4 sm:max-w-none sm:flex-row sm:justify-center sm:gap-8">
          {features.map((feature) => (
            <li
              key={feature.label}
              className="flex items-center justify-center gap-2 text-sm text-slate-300 sm:flex-col sm:gap-1.5"
            >
              <span className="text-2xl" role="img" aria-hidden="true">
                {feature.icon}
              </span>
              <span>{feature.label}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={handleLogin}
          className="group flex w-full max-w-sm items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:from-blue-500 hover:to-violet-500 hover:shadow-xl hover:shadow-violet-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 sm:max-w-md"
        >
          <GoogleIcon />
          Iniciar sesión con Google
        </button>

        <p className="mt-8 text-xs text-slate-500 sm:text-sm">
          Tus emails son privados y seguros
        </p>
      </main>
    </div>
  );
}
