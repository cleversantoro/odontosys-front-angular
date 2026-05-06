# Plano de Execução — OdontoSys Angular
> Marque cada item com `[x]` ao concluir. Siga a ordem de cima para baixo.

---

## FASE 1 — Correções de Base (Infraestrutura)
> Sem essas correções, o projeto não compila ou não funciona corretamente.

### 1.1 Corrigir `tsconfig.json`
- [x] Adicionar `"rootDir": "./src"` no `tsconfig.json` para eliminar o erro de compilação
- **Arquivo:** `tsconfig.json`
- **Resultado esperado:** `ng build` sem erros de configuração

### 1.2 Configurar `appConfig` corretamente
- [x] Adicionar `provideAnimations()` no array `providers` do `app.config.ts`
- [x] Verificar se `provideHttpClient()` está com `withInterceptorsFromDi()` (já está, confirmar)
- **Arquivo:** `src/app/app.config.ts`
- **Resultado esperado:** Animações do template UI funcionando

### 1.3 Unificar `environment` em todos os serviços
- [x] Remover `http://localhost:5000` hardcoded de `pacientes-add.component.ts`
- [x] Remover `http://localhost:5000` hardcoded de `pacientes-detail.component.ts`
- [x] Substituir por `environment.apiUrl + '/api/pacientes'`
- **Arquivos:** `src/app/pages/paciente/pacientes-add/`, `pacientes-detail/`
- **Resultado esperado:** URL da API controlada pelo environment

### 1.4 Padronizar padrão de chamadas HTTP
- [x] Decidir padrão único: **Observables (recomendado para Angular)**
- [x] Refatorar `PacientesService` para usar Observables em vez de `firstValueFrom`
- **Arquivo:** `src/app/core/services/paciente.service.ts`
- **Resultado esperado:** Padrão consistente em todos os serviços

### 1.5 Unificar model `Paciente`
- [x] Remover a interface `Paciente` de dentro de `paciente.service.ts`
- [x] Importar `Paciente` de `core/models/paciente.model.ts` no serviço
- **Arquivos:** `src/app/core/services/paciente.service.ts`, `src/app/core/models/paciente.model.ts`
- **Resultado esperado:** Uma única fonte de verdade para o model

---

## FASE 2 — Models (Contratos de Dados)
> Antes de implementar os serviços, os models precisam estar corretos.

### 2.1 Completar model `Profissional`
- [x] Adicionar campos: `cro`, `especialidade`, `departamentos`, `status` (ativo/inativo), `telefone`
- **Arquivo:** `src/app/core/models/profissional.model.ts`

### 2.2 Completar model `Agendamento`
- [x] Adicionar campos: `duracao`, `tipoProcedimento`, `sala`, `titulo`, `cor`
- **Arquivo:** `src/app/core/models/agendamento.model.ts`

### 2.3 Completar model `Consulta`
- [x] Adicionar campos: `procedimentos`, `valorCobrado`, `observacoes`, `dataConclusao`
- **Arquivo:** `src/app/core/models/consulta.model.ts`

### 2.4 Criar model `Orcamento`
- [x] Criar arquivo `src/app/core/models/orcamento.model.ts`
- [x] Definir campos: `id`, `pacienteId`, `profissionalId`, `itens[]`, `valorTotal`, `status`, `validade`, `createdAt`

### 2.5 Criar model `Financeiro`
- [x] Criar arquivo `src/app/core/models/financeiro.model.ts`
- [x] Definir campos: `id`, `tipo` (receita/despesa), `descricao`, `valor`, `data`, `categoria`, `status`

### 2.6 Criar model `Usuario`
- [x] Criar arquivo `src/app/core/models/usuario.model.ts`
- [x] Definir campos: `id`, `nome`, `email`, `perfil`, `ativo`, `createdAt`

---

## FASE 3 — Autenticação (Segurança Crítica)
> Nenhuma rota está protegida. Esta fase é obrigatória antes de qualquer deploy.

### 3.1 Criar `AuthService`
- [x] Criar `src/app/core/services/auth.service.ts`
- [x] Implementar método `login(email, senha)` — chamar `POST /api/auth/login`
- [x] Implementar armazenamento de JWT no `localStorage` ou `sessionStorage`
- [x] Implementar método `logout()` — limpar token e redirecionar para `/sign-in`
- [x] Implementar `isLoggedIn()` — verificar se token existe e não está expirado
- [x] Implementar `getToken()` — retornar token atual
- [x] Implementar `getUsuarioAtual()` — retornar dados do usuário logado (decode do JWT)

### 3.2 Criar `AuthGuard`
- [x] Criar `src/app/core/guards/auth.guard.ts`
- [x] Implementar `CanActivateFn` que verifica `AuthService.isLoggedIn()`
- [x] Redirecionar para `/sign-in` caso não autenticado

### 3.3 Criar HTTP Interceptor de autenticação
- [x] Criar `src/app/core/interceptors/auth.interceptor.ts`
- [x] Adicionar header `Authorization: Bearer <token>` em todas as requisições
- [x] Tratar resposta 401: chamar `AuthService.logout()` automaticamente
- [x] Registrar o interceptor no `app.config.ts`

### 3.4 Conectar formulário de login à API
- [x] Implementar `onSignIn()` no `SigninFormComponent` chamando `AuthService.login()`
- [x] Exibir mensagem de erro em caso de credenciais inválidas
- [x] Redirecionar para `/` (dashboard) após login bem-sucedido
- **Arquivo:** `src/app/shared/components/auth/signin-form/signin-form.component.ts`

### 3.5 Proteger todas as rotas com `AuthGuard`
- [x] Adicionar `canActivate: [authGuard]` no componente `AppLayoutComponent` no `app.routes.ts`
- [x] Verificar que rotas de autenticação (`/sign-in`, `/sign-up`) ficam fora do guard
- **Arquivo:** `src/app/app.routes.ts`

### 3.6 Conectar formulário de cadastro (`sign-up`) à API
- [x] Implementar lógica de criação de usuário no `SignupFormComponent`
- [x] Chamar `POST /api/auth/register` (endpoint real da API)
- [x] Redirecionar para `/sign-in` após cadastro

---

## FASE 4 — Correções de Rotas
> Corrigir rotas quebradas que impedem navegação correta.

### 4.1 Corrigir rota de detalhe do Paciente
- [x] Alterar rota de `paciente/detalhe` para `paciente/detalhe/:id` no `app.routes.ts`
- [x] Atualizar links de navegação na lista de pacientes para passar o ID
- **Arquivo:** `src/app/app.routes.ts`

### 4.2 Corrigir rota de detalhe do Profissional
- [x] Alterar rota de `profissional/detalhe` para `profissional/detalhe/:id`
- [x] Atualizar links de navegação na lista de profissionais
- **Arquivo:** `src/app/app.routes.ts`

### 4.3 Adicionar Tratamento de Erro HTTP Global
- [x] Criar `src/app/core/interceptors/error.interceptor.ts`
- [x] Tratar 401: redirecionar para login (via `authInterceptor` existente)
- [x] Tratar 403: exibir mensagem de acesso negado (via `ToastService`)
- [x] Tratar 500/502/503: exibir mensagem genérica de erro
- [x] Registrar no `app.config.ts`

---

## FASE 5 — Serviços de Negócio
> Criar os serviços que alimentarão as páginas.

### 5.1 Criar `ProfissionalService`
- [x] Criar `src/app/core/services/profissional.service.ts`
- [x] Implementar: `list()`, `getById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)`
- [x] Usar `environment.apiUrl + '/api/profissionais'`

### 5.2 Criar `AgendamentoService`
- [x] Criar `src/app/core/services/agendamento.service.ts`
- [x] Implementar: `list()`, `listByPeriodo(inicio, fim)`, `create(payload)`, `update(id, payload)`, `remove(id)`
- [x] Usar `environment.apiUrl + '/api/agendamentos'`

### 5.3 Criar `ConvenioService`
- [x] Criar `src/app/core/services/convenio.service.ts`
- [x] Implementar: `list()`, `getById(id)`, `create(payload)`, `update(id, payload)`, `remove(id)`

### 5.4 Criar `OrcamentoService`
- [x] Criar `src/app/core/services/orcamento.service.ts`
- [x] Implementar: `list()`, `getByPaciente(pacienteId)`, `create(payload)`, `update(id, payload)`, `aprovar(id)`, `recusar(id)`

### 5.5 Criar `FinanceiroService`
- [x] Criar `src/app/core/services/financeiro.service.ts`
- [x] Implementar: `listReceitas()`, `listDespesas()`, `resumoMensal()`, `createPagamento(payload)`, `createDespesa(payload)`

### 5.6 Criar `DashboardService`
- [x] Criar `src/app/core/services/dashboard.service.ts`
- [x] Implementar: `getKPIs()` — consultas do dia, total pacientes, receita do mês, agendamentos pendentes

### 5.7 Completar `ConsultaService`
- [x] Adicionar métodos: `create(payload)`, `update(id, payload)`, `remove(id)`, `getById(id)`
- **Arquivo:** `src/app/core/services/consulta.service.ts`

---

## FASE 6 — Módulo Profissional
> Completar as três páginas do módulo, atualmente todas vazias.

### 6.1 Implementar `ProfissionalListComponent`
- [x] Injetar `ProfissionalService`
- [x] Carregar lista com `ngOnInit`
- [x] Implementar busca/filtro por nome e e-mail
- [x] Implementar paginação (padrão igual ao de Pacientes)
- [x] Adicionar botões: Novo, Ver/Editar, Excluir
- [x] Implementar exportação PDF/Excel
- **Arquivo:** `src/app/pages/profissional/profissional-list/`

### 6.2 Implementar `ProfissionalAddComponent`
- [x] Criar formulário com campos: nome, email, data nascimento, sexo (campos suportados pela API)
- [x] Validações de campos obrigatórios
- [x] Conectar ao `ProfissionalService.create()`
- [x] Feedback de sucesso/erro (toast)
- [x] Redirecionar para lista após salvar
- **Arquivo:** `src/app/pages/profissional/profissional-add/`

### 6.3 Implementar `ProfissionalDetailComponent`
- [x] Ler parâmetro `:id` da rota via `ActivatedRoute`
- [x] Carregar dados do profissional via `ProfissionalService.getById(id)`
- [x] Exibir formulário pré-preenchido para edição
- [x] Conectar ao `ProfissionalService.update(id, payload)`
- [x] Botão de exclusão com confirmação
- **Arquivo:** `src/app/pages/profissional/profissional-detail/`

---

## FASE 7 — Módulo Paciente (Correções)
> As páginas existem mas têm problemas funcionais.

### 7.1 Corrigir `PacientesAddComponent`
- [x] Substituir `HttpClient` direto por `PacientesService`
- [x] Remover `API_URL` hardcoded
- [x] Redirecionar para lista após cadastro bem-sucedido
- [x] Adicionar feedback visual (toast/spinner)
- **Arquivo:** `src/app/pages/paciente/pacientes-add/`

### 7.2 Corrigir `PacientesDetailComponent`
- [x] Ler parâmetro `:id` da rota via `ActivatedRoute`
- [x] Carregar dados via `PacientesService.getById(id)` e pré-preencher formulário
- [x] Substituir `HttpClient` direto por `PacientesService`
- [x] Conectar botão salvar ao `PacientesService.update(id, payload)`
- [x] Remover `API_URL` hardcoded
- **Arquivo:** `src/app/pages/paciente/pacientes-detail/`

### 7.3 Corrigir `PacientesListComponent`
- [x] Verificar e corrigir link "Ver detalhe" para navegar com ID: `[routerLink]="['/paciente/detalhe', row.id]"`
- **Arquivo:** `src/app/pages/paciente/pacientes-list/`

---

## FASE 8 — Módulo Agendamento (Calendário)
> Integrar o FullCalendar com a API de agendamentos.

### 8.1 Integrar `CalenderComponent` com `AgendamentoService`
- [x] Injetar `AgendamentoService`
- [x] Substituir lista de eventos hardcoded por chamada à API
- [x] Mapear `Agendamento` para o formato `EventInput` do FullCalendar
- [x] Implementar criação de agendamento ao clicar em data vazia (chamar `AgendamentoService.create()`)
- [x] Implementar edição ao clicar em evento existente
- [x] Implementar exclusão de agendamento
- [x] Exibir nome do paciente e profissional no evento do calendário
- **Arquivo:** `src/app/pages/calender/calender.component.ts`

### 8.2 Melhorar modal de agendamento
- [x] Adicionar seletor de Paciente (autocomplete via `PacientesService`)
- [x] Adicionar seletor de Profissional (via `ProfissionalService`)
- [x] Adicionar seletor de Convênio (via `ConvenioService`)
- [x] Campo de tipo de procedimento
- [x] Campo de observações

---

## FASE 9 — Módulo Consulta (Melhorias)
> A página existe mas tem bug e funcionalidades incompletas.

### 9.1 Corrigir bug de ordenação no `ConsultaComponent`
- [x] Corrigir o callback de `Array.sort` em `filtradas` — deve retornar resultado de comparação, não timestamp
- **Arquivo:** `src/app/pages/consulta/consulta.component.ts`

### 9.2 Adicionar CRUD de Consultas
- [x] Botão "Nova Consulta" abrindo modal/formulário
- [x] Conectar ao `ConsultaService.create()`
- [x] Botão editar consulta existente
- [x] Conectar ao `ConsultaService.update()`
- [x] Botão excluir com confirmação

---

## FASE 10 — Novos Módulos de Negócio

### 10.1 Criar módulo Convênios
- [x] Criar `src/app/pages/convenios/` com: `convenios-list/`, `convenios-add/`, `convenios-detail/`
- [x] Adicionar rotas no `app.routes.ts`
- [x] Adicionar item no menu lateral

### 10.2 Criar módulo Orçamento / Plano de Tratamento
- [x] Criar `src/app/pages/orcamento/` com: `orcamento-list/`, `orcamento-add/`, `orcamento-detail/`
- [x] Formulário com itens (procedimentos, dentes, valores)
- [x] Fluxo de aprovação (pendente → aprovado/recusado)
- [x] Adicionar rotas e menu

### 10.3 Criar módulo Financeiro
- [x] Criar `src/app/pages/financeiro/` com: `financeiro-list/`, `financeiro-add/`
- [x] Separar receitas e despesas
- [ ] Gráfico de fluxo de caixa mensal
- [x] Adicionar rotas e menu

### 10.4 Criar módulo Usuários e Permissões
- [x] Criar `src/app/pages/usuarios/` com: `usuarios-list/`, `usuarios-add/`, `usuarios-detail/`
- [x] Gestão de perfis (admin, dentista, recepcionista)
- [x] Ativar/inativar usuário
- [x] Adicionar rotas e menu (visível apenas para admin)

---

## FASE 11 — Dashboard Real

### 11.1 Implementar KPIs reais no Dashboard
- [x] Conectar `EcommerceComponent` ao `DashboardService`
- [x] Exibir: consultas do dia, agendamentos pendentes, novos pacientes do mês
- [x] Exibir: receita do mês vs. mês anterior
- [x] Gráfico de consultas por semana
- [x] Gráfico de procedimentos mais realizados
- **Arquivo:** `src/app/pages/dashboard/ecommerce/`

---

## FASE 12 — Relatórios e Exportação

### 12.1 Criar módulo Relatórios
- [x] Criar `src/app/pages/relatorios/relatorios.component.ts`
- [x] Relatório de pacientes (com filtros por período, convênio)
- [x] Relatório de consultas (por profissional, período, status)
- [x] Relatório financeiro (receitas, despesas, saldo)
- [x] Exportação em PDF e Excel
- [x] Adicionar rota e menu

---

## Progresso Geral

| Fase | Descrição | Status |
|------|-----------|--------|
| Fase 1 | Correções de Base (Infraestrutura) | ⬜ Não iniciada |
| Fase 2 | Models (Contratos de Dados) | ⬜ Não iniciada |
| Fase 3 | Autenticação e Segurança | ⬜ Não iniciada |
| Fase 4 | Correções de Rotas | ⬜ Não iniciada |
| Fase 5 | Serviços de Negócio | ⬜ Não iniciada |
| Fase 6 | Módulo Profissional | ⬜ Não iniciada |
| Fase 7 | Módulo Paciente (Correções) | ⬜ Não iniciada |
| Fase 8 | Módulo Agendamento | ⬜ Não iniciada |
| Fase 9 | Módulo Consulta (Melhorias) | ⬜ Não iniciada |
| Fase 10 | Novos Módulos de Negócio | ⬜ Não iniciada |
| Fase 11 | Dashboard Real | ⬜ Não iniciada |
| Fase 12 | Relatórios e Exportação | ⬜ Não iniciada |

> Atualize o status da tabela conforme conclui cada fase:
> - ⬜ Não iniciada
> - 🔄 Em andamento
> - ✅ Concluída
