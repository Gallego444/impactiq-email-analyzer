"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { LogOut, Mail, Search } from "lucide-react";
import {
  DateRangePicker,
  isDateRangeValid,
} from "@/components/date-range-picker";
import { AnalysisResults } from "@/components/analysis-results";
import { AnalysisSkeleton } from "@/components/analysis-skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { saveAnalysisToHistory } from "@/lib/analysis-storage";
import { toIsoDateString } from "@/lib/date-range";
import { fetchJson } from "@/lib/fetch-json";
import type {
  AnalysisResult,
  GmailApiResponse,
} from "@/lib/types";
import { cn } from "@/lib/utils";

function getUserInitials(
  name: string | undefined | null,
  email: string | undefined | null
): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "??";
}

function DashboardContent() {
  const { user, isLoading: userLoading } = useUser();
  const searchParams = useSearchParams();
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [emailCount, setEmailCount] = useState(0);

  const rangeValid = isDateRangeValid(from, to);

  useEffect(() => {
    if (searchParams.get("gmail_connected") === "1") {
      setError(null);
    }
    const gmailError = searchParams.get("gmail_error");
    if (gmailError) {
      setError(decodeURIComponent(gmailError));
    }
  }, [searchParams]);

  const handleConnectGmail = () => {
    window.location.href = "/api/google/connect?returnTo=/dashboard";
  };

  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  const handleAnalyze = async () => {
    if (!from || !to || !rangeValid) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setShowResults(true);

    const startDate = toIsoDateString(from);
    const endDate = toIsoDateString(to);

    try {
      const { data: gmailData, response: gmailRes } = await fetchJson<
        GmailApiResponse & { error?: string }
      >(
        `/api/gmail?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
      );

      if (!gmailRes.ok) {
        if (gmailData.needsGoogleConnect && gmailData.connectUrl) {
          window.location.href = gmailData.connectUrl;
          return;
        }
        throw new Error(gmailData.error ?? "Error al obtener emails de Gmail.");
      }

      if (gmailData.total === 0) {
        throw new Error(
          "No se encontraron emails en el rango seleccionado. Prueba con otro período."
        );
      }

      setEmailCount(gmailData.total);

      const { data: analyzeData, response: analyzeRes } = await fetchJson<
        AnalysisResult & { error?: string }
      >("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails: gmailData.emails,
          startDate,
          endDate,
          language: "español",
        }),
      });

      if (!analyzeRes.ok) {
        throw new Error(analyzeData.error ?? "Error al analizar emails con IA.");
      }

      setResult(analyzeData);
      saveAnalysisToHistory({
        startDate,
        endDate,
        result: analyzeData,
        emailCount: gmailData.total,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ocurrió un error inesperado.";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  const displayName = user?.name ?? user?.nickname ?? "Usuario";
  const displayEmail = user?.email ?? "";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-950 via-blue-950 to-violet-950">
      <div className="particles" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="animate-fade-in mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-lg font-bold text-white shadow-lg shadow-violet-500/30">
              {getUserInitials(user?.name, user?.email)}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-white sm:text-xl">
                {displayName}
              </h1>
              <p className="truncate text-sm text-slate-400">{displayEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-slate-400 sm:flex">
              <Mail className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium">ImpactIQ Dashboard</span>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        </header>

        <Card className="animate-fade-in mb-8 border-white/10 bg-white/5 ring-white/10">
          <CardHeader>
            <CardTitle className="text-white">
              Selecciona el período a analizar
            </CardTitle>
            <CardDescription className="text-slate-400">
              Elige un rango de fechas (máximo 90 días) para analizar tus emails
              con inteligencia artificial.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DateRangePicker
              from={from}
              to={to}
              onFromChange={setFrom}
              onToChange={setTo}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={handleConnectGmail}
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
              >
                Conectar Gmail
              </Button>
              <Button
                type="button"
                disabled={!rangeValid || loading}
                onClick={handleAnalyze}
                className={cn(
                  "h-12 bg-gradient-to-r from-blue-600 to-violet-600 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-violet-500 hover:shadow-violet-500/40 disabled:opacity-50 sm:px-8"
                )}
              >
                <Search className="mr-2 h-5 w-5" />
                🔍 Analizar emails
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div
            className="animate-fade-in mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        {showResults && (
          <section className="animate-fade-in">
            {loading && <AnalysisSkeleton />}
            {!loading && result && (
              <AnalysisResults result={result} />
            )}
            {!loading && !result && !error && emailCount > 0 && (
              <p className="text-center text-slate-400">
                Procesando {emailCount} emails…
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}