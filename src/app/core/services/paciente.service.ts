import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paciente } from '../models/paciente.model';

const API_URL = `${environment.apiUrl}/api/pacientes`;

@Injectable({ providedIn: 'root' })
export class PacientesService {
  private http = inject(HttpClient);

  list(query?: { search?: string; page?: number; pageSize?: number; sort?: string; dir?: 'asc' | 'desc' }): Observable<Paciente[]> {
    let params = new HttpParams();
    if (query?.search) params = params.set('q', query.search);
    if (query?.page) params = params.set('page', query.page);
    if (query?.pageSize) params = params.set('pageSize', query.pageSize);
    if (query?.sort) params = params.set('sort', query.sort);
    if (query?.dir) params = params.set('dir', query.dir);
    return this.http.get<Paciente[]>(API_URL, { params });
  }

  getById(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${API_URL}/${id}`);
  }

  create(payload: Partial<Paciente>): Observable<Paciente> {
    return this.http.post<Paciente>(API_URL, payload);
  }

  update(id: number, payload: Partial<Paciente>): Observable<Paciente> {
    return this.http.put<Paciente>(`${API_URL}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
