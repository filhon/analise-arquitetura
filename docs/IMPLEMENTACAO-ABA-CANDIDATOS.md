# Implementação da Aba Candidatos

## Problema Identificado

Os membros importados com a flag "Candidato" não estavam sendo exibidos na página **[Candidatos]**.

## Causa Raiz

O método `loadCandidatesData()` no arquivo `src/ui/manager.ts` estava vazio (apenas com comentário TODO e console.log), sem nenhuma lógica de renderização implementada.

```typescript
private async loadCandidatesData(): Promise<void> {
  // TODO: Implement candidates rendering
  console.log("Loading candidates data...");
}
```

## Solução Implementada

### 1. Implementação do método `loadCandidatesData()`

**Arquivo**: `src/ui/manager.ts`

O método agora:

- Busca todos os candidatos via `electionApp.getCandidates()`
- Filtra os candidatos por cargo (Presbíteros e Diáconos)
- Renderiza cards separados para cada categoria
- Exibe estado vazio quando não há candidatos
- Adiciona event listeners para botões de remoção

```typescript
private async loadCandidatesData(): Promise<void> {
  try {
    // Buscar todos os candidatos e separar por cargo
    const allCandidates = await electionApp.getCandidates();
    const presbyteros = allCandidates.filter(c => c.role === "Presbítero");
    const diaconos = allCandidates.filter(c => c.role === "Diácono");

    // Renderização de Presbíteros e Diáconos
    // ... (veja código completo)
  } catch (error) {
    console.error("Error loading candidates:", error);
    NotificationService.show("Erro ao carregar candidatos", "error");
  }
}
```

### 2. Implementação do método `handleRemoveCandidate()`

Novo método privado para remover candidatos:

```typescript
private async handleRemoveCandidate(candidateId: string, role: CandidateRole): Promise<void> {
  if (!confirm(`Tem certeza que deseja remover este candidato a ${role}?`)) {
    return;
  }

  const result = await electionApp.removeCandidate(candidateId);
  if (result.success) {
    NotificationService.show("Candidato removido com sucesso", "success");
    await this.loadCandidatesData();
  } else {
    NotificationService.show(result.error || "Erro ao remover candidato", "error");
  }
}
```

### 3. Estrutura HTML dos Cards

**Elementos no HTML** (`index.html`):

```html
<section id="candidates-tab" class="tab-content">
  <div class="candidates-grid">
    <div class="candidate-category">
      <h3>Presbíteros</h3>
      <div id="presbyteros-list" class="candidates-list">
        <!-- Cards renderizados dinamicamente -->
      </div>
    </div>
    <div class="candidate-category">
      <h3>Diáconos</h3>
      <div id="diaconos-list" class="candidates-list">
        <!-- Cards renderizados dinamicamente -->
      </div>
    </div>
  </div>
</section>
```

**Card renderizado**:

```html
<div class="candidate-card" data-id="${candidate.id}">
  <div class="candidate-info">
    <h4>${candidate.name}</h4>
    <p class="candidate-votes">Votos: ${candidate.votes}</p>
  </div>
  <div class="candidate-actions">
    <button
      class="btn-icon btn-icon-danger remove-candidate"
      data-id="${candidate.id}"
      data-role="${role}"
      title="Remover candidatura"
    >
      <span class="material-icons md-18">person_remove</span>
    </button>
  </div>
</div>
```

**Estado vazio**:

```html
<div class="empty-state">
  <span class="material-icons md-48">person_off</span>
  <p>Nenhum candidato a [Cargo] cadastrado</p>
</div>
```

### 4. Estilos CSS Adicionados

**Arquivo**: `assets/css/main.css`

```css
/* Candidatos - Grid e Cards */
.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-top: 1.5rem;
}

.candidate-category {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.candidate-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.candidate-card:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-secondary);
}

/* Design responsivo */
@media (max-width: 768px) {
  .candidates-grid {
    grid-template-columns: 1fr;
  }
  .candidate-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
```

### 5. Atualização de Imports

Adicionado o tipo `Candidate` aos imports:

```typescript
import type { Member, CandidateRole, MemberType, Candidate } from "@/types";
```

## Fluxo de Funcionamento

1. **Usuário navega para aba Candidatos**
   - Evento de clique na aba aciona `loadCandidatesData()`

2. **Busca de dados**
   - `electionApp.getCandidates()` retorna todos os candidatos do localStorage
   - Candidatos são filtrados por `role` (Presbítero/Diácono)

3. **Renderização**
   - Para cada categoria, gera HTML de cards ou estado vazio
   - Cards exibem nome e número de votos
   - Botão de remover com ícone `person_remove`

4. **Interação de remoção**
   - Clique no botão aciona `handleRemoveCandidate()`
   - Confirma ação com `confirm()`
   - Chama `electionApp.removeCandidate(candidateId)`
   - Recarrega a lista após sucesso

## Melhorias Implementadas

1. ✅ **Separação por cargo**: Presbíteros e Diáconos em categorias distintas
2. ✅ **Estado vazio**: Mensagem amigável quando não há candidatos
3. ✅ **Feedback visual**: Hover effects nos cards
4. ✅ **Responsividade**: Layout adaptável para mobile
5. ✅ **Ações contextuais**: Botão de remover com confirmação
6. ✅ **Notificações**: Feedback ao usuário sobre sucesso/erro
7. ✅ **Ícones Material**: Visual moderno e consistente

## Arquitetura do Sistema de Candidatos

### Interface Candidate

```typescript
export interface Candidate {
  readonly id: string;
  readonly name: string;
  readonly role: CandidateRole; // "Presbítero" | "Diácono"
  readonly photoUrl?: string;
  readonly votes: number;
  readonly isElected: boolean;
}
```

### Fluxo de Dados

```
localStorage (CANDIDATES)
    ↓
VotingManager.getCandidates()
    ↓
ElectionApp.getCandidates()
    ↓
UIManager.loadCandidatesData()
    ↓
Renderização no DOM (candidates-tab)
```

### Métodos Relacionados

- `electionApp.getCandidates()`: Retorna todos os candidatos
- `electionApp.removeCandidate(id)`: Remove candidato por ID
- `votingManager.getCandidates(role?)`: Busca com filtro opcional
- `votingManager.removeCandidate(id)`: Remoção física do storage

## Testes Recomendados

1. ✅ Importar CSV com candidatos (flag "Candidato")
2. ✅ Navegar para aba Candidatos
3. ✅ Verificar listagem de Presbíteros
4. ✅ Verificar listagem de Diáconos
5. ✅ Testar remoção de candidato
6. ✅ Verificar estado vazio quando não há candidatos
7. ✅ Testar responsividade em mobile

## Resultado Final

A aba **Candidatos** agora exibe corretamente todos os candidatos importados via CSV ou cadastrados manualmente, separados por cargo (Presbítero/Diácono), com interface profissional e funcionalidade completa de gerenciamento.

---

**Data**: 2024
**Versão**: 2.0.0
**Status**: ✅ Implementado e Testado
