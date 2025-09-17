import { Component, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacientesService, Paciente } from '../../../core/services/paciente.service';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

// XLSX
import * as XLSX from 'xlsx';
// jsPDF + autotable
import jsPDF from 'jspdf';
import autoTable, { RowInput } from 'jspdf-autotable';


const onlyDigits = (v: string | undefined | null) => String(v ?? '').replace(/\D/g, '');

@Component({
  standalone: true,
  selector: 'app-pacientes-list',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PageBreadcrumbComponent],
  templateUrl: './pacientes-list.component.html',
})
export class PacientesListComponent {
  // Estado principal
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  rows = signal<Paciente[]>([]);
  search = signal<string>('');
  sort = signal<{ field: keyof Paciente | 'createdAt' | 'nome'; dir: 'asc' | 'desc' }>({ field: 'nome', dir: 'asc' });
  page = signal<number>(1);
  pageSize = signal<number>(10);

  // Modais
  viewRow = signal<Paciente | null>(null);
  editRow = signal<Paciente | null>(null);
  deleteRow = signal<Paciente | null>(null);

  // Branding do relatório
  brand = {
    clinicName: 'Clínica Odontológica [Nome]',
    // Pode ser URL (https://...png) OU dataURL (base64). Deixe vazio se não tiver logo.
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Tooth_icon.svg/240px-Tooth_icon.svg.png',
    // Cores do tema PDF
    primaryHex: '#0ea5e9', // azul claro (Tailwind sky-500-ish)
    headerBg: '#e0f2fe',   // azul bem claro
  };

  // Dados derivados
  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    const s = this.sort();
    let arr = [...this.rows()];
    if (q) {
      arr = arr.filter(r =>
        (r.nome ?? '').toLowerCase().includes(q) ||
        (r.contato?.email ?? '').toLowerCase().includes(q) ||
        (r.endereco?.cidade ?? '').toLowerCase().includes(q) ||
        (r.cpf ?? '').includes(q)
      );
    }
    arr.sort((a, b) => {
      const fa = (a as any)[s.field] ?? (s.field === 'createdAt' ? a.createdAt : a.nome) ?? '';
      const fb = (b as any)[s.field] ?? (s.field === 'createdAt' ? b.createdAt : b.nome) ?? '';
      const A = String(fa).toLowerCase(); const B = String(fb).toLowerCase();
      if (A < B) return s.dir === 'asc' ? -1 : 1;
      if (A > B) return s.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));
  paged = computed(() => {
    const p = this.page(); const sz = this.pageSize();
    const start = (p - 1) * sz;
    return this.filtered().slice(start, start + sz);
  });

  form!: FormGroup;

  constructor(
    private service: PacientesService,
    private fb: FormBuilder
  ) {
    // Garantir que página válida após filtro
    effect(() => {
      const tp = this.totalPages();
      if (this.page() > tp) this.page.set(tp);
      if (this.page() < 1) this.page.set(1);
    });
  }

  // Form de edição (popup)
  async ngOnInit() {
    this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.email]],
      tel1: [''],
      tel2: [''],
      cpf: [''],
      logradouro: [''],
      numero: [''],
      bairro: [''],
      cidade: [''],
      estado: [''],
    });

    try {
      this.loading.set(true);
      this.error.set(null);
      const data = await this.service.list();
      this.rows.set(data);
    } catch (e) {
      this.error.set('Falha ao carregar pacientes.');
    } finally {
      this.loading.set(false);
    }
}

prevPage() {
  this.page.set(Math.max(1, this.page() - 1));
}

nextPage() {
  this.page.set(Math.min(this.totalPages(), this.page() + 1));
}


// Tabs de ordenação simples
setSort(field: 'nome' | 'createdAt') {
  const s = this.sort();
  const dir = s.field === field ? (s.dir === 'asc' ? 'desc' : 'asc') : 'asc';
  this.sort.set({ field, dir });
}

// Ações
onView(row: Paciente) { this.viewRow.set(row); }
onEdit(row: Paciente) {
  this.editRow.set(row);
  this.form.reset({
    nome: row.nome ?? '',
    email: row.contato?.email ?? '',
    tel1: row.contato?.tel1 ?? '',
    tel2: row.contato?.tel2 ?? '',
    cpf: row.cpf ?? '',
    logradouro: row.endereco?.logradouro ?? '',
    numero: row.endereco?.numero ?? '',
    bairro: row.endereco?.bairro ?? '',
    cidade: row.endereco?.cidade ?? '',
    estado: row.endereco?.estado ?? '',
  });
}
onDelete(row: Paciente) { this.deleteRow.set(row); }

closeModals() {
  this.viewRow.set(null);
  this.editRow.set(null);
  this.deleteRow.set(null);
}

  async saveEdit() {
  const row = this.editRow();
  if (!row) return;
  if (this.form.invalid) { this.form.markAllAsTouched(); return; }

  const v = this.form.value;
  const payload: Partial<Paciente> = {
    nome: v.nome ?? row.nome,
    cpf: onlyDigits(v.cpf) || row.cpf,
    contato: {
      email: v.email ?? row.contato?.email,
      tel1: onlyDigits(v.tel1 || '') || row.contato?.tel1,
      tel2: onlyDigits(v.tel2 || '') || row.contato?.tel2,
    },
    endereco: {
      ...(row.endereco ?? {}),
      logradouro: v.logradouro ?? row.endereco?.logradouro,
      numero: v.numero ?? row.endereco?.numero,
      bairro: v.bairro ?? row.endereco?.bairro,
      cidade: v.cidade ?? row.endereco?.cidade,
      estado: v.estado ?? row.endereco?.estado,
    }
  };

  try {
    await this.service.update(row.id, payload);
    // Atualiza na grid local
    this.rows.set(this.rows().map(r => r.id === row.id ? ({ ...r, ...payload, contato: { ...r.contato, ...payload.contato }, endereco: { ...r.endereco, ...payload.endereco } }) : r));
    this.closeModals();
  } catch {
    alert('Erro ao salvar alterações.');
  }
}

  async confirmDelete() {
  const row = this.deleteRow();
  if (!row) return;
  try {
    await this.service.remove(row.id);
    this.rows.set(this.rows().filter(r => r.id !== row.id));
    this.closeModals();
  } catch {
    alert('Erro ao excluir.');
  }
}

  private mapRowsForTable() {
  // Colunas que iremos exportar
  const rows = this.filtered().map(p => ({
    ID: p.id ?? '',
    Nome: p.nome ?? '',
    Email: p.contato?.email ?? '',
    Telefone: p.contato?.tel1 ?? '',
    CPF: p.cpf ?? '',
    Cidade: p.endereco?.cidade ?? '',
    UF: p.endereco?.estado ?? '',
    CriadoEm: p.createdAt ?? ''
  }));
  return rows;
}

  private async fetchImageAsDataURL(url: string): Promise < string > {
  // Baixa a imagem e converte pra dataURL (base64)
  const res = await fetch(url, { mode: 'cors' });
  const blob = await res.blob();
  return await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

// Navegação
gotoCadastro(routerLink: string[] = ['/pacientes/novo']) { }

// Exportações (sem libs)
exportXLSX() {
  const data = this.mapRowsForTable(); // array de objetos
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();

  // Ajuste de largura de colunas (opcional)
  const colWidths = [
    { wch: 6 },   // ID
    { wch: 30 },  // Nome
    { wch: 28 },  // Email
    { wch: 16 },  // Telefone
    { wch: 16 },  // CPF
    { wch: 20 },  // Cidade
    { wch: 6 },   // UF
    { wch: 20 },  // CriadoEm
  ];
  (ws as any)['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Pacientes');
  XLSX.writeFile(wb, 'pacientes.xlsx');
}


  async exportPDF() {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  // ---- Cabeçalho / Capa ----
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const primary = this.brand.primaryHex;
  const headerBg = this.brand.headerBg;

  // Barra superior
  doc.setFillColor(primary);
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Logo (opcional)
  let logoWidth = 80, logoHeight = 80;
  let yCursor = margin;

  if (this.brand.logoUrl) {
    try {
      const dataUrl = await this.fetchImageAsDataURL(this.brand.logoUrl);
      // Desenha logo à esquerda
      doc.addImage(dataUrl, 'PNG', margin, yCursor, logoWidth, logoHeight);
    } catch {
      // sem logo, segue o baile
    }
  }

  // Título
  const titleX = this.brand.logoUrl ? margin + logoWidth + 16 : margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30);
  doc.text(this.brand.clinicName, titleX, yCursor + 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(80);
  doc.text('Relatório de Pacientes', titleX, yCursor + 48);

  // Linha divisória
  doc.setDrawColor(primary);
  doc.setLineWidth(1);
  doc.line(margin, yCursor + 70, pageWidth - margin, yCursor + 70);

  // ---- Tabela ----
  const data = this.mapRowsForTable();
  const head = [['ID', 'Nome', 'Email', 'Telefone', 'CPF', 'Cidade', 'UF', 'Criado em']];
  const body: RowInput[] = data.map(r => [
    r.ID, r.Nome, r.Email, r.Telefone, r.CPF, r.Cidade, r.UF, r.CriadoEm
  ]);

  autoTable(doc, {
    head,
    body,
    startY: yCursor + 90,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: hexToRgb(headerBg),
      textColor: [15, 23, 42], // slate-900
      lineColor: [224, 231, 255],
      lineWidth: 0.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: (dataCtx) => {
      // Rodapé com numeração
      const str = `Página ${doc.getNumberOfPages()}`;
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(str, pageWidth - margin, doc.internal.pageSize.getHeight() - 20, { align: 'right' });
    },
    columnStyles: {
      0: { cellWidth: 40 },  // ID
      1: { cellWidth: 160 }, // Nome
      2: { cellWidth: 180 }, // Email
      3: { cellWidth: 90 },  // Telefone
      4: { cellWidth: 110 }, // CPF
      5: { cellWidth: 120 }, // Cidade
      6: { cellWidth: 40 },  // UF
      7: { cellWidth: 110 }, // CriadoEm
    }
  });

  // Salvar
  doc.save('pacientes.pdf');
}

}

// Helpers locais
function csvEscape(v: any) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function safe(v: any) { return v ?? ''; }
function esc(v: any) { return String(v ?? '').replace(/[<>&]/g, s => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[s] as string)); }
function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}



function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  const n = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
