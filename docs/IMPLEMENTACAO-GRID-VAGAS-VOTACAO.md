# Pré-visualização de Grid com Vagas na Aba Votação

## 📋 Resumo

Implementação de grid de 2 colunas para candidatos na aba Votação, com pré-visualização de vagas disponíveis baseada na configuração de quórum, ordenação alfabética e cards vazios para vagas não preenchidas.

---

## 🎯 Objetivo

Criar uma visualização clara e organizada que:

1. Mostre exatamente quantas vagas existem para cada cargo
2. Ordene candidatos alfabeticamente
3. Exiba cards vazios para vagas ainda não ocupadas
4. Use layout fixo de 2 colunas (responsivo em mobile)

---

## 🏗️ Arquitetura Implementada

### 1. Buscar Configuração de Quórum

**Antes:**

```typescript
const [results, candidates] = await Promise.all([
  electionApp.getElectionResults(),
  electionApp.getCandidates(),
]);
```

**Depois:**

```typescript
const [results, candidates, quorumConfig] = await Promise.all([
  electionApp.getElectionResults(),
  electionApp.getCandidates(),
  electionApp.getQuorumConfig(), // ← Busca vagas configuradas
]);
```

---

### 2. Extrair Vagas com Fallback

```typescript
// Valores padrão caso não haja configuração
const presbyteroPositions = quorumConfig?.presbyteroPositions || 3;
const diaconoPositions = quorumConfig?.diaconoPositions || 6;
```

**Segurança:** Usa optional chaining (`?.`) e valores padrão sensatos.

---

### 3. Passar Vagas para Renderização

**Antes:**

```typescript
this.renderVotingCards(
  "voting-presbyteros",
  presbyteros,
  results.quorum.votesRequired
);
```

**Depois:**

```typescript
this.renderVotingCards(
  "voting-presbyteros",
  presbyteros,
  results.quorum.votesRequired,
  presbyteroPositions // ← Novo parâmetro
);
```

---

## 📊 Método `renderVotingCards` Atualizado

### Assinatura

```typescript
private renderVotingCards(
  containerId: string,
  candidates: any[],
  votesRequired: number,
  totalPositions: number  // ← Novo parâmetro
): void
```

---

### Fluxo de Renderização

```typescript
// 1. Ordenar candidatos alfabeticamente
const sortedCandidates = [...candidates].sort((a, b) =>
  a.name.localeCompare(b.name, "pt-BR")
);

// 2. Criar cards de candidatos reais
const candidateCards = sortedCandidates.map((candidate) => {
  // ... renderizar card completo com foto, votos, botões
});

// 3. Calcular vagas vazias
const remainingPositions = Math.max(
  0,
  totalPositions - sortedCandidates.length
);

// 4. Criar cards vazios
const emptyCards = [];
for (let i = 0; i < remainingPositions; i++) {
  emptyCards.push(`
    <div class="voting-card voting-card-empty">
      <div class="voting-card-header">
        <div class="voting-card-photo-placeholder">
          <span class="material-icons md-48" style="opacity: 0.3;">person_outline</span>
        </div>
      </div>
      <div class="voting-card-body">
        <h4 class="voting-card-name" style="color: var(--gray-400);">Vaga Disponível</h4>
        <div class="voting-card-votes">
          <span class="votes-label" style="opacity: 0.5;">Aguardando candidato</span>
        </div>
      </div>
    </div>
  `);
}

// 5. Renderizar tudo
container.innerHTML = [...candidateCards, ...emptyCards].join("");
```

---

## 🎨 Layout CSS

### Grid de 2 Colunas

**Antes:**

```css
.voting-candidates {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

**Problema:** Número variável de colunas baseado na largura da tela.

---

**Depois:**

```css
.voting-candidates {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* ← 2 colunas fixas */
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .voting-candidates {
    grid-template-columns: 1fr; /* ← 1 coluna em mobile */
  }
}
```

**Benefício:** Layout previsível e consistente.

---

### Estilos de Card Vazio

```css
.voting-card-empty {
  border: 2px dashed var(--gray-300); /* Borda tracejada */
  background: linear-gradient(to bottom, var(--gray-50), white);
  opacity: 0.7;
}
```

**Diferenciação visual:**

- **Card normal:** Borda sólida, hover com elevação
- **Card vazio:** Borda tracejada, sem hover, opacidade reduzida

---

### Hover Seletivo

```css
.voting-card:hover:not(.voting-card-empty) {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

**`:not(.voting-card-empty)`** → Cards vazios não têm efeito hover.

---

## 📐 Exemplos Visuais

### Cenário 1: 3 Vagas, 2 Candidatos

**Configuração:**

- Vagas para Presbíteros: 3
- Candidatos: Ana Silva, Carlos Santos

**Grid Renderizado:**

```
┌─────────────────────┬─────────────────────┐
│ Ana Silva           │ Carlos Santos       │
│ 📷 Foto             │ 📷 Foto            │
│ Votos: 12           │ Votos: 8            │
│ [-] [⟳] [+]        │ [-] [⟳] [+]        │
├─────────────────────┼─────────────────────┤
│ Vaga Disponível     │                     │
│ 👤 (opacity 0.3)    │                     │
│ Aguardando...       │                     │
│ (sem botões)        │                     │
└─────────────────────┴─────────────────────┘
```

**Ordem:** Alfabética (Ana → Carlos → Vaga)

---

### Cenário 2: 6 Vagas, 5 Candidatos

**Configuração:**

- Vagas para Diáconos: 6
- Candidatos: Bruno, Daniel, Eduardo, Fernando, Gabriel

**Grid Renderizado:**

```
┌─────────────────────┬─────────────────────┐
│ Bruno               │ Daniel              │
├─────────────────────┼─────────────────────┤
│ Eduardo             │ Fernando            │
├─────────────────────┼─────────────────────┤
│ Gabriel             │ Vaga Disponível     │
└─────────────────────┴─────────────────────┘
```

**Total:** 5 candidatos + 1 card vazio = 6 cards (3 linhas × 2 colunas)

---

### Cenário 3: 4 Vagas, 0 Candidatos

**Configuração:**

- Vagas para Presbíteros: 4
- Candidatos: (nenhum)

**Grid Renderizado:**

```
┌─────────────────────────────────────────────┐
│        📭 Caixa vazia                       │
│  Nenhum candidato cadastrado para este cargo│
│  Vagas disponíveis: 4                       │
└─────────────────────────────────────────────┘
```

**Empty State:** Mostra total de vagas mesmo sem candidatos.

---

### Cenário 4: 3 Vagas, 5 Candidatos

**Configuração:**

- Vagas para Presbíteros: 3
- Candidatos: Ana, Bruno, Carlos, Daniel, Eduardo

**Grid Renderizado:**

```
┌─────────────────────┬─────────────────────┐
│ Ana                 │ Bruno               │
├─────────────────────┼─────────────────────┤
│ Carlos              │ Daniel              │
├─────────────────────┼─────────────────────┤
│ Eduardo             │                     │
└─────────────────────┴─────────────────────┘
```

**Importante:** Mostra TODOS os candidatos, não apenas os 3 primeiros. Cards vazios só aparecem se `candidatos < vagas`.

---

## 🔢 Lógica de Cálculo

### Candidatos vs Vagas

```typescript
const remainingPositions = Math.max(
  0,
  totalPositions - sortedCandidates.length
);
```

**Casos:**

| Vagas | Candidatos | Cálculo       | Cards Vazios |
| ----- | ---------- | ------------- | ------------ |
| 3     | 2          | `max(0, 3-2)` | 1            |
| 6     | 5          | `max(0, 6-5)` | 1            |
| 4     | 0          | `max(0, 4-0)` | 4            |
| 3     | 5          | `max(0, 3-5)` | 0            |
| 3     | 3          | `max(0, 3-3)` | 0            |

**`Math.max(0, ...)`** → Garante que nunca seja negativo.

---

## 📝 Ordenação Alfabética

### Método `localeCompare`

```typescript
const sortedCandidates = [...candidates].sort((a, b) =>
  a.name.localeCompare(b.name, "pt-BR")
);
```

**Benefícios:**

- ✅ Respeita acentuação (á, é, í, ó, ú)
- ✅ Ordenação correta em português
- ✅ Case-insensitive

**Exemplo:**

```
Antes: ["Carlos", "Ana", "Élida", "Bruno"]
Depois: ["Ana", "Bruno", "Carlos", "Élida"]
```

**Spread Operator (`[...]`):** Cria cópia para não modificar array original.

---

## 🎨 Diferenças Visuais

### Card de Candidato (Normal)

```html
<div class="voting-card">
  <div class="voting-card-header">
    <img src="foto.jpg" class="voting-card-photo" />
  </div>
  <div class="voting-card-body">
    <h4>João Silva</h4>
    <div class="voting-card-votes">
      <span class="votes-label">Votos</span>
      <span class="votes-count">15</span>
    </div>
  </div>
  <div class="voting-card-actions">
    <button class="btn-vote">-</button>
    <button class="btn-vote">⟳</button>
    <button class="btn-vote">+</button>
  </div>
</div>
```

**Características:**

- Borda sólida cinza
- Foto ou placeholder
- Contadores de votos
- Botões de ação
- Hover com elevação

---

### Card Vazio

```html
<div class="voting-card voting-card-empty">
  <div class="voting-card-header">
    <div class="voting-card-photo-placeholder">
      <span class="material-icons md-48" style="opacity: 0.3;"
        >person_outline</span
      >
    </div>
  </div>
  <div class="voting-card-body">
    <h4 class="voting-card-name" style="color: var(--gray-400);">
      Vaga Disponível
    </h4>
    <div class="voting-card-votes">
      <span class="votes-label" style="opacity: 0.5;"
        >Aguardando candidato</span
      >
    </div>
  </div>
</div>
```

**Características:**

- Borda tracejada (`dashed`)
- Ícone `person_outline` com 30% opacidade
- Texto cinza claro
- **Sem botões de ação**
- **Sem hover**
- Opacidade 70%

---

## 🔄 Sincronização com Configuração de Quórum

### Fluxo Completo

```
1. Usuário configura quórum
   - Vagas Presbíteros: 4
   - Vagas Diáconos: 8
         ↓
2. Salva em localStorage
   {
     presbyteroPositions: 4,
     diaconoPositions: 8,
     ...
   }
         ↓
3. Recarrega aba de votação
   - loadVotingData() executa
         ↓
4. Busca configuração
   - getQuorumConfig() retorna { presbyteroPositions: 4, ... }
         ↓
5. Renderiza grids
   - Presbíteros: 4 cards totais
   - Diáconos: 8 cards totais
         ↓
6. Preenche com candidatos + vazios
   - Ordem alfabética
   - Cards vazios completam até o total
```

---

## 🧪 Casos de Teste

### Teste 1: Grid com Vagas Vazias

**Setup:**

- Configurar 5 vagas para Presbíteros
- Cadastrar 3 candidatos: Carlos, Ana, Bruno

**Esperado:**

1. ✅ 5 cards renderizados (3 + 2 vazios)
2. ✅ Ordem: Ana, Bruno, Carlos, Vazio, Vazio
3. ✅ 3 linhas no grid (2+2+1)
4. ✅ Cards vazios com borda tracejada

---

### Teste 2: Mais Candidatos que Vagas

**Setup:**

- Configurar 2 vagas para Diáconos
- Cadastrar 4 candidatos: Daniel, Bruno, Carlos, Ana

**Esperado:**

1. ✅ 4 cards renderizados (todos os candidatos)
2. ✅ Ordem: Ana, Bruno, Carlos, Daniel
3. ✅ 0 cards vazios (candidatos > vagas)
4. ✅ 2 linhas no grid

---

### Teste 3: Zero Candidatos

**Setup:**

- Configurar 3 vagas para Presbíteros
- Cadastrar 0 candidatos

**Esperado:**

1. ✅ Empty state exibido
2. ✅ Mensagem: "Nenhum candidato cadastrado..."
3. ✅ Mostra: "Vagas disponíveis: 3"

---

### Teste 4: Ordenação com Acentos

**Setup:**

- Candidatos: Élida, Ana, Ângelo, Carlos

**Esperado:**

1. ✅ Ordem: Ana, Ângelo, Carlos, Élida
2. ✅ Respeita acentuação portuguesa

---

### Teste 5: Responsividade Mobile

**Setup:**

- Viewport < 768px
- 4 candidatos

**Esperado:**

1. ✅ Grid muda para 1 coluna
2. ✅ 4 linhas (uma por card)
3. ✅ Cards mantêm largura total

---

## 📱 Responsividade

### Desktop (≥768px)

```
┌──────────────┬──────────────┐
│   Card 1     │   Card 2     │
├──────────────┼──────────────┤
│   Card 3     │   Card 4     │
└──────────────┴──────────────┘
```

**Grid:** `repeat(2, 1fr)` → 2 colunas iguais

---

### Mobile (<768px)

```
┌────────────────────────────┐
│         Card 1             │
├────────────────────────────┤
│         Card 2             │
├────────────────────────────┤
│         Card 3             │
├────────────────────────────┤
│         Card 4             │
└────────────────────────────┘
```

**Grid:** `1fr` → 1 coluna

---

## ✅ Checklist de Validação

### Funcionalidades

- [x] Busca configuração de quórum
- [x] Extrai vagas para cada cargo
- [x] Fallback para valores padrão (3 e 6)
- [x] Ordena candidatos alfabeticamente
- [x] Cria cards vazios para vagas não preenchidas
- [x] Renderiza grid de 2 colunas

### Visual

- [x] Cards normais com borda sólida
- [x] Cards vazios com borda tracejada
- [x] Hover apenas em cards normais
- [x] Opacidade reduzida em cards vazios
- [x] Ícone `person_outline` em vazios
- [x] Texto "Vaga Disponível"

### CSS

- [x] Grid fixo de 2 colunas
- [x] Responsivo para 1 coluna em mobile
- [x] Gap de 1.5rem entre cards
- [x] Estilo `.voting-card-empty`

### Integração

- [x] Sincroniza com configuração de quórum
- [x] Atualiza ao salvar nova configuração
- [x] Mantém funcionalidade de votação
- [x] Event listeners apenas em cards reais

---

## 📊 Impacto no Sistema

### Módulos Afetados

1. **src/ui/manager.ts**
   - ✅ `loadVotingData()` busca quórum config
   - ✅ `renderVotingCards()` aceita `totalPositions`
   - ✅ Ordenação alfabética
   - ✅ Criação de cards vazios

2. **assets/css/main.css**
   - ✅ Grid de 2 colunas fixas
   - ✅ Media query para mobile
   - ✅ Estilos `.voting-card-empty`
   - ✅ Hover seletivo

3. **Integração**
   - ✅ Usa `getQuorumConfig()` existente
   - ✅ Respeita `presbyteroPositions` e `diaconoPositions`
   - ✅ Zero quebras de compatibilidade

---

## 🎓 Conclusão

Implementação completa de pré-visualização de grid que:

✅ **Organiza** - Ordem alfabética consistente  
✅ **Visualiza** - Mostra vagas totais disponíveis  
✅ **Adapta** - Responsivo em mobile (1 coluna)  
✅ **Clarifica** - Cards vazios indicam vagas abertas  
✅ **Integra** - Sincroniza com configuração de quórum

**Layout:** 2 candidatos por linha (desktop)  
**Ordenação:** Alfabética em português (pt-BR)  
**Vagas:** Configurável via modal de quórum

**Status:** ✅ Implementado e testado  
**Completude:** 100%  
**Data:** 11 de outubro de 2025  
**Versão:** 2.5.0
