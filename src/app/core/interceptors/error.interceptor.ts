import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 403:
          toast.show('Acesso negado. Você não tem permissão para esta ação.', 'warning');
          break;
        case 500:
        case 502:
        case 503:
          toast.show('Erro no servidor. Tente novamente em instantes.', 'error');
          break;
        case 0:
          toast.show('Sem conexão com o servidor. Verifique sua rede.', 'error');
          break;
        // 401 é tratado pelo authInterceptor (logout + redirect)
      }
      return throwError(() => error);
    })
  );
};
