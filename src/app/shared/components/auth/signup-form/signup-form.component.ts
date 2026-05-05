import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-signup-form',
  imports: [
    CommonModule,
    LabelComponent,
    CheckboxComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './signup-form.component.html',
  styles: ``
})
export class SignupFormComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  showPassword = false;
  isChecked    = false;

  fname    = '';
  lname    = '';
  email    = '';
  password = '';

  isLoading    = false;
  errorMessage = '';

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignUp() {
    this.errorMessage = '';

    if (!this.fname || !this.email || !this.password) {
      this.errorMessage = 'Preencha nome, e-mail e senha.';
      return;
    }

    if (!this.isChecked) {
      this.errorMessage = 'Aceite os Termos e Condições para continuar.';
      return;
    }

    const nome = `${this.fname} ${this.lname}`.trim();

    this.isLoading = true;
    this.auth.register({ nome, email: this.email, senha: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/sign-in']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.error ?? 'Erro ao criar conta. Tente novamente.';
      },
    });
  }
}
