# Análise Completa do Sistema de Eleição

## Data: 11 de outubro de 2025

## Problema Identificado

A foto do candidato não está sendo salva/atualizada corretamente no card após edição.

## Fluxo de Dados Atual

### 1. **localStorage - Dual Format**

O sistema mantém candidatos em DOIS formatos diferentes:

#### Formato OBJECT (usado pelo sistema):

```json
{
  "presbyteros": [
    {
      "id": "...",
      "name": "João Silva",
      "role": "Presbítero",
      "votes": 0,
      "isElected": false,
      "photoUrl": "data:image/jpeg;base64,..."
    }
  ],
  "diaconos": [...]
}
```

#### Formato ARRAY (tentativa de simplificação):

```json
[
  {
    "id": "...",
    "name": "João Silva",
    "role": "Presbítero",
    "votes": 0,
    "isElected": false,
    "photoUrl": "data:image/jpeg;base64,..."
  }
]
```

### 2. **Módulos que Salvam Candidatos**

#### `voting.ts` - `addCandidate()`

- **Sempre** salva no formato OBJECT
- Usa `candidatesStorage[roleKey].push(newCandidate)`
- Limpa cache após salvar
- Emite evento `CANDIDATE_ADDED`

#### `manager.ts` - `handleCandidateSubmit()` (edição)

- Detecta formato atual (ARRAY ou OBJECT)
- Tenta salvar no mesmo formato
- **PROBLEMA**: Cache pode não ser invalidado corretamente

#### `manager.ts` - `handleAddVote()`, `handleRemoveVote()`, `handleResetVotes()`

- Detectam formato atual
- Salvam no mesmo formato
- Recarregam dados após salvar

### 3. **Sistema de Cache**

#### `VotingManager.candidatesCache`

```typescript
private candidatesCache = new Map<string, Candidate[]>();
```

**Problemas identificados:**

1. Cache pode não ser limpo após edição
2. Múltiplas instâncias podem ter caches diferentes
3. Sem sincronização entre abas/janelas

### 4. **Fluxo de Edição de Foto**

```
1. User clica "Editar Candidato"
   → handleEditCandidate()
   → Abre modal com dados do candidato

2. User seleciona foto
   → handlePhotoUpload()
   → FileReader converte para base64
   → Armazena em form.dataset.photoUrl

3. User clica "Salvar"
   → handleCandidateSubmit()
   → getCandidates() (pode retornar do cache!) ❌
   → Atualiza array em memória
   → Salva no localStorage
   → clearCache()
   → loadCandidatesData()
   → getCandidates() (cria novo cache)
   → Renderiza cards
```

## Bugs Identificados

### 🐛 **Bug #1: Cache Stale após Edição**

**Localização**: `manager.ts:1564`

```typescript
const allCandidates = await electionApp.getCandidates();
```

**Problema**: Retorna dados do cache, não reflete photoUrl recém-salva.

### 🐛 **Bug #2: Inconsistência de Formato**

**Localização**: `voting.ts:102` vs `manager.ts:1596`

- `addCandidate()` sempre salva como OBJECT
- `handleCandidateSubmit()` tenta manter formato atual
- Resultado: Formato pode mudar durante a execução

### 🐛 **Bug #3: Sem Sincronização entre Abas**

**Problema**: Usar localStorage sem `storage` event listener

- Abrir em múltiplas abas = caches diferentes
- Atualização em uma aba não reflete em outras

### 🐛 **Bug #4: photoUrl pode ser undefined após map**

**Localização**: `manager.ts:1571-1575`

```typescript
photoUrl !== undefined ? photoUrl || undefined : c.photoUrl;
```

Se `photoUrl` for string vazia, vira `undefined`, mas pode não ser salvo corretamente no JSON.

## Soluções Propostas

### ✅ **Solução #1: Padronizar Formato OBJECT**

- Todos os saves usam formato OBJECT
- Remover lógica de dual-format
- Simplifica código e reduz bugs

### ✅ **Solução #2: Invalidação Agressiva de Cache**

- Limpar cache ANTES de getCandidates() em edição
- Adicionar método `forceReload()` que ignora cache

### ✅ **Solução #3: Storage Event Listener**

- Escutar mudanças em localStorage
- Invalidar cache quando outra aba faz alterações
- Recarregar dados automaticamente

### ✅ **Solução #4: Logging Detalhado**

- Manter logs de debug durante desenvolvimento
- Remover em produção

### ✅ **Solução #5: Método Dedicado para Update**

- Criar `updateCandidate()` em VotingManager
- Encapsular lógica de atualização
- Garantir consistência

## Implementação

### Prioridade ALTA

1. Padronizar formato OBJECT em todos os módulos
2. Implementar `forceReload()` e invalidação de cache
3. Adicionar storage event listener

### Prioridade MÉDIA

4. Criar `updateCandidate()` em VotingManager
5. Refatorar handleCandidateSubmit() para usar novo método

### Prioridade BAIXA

6. Remover logs de debug desnecessários
7. Adicionar testes unitários

## Próximos Passos

1. Implementar correções uma a uma
2. Testar em múltiplas abas simultaneamente
3. Validar sincronização
4. Performance testing com 1000+ membros
