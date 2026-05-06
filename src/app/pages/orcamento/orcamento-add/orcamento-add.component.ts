import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { OrcamentoService } from '../../../core/services/orcamento.service';
import { PacientesService } from '../../../core/services/paciente.service';
import { ProfissionalService } from '../../../core/services/profissional.service';
import { ConvenioService } from '../../../core/services/convenio.service';
import { OrcamentoItem } from '../../../core/models/orcamento.model';
import { Paciente } from '../../../core/models/paciente.model';
import { Profissional } from '../../../core/models/profissional.model';
import { Convenio } from '../../../core/models/convenio.model';

@Component({
  selector: 'app-orcamento-add',
  standalone: true,
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent],
  templateUrl: './orcamento-add.component.html',
})
export class OrcamentoAddComponent implements OnInit {
  private orcamentoService   = inject(OrcamentoService);
  private pacientesService   = inject(PacientesService);
  private profissionalService = inject(ProfissionalService);
  private convenioService    = inject(ConvenioService);
  private router             = inject(Router);

  pacientes    = signal<Paciente[]>([]);
  profissionais = signal<Profissional[]>([]);
  convenios    = signal<Convenio[]>([]);
  saving       = signal(false);

  // Form fields
  pacienteId     = 0;
  profissionalId = 0;
  convenioId: number | null = null;
  validade       = '';
  observacoes    = '';
  itens: OrcamentoItem[] = [this.blankItem()];

  valorTotal = computed(() =>
    this.itens.reduce((s, i) => s + (i.quantidade * i.valorUnitario || 0), 0)
  );

  ngOnInit() {
    forkJoin({
      pacientes:     this.pacientesService.list(),
      profissionais: this.profissionalService.list(),
      convenios:     this.convenioService.list(),
    }).subscribe({
      next: d => {
        this.pacientes.set(d.pacientes);
        this.profissionais.set(d.profissionais);
        this.convenios.set(d.convenios);
      }
    });
  }

  blankItem(): OrcamentoItem {
    return { descricao: '', dente: '', quantidade: 1, valorUnitario: 0, valorTotal: 0 };
  }

  addItem() {
    this.itens = [...this.itens, this.blankItem()];
  }

  removeItem(index: number) {
    this.itens = this.itens.filter((_, i) => i !== index);
    if (this.itens.length === 0) this.itens = [this.blankItem()];
  }

  calcItem(item: OrcamentoItem) {
    item.valorTotal = item.quantidade * item.valorUnitario;
  }

  isValid(): boolean {
    return this.pacienteId > 0 &&
      this.profissionalId > 0 &&
      this.itens.some(i => i.descricao.trim());
  }

  salvar() {
    if (!this.isValid()) return;
    this.saving.set(true);
    const payload = {
      pacienteId:     this.pacienteId,
      profissionalId: this.profissionalId,
      convenioId:     this.convenioId || null,
      validade:       this.validade || undefined,
      observacoes:    this.observacoes || undefined,
      itens:          this.itens.map(i => ({ ...i, valorTotal: i.quantidade * i.valorUnitario })),
      valorTotal:     this.valorTotal(),
      status:         'Pendente' as const,
    };
    this.orcamentoService.create(payload).subscribe({
      next:  () => { this.saving.set(false); this.router.navigate(['/orcamento/lista']); },
      error: () => { this.saving.set(false); }
    });
  }

  cancelar() {
    this.router.navigate(['/orcamento/lista']);
  }
}
