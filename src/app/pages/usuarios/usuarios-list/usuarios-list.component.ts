import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario, UsuarioCreate, PerfilUsuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent],
  templateUrl: './usuarios-list.component.html',
})
export class UsuariosListComponent implements OnInit {
  private service = inject(UsuarioService);

  loading  = signal(true);
  error    = signal<string | null>(null);
  rows     = signal<Usuario[]>([]);
  search   = signal('');
  page     = signal(1);
  pageSize = signal(10);

  // Modal
  isModalOpen  = signal(false);
  saving       = signal(false);
  deleting     = signal(false);
  selectedId   = signal<number | null>(null);
  isDeleteOpen = signal(false);
  deleteTarget = signal<Usuario | null>(null);

  perfis: PerfilUsuario[] = ['admin', 'dentista', 'recepcionista', 'financeiro'];

  form: Partial<UsuarioCreate> = {};

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return this.rows().filter(u =>
      u.nome.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.perfil.toLowerCase().includes(q)
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
      error: () => { this.error.set('Falha ao carregar usuários.'); this.loading.set(false); }
    });
  }

  openNew() {
    this.selectedId.set(null);
    this.form = { nome: '', email: '', perfil: 'recepcionista', ativo: true, senha: '' };
    this.isModalOpen.set(true);
  }

  openEdit(u: Usuario) {
    this.selectedId.set(u.id ?? null);
    this.form = { nome: u.nome, email: u.email, perfil: u.perfil, ativo: u.ativo };
    this.isModalOpen.set(true);
  }

  handleSave() {
    if (!this.form.nome?.trim() || !this.form.email?.trim()) return;
    this.saving.set(true);
    const id = this.selectedId();
    const req$ = id
      ? this.service.update(id, this.form)
      : this.service.create(this.form as UsuarioCreate);
    req$.subscribe({
      next:  () => { this.saving.set(false); this.isModalOpen.set(false); this.load(); },
      error: () => { this.saving.set(false); }
    });
  }

  confirmDelete(u: Usuario) {
    this.deleteTarget.set(u);
    this.isDeleteOpen.set(true);
  }

  doDelete() {
    const u = this.deleteTarget();
    if (!u?.id) return;
    this.deleting.set(true);
    this.service.remove(u.id).subscribe({
      next:  () => { this.deleting.set(false); this.isDeleteOpen.set(false); this.load(); },
      error: () => { this.deleting.set(false); }
    });
  }

  perfilLabel(p: string): string {
    const map: Record<string, string> = {
      admin: 'Administrador',
      dentista: 'Dentista',
      recepcionista: 'Recepcionista',
      financeiro: 'Financeiro',
    };
    return map[p] ?? p;
  }

  perfilClass(p: string): string {
    const map: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700',
      dentista: 'bg-blue-100 text-blue-700',
      recepcionista: 'bg-teal-100 text-teal-700',
      financeiro: 'bg-orange-100 text-orange-700',
    };
    return map[p] ?? 'bg-gray-100 text-gray-600';
  }
}
