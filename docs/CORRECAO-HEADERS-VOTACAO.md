# Correção de Headers das Seções de Votação

## 📋 Resumo

Correção de conflito CSS que causava duplicação de bordas nos headers das seções "Votação para Presbíteros" e "Votação para Diáconos".

---

## 🐛 Problema Identificado

Após a reorganização dos botões de projeção, os headers das seções de votação apresentavam **dois traços** (bordas duplicadas):

### Visual do Problema

```
┌─────────────────────────────────────────────────┐
│ Votação para Presbíteros    [🔲 Projetar]     │
│ ──────────────────────────────────────────────  │  ← Traço 1 (padding-bottom do h3)
│ ──────────────────────────────────────────────  │  ← Traço 2 (border-bottom do header)
│                                                 │
│ [Cards de candidatos...]                       │
└─────────────────────────────────────────────────┘
```

---

## 🔍 Causa Raiz

Havia **duas regras CSS conflitantes**:

### 1. Regra Nova (Correta)

```css
.voting-category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--gray-100); /* ✅ Border no container */
}

.voting-category-header h3 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--gray-800);
}
```

### 2. Regra Antiga (Conflito)

```css
.voting-category h3 {
  margin: 0 0 1.5rem 0;
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--gray-800);
  padding-bottom: 1rem; /* ❌ Padding extra */
  border-bottom: 2px solid var(--gray-100); /* ❌ Border duplicada */
}
```

**Problema:** O seletor `.voting-category h3` era mais genérico e aplicava estilos a **todos os H3** dentro de `.voting-category`, incluindo os H3 dentro de `.voting-category-header`.

---

## ✅ Solução Implementada

Remover a regra antiga `.voting-category h3` que não é mais necessária após a reorganização.

### CSS Corrigido

**Antes:**

```css
.voting-category-header {
  /* ... */
  border-bottom: 2px solid var(--gray-100);
}

.voting-category-header h3 {
  margin: 0;
  /* ... */
}

.voting-category h3 {
  /* ❌ Regra conflitante */
  margin: 0 0 1.5rem 0;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--gray-100);
}
```

**Depois:**

```css
.voting-category-header {
  /* ... */
  border-bottom: 2px solid var(--gray-100);
}

.voting-category-header h3 {
  margin: 0;
  /* ... */
}

/* .voting-category h3 - REMOVIDA */
```

---

## 📊 Especificidade CSS

### Análise de Seletores

| Seletor                      | Especificidade               | Aplicado a                               |
| ---------------------------- | ---------------------------- | ---------------------------------------- |
| `.voting-category h3`        | 0,1,1 (classe + elemento)    | Todos os H3 dentro de `.voting-category` |
| `.voting-category-header h3` | 0,2,1 (2 classes + elemento) | H3 dentro de `.voting-category-header`   |

**Problema:** Ambos os seletores aplicavam estilos ao mesmo H3, causando **cascata de estilos**:

```css
/* Estilos aplicados ao H3 dentro do header */
h3 {
  /* Estilos base do navegador */
}

.voting-category h3 {
  margin: 0 0 1.5rem 0; /* ❌ Margin inferior */
  padding-bottom: 1rem; /* ❌ Padding inferior */
  border-bottom: 2px solid; /* ❌ Border */
}

.voting-category-header h3 {
  margin: 0; /* ✅ Sobrescreve margin */
  /* Mas padding e border continuam da regra anterior */
}
```

**Resultado:** O H3 tinha `padding-bottom` e `border-bottom` da regra `.voting-category h3`, criando dois traços.

---

## 🎨 Visual Corrigido

### Antes da Correção

```
┌─────────────────────────────────────────────────┐
│ Votação para Presbíteros    [🔲 Projetar]     │
│ ──────────────────────────────────────────────  │  ← h3 padding-bottom
│ ──────────────────────────────────────────────  │  ← h3 border-bottom
│ ──────────────────────────────────────────────  │  ← header border-bottom
│                                                 │  ← Espaço extra
│ [Cards de candidatos...]                       │
└─────────────────────────────────────────────────┘
```

### Depois da Correção

```
┌─────────────────────────────────────────────────┐
│ Votação para Presbíteros    [🔲 Projetar]     │
│ ──────────────────────────────────────────────  │  ← header border-bottom (único)
│ [Cards de candidatos...]                       │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Estrutura Final

### HTML

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
    <!-- Cards dinâmicos -->
  </div>
</div>
```

### CSS Final

```css
/* Container da categoria */
.voting-category {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-200);
}

/* Header com título e botão */
.voting-category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem; /* Espaço antes dos cards */
  padding-bottom: 1rem; /* Espaço interno antes da borda */
  border-bottom: 2px solid var(--gray-100); /* Separador visual */
}

/* Título do header */
.voting-category-header h3 {
  margin: 0; /* Remove margins padrão */
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--gray-800);
}

/* Grid de candidatos */
.voting-candidates {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

---

## 📐 Medidas de Espaçamento

### Layout do Header

```
┌───────────────────────────────────────────────────────┐
│ ↕ 0px (h3 margin: 0)                                 │
│ Votação para Presbíteros          [Projetar]         │
│ ↕ 1rem (padding-bottom)                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ ← 2px border
│ ↕ 1.5rem (margin-bottom)                             │
│ [Card 1]  [Card 2]  [Card 3]                         │
└───────────────────────────────────────────────────────┘
```

**Espaçamentos:**

- `margin: 0` no H3 → Remove espaço acima do título
- `padding-bottom: 1rem` no header → Espaço entre título e borda
- `border-bottom: 2px` no header → Linha separadora
- `margin-bottom: 1.5rem` no header → Espaço entre borda e cards

**Total:** ~3.5rem (~56px) entre título e cards

---

## 🧪 Casos de Teste

### Teste 1: Header Presbíteros

**Verificar:**

- [x] Apenas uma linha abaixo do header
- [x] Espaçamento uniforme antes dos cards
- [x] Título e botão alinhados horizontalmente
- [x] Borda cinza clara (var(--gray-100))

---

### Teste 2: Header Diáconos

**Verificar:**

- [x] Apenas uma linha abaixo do header
- [x] Espaçamento idêntico ao header de Presbíteros
- [x] Título e botão alinhados horizontalmente
- [x] Consistência visual com Presbíteros

---

### Teste 3: Responsividade

**Mobile (<768px):**

```css
@media (max-width: 768px) {
  .voting-category-header {
    /* Manter flexbox horizontal */
    /* ou empilhar se necessário */
  }
}
```

**Verificar:**

- [ ] Título legível em telas pequenas
- [ ] Botão acessível
- [ ] Espaçamento mantido

---

## 📚 Lições Aprendidas

### 1. Especificidade de Seletores

**Evitar:** Seletores genéricos que aplicam a muitos elementos

```css
/* ❌ Muito genérico - afeta todos os H3 */
.voting-category h3 {
  border-bottom: 2px solid var(--gray-100);
}
```

**Preferir:** Seletores específicos para contextos específicos

```css
/* ✅ Específico - afeta apenas H3 no header */
.voting-category-header h3 {
  margin: 0;
}
```

---

### 2. Refatoração de CSS

Ao reorganizar HTML:

1. ✅ Verificar regras CSS antigas que podem conflitar
2. ✅ Remover regras obsoletas
3. ✅ Testar visualmente após mudanças
4. ✅ Validar consistência entre seções

---

### 3. Cascata CSS

**Problema:** Múltiplas regras aplicam ao mesmo elemento

**Solução:** Usar seletores mais específicos ou remover regras antigas

---

## ✅ Checklist de Validação

### CSS

- [x] Regra `.voting-category h3` removida
- [x] `.voting-category-header` mantém border-bottom
- [x] `.voting-category-header h3` sem margin
- [x] Espaçamentos consistentes

### Visual

- [x] Apenas uma borda abaixo do header
- [x] Espaçamento uniforme entre seções
- [x] Alinhamento correto de título e botão
- [x] Consistência entre Presbíteros e Diáconos

### Funcionalidade

- [x] Botões "Projetar" funcionais
- [x] IDs mantidos (fullscreen-presbyteros, fullscreen-diaconos)
- [x] Event listeners inalterados

---

## 📊 Comparação

### Antes

```css
/* 2 regras aplicando border */
.voting-category-header {
  border-bottom: 2px solid var(--gray-100);
}

.voting-category h3 {
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--gray-100);
}
```

**Resultado:** 2 bordas + padding extra = visual desajustado

---

### Depois

```css
/* 1 regra aplicando border */
.voting-category-header {
  border-bottom: 2px solid var(--gray-100);
}

.voting-category-header h3 {
  margin: 0;
}

/* .voting-category h3 - REMOVIDA */
```

**Resultado:** 1 borda + espaçamento controlado = visual limpo

---

## 🎓 Conclusão

Correção simples mas importante que remove conflito CSS causado por reorganização de layout:

✅ **Problema:** Duplicação de bordas  
✅ **Causa:** Seletor genérico (.voting-category h3) aplicando estilos indesejados  
✅ **Solução:** Remoção da regra antiga conflitante  
✅ **Resultado:** Headers limpos e consistentes

**Impacto:** Apenas visual, zero quebras de funcionalidade  
**Arquivos:** `assets/css/main.css` (-7 linhas)

**Status:** ✅ Corrigido  
**Data:** 11 de outubro de 2025  
**Versão:** 2.4.2
