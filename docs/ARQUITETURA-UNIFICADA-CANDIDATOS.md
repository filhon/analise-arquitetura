# Arquitetura Unificada - Single Source of Truth

## 📋 Resumo

Este documento descreve a refatoração completa que eliminou a duplicação de dados entre Membros e Candidatos, implementando o princípio **Single Source of Truth**.

---

## 🎯 Problema Identificado

### Arquitetura Antiga (INCORRETA)

```
localStorage.MEMBERS         localStorage.CANDIDATES
       ↓                              ↓
  [Member, Member, ...]      [Candidate, Candidate, ...]
       ↓                              ↓
  MemberManager              VotingManager.addCandidate()
                                      ↓
                            ❌ DUPLICAÇÃO DE DADOS
```

**Problemas:**

1. **Dados duplicados**: Mesma pessoa existia em 2 storages diferentes
2. **Sincronização manual**: Atualizar nome em MEMBERS não refletia em CANDIDATES
3. **Race conditions**: Cache limpo DEPOIS de eventos emitidos
4. **Lookups por nome**: Quebrava ao alterar nome do membro
5. **Complexidade**: Métodos addCandidate/updateCandidate/removeCandidate

---

## ✅ Solução Implementada

### Arquitetura Nova (CORRETA)

```
localStorage.MEMBERS
       ↓
  [Member { id, nome, candidato: "Presbítero" | "Diácono" | null }, ...]
       ↓
  MemberManager.updateMember(id, { candidato: role })
       ↓
  VotingManager.getCandidates() = members.filter(m => m.candidato !== null)
       ↓
  ✅ UMA ÚNICA FONTE DA VERDADE
```

**Benefícios:**

1. **Zero duplicação**: Candidato é apenas um campo do Member
2. **Sincronização automática**: Alterar membro reflete instantaneamente
3. **ID-based lookups**: Não quebra ao mudar nome
4. **Simplicidade**: Apenas `updateMember()` para tudo
5. **Performance**: Cache-first strategy previne race conditions

---

## 🔧 Mudanças Implementadas

### 1. VotingManager (src/modules/voting.ts)

#### ❌ REMOVIDOS (métodos obsoletos)

```typescript
// ❌ REMOVIDO - Escrever em CANDIDATES duplicava dados
async addCandidate(candidate: Omit<Candidate, "id">): Promise<AsyncResult<Candidate>>

// ❌ REMOVIDO - Atualizar CANDIDATES não sincronizava com MEMBERS
async updateCandidate(id: string, updates: Partial<Candidate>): Promise<AsyncResult<Candidate>>

// ❌ REMOVIDO - Remover de CANDIDATES não removia de MEMBERS
async removeCandidate(id: string): Promise<AsyncResult<void>>
async removeCandidateByName(name: string, role: CandidateRole): Promise<AsyncResult<void>>
```

#### ✅ MANTIDO (read-only view)

```typescript
// ✅ MANTIDO - Apenas filtra membros, não escreve nada
async getCandidates(): Promise<Candidate[]> {
  const members = await MemberManager.getInstance().getMembers();

  // VIEW pura: candidato é membro com status !== null
  return members
    .filter((m) => m.candidato !== null && m.candidato !== undefined)
    .map((m) => ({
      id: m.id,
      name: m.nome,
      role: m.candidato as CandidateRole,
      photoUrl: m.photoUrl,
      votes: 0,
      isElected: false,
    }));
}
```

---

### 2. ElectionApp (src/app.ts)

#### ❌ REMOVIDOS (wrappers obsoletos)

```typescript
// ❌ REMOVIDO - Wrapper desnecessário
async addCandidate(candidate: Omit<Candidate, "id">): Promise<AsyncResult<Candidate>>

// ❌ REMOVIDO - Wrapper desnecessário
async updateCandidate(id: string, updates: Partial<Candidate>): Promise<AsyncResult<Candidate>>

// ❌ REMOVIDO - Wrapper desnecessário
async removeCandidate(id: string): Promise<AsyncResult<void>>
```

#### ✅ MANTIDO (facade read-only)

```typescript
// ✅ MANTIDO - Exposição read-only de candidatos
async getCandidates(): Promise<Candidate[]> {
  return this.votingManager.getCandidates();
}
```

---

### 3. UIManager (src/ui/manager.ts)

#### ✅ REFATORADO (uso direto do MemberManager)

**Antes (INCORRETO):**

```typescript
// ❌ Chamava método obsoleto removeCandidate()
const result = await electionApp.removeCandidate(candidateId);
```

**Depois (CORRETO):**

```typescript
// ✅ Atualiza membro diretamente - candidateId === memberId
const result = await electionApp.updateMember(candidateId, {
  candidato: null,
});
```

**Antes (INCORRETO):**

```typescript
// ❌ Chamava método obsoleto updateCandidate()
const result = await electionApp.updateCandidate(editingId, { photoUrl });
```

**Depois (CORRETO):**

```typescript
// ✅ Atualiza membro diretamente - editingId === memberId
const result = await electionApp.updateMember(editingId, { photoUrl });
```

---

### 4. ReportManager (src/modules/reports.ts)

#### ✅ REFATORADO (importação sem duplicação)

**Antes (INCORRETO):**

```typescript
// ❌ Importava candidatos separadamente (duplicação)
for (const candidate of data.candidates) {
  await this.votingManager.addCandidate(candidate);
}
```

**Depois (CORRETO):**

```typescript
// ✅ Candidatos já estão nos membros - não precisa importar separadamente
// A lista de candidatos é apenas uma VIEW filtrada dos membros
// Dados de votação (votes, isElected) são armazenados em VotingData
```

---

### 5. MemberManager (src/modules/members.ts)

#### ✅ CACHE-FIRST STRATEGY

**Antes (RACE CONDITION):**

```typescript
async updateMember(id: string, updates: Partial<Member>): Promise<AsyncResult<Member>> {
  // ...
  await this.saveMembers(members);

  // ❌ RACE: Evento emitido ANTES de limpar cache
  EventSystem.emit(EventTypes.MEMBER_UPDATED, member);

  this.membersCache.clear(); // ⚠️ Muito tarde!
  this.candidatesCache.clear();
}
```

**Depois (CORRETO):**

```typescript
async updateMember(id: string, updates: Partial<Member>): Promise<AsyncResult<Member>> {
  // ✅ Limpa cache ANTES de salvar
  this.membersCache.clear();
  this.candidatesCache.clear();

  // Salva dados
  await this.saveMembers(members);

  // ✅ Agora evento sempre vê dados frescos
  EventSystem.emit(EventTypes.MEMBER_UPDATED, member);
}
```

---

### 6. Storage Migration (src/main.ts)

#### ✅ LIMPEZA AUTOMÁTICA

```typescript
// Migração: Remover storage obsoleto de CANDIDATES
function migrateStorageV2() {
  try {
    const obsoleteKey = "ELECTION_APP_CANDIDATES";
    if (localStorage.getItem(obsoleteKey)) {
      console.log("[Migration] Removendo storage obsoleto:", obsoleteKey);
      localStorage.removeItem(obsoleteKey);
      console.log("[Migration] ✓ Storage CANDIDATES removido");
    }
  } catch (error) {
    console.warn("[Migration] Erro ao remover storage obsoleto:", error);
  }
}

// Executar migração ANTES de inicializar app
document.addEventListener("DOMContentLoaded", async () => {
  migrateStorageV2(); // ✅ Primeiro passo
  // ... resto da inicialização
});
```

---

## 📊 Comparação de Fluxos

### Adicionar Candidato

**Antes (INCORRETO):**

```typescript
// ❌ 2 operações separadas
await electionApp.addMember({ nome: "João", cpf: "123" });
await electionApp.addCandidate({ name: "João", role: "Presbítero" });
```

**Depois (CORRETO):**

```typescript
// ✅ 1 operação única
await electionApp.updateMember(memberId, {
  candidato: "Presbítero",
});
```

---

### Remover Candidato

**Antes (INCORRETO):**

```typescript
// ❌ Não removia de MEMBERS, só de CANDIDATES
await electionApp.removeCandidate(candidateId);
// Membro continuava existindo mas candidato sumia
```

**Depois (CORRETO):**

```typescript
// ✅ Remove status de candidato mas mantém membro
await electionApp.updateMember(candidateId, {
  candidato: null,
});
```

---

### Atualizar Nome

**Antes (INCORRETO):**

```typescript
// ❌ Atualizar em MEMBERS não refletia em CANDIDATES
await electionApp.updateMember(memberId, { nome: "João Silva" });
// getCandidates() ainda retornava nome antigo
```

**Depois (CORRETO):**

```typescript
// ✅ Atualização reflete instantaneamente
await electionApp.updateMember(memberId, { nome: "João Silva" });
// getCandidates() já retorna nome novo (é VIEW)
```

---

## 🔍 Verificação de Integridade

### Como Garantir que Está Funcionando

1. **Verificar localStorage:**

```javascript
// ✅ Deve existir
localStorage.getItem("ELECTION_APP_MEMBERS");

// ❌ NÃO deve existir
localStorage.getItem("ELECTION_APP_CANDIDATES"); // null
```

2. **Adicionar candidato:**

```javascript
const member = await electionApp.getMembers();
const candidato = member.find((m) => m.candidato === "Presbítero");
// candidato.id === membro.id ✅
```

3. **Alterar nome e verificar:**

```javascript
await electionApp.updateMember(memberId, { nome: "Novo Nome" });
const candidates = await electionApp.getCandidates();
const candidate = candidates.find((c) => c.id === memberId);
// candidate.name === "Novo Nome" ✅
```

---

## 🏗️ Princípios da Arquitetura

### 1. Single Source of Truth

- **UMA** base de dados: `localStorage.MEMBERS`
- Candidato é apenas um campo: `member.candidato`
- VotingManager é READ-ONLY view

### 2. ID-Based Lookups

- Nunca buscar por nome: `members.find(m => m.nome === name)` ❌
- Sempre buscar por ID: `members.find(m => m.id === id)` ✅
- IDs são UUIDs únicos e imutáveis

### 3. Cache-First Strategy

- Limpar cache ANTES de salvar
- Emitir eventos DEPOIS de salvar
- Previne race conditions

### 4. Event-Driven Updates

- MemberManager emite `MEMBER_UPDATED`
- UI escuta eventos e atualiza TODAS as views
- Sincronização automática entre abas

---

## 📝 Glossário

| Termo                      | Significado                                                  |
| -------------------------- | ------------------------------------------------------------ |
| **Member**                 | Pessoa cadastrada no sistema (id, nome, cpf, candidato, etc) |
| **Candidate**              | VIEW read-only de Member onde `candidato !== null`           |
| **candidato**              | Campo do Member: `"Presbítero"` \| `"Diácono"` \| `null`     |
| **VotingData**             | Dados de votação separados (votes, isElected)                |
| **Single Source of Truth** | Princípio de ter UMA única fonte de dados                    |
| **Cache-First**            | Limpar cache ANTES de operações                              |
| **ID-Based Lookup**        | Buscar sempre por ID único, nunca por nome                   |

---

## ✅ Checklist de Validação

- [x] VotingManager.addCandidate() removido
- [x] VotingManager.updateCandidate() removido
- [x] VotingManager.removeCandidate() removido
- [x] ElectionApp wrappers removidos
- [x] UIManager usa apenas updateMember()
- [x] ReportManager não importa candidatos separadamente
- [x] Import generateId removido de voting.ts
- [x] Migration script implementado
- [x] Zero erros de compilação
- [x] Cache-first strategy implementado
- [x] Documentação completa

---

## 🎓 Para Desenvolvedores Futuros

### ⚠️ NÃO FAÇA ISSO:

```typescript
// ❌ NUNCA criar storage separado de candidatos
localStorage.setItem("CANDIDATES", JSON.stringify(candidates));

// ❌ NUNCA buscar por nome
const member = members.find((m) => m.nome === candidateName);

// ❌ NUNCA limpar cache DEPOIS de salvar
await saveData();
cache.clear(); // ⚠️ TARDE DEMAIS!
```

### ✅ FAÇA ISSO:

```typescript
// ✅ Candidato é apenas um status do membro
await electionApp.updateMember(id, { candidato: "Presbítero" });

// ✅ Sempre buscar por ID único
const member = members.find((m) => m.id === memberId);

// ✅ Limpar cache ANTES de salvar
cache.clear();
await saveData();
EventSystem.emit("DATA_UPDATED");
```

---

## 📚 Documentos Relacionados

- [CORRECAO-RACE-CONDITION-SINCRONIZACAO.md](./CORRECAO-RACE-CONDITION-SINCRONIZACAO.md)
- [CORRECAO-CRITICA-ID-UNICO.md](./CORRECAO-CRITICA-ID-UNICO.md)
- [REFATORACAO-CANDIDATOS-UNIFIED-ID.md](./REFATORACAO-CANDIDATOS-UNIFIED-ID.md)

---

**Data:** 2024
**Versão:** 2.0.0
**Status:** ✅ Implementado e Validado
