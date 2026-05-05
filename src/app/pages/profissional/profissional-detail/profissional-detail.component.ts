import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ProfissionalService } from '../../../core/services/profissional.service';
import { Profissional } from '../../../core/models/profissional.model';

@Component({
  selector: 'app-profissional-detail',
  imports: [CommonModule, RouterModule, PageBreadcrumbComponent],
  templateUrl: './profissional-detail.component.html',
  styleUrl: './profissional-detail.component.css'
})
export class ProfissionalDetailComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  private service = inject(ProfissionalService);

  loading     = signal(false);
  error       = signal<string | null>(null);
  profissional = signal<Profissional | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error.set('ID de profissional inválido.'); return; }

    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (p) => { this.profissional.set(p); this.loading.set(false); },
      error: ()  => { this.error.set('Profissional não encontrado.'); this.loading.set(false); }
    });
  }
}


