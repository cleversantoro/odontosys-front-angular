# Análise do Projeto Angular — OdontoSys
> Data: Maio/2026

---

## 1. Resumo Executivo

O projeto Angular está baseado num template TailAdmin e possui estrutura de rotas, modelos e alguns serviços parcialmente implementados. A maioria das páginas de negócio (Profissional, Agendamento, Financeiro, Orçamento etc.) está vazia ou com dados estáticos. Autenticação existe na UI mas não está conectada ao backend.

---

## 2. Problemas de Configuração

| Item | Problema | Arquivo |
|------|----------|---------|
| `tsconfig.json` | Erro de compilação: `rootDir` não definido, mas `outDir` está configurado | `tsconfig.json:6` |
| URLs hardcoded | `http://localhost:5000` direto no código em vez de usar `environment.apiUrl` | `pacientes-add.component.ts`, `pacientes-detail.component.ts` |
| `appConfig` | Falta `provideAnimations()` — necessário para animações de componentes UI do template | `app.config.ts` |
| Inconsistência de padrão | `PacientesService` usa `firstValueFrom` (Promise), `ConsultaService` usa Observables — padrão misto | `core/services/` |

---

## 3. Autenticação e Segurança (crítico)

- **`SigninFormComponent.onSignIn()`** faz apenas `console.log` — não chama nenhuma API, não armazena token, não redireciona o usuário.
- **Sem `AuthService`** — nenhum serviço gerencia JWT, refresh token ou logout.
- **Sem `AuthGuard`** — todas as rotas estão acessíveis sem login. Qualquer usuário acessa `/paciente/lista`, `/profissional/lista` etc. sem autenticação.
- **Sem HTTP Interceptor de autenticação** — nenhuma requisição envia o header `Authorization: Bearer <token>`.
- **Sem tratamento de erro HTTP global** — erros 401/403/500 não são tratados de forma centralizada.
- **Página de Sign-Up** (`/sign-up`) — existe a rota mas o formulário de cadastro não está integrado com a API.

---

## 4. Serviços Faltando

| Serviço | Status | Impacto |
|---------|--------|---------|
| `ProfissionalService` | **Ausente** | Páginas de profissional completamente sem dados |
| `AgendamentoService` | **Ausente** | Calendário usa dados estáticos hardcoded |
| `ConvenioService` | **Ausente** | Nenhuma tela de convênios |
| `AuthService` | **Ausente** | Login sem funcionalidade |
| `DashboardService` | **Ausente** | Dashboard exibe dados de template genérico |
| `OrcamentoService` | **Ausente** | Módulo inexistente |
| `FinanceiroService` | **Ausente** | Módulo inexistente |

---

## 5. Páginas/Componentes Incompletos ou Vazios

### 5.1 Profissional
- **`ProfissionalListComponent`** — corpo completamente vazio (`{}`), sem lógica, sem dados, sem HTML funcional.
- **`ProfissionalAddComponent`** — corpo vazio, sem formulário de cadastro.
- **`ProfissionalDetailComponent`** — corpo vazio, sem lógica de carregamento.

### 5.2 Paciente
- **`PacientesDetailComponent`** — replica o código de `PacientesAddComponent` mas **não carrega os dados do paciente** por ID. Não usa parâmetro de rota.
- **`PacientesAddComponent`** — não usa `PacientesService`, faz HTTP diretamente com URL hardcoded.

### 5.3 Agendamento (Calendário)
- **`CalenderComponent`** — usa lista de eventos **estáticos e hardcoded**. Não conectado à API de agendamentos. Não usa `AgendamentoService`. Ao criar/editar eventos, nada é salvo no backend.

### 5.4 Consulta
- **`ConsultaComponent`** — filtragem e paginação feitas **apenas no frontend** (client-side). Sem funcionalidade de criação/edição/exclusão de consultas. Bug no `Array.sort`: o callback retorna apenas o timestamp do primeiro item em vez do resultado da comparação, fazendo a ordenação não funcionar corretamente.

### 5.5 Dashboard
- **`EcommerceComponent`** — template genérico do TailAdmin com dados fictícios. Não exibe KPIs reais da clínica (consultas do dia, pacientes, receita etc.).

---

## 6. Rotas com Problemas

| Rota | Problema |
|------|----------|
| `/paciente/detalhe` | Sem parâmetro `:id` na rota — impossível saber qual paciente carregar |
| `/profissional/detalhe` | Mesmo problema — sem `:id` |
| Todas as rotas filhas | Sem `canActivate: [AuthGuard]` — nenhuma rota está protegida |

---

## 7. Módulos de Negócio Completamente Ausentes

Os seguintes módulos existem no sistema (visíveis nas APIs e scripts SQL) mas **não possuem nenhuma página Angular**:

- **Orçamento / Plano de Tratamento** — sem rota, sem componente, sem serviço
- **Financeiro** — receitas, despesas, fluxo de caixa (existe HTML estático em `doc/htm/financeiro.html`)
- **Convênios** — cadastro e listagem de convênios
- **Relatórios** — impressão/exportação de dados clínicos
- **Usuários e Permissões** — gerenciamento de acesso

---

## 8. Models Incompletos ou Duplicados

| Model | Problema |
|-------|----------|
| `Paciente` | Definido duas vezes: em `paciente.model.ts` e dentro de `paciente.service.ts` (duplicação) |
| `Profissional` | Faltam campos: CRO, especialidade, departamentos, status (ativo/inativo) |
| `Agendamento` | Faltam campos: duração, tipo de procedimento, sala/cadeira |
| `Consulta` | Sem campos de procedimentos realizados ou valor cobrado |

---

## 9. Prioridade de Implementação Sugerida

### Alta Prioridade
1. `AuthService` + `AuthGuard` + HTTP Interceptor de token
2. Corrigir rotas `/paciente/detalhe/:id` e `/profissional/detalhe/:id`
3. `ProfissionalService` + implementar páginas de Profissional (list, add, detail)
4. `AgendamentoService` + integrar `CalenderComponent` com a API

### Média Prioridade
5. Eliminar URLs hardcoded — usar `environment.apiUrl` em todos os serviços
6. Padronizar padrão de HTTP (Observables ou Promises, não os dois)
7. Módulo de Orçamento/Plano de Tratamento
8. Módulo Financeiro
9. Corrigir `tsconfig.json` (`rootDir` faltando)

### Baixa Prioridade
10. Dashboard com KPIs reais
11. Módulo de Convênios
12. Módulo de Relatórios
13. Módulo de Usuários/Permissões
14. Tratamento de erro HTTP global (interceptor)
15. Unificar definição do model `Paciente`
- **Suggested Task:** Rewrite the comparator to compare two items (e.g., `return dateB - dateA`) so consultations render in the intended order.

## Documentation / Comment Discrepancy
- **Location:** `src/app/core/models/consultaCompleto.model.ts`, file header comment.
- **Issue:** Comment still references `consulta.model.ts` even though the file defines `ConsultaCompleto`, which can mislead readers.
- **Suggested Task:** Update the header comment to mention `consultaCompleto.model.ts` so the documentation aligns with the file contents.

## Test Improvement Opportunity
- **Location:** `src/app/pages/consulta/consulta.component.ts`, helper methods `formatarDataBR`, `formatarHoraBR` and `idadeDe`.
- **Issue:** These pure-formatting helpers lack unit tests, leaving date parsing edge cases (invalid strings, ISO formats, timezone handling) unverified.
- **Suggested Task:** Introduce a dedicated spec (e.g., `consulta.component.spec.ts`) that instantiates the component and asserts the expected outputs for valid and invalid inputs, improving regression coverage.
