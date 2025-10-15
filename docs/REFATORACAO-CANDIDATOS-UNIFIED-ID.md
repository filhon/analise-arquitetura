# Refatoração: Candidatos com ID Unificado

## Data: 11 de outubro de 2025

## 🎯 Objetivo

**Eliminar duplicação de dados** e usar o **ID do membro** como identificador único em todo o sistema.

## ❌ Problema Atual

### Arquitetura Atual (ERRADA)

```
Member (localStorage: "MEMBERS")
├─ id: "member-123"
├─ nome: "João Silva"
├─ cpf: "111.444.777-35"
├─ candidato: "Presbítero"  ← Status de candidato
└─ ...

Candidate (localStorage: "CANDIDATES")  ❌ DUPLICADO
├─ id: "candidate-456"  ← ID DIFERENTE!
├─ name: "João Silva"   ← DADO DUPLICADO!
├─ role: "Presbítero"   ← DADO DUPLICADO!
├─ photoUrl: "data:..."
├─ votes: 0
└─ isElected: false
```

### Problemas Identificados

1. **IDs Diferentes**: Member tem um ID, Candidate tem outro
2. **Dados Duplicados**: Nome aparece em ambos
3. **Sincronização**: Mudar nome do membro não atualiza candidato
4. **Complexidade**: Precisa buscar em dois lugares
5. **Inconsistência**: photoUrl só no Candidate, mas é do Member
6. **Manutenção**: Duas fontes de verdade para o mesmo dado

## ✅ Solução Proposta

### Nova Arquitetura (CORRETA)

```
Member (localStorage: "MEMBERS") - ÚNICA FONTE DE VERDADE
├─ id: "member-123"  ← ID ÚNICO
├─ nome: "João Silva"
├─ cpf: "111.444.777-35"
├─ candidato: "Presbítero"  ← Status: null | "Presbítero" | "Diácono"
├─ photoUrl: "data:..."     ← Foto do membro (usado se for candidato)
├─ votes: 0                  ← Votos (usado se for candidato)
├─ isElected: false          ← Eleito (usado se for candidato)
└─ ...

CandidateData (RUNTIME ONLY - NÃO SALVO)
└─ Derivado de Member.filter(m => m.candidato !== null)
```

### Tipo Member Atualizado

```typescript
export interface Member {
  readonly id: string; // ID único do membro
  readonly nome: string;
  readonly tipo?: MemberType;
  readonly cpf?: string;
  readonly rg?: string;
  readonly candidato?: CandidateRole | null; // null, "Presbítero", "Diácono"
  readonly email?: string;
  readonly telefone?: string;

  // Campos de candidato (só usados se candidato !== null)
  readonly photoUrl?: string; // Foto do candidato
  readonly votes?: number; // Votos recebidos
  readonly isElected?: boolean; // Foi eleito?
}
```

### Tipo Candidate REMOVIDO ❌

```typescript
// ANTES (ERRADO)
export interface Candidate {
  readonly id: string; // ❌ ID duplicado
  readonly name: string; // ❌ Nome duplicado
  readonly role: CandidateRole; // ❌ Role duplicado
  readonly photoUrl?: string;
  readonly votes: number;
  readonly isElected: boolean;
}

// DEPOIS (CORRETO)
// Candidate não existe mais como tipo separado!
// Use: Member & { candidato: CandidateRole }
export type CandidateMember = Member & {
  candidato: CandidateRole; // Não-null
};
```

## 🔄 Mudanças Necessárias

### 1. **Atualizar `types/index.ts`**

```typescript
export interface Member {
  readonly id: string;
  readonly nome: string;
  readonly tipo?: MemberType;
  readonly cpf?: string;
  readonly rg?: string;
  readonly candidato?: CandidateRole | null;
  readonly email?: string;
  readonly telefone?: string;

  // Campos de candidato (só usados se candidato !== null)
  readonly photoUrl?: string;
  readonly votes?: number;
  readonly isElected?: boolean;
}

// Type helper para candidatos
export type CandidateMember = Member & {
  candidato: CandidateRole;
};

// Remover interface Candidate ❌
```

### 2. **Atualizar `StorageKeys`**

```typescript
export enum StorageKeys {
  MEMBERS = "MEMBERS", // Única fonte de verdade
  // CANDIDATES = "CANDIDATES",  ❌ REMOVER
  VOTES = "VOTES", // Manter para auditoria (opcional)
  ATTENDANCE = "ATTENDANCE",
  QUORUM = "QUORUM",
  CONFIG = "CONFIG",
}
```

### 3. **Refatorar `VotingManager`**

```typescript
class VotingManager {
  private memberManager: MemberManager; // Injetar dependência

  // Buscar candidatos = filtrar membros
  async getCandidates(role?: CandidateRole): Promise<CandidateMember[]> {
    const members = await this.memberManager.getMembers();

    let candidates = members.filter(
      (m): m is CandidateMember =>
        m.candidato !== null && m.candidato !== undefined
    );

    if (role) {
      candidates = candidates.filter((c) => c.candidato === role);
    }

    return candidates;
  }

  // Adicionar candidato = atualizar membro
  async addCandidate(
    memberId: string,
    role: CandidateRole
  ): Promise<AsyncResult<Member>> {
    return await this.memberManager.updateMember(memberId, {
      candidato: role,
      votes: 0,
      isElected: false,
    });
  }

  // Remover candidato = limpar status no membro
  async removeCandidate(memberId: string): Promise<AsyncResult<Member>> {
    return await this.memberManager.updateMember(memberId, {
      candidato: null,
      votes: 0,
      isElected: false,
      photoUrl: undefined, // Opcional: manter ou remover foto
    });
  }

  // Adicionar voto = atualizar votes no membro
  async addVote(memberId: string): Promise<AsyncResult<Member>> {
    const member = await this.memberManager.getMember(memberId);
    if (!member || !member.candidato) {
      return { success: false, error: "Membro não é candidato" };
    }

    return await this.memberManager.updateMember(memberId, {
      votes: (member.votes || 0) + 1,
    });
  }

  // Atualizar foto = atualizar photoUrl no membro
  async updateCandidatePhoto(
    memberId: string,
    photoUrl: string
  ): Promise<AsyncResult<Member>> {
    const member = await this.memberManager.getMember(memberId);
    if (!member || !member.candidato) {
      return { success: false, error: "Membro não é candidato" };
    }

    return await this.memberManager.updateMember(memberId, {
      photoUrl,
    });
  }
}
```

### 4. **Refatorar `MemberManager`**

```typescript
class MemberManager {
  async updateMember(
    memberId: string,
    updates: Partial<Member>
  ): Promise<AsyncResult<Member>> {
    const members = await this.getMembers();
    const index = members.findIndex((m) => m.id === memberId);

    if (index === -1) {
      return { success: false, error: "Membro não encontrado" };
    }

    const updatedMember = { ...members[index], ...updates };
    members[index] = updatedMember;

    localStorage.setItem("MEMBERS", JSON.stringify(members));

    // Limpar cache
    this.membersCache.clear();

    // Emitir evento
    this.eventSystem.emit(EventTypes.MEMBER_UPDATED, updatedMember);

    return { success: true, data: updatedMember };
  }
}
```

### 5. **Atualizar UI (`manager.ts`)**

```typescript
// ANTES (buscava de dois lugares)
const member = await electionApp.getMember(memberId);
const candidate = await electionApp.getCandidate(candidateId);

// DEPOIS (busca apenas membro)
const member = await electionApp.getMember(memberId);
if (member.candidato) {
  // É candidato, usar member.votes, member.photoUrl, etc.
}
```

### 6. **Importação CSV**

```typescript
// Ao importar, se coluna "candidato" tem valor:
const memberData = {
  id: generateId(),
  nome: row.nome,
  cpf: row.cpf,
  candidato: row.candidato || null, // "Presbítero", "Diácono" ou null
  votes: row.candidato ? 0 : undefined,
  isElected: row.candidato ? false : undefined,
};
```

## 📊 Comparação de Storage

### ANTES (Duplicado)

```json
// MEMBERS
[
  {
    "id": "member-123",
    "nome": "João Silva",
    "candidato": "Presbítero"
  }
]

// CANDIDATES (DUPLICADO ❌)
{
  "presbyteros": [
    {
      "id": "candidate-456",
      "name": "João Silva",
      "role": "Presbítero",
      "votes": 5,
      "photoUrl": "data:..."
    }
  ]
}
```

### DEPOIS (Unificado)

```json
// MEMBERS (ÚNICA FONTE DE VERDADE ✅)
[
  {
    "id": "member-123",
    "nome": "João Silva",
    "cpf": "111.444.777-35",
    "tipo": "Membro Comungante",
    "candidato": "Presbítero",
    "votes": 5,
    "photoUrl": "data:...",
    "isElected": false
  }
]

// CANDIDATES ❌ NÃO EXISTE MAIS
```

## 🎯 Benefícios

### 1. **Eliminação de Duplicação**

- ✅ Um único ID por pessoa
- ✅ Nome, CPF, email em um só lugar
- ✅ Mudanças refletem imediatamente

### 2. **Sincronização Automática**

- ✅ Atualizar nome do membro atualiza automaticamente "candidato"
- ✅ Sem necessidade de sincronizar dois objetos
- ✅ Única fonte de verdade

### 3. **Simplicidade**

- ✅ Menos código (remove VotingManager complexity)
- ✅ Menos bugs (sem dessincronização)
- ✅ Mais fácil de entender

### 4. **Performance**

- ✅ Menos dados no localStorage
- ✅ Menos operações de leitura/escrita
- ✅ Cache mais eficiente

### 5. **Consistência**

- ✅ Impossível ter candidato sem membro
- ✅ Impossível ter IDs diferentes para mesma pessoa
- ✅ Validações mais simples

## 🔧 Plano de Migração

### Fase 1: Preparação (1h)

1. ✅ Criar documento de refatoração
2. ⏳ Atualizar types/index.ts
3. ⏳ Criar funções helper (getCandidates, isCandidato)

### Fase 2: Backend (2h)

1. ⏳ Refatorar MemberManager.updateMember()
2. ⏳ Simplificar VotingManager (delegar para MemberManager)
3. ⏳ Remover código de CANDIDATES storage

### Fase 3: Frontend (2h)

1. ⏳ Atualizar manager.ts para usar memberId
2. ⏳ Refatorar handleCandidateSubmit()
3. ⏳ Atualizar renderCandidateCard()

### Fase 4: Migração de Dados (30min)

1. ⏳ Criar script de migração
2. ⏳ Converter CANDIDATES → MEMBERS (unificar)
3. ⏳ Remover CANDIDATES do localStorage

### Fase 5: Testes (1h)

1. ⏳ Testar importação CSV
2. ⏳ Testar edição de candidato
3. ⏳ Testar votação
4. ⏳ Testar sincronização entre abas

### Fase 6: Limpeza (30min)

1. ⏳ Remover código morto
2. ⏳ Atualizar documentação
3. ⏳ Commit final

**Total estimado: 7 horas**

## ✅ Checklist de Implementação

- [ ] Atualizar `Member` interface
- [ ] Remover `Candidate` interface
- [ ] Criar type helper `CandidateMember`
- [ ] Refatorar `MemberManager.updateMember()`
- [ ] Simplificar `VotingManager`
- [ ] Atualizar `handleCandidateSubmit()`
- [ ] Atualizar `handleAddVote/RemoveVote/ResetVotes()`
- [ ] Atualizar `renderCandidateCard()`
- [ ] Atualizar importação CSV
- [ ] Criar script de migração de dados
- [ ] Remover localStorage.CANDIDATES
- [ ] Testar todos os fluxos
- [ ] Atualizar documentação

## 🎓 Conclusão

Esta refatoração **elimina 80% da complexidade** do sistema de candidatos e torna o código muito mais **simples, robusto e manutenível**.

**Recomendação: IMPLEMENTAR AGORA** antes de adicionar mais features! 🚀

## 📝 Notas Adicionais

### Opção 1: Migração Automática

Detectar formato antigo e converter automaticamente:

```typescript
function migrateOldFormat() {
  const members = JSON.parse(localStorage.getItem("MEMBERS") || "[]");
  const candidates = JSON.parse(localStorage.getItem("CANDIDATES") || "{}");

  // Unificar candidatos nos membros
  const presbyteros = candidates.presbyteros || [];
  const diaconos = candidates.diaconos || [];

  [...presbyteros, ...diaconos].forEach((candidate) => {
    const member = members.find((m) => m.nome === candidate.name);
    if (member) {
      member.candidato = candidate.role;
      member.votes = candidate.votes;
      member.photoUrl = candidate.photoUrl;
      member.isElected = candidate.isElected;
    }
  });

  localStorage.setItem("MEMBERS", JSON.stringify(members));
  localStorage.removeItem("CANDIDATES");
}
```

### Opção 2: Migração Manual

Usuário exporta dados, limpa localStorage, reimporta.

**Recomendação: Opção 1 (automática)** na inicialização do app.
