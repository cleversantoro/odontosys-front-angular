import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagamento, Despesa, ResumoFinanceiro } from '../models/financeiro.model';

const PAGAMENTOS_URL = `${environment.apiUrl}/api/pagamentos`;
const DESPESAS_URL = `${environment.apiUrl}/api/despesas`;

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  private http = inject(HttpClient);

  listReceitas(): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(PAGAMENTOS_URL);
  }

  listDespesas(): Observable<Despesa[]> {
    return this.http.get<Despesa[]>(DESPESAS_URL);
  }

  /**
   * Calcula o resumo financeiro de um mês combinando receitas e despesas.
   * @param mes Formato "YYYY-MM", ex: "2026-05"
   */
  resumoMensal(mes: string): Observable<ResumoFinanceiro> {
    return forkJoin({
      receitas: this.listReceitas(),
      despesas: this.listDespesas(),
    }).pipe(
      map(({ receitas, despesas }) => {
        const filtraMes = (data: string) => data?.startsWith(mes);

        const totalReceitas = receitas
          .filter(r => filtraMes(r.data))
          .reduce((sum, r) => sum + Number(r.valor), 0);

        const totalDespesas = despesas
          .filter(d => filtraMes(d.data))
          .reduce((sum, d) => sum + Number(d.valor), 0);

        return {
          mes,
          totalReceitas,
          totalDespesas,
          saldo: totalReceitas - totalDespesas,
        } satisfies ResumoFinanceiro;
      })
    );
  }

  createPagamento(payload: Partial<Pagamento>): Observable<Pagamento> {
    return this.http.post<Pagamento>(PAGAMENTOS_URL, payload);
  }

  createDespesa(payload: Partial<Despesa>): Observable<Despesa> {
    return this.http.post<Despesa>(DESPESAS_URL, payload);
  }
}
