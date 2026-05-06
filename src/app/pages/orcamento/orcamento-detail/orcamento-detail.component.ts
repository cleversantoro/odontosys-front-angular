import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { OrcamentoService } from '../../../core/services/orcamento.service';
import { Orcamento } from '../../../core/models/orcamento.model';

@Component({
  selector: 'app-orcamento-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, PageBreadcrumbComponent],
  templateUrl: './orcamento-detail.component.html',
})
export class OrcamentoDetailComponent implements OnInit {
  private service = inject(OrcamentoService);
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);

  loading    = signal(true);
  error      = signal<string | null>(null);
  orcamento  = signal<Orcamento | null>(null);
  processing = signal<'aprovar' | 'recusar' | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/orcamento/lista']); return; }
    this.service.getById(id).subscribe({
      next:  o => { this.orcamento.set(o); this.loading.set(false); },
      error: () => { this.error.set('Orçamento não encontrado.'); this.loading.set(false); }
    });
  }

  aprovar() {
    const id = this.orcamento()?.id;
    if (!id) return;
    this.processing.set('aprovar');
    this.service.aprovar(id).subscribe({
      next:  o => { this.orcamento.set(o); this.processing.set(null); },
      error: () => { this.processing.set(null); }
    });
  }

  recusar() {
    const id = this.orcamento()?.id;
    if (!id) return;
    this.processing.set('recusar');
    this.service.recusar(id).subscribe({
      next:  o => { this.orcamento.set(o); this.processing.set(null); },
      error: () => { this.processing.set(null); }
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Pendente: 'bg-yellow-100 text-yellow-700',
      Aprovado: 'bg-green-100 text-green-700',
      Recusado: 'bg-red-100 text-red-700',
      Expirado: 'bg-gray-100 text-gray-500',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }
}
