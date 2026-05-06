import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, UsuarioCreate } from '../models/usuario.model';

const API_URL = `${environment.apiUrl}/api/usuarios`;

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);

  list(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(API_URL);
  }

  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${API_URL}/${id}`);
  }

  create(payload: UsuarioCreate): Observable<Usuario> {
    return this.http.post<Usuario>(API_URL, payload);
  }

  update(id: number, payload: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${API_URL}/${id}`, payload);
  }

  toggleAtivo(id: number, ativo: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${API_URL}/${id}/ativo`, { ativo });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
