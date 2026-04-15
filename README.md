# StudyFlow - Sistema de Gestão de Estudos

<div align="center">

![StudyFlow](https://img.shields.io/badge/StudyFlow-v1.0.0-5A0FC8?style=for-the-badge)

[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2.2-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8.0.4-646CFF?style=flat&logo=vite)
[![Supabase](https://img.shields.io/badge/Supabase-3-3ECF8E?style=flat&logo=supabase)](https://supabase.com)
[![Netlify](https://img.shields.io/badge/Netlify-Host-00AD9F?style=flat&logo=netlify)](https://netlify.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat)](https://web.dev/progressive-web-apps)

**StudyFlow** é uma aplicação web progressiva completa para gestão de estudos, desenvolvida com foco em produtividade e metodologia científica comprovada.

[Acessar Demo]([https://fluxodeestudo.netlify.app/]) · [Reportar Bug](https://github.com/waldosouzaup/studyflow/issues) · [Contribuir](#contribuição)

</div>

---

## Sumário

1. [Sobre o Projeto](#sobre-o-projeto)
2. [Características Principais](#características-principais)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Arquitetura do Projeto](#arquitetura-do-projeto)
5. [Banco de Dados](#banco-de-dados)
6. [Configuração do Ambiente](#configuração-do-ambiente)
7. [Instalação e Execução](#instalação-e-execução)
8. [Funcionalidades Detalhadas](#funcionalidades-detalhadas)
9. [Deploy](#deploy)
10. [Contribuição](#contribuição)
11. [Licença](#licença)

---

## Sobre o Projeto

StudyFlow é um sistema de gestão de estudos que integra múltiplas ferramentas essenciais para estudantes e profissionais que buscam otimizar seu tempo de aprendizagem. A aplicação foi construída seguindo metodologias de desenvolvimento ágil e visa fornecer uma experiência de usuário intuitiva e eficiente.

O projeto foi desenvolvido em 8 blocos de prioridade sequenciais, onde cada bloco foi implementado e aprovado antes de prosseguir para o próximo, garantindo que todas as funcionalidades fossem validadas e estiver completas antes de adicionar novas features. Esta abordagem permitiu um desenvolvimento controlado e sistemático, resultando em uma aplicação robusta e bem estruturada.

O StudyFlow implementa técnicas comprovadas de produtividade como o método Pomodoro para gerenciamento de tempo de foco e o algoritmo SM-2 de revisões espaçadas para otimização da retenção de informações. Além disso, a aplicação oferece suporte offline completo através de tecnologias PWA, permitindo que estudantes acessem suas ferramentas mesmo em áreas com conexão instável.

### Objetivos do Projeto

O objetivo principal do StudyFlow é proporcionar uma experiência de estudo organizada e focada, permitindo que usuários gerenciem suas matérias, planejem seus estudos, acompanhem seu progresso e revisem conteúdos de forma eficiente. A aplicação visa atender tanto estudantes quanto profissionais que buscam desenvolver hábitos de estudo consistentes e produtivos.

Outros objetivos importantes incluem a implementação de técnicas comprovadas de produtividade como o Pomodoro e a repetição espaçada, oferecer suporte offline para estudantes em áreas com conexão instável, fornecer métricas e relatórios detalhados para acompanhamento de progresso, criar uma interface responsiva e acessível que funcione em diferentes dispositivos, e manter os dados dos usuários seguros através de autenticação robusta com Google OAuth.

---

## Características Principais

### Autenticação Google OAuth

O sistema de autenticação utiliza o Google OAuth 2.0 para fornecer login seguro através de contas Google existentes. Esta abordagem elimina a necessidade de criar novas senhas e fornece proteção robusta através dos mecanismos de segurança do Google. O sistema gerencia sessões utilizando tokens JWT, protegendo rotas e dados sensíveis dos usuários. O fluxo de autenticação inclui um callback seguro que processa o token retornado pelo Google e cria a sessão do usuário na aplicação.

### Timer Pomodoro Avançado

O timer Pomodoro do StudyFlow oferece funcionalidades avançadas além do método clássico de 25 minutos de foco seguidos de 5 minutos de pausa. Os usuários podem escolher entre modos pré-definidos como o Padrão com 25 minutos de foco e 5 de pausa, o Longo com 50 minutos de foco e 10 de pausa, e o Livre onde é possível definir tempos customizados. O timer permite a seleção de uma matéria antes de iniciar cada sessão, fornece notificações sonoras ao término de cada período, registra automaticamente as sessões completadas no banco de dados, e oferece suporte offline com sincronização posterior dos dados quando a conexão érestabelecida.

### Gestão de Matérias

O sistema de matérias permite o CRUD completo de disciplinas ou áreas de estudo. Cada matéria pode ser configurada com um nome descritivo, uma cor para identificação visual rápida, e um nível de prioridade que ajuda na organização do estudo. O sistema mantém um histórico de tempo dedicado a cada matéria, permitindo que os usuários acompanhem a distribuição de seus esforços de estudo ao longo do tempo.

### Sistema de Planejamento

O sistema de planejamento oferece ferramentas completas para organizar tarefas e planos de estudo. Os usuários podem criar planos com título, descrição detalhada, nível de prioridade e data de vencimento. A visualização permite escolher entre uma visão diária que mostra as tarefas do dia atual, ou uma visão semanal que apresenta uma overview de toda a semana. Os níveis de prioridade incluem baixa, média, alta e urgente, permitindo uma organização clara das tarefas por ordem de importância. O sistema integra-se com o sistema de metas para um acompanhamento unificado do progresso.

### Revisões Espaçadas

O sistema de revisões espaçadas implementa o algoritmo SM-2 (SuperMemo 2), uma metodologia cientificamente comprovada para otimização da retenção de memória. O algoritmo calcula automaticamente os intervalos de revisão baseados no desempenho do usuário: o intervalo inicial é de 1 dia, após a primeira revisão bem-sucedida aumenta para 7 dias, e após a segunda revisão para 30 dias. O sistema utiliza um fator de facilidade (ease_factor) que inicia em 2.5 e é ajustado conforme o desempenho do usuário em cada revisão. As revisões são agrupadas por data de próxima revisão, facilitando o acompanhamento do que precisa ser revisado em cada dia.

### Sistema de Metas

O sistema de metas permite que os usuários definam objetivos em três períodos diferentes: diárias para metas de tempo de estudo por dia, semanais para metas de quantidade de sessões por semana, e mensais para metas de horas estudadas por mês. O dashboard apresenta métricas em tempo real mostrando o progresso atual em relação às metas estabelecidas. Um heatmap de atividade visualiza graficamente os dias de estudo ao longo do tempo, proporcionando uma visão clara da consistência dos hábitos de estudo.

### PWA com Suporte Offline

A aplicação é uma Progressive Web App (PWA) instalável em dispositivos móveis e desktops. O suporte offline completo permite que os usuários utilizem o timer e acessem seus dados mesmo sem conexão à internet. A sincronização automática ocorre quando a conexão érestabelecida, garantindo que todos os dados sejam mantidos atualizados. O sistema utiliza IndexedDB para persistência local, armazenando sessões, planos e outros dados重要的 localmente para funcionar offline.

### Modo Escuro

A aplicação oferece alternância entre tema claro e escuro, permitindo que os usuários escolham a experiência visual mais confortável para seu contexto. A preferência de tema é persistida no armazenamento local, mantendo a escolha do usuário entre sessões. A interface foi otimizada para ambos os modos, garantindo legibilidade e boa experiência visual em qualquer configuração.

---

## Tecnologias Utilizadas

### Frontend

A stack de frontend foi cuidadosamente selecionada para proporcionar performance, developer experience e manutenibilidade. React 19.2.4 serve como biblioteca principal para construção da interface de usuário, oferecendo componentização e virtualização eficiente. TypeScript 6.0.2 adiciona tipagem estática ao projeto, reduzindo erros em tempo de desenvolvimento e melhorando a documentação do código através dos tipos.

Vite 8.0.4 actua como build tool e servidor de desenvolvimento, oferecendo hot module replacement (HMR) rápido e builds otimizados para produção. Tailwind CSS 4.2.2 fornece um framework de estilização utilitária que permite construção rápida de interfaces responsivas. Zustand 5.0.12 gerencia o estado global da aplicação de forma simples e eficiente, sendo uma alternativa mais leve que outras soluções de estado. TanStack Query 5.99.0 (anteriormente React Query) cuida do fetching e cache de dados, eliminando boilerplate e fornecendo funcionalidades avançadas como refetching automático e cache. React Router 7.14.1 gerencia a navegação entre páginas da aplicação.

date-fns 4.1.0 oferece funções utilities para manipulação e formatação de datas, sendo mais leve que Moment.js. idb 8.0.3 é um wrapper Promisified para IndexedDB que facilita o trabalho com o banco de dados local para suporte offline. uuid 13.0.0 gera identificadores únicos para entidades no sistema.

### Backend

O backend utiliza Supabase como plataforma completa de backend-as-a-service. O Supabase fornece um banco de dados PostgreSQL gerenciado com funcionalidades avançadas como auth integrado, realtime subscriptions, e APIs automaticamente geradas. A autenticação social é feita através do Google OAuth configurado no painel do Supabase.

### PWA

Para as funcionalidades PWA, foi utilizado vite-plugin-pwa que automatiza a geração do service worker e manifest. Workbox fornece estratégias de cache sophisticated para o service worker, permitindo caching offline de assets e requisições de rede.

### DevOps

O deploy é feito através do Netlify, que oferece hosting gratuito com suporte a PWA e deploy automático a cada push no repositório. Git é utilizado para controle de versão, mantendo o histórico de alterações organizado.

---

## Arquitetura do Projeto

A estrutura do projeto foi organizada seguindo boas práticas de arquitetura de aplicações React modernas. O código fonte está localizado no diretório src/, que contém todas as implementações da aplicação.

O diretório components/ contém componentes React reutilizáveis em toda a aplicação. O arquivo Layout.tsx implementa o layout principal com navegação entre as páginas e o toggle de tema escuro. Loading.tsx é um componente de spinner utilizado durante carregamentos de dados. Toast.tsx implementa o sistema de notificações toast para feedback ao usuário.

O diretório pages/ contém as páginas principais da aplicação, cada uma representando uma rota do sistema. Login.tsx é a página de entrada com design premium e gradientres. AuthCallback.tsx processa o callback do Google OAuth após o login. Dashboard.tsx apresenta métricas gerais e heatmap de atividade. Timer.tsx implementa o temporizador Pomodoro com todos os seus modos. Subjects.tsx faz a gestão de matérias e disciplinas. Plans.tsx gerencia planos de estudo com visualização diária e semanal. Reviews.tsx implementa o sistema de revisões espaçadas. Goals.tsx gerencia as metas diárias, semanais e mensais.

O diretório hooks/ contém custom hooks que encapsulam a lógica de acesso aos dados usando TanStack Query. Cada hook é responsável por um domínio específico da aplicação, como useAuth para autenticação, useSubjects para matérias, useSessions para sessões, usePlans para planos, useReviews para revisões, e useGoals para metas.

O diretório lib/ contém utilitários e configurações de integração com serviços externos. api.ts implementa a camada de comunicação com o backend Supabase. supabase.ts configura e exporta o cliente do Supabase. indexeddb.ts gerencia o banco de dados local para suporte offline.

O diretório store/ contém os stores de estado global usando Zustand. auth.ts gerencia o estado de autenticação do usuário. theme.ts armazena a preferência de tema (claro/escuro).

O diretório types/ contém definições de tipos TypeScript. database.ts define os tipos correspondentes às tabelas do banco de dados, garantindo tipagem consistente em toda a aplicação.

Na raiz do projeto, o arquivo prisma/schema.prisma define o schema do banco de dados para desenvolvimento local com Prisma. O arquivo supabase_schema.sql contém o script SQL completo para criação das tabelas no Supabase. O arquivo vite.config.ts configura o Vite incluindo o plugin PWA. O arquivo tailwind.config.js configura o Tailwind CSS. O arquivo netlify.toml configura o deploy no Netlify.

O fluxo de dados na aplicação segue um padrão hierárquico: a camada de UI (componentes React) utiliza hooks que fazem requisições através da camada de API. A API pode tanto chamar o Supabase (quando online) quanto o IndexedDB (quando offline), proporcionando uma experiência consistente independente da conectividade.

---

## Banco de Dados

O banco de dados é hospedado no Supabase utilizando PostgreSQL e contém todas as tabelas necessárias para o funcionamento da aplicação. O schema completo está disponível no arquivo supabase_schema.sql na raiz do projeto.

### Tabela de Perfis (profiles)

A tabela profiles armazena informações adicionais dos usuários além das fornecidas pelo Supabase Auth. Contém o ID do usuário que serve como chave primária e referência à tabela auth.users, o email para contato, o nome completo, a URL do avatar, e a data de criação do perfil. Esta tabela é preenchida automaticamente através de triggers quando um novo usuário faz seu primeiro login.

### Tabela de Matérias (subjects)

A tabela subjects armazena as disciplinas ou áreas de estudo do usuário. Os campos incluem ID único gerado automaticamente, ID do usuário proprietário (foreign key para profiles), nome da matéria, cor em formato hexadecimal para identificação visual, nível de prioridade (enum com valores baixa, média, alta, urgente), e timestamps de criação e atualização.

### Tabela de Sessões (sessions)

A tabela sessions registra cada sessão de estudo completada no timer Pomodoro. Os campos incluem ID único, ID do usuário proprietário, ID da matéria associada (foreign key opcional para subjects), duração em minutos, timestamp de início, timestamp de fim, e tipo de sessão (focus ou break). Cada sessão está associada a um usuário específico, permitindo isolamento completo dos dados.

### Tabela de Planos (plans)

A tabela plans armazena os planos e tarefas de estudo. Os campos incluem ID único, ID do usuário proprietário, título do plano, descrição detalhada (opcional), nível de prioridade, data de vencimento, indicador de conclusão, e timestamps. O campo completed permite marcar tarefas como finalizadas sem excluir o registro.

### Tabela de Revisões (reviews)

A tabela reviews implementa o sistema de revisões espaçadas. Os campos incluem ID único, ID do usuário proprietário, ID da matéria associada, conteúdo da revisão (texto ou pergunta), próxima data de revisão (calculada pelo algoritmo), intervalo atual em dias, fator de facilidade (inicia em 2.5), e timestamps. O algoritmo SM-2 utiliza os campos interval e ease_factor para calcular a próxima data de revisão automaticamente.

### Tabela de Metas (goals)

A tabela goals armazena as metas de estudo em diferentes períodos. Os campos incluem ID único, ID do usuário proprietário, tipo de meta (enum: daily, weekly, monthly), valor alvo, valor atual de progresso, início do período, e fim do período. O tipo determina se a meta é diária, semanal ou mensal, e os campos de período definem o intervalo de tempo para o qual a meta é válida.

---

## Configuração do Ambiente

### Variáveis de Ambiente

Para executar a aplicação localmente, é necessário criar um arquivo .env na raiz do projeto com as seguintes variáveis de ambiente. A variável VITE_SUPABASE_URL deve conter a URL do projeto Supabase, que pode ser obtida no painel do Supabase em Settings > API. A variável VITE_SUPABASE_ANON_KEY deve conter a chave anônima do projeto, também disponível em Settings > API. A variável VITE_APP_URL deve conter a URL da aplicação, que é http://localhost:5173 para desenvolvimento local.

Exemplo do arquivo .env:

```
VITE_SUPABASE_URL=https://seudominio.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
VITE_APP_URL=http://localhost:5173
```

### Configuração do Supabase

Para configurar o provedor Google OAuth no Supabase, é necessário acessar o painel do Supabase e navegar até Authentication > Providers. Nesta seção, deve-se ativar o provedor Google e configurar as credenciais obtidas no Google Cloud Console. A URL de callback do OAuth deve ser configurada como https://seudominio.netlify.app/auth/callback para produção ou http://localhost:5173/auth/callback para desenvolvimento local.

No Google Cloud Console, é preciso criar um projeto e configurar as credenciais OAuth 2.0, incluindo a URL de callback autorizada. As credenciais obtidas (Client ID e Client Secret) são então cadastradas no painel do Supabase.

---

## Instalação e Execução

### Pré-requisitos

Para executar o projeto, é necessário ter Node.js versão 18 ou superior instalado no sistema. Também é preciso ter npm ou yarn para gerenciamento de dependências, uma conta no Supabase para o backend, e uma conta Google para autenticação via OAuth.

### Instalação das Dependências

O primeiro passo é clonar o repositório do GitHub e navegar até o diretório do projeto. Em seguida, instalar todas as dependências definidas no package.json através do comando npm install. Este processo baixa todas as bibliotecas necessárias para o funcionamento da aplicação.

```bash
git clone https://github.com/waldosouzaup/studyflow.git
cd studyflow
npm install
```

### Configuração das Variáveis de Ambiente

Após a instalação, criar o arquivo .env com as variáveis de ambiente necessárias. Alternativamente, pode-se copiar o arquivo .env.example para .env e editar as variáveis com as credenciais corretas.

```bash
cp .env.example .env
# Editar o arquivo .env com as credenciais do Supabase
```

### Execução do Servidor de Desenvolvimento

Para iniciar o servidor de desenvolvimento, executar o comando npm run dev. Este comando inicia o Vite em modo de desenvolvimento com hot reload, permitindo que alterações no código sejam visualizadas imediatamente no navegador. Por padrão, o servidor fica disponível em http://localhost:5173.

```bash
npm run dev
```

### Build para Produção

Para criar uma versão de produção otimizada, executar o comando npm run build. Este comando executa a verificação de tipos TypeScript e depois constrói os arquivos otimizados para deploy na pasta dist/. Os arquivos desta pasta podem ser hospedados em qualquer serviço de static hosting como Netlify, Vercel, ou similar.

```bash
npm run build
```

---

## Funcionalidades Detalhadas

### Dashboard

O dashboard apresenta uma visão geral do progresso do usuário com várias métricas e visualizações. As métricas em tempo real incluem o total de horas estudadas no período atual, o número de sessões Pomodoro completadas, e a porcentagem de metas atingidas no período. O heatmap de atividade mostra uma representação visual dos dias de estudo ao longo do tempo, com cores mais intensas indicando maior atividade. O resumo rápido apresenta as próximas revisões agendadas e os planos pendentes para os próximos dias, permitindo que o usuário se prepare para o que vem pela frente.

### Timer Pomodoro

O timer oferece múltiplas configurações e modos de operação. O modo Padrão utiliza 25 minutos de foco seguidos de 5 minutos de pausa, sendo ideal para sessões curtas e intensas. O modo Longo utiliza 50 minutos de foco seguidos de 10 minutos de pausa, adequado para sessões mais profundas que requerem concentração prolongada. O modo Livre permite que o usuário defina tempos personalizados de foco e pausa conforme sua necessidade.

Antes de iniciar uma sessão, o usuário pode selecionar uma matéria para associar à sessão, o que permite o rastreamento do tempo dedicado a cada disciplina. Quando o tempo de foco termina, uma notificação sonora alerta o usuário. As sessões completadas são automaticamente registradas no banco de dados com todas as informações relevantes. Quando offline, as sessões são armazenadas localmente no IndexedDB e sincronizadas automaticamente quando a conexão érestabelecida.

### Matérias

O sistema de gestão de matérias permite criar, editar, listar e excluir disciplinas. Para criar uma nova matéria, o usuário informa o nome, escolhe uma cor para identificação visual, e define o nível de prioridade. A edição permite modificar qualquer campo da matéria a qualquer momento. A listagem apresenta as matérias em formato de cards com a cor correspondente, facilitando a identificação rápida. A exclusão requer confirmação para evitar exclusões acidentais, e ao excluir uma matéria, as sessões associadas permanecem no histórico.

### Planejamento

O sistema de planejamento oferece uma gestão completa de tarefas e planos de estudo. A visão diária mostra as tarefas programadas para o dia atual, permitindo foco no que precisa ser feito imediatamente. A visão semanal apresenta uma overview de toda a semana com todas as tarefas distribuídas pelos dias, permitindo planejamento de longo prazo. Os filtros permitem buscar tarefas por prioridade ou status de conclusão. A ordenação organiza as tarefas por data de vencimento ou nível de prioridade.

Cada plano pode ter título, descrição detalhada, nível de prioridade entre baixa, média, alta ou urgente, e data de vencimento. O campo de conclusão permite marcar o plano como已完成 sem删除 o registro, mantendo o histórico de tarefas realizadas.

### Revisões Espaçadas

O sistema de revisões implementa o algoritmo SM-2 para otimização da retenção de memória. O algoritmo calcula intervalos de revisão automaticamente baseados no desempenho do usuário: após a primeira revisão bem-sucedida, o próximo intervalo é de 7 dias; após a segunda revisão bem-sucedida, o intervalo aumenta para 30 dias; revisões subsequentes continuam aumentando exponencialmente.

O sistema agrupa as revisões por data de próxima revisão, facilitando a identificação do que precisa ser revisado em cada dia. Cada revisão contém o conteúdo a ser revisado, que pode ser uma pergunta, um conceito, ou qualquer informação que o usuário deseja fixar na memória. O sistema permite criar novas revisões, editar revisões existentes, marcar revisões como completadas, e excluir revisões que não são mais necessárias.

### Metas

O sistema de metas permite definir e acompanhar objetivos de estudo em diferentes períodos. As metas diárias definem uma quantidade de tempo de estudo que o usuário pretende dedicar por dia. As metas semanais definem um número de sessões que o usuário pretende completar durante a semana. As metas mensais definem uma quantidade total de horas que o usuário pretende estudar durante o mês.

O dashboard de metas apresenta o progresso atual em relação a cada meta, com visualizações claras de quanto foi alcançado e quanto falta para atingir o objetivo. O sistema calcula automaticamente a porcentagem de progresso e atualiza em tempo real conforme o usuário completa sessões e registra seu tempo de estudo.

---

## Deploy

### Deploy no Netlify

O deploy no Netlify é simplificado através da integração com o GitHub. O primeiro passo é acessar o painel do Netlify em netlify.com e selecionar a opção de adicionar um novo site. Escolha a opção de importar um projeto existente e selecione o repositório studyflow no GitHub. O Netlify detectará automaticamente as configurações do projeto a partir do arquivo netlify.toml.

Após a importação, é necessário configurar as variáveis de ambiente no painel do Netlify em Site settings > Environment Variables. Adicione todas as variáveis definidas no arquivo .env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, e VITE_APP_URL (que deve ser alterada para a URL do site no Netlify).

O deploy é automático: a cada push para a branch master, o Netlify automaticamente constrói e implanta a nova versão. A URL final da aplicação será algo como https://studyflow.netlify.app, tergantung do nome escolhido durante a configuração.

### Configurações Adicionais do Netlify

Para garantir o funcionamento correto do PWA e do roteamento, algumas configurações adicionais são necessárias no Netlify. O arquivo netlify.toml já contém as configurações necessárias para redirects e headers, mas vale a pena verificar que as regras de rewrite estão configuradas para que todas as rotas apontem para o index.html, permitindo que o React Router funcione corretamente.

A configuração de build no Netlify deve especificar o comando de build como npm run build e o diretório de publicação como dist, que é onde o Vite gera os arquivos de produção.

---

## Contribuição

Contribuições para o projeto são bem-vindas e incentivadas. Para contribuir, faça um fork do repositório no GitHub, crie uma branch para a feature ou correção que deseja implementar, faça as alterações necessárias commitando com mensagens descritivas, e push a branch para seu fork. Finalmente, abra um pull request para que as alterações sejam revisadas e incorporadas ao projeto principal.

Ao contribuir, mantenha o código limpo e bem documentado, siga os padrões de commits estabelecidos no projeto (commits em português com verbos no imperativo), teste suas alterações antes de submeter, e respeite o código de conduta do projeto.

---

## Licença

Este projeto está sob a licença MIT. Isso significa que você pode usar, copiar, modificar, mesclar, publicar, distribuir, sublicenciar e/ou vender cópias do software, desde que inclua a cópia da licença em todas as distribuições. O software é fornecido "como está", sem garantia de qualquer tipo.

---

<div align="center">

Desenvolvido com ❤️ usando React, TypeScript e Supabase

**Autor**: Waldo Souza  
**GitHub**: [waldosouzaup](https://github.com/waldosouzaup)

</div>
