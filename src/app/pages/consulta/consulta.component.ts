// src/app/pages/consulta/consulta.component.ts
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ConsultaService } from '../../core/services/consulta.service';
import { PacientesService } from '../../core/services/paciente.service';
import { ProfissionalService } from '../../core/services/profissional.service';
import { ConvenioService } from '../../core/services/convenio.service';
import { Consulta } from '../../core/models/consulta.model';
import { ConsultaCompleto } from '../../core/models/consultaCompleto.model';
import { Paciente } from '../../core/models/paciente.model';
import { Profissional } from '../../core/models/profissional.model';
import { Convenio } from '../../core/models/convenio.model';

@Component({
  selector: 'app-consulta',
  standalone: true,
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent],
  templateUrl: './consulta.component.html',
  styleUrls: ['./consulta.component.css'],
})
export class ConsultaComponent implements OnInit {
  private service            = inject(ConsultaService);
  private pacientesService   = inject(PacientesService);
  private profissionalService = inject(ProfissionalService);
  private convenioService    = inject(ConvenioService);

  // ---- estado base ----
  loading  = signal(true);
  error    = signal<string | null>(null);
  consultas = signal<Consulta[]>([]);
  consultaCompleto = signal<ConsultaCompleto[]>([]);

  // ---- dados de referÃªncia para selects do modal ----
  pacientes:    Paciente[]    = [];
  profissionais: Profissional[] = [];
  convenios:    Convenio[]    = [];

  // ---- filtros ----
  filtroPaciente     = signal('');
  filtroProfissional = signal('');
  filtroStatus       = signal('');

  // ---- paginaÃ§Ã£o ----
  pageSize    = 10;
  paginaAtual = 1;

  // ---- modal / formulÃ¡rio ----
  isModalOpen      = signal(false);
  isDeleteModalOpen = signal(false);
  saving   = signal(false);
  deleting = signal(false);
  selectedId       = signal<number | null>(null);
  selectedConsulta = signal<ConsultaCompleto | null>(null);

  statusOptions: Consulta['status'][] = ['Aberta', 'Finalizada'];

  form: {
    pacienteId:     number | null;
    profissionalId: number | null;
    convenioId:     number | null;
    dataHora:       string;
    status:         Consulta['status'];
    anamnese:       string;
    diagnostico:    string;
    prescricao:     string;
    procedimentos:  string;
    valorCobrado:   number | null;
    observacoes:    string;
  } = this.emptyForm();

  // ---- lista filtrada + ordenada (BUG CORRIGIDO: retorna db - da) ----
  filtradas = computed(() => {
    const pac  = this.filtroPaciente().trim().toLowerCase();
    const prof = this.filtroProfissional().trim().toLowerCase();
    const stat = this.filtroStatus().trim().toLowerCase();

    let data = this.consultaCompleto();

    if (pac)  data = data.filter(c =>
      (c.nome_paciente || '').toLowerCase().includes(pac) ||
      (c.codigo        || '').toLowerCase().includes(pac));

    if (prof) data = data.filter(c =>
      (c.nome_profissional || '').toLowerCase().includes(prof));

    if (stat) data = data.filter(c =>
      ((c.situacao || '') as string).toLowerCase() === stat);

    return [...data].sort((a, b) => {
      const da = new Date(a.data_agendamento || a.hora).getTime();
      const db = new Date(b.data_agendamento || b.hora).getTime();
      return db - da;   // decrescente
    });
  });

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.filtradas().length / this.pageSize));
  }

  consultasPaginadas(): ConsultaCompleto[] {
    if (this.paginaAtual > this.totalPaginas) this.paginaAtual = this.totalPaginas;
    if (this.paginaAtual < 1)                this.paginaAtual = 1;
    const start = (this.paginaAtual - 1) * this.pageSize;
    return this.filtradas().slice(start, start + this.pageSize);
  }

  // ---- ciclo de vida ----
  ngOnInit(): void {
    this.load();
    forkJoin({
      pacientes:    this.pacientesService.list(),
      profissionais: this.profissionalService.list(),
      convenios:    this.convenioService.list(),
    }).subscribe({
      next: ({ pacientes, profissionais, convenios }) => {
        this.pacientes    = pacientes;
        this.profissionais = profissionais;
        this.convenios    = convenios;
      }
    });
  }

  private load() {
    this.loading.set(true);
    this.error.set(null);
    this.service.listarCompleto().subscribe({
      next:  (lista) => { this.consultaCompleto.set(lista ?? []); this.loading.set(false); },
      error: (err)   => { this.error.set(err?.message ?? 'Erro ao carregar consultas.'); this.loading.set(false); },
    });
  }

  // ---- filtros ----
  onFiltroPaciente(v: string)     { this.filtroPaciente.set(v);     this.paginaAtual = 1; }
  onFiltroProfissional(v: string) { this.filtroProfissional.set(v); this.paginaAtual = 1; }
  onFiltroStatus(v: string)       { this.filtroStatus.set(v);       this.paginaAtual = 1; }

  // ---- paginaÃ§Ã£o ----
  anterior() { if (this.paginaAtual > 1)                this.paginaAtual--; }
  proxima()  { if (this.paginaAtual < this.totalPaginas) this.paginaAtual++; }

  // ---- CRUD ----
  novaConsulta() {
    this.form = this.emptyForm();
    this.selectedId.set(null);
    this.selectedConsulta.set(null);
    this.isModalOpen.set(true);
  }

  editar(c: ConsultaCompleto) {
    this.selectedId.set(c.id);
    this.selectedConsulta.set(c);
    this.form = {
      pacienteId:     c.pacienteId,
      profissionalId: c.profissionalId,
      convenioId:     c.convenioId ?? null,
      dataHora:       c.data_agendamento ? c.data_agendamento.substring(0, 16) : '',
      status:         (c.situacao === 'Finalizada' ? 'Finalizada' : 'Aberta') as Consulta['status'],
      anamnese:       '',
      diagnostico:    '',
      prescricao:     '',
      procedimentos:  '',
      valorCobrado:   null,
      observacoes:    c.obs ?? '',
    };
    this.isModalOpen.set(true);
  }

  handleSave() {
    if (!this.form.pacienteId || !this.form.profissionalId || !this.form.dataHora) return;
    const payload: Partial<Consulta> = {
      pacienteId:     Number(this.form.pacienteId),
      profissionalId: Number(this.form.profissionalId),
      convenioId:     this.form.convenioId ? Number(this.form.convenioId) : null,
      dataHora:       this.form.dataHora.length === 16 ? `${this.form.dataHora}:00` : this.form.dataHora,
      status:         this.form.status,
      anamnese:       this.form.anamnese       || undefined,
      diagnostico:    this.form.diagnostico    || undefined,
      prescricao:     this.form.prescricao     || undefined,
      procedimentos:  this.form.procedimentos  || undefined,
      valorCobrado:   this.form.valorCobrado   ?? undefined,
      observacoes:    this.form.observacoes    || undefined,
    };
    this.saving.set(true);
    const id  = this.selectedId();
    const req$ = id ? this.service.update(id, payload) : this.service.create(payload);
    req$.subscribe({
      next:  () => { this.saving.set(false); this.isModalOpen.set(false); this.load(); },
      error: () => { this.saving.set(false); }
    });
  }

  excluir(c: ConsultaCompleto) {
    this.selectedId.set(c.id);
    this.selectedConsulta.set(c);
    this.isDeleteModalOpen.set(true);
  }

  confirmDelete() {
    const id = this.selectedId();
    if (!id) return;
    this.deleting.set(true);
    this.service.remove(id).subscribe({
      next:  () => { this.deleting.set(false); this.isDeleteModalOpen.set(false); this.load(); },
      error: () => { this.deleting.set(false); }
    });
  }

  cancelDelete() {
    this.isDeleteModalOpen.set(false);
    this.selectedId.set(null);
    this.selectedConsulta.set(null);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedId.set(null);
  }

  private emptyForm() {
    return {
      pacienteId:     null as number | null,
      profissionalId: null as number | null,
      convenioId:     null as number | null,
      dataHora:       '',
      status:         'Aberta' as Consulta['status'],
      anamnese:       '',
      diagnostico:    '',
      prescricao:     '',
      procedimentos:  '',
      valorCobrado:   null as number | null,
      observacoes:    '',
    };
  }

  // ---- exports (stubs) ----
  exportarExcel() { console.log('Exportar Excel', this.filtradas().length); }
  exportarPDF()   { console.log('Exportar PDF',   this.filtradas().length); }

  // ---- utilidades de data/hora/idade ----
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
    return isNaN(dt.getTime()) ? '' : dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  idadeDe(iso?: string | null): number | string {
    if (!iso) return 'â€”';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'â€”';
    const hoje = new Date();
    let idade = hoje.getFullYear() - d.getFullYear();
    const m = hoje.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < d.getDate())) idade--;
    return idade;
  }
}
