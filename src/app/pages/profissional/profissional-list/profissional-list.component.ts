import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ProfissionalService } from '../../../core/services/profissional.service';
import { ToastService } from '../../../core/services/toast.service';
import { Profissional } from '../../../core/models/profissional.model';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-profissional-list',
  imports: [CommonModule, RouterModule, PageBreadcrumbComponent],
  templateUrl: './profissional-list.component.html',
  styleUrl: './profissional-list.component.css'
})
export class ProfissionalListComponent implements OnInit {
  private service = inject(ProfissionalService);
  private toast   = inject(ToastService);

  loading    = signal(false);
  error      = signal<string | null>(null);
  rows       = signal<Profissional[]>([]);
  search     = signal('');
  page       = signal(1);
  pageSize   = signal(10);
  deleteRow  = signal<Profissional | null>(null);
  deleting   = signal(false);

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    const arr = this.rows();
    if (!q) return arr;
    return arr.filter(p =>
      (p.nome ?? '').toLowerCase().includes(q) ||
      (p.email ?? '').toLowerCase().includes(q)
    );
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));

  paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next:  data => { this.rows.set(data); this.loading.set(false); },
      error: ()   => { this.error.set('Erro ao carregar profissionais.'); this.loading.set(false); }
    });
  }

  setPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  confirmDelete(p: Profissional): void { this.deleteRow.set(p); }
  cancelDelete(): void { this.deleteRow.set(null); }

  doDelete(): void {
    const p = this.deleteRow();
    if (!p?.id) return;
    this.deleting.set(true);
    this.service.remove(p.id).subscribe({
      next: () => {
        this.rows.update(list => list.filter(r => r.id !== p.id));
        this.deleteRow.set(null);
        this.deleting.set(false);
        this.toast.show('Profissional excluído com sucesso.', 'info');
      },
      error: () => {
        this.deleting.set(false);
        this.toast.show('Erro ao excluir profissional.', 'error');
      }
    });
  }

  exportExcel(): void {
    const data = this.filtered().map(p => ({
      ID: p.id, Nome: p.nome, Email: p.email,
      'Nascimento': p.dataNascimento ? new Date(p.dataNascimento).toLocaleDateString('pt-BR') : '',
      Sexo: p.sexo ?? ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Profissionais');
    XLSX.writeFile(wb, 'profissionais.xlsx');
  }

  exportPDF(): void {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text('Lista de Profissionais', 14, 15);
    autoTable(doc, {
      startY: 22,
      head: [['ID', 'Nome', 'E-mail', 'Nascimento', 'Sexo']],
      body: this.filtered().map(p => [
        p.id ?? '', p.nome, p.email,
        p.dataNascimento ? new Date(p.dataNascimento).toLocaleDateString('pt-BR') : '',
        p.sexo ?? ''
      ]) as any[]
    });
    doc.save('profissionais.pdf');
  }
}


