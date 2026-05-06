import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { OrcamentoService } from '../../../core/services/orcamento.service';
import { Orcamento } from '../../../core/models/orcamento.model';

@Component({
  selector: 'app-orcamento-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PageBreadcrumbComponent],
  templateUrl: './orcamento-list.component.html',
})
export class OrcamentoListComponent implements OnInit {
  private service = inject(OrcamentoService);

  loading  = signal(true);
  error    = signal<string | null>(null);
  rows     = signal<Orcamento[]>([]);
  search   = signal('');
  page     = signal(1);
  pageSize = signal(10);

  // Delete
  isDeleteOpen = signal(false);
  deleting     = signal(false);
  deleteTarget = signal<Orcamento | null>(null);

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.rows().filter(o =>
      (o.Paciente?.nome || '').toLowerCase().includes(q) ||
      (o.status || '').toLowerCase().includes(q)
    );
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));

  paged = computed(() => {
    const p = Math.min(this.page(), this.totalPages());
    const start = (p - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  ngOnInit() { this.load(); }

  private load() {
    this.loading.set(true);
    this.service.list().subscribe({
      next:  r => { this.rows.set(r); this.loading.set(false); },
      error: () => { this.error.set('Falha ao carregar orçamentos.'); this.loading.set(false); }
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Pendente:  'bg-yellow-100 text-yellow-700',
      Aprovado:  'bg-green-100 text-green-700',
      Recusado:  'bg-red-100 text-red-700',
      Expirado:  'bg-gray-100 text-gray-500',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  confirmDelete(o: Orcamento) {
    this.deleteTarget.set(o);
    this.isDeleteOpen.set(true);
  }

  doDelete() {
    const o = this.deleteTarget();
    if (!o?.id) return;
    this.deleting.set(true);
    this.service.remove(o.id).subscribe({
      next:  () => { this.deleting.set(false); this.isDeleteOpen.set(false); this.load(); },
      error: () => { this.deleting.set(false); }
    });
  }
}
