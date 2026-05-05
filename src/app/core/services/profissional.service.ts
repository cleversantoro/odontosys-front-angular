import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Profissional } from '../models/profissional.model';

const API_URL = `${environment.apiUrl}/api/profissionais`;

@Injectable({ providedIn: 'root' })
export class ProfissionalService {
  private http = inject(HttpClient);

  list(): Observable<Profissional[]> {
    return this.http.get<Profissional[]>(API_URL);
  }

  getById(id: number): Observable<Profissional> {
    return this.http.get<Profissional>(`${API_URL}/${id}`);
  }

  create(payload: Partial<Profissional>): Observable<Profissional> {
    return this.http.post<Profissional>(API_URL, payload);
  }

  update(id: number, payload: Partial<Profissional>): Observable<Profissional> {
    return this.http.put<Profissional>(`${API_URL}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
