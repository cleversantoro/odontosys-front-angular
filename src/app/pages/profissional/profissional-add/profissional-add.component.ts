import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ProfissionalService } from '../../../core/services/profissional.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-profissional-add',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PageBreadcrumbComponent],
  templateUrl: './profissional-add.component.html',
  styleUrl: './profissional-add.component.css'
})
export class ProfissionalAddComponent {
  private fb      = inject(FormBuilder);
  private service = inject(ProfissionalService);
  private toast   = inject(ToastService);
  private router  = inject(Router);

  loading = signal(false);

  form = this.fb.group({
    nome:           ['', [Validators.required, Validators.minLength(3)]],
    email:          ['', [Validators.required, Validators.email]],
    dataNascimento: ['', [Validators.required]],
    sexo:           ['', [Validators.required]],
  });

  invalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.service.create(this.form.value as any).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.show('Profissional cadastrado com sucesso!', 'info');
        this.router.navigate(['/profissional/lista']);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('Erro ao cadastrar profissional.', 'error');
      }
    });
  }
}


