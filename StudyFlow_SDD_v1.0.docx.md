**StudyFlow**

Software Design Document

Sistema de Gestão de Estudos — SaaS / PWA

| Versão | 1.0.0 |
| :---- | :---- |
| **Data** | 2025 |
| **Autor** | [WaldoEller.com](http://WaldoEller.com) |
| **Classificação** | Portfólio Técnico |

# **1\. Introdução**

## **1.1 Propósito do Documento**

Este Software Design Document (SDD) descreve a arquitetura completa, os componentes, interfaces e decisões técnicas do sistema StudyFlow — uma plataforma SaaS de gestão de estudos para usuários individuais. O documento serve como referência para desenvolvimento, onboarding de novos engenheiros e validação de requisitos técnicos.

## **1.2 Escopo**

O StudyFlow cobre quatro pilares funcionais: Planejamento, Execução (timer em tempo real), Medição (analytics e relatórios) e Revisão (repetição espaçada). A plataforma opera como Progressive Web App (PWA) com suporte offline parcial e sincronização em background.

## **1.3 Definições e Acrônimos**

| Termo | Definição |
| :---- | :---- |
| SDD | Software Design Document — documento de especificação de arquitetura de software |
| PRD | Product Requirements Document — documento de requisitos de produto |
| PWA | Progressive Web App — aplicação web com capacidades nativas offline |
| SaaS | Software as a Service — modelo de entrega via nuvem por assinatura |
| REST | Representational State Transfer — estilo arquitetural para APIs HTTP |
| JWT | JSON Web Token — padrão para tokens de autenticação stateless |
| ORM | Object-Relational Mapper — mapeamento entre objetos e banco relacional |
| CDN | Content Delivery Network — rede de distribuição de conteúdo estático |
| CI/CD | Continuous Integration / Continuous Delivery — pipeline de automação |
| SPA | Single Page Application — aplicação que carrega uma única página HTML |
| IndexedDB | API de banco de dados no navegador para armazenamento local offline |
| BFF | Backend for Frontend — camada de API otimizada para um cliente específico |
| SSR | Server-Side Rendering — renderização HTML no servidor antes de enviar ao cliente |
| RLS | Row-Level Security — controle de acesso por linha no banco de dados |

## **1.4 Referências**

* PRD — StudyFlow v1.0 (documento de origem)

* RFC 7519 — JSON Web Token (JWT)

* W3C — Service Workers API

* PostgreSQL 16 Documentation

* React 18 Documentation — Concurrent Features

* OWASP — Top 10 Web Application Security Risks

## **1.5 Visão Geral do Documento**

O documento está organizado nas seguintes seções principais:

1. Introdução — contexto, escopo e definições

2. Visão Geral do Sistema — objetivos, constraints e stakeholders

3. Arquitetura do Sistema — visão de alto nível e decisões arquiteturais

4. Design de Componentes — especificação detalhada de cada módulo

5. Design de Dados — modelo relacional e estratégias de acesso

6. Design de Interfaces — API REST e contratos de comunicação

7. Design de Segurança — autenticação, autorização e proteção de dados

8. Design de Performance — estratégias de otimização e caching

9. Design de Infraestrutura — implantação e observabilidade

10. Considerações de Qualidade — testes e critérios de aceite

# **2\. Visão Geral do Sistema**

## **2.1 Contexto e Problema**

Estudantes e profissionais em aprendizado contínuo carecem de ferramentas que integrem planejamento, execução com medição de tempo real e revisão sistemática. Ferramentas existentes focam em tarefas (Notion, Todoist) ou timers isolados (Forest, Be Focused), sem oferecer uma visão unificada de progresso e consistência.

| Problema Central Alta dispersão cognitiva durante o estudo \+ ausência de feedback quantitativo \= esforço subjetivamente alto com progresso percebido baixo. |
| :---- |

## **2.2 Objetivos do Sistema**

| ID | Objetivo | Métrica de Sucesso |
| :---- | :---- | :---- |
| OBJ-01 | Registrar tempo de estudo com precisão de segundos | Desvio \< 2s por sessão |
| OBJ-02 | Fornecer dashboard atualizado em tempo real | Latência de UI \< 100ms |
| OBJ-03 | Implementar revisão espaçada (1/7/30 dias) | Taxa de esquecimento reduzida |
| OBJ-04 | Gerar relatório semanal automaticamente | Disponível às 06h toda segunda-feira |
| OBJ-05 | Funcionar offline para sessões de estudo | Core features disponíveis sem rede |
| OBJ-06 | Suportar múltiplos dispositivos com sync | Latência de sync \< 3s |

## **2.3 Stakeholders**

| Stakeholder | Papel | Interesse Principal |
| :---- | :---- | :---- |
| Estudante | Usuário primário | Controle de progresso e consistência |
| Concurseiro | Usuário primário | Planejamento rigoroso e métricas de cobertura |
| Profissional | Usuário secundário | Aprendizado contínuo com tempo limitado |
| Product Owner | Responsável pelo produto | Entrega de valor e crescimento de usuários |
| Engenheiro | Desenvolvedor do sistema | Clareza arquitetural e manutenibilidade |

## **2.4 Restrições do Sistema**

### **2.4.1 Restrições Técnicas**

* Plataforma web-first com PWA — sem app nativo iOS/Android na v1

* Backend stateless para escalar horizontalmente

* Banco de dados relacional com suporte a multi-tenant no futuro

* Autenticação via Google OAuth 2.0 na v1 (email/senha na v2)

### **2.4.2 Restrições de Negócio**

* MVP deve ser entregável em 8 semanas por equipe de 2 devs

* Custo de infraestrutura \< R$300/mês para 0–500 usuários

* Conformidade com LGPD para dados de usuários brasileiros

# **3\. Arquitetura do Sistema**

## **3.1 Visão Arquitetural**

O StudyFlow adota uma arquitetura de três camadas com separação clara entre frontend (SPA/PWA), backend (API REST stateless) e persistência (PostgreSQL \+ Redis). A comunicação entre camadas ocorre exclusivamente via HTTP/JSON com autenticação JWT.

| Decisão Arquitetural \#1 — Monolito Modular vs. Microsserviços Para o escopo atual (\< 10k usuários), adota-se monolito modular. Módulos são organizados por domínio com interfaces bem definidas, permitindo extração futura para microsserviços sem reescrita completa. Trade-off: menor complexidade operacional, maior acoplamento aceitável na fase inicial. |
| :---- |

## **3.2 Stack Tecnológica**

| Camada | Tecnologia | Versão | Justificativa |
| :---- | :---- | :---- | :---- |
| Frontend | React | 18.x | Ecosistema maduro, Concurrent Features para UX responsiva |
| Frontend | TypeScript | 5.x | Tipagem estática, refatoração segura, autocomplete |
| Frontend | Vite | 5.x | Build ultra-rápido, HMR eficiente no desenvolvimento |
| Frontend | TailwindCSS | 3.x | Utility-first, consistência visual sem CSS custom |
| Frontend | Zustand | 4.x | State management simples e performático |
| Frontend | TanStack Query | 5.x | Cache, sync e loading states para dados do servidor |
| Frontend | Workbox | 7.x | Service Worker para PWA e cache offline |
| Backend | Node.js | 20 LTS | Ecossistema JavaScript unificado frontend/backend |
| Backend | Fastify | 4.x | Alta performance, schema validation nativo, plugins |
| Backend | Prisma | 5.x | ORM type-safe, migrations automáticas, query builder |
| Backend | Zod | 3.x | Validação de schema runtime com inferência TypeScript |
| Banco | PostgreSQL | 16.x | ACID, JSON nativo, Row-Level Security, extensões |
| Cache | Redis | 7.x | Cache de sessões, rate limiting, filas de background |
| Auth | Google OAuth 2.0 | — | Redução de fricção no onboarding, sem senha a gerenciar |
| Infra | Railway / Render | — | Deploy simplificado, custo baixo, auto-scaling básico |
| Infra | Cloudflare | — | CDN global, DDoS protection, edge caching de assets |

## **3.3 Componentes Principais**

### **3.3.1 Frontend (SPA/PWA)**

Aplicação React com roteamento client-side via React Router v6. O Service Worker gerencia cache de assets e estratégias de sincronização offline. IndexedDB armazena sessões iniciadas sem conexão para upload posterior.

### **3.3.2 API Backend (REST)**

Servidor Fastify organizado em módulos de domínio: Auth, Subjects, Sessions, Plans, Reviews, Goals, Reports. Cada módulo possui rotas, controllers, services e repositórios independentes. Autenticação via middleware JWT em todas as rotas protegidas.

### **3.3.3 Worker de Background**

Processo separado (ou cron dentro do mesmo servidor) responsável por: geração de relatórios semanais, cálculo de metas diárias, envio de notificações de revisão pendente e limpeza de dados expirados.

## **3.4 Padrões Arquiteturais Adotados**

| Padrão | Onde Aplicado | Benefício |
| :---- | :---- | :---- |
| Repository Pattern | Camada de acesso a dados (Prisma) | Desacopla lógica de negócio do ORM |
| Service Layer | Regras de negócio dos domínios | Testabilidade sem dependência de HTTP |
| DTO (Data Transfer Object) | Entrada/saída da API via Zod | Contratos explícitos, validação centralizada |
| Optimistic Updates | Mutations no frontend (TanStack Query) | UI responsiva sem esperar servidor |
| Command Query Segregation | Leitura vs. escrita separadas | Otimização de queries de leitura |
| Event-Driven (parcial) | Relatório semanal, notificações | Desacoplamento de side effects |

# **4\. Design de Componentes**

## **4.1 Módulo: Auth**

### **4.1.1 Responsabilidades**

* Autenticação via Google OAuth 2.0 (Authorization Code Flow)

* Emissão e validação de JWT (access token \+ refresh token)

* Logout e revogação de tokens

* Middleware de autenticação injetado em todas as rotas protegidas

### **4.1.2 Fluxo de Autenticação**

1\. Usuário clica em 'Entrar com Google'

2\. Frontend redireciona para Google OAuth consent screen

3\. Google retorna authorization\_code via redirect para /api/auth/callback

4\. Backend troca code por access\_token \+ id\_token com Google

5\. Backend extrai profile (email, name, picture) do id\_token

6\. Backend cria/atualiza User no banco, emite JWT próprio (15min) \+ Refresh Token (30d)

7\. Refresh Token salvo em cookie HttpOnly Secure SameSite=Strict

8\. Access Token enviado no corpo da resposta para armazenamento em memória no frontend

| Segurança — Tokens O Access Token é armazenado APENAS em memória JavaScript (variável de módulo), nunca em localStorage/sessionStorage para evitar ataques XSS. O Refresh Token fica em cookie HttpOnly inacessível ao JavaScript. |
| :---- |

## **4.2 Módulo: Subjects (Assuntos)**

### **4.2.1 Responsabilidades**

* CRUD completo de assuntos por usuário

* Cálculo de progresso percentual (horas reais / meta)

* Agregação de sessões por assunto para estatísticas

### **4.2.2 Regras de Negócio**

* Nome de assunto: único por usuário, 3–60 caracteres

* Cor: valor hexadecimal válido (\#RRGGBB)

* Metas opcionais: se não definidas, progresso não é calculado

* Exclusão de assunto: soft-delete (campo deleted\_at), sessões históricas preservadas

## **4.3 Módulo: Study Sessions (Sessões)**

### **4.3.1 Responsabilidades — Feature Core**

* Gerenciar ciclo de vida de uma sessão: created → active → paused → finished

* Cronômetro com suporte a modo Pomodoro (25/5 min) e livre

* Persistência offline via IndexedDB com sync posterior

* Associação com assunto, tópico, dificuldade e foco

### **4.3.2 Estado da Sessão**

| Estado | Transições Permitidas | Ação do Usuário |
| :---- | :---- | :---- |
| IDLE | → ACTIVE | Clicar em 'Iniciar' |
| ACTIVE | → PAUSED, → FINISHED | Clicar em 'Pausar' ou 'Finalizar' |
| PAUSED | → ACTIVE, → FINISHED | Clicar em 'Retomar' ou 'Finalizar' |
| FINISHED | — (terminal) | Sessão salva, fluxo de revisão apresentado |

### **4.3.3 Regras de Validação**

* Duração mínima válida: 5 minutos (sessões \< 5min descartadas ou marcadas como inválidas)

* Apenas uma sessão ACTIVE por usuário simultaneamente

* Ao retomar sessão após app fechado: reconstrói estado via timestamp persistido

* Dificuldade e foco: inteiros de 1 a 3, obrigatórios ao finalizar

## **4.4 Módulo: Plans (Planejamento)**

### **4.4.1 Responsabilidades**

* CRUD de tarefas de planejamento diário

* Visão agregada semanal

* Detecção automática de atraso (planned\_date \< today AND status \!= completed)

### **4.4.2 Lógica de Atraso**

O serviço de planejamento executa diariamente às 00h05 para marcar tarefas expiradas. Tarefas com status 'pending' e data anterior ao dia atual recebem flag is\_overdue \= true. A UI destaca visualmente essas tarefas no dashboard.

## 

## 

## **4.5 Módulo: Reviews (Revisões)**

### **4.5.1 Algoritmo de Repetição Espaçada**

O StudyFlow implementa uma versão simplificada de repetição espaçada com intervalos fixos: 1 dia, 7 dias e 30 dias. O usuário escolhe o intervalo ao finalizar uma sessão. Ao concluir uma revisão, o sistema sugere o próximo intervalo automaticamente.

| Intervalo | Uso Recomendado | Próximo Intervalo Sugerido |
| :---- | :---- | :---- |
| 1 dia | Conteúdo novo, primeira exposição | 7 dias |
| 7 dias | Conteúdo em consolidação | 30 dias |
| 30 dias | Conteúdo consolidado, manutenção | 30 dias (recorrente) |

## **4.6 Módulo: Goals (Metas)**

### **4.6.1 Tipos e Cálculo**

Metas podem ser por usuário (global) ou por assunto (granular). O cálculo de progresso é feito em tempo real: soma das durações de sessões válidas no período / target\_value \* 100\.

| Tipo | period\_start | period\_end | Recalculo |
| :---- | :---- | :---- | :---- |
| daily | Hoje 00:00 | Hoje 23:59 | A cada sessão salva |
| weekly | Segunda 00:00 | Domingo 23:59 | A cada sessão salva |
| monthly | Dia 1 00:00 | Último dia 23:59 | A cada sessão salva |

## **4.7 Módulo: Reports (Relatórios)**

### **4.7.1 Relatório Semanal Automático**

Gerado todo domingo às 23h via worker de background. Calcula e persiste: total de horas, meta vs. realizado, melhor assunto (mais horas), ponto fraco (menos horas vs. meta), streak atualizado e média diária da semana.

### **4.7.2 Dashboard em Tempo Real**

O dashboard agrega dados via queries otimizadas com índices específicos em study\_sessions(user\_id, date). TanStack Query mantém cache de 30s com refetch automático ao retornar ao foco na aba.

# **5\. Design de Dados**

## **5.1 Modelo Entidade-Relacionamento**

O esquema é centrado no usuário (User) que possui múltiplos Subjects. Sessions referenciam Subjects. Plans, Reviews e Goals referenciam ambos User e Subject. O relacionamento é isolado por user\_id em todas as tabelas.

## **5.2 Esquema de Banco de Dados**

### **5.2.1 Tabela: users**

| Campo | Tipo | Constraints | Descrição |
| :---- | :---- | :---- | :---- |
| id | UUID | PK, DEFAULT gen\_random\_uuid() | Identificador único |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email do Google OAuth |
| name | VARCHAR(255) | NOT NULL | Nome completo do usuário |
| avatar\_url | TEXT | NULLABLE | URL da foto do perfil |
| google\_id | VARCHAR(255) | UNIQUE, NOT NULL | ID do usuário no Google |
| streak\_count | INTEGER | DEFAULT 0 | Dias consecutivos de estudo |
| streak\_last\_date | DATE | NULLABLE | Última data de estudo para streak |
| created\_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| updated\_at | TIMESTAMPTZ | DEFAULT NOW() | Última atualização |

### **5.2.2 Tabela: subjects**

| Campo | Tipo | Constraints | Descrição |
| :---- | :---- | :---- | :---- |
| id | UUID | PK | Identificador único |
| user\_id | UUID | FK → users.id, NOT NULL | Dono do assunto |
| name | VARCHAR(100) | NOT NULL | Nome do assunto |
| color | CHAR(7) | NOT NULL, CHECK regex | Cor hexadecimal (\#RRGGBB) |
| weekly\_goal\_hours | DECIMAL(5,2) | NULLABLE | Meta semanal em horas |
| monthly\_goal\_hours | DECIMAL(5,2) | NULLABLE | Meta mensal em horas |
| deleted\_at | TIMESTAMPTZ | NULLABLE | Soft-delete timestamp |
| created\_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

### **5.2.3 Tabela: study\_sessions**

| Campo | Tipo | Constraints | Descrição |
| :---- | :---- | :---- | :---- |
| id | UUID | PK | Identificador único |
| user\_id | UUID | FK → users.id, NOT NULL | Dono da sessão |
| subject\_id | UUID | FK → subjects.id, NOT NULL | Assunto estudado |
| date | DATE | NOT NULL | Data da sessão (local do usuário) |
| started\_at | TIMESTAMPTZ | NOT NULL | Início real da sessão |
| finished\_at | TIMESTAMPTZ | NULLABLE | Fim da sessão |
| duration\_minutes | INTEGER | NOT NULL, CHECK \>= 5 | Duração em minutos |
| topic | VARCHAR(255) | NULLABLE | Tópico específico estudado |
| notes | TEXT | NULLABLE | Observações livres |
| difficulty | SMALLINT | CHECK 1–3 | Dificuldade percebida |
| focus | SMALLINT | CHECK 1–3 | Nível de foco |
| session\_type | VARCHAR(20) | DEFAULT 'free' | free | pomodoro |
| is\_offline\_sync | BOOLEAN | DEFAULT false | Flag de sincronização offline |
| created\_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

### **5.2.4 Tabela: plans**

| Campo | Tipo | Constraints | Descrição |
| :---- | :---- | :---- | :---- |
| id | UUID | PK | Identificador único |
| user\_id | UUID | FK → users.id, NOT NULL | Dono do plano |
| subject\_id | UUID | FK → subjects.id, NULLABLE | Assunto associado |
| planned\_date | DATE | NOT NULL | Data planejada |
| task | VARCHAR(500) | NOT NULL | Descrição da tarefa |
| estimated\_minutes | INTEGER | NULLABLE | Tempo estimado |
| priority | VARCHAR(10) | DEFAULT 'medium' | high | medium | low |
| status | VARCHAR(15) | DEFAULT 'pending' | pending | done | skipped |
| is\_overdue | BOOLEAN | DEFAULT false | Flag de atraso calculada |
| created\_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

### **5.2.5 Tabela: reviews**

| Campo | Tipo | Constraints | Descrição |
| :---- | :---- | :---- | :---- |
| id | UUID | PK | Identificador único |
| user\_id | UUID | FK → users.id, NOT NULL | Dono da revisão |
| subject\_id | UUID | FK → subjects.id, NOT NULL | Assunto da revisão |
| session\_id | UUID | FK → study\_sessions.id, NULLABLE | Sessão de origem |
| topic | VARCHAR(255) | NOT NULL | Tópico a revisar |
| review\_date | DATE | NOT NULL | Data agendada |
| status | VARCHAR(15) | DEFAULT 'pending' | pending | done | skipped |
| created\_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

### **5.2.6 Tabela: goals**

| Campo | Tipo | Constraints | Descrição |
| :---- | :---- | :---- | :---- |
| id | UUID | PK | Identificador único |
| user\_id | UUID | FK → users.id, NOT NULL | Dono da meta |
| subject\_id | UUID | FK → subjects.id, NULLABLE | Null \= meta global |
| type | VARCHAR(10) | NOT NULL | daily | weekly | monthly |
| target\_minutes | INTEGER | NOT NULL | Tempo alvo em minutos |
| period\_start | DATE | NOT NULL | Início do período |
| period\_end | DATE | NOT NULL | Fim do período |
| is\_active | BOOLEAN | DEFAULT true | Meta ativa no período |
| created\_at | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

## **5.3 Índices e Performance**

| Índice | Tabela | Colunas | Justificativa |
| :---- | :---- | :---- | :---- |
| idx\_sessions\_user\_date | study\_sessions | (user\_id, date) | Dashboard queries diárias/semanais |
| idx\_sessions\_user\_subject | study\_sessions | (user\_id, subject\_id) | Agregação por assunto |
| idx\_plans\_user\_date | plans | (user\_id, planned\_date) | Planejamento do dia |
| idx\_reviews\_user\_date | reviews | (user\_id, review\_date) | Revisões pendentes do dia |
| idx\_goals\_user\_period | goals | (user\_id, period\_start, period\_end) | Metas do período atual |
| idx\_subjects\_user | subjects | (user\_id, deleted\_at) | Lista de assuntos ativos |

# **6\. Design de Interfaces — API REST**

## **6.1 Convenções Gerais**

* Base URL: https://api.studyflow.app/v1

* Autenticação: Bearer Token JWT no header Authorization

* Formato: application/json em todas as requisições e respostas

* Paginação: cursor-based com parâmetros cursor e limit (padrão: 20\)

* Timestamps: ISO 8601 com timezone (ex: 2025-01-15T10:30:00-03:00)

* Erros: formato padronizado { error: { code, message, details? } }

## **6.2 Endpoints por Domínio**

### **6.2.1 Auth**

| Método | Endpoint | Descrição | Auth |
| :---- | :---- | :---- | :---- |
| GET | /auth/google | Inicia fluxo OAuth 2.0 | Público |
| GET | /auth/callback | Callback do Google OAuth | Público |
| POST | /auth/refresh | Renova access token via cookie | Cookie |
| DELETE | /auth/logout | Revoga refresh token | JWT |
| GET | /auth/me | Dados do usuário autenticado | JWT |

### **6.2.2 Subjects**

| Método | Endpoint | Descrição | Body / Query |
| :---- | :---- | :---- | :---- |
| GET | /subjects | Lista assuntos do usuário | — |
| POST | /subjects | Cria novo assunto | { name, color, weekly\_goal\_hours?, monthly\_goal\_hours? } |
| GET | /subjects/:id | Detalhes \+ stats do assunto | — |
| PATCH | /subjects/:id | Atualiza assunto | Campos parciais |
| DELETE | /subjects/:id | Soft-delete do assunto | — |
| GET | /subjects/:id/sessions | Sessões do assunto | ?from=\&to=\&limit= |

### **6.2.3 Sessions**

| Método | Endpoint | Descrição | Body / Query |
| :---- | :---- | :---- | :---- |
| GET | /sessions | Lista sessões do usuário | ?from=\&to=\&subject\_id=\&limit= |
| POST | /sessions | Cria nova sessão | { subject\_id, started\_at, date, session\_type } |
| GET | /sessions/active | Sessão ativa atual (se houver) | — |
| PATCH | /sessions/:id | Finaliza/atualiza sessão | { finished\_at, duration\_minutes, topic, difficulty, focus, notes } |
| DELETE | /sessions/:id | Exclui sessão (\< 24h) | — |
| POST | /sessions/sync | Sync de sessões offline | Array de sessões pendentes |

### **6.2.4 Plans**

| Método | Endpoint | Descrição | Body / Query |
| :---- | :---- | :---- | :---- |
| GET | /plans | Lista planos | ?date=\&from=\&to=\&status= |
| POST | /plans | Cria tarefa | { planned\_date, task, subject\_id?, estimated\_minutes?, priority } |
| PATCH | /plans/:id | Atualiza status ou campos | Campos parciais |
| DELETE | /plans/:id | Remove tarefa | — |

### **6.2.5 Reviews**

| Método | Endpoint | Descrição | Body / Query |
| :---- | :---- | :---- | :---- |
| GET | /reviews | Lista revisões | ?status=\&from=\&to= |
| POST | /reviews | Cria revisão manual | { subject\_id, topic, review\_date } |
| POST | /reviews/from-session/:id | Cria revisão após sessão | { interval\_days: 1|7|30 } |
| PATCH | /reviews/:id | Conclui / reagenda | { status, new\_review\_date? } |

### **6.2.6 Goals e Reports**

| Método | Endpoint | Descrição |
| :---- | :---- | :---- |
| GET | /goals | Lista metas ativas do usuário |
| POST | /goals | Cria nova meta |
| PATCH | /goals/:id | Atualiza meta |
| GET | /reports/dashboard | Dados do dashboard (hoje, semana, streak) |
| GET | /reports/weekly | Relatório semanal (mais recente ou por ?week=) |
| GET | /reports/performance | Métricas de performance (heatmap, distribuição) |

# **7\. Design de Segurança**

## **7.1 Modelo de Ameaças**

| Ameaça | Vetor | Mitigação |
| :---- | :---- | :---- |
| XSS — Cross-Site Scripting | Input de usuário em campos de texto | Sanitização no frontend (DOMPurify), CSP headers, token em memória |
| CSRF — Cross-Site Request Forgery | Requisições de sites externos | SameSite=Strict no cookie, CORS configurado |
| SQL Injection | Queries com input de usuário | Prisma usa prepared statements, zero SQL concatenado |
| Acesso a dados de outro usuário | Manipulação de IDs na URL | RLS no PostgreSQL \+ validação user\_id em todos os services |
| Token interception | Man-in-the-Middle | HTTPS obrigatório, HSTS header, certificado TLS |
| Brute force / rate limiting | Múltiplas requisições ao OAuth | Rate limiting via Redis (100 req/min por IP) |
| Dados pessoais — LGPD | Armazenamento inadequado | Minimização de dados, política de retenção, endpoint de exclusão |

## **7.2 Row-Level Security (RLS)**

Todas as tabelas possuem policy RLS que restringe SELECT/INSERT/UPDATE/DELETE ao user\_id do token autenticado. Isso garante isolamento de dados mesmo em caso de bug na camada de aplicação.

| Exemplo de Policy RLS — study\_sessions CREATE POLICY user\_isolation ON study\_sessions USING (user\_id \= current\_setting('app.current\_user\_id')::UUID); O backend injeta o user\_id via SET LOCAL antes de cada query. |
| :---- |

## **7.3 Headers de Segurança**

| Header | Valor | Proteção |
| :---- | :---- | :---- |
| Content-Security-Policy | default-src 'self'; ... | XSS, injeção de scripts |
| Strict-Transport-Security | max-age=31536000; includeSubDomains | Força HTTPS |
| X-Frame-Options | DENY | Clickjacking |
| X-Content-Type-Options | nosniff | MIME sniffing |
| Referrer-Policy | strict-origin-when-cross-origin | Vazamento de URL |
| Permissions-Policy | camera=(), microphone=() | Acesso a dispositivos |

# **8\. Design de Performance**

## **8.1 Metas de Performance**

| Métrica | Meta | Ferramenta de Medição |
| :---- | :---- | :---- |
| First Contentful Paint (FCP) | \< 1.5s em 4G | Lighthouse, WebPageTest |
| Largest Contentful Paint (LCP) | \< 2.5s | Core Web Vitals |
| Time to Interactive (TTI) | \< 3.0s | Lighthouse |
| API Response (p95) | \< 200ms | Datadog APM |
| Dashboard load | \< 150ms (dados em cache) | TanStack Query |
| Timer precision | Desvio \< 2s por sessão | Teste automatizado |

## **8.2 Estratégia de Caching**

### **8.2.1 Frontend — TanStack Query**

| Query | staleTime | gcTime | Estratégia |
| :---- | :---- | :---- | :---- |
| Dashboard | 30s | 5min | Refetch on window focus |
| Subjects list | 5min | 30min | Refetch on mount |
| Sessions history | 2min | 10min | Pagination cache |
| Reports/weekly | 1h | 24h | Prefetch na segunda |
| Reviews pendentes | 1min | 5min | Refetch on focus |

### **8.2.2 Backend — Redis**

* Dashboard data: cache de 30s por user\_id (invalidado ao salvar sessão)

* Weekly report: cache de 1h (gerado e cacheado pelo worker)

* Rate limiting: sliding window de 60s por IP

* Session de refresh token: TTL \= 30 dias

## **8.3 Suporte Offline (PWA)**

| Recurso | Estratégia Service Worker | Comportamento Offline |
| :---- | :---- | :---- |
| App shell (HTML/JS/CSS) | Cache First | Disponível sem rede |
| Assets estáticos | Stale While Revalidate | Usa cache, atualiza em background |
| API: sessão ativa | Network First \+ fallback IndexedDB | Timer continua localmente |
| API: dados de leitura | Network First \+ cache 5min | Dados levemente desatualizados |
| API: writes (salvar sessão) | Background Sync | Enfileira e sincroniza ao reconectar |

# **9\. Design de Infraestrutura**

## **9.1 Ambientes**

| Ambiente | Propósito | Infraestrutura |
| :---- | :---- | :---- |
| development | Desenvolvimento local | Docker Compose (Postgres \+ Redis local) |
| staging | Validação pré-produção | Railway — mesma stack, dados sintéticos |
| production | Usuários reais | Railway (API) \+ Cloudflare (CDN/DNS) \+ Supabase (Postgres) |

## **9.2 Pipeline CI/CD**

11. Push para branch feature → GitHub Actions: lint \+ type-check \+ unit tests

12. Pull Request para main → testes de integração \+ build check

13. Merge para main → deploy automático em staging

14. Tag de release (v\*.\*.\* ) → deploy em produção com rollback automático

## **9.3 Observabilidade**

| Pilar | Ferramenta | O Que Monitora |
| :---- | :---- | :---- |
| Logs | Railway Logs \+ Logtail | Erros de aplicação, queries lentas, auth events |
| Métricas | Railway Metrics | CPU, memória, latência de API, requests/s |
| Alertas | Uptime Kuma / BetterStack | Downtime, p95 \> 500ms, error rate \> 1% |
| Errors | Sentry (plano free) | Stack traces de erros JavaScript e Node.js |

# **10\. Considerações de Qualidade**

## **10.1 Estratégia de Testes**

| Tipo | Ferramenta | Cobertura Alvo | O Que Testar |
| :---- | :---- | :---- | :---- |
| Unitário | Vitest | 80%+ | Services, utils, regras de negócio isoladas |
| Integração | Vitest \+ Prisma test DB | 60%+ | Endpoints da API com banco real |
| E2E | Playwright | Fluxos críticos | Login, criar sessão, finalizar, revisar |
| Performance | k6 | Smoke test | 50 usuários simultâneos, latência p95 |
| Acessibilidade | axe-playwright | WCAG 2.1 AA | Componentes interativos principais |

## **10.2 Critérios de Aceite — MVP**

| Feature | Critério | Prioridade |
| :---- | :---- | :---- |
| Login OAuth | Login completo em \< 3 cliques, token válido por 15min | P0 |
| Criar assunto | CRUD funcional com validação de campos | P0 |
| Sessão de estudo | Timer preciso, salva ao finalizar, dados persistidos | P0 |
| Planejamento diário | CRUD de tarefas com prioridade e status | P1 |
| Dashboard básico | Horas de hoje \+ semana exibidas corretamente | P1 |
| Revisão simples | Criar revisão ao finalizar sessão, listar pendentes | P1 |
| Offline basic | Timer funciona sem rede, sync ao reconectar | P2 |

## **10.3 Checklist de Lançamento**

* Todos os testes unitários passando (0 failures)

* Cobertura mínima de 80% nos services de domínio

* Lighthouse score \> 90 em Performance, Acessibilidade e PWA

* Nenhuma vulnerabilidade crítica/alta no audit de dependências (npm audit)

* Headers de segurança validados (securityheaders.com)

* Backup automático de banco configurado e testado

* Variáveis de ambiente de produção documentadas e seguras

* Endpoint de exclusão de conta implementado (LGPD compliance)

# **Apêndice A — Glossário de Erros da API**

| Código HTTP | Error Code | Descrição |
| :---- | :---- | :---- |
| 400 | VALIDATION\_ERROR | Body/query inválido. Details contém campo específico. |
| 401 | UNAUTHORIZED | Token ausente, inválido ou expirado. |
| 403 | FORBIDDEN | Usuário autenticado sem permissão para o recurso. |
| 404 | NOT\_FOUND | Recurso não encontrado ou excluído (soft-delete). |
| 409 | CONFLICT | Violação de unicidade (ex: assunto com mesmo nome). |
| 422 | BUSINESS\_RULE\_VIOLATION | Regra de negócio não atendida (ex: sessão \< 5min). |
| 429 | RATE\_LIMIT\_EXCEEDED | Muitas requisições. Retry após X-RateLimit-Reset header. |
| 500 | INTERNAL\_ERROR | Erro inesperado. ID de trace incluso para debugging. |

# **Apêndice B — Variáveis de Ambiente**

| Variável | Obrigatória | Descrição |
| :---- | :---- | :---- |
| DATABASE\_URL | Sim | Connection string PostgreSQL (Supabase/Railway) |
| REDIS\_URL | Sim | Connection string Redis |
| JWT\_SECRET | Sim | Secret para assinar JWTs (mínimo 32 chars) |
| GOOGLE\_CLIENT\_ID | Sim | Client ID do Google OAuth App |
| GOOGLE\_CLIENT\_SECRET | Sim | Client Secret do Google OAuth App |
| GOOGLE\_REDIRECT\_URI | Sim | URL de callback cadastrada no Google Console |
| FRONTEND\_URL | Sim | URL do frontend para CORS (ex: https://app.studyflow.com) |
| NODE\_ENV | Sim | development | staging | production |
| PORT | Não | Porta do servidor (padrão: 3000\) |

# 

# 

# **Apêndice C — Decisões Técnicas Registradas (ADRs)**

### **ADR-001: PostgreSQL em vez de MongoDB**

Contexto: Dados do StudyFlow são altamente relacionais (sessões → assuntos → metas). Decisão: PostgreSQL pela garantia ACID em sessões de estudo e suporte nativo a queries de agregação temporal. Trade-off aceito: maior rigidez de schema, compensada por migrations Prisma.

### **ADR-002: Fastify em vez de Express**

Contexto: Performance e validação de schema. Decisão: Fastify oferece \~3x mais throughput que Express em benchmarks e possui validação nativa de JSON Schema. Trade-off: ecossistema menor de plugins. Para o escopo do MVP, a escolha é adequada.

### **ADR-003: Zustand em vez de Redux**

Contexto: Gerenciamento de estado no frontend. Decisão: Zustand tem API mínima (\~1kb), sem boilerplate de actions/reducers, suficiente para o estado local do StudyFlow. TanStack Query cuida do estado de servidor. Trade-off: Redux seria mais adequado para equipes maiores com maior histórico de debugging.

### **ADR-004: Monolito Modular em vez de Microsserviços**

Contexto: Escopo inicial com equipe pequena. Decisão: Microsserviços adicionam overhead operacional desproporcionalmente alto para 0–5k usuários. O monolito modular permite extração futura. Trade-off: Acoplamento técnico entre módulos é gerenciado via interfaces de service bem definidas.

StudyFlow SDD v1.0 — Documento de Portfólio Técnico