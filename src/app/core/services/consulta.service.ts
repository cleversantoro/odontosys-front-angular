// src/app/core/services/consulta.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Consulta } from '../models/consulta.model';
import { ConsultaCompleto } from '../models/consultaCompleto.model';

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/consultas`;

  listar(): Observable<Consulta[]> {
    return this.http.get<Consulta[] | Consulta>(this.base).pipe(
      map((resp) => Array.isArray(resp) ? resp : [resp]),
      catchError(err => {
        console.error('Erro ao listar consultas', err);
        return throwError(() => err);
      })
    );
  }

  listarCompleto(): Observable<ConsultaCompleto[]> {
    return this.http.get<ConsultaCompleto[] | ConsultaCompleto>(`${this.base}/vwcompleta`).pipe(
      map((resp) => Array.isArray(resp) ? resp : [resp]),
      catchError(err => {
        console.error('Erro ao listar consultas', err);
        return throwError(() => err);
      })
    );
  }

  getById(id: number): Observable<Consulta> {
    return this.http.get<Consulta>(`${this.base}/${id}`);
  }

  create(payload: Partial<Consulta>): Observable<Consulta> {
    return this.http.post<Consulta>(this.base, payload);
  }

  update(id: number, payload: Partial<Consulta>): Observable<Consulta> {
    return this.http.put<Consulta>(`${this.base}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
