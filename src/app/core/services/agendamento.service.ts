import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Agendamento } from '../models/agendamento.model';

const API_URL = `${environment.apiUrl}/api/agendamentos`;

@Injectable({ providedIn: 'root' })
export class AgendamentoService {
  private http = inject(HttpClient);

  list(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(API_URL);
  }

  /** Filtra agendamentos por período passando query params ?inicio=&fim= */
  listByPeriodo(inicio: string, fim: string): Observable<Agendamento[]> {
    const params = new HttpParams().set('inicio', inicio).set('fim', fim);
    return this.http.get<Agendamento[]>(API_URL, { params });
  }

  getById(id: number): Observable<Agendamento> {
    return this.http.get<Agendamento>(`${API_URL}/${id}`);
  }

  create(payload: Partial<Agendamento>): Observable<Agendamento> {
    return this.http.post<Agendamento>(API_URL, payload);
  }

  update(id: number, payload: Partial<Agendamento>): Observable<Agendamento> {
    return this.http.put<Agendamento>(`${API_URL}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
