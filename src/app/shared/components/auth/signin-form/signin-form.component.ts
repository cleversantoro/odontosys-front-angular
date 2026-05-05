import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-signin-form',
  imports: [
    CommonModule,
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './signin-form.component.html',
  styles: ``
})
export class SigninFormComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  showPassword = false;
  isChecked    = false;

  email    = '';
  password = '';

  isLoading    = false;
  errorMessage = '';

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Informe e-mail e senha.';
      return;
    }

    this.isLoading = true;
    this.auth.login({ email: this.email, senha: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ?? 'Credenciais inválidas. Tente novamente.';
      },
    });
  }
}
