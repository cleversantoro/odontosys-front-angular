import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RelatoriosService, RelatorioData } from '../../core/services/relatorios.service';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

type Aba = 'pacientes' | 'consultas' | 'financeiro';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent],
  templateUrl: './relatorios.component.html',
})
export class RelatoriosComponent implements OnInit {
  private service = inject(RelatoriosService);

  loading = signal(true);
  error   = signal<string | null>(null);
  aba     = signal<Aba>('pacientes');

  // Raw data
  private raw = signal<RelatorioData | null>(null);

  // ── Filtros Pacientes ──────────────────────────────────
  filtPacDataInicio = signal('');
  filtPacDataFim    = signal('');
  filtPacConvenio   = signal('');

  // ── Filtros Consultas ──────────────────────────────────
  filtConDataInicio   = signal('');
  filtConDataFim      = signal('');
  filtConProfissional = signal('');
  filtConStatus       = signal('');

  // ── Filtros Financeiro ─────────────────────────────────
  filtFinMes  = signal(new Date().toISOString().slice(0, 7));
  filtFinTipo = signal<'todos' | 'receita' | 'despesa'>('todos');

  statusOptions = ['Agendado', 'Confirmado', 'Cancelado', 'Realizado'];
  tabs: { id: Aba; label: string }[] = [
    { id: 'pacientes', label: 'Pacientes' },
    { id: 'consultas', label: 'Consultas' },
    { id: 'financeiro', label: 'Financeiro' },
  ];

  // ── Derived lists ─────────────────────────────────────
  convenios = computed(() => this.raw()?.convenios ?? []);
  profissionais = computed(() => this.raw()?.profissionais ?? []);

  pacientesRows = computed(() => {
    const r = this.raw();
    if (!r) return [];
    return r.pacientes.filter(p => {
      const dt = (p.createdAt ?? '').slice(0, 10);
      if (this.filtPacDataInicio() && dt < this.filtPacDataInicio()) return false;
      if (this.filtPacDataFim()    && dt > this.filtPacDataFim())    return false;
      if (this.filtPacConvenio()) {
        const conv = (p.convenioNome ?? p.convenio ?? '').toLowerCase();
        if (!conv.includes(this.filtPacConvenio().toLowerCase())) return false;
      }
      return true;
    });
  });

  consultasRows = computed(() => {
    const r = this.raw();
    if (!r) return [];
    return r.agendamentos.filter(a => {
      const dt = (a.data ?? '').slice(0, 10);
      if (this.filtConDataInicio() && dt < this.filtConDataInicio()) return false;
      if (this.filtConDataFim()    && dt > this.filtConDataFim())    return false;
      if (this.filtConStatus() && a.status !== this.filtConStatus()) return false;
      if (this.filtConProfissional()) {
        const prof = String(a.profissionalId ?? '');
        if (prof !== this.filtConProfissional()) return false;
      }
      return true;
    });
  });

  financeiroRows = computed(() => {
    const r = this.raw();
    if (!r) return [];
    const mes = this.filtFinMes();
    const tipo = this.filtFinTipo();
    const receitas = tipo !== 'despesa'
      ? r.receitas
          .filter(p => (p.data ?? '').startsWith(mes))
          .map(p => ({
            id: p.id ?? 0,
            tipo: 'receita' as const,
            descricao: p.paciente?.nome ?? `Paciente #${p.pacienteId}`,
            valor: Number(p.valor),
            data: (p.data ?? '').slice(0, 10),
            categoria: p.tipoPagamento,
          }))
      : [];
    const despesas = tipo !== 'receita'
      ? r.despesas
          .filter(d => (d.data ?? '').startsWith(mes))
          .map(d => ({
            id: d.id ?? 0,
            tipo: 'despesa' as const,
            descricao: d.descricao,
            valor: Number(d.valor),
            data: (d.data ?? '').slice(0, 10),
            categoria: d.categoria,
          }))
      : [];
    return [...receitas, ...despesas].sort((a, b) => a.data.localeCompare(b.data));
  });

  totalReceitas = computed(() =>
    this.financeiroRows().filter(r => r.tipo === 'receita').reduce((s, r) => s + r.valor, 0)
  );
  totalDespesas = computed(() =>
    this.financeiroRows().filter(r => r.tipo === 'despesa').reduce((s, r) => s + r.valor, 0)
  );
  saldo = computed(() => this.totalReceitas() - this.totalDespesas());

  ngOnInit() {
    this.service.loadAll().subscribe({
      next: data => {
        this.raw.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Falha ao carregar dados para relatórios.');
        this.loading.set(false);
      },
    });
  }

  // ── Utilitários ───────────────────────────────────────
  profNome(profissionalId: number): string {
    const p = this.profissionais().find((p: any) => p.id === profissionalId);
    return p?.nome ?? `#${profissionalId}`;
  }

  // ── Exportação PDF ─────────────────────────────────────
  async exportPDF() {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape' });

    const title = this.reportTitle();
    doc.setFontSize(14);
    doc.text(title, 14, 16);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22);

    const { head, body } = this.tableData();
    autoTable(doc, { head: [head], body, startY: 28, styles: { fontSize: 8 } });

    doc.save(`${this.aba()}-${new Date().toISOString().slice(0,10)}.pdf`);
  }

  // ── Exportação Excel ───────────────────────────────────
  async exportExcel() {
    const XLSX = await import('xlsx');
    const { head, body } = this.tableData();
    const wsData = [head, ...body];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, this.aba());
    XLSX.writeFile(wb, `${this.aba()}-${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  private reportTitle(): string {
    const map: Record<Aba, string> = {
      pacientes: 'Relatório de Pacientes',
      consultas: 'Relatório de Consultas',
      financeiro: 'Relatório Financeiro',
    };
    return map[this.aba()];
  }

  private tableData(): { head: string[]; body: (string | number)[][] } {
    switch (this.aba()) {
      case 'pacientes':
        return {
          head: ['ID', 'Nome', 'E-mail', 'Data Nasc.', 'Convênio', 'Cadastro'],
          body: this.pacientesRows().map(p => [
            p.id ?? '',
            p.nome ?? '',
            p.email ?? '',
            (p.dataNascimento ?? '').slice(0, 10),
            p.convenioNome ?? p.convenio ?? '',
            (p.createdAt ?? '').slice(0, 10),
          ]),
        };
      case 'consultas':
        return {
          head: ['ID', 'Data', 'Paciente', 'Profissional', 'Procedimento', 'Status', 'Convênio'],
          body: this.consultasRows().map(a => [
            a.id ?? '',
            (a.data ?? '').slice(0, 10),
            a.Pacientes?.nome ?? `#${a.pacienteId}`,
            a.Profissionais?.nome ?? this.profNome(a.profissionalId),
            a.tipoProcedimento ?? '',
            a.status ?? '',
            a.Convenios?.nome ?? '',
          ]),
        };
      case 'financeiro':
        return {
          head: ['ID', 'Tipo', 'Descrição', 'Categoria', 'Data', 'Valor (R$)'],
          body: this.financeiroRows().map(r => [
            r.id,
            r.tipo === 'receita' ? 'Receita' : 'Despesa',
            r.descricao,
            r.categoria,
            r.data,
            r.valor.toFixed(2),
          ]),
        };
    }
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Agendado:  'bg-blue-100 text-blue-700',
      Confirmado:'bg-green-100 text-green-700',
      Cancelado: 'bg-red-100 text-red-700',
      Realizado: 'bg-yellow-100 text-yellow-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
  }
}
