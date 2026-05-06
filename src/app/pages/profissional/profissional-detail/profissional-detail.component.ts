import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ProfissionalService } from '../../../core/services/profissional.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-profissional-detail',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PageBreadcrumbComponent],
  templateUrl: './profissional-detail.component.html',
  styleUrl: './profissional-detail.component.css'
})
export class ProfissionalDetailComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private service = inject(ProfissionalService);
  private toast   = inject(ToastService);
  private fb      = inject(FormBuilder);

  loading      = signal(false);
  saving       = signal(false);
  deleting     = signal(false);
  error        = signal<string | null>(null);
  showDeleteModal = signal(false);
  profissionalId  = signal<number | null>(null);

  form = this.fb.group({
    nome:           ['', [Validators.required, Validators.minLength(3)]],
    email:          ['', [Validators.required, Validators.email]],
    dataNascimento: ['', [Validators.required]],
    sexo:           ['', [Validators.required]],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error.set('ID de profissional inválido.'); return; }
    this.profissionalId.set(id);

    this.loading.set(true);
    this.service.getById(id).subscribe({
      next: (p) => {
        this.form.patchValue({
          nome: p.nome,
          email: p.email,
          dataNascimento: p.dataNascimento ? p.dataNascimento.substring(0, 10) : '',
          sexo: p.sexo,
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Profissional não encontrado.');
        this.loading.set(false);
      }
    });
  }

  invalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  onUpdate(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const id = this.profissionalId();
    if (!id) return;
    this.saving.set(true);
    this.service.update(id, this.form.value as any).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.show('Profissional atualizado com sucesso!', 'info');
      },
      error: () => {
        this.saving.set(false);
        this.toast.show('Erro ao atualizar profissional.', 'error');
      }
    });
  }

  doDelete(): void {
    const id = this.profissionalId();
    if (!id) return;
    this.deleting.set(true);
    this.service.remove(id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.toast.show('Profissional excluído com sucesso.', 'info');
        this.router.navigate(['/profissional/lista']);
      },
      error: () => {
        this.deleting.set(false);
        this.toast.show('Erro ao excluir profissional.', 'error');
        this.showDeleteModal.set(false);
      }
    });
  }
}


