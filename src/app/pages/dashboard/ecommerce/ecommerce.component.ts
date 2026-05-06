import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexXAxis,
  ApexPlotOptions, ApexDataLabels, ApexStroke, ApexGrid, ApexFill, ApexTooltip,
  ApexYAxis, ApexNonAxisChartSeries, ApexLegend, ApexResponsive } from 'ng-apexcharts';
import { forkJoin } from 'rxjs';
import { DashboardService, DashboardKPIs, DashboardChartData } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent implements OnInit {
  private dashService = inject(DashboardService);

  loading = signal(true);
  error   = signal<string | null>(null);
  kpis    = signal<DashboardKPIs | null>(null);

  // --- Gráfico: Agendamentos por dia (últimos 7 dias) ---
  semanaChart: ApexChart       = { type: 'bar', height: 220, toolbar: { show: false }, fontFamily: 'Outfit, sans-serif' };
  semanaPlot:  ApexPlotOptions = { bar: { horizontal: false, columnWidth: '45%', borderRadius: 4, borderRadiusApplication: 'end' } };
  semanaStroke: ApexStroke     = { show: true, width: 4, colors: ['transparent'] };
  semanaGrid:  ApexGrid        = { yaxis: { lines: { show: true } } };
  semanaFill:  ApexFill        = { opacity: 1 };
  semanaColors: string[]       = ['#465fff'];
  semanaDataLabels: ApexDataLabels = { enabled: false };
  semanaYAxis: ApexYAxis       = { labels: { formatter: (v: number) => v.toFixed(0) } };
  semanaTooltip: ApexTooltip   = { y: { formatter: (v: number) => `${v} agendamentos` } };
  semanaSeries  = signal<ApexAxisChartSeries>([{ name: 'Agendamentos', data: [] }]);
  semanaXAxis   = signal<ApexXAxis>({ categories: [], axisBorder: { show: false }, axisTicks: { show: false } });

  // --- Gráfico: Top procedimentos (donut) ---
  procedChart: ApexChart         = { type: 'donut', height: 220, fontFamily: 'Outfit, sans-serif' };
  procedDataLabels: ApexDataLabels = { enabled: true };
  procedLegend: ApexLegend       = { position: 'bottom', fontFamily: 'Outfit, sans-serif' };
  procedResponsive: ApexResponsive[] = [{ breakpoint: 480, options: { chart: { width: 200 } } }];
  procedColors: string[]         = ['#465fff','#22c55e','#f59e0b','#ef4444','#8b5cf6'];
  procedSeries  = signal<ApexNonAxisChartSeries>([]);
  procedLabels  = signal<string[]>([]);

  ngOnInit() {
    forkJoin({
      kpis:   this.dashService.getKPIs(),
      charts: this.dashService.getChartData(),
    }).subscribe({
      next: ({ kpis, charts }) => {
        this.kpis.set(kpis);
        this.applyChartData(charts);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os dados do dashboard.');
        this.loading.set(false);
      },
    });
  }

  private applyChartData(charts: DashboardChartData) {
    this.semanaSeries.set([{ name: 'Agendamentos', data: charts.semana.data }]);
    this.semanaXAxis.set({
      categories: charts.semana.labels,
      axisBorder: { show: false },
      axisTicks:  { show: false },
    });
    this.procedSeries.set(charts.procedimentos.data);
    this.procedLabels.set(charts.procedimentos.labels.length
      ? charts.procedimentos.labels
      : ['Sem dados']);
  }

  /** Variação percentual entre receita atual e anterior */
  receitaVar(kpis: DashboardKPIs): { pct: number; up: boolean } {
    if (!kpis.receitaMesAnterior) return { pct: 0, up: true };
    const pct = ((kpis.receitaMes - kpis.receitaMesAnterior) / kpis.receitaMesAnterior) * 100;
    return { pct: Math.abs(pct), up: pct >= 0 };
  }
}
