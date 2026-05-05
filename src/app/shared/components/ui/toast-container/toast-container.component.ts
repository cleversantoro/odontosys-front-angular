import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 w-80">
      @for (t of toast.toasts(); track t.id) {
        <div
          [class]="toastClass(t)"
          role="alert"
        >
          <span class="flex-1 text-sm">{{ t.message }}</span>
          <button
            class="ml-3 shrink-0 opacity-60 hover:opacity-100"
            (click)="toast.dismiss(t.id)"
            aria-label="Fechar"
          >✕</button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  toast = inject(ToastService);

  toastClass(t: Toast): string {
    const base = 'flex items-start gap-2 rounded-xl px-4 py-3 shadow-lg text-white';
    const colors: Record<Toast['type'], string> = {
      error:   'bg-red-600',
      warning: 'bg-amber-500',
      info:    'bg-sky-500',
    };
    return `${base} ${colors[t.type]}`;
  }
}
