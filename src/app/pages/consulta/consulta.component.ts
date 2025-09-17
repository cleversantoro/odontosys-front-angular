// src/app/pages/consulta/consulta.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ConsultaService } from '../../core/services/consulta.service';
import { Consulta } from '../../core/models/consulta.model';
import { ConsultaCompleto } from '../../core/models/consultaCompleto.model';

@Component({
  selector: 'app-consulta',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './consulta.component.html',
  styleUrls: ['./consulta.component.css'],
})
export class ConsultaComponent implements OnInit {
  private service = inject(ConsultaService);

  // estado base
  loading = signal(true);
  error = signal<string | null>(null);
  consultas = signal<Consulta[]>([]);
  consultaCompleto = signal<ConsultaCompleto[]>([]);

  // filtros
  filtroPaciente = signal('');
  filtroProfissional = signal('');
  filtroStatus = signal('');

  // paginação
  pageSize = 10;
  paginaAtual = 1;

  // lista filtrada + ordenada
  private filtradas = computed(() => {
    const pac = this.filtroPaciente().trim().toLowerCase();
    const prof = this.filtroProfissional().trim().toLowerCase();
    const stat = this.filtroStatus().trim().toLowerCase();

    let data = this.consultaCompleto();

    if (pac) {
      data = data.filter(c =>
        (c.nome_paciente || '').toLowerCase().includes(pac) ||
        (c.codigo || '').toLowerCase().includes(pac)
      );
    }

    if (prof) {
      data = data.filter(c =>
        (c.nome_profissional || '').toLowerCase().includes(prof)
      );
    }

    if (stat) {
      // compara status do Agendamento primeiro; fallback para status da Consulta
      data = data.filter(c =>
        ((c.situacao || '') as string).toLowerCase() === stat
      );
    }

    // ordena por data (Agendamento.data se existir; senão Consulta.dataHora), desc
    return [...data].sort((a ) => {
      const da = new Date(a.data_agendamento || a.hora).getTime();
      return da;
    });
  });

  // total de páginas (getter para usar no template sem parênteses)
  get totalPaginas(): number {
    const total = this.filtradas().length;
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  // fatia paginada (usada no template via método)
  consultasPaginadas(): ConsultaCompleto[] {
    // corrige página fora do intervalo quando filtros mudam
    if (this.paginaAtual > this.totalPaginas) this.paginaAtual = this.totalPaginas;
    if (this.paginaAtual < 1) this.paginaAtual = 1;

    const start = (this.paginaAtual - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filtradas().slice(start, end);
  }

  // ciclo de vida
  ngOnInit(): void {
    this.service.listarCompleto().subscribe({
      next: (lista) => {
        this.consultaCompleto.set(lista ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Erro ao carregar consultas.');
        this.loading.set(false);
      },
    });
  }

  // ===== Handlers dos filtros =====
  onFiltroPaciente(valor: string) {
    this.filtroPaciente.set(valor);
    this.paginaAtual = 1;
  }

  onFiltroProfissional(valor: string) {
    this.filtroProfissional.set(valor);
    this.paginaAtual = 1;
  }

  onFiltroStatus(valor: string) {
    this.filtroStatus.set(valor);
    this.paginaAtual = 1;
  }

  // ===== Paginação =====
  anterior() {
    if (this.paginaAtual > 1) this.paginaAtual--;
  }

  proxima() {
    if (this.paginaAtual < this.totalPaginas) this.paginaAtual++;
  }

  // ===== Utilidades de data/hora/idade =====
  formatarDataBR(iso?: string | null): string {
    if (!iso) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [y, m, d] = iso.split('-').map(Number);
      const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
      return isNaN(dt.getTime()) ? String(iso) : dt.toLocaleDateString('pt-BR');
    }
    const dt = new Date(iso);
    return isNaN(dt.getTime()) ? String(iso) : dt.toLocaleDateString('pt-BR');
  }

  formatarHoraBR(iso?: string | null): string {
    if (!iso) return '';
    const dt = new Date(iso);
    return isNaN(dt.getTime())
      ? ''
      : dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  idadeDe(iso?: string | null): number | string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    const hoje = new Date();
    let idade = hoje.getFullYear() - d.getFullYear();
    const m = hoje.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < d.getDate())) idade--;
    return idade;
  }

  // ===== Ações (stubs prontos pra ligar) =====
  editar(c: ConsultaCompleto) {
    console.log('Editar consulta', c.id, c);
    // TODO: navegar para rota de edição (ex.: this.router.navigate(['/consultas', c.id, 'editar']))
  }

  excluir(c: ConsultaCompleto) {
    const ok = confirm(`Confirma excluir a consulta #${c.id}?`);
    if (!ok) return;
    console.log('Excluir consulta', c.id);
    // TODO: chamar service de exclusão; depois refazer a listagem
    // this.service.excluir(c.id).subscribe(() => this.recarregar());
  }

  exportarExcel() {
    console.log('Exportar Excel com', this.filtradas().length, 'registros');
    // TODO: implementar export real (xlsx/csv). Dica: SheetJS (xlsx) no front ou endpoint no back.
  }

  exportarPDF() {
    console.log('Exportar PDF com', this.filtradas().length, 'registros');
    // TODO: implementar export real (ex.: jsPDF/autoTable) ou gerar servidor-side.
  }

  novaConsulta() {
    console.log('Nova consulta');
    // TODO: navegar para rota de criação (ex.: this.router.navigate(['/consultas/nova']))
  }

  // (opcional) se quiser recarregar após excluir/editar:
  private recarregar() {
    this.loading.set(true);
    this.service.listar().subscribe({
      next: (lista) => { this.consultas.set(lista ?? []); this.loading.set(false); },
      error: (err) => { this.error.set(err?.message ?? 'Erro ao recarregar.'); this.loading.set(false); }
    });
  }
}
