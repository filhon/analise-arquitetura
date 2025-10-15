# Correção: Clique na Foto do Candidato

## Data: 11 de outubro de 2025

## Problema

Na aba Candidatos, nada acontecia ao clicar na foto (avatar) do candidato.

## Causa Raiz

1. A div `.candidate-photo` não tinha o atributo `data-id` para identificar o candidato
2. Não havia classe CSS indicando que a foto era clicável
3. Faltava o event listener para capturar o clique na foto
4. Não existia o método `handleAddVoteNormal` para gerenciar votos na aba normal (fora do fullscreen)

## Solução Implementada

### 1. Atualização do HTML Renderizado (`src/ui/manager.ts`)

**Método**: `renderCandidateCard()`

**Antes**:

```typescript
<div class="candidate-photo">
  ${photoHtml}
</div>
```

**Depois**:

```typescript
<div class="candidate-photo candidate-photo-clickable" data-id="${candidate.id}" title="Clique para adicionar voto">
  ${photoHtml}
</div>
```

**Mudanças**:

- ✅ Adicionada classe `candidate-photo-clickable` para estilização específica
- ✅ Adicionado `data-id="${candidate.id}"` para identificação
- ✅ Adicionado `title` para tooltip explicativo

### 2. Event Listener (`src/ui/manager.ts`)

**Método**: `attachCandidateEventListeners()`

**Adicionado no início do método**:

```typescript
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
```

### 3. Novo Método de Votação Normal (`src/ui/manager.ts`)

**Método criado**: `handleAddVoteNormal(candidateId: string)`

```typescript
private async handleAddVoteNormal(candidateId: string): Promise<void> {
  const allCandidates = await electionApp.getCandidates();
  const candidate = allCandidates.find((c) => c.id === candidateId);

  if (!candidate) return;

  // Atualizar votos localmente
  const updatedCandidates = allCandidates.map((c) =>
    c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
  );

  // Salvar no localStorage
  localStorage.setItem("CANDIDATES", JSON.stringify(updatedCandidates));

  // Atualizar display no card normal
  const candidateCard = document.querySelector(
    `.candidate-card[data-id="${candidateId}"] .candidate-votes`
  );
  if (candidateCard) {
    candidateCard.textContent = String(candidate.votes + 1);
  }

  // Mostrar feedback visual
  NotificationService.show("Voto adicionado com sucesso!", "success");
}
```

**Características**:

- Atualiza apenas o contador de votos no card específico
- Salva no localStorage
- Exibe notificação de sucesso
- Não recarrega toda a lista (performance otimizada)

### 4. Estilos CSS (`assets/css/main.css`)

**Adicionados estilos para foto clicável**:

```css
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

**Efeitos visuais**:

- `cursor: pointer` - Indica que é clicável
- `hover` - Borda azul, amplia 5%, adiciona sombra
- `active` - Reduz 5% ao clicar (feedback tátil)
- `transition` - Animações suaves

## Diferença: Aba Normal vs Fullscreen

### Aba Normal (Candidatos)

- **Método**: `handleAddVoteNormal()`
- **Comportamento**:
  - Atualiza apenas o contador do card específico
  - Exibe notificação de sucesso
  - Não recarrega a lista completa
- **Performance**: Mais rápido (update pontual)

### Modo Fullscreen (Projeção)

- **Método**: `handleAddVote()`
- **Comportamento**:
  - Atualiza o display fullscreen
  - Recarrega a aba de candidatos em background
  - Sem notificação (para não atrapalhar projeção)
- **Performance**: Recarrega lista para manter sincronização

## Fluxo de Uso

1. **Usuário** clica na foto do candidato na aba "Candidatos"
2. **Visual**: Foto amplia levemente (hover effect)
3. **Sistema**:
   - Identifica o candidato pelo `data-id`
   - Incrementa votos +1 no localStorage
   - Atualiza contador no card
4. **Feedback**: Notificação verde "Voto adicionado com sucesso!"
5. **Sincronização**: Se houver fullscreen aberto, ele será atualizado na próxima ação

## Testes Realizados

- ✅ Clique na foto incrementa voto
- ✅ Contador atualiza visualmente sem reload
- ✅ Notificação de sucesso aparece
- ✅ Hover effect funciona (ampliação, borda azul)
- ✅ Active effect funciona (redução ao clicar)
- ✅ Tooltip "Clique para adicionar voto" aparece
- ✅ localStorage salva corretamente
- ✅ Múltiplos cliques funcionam
- ✅ Funciona para Presbíteros e Diáconos

## Arquivos Modificados

1. `src/ui/manager.ts` - 3 alterações:
   - `renderCandidateCard()`: HTML com data-id e classe clicável
   - `attachCandidateEventListeners()`: Event listener para foto
   - `handleAddVoteNormal()`: Novo método de votação

2. `assets/css/main.css` - 1 alteração:
   - Estilos `.candidate-photo-clickable` com hover/active states

## Impacto

- ✅ Funcionalidade corrigida
- ✅ UX melhorada com feedback visual
- ✅ Performance otimizada (update pontual)
- ✅ Consistência com modo fullscreen
- ✅ Sem breaking changes

## Nota

A foto agora funciona como um botão de voto rápido, facilitando a contabilização tanto na aba normal quanto no modo fullscreen (projeção).
