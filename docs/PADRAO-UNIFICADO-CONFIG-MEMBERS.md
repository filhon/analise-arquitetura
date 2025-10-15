# Padrão Unificado: Config e Members

**Data:** 12/10/2025  
**Tipo:** 📐 Arquitetura - Padrão de Dados  
**Status:** ✅ Unificado

## 🎯 Padrão Aplicado

Tanto `members` quanto `config` agora seguem o **mesmo padrão de estrutura** no Firebase Realtime Database:

```typescript
{
  data: <conteúdo>,      // ← Dados reais do domínio
  updatedBy: string,     // ← Metadado: ID da sessão
  timestamp: number      // ← Metadado: Unix timestamp
}
```

## 📊 Estrutura Completa

### Node Members (Firebase)

```json
{
  "members": {
    "data": [
      {
        "id": "xxx",
        "nome": "João Silva",
        "tipo": "Membro Comungante",
        ...
      }
    ],
    "updatedBy": "session-1760215568822-abc",
    "timestamp": 1760299832598
  }
}
```

### Node Config (Firebase)

```json
{
  "config": {
    "data": {
      "quorum": {
        "presbyteroPositions": 4,
        "diaconoPositions": 6,
        "minimumPercentage": 33.3,
        "votesCriteria": "simple-majority",
        "votesRequiredPercentage": -1
      }
    },
    "updatedBy": "session-1760215568822-abc",
    "timestamp": 1760299832598
  }
}
```

## 🔄 Fluxo de Dados Completo

### 1. Salvamento (localStorage → Firebase)

```typescript
// VOTING MANAGER (voting.ts)
async updateQuorumConfig(config: QuorumConfig) {
  // Monta ConfigData
  const configData: ConfigData = { quorum: config };

  // 1. Salva no localStorage
  localStorage.setItem(
    StorageKeys.CONFIG,
    JSON.stringify(configData)  // ← { quorum: {...} }
  );

  // 2. Sincroniza com Firebase
  RealtimeSync.getInstance().syncConfig(configData);
}
```

```typescript
// REALTIME SYNC (realtime-sync.ts)
async syncConfig(config: QuorumConfig | ConfigData) {
  const configData = "quorum" in config
    ? config                    // ← ConfigData
    : { quorum: config };       // ← QuorumConfig → ConfigData

  // 3. Envolve em estrutura padrão
  await set(ref(database, "config"), {
    data: configData,           // ← { quorum: {...} }
    updatedBy: this.sessionId,
    timestamp: Date.now(),
  });
}
```

**Resultado no Firebase:**

```json
{
  "config": {
    "data": { "quorum": {...} },
    "updatedBy": "...",
    "timestamp": ...
  }
}
```

### 2. Carregamento (Firebase → localStorage)

```typescript
// REALTIME SYNC (realtime-sync.ts)
async loadInitialState() {
  const configSnap = await get(ref(database, "config"));

  // 1. Extrai 'data.quorum' do Firebase
  return {
    config: configSnap.exists()
      ? configSnap.val().data?.quorum  // ← QuorumConfig
      : null
  };
}
```

```typescript
// APP (app.ts)
async loadFromFirebaseIfEmpty() {
  const firebaseData = await this.realtimeSync.loadInitialState();

  if (firebaseData.config) {
    // 2. Salva no localStorage (como ConfigData)
    localStorage.setItem(
      StorageKeys.CONFIG,
      JSON.stringify({ quorum: firebaseData.config })  // ← ConfigData
    );
  }
}
```

```typescript
// VOTING MANAGER (voting.ts)
async getQuorumConfig() {
  const stored = localStorage.getItem(StorageKeys.CONFIG);
  const configData: ConfigData = JSON.parse(stored);

  // 3. Retorna apenas o quorum
  return configData.quorum;  // ← QuorumConfig
}
```

### 3. Sincronização em Tempo Real

```typescript
// REALTIME SYNC - Listener (realtime-sync.ts)
onValue(ref(database, "config"), (snapshot) => {
  const data = snapshot.val();

  if (data.updatedBy !== this.sessionId) {
    // 1. Emite apenas 'data' (sem metadados)
    this.eventSystem.emit(
      EventTypes.SYNC_CONFIG_UPDATED,
      data.data // ← { quorum: {...} }
    );
  }
});
```

```typescript
// APP - Event Handler (app.ts)
this.eventSystem.on(EventTypes.SYNC_CONFIG_UPDATED, (configData) => {
  // 2. Salva ConfigData no localStorage
  localStorage.setItem(
    StorageKeys.CONFIG,
    JSON.stringify(configData) // ← { quorum: {...} }
  );

  // 3. Recarrega módulos
  this.votingManager.loadFromStorage();
});
```

## 📐 Tipos TypeScript

```typescript
// Configuração de Quórum (domínio)
interface QuorumConfig {
  minimumPercentage: number;
  presbyteroPositions: number;
  diaconoPositions: number;
  votesCriteria: "simple-majority" | "absolute-majority" | "custom";
  votesRequiredPercentage: number;
}

// Envelope de configuração (localStorage)
interface ConfigData {
  quorum: QuorumConfig;
  system?: any; // Futuro: outras configs
}

// Envelope Firebase (automático)
interface FirebaseNode {
  data: ConfigData | Member[];
  updatedBy: string;
  timestamp: number;
}
```

## 🎨 Consistência Entre Nodes

| Aspecto                | Members                          | Config                           |
| ---------------------- | -------------------------------- | -------------------------------- |
| **Estrutura Firebase** | `{ data, updatedBy, timestamp }` | `{ data, updatedBy, timestamp }` |
| **Tipo de `data`**     | `Member[]`                       | `ConfigData`                     |
| **localStorage**       | `Member[]` diretamente           | `ConfigData` diretamente         |
| **Sync**               | `syncMembers(members[])`         | `syncConfig(ConfigData)`         |
| **Load**               | `data` array                     | `data.quorum`                    |
| **Evento**             | `SYNC_MEMBERS_UPDATED`           | `SYNC_CONFIG_UPDATED`            |

## ✅ Benefícios da Unificação

1. **Consistência:** Mesmo padrão para todos os nodes
2. **Previsibilidade:** Sempre `{ data, updatedBy, timestamp }`
3. **Metadados Centralizados:** `updatedBy` e `timestamp` em todos os nodes
4. **Extensibilidade:** Fácil adicionar novos nodes seguindo o padrão
5. **Debug Simplificado:** Estrutura uniforme no Firebase Console

## 🔍 Diferenças Sutis

### Members

```typescript
// Firebase
{ data: Member[], ... }

// localStorage
Member[]  // ← Array direto

// Sync
syncMembers(members: Member[])
```

### Config

```typescript
// Firebase
{ data: ConfigData, ... }
// onde ConfigData = { quorum: QuorumConfig }

// localStorage
ConfigData  // ← Objeto com 'quorum'

// Sync
syncConfig(config: QuorumConfig | ConfigData)
```

**Razão:** Members é um array (coleção), Config é um objeto único com subestruturas.

## 🚨 Armadilhas Evitadas

### ❌ Aninhamento Excessivo

```json
// ERRADO
{
  "config": {
    "data": {
      "data": {
        "quorum": { ... }
      }
    }
  }
}
```

### ✅ Estrutura Limpa

```json
// CORRETO
{
  "config": {
    "data": {
      "quorum": { ... }
    },
    "updatedBy": "...",
    "timestamp": ...
  }
}
```

## 📋 Checklist de Implementação

- [x] `syncConfig()` usa wrapper `data`
- [x] `syncMembers()` usa wrapper `data`
- [x] `loadInitialState()` lê `data.quorum` para config
- [x] `loadInitialState()` lê `data` para members
- [x] Listener config emite `data.data`
- [x] Listener members emite `data.data`
- [x] localStorage armazena ConfigData para config
- [x] localStorage armazena Member[] para members
- [x] Tipos TypeScript corretos
- [x] Documentação atualizada

## 🧪 Como Verificar

1. **Inspecione o Firebase Console:**

   ```json
   {
     "members": {
       "data": [ ... ],
       "updatedBy": "...",
       "timestamp": ...
     },
     "config": {
       "data": {
         "quorum": { ... }
       },
       "updatedBy": "...",
       "timestamp": ...
     }
   }
   ```

2. **Verifique localStorage:**

   ```javascript
   // Members
   JSON.parse(localStorage.getItem("election-members"));
   // [{ id, nome, ... }]

   // Config
   JSON.parse(localStorage.getItem("election-config"));
   // { quorum: { ... } }
   ```

3. **Teste Sincronização:**
   - Abra 2 abas
   - Altere config em uma aba
   - Verifique atualização na outra
   - Estrutura deve manter padrão

## 🎓 Lições de Arquitetura

1. **Consistência é Rei:** Mesmo padrão reduz bugs
2. **Metadados Separados:** `updatedBy`/`timestamp` fora do domínio
3. **Envelope Pattern:** Wrapper uniforme para todos os nodes
4. **Type Safety:** TypeScript previne erros de estrutura
5. **Firebase Best Practices:** Estrutura otimizada para queries

## 🔗 Arquivos Afetados

| Arquivo                      | Responsabilidade                    |
| ---------------------------- | ----------------------------------- |
| `src/utils/realtime-sync.ts` | Sync Firebase (grava/lê com padrão) |
| `src/app.ts`                 | Inicialização e load do Firebase    |
| `src/modules/voting.ts`      | Gerenciamento de config             |
| `src/modules/members.ts`     | Gerenciamento de members            |
| `src/ui/manager.ts`          | Event handlers (SYNC\_\*\_UPDATED)  |

## ✅ Conclusão

O padrão está **unificado e consistente**. Todos os nodes do Firebase seguem a estrutura `{ data, updatedBy, timestamp }`, garantindo previsibilidade, manutenibilidade e facilitando futuras expansões do sistema.

**Status:** Pronto para produção! 🚀
