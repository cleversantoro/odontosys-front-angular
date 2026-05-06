import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ConvenioService } from '../../../core/services/convenio.service';
import { Convenio } from '../../../core/models/convenio.model';

@Component({
  selector: 'app-convenios-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PageBreadcrumbComponent],
  templateUrl: './convenios-list.component.html',
})
export class ConveniosListComponent implements OnInit {
  private service = inject(ConvenioService);

  loading  = signal(true);
  error    = signal<string | null>(null);
  rows     = signal<Convenio[]>([]);
  search   = signal('');
  page     = signal(1);
  pageSize = signal(10);

  // Modal
  isModalOpen  = signal(false);
  saving       = signal(false);
  deleting     = signal(false);
  selectedId   = signal<number | null>(null);
  isDeleteOpen = signal(false);
  deleteTarget = signal<Convenio | null>(null);

  form: { nome: string; codigo: string; tipo: string } = { nome: '', codigo: '', tipo: '' };

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.rows().filter(c =>
      c.nome.toLowerCase().includes(q) ||
      (c.codigo || '').toLowerCase().includes(q) ||
      (c.tipo  || '').toLowerCase().includes(q)
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
      error: () => { this.error.set('Falha ao carregar convênios.'); this.loading.set(false); }
    });
  }

  openNew() {
    this.selectedId.set(null);
    this.form = { nome: '', codigo: '', tipo: '' };
    this.isModalOpen.set(true);
  }

  openEdit(c: Convenio) {
    this.selectedId.set(c.id);
    this.form = { nome: c.nome, codigo: c.codigo ?? '', tipo: c.tipo ?? '' };
    this.isModalOpen.set(true);
  }

  handleSave() {
    if (!this.form.nome.trim()) return;
    this.saving.set(true);
    const id = this.selectedId();
    const req$ = id
      ? this.service.update(id, this.form)
      : this.service.create(this.form);
    req$.subscribe({
      next:  () => { this.saving.set(false); this.isModalOpen.set(false); this.load(); },
      error: () => { this.saving.set(false); }
    });
  }

  confirmDelete(c: Convenio) {
    this.deleteTarget.set(c);
    this.isDeleteOpen.set(true);
  }

  doDelete() {
    const c = this.deleteTarget();
    if (!c?.id) return;
    this.deleting.set(true);
    this.service.remove(c.id).subscribe({
      next:  () => { this.deleting.set(false); this.isDeleteOpen.set(false); this.load(); },
      error: () => { this.deleting.set(false); }
    });
  }
}
