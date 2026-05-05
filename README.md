# OdontoSys — Frontend Angular

Sistema de gestão odontológica — módulo frontend desenvolvido em **Angular 20** com **Tailwind CSS v4**, consumindo a API REST `odontosys-api` (Node.js + Sequelize).

---

## Stack

| Tecnologia | Versão |
|------------|--------|
| Angular | 20.x |
| TypeScript | 5.8.x |
| Tailwind CSS | 4.x |
| RxJS | 7.8.x |
| FullCalendar | 6.x |
| jsPDF + AutoTable | 3.x / 5.x |
| XLSX | 0.18.x |
| ApexCharts | 5.x |

---

## Módulos implementados

| Módulo | Status |
|--------|--------|
| Pacientes (lista, cadastro, detalhe) | Funcional |
| Profissionais (lista, cadastro, detalhe) | Em desenvolvimento |
| Agendamento (calendário FullCalendar) | Parcial — dados estáticos |
| Consultas | Parcial — somente leitura |
| Autenticação (login / cadastro) | UI pronta — integração pendente |
| Dashboard | Template — dados fictícios |
| Convênios | Não iniciado |
| Orçamento / Plano de Tratamento | Não iniciado |
| Financeiro | Não iniciado |
| Relatórios | Não iniciado |

---

## Pré-requisitos

- **Node.js 20.x ou superior**
- **Angular CLI 20.x** instalado globalmente:

```bash
npm install -g @angular/cli
```

- **API `odontosys-api`** rodando em `http://localhost:5000`  
  (configurável em `src/environments/environment.ts`)

---

## Instalação

```bash
git clone https://github.com/cleversantoro/odontosys-front-angular.git
cd odontosys-front-angular
npm install
```

---

## Configuração

Edite `src/environments/environment.ts` para apontar para a sua API:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000',
};
```

Para produção, edite `src/environments/environment.prod.ts`.

---

## Executar em desenvolvimento

```bash
npm start
```

Acesse: `http://localhost:4200`

---

## Build de produção

```bash
npm run build
```

Os artefatos são gerados em `dist/`.

---

## Estrutura de pastas relevante

```
src/app/
├── core/
│   ├── models/        # Interfaces TypeScript (Paciente, Profissional, Agendamento…)
│   └── services/      # Serviços HTTP (PacientesService, ConsultaService…)
├── pages/
│   ├── paciente/      # Lista, cadastro e detalhe de pacientes
│   ├── profissional/  # Lista, cadastro e detalhe de profissionais
│   ├── consulta/      # Listagem de consultas
│   ├── calender/      # Agendamento (FullCalendar)
│   ├── auth-pages/    # Login e cadastro de usuário
│   └── dashboard/     # Página inicial
└── shared/
    ├── components/    # Componentes reutilizáveis (header, sidebar, modais…)
    └── layout/        # Layouts da aplicação
```

---

## Plano de execução

Consulte [PLANO_EXECUCAO.md](./PLANO_EXECUCAO.md) para acompanhar o progresso de desenvolvimento e os itens pendentes.

---

## Repositórios relacionados

| Repositório | Descrição |
|-------------|-----------|
| [odontosys-api](https://github.com/cleversantoro/odontosys-api) | API REST Node.js + Sequelize |
| [odontosys-front-angular](https://github.com/cleversantoro/odontosys-front-angular) | Este repositório |
