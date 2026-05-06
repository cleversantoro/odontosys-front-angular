import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardKPIs {
  consultasHoje: number;
  agendamentosPendentes: number;
  totalPacientes: number;
  novosPacientesMes: number;
  receitaMes: number;
  receitaMesAnterior: number;
}

export interface DashboardChartData {
  semana: { labels: string[]; data: number[] };
  procedimentos: { labels: string[]; data: number[] };
}

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  /** Agrega KPIs a partir de múltiplos endpoints existentes. */
  getKPIs(): Observable<DashboardKPIs> {
    const hoje = new Date();
    const isoHoje = hoje.toISOString().split('T')[0];          // "YYYY-MM-DD"
    const meAtual = isoHoje.substring(0, 7);                   // "YYYY-MM"

    // Mês anterior
    const dtAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const meAnterior = dtAnterior.toISOString().substring(0, 7);

    return forkJoin({
      agendamentosHoje: this.http.get<any[]>(
        `${API}/api/agendamentos?inicio=${isoHoje}&fim=${isoHoje}`
      ),
      agendamentosTodos: this.http.get<any[]>(`${API}/api/agendamentos`),
      pacientes: this.http.get<any[]>(`${API}/api/pacientes`),
      pagamentos: this.http.get<any[]>(`${API}/api/pagamentos`),
    }).pipe(
      map(({ agendamentosHoje, agendamentosTodos, pacientes, pagamentos }) => {
        const pendentes = agendamentosTodos.filter(
          (a: any) => a.status === 'Agendado'
        );

        const novosPacientesMes = pacientes.filter(
          (p: any) => (p.createdAt ?? '').startsWith(meAtual)
        ).length;

        const receitaMes = pagamentos
          .filter((p: any) => (p.data ?? '').startsWith(meAtual))
          .reduce((sum: number, p: any) => sum + Number(p.valor), 0);

        const receitaMesAnterior = pagamentos
          .filter((p: any) => (p.data ?? '').startsWith(meAnterior))
          .reduce((sum: number, p: any) => sum + Number(p.valor), 0);

        return {
          consultasHoje: agendamentosHoje.length,
          agendamentosPendentes: pendentes.length,
          totalPacientes: pacientes.length,
          novosPacientesMes,
          receitaMes,
          receitaMesAnterior,
        } satisfies DashboardKPIs;
      })
    );
  }

  /** Dados para os gráficos: agendamentos dos últimos 7 dias + top procedimentos. */
  getChartData(): Observable<DashboardChartData> {
    const hoje = new Date();
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - 6);
    const isoInicio = inicio.toISOString().split('T')[0];
    const isoFim    = hoje.toISOString().split('T')[0];

    return this.http.get<any[]>(
      `${API}/api/agendamentos?inicio=${isoInicio}&fim=${isoFim}`
    ).pipe(
      map(agendamentos => {
        // --- Consultas por dia (últimos 7 dias) ---
        const semanaLabels: string[] = [];
        const semanaData: number[]   = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(hoje);
          d.setDate(hoje.getDate() - i);
          const iso   = d.toISOString().split('T')[0];
          const label = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`;
          semanaLabels.push(label);
          semanaData.push(
            agendamentos.filter((a: any) =>
              (a.data ?? a.dataHora ?? '').startsWith(iso)
            ).length
          );
        }

        // --- Top 5 procedimentos ---
        const countMap: Record<string, number> = {};
        agendamentos.forEach((a: any) => {
          const proc = a.tipoProcedimento?.trim() || 'Não especificado';
          countMap[proc] = (countMap[proc] ?? 0) + 1;
        });
        const topProc = Object.entries(countMap)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5);

        return {
          semana: { labels: semanaLabels, data: semanaData },
          procedimentos: {
            labels: topProc.map(([k]) => k),
            data:   topProc.map(([, v]) => v),
          },
        } satisfies DashboardChartData;
      })
    );
  }
}
