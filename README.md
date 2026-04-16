# UP Estudos - Santuário Digital de Estudos

<div align="center">

![UP Estudos](https://img.shields.io/badge/UP_Estudos-v1.0.0-1A1A1A?style=for-the-badge&logo=vercel)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-5.4.0-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-2.103.0-3ECF8E?style=flat&logo=supabase)](https://supabase.com)
[![Netlify](https://img.shields.io/badge/Netlify-Host-00AD9F?style=flat&logo=netlify)](https://netlify.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-1A1A1A?style=flat)](https://web.dev/progressive-web-apps)

**UP Estudos** é uma aplicação web progressiva de gestão de estudos focada em métricas de alto desempenho e design minimalista *luxury*, orientada a dados analíticos e metodologia científica.

[Acessar Demo](https://fluxodeestudo.netlify.app/) · [Reportar Bug](https://github.com/waldosouzaup/studyflow/issues) · [Contribuir](#contribuição)

</div>

---

## Sumário

1. [Sobre o Projeto](#sobre-o-projeto)
2. [Características Principais](#características-principais)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Arquitetura do Projeto](#arquitetura-do-projeto)
5. [Banco de Dados](#banco-de-dados)
6. [Instalação e Execução](#instalação-e-execução)
7. [Deploy](#deploy)

---

## Sobre o Projeto

UP Estudos é mais do que um Pomodoro: é um *santuário digital* para a construção de alto desempenho intelectual.

A aplicação adota um visual *luxury minimalista* com contrastes fortes (Modo Dark e Light dinâmicos, detalhes em variações ouro) e uso extenso de bordas retas (zero radius) para um ar de sofisticação e precisão. 

O projeto foi validado por extensas baterias de auditoria visual e de estabilidade, resultando em um sistema offline-first robusto graças à implementação do TanStack Query + Supabase, eliminando latências e entregando uma interface hiper-responsiva (SPA).

---

## Características Principais

- **Autenticação Padrão Enterprise:** Login via Google OAuth 2.0 integrado com Supabase, com gerenciamento local inteligente.
- **Timer Produtivo (Offline-First):** Motor Pomodoro com processamento desacoplado — funciona sem internet, mantendo os registros no `IndexedDB` e sincronizando com a nuvem quando o usuário retorna online.
- **Micro-Otimização de Performance:** Consultas SQL (`select`) cirúrgicas com redução de ~60% de payload em rotas e query-caching global, zerando a famigerada "tela de carregamento eterna".
- **Gestão de Metas e Heatmaps:** Visualização em gráficos baseados nos dados das sessões (horas diárias, metas semanais e análises quantitativas).
- **Repetição Espaçada (SM-2):** Algoritmo nativo implementado para gerenciamento inteligente do tempo de revisão.
- **Design System Dinâmico:** Tema Dark/Light sem hardcodings, respeitando a raiz de CSS Variables para uma transição perfeita de cores no Tailwind.

---

## Tecnologias Utilizadas

### Frontend
- **React 18.3.1:** Motor de renderização.
- **TypeScript 5.5.0:** Tipagem forte para prevenção de bugs catastróficos.
- **Tailwind CSS 3.4.0:** Tipografia moderna (`Inter`) combinada com variáveis de CSS nativas para controle de modo claro/escuro.
- **TanStack Query 5.99.0:** Controle de mutações assíncronas, refetch inteligente com `staleTime` otimizado em 5 minutos para eliminar *network waterfalls*.
- **Zustand 5.0.12:** Store global *leve* para gerenciamento de tema e autenticação com listeners persistentes minimalistas.
- **Vite 5.4.0:** Bundler para compilação super rápida.

### PWA e Armazenamento
- **vite-plugin-pwa:** Geração do Workbox Service Worker para suporte de instalação desktop/mobile nativa.
- **idb 8.0:** Camada nativa indexada no Client-Side para sincronização das sessões (Fila de Sync Background).

### Backend (BaaS)
- **Supabase JS (v2.103.0):** Autenticação escalável, sincronia de Banco de Dados Postgres (RLS habilitado) e gerenciamento de perfis no Upsert em Background.

---

## Arquitetura do Projeto

A organização de pastas do `src/` segue um modelo orientado a funções e não intrusivo:

```text
src/
├── components/    # (Layout universal, Modais de Configuração, Toast Notifications)
├── pages/         # (Dashboard, Timer, Metas, Login, etc. com code splitting pronto)
├── hooks/         # (Domínios de Lógica: useSessions, useGoals integrados c/ React Query)
├── store/         # (Auth e Theme - Stores de Memória/Zustand puras)
├── lib/           # (API Controllers: supabase.ts, api.ts, indexeddb.ts)
└── types/         # (Tipagem única global de todas as tabelas do PostgreSQL)
```

No nível de renderização (`Layout.tsx`), ocorre a interceptação da navegação e menu lateral. A autenticação (`AuthSync`) reside no nível do bootstrap em `App.tsx`, operando de modo não bloqueante (`Upserts` via background) para zerar latências de cold starts.

---

## Banco de Dados

O banco opera em PostgreSQL gerenciado pelo Supabase. Abaixo estão os pilares de dados estruturados na API:

- **`users`**: Substitui o termo antigo "profiles". Atua via *Trigger/Upsert* capturando o provedor OAuth do Google e mantendo os avatares limpos.
- **`sessions`**: O coração do projeto. Histórico imutável de blocos de estudo `focus` e `break`, gravados com timestamps. Pode ser referenciado com um assunto.
- **`subjects`**: Nomenclaturas, cores HEX e métricas de horas indexadas por ID da disciplina.
- **`plans`**: O organizador semanal de tarefas e o status concluído.
- **`reviews`**: Sistema inteligente algorítmico baseado no *ease factor* de cartões de estudo para a Repetição Espaçada.
- **`goals`**: Controladores comparativos de performance em visões diárias, semanais e mensais.

> **Nota de RLS:** Toda o database utiliza "Row Level Security" para garantir que nenhum usuário vaze UUID ou métricas para a sessão alheia.

---

## Instalação e Execução

### Variáveis .env obrigatórias
```env
VITE_SUPABASE_URL=https://seudominio.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
VITE_APP_URL=http://localhost:5173
```

### Inicialização Rápida

1. Clone o repósitório:
```bash
git clone https://github.com/waldosouzaup/studyflow.git
cd studyflow
```

2. Instale os módulos Node:
```bash
npm install
```

3. Gire o motor no ambiente Localhost:
```bash
npm run dev
```

4. Verifique a Otimização de Produção (Teste PWA):
```bash
npm run build && npm run preview
```

---

## Deploy

A pipeline está desenhada para conectar diretamente no **Netlify**.
- A verificação Typescript base (`npx tsc --noEmit`) sempre opera como Guard no comando `build`.
- O payload compilado no `dist/` é enxuto em KB's.
- Ao linkar o GitHub com o host e prover as 3 variáveis presentes no `.env`, o deploy opera como C/I autônomo e levanta a versão mais performática da nuvem.

---

<div align="center">
Desenvolvido com excelência arquitetural por <strong>Waldo Eller</strong>. <br/>
Otimizado para máxima conversão do tempo analítico.
</div>
