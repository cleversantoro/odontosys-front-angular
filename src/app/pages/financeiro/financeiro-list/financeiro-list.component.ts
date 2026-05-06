import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { FinanceiroService } from '../../../core/services/financeiro.service';
import { Pagamento, Despesa } from '../../../core/models/financeiro.model';

type Aba = 'receitas' | 'despesas';

@Component({
  selector: 'app-financeiro-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent],
  templateUrl: './financeiro-list.component.html',
})
export class FinanceiroListComponent implements OnInit {
  private service = inject(FinanceiroService);

  loading   = signal(true);
  error     = signal<string | null>(null);
  receitas  = signal<Pagamento[]>([]);
  despesas  = signal<Despesa[]>([]);
  aba       = signal<Aba>('receitas');
  search    = signal('');
  page      = signal(1);
  pageSize  = signal(10);
  mesFiltro = signal(new Date().toISOString().slice(0, 7));

  // Modal nova receita / despesa
  isModalOpen   = signal(false);
  saving        = signal(false);
  modalTipo     = signal<'receita' | 'despesa'>('receita');
  formReceita: Partial<Pagamento> = {};
  formDespesa: Partial<Despesa>  = {};

  ngOnInit() { this.load(); }

  private load() {
    this.loading.set(true);
    forkJoin({ receitas: this.service.listReceitas(), despesas: this.service.listDespesas() }).subscribe({
      next: d => {
        this.receitas.set(d.receitas);
        this.despesas.set(d.despesas);
        this.loading.set(false);
      },
      error: () => { this.error.set('Falha ao carregar dados financeiros.'); this.loading.set(false); }
    });
  }

  // Summary
  totalReceitas = computed(() =>
    this.receitasFiltradas().reduce((s, r) => s + Number(r.valor), 0)
  );
  totalDespesas = computed(() =>
    this.despesasFiltradas().reduce((s, d) => s + Number(d.valor), 0)
  );
  saldo = computed(() => this.totalReceitas() - this.totalDespesas());

  receitasFiltradas = computed(() => {
    const mes = this.mesFiltro();
    const q = this.search().toLowerCase();
    return this.receitas()
      .filter(r => r.data?.startsWith(mes))
      .filter(r =>
        (r.paciente?.nome || '').toLowerCase().includes(q) ||
        (r.tipoPagamento || '').toLowerCase().includes(q) ||
        (r.status || '').toLowerCase().includes(q)
      );
  });

  despesasFiltradas = computed(() => {
    const mes = this.mesFiltro();
    const q = this.search().toLowerCase();
    return this.despesas()
      .filter(d => d.data?.startsWith(mes))
      .filter(d =>
        (d.descricao || '').toLowerCase().includes(q) ||
        (d.categoria || '').toLowerCase().includes(q)
      );
  });

  listaAtiva = computed<(Pagamento | Despesa)[]>(() =>
    this.aba() === 'receitas' ? this.receitasFiltradas() : this.despesasFiltradas()
  );

  totalPages = computed(() => Math.max(1, Math.ceil(this.listaAtiva().length / this.pageSize())));

  paged = computed(() => {
    const p = Math.min(this.page(), this.totalPages());
    const start = (p - 1) * this.pageSize();
    return this.listaAtiva().slice(start, start + this.pageSize());
  });

  setAba(a: Aba) {
    this.aba.set(a);
    this.page.set(1);
  }

  openModal(tipo: 'receita' | 'despesa') {
    this.modalTipo.set(tipo);
    this.formReceita = { tipoPagamento: 'Particular', status: 'Pendente', data: new Date().toISOString().slice(0,10) };
    this.formDespesa = { categoria: '', data: new Date().toISOString().slice(0,10) };
    this.isModalOpen.set(true);
  }

  handleSave() {
    this.saving.set(true);
    const req$ = (this.modalTipo() === 'receita'
      ? this.service.createPagamento(this.formReceita)
      : this.service.createDespesa(this.formDespesa)) as import('rxjs').Observable<unknown>;
    req$.subscribe({
      next:  () => { this.saving.set(false); this.isModalOpen.set(false); this.load(); },
      error: () => { this.saving.set(false); }
    });
  }

  isReceita(item: Pagamento | Despesa): item is Pagamento {
    return 'tipoPagamento' in item;
  }

  statusClass(status: string): string {
    return status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
  }
}
