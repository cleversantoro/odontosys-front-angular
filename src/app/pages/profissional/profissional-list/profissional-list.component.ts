import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ProfissionalService } from '../../../core/services/profissional.service';
import { Profissional } from '../../../core/models/profissional.model';

@Component({
  selector: 'app-profissional-list',
  imports: [CommonModule, RouterModule, PageBreadcrumbComponent],
  templateUrl: './profissional-list.component.html',
  styleUrl: './profissional-list.component.css'
})
export class ProfissionalListComponent implements OnInit {
  private service = inject(ProfissionalService);

  loading = signal(false);
  error   = signal<string | null>(null);
  rows    = signal<Profissional[]>([]);
  search  = signal('');

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.rows();
    return this.rows().filter(p =>
      (p.nome ?? '').toLowerCase().includes(q) ||
      (p.email ?? '').toLowerCase().includes(q) ||
      (p.cro ?? '').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (data) => { this.rows.set(data); this.loading.set(false); },
      error: ()   => { this.error.set('Erro ao carregar profissionais.'); this.loading.set(false); }
    });
  }
}


