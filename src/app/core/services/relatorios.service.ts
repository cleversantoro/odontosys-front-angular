import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paciente } from '../models/paciente.model';
import { Agendamento } from '../models/agendamento.model';
import { Pagamento, Despesa } from '../models/financeiro.model';

export interface RelPacienteRow {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  convenio: string;
  createdAt: string;
}

export interface RelConsultaRow {
  id: number;
  data: string;
  paciente: string;
  profissional: string;
  tipoProcedimento: string;
  status: string;
  convenio: string;
}

export interface RelFinanceiroRow {
  id: number;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
}

export interface RelatorioData {
  pacientes: any[];
  convenios: any[];
  agendamentos: any[];
  profissionais: any[];
  receitas: Pagamento[];
  despesas: Despesa[];
}

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class RelatoriosService {
  private http = inject(HttpClient);

  loadAll(): Observable<RelatorioData> {
    return forkJoin({
      pacientes:    this.http.get<any[]>(`${API}/api/pacientes`),
      convenios:    this.http.get<any[]>(`${API}/api/convenios`),
      agendamentos: this.http.get<any[]>(`${API}/api/agendamentos`),
      profissionais:this.http.get<any[]>(`${API}/api/profissionais`),
      receitas:     this.http.get<Pagamento[]>(`${API}/api/pagamentos`),
      despesas:     this.http.get<Despesa[]>(`${API}/api/despesas`),
    }) as Observable<RelatorioData>;
  }
}
