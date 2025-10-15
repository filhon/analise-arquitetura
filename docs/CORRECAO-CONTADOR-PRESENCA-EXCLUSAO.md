# Correção: Contador de Presentes Após Exclusão de Membro

## Data

11 de outubro de 2025

## Problema Identificado

Ao excluir um membro e marcar a presença dos membros restantes, o contador de "Presentes" mostrava um número incorreto:

**Exemplo:**

1. Sistema com 3 membros
2. Excluir 1 membro (ficam 2 membros)
3. Marcar presença dos 2 membros restantes
4. ❌ Contador mostra: **3 presentes** (incorreto)
5. ✅ Deveria mostrar: **2 presentes**

## Causa Raiz

Quando um membro era excluído, o sistema:

- ✅ Removia o membro da lista de membros
- ✅ Removia o candidato (se aplicável) do sistema de votação
- ❌ **NÃO removia** o registro de presença do `AttendanceManager`

Resultado: O registro de presença do membro excluído permanecia no localStorage, sendo contabilizado nas estatísticas.

### Fluxo do Bug

```
1. Membro João excluído
   ↓
2. MemberManager remove João da lista
   ↓
3. VotingManager remove João dos candidatos
   ↓
4. ❌ AttendanceManager ainda tem registro de João
   ↓
5. Contador de presentes inclui João
   ↓
6. Contagem incorreta
```

## Solução Implementada

### 1. Novo Método em `AttendanceManager`

Adicionado método `removeMemberAttendance()` para remover o registro de presença de um membro específico:

```typescript
async removeMemberAttendance(memberId: string): Promise<AsyncResult<void>> {
  try {
    const records = await this.getAttendanceRecords();
    const updatedRecords = records.filter((r) => r.memberId !== memberId);

    if (records.length === updatedRecords.length) {
      // Nenhum registro foi removido (membro não tinha registro de presença)
      return {
        success: true,
      };
    }

    await this.saveAttendanceRecords(updatedRecords);

    return {
      success: true,
    };
  } catch (error) {
    ErrorHandler.log(
      error as Error,
      "AttendanceManager.removeMemberAttendance"
    );
    return {
      success: false,
      error: "Erro interno ao remover presença do membro",
    };
  }
}
```

**Características:**

- ✅ Filtra e remove apenas o registro do membro específico
- ✅ Não falha se o membro não tiver registro de presença
- ✅ Atualiza o localStorage e cache
- ✅ Retorna sucesso/erro de forma consistente

### 2. Integração no `MemberManager.deleteMember()`

Modificado o método `deleteMember()` para chamar a remoção de presença:

```typescript
async deleteMember(id: string): Promise<AsyncResult<void>> {
  try {
    const members = await this.getMembers();
    const memberToDelete = members.find((m) => m.id === id);
    const updatedMembers = members.filter((m) => m.id !== id);

    // ... validações ...

    await this.saveMembers(updatedMembers);

    // Se o membro era candidato, remover do sistema de votação
    if (memberToDelete?.candidato) {
      try {
        const { VotingManager } = await import("./voting");
        const votingManager = VotingManager.getInstance();
        await votingManager.removeCandidate(id);
      } catch (votingError) {
        ErrorHandler.log(
          votingError as Error,
          "MemberManager.deleteMember - remover candidato"
        );
      }
    }

    // ✅ NOVO: Remover registro de presença do membro
    try {
      const { AttendanceManager } = await import("./attendance");
      const attendanceManager = AttendanceManager.getInstance();
      await attendanceManager.removeMemberAttendance(id);
    } catch (attendanceError) {
      ErrorHandler.log(
        attendanceError as Error,
        "MemberManager.deleteMember - remover presença"
      );
      // Não falha a operação se falhar a remoção da presença
    }

    this.eventSystem.emit(EventTypes.MEMBER_DELETED, id);

    return {
      success: true,
    };
  } catch (error) {
    // ... tratamento de erro ...
  }
}
```

## Fluxo Corrigido

```
1. Membro João excluído
   ↓
2. MemberManager remove João da lista
   ↓
3. VotingManager remove João dos candidatos (se candidato)
   ↓
4. ✅ AttendanceManager remove registro de presença de João
   ↓
5. EventSystem emite MEMBER_DELETED
   ↓
6. ✅ Contador de presentes correto
```

## Limpeza em Cascata

Quando um membro é excluído, agora o sistema limpa automaticamente:

| Sistema               | Ação                        | Status           |
| --------------------- | --------------------------- | ---------------- |
| **MemberManager**     | Remove membro da lista      | ✅ Sempre        |
| **VotingManager**     | Remove candidato e votos    | ✅ Se candidato  |
| **AttendanceManager** | Remove registro de presença | ✅ Sempre (NOVO) |
| **EventSystem**       | Emite MEMBER_DELETED        | ✅ Sempre        |

## Benefícios da Implementação

### 1. Integridade de Dados

- ✅ Estatísticas sempre corretas
- ✅ Sem registros órfãos
- ✅ Dados consistentes entre módulos

### 2. Robustez

- ✅ Não falha se membro não tiver presença registrada
- ✅ Erros não interrompem operação principal
- ✅ Logging detalhado para debugging

### 3. Performance

- ✅ Remove apenas o registro específico
- ✅ Não precisa reprocessar toda a lista
- ✅ Cache atualizado automaticamente

## Testes Realizados

### Cenário 1: Excluir membro sem presença marcada

- Sistema com 3 membros
- Excluir João (sem presença marcada)
- ✅ Contador correto: 0 presentes
- ✅ Marcar presença dos 2 restantes: 2 presentes

### Cenário 2: Excluir membro com presença marcada

- Sistema com 3 membros
- Marcar presença de todos: 3 presentes
- Excluir João (com presença marcada)
- ✅ Contador atualiza: 2 presentes
- ✅ Dados consistentes

### Cenário 3: Excluir múltiplos membros

- Sistema com 5 membros
- Marcar presença de 4 membros
- Excluir 2 membros (1 com presença, 1 sem)
- ✅ Contador correto após cada exclusão

### Cenário 4: Excluir candidato com presença

- Sistema com 3 membros
- João é candidato a Presbítero
- João tem presença marcada
- Excluir João
- ✅ Removido de membros
- ✅ Removido de candidatos
- ✅ Removido de presença
- ✅ Contador correto

## Arquivos Modificados

- ✅ `src/modules/attendance.ts` - Adicionado método `removeMemberAttendance()`
- ✅ `src/modules/members.ts` - Integrado remoção de presença em `deleteMember()`

## Impacto no Sistema

### Antes da Correção

```typescript
// Exclusão de membro
deleteMember(id) {
  // 1. Remove da lista de membros
  // 2. Remove de candidatos (se aplicável)
  // ❌ Presença NÃO removida
}

// Resultado: Dados inconsistentes
```

### Depois da Correção

```typescript
// Exclusão de membro
deleteMember(id) {
  // 1. Remove da lista de membros
  // 2. Remove de candidatos (se aplicável)
  // 3. ✅ Remove registro de presença
}

// Resultado: Dados consistentes
```

## Padrão de Design Aplicado

### Limpeza em Cascata (Cascade Delete)

Quando uma entidade principal é removida, todas as entidades relacionadas também são removidas:

```
Membro (Principal)
  ├── Candidato (Relacionado) ✅
  ├── Presença (Relacionado) ✅
  └── Votos (Relacionado) ✅
```

Este padrão garante:

- Integridade referencial
- Sem dados órfãos
- Estatísticas sempre corretas

## Próximas Melhorias Sugeridas

### 1. Método Genérico de Limpeza

Criar método centralizado para limpeza de dados relacionados:

```typescript
async cascadeDelete(memberId: string): Promise<void> {
  await this.votingManager.removeMemberVotes(memberId);
  await this.attendanceManager.removeMemberAttendance(memberId);
  await this.votingManager.removeCandidate(memberId);
}
```

### 2. Confirmação Visual

Mostrar ao usuário o que será removido:

```
Excluir membro "João Silva"?

Isso também removerá:
✓ Candidatura a Presbítero
✓ Registro de presença
✓ Votos recebidos (se houver)

[Cancelar] [Confirmar]
```

### 3. Log de Auditoria

Registrar exclusões para rastreabilidade:

```typescript
{
  action: "MEMBER_DELETED",
  memberId: "abc123",
  memberName: "João Silva",
  cascadeActions: [
    "candidate_removed",
    "attendance_removed",
    "votes_cleared"
  ],
  timestamp: "2025-10-11T10:30:00Z"
}
```

## Lições Aprendidas

### 1. Integridade de Dados

Sempre considerar dados relacionados ao deletar uma entidade principal.

### 2. Falhas Silenciosas

Erros em operações secundárias não devem falhar a operação principal, mas devem ser logados.

### 3. Testes de Integração

Testar não apenas a funcionalidade isolada, mas o impacto em todo o sistema.

---

**Status**: ✅ **Corrigido e Testado**

O contador de presentes agora funciona corretamente após a exclusão de membros, mantendo a integridade dos dados em todo o sistema.
