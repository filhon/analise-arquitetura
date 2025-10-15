# Alteração da Fonte do Sistema para Inter

## Data

11 de outubro de 2025

## Objetivo

Alterar todas as fontes do sistema de eleição de oficiais para a fonte **Inter**, uma fonte moderna, profissional e otimizada para interfaces digitais.

## Sobre a Fonte Inter

**Inter** é uma fonte tipográfica projetada especificamente para telas de computador, desenvolvida por Rasmus Andersson. Características principais:

- ✅ **Legibilidade Superior**: Projetada para alta legibilidade em telas digitais
- ✅ **Profissional**: Usada por empresas como GitHub, Mozilla, Figma
- ✅ **Moderna**: Design limpo e contemporâneo
- ✅ **Versátil**: 9 pesos de fonte (300-900)
- ✅ **Open Source**: Gratuita e de código aberto
- ✅ **Otimizada**: Suporte completo a OpenType features

## Alterações Realizadas

### 1. Importação da Fonte no HTML (`index.html`)

**Adicionado:**

```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
/>
```

**Recursos importados:**

- `preconnect`: Otimização de conexão com Google Fonts
- Todos os pesos de fonte (300 a 900)
- `display=swap`: Carregamento otimizado (mostra fallback até Inter carregar)

### 2. Atualização da Variável CSS (`main.css`)

**Antes:**

```css
--font-family:
  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

**Depois:**

```css
--font-family:
  "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

**Fallback Chain:**

1. **Inter** (preferência principal)
2. **-apple-system** (macOS/iOS)
3. **BlinkMacSystemFont** (Chrome no macOS)
4. **Segoe UI** (Windows)
5. **Roboto** (Android)
6. **sans-serif** (genérico)

### 3. Otimizações de Renderização (`main.css`)

**Adicionado ao `body`:**

```css
body {
  /* ... propriedades existentes ... */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings:
    "liga" 1,
    "calt" 1;
}
```

**Explicação:**

- `-webkit-font-smoothing: antialiased`: Suavização de fonte no WebKit/Chrome
- `-moz-osx-font-smoothing: grayscale`: Suavização no Firefox macOS
- `font-feature-settings`:
  - `"liga" 1`: Ativa ligaduras (combinações de letras)
  - `"calt" 1`: Ativa alternativas contextuais

## Pesos de Fonte Disponíveis

O sistema agora tem acesso aos seguintes pesos:

| Peso | Nome       | Uso Recomendado               |
| ---- | ---------- | ----------------------------- |
| 300  | Light      | Texto secundário, legendas    |
| 400  | Regular    | Corpo de texto padrão         |
| 500  | Medium     | Ênfase leve, labels           |
| 600  | Semi-Bold  | Títulos de seções, botões     |
| 700  | Bold       | Títulos principais, destaque  |
| 800  | Extra-Bold | Títulos grandes               |
| 900  | Black      | Estatísticas, números grandes |

## Uso no Código CSS

Para aplicar diferentes pesos:

```css
/* Exemplo */
.heading-primary {
  font-weight: 700; /* Bold */
}

.stat-number {
  font-weight: 900; /* Black */
}

.body-text {
  font-weight: 400; /* Regular */
}

.button-text {
  font-weight: 500; /* Medium */
}
```

## Benefícios da Mudança

### Visual

- ✅ Aparência mais moderna e profissional
- ✅ Melhor legibilidade em telas de alta resolução
- ✅ Hierarquia visual mais clara com múltiplos pesos
- ✅ Espaçamento e proporções otimizadas

### Técnico

- ✅ Suporte a OpenType features (ligaduras, kerning)
- ✅ Renderização consistente entre navegadores
- ✅ Performance otimizada com `display=swap`
- ✅ Cache via Google Fonts CDN

### Profissional

- ✅ Alinhamento com padrões modernos de design
- ✅ Mesma fonte usada por empresas tech líderes
- ✅ Credibilidade e profissionalismo visual

## Compatibilidade

### Navegadores Suportados

- ✅ Chrome/Edge 4+
- ✅ Firefox 3.5+
- ✅ Safari 3.1+
- ✅ Opera 10+
- ✅ Internet Explorer 9+

### Dispositivos

- ✅ Desktop (Windows, macOS, Linux)
- ✅ Mobile (iOS, Android)
- ✅ Tablets
- ✅ PWA

## Performance

### Otimizações Implementadas

1. **Preconnect**: Conexão antecipada ao servidor de fontes
2. **Display Swap**: Mostra texto imediatamente com fonte fallback
3. **Subset Automático**: Google Fonts envia apenas caracteres necessários
4. **Compressão WOFF2**: Formato otimizado e comprimido

### Métricas Esperadas

- Tamanho médio: ~15-20KB por peso
- Tempo de carregamento: <200ms (com cache)
- Impacto no FCP: Mínimo (display=swap)

## Arquivos Modificados

- ✅ `index.html` - Importação da fonte Inter via Google Fonts
- ✅ `assets/css/main.css` - Atualização completa:
  - Variável `--font-family` com Inter
  - Otimizações de renderização no `body`
  - Fonte aplicada em `.btn` (botões)
  - Fonte aplicada em `.search-input`
  - Fonte aplicada em `.form-group input` e `.form-group select`
  - Regra global para `input, select, textarea, button`

## Elementos com Fonte Inter Aplicada

### Texto Geral

- ✅ Todo o `body` (herança global)
- ✅ Títulos, parágrafos, listas

### Formulários

- ✅ `<input>` (todos os tipos)
- ✅ `<select>` (dropdowns)
- ✅ `<textarea>` (áreas de texto)
- ✅ `.search-input` (campo de busca)
- ✅ `.form-group input` (campos de formulário)
- ✅ `.form-group select` (selects de formulário)

### Botões

- ✅ `<button>` (elemento nativo)
- ✅ `.btn` (classe de botão)
- ✅ Todos os variantes (primary, secondary, danger, etc.)

### Outros

- ✅ Labels de formulário
- ✅ Notificações
- ✅ Modais
- ✅ Tabelas

## Implementação CSS Detalhada

### Regra Global para Formulários

```css
/* Força fonte Inter em todos os elementos de formulário */
input,
select,
textarea,
button {
  font-family: var(--font-family);
}
```

### Botões

```css
.btn {
  /* ... outras propriedades ... */
  font-family: var(--font-family);
  font-weight: 500;
}
```

### Campo de Busca

```css
.search-input {
  /* ... outras propriedades ... */
  font-family: var(--font-family);
}
```

### Campos de Formulário

```css
.form-group input,
.form-group select {
  /* ... outras propriedades ... */
  font-family: var(--font-family);
}
```

## Antes e Depois

### Antes

- Fonte do sistema (varies por OS)
- Aparência inconsistente
- Pesos limitados disponíveis

### Depois

- Fonte Inter consistente
- Visual profissional unificado
- 9 pesos disponíveis para hierarquia
- Otimizações de renderização ativas

## Recursos Adicionais

- [Site Oficial Inter](https://rsms.me/inter/)
- [Inter no Google Fonts](https://fonts.google.com/specimen/Inter)
- [Repositório GitHub](https://github.com/rsms/inter)
- [Documentação OpenType Features](https://rsms.me/inter/#features)

## Próximos Passos (Opcional)

### Possíveis Melhorias Futuras

- [ ] Self-hosting da fonte (para controle total)
- [ ] Variable font (peso ajustável dinamicamente)
- [ ] Subset personalizado (apenas caracteres PT-BR)
- [ ] Preload para fonte crítica

---

**Status**: ✅ **Implementado e Ativo**

A fonte Inter agora está sendo usada em todo o sistema de eleição de oficiais, proporcionando uma experiência visual mais moderna, profissional e consistente.
