# UP Estudos — Foco em Resultados

<div align="center">

![UP Estudos](https://img.shields.io/badge/UP_Estudos-v2.0.0-0A0A0B?style=for-the-badge&logo=vercel)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-5.4.0-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-2.103.0-3ECF8E?style=flat&logo=supabase)](https://supabase.com)
[![Netlify](https://img.shields.io/badge/Netlify-Host-00AD9F?style=flat&logo=netlify)](https://netlify.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-0A0A0B?style=flat)](https://web.dev/progressive-web-apps)

**UP Estudos** é um webapp progressivo de gestão de estudos voltado para **certificações profissionais** (AWS, Linux, CompTIA, etc.). Projetado com foco em ação — cada tela mostra o próximo passo. Zero distração.

[Acessar Demo](https://fluxodeestudo.netlify.app/) · [Reportar Bug](https://github.com/waldosouzaup/studyflow/issues) · [Contribuir](#contribuição)

</div>

---

## Sumário

1. [Sobre o Projeto](#sobre-o-projeto)
2. [Design System](#design-system)
3. [Funcionalidades](#funcionalidades)
4. [Tecnologias](#tecnologias)
5. [Arquitetura](#arquitetura)
6. [Banco de Dados](#banco-de-dados)
7. [Instalação e Execução](#instalação-e-execução)
8. [Deploy](#deploy)

---

## Sobre o Projeto

UP Estudos é uma plataforma de estudo **orientada a resultados**. Diferente de apps genéricos de produtividade, o UP Estudos foi construído para quem precisa:

- Manter **consistência** diária de estudo
- Controlar **revisões espaçadas** para retenção máxima
- Visualizar **progresso real** rumo a uma certificação
- Estudar com **foco total** — sem interfaces poluídas

### Fluxo Principal

```
Dashboard → Próxima Sessão → Timer → Registro → Revisão Automática → Progresso
```

O dashboard mostra **uma ação principal** (a próxima sessão de estudo) + métricas contextuais mínimas. Sem sobrecarga cognitiva.

---

## Design System

### Identidade Visual: "Momentum Dark"

O design segue o conceito **"Momentum Dark"** — dark-first com acentos vibrantes que comunicam progresso e ação.

| Token | Cor | Uso |
|-------|-----|-----|
| `--accent` | `#10B981` (Emerald) | Ação principal, progresso, CTA |
| `--gold` | `#F59E0B` (Amber) | Conquistas, metas, streaks |
| `--danger` | `#EF4444` (Red) | Urgência, atrasados, erros |
| `--bg-base` | `#0A0A0B` | Fundo principal (dark mode) |

### Tipografia

- **Headlines**: Space Grotesk (geométrica, moderna, 700)
- **Body/Labels**: Inter (legibilidade, 400-500)

### Geometria

- **Border-radius**: 2-4px (sharp, profissional)
- **Cards**: Bordas sutis (`1px solid var(--border)`)
- **Sem glassmorphism** — visual sólido e direto

### Navegação

```
Mobile (< 1024px):
┌─────────────────────────────────┐
│     [Top bar: Logo + Avatar]    │
│                                 │
│        [Conteúdo]               │
│                                 │
├──────┬──────┬──────┬──────┬─────┤
│ Home │Sessão│Assun.│Plano │Mais │
└──────┴──────┴──────┴──────┴─────┘

Desktop (≥ 1024px):
┌────────┬────────────────────────┐
│Sidebar │                        │
│ 240px  │     [Conteúdo]         │
│        │                        │
│  Home  │                        │
│ Sessão │                        │
│  ...   │                        │
│        │                        │
│ [User] │                        │
└────────┴────────────────────────┘
```

---

## Funcionalidades

### 🏠 Dashboard — Action First

- **Card de ação** com a próxima sessão de estudo
- Botão "COMEÇAR AGORA" proeminente
- 4 KPIs compactos: Sequência, Hoje, Progresso, Semana
- Heatmap de atividade (12 meses)
- Plano do dia com checklist inline
- Alerta contextual de revisões pendentes

### ⏱ Timer — Sessão de Estudo

- Cronômetro grande e imersivo
- Estados visuais claros: verde (ativo), dourado (pausado)
- Modos: Contínua e Pomodoro
- Registro simplificado pós-sessão:
  - Dificuldade (Fácil / Médio / Difícil)
  - Nível de Foco (Baixo / Normal / Alto)
  - Notas (opcional)
- Agendamento de revisão integrado (1 dia / 3 dias / 7 dias)
- Modo Zen (fullscreen) via FAB
- **Offline-first**: sessões salvas no IndexedDB quando sem conexão

### 📚 Assuntos

- Grid de cards compacto com indicador de cor
- Edição/exclusão inline (hover actions)
- Paleta de 10 cores selecionáveis

### 📋 Planejamento

- Checklist com toggle de conclusão
- Barra de progresso (tarefas concluídas/total)
- Visualizações: Hoje e Semana
- Prioridade visual (baixa/média/alta)
- Tempo estimado por tarefa

### 🔄 Revisões Espaçadas

- Agrupamento por data com indicador de urgência
- Badge de revisões atrasadas
- Reagendamento rápido (+1 dia / +7 dias)
- Filtros: Ativas, Concluídas, Puladas

### 📊 Metas de Desempenho

- Ciclos: Diário, Semanal, Mensal
- Progress bars com cores semânticas (verde = progresso, dourado = meta atingida)
- Toggle ativo/pausado por meta
- Cálculo automático baseado nas sessões reais

### 🎨 Sistema de Temas

- Dark mode (padrão) e Light mode
- Opção "Sistema" (segue o OS)
- Transição instantânea via CSS Variables

---

## Tecnologias

### Frontend

| Tecnologia | Versão | Papel |
|------------|--------|-------|
| React | 18.3.1 | Motor de renderização (SPA) |
| TypeScript | 5.5.0 | Tipagem estrita, zero `any` |
| Tailwind CSS | 3.4.0 | Utility-first com CSS Variables |
| TanStack Query | 5.99.0 | Cache, mutations, refetch inteligente |
| Zustand | 5.0.12 | State global (auth + theme) |
| Vite | 5.4.0 | Build tool + HMR |
| React Router | 6.x | Roteamento SPA |
| date-fns | 4.x | Manipulação de datas |

### PWA & Offline

| Tecnologia | Papel |
|------------|-------|
| vite-plugin-pwa | Service Worker + instalação nativa |
| idb | IndexedDB para sessões offline |

### Backend (BaaS)

| Tecnologia | Papel |
|------------|-------|
| Supabase (v2.103.0) | Auth (Google OAuth), PostgreSQL, RLS |

---

## Arquitetura

```text
src/
├── components/        # Layout, Modais, Heatmap, Loading
│   ├── Layout.tsx     # Shell: sidebar (desktop) + bottom nav (mobile)
│   ├── SettingsModal.tsx
│   ├── StudyHeatmap.tsx
│   └── Loading.tsx
├── pages/             # Páginas da aplicação
│   ├── Dashboard.tsx  # Action-first dashboard
│   ├── Timer.tsx      # Sessão imersiva
│   ├── Subjects.tsx   # Gestão de assuntos
│   ├── Plans.tsx      # Planejamento diário/semanal
│   ├── Reviews.tsx    # Revisões espaçadas
│   ├── Goals.tsx      # Metas de desempenho
│   └── Login.tsx      # Autenticação
├── hooks/             # React Query hooks por domínio
│   ├── useSessions.ts
│   ├── useSubjects.ts
│   ├── usePlans.ts
│   ├── useReviews.ts
│   └── useGoals.ts
├── store/             # Zustand stores
│   ├── auth.ts        # Usuário autenticado
│   └── theme.ts       # Tema (dark/light/system)
├── lib/               # Integrações
│   ├── supabase.ts    # Cliente Supabase
│   └── indexeddb.ts   # Persistência offline
├── types/             # Tipagem global do banco
│   └── database.ts
└── index.css          # Design System (Momentum Dark)
```

O `Layout.tsx` atua como shell da aplicação:
- **Mobile**: top bar compacto + bottom tab navigation (4 itens + "Mais")
- **Desktop**: sidebar fixa (240px) com navegação + card do usuário

A autenticação (`AuthSync`) opera no `App.tsx` em modo não-bloqueante.

---

## Banco de Dados

PostgreSQL gerenciado pelo Supabase com **Row Level Security (RLS)** em todas as tabelas.

| Tabela | Descrição |
|--------|-----------|
| `users` | Perfil do usuário (sync via OAuth trigger/upsert) |
| `sessions` | Histórico de sessões de estudo com timestamps e métricas |
| `subjects` | Assuntos com nome, cor HEX e descrição |
| `plans` | Tarefas diárias com prioridade e tempo estimado |
| `reviews` | Sistema de revisão espaçada com status e datas |
| `goals` | Metas diárias/semanais/mensais com período e target |

> **Segurança:** RLS garante isolamento total — nenhum usuário acessa dados de outro.

---

## Instalação e Execução

### Variáveis `.env`

```env
VITE_SUPABASE_URL=https://seudominio.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
VITE_APP_URL=http://localhost:5173
```

### Setup

```bash
# 1. Clone
git clone https://github.com/waldosouzaup/studyflow.git
cd studyflow

# 2. Instale
npm install

# 3. Rode
npm run dev

# 4. Build de produção
npm run build && npm run preview
```

---

## Deploy

Pipeline configurada para **Netlify** com CI/CD automático:

1. Conecte o repositório GitHub ao Netlify
2. Configure as 3 variáveis de ambiente (`.env`)
3. Build command: `npm run build`
4. Publish directory: `dist/`

O TypeScript check (`npx tsc --noEmit`) opera como guard no build.

---

<div align="center">

Desenvolvido por **Waldo Eller**.

Foco. Consistência. Resultados.

</div>
