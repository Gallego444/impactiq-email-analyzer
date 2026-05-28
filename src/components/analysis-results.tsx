"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Check,
  Copy,
  Lightbulb,
  Mail,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AnalysisResult } from "@/lib/types";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatAnalysisForClipboard(result: AnalysisResult): string {
  const lines = [
    "=== IMPACTIQ MAIL ANALYZER ===",
    "",
    "RESUMEN EJECUTIVO",
    result.resumenEjecutivo,
    "",
    "TEMAS PRINCIPALES",
    ...result.temasPrincipales.map(
      (t) => `- ${t.titulo} (${t.cantidad}): ${t.descripcion}`
    ),
    "",
    "EMAILS URGENTES",
    ...result.emailsUrgentes.map(
      (e) => `- ${e.asunto} | ${e.remitente}: ${e.razon}`
    ),
    "",
    "TOP REMITENTES",
    ...result.remitentesTop.map(
      (r) => `- ${r.nombre} <${r.email}>: ${r.cantidad} emails`
    ),
    "",
    "PATRONES",
    ...result.patrones.map((p) => `- ${p}`),
    "",
    "RECOMENDACIONES",
    ...result.recomendaciones.map((r, i) => `${i + 1}. ${r}`),
    "",
    "ESTADÍSTICAS",
    `Total: ${result.estadisticas.totalEmails}`,
    `Fecha más activa: ${result.estadisticas.fechaMasActiva}`,
    `Promedio/día: ${result.estadisticas.promedioPerDia}`,
  ];
  return lines.join("\n");
}

export interface AnalysisResultsProps {
  result: AnalysisResult;
  className?: string;
}

export function AnalysisResults({ result, className }: AnalysisResultsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatAnalysisForClipboard(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={cn("animate-slide-up space-y-6", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-white">Resultados del análisis</h2>
        <Button
          type="button"
          variant="outline"
          onClick={handleCopy}
          className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-emerald-400" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copiar análisis
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="border-white/10 bg-white/5 ring-white/10">
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {result.estadisticas.totalEmails}
              </p>
              <p className="text-xs text-slate-400">Total emails</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 ring-white/10">
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20">
              <TrendingUp className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {result.estadisticas.fechaMasActiva}
              </p>
              <p className="text-xs text-slate-400">Fecha más activa</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/5 ring-white/10">
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {result.estadisticas.promedioPerDia}
              </p>
              <p className="text-xs text-slate-400">Promedio / día</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-in border-blue-500/20 bg-gradient-to-br from-blue-950/50 to-violet-950/50 ring-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <Sparkles className="h-5 w-5 text-violet-400" />
            Resumen Ejecutivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-slate-300">
            {result.resumenEjecutivo}
          </p>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Mail className="h-5 w-5 text-blue-400" />
          Temas Principales
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.temasPrincipales.map((tema) => (
            <Card
              key={tema.titulo}
              className="animate-fade-in border-white/10 bg-white/5 ring-white/10"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base text-white">
                    {tema.titulo}
                  </CardTitle>
                  <Badge className="shrink-0 bg-violet-600/80 hover:bg-violet-600/80">
                    {tema.cantidad}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-400">
                  {tema.descripcion}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="animate-fade-in border-red-500/20 bg-red-950/20 ring-red-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Emails Urgentes
            {result.emailsUrgentes.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {result.emailsUrgentes.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.emailsUrgentes.length === 0 ? (
            <p className="text-sm text-slate-400">
              No se detectaron emails urgentes en este período.
            </p>
          ) : (
            result.emailsUrgentes.map((email) => (
              <div
                key={`${email.asunto}-${email.remitente}`}
                className="rounded-lg border border-red-500/20 bg-red-500/5 p-4"
              >
                <p className="font-medium text-white">{email.asunto}</p>
                <p className="mt-1 text-sm text-slate-400">{email.remitente}</p>
                <p className="mt-2 text-sm text-red-200/90">{email.razon}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="animate-fade-in border-white/10 bg-white/5 ring-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <Users className="h-5 w-5 text-blue-400" />
            Top Remitentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.remitentesTop.map((remitente) => (
            <div
              key={remitente.email}
              className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-semibold text-white">
                {getInitials(remitente.nombre)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">
                  {remitente.nombre}
                </p>
                <p className="truncate text-sm text-slate-400">
                  {remitente.email}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0">
                {remitente.cantidad}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="animate-fade-in border-white/10 bg-white/5 ring-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <TrendingUp className="h-5 w-5 text-violet-400" />
              Patrones Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.patrones.map((patron) => (
                <li
                  key={patron}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <span className="mt-0.5 text-violet-400" aria-hidden>
                    ◆
                  </span>
                  {patron}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="animate-fade-in border-white/10 bg-white/5 ring-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-white">
              <Lightbulb className="h-5 w-5 text-amber-400" />
              Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {result.recomendaciones.map((rec, index) => (
                <li
                  key={rec}
                  className="flex gap-3 text-sm text-slate-300"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-xs font-semibold text-violet-300">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{rec}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
