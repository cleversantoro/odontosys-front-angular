import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Orcamento } from '../models/orcamento.model';

const API_URL = `${environment.apiUrl}/api/orcamentos`;

@Injectable({ providedIn: 'root' })
export class OrcamentoService {
  private http = inject(HttpClient);

  list(): Observable<Orcamento[]> {
    return this.http.get<Orcamento[]>(API_URL);
  }

  getByPaciente(pacienteId: number): Observable<Orcamento[]> {
    const params = new HttpParams().set('pacienteId', pacienteId);
    return this.http.get<Orcamento[]>(API_URL, { params });
  }

  getById(id: number): Observable<Orcamento> {
    return this.http.get<Orcamento>(`${API_URL}/${id}`);
  }

  create(payload: Partial<Orcamento>): Observable<Orcamento> {
    return this.http.post<Orcamento>(API_URL, payload);
  }

  update(id: number, payload: Partial<Orcamento>): Observable<Orcamento> {
    return this.http.put<Orcamento>(`${API_URL}/${id}`, payload);
  }

  aprovar(id: number): Observable<Orcamento> {
    return this.http.patch<Orcamento>(`${API_URL}/${id}/aprovar`, {});
  }

  recusar(id: number): Observable<Orcamento> {
    return this.http.patch<Orcamento>(`${API_URL}/${id}/recusar`, {});
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
