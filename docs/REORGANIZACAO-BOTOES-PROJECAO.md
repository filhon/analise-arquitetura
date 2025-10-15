# Reorganização dos Botões de Projeção

## 📋 Resumo

Movimentação dos botões "Projetar Presbíteros" e "Projetar Diáconos" do header geral para os headers específicos de cada seção de votação, com renomeação para apenas "Projetar".

---

## 🎯 Objetivo

Melhorar a UX tornando os botões de projeção mais contextuais e próximos do conteúdo que projetam, facilitando a identificação e reduzindo confusão.

---

## 🔄 Mudanças Implementadas

### Antes

```
┌─────────────────────────────────────────────────────────┐
│ Sistema de Votação                              [i]     │
│ [🔲 Projetar Presbíteros] [🔲 Projetar Diáconos]      │
│ [⚙️ Configurar Quórum]                                  │
├─────────────────────────────────────────────────────────┤
│ Status do Quórum                                        │
├─────────────────────────────────────────────────────────┤
│ Votação para Presbíteros                               │
│ [Cards de candidatos...]                               │
├─────────────────────────────────────────────────────────┤
│ Votação para Diáconos                                  │
│ [Cards de candidatos...]                               │
└─────────────────────────────────────────────────────────┘
```

**Problemas:**

- Botões longe do conteúdo relacionado
- Nome verboso: "Projetar Presbíteros"
- Usuário precisa ler e associar mentalmente
- Ocupam muito espaço no header geral

---

### Depois

```
┌─────────────────────────────────────────────────────────┐
│ Sistema de Votação                              [i]     │
│ [⚙️ Configurar Quórum]                                  │
├─────────────────────────────────────────────────────────┤
│ Status do Quórum                                        │
├─────────────────────────────────────────────────────────┤
│ Votação para Presbíteros          [🔲 Projetar]       │
│ [Cards de candidatos...]                               │
├─────────────────────────────────────────────────────────┤
│ Votação para Diáconos              [🔲 Projetar]       │
│ [Cards de candidatos...]                               │
└─────────────────────────────────────────────────────────┘
```

**Vantagens:**
✅ Botão adjacente ao conteúdo que projeta  
✅ Nome conciso: "Projetar"  
✅ Associação visual imediata  
✅ Header geral menos poluído  
✅ UX mais intuitiva

---

## 📝 Alterações no HTML

### 1. Header Geral (Simplificado)

**Antes:**

```html
<div class="section-actions">
  <button id="fullscreen-presbyteros" class="btn btn-primary">
    <span class="material-icons md-20">fullscreen</span>
    Projetar Presbíteros
  </button>
  <button id="fullscreen-diaconos" class="btn btn-primary">
    <span class="material-icons md-20">fullscreen</span>
    Projetar Diáconos
  </button>
  <button id="config-quorum" class="btn btn-secondary">
    <span class="material-icons md-20">settings</span>
    Configurar Quórum
  </button>
</div>
```

**Depois:**

```html
<div class="section-actions">
  <button id="config-quorum" class="btn btn-secondary">
    <span class="material-icons md-20">settings</span>
    Configurar Quórum
  </button>
</div>
```

**Mudanças:**

- ❌ Removidos `fullscreen-presbyteros` e `fullscreen-diaconos`
- ✅ Mantido apenas `config-quorum` (ação global)

---

### 2. Seção Presbíteros (Com Botão)

**Antes:**

```html
<div class="voting-category">
  <h3>Votação para Presbíteros</h3>
  <div id="voting-presbyteros" class="voting-candidates">
    <!-- Dynamic content -->
  </div>
</div>
```

**Depois:**

```html
<div class="voting-category">
  <div class="voting-category-header">
    <h3>Votação para Presbíteros</h3>
    <button id="fullscreen-presbyteros" class="btn btn-primary btn-sm">
      <span class="material-icons md-18">fullscreen</span>
      Projetar
    </button>
  </div>
  <div id="voting-presbyteros" class="voting-candidates">
    <!-- Dynamic content -->
  </div>
</div>
```

**Mudanças:**

- ✅ Novo elemento: `.voting-category-header`
- ✅ H3 e botão lado a lado (flexbox)
- ✅ Botão menor: `btn-sm` + `md-18`
- ✅ Texto conciso: "Projetar"

---

### 3. Seção Diáconos (Com Botão)

**Antes:**

```html
<div class="voting-category">
  <h3>Votação para Diáconos</h3>
  <div id="voting-diaconos" class="voting-candidates">
    <!-- Dynamic content -->
  </div>
</div>
```

**Depois:**

```html
<div class="voting-category">
  <div class="voting-category-header">
    <h3>Votação para Diáconos</h3>
    <button id="fullscreen-diaconos" class="btn btn-primary btn-sm">
      <span class="material-icons md-18">fullscreen</span>
      Projetar
    </button>
  </div>
  <div id="voting-diaconos" class="voting-candidates">
    <!-- Dynamic content -->
  </div>
</div>
```

**Mudanças:**

- ✅ Novo elemento: `.voting-category-header`
- ✅ H3 e botão lado a lado (flexbox)
- ✅ Botão menor: `btn-sm` + `md-18`
- ✅ Texto conciso: "Projetar"

---

### 4. Tooltip Atualizado

**Antes:**

```html
<p>
  Inicie a projeção em tela cheia clicando em
  <strong>Projetar Presbíteros</strong> ou <strong>Projetar Diáconos</strong>.
  Os votos são contabilizados em tempo real e sincronizados automaticamente.
</p>
```

**Depois:**

```html
<p>
  Inicie a projeção em tela cheia clicando em
  <strong>Projetar</strong> na seção desejada. Os votos são contabilizados em
  tempo real e sincronizados automaticamente.
</p>
```

---

## 🎨 Novos Estilos CSS

### 1. Header de Categoria

```css
.voting-category-header {
  display: flex;
  justify-content: space-between; /* Título à esquerda, botão à direita */
  align-items: center; /* Alinhamento vertical */
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--gray-100);
}

.voting-category-header h3 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--gray-800);
}
```

**Estrutura:**

```
┌────────────────────────────────────────────────┐
│ Votação para Presbíteros      [🔲 Projetar]  │
│───────────────────────────────────────────────│
│ (Cards de candidatos...)                      │
└────────────────────────────────────────────────┘
```

**Flexbox:**

- `justify-content: space-between` → Espaça título e botão
- `align-items: center` → Alinha verticalmente
- `margin-bottom: 1.5rem` → Espaço antes dos cards
- `border-bottom: 2px solid` → Separador visual

---

### 2. Estilos Reutilizados

Os seguintes estilos **já existiam** e foram reutilizados:

```css
/* Botão Pequeno */
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: var(--font-size-sm);
}

/* Ícone 18px */
.material-icons.md-18 {
  font-size: 18px;
}
```

---

## 📊 Comparação Visual

### Tamanho dos Botões

| Contexto             | Classe       | Ícone   | Texto | Uso               |
| -------------------- | ------------ | ------- | ----- | ----------------- |
| **Header Geral**     | `btn`        | `md-20` | Longo | Ações globais     |
| **Header Categoria** | `btn btn-sm` | `md-18` | Curto | Ações contextuais |

**Exemplo:**

```html
<!-- Header Geral (Grande) -->
<button class="btn btn-secondary">
  <span class="material-icons md-20">settings</span>
  Configurar Quórum
</button>

<!-- Header Categoria (Pequeno) -->
<button class="btn btn-primary btn-sm">
  <span class="material-icons md-18">fullscreen</span>
  Projetar
</button>
```

---

## 🔄 Fluxo de Uso

### Antes (Botões no Header Geral)

```
1. Usuário vai para aba Votação
         ↓
2. Vê botões "Projetar Presbíteros" e "Projetar Diáconos" no topo
         ↓
3. Precisa rolar para ver as seções
         ↓
4. Associa mentalmente: "Botão Presbíteros → Seção Presbíteros"
         ↓
5. Rola de volta ao topo para clicar
         ↓
6. Clica no botão correto
```

**Problemas:**

- ❌ Rolagem desnecessária
- ❌ Associação mental requerida
- ❌ Risco de clicar no botão errado

---

### Depois (Botões nos Headers das Seções)

```
1. Usuário vai para aba Votação
         ↓
2. Rola até a seção desejada
         ↓
3. Vê o botão "Projetar" ao lado do título
         ↓
4. Associação visual imediata: "Projetar ESTA seção"
         ↓
5. Clica no botão adjacente
```

**Vantagens:**

- ✅ Zero rolagem extra
- ✅ Associação visual natural
- ✅ Impossível clicar no botão errado

---

## 📱 Responsividade

### Desktop (≥768px)

```
┌──────────────────────────────────────────────────────┐
│ Votação para Presbíteros            [🔲 Projetar]  │
└──────────────────────────────────────────────────────┘
```

**Flexbox:**

- Título à esquerda
- Botão à direita
- Alinhamento centralizado verticalmente

---

### Mobile (<768px)

Pode ser necessário empilhar em telas muito pequenas. Adicionar media query se necessário:

```css
@media (max-width: 480px) {
  .voting-category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .voting-category-header button {
    width: 100%;
  }
}
```

**Resultado:**

```
┌────────────────────────────┐
│ Votação para Presbíteros   │
│ [🔲 Projetar (100% width)] │
└────────────────────────────┘
```

---

## ✅ Checklist de Validação

### HTML

- [x] Botões removidos do header geral
- [x] Botão "Configurar Quórum" mantido no header geral
- [x] `.voting-category-header` criado para Presbíteros
- [x] `.voting-category-header` criado para Diáconos
- [x] IDs `fullscreen-presbyteros` e `fullscreen-diaconos` mantidos
- [x] Texto dos botões mudado para "Projetar"
- [x] Ícones mudados para `md-18`
- [x] Classes `btn-sm` adicionadas
- [x] Tooltip atualizado

### CSS

- [x] `.voting-category-header` estilizado (flexbox)
- [x] `.voting-category-header h3` sem margin
- [x] `btn-sm` já existe (reutilizado)
- [x] `md-18` já existe (reutilizado)
- [x] Border-bottom mantido

### JavaScript

- [x] IDs dos botões inalterados (event listeners funcionam)
- [x] Nenhuma mudança necessária no TypeScript

### UX

- [x] Botões adjacentes ao conteúdo relacionado
- [x] Texto conciso e direto
- [x] Hierarquia visual clara
- [x] Header geral menos poluído

---

## 🎓 Benefícios da Mudança

### 1. Proximidade (Lei da Gestalt)

**Antes:** Botões distantes do conteúdo (topo da página)  
**Depois:** Botões adjacentes ao conteúdo (header da seção)

**Resultado:** Usuário associa instantaneamente botão → seção

---

### 2. Redução de Texto

**Antes:** "Projetar Presbíteros" (21 caracteres)  
**Depois:** "Projetar" (8 caracteres)

**Resultado:** Interface mais limpa, leitura mais rápida

---

### 3. Contextualização

**Antes:** Dois botões genéricos no topo  
**Depois:** Um botão específico por seção

**Resultado:** Zero ambiguidade sobre qual seção será projetada

---

### 4. Escalabilidade

Se no futuro houver mais categorias (ex: "Pastores Auxiliares"):

**Antes:**

```html
<button>Projetar Presbíteros</button>
<button>Projetar Diáconos</button>
<button>Projetar Pastores</button>
<!-- Polui header -->
```

**Depois:**

```html
<!-- Cada seção tem seu próprio botão -->
<div class="voting-category-header">
  <h3>Votação para Pastores</h3>
  <button>Projetar</button>
</div>
```

**Resultado:** Arquitetura escalável sem poluir header geral

---

## 🔍 Comparação de Layouts

### Layout Anterior

```css
/* 3 botões no header geral */
.section-actions {
  display: flex;
  gap: 1rem;
}

/* Ocupava ~600px de largura */
[Projetar Presbíteros 200px] [Projetar Diáconos 200px] [Configurar Quórum 150px]
```

---

### Layout Atual

```css
/* 1 botão no header geral */
.section-actions {
  display: flex;
  gap: 1rem;
}

/* Ocupa ~150px de largura */
[Configurar Quórum 150px]

/* Botões contextuais nas seções */
.voting-category-header {
  display: flex;
  justify-content: space-between;
}

/* Layout: Título (flex-grow) | Botão (auto) */
[Votação para Presbíteros ───────────────] [Projetar 100px]
```

**Economia de espaço:** ~450px no header geral

---

## 📚 Arquivos Modificados

### 1. index.html

**Mudanças:**

- ✅ Removidos 2 botões do `.section-actions`
- ✅ Adicionados 2 `.voting-category-header`
- ✅ Botões movidos para headers específicos
- ✅ Tooltip atualizado

**Linhas:** ~240-300

---

### 2. assets/css/main.css

**Mudanças:**

- ✅ Adicionado `.voting-category-header` (flexbox)
- ✅ Adicionado `.voting-category-header h3`

**Linhas:** ~1186-1215

---

### 3. src/ui/manager.ts

**Mudanças:**

- ✅ Nenhuma (IDs dos botões mantidos)

**Razão:** Event listeners já usam `getElementById()`, então funcionam independente da localização do botão no DOM.

---

## 🎯 Conclusão

Reorganização bem-sucedida que melhora:

✅ **Proximidade** - Botões adjacentes ao conteúdo  
✅ **Clareza** - Texto conciso ("Projetar")  
✅ **Contexto** - Zero ambiguidade  
✅ **Escalabilidade** - Adicionar categorias sem poluir header  
✅ **Estética** - Interface mais limpa e organizada

**Compatibilidade:** 100% - Nenhuma quebra de funcionalidade  
**Impacto:** Apenas visual/UX, lógica JavaScript inalterada

**Status:** ✅ Implementado  
**Data:** 11 de outubro de 2025  
**Versão:** 2.4.1
