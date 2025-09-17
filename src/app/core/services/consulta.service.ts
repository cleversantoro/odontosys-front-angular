// src/app/core/services/consulta.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Consulta } from '../models/consulta.model';
import { ConsultaCompleto } from '../models/consultaCompleto.model';

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl || ''}/api/consultas`;
  private completo = `${environment.apiUrl || ''}/api/consultas/vwcompleta`;

  listar() {
    return this.http.get<Consulta[] | Consulta>(this.base).pipe(
      map((resp) => Array.isArray(resp) ? resp : [resp]),
      catchError(err => {
        console.error('Erro ao listar consultas', err);
        return throwError(() => err);
      })
    );
  }

  listarCompleto() {
    return this.http.get<ConsultaCompleto[] | ConsultaCompleto>(this.completo).pipe(
      map((resp) => Array.isArray(resp) ? resp : [resp]),
      catchError(err => {
        console.error('Erro ao listar consultas', err);
        return throwError(() => err);
      })
    );
  }

}
