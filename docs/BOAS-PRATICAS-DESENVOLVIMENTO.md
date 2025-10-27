# Boas Práticas de Desenvolvimento Seguro com GitHub

## Visão Geral

Este guia implementa um fluxo de desenvolvimento profissional que protege o ambiente de produção enquanto permite desenvolvimento ágil de novas features. Baseado em práticas da indústria, este passo-a-passo garante qualidade de código, revisões obrigatórias e deploys seguros.

## Pré-requisitos

- Conta GitHub com repositório configurado
- Projeto já em produção no Vercel
- Conhecimento básico de Git e GitHub
- Node.js e npm/yarn instalados

## Passo 1: Configurar Branch Protection Rules

### Objetivo

Proteger a branch `main` contra commits diretos e exigir qualidade de código.

### Passos Detalhados

1. **Acesse as configurações do repositório:**
   - Vá para seu repositório no GitHub
   - Clique em "Settings" → "Branches"

2. **Adicione regra para branch main:**
   - Clique em "Add branch protection rule"
   - Branch name pattern: `main`

3. **Configure as proteções:**
   - ✅ "Require a pull request before merging"
   - ✅ "Require approvals" (mínimo 1 reviewer)
   - ✅ "Dismiss stale pull request approvals when new commits are pushed"
   - ✅ "Require status checks to pass before merging"
   - ✅ "Require branches to be up to date before merging"

4. **Status checks obrigatórios:**
   - Adicione: `build`, `lint`, `type-check`, `test`

## Passo 2: Criar GitHub Actions Workflow (CI)

### Objetivo

Automatizar testes, lint e build em cada push/PR.

### Passos Detalhados

1. **Crie a pasta do workflow:**

   ```
   .github/workflows/ci.yml
   ```

2. **Conteúdo do arquivo `.github/workflows/ci.yml`:**

   ```yaml
   name: CI

   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]

   jobs:
     test:
       runs-on: ubuntu-latest

       steps:
         - uses: actions/checkout@v4

         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: "18"
             cache: "npm"

         - name: Install dependencies
           run: npm ci

         - name: Type check
           run: npm run type-check

         - name: Lint
           run: npm run lint

         - name: Test
           run: npm run test

         - name: Build
           run: npm run build
   ```

3. **Teste o workflow:**
   - Faça commit e push do arquivo
   - Verifique se o workflow roda em "Actions"

## Passo 3: Configurar Pull Request Template

### Objetivo

Padronizar a criação de PRs com informações essenciais.

### Passos Detalhados

1. **Crie o template:**
   Arquivo: `.github/PULL_REQUEST_TEMPLATE.md`

2. **Conteúdo do template:**

   ```markdown
   ## Descrição

   [Descreva brevemente a mudança proposta]

   ## Tipo de Mudança

   - [ ] 🐛 Bug fix
   - [ ] ✨ Nova feature
   - [ ] 💥 Breaking change
   - [ ] 📚 Documentação
   - [ ] 🎨 Estilo/UI
   - [ ] ♻️ Refatoração
   - [ ] ⚡ Performance
   - [ ] ✅ Testes

   ## Checklist

   - [ ] Testes foram adicionados/atualizados
   - [ ] Documentação foi atualizada
   - [ ] Código foi revisado por pelo menos 1 pessoa
   - [ ] Não há breaking changes
   - [ ] Funciona em produção (staging)

   ## Screenshots (se aplicável)

   [Adicione screenshots da mudança]

   ## Testes

   [Descreva como testar a mudança]

   ## Notas Adicionais

   [Qualquer informação extra relevante]
   ```

## Passo 4: Configurar Vercel Preview Deployments

### Objetivo

Ter ambientes de preview automáticos para cada PR.

### Passos Detalhados

1. **Conecte o repositório ao Vercel:**
   - Vá para Vercel dashboard
   - Importe seu projeto GitHub
   - Configure as variáveis de ambiente

2. **Configure preview deployments:**
   - Em Vercel: Project Settings → Git
   - ✅ "Production Branch": `main`
   - ✅ "Preview deployments for all branches"

3. **Teste o preview:**
   - Crie uma branch de teste
   - Faça um PR
   - Vercel criará automaticamente um preview URL

## Passo 5: Implementar Conventional Commits

### Objetivo

Padronizar mensagens de commit para releases automáticos.

### Passos Detalhados

1. **Instale commitizen (opcional):**

   ```bash
   npm install -g commitizen
   ```

2. **Configure conventional commits:**
   - Commits devem seguir: `type(scope): description`
   - Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

3. **Exemplos:**
   ```
   feat: adicionar sistema de votação
   fix: corrigir bug no contador de presença
   docs: atualizar README com instruções de deploy
   ```

## Passo 6: Configurar Release Automático

### Objetivo

Automatizar versionamento e releases via GitHub.

### Passos Detalhados

1. **Instale semantic-release:**

   ```bash
   npm install --save-dev semantic-release @semantic-release/changelog @semantic-release/git
   ```

2. **Crie `.releaserc`:**

   ```json
   {
     "branches": ["main"],
     "plugins": [
       "@semantic-release/commit-analyzer",
       "@semantic-release/release-notes-generator",
       "@semantic-release/changelog",
       "@semantic-release/npm",
       "@semantic-release/git",
       "@semantic-release/github"
     ]
   }
   ```

3. **Adicione workflow de release:**
   Arquivo: `.github/workflows/release.yml`

   ```yaml
   name: Release

   on:
     push:
       branches: [main]

   jobs:
     release:
       runs-on: ubuntu-latest

       steps:
         - uses: actions/checkout@v4
           with:
             fetch-depth: 0

         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: "18"

         - name: Install dependencies
           run: npm ci

         - name: Release
           run: npx semantic-release
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

## Passo 7: Implementar Feature Flags (Opcional Avançado)

### Objetivo

Controlar ativação gradual de features em produção.

### Passos Detalhados

1. **Instale uma lib de feature flags:**

   ```bash
   npm install launchdarkly-js-client-sdk
   ```

2. **Configure no código:**

   ```typescript
   // Exemplo básico
   const flags = {
     novaFeatureVotacao: process.env.VITE_FEATURE_VOTACAO === "true",
   };

   if (flags.novaFeatureVotacao) {
     // Código da nova feature
   }
   ```

3. **Controle via variáveis de ambiente no Vercel**

## Passo 8: Configurar Monitoramento

### Objetivo

Monitorar erros e performance em produção.

### Passos Detalhados

1. **Configure Sentry (recomendado):**

   ```bash
   npm install @sentry/browser @sentry/tracing
   ```

2. **Inicialize no código:**

   ```typescript
   import * as Sentry from "@sentry/browser";

   Sentry.init({
     dsn: process.env.VITE_SENTRY_DSN,
     integrations: [new Sentry.BrowserTracing()],
     tracesSampleRate: 1.0,
   });
   ```

3. **Configure alertas no Sentry dashboard**

## Fluxo de Trabalho Diário

### Desenvolvendo uma Nova Feature

1. **Crie uma branch:**

   ```bash
   git checkout -b feature/nome-da-feature
   ```

2. **Desenvolva e teste localmente:**

   ```bash
   npm run dev
   npm run test
   npm run lint
   ```

3. **Faça commits convencionais:**

   ```bash
   git add .
   git commit -m "feat: implementar nova funcionalidade"
   ```

4. **Push e crie PR:**

   ```bash
   git push origin feature/nome-da-feature
   # Crie PR no GitHub
   ```

5. **Aguarde CI e revisão:**
   - CI deve passar todos os checks
   - Obtenha aprovação do reviewer
   - Teste o preview deployment

6. **Merge para main:**
   - Squash merge recomendado
   - Release automático será criado

### Em Caso de Problema em Produção

1. **Identifique o problema via Sentry/logs**
2. **Crie hotfix branch:**
   ```bash
   git checkout -b hotfix/descrição-do-bug main
   ```
3. **Corrija e teste**
4. **PR urgente com prioridade alta**
5. **Deploy após aprovação**

## Benefícios Implementados

- ✅ **Segurança:** Branch protection previne commits ruins
- ✅ **Qualidade:** CI obrigatório garante código testado
- ✅ **Revisão:** PRs obrigatórios melhoram qualidade
- ✅ **Previews:** Teste visual antes do deploy
- ✅ **Automação:** Releases e versionamento automático
- ✅ **Monitoramento:** Alertas proativos de problemas
- ✅ **Rollback:** Capacidade de reverter rapidamente

## Próximos Passos

1. Implemente os passos 1-3 primeiro (proteção básica)
2. Adicione CI (passo 2) para automação
3. Configure previews (passo 4) para validação visual
4. Implemente releases automáticos (passo 6)
5. Adicione monitoramento (passo 8) para observabilidade

## Suporte

- Consulte a documentação do GitHub Actions
- Vercel docs para preview deployments
- Semantic-release para releases automáticos
- Sentry para monitoramento

---

**Última atualização:** Outubro 2025
