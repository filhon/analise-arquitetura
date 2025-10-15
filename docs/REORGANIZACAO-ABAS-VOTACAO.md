# Reorganização: Votação Movida para Aba Votação

## Data: 11 de outubro de 2025

## Mudança de Arquitetura

### Conceito Anterior

- **Aba Candidatos**: Gerenciamento + Votação
- **Aba Votação**: Apenas configuração de quórum

### Novo Conceito ✅

- **Aba Candidatos**: Apenas gerenciamento (visualização, edição, foto)
- **Aba Votação**: Projeção e votação em tempo real

## Motivação

### Problemas do Design Anterior

1. ❌ Confusão de propósitos na aba Candidatos
2. ❌ Risco de votos acidentais ao editar candidatos
3. ❌ Aba Votação subutilizada
4. ❌ Fluxo não intuitivo

### Benefícios do Novo Design

1. ✅ Separação clara de responsabilidades
2. ✅ Aba Candidatos focada em gerenciamento
3. ✅ Aba Votação focada em votação
4. ✅ Fluxo intuitivo: Preparar → Votar → Resultados
5. ✅ Evita votos acidentais

## Mudanças Implementadas

### 1. HTML - Aba Candidatos (`index.html`)

**ANTES**:

```html
<div class="section-actions">
  <button id="fullscreen-presbyteros" class="btn btn-primary">
    Projetar Presbíteros
  </button>
  <button id="fullscreen-diaconos" class="btn btn-primary">
    Projetar Diáconos
  </button>
  <button id="add-candidate" class="btn btn-success">Novo Candidato</button>
</div>
```

**DEPOIS**:

```html
<div class="section-actions">
  <button id="add-candidate" class="btn btn-success">Novo Candidato</button>
</div>
<p class="section-description">
  Gerencie os candidatos a Presbíteros e Diáconos. Adicione fotos e edite
  informações. A votação é realizada na aba <strong>Votação</strong>.
</p>
```

**Mudanças**:

- ❌ Removidos botões "Projetar Presbíteros" e "Projetar Diáconos"
- ✅ Adicionada descrição explicativa
- ✅ Direcionamento claro para aba Votação

### 2. HTML - Aba Votação (`index.html`)

**ANTES**:

```html
<div class="section-header">
  <h2>Sistema de Votação</h2>
  <button id="config-quorum" class="btn btn-secondary">
    Configurar Quórum
  </button>
</div>
```

**DEPOIS**:

```html
<div class="section-header">
  <h2>Sistema de Votação</h2>
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
</div>
<p class="section-description">
  Inicie a projeção em tela cheia para realizar a votação. Os votos são
  contabilizados em tempo real.
</p>
```

**Mudanças**:

- ✅ Adicionados botões "Projetar Presbíteros" e "Projetar Diáconos"
- ✅ Botões agrupados em `.section-actions`
- ✅ Adicionada descrição explicativa
- ✅ Foco claro: projeção e votação

### 3. TypeScript - Cards de Candidatos (`src/ui/manager.ts`)

**ANTES** (Foto Clicável):

```typescript
<div class="candidate-photo candidate-photo-clickable"
     data-id="${candidate.id}"
     title="Clique para adicionar voto">
  ${photoHtml}
</div>
```

**DEPOIS** (Foto Apenas Visual):

```typescript
<div class="candidate-photo">
  ${photoHtml}
</div>
```

**Mudanças**:

- ❌ Removida classe `.candidate-photo-clickable`
- ❌ Removido `data-id` da foto
- ❌ Removido tooltip "Clique para adicionar voto"
- ✅ Foto agora é apenas visual
- ✅ Tooltips dos botões melhorados: "Editar candidato", "Remover candidato"

### 4. TypeScript - Event Listeners (`src/ui/manager.ts`)

**ANTES**:

```typescript
private attachCandidateEventListeners(): void {
  // Clique na foto para adicionar voto
  document.querySelectorAll(".candidate-photo-clickable").forEach((photo) => {
    photo.addEventListener("click", async (e) => {
      const target = e.currentTarget as HTMLElement;
      const candidateId = target.dataset.id;
      if (candidateId) {
        await this.handleAddVoteNormal(candidateId);
      }
    });
  });

  // Botões de editar...
  // Botões de remover...
}
```

**DEPOIS**:

```typescript
private attachCandidateEventListeners(): void {
  // Botões de editar...
  // Botões de remover...
}
```

**Mudanças**:

- ❌ Removido event listener de clique na foto
- ❌ Removido método `handleAddVoteNormal()`
- ✅ Listeners apenas para editar e remover

### 5. CSS - Estilos de Foto (`assets/css/main.css`)

**ANTES**:

```css
.candidate-photo {
  /* ... estilos base ... */
}

.candidate-photo-clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.candidate-photo-clickable:hover {
  border-color: var(--primary);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.candidate-photo-clickable:active {
  transform: scale(0.95);
}
```

**DEPOIS**:

```css
.candidate-photo {
  /* ... estilos base apenas ... */
}
```

**Mudanças**:

- ❌ Removida classe `.candidate-photo-clickable` e seus estilos
- ❌ Removidos efeitos hover e active
- ✅ Foto estática, sem indicação de interatividade

### 6. CSS - Descrição de Seção (`assets/css/main.css`)

**ADICIONADO**:

```css
.section-description {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--gray-50);
  border-left: 4px solid var(--primary);
  border-radius: var(--radius-md);
}
```

**Características**:

- Fundo cinza claro
- Borda azul à esquerda (4px)
- Texto secundário
- Cantos arredondados
- Padding confortável

## Novo Fluxo de Uso

### 1. Preparação (Aba Candidatos)

```
1. Importar/Adicionar candidatos
2. Editar informações
3. Adicionar fotos
4. Revisar lista
```

### 2. Votação (Aba Votação)

```
1. Clicar em "Projetar Presbíteros" ou "Projetar Diáconos"
2. Sistema entra em fullscreen
3. Votar clicando nas fotos ou botões +/-
4. Fechar projeção quando terminar
```

### 3. Visualização (Aba Candidatos)

```
1. Voltar para aba Candidatos
2. Ver votos contabilizados
3. Votos são somente leitura
```

### 4. Resultados (Aba Resultados)

```
1. Ver candidatos eleitos
2. Gerar relatórios
3. Exportar ata
```

## Comparação de Responsabilidades

| Aba            | ANTES             | DEPOIS              |
| -------------- | ----------------- | ------------------- |
| **Candidatos** | Gerenciar + Votar | Apenas Gerenciar ✅ |
| **Votação**    | Apenas Quórum     | Projetar + Votar ✅ |
| **Resultados** | Ver Resultados    | Ver Resultados ✅   |

## Benefícios da Reorganização

### 1. Clareza de Propósito

- ✅ Cada aba tem função específica
- ✅ Usuário sabe exatamente onde ir
- ✅ Menos confusão na navegação

### 2. Segurança

- ✅ Impossível votar acidentalmente ao editar
- ✅ Votação sempre intencional (na aba específica)
- ✅ Votos visíveis mas não modificáveis na aba Candidatos

### 3. Fluxo Lógico

```
Preparar → Votar → Ver Resultados
   ↓         ↓         ↓
Candidatos | Votação | Resultados
```

### 4. Experiência do Usuário

- ✅ Descrições explicativas em cada aba
- ✅ Direcionamento claro entre abas
- ✅ Feedback visual consistente

## Testes de Validação

### Aba Candidatos

- ✅ Botão "Novo Candidato" funciona
- ✅ Botão "Editar" abre modal
- ✅ Botão "Remover" exclui candidato
- ✅ Foto NÃO é clicável
- ✅ Votos são exibidos (somente leitura)
- ✅ Descrição explicativa visível

### Aba Votação

- ✅ Botão "Projetar Presbíteros" abre fullscreen
- ✅ Botão "Projetar Diáconos" abre fullscreen
- ✅ Botão "Configurar Quórum" abre modal
- ✅ Descrição explicativa visível

### Fullscreen (via Aba Votação)

- ✅ Foto é clicável para votar
- ✅ Botão + adiciona voto
- ✅ Botão - remove voto
- ✅ Botão Resetar zera votos
- ✅ Contador funciona ilimitadamente

### Sincronização

- ✅ Votos na projeção atualizam aba Candidatos
- ✅ Votos persistem após fechar projeção
- ✅ Votos visíveis em ambas as abas

## Arquivos Modificados

### 1. `index.html`

**Seção**: Aba Candidatos (linhas ~172-181)

- Removidos botões de projeção
- Adicionada descrição

**Seção**: Aba Votação (linhas ~220-237)

- Adicionados botões de projeção
- Reorganizados botões em `.section-actions`
- Adicionada descrição

### 2. `src/ui/manager.ts`

**Método**: `renderCandidateCard()`

- Removida classe `.candidate-photo-clickable`
- Removidos atributos de clique

**Método**: `attachCandidateEventListeners()`

- Removido listener de clique na foto

**Método**: `handleAddVoteNormal()` - DELETADO

- Não é mais necessário

### 3. `assets/css/main.css`

**Classe**: `.candidate-photo-clickable` - DELETADA

- Efeitos de hover e active removidos

**Classe**: `.section-description` - NOVA

- Estilo para descrições explicativas

**Classe**: `.section-header`

- Margin-bottom ajustado: 2rem → 1rem

## Status Final

✅ **Aba Candidatos**: Focada em gerenciamento (adicionar, editar, visualizar)
✅ **Aba Votação**: Focada em votação (projetar, votar, contabilizar)
✅ **Fluxo Intuitivo**: Preparar → Votar → Ver Resultados
✅ **Segurança**: Votação intencional, não acidental
✅ **Clareza**: Descrições explicativas em cada aba
✅ **Sincronização**: Votos atualizados em todas as abas

A arquitetura agora está mais clara, segura e intuitiva! 🎯
