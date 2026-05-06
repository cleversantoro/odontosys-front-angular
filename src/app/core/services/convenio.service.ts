import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Convenio } from '../models/convenio.model';

const API_URL = `${environment.apiUrl}/api/convenios`;

@Injectable({ providedIn: 'root' })
export class ConvenioService {
  private http = inject(HttpClient);

  list(): Observable<Convenio[]> {
    return this.http.get<Convenio[]>(API_URL);
  }

  getById(id: number): Observable<Convenio> {
    return this.http.get<Convenio>(`${API_URL}/${id}`);
  }

  create(payload: Partial<Convenio>): Observable<Convenio> {
    return this.http.post<Convenio>(API_URL, payload);
  }

  update(id: number, payload: Partial<Convenio>): Observable<Convenio> {
    return this.http.put<Convenio>(`${API_URL}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
