export interface EmailItem {
  id: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}
export interface TemaPrincipal {
  titulo: string;
  descripcion: string;
  cantidad: number;
}
export interface EmailUrgente {
  asunto: string;
  remitente: string;
  razon: string;
}
export interface RemitenteTop {
  nombre: string;
  email: string;
  cantidad: number;
}
export interface AnalysisEstadisticas {
  totalEmails: number;
  fechaMasActiva: string;
  promedioPerDia: number;
}
export interface AnalysisResult {
  resumenEjecutivo: string;
  temasPrincipales: TemaPrincipal[];
  emailsUrgentes: EmailUrgente[];
  remitentesTop: RemitenteTop[];
  patrones: string[];
  recomendaciones: string[];
  estadisticas: AnalysisEstadisticas;
}
export interface GmailApiResponse {
  emails: EmailItem[];
  total: number;
  error?: string;
  needsGoogleConnect?: boolean;
  connectUrl?: string;
}
export interface AnalyzeRequestBody {
  emails: EmailItem[];
  startDate: string;
  endDate: string;
  focus?: string;
  language?: string;
}
export interface AnalysisHistoryEntry {
  id: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  result: AnalysisResult;
  emailCount: number;
}