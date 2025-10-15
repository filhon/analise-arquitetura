# Sincronização em Tempo Real Entre Múltiplos Dispositivos

## 📋 Cenário

Você precisa que múltiplos dispositivos vejam os mesmos dados atualizados em tempo real:

- **Dispositivo 1** (Controle de Presença): Marca presença de membros
- **Dispositivo 2** (Projeção): Exibe votação e quórum atualizados automaticamente
- **Outros dispositivos**: Qualquer número de telas/tablets

---

## 🚨 Limitação Atual

O sistema usa **localStorage**, que é **local ao navegador**:

```typescript
// src/modules/attendance.ts
localStorage.setItem(StorageKeys.ATTENDANCE, JSON.stringify(records));

// src/modules/members.ts
localStorage.setItem(StorageKeys.MEMBERS, JSON.stringify(members));
```

**Problema:** localStorage não sincroniza entre dispositivos diferentes.

---

## ✅ Soluções Disponíveis

### 🟢 Opção 1: Broadcast Channel API (Mesma Rede)

**Complexidade:** ⭐ Baixa  
**Custo:** 💰 Grátis  
**Limitação:** Funciona apenas entre abas/janelas do mesmo computador

```typescript
// src/utils/sync.ts
class BroadcastSync {
  private channel: BroadcastChannel;

  constructor() {
    this.channel = new BroadcastChannel("election-sync");
    this.setupListeners();
  }

  // Enviar mudanças
  broadcast(type: string, data: any) {
    this.channel.postMessage({ type, data, timestamp: Date.now() });
  }

  // Receber mudanças
  private setupListeners() {
    this.channel.onmessage = (event) => {
      const { type, data } = event.data;
      this.handleUpdate(type, data);
    };
  }
}
```

**Vantagem:** Simples, sem servidor  
**Desvantagem:** Não funciona entre computadores diferentes

---

### 🟡 Opção 2: Firebase Realtime Database (Recomendado)

**Complexidade:** ⭐⭐ Média  
**Custo:** 💰 Grátis até 10GB/mês (suficiente para igrejas)  
**Benefício:** Sincronização automática entre qualquer dispositivo

#### 2.1. Configuração Inicial

**1. Criar projeto Firebase:**

- Acesse https://console.firebase.google.com/
- Crie novo projeto "Sistema-Eleicao-Igreja"
- Ative "Realtime Database"
- Configure regras de segurança

**2. Instalar dependências:**

```bash
npm install firebase
```

**3. Configurar Firebase:**

```typescript
// src/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "sistema-eleicao-igreja.firebaseapp.com",
  databaseURL: "https://sistema-eleicao-igreja.firebaseio.com",
  projectId: "sistema-eleicao-igreja",
  storageBucket: "sistema-eleicao-igreja.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
```

---

#### 2.2. Camada de Sincronização

```typescript
// src/utils/realtime-sync.ts
import { database } from "@/config/firebase";
import { ref, set, onValue, update, remove } from "firebase/database";
import { EventSystem } from "./events";
import { EventTypes } from "@/types";

export class RealtimeSync {
  private static instance: RealtimeSync;
  private eventSystem = EventSystem.getInstance();
  private sessionId: string;
  private isEnabled: boolean = false;

  static getInstance(): RealtimeSync {
    if (!RealtimeSync.instance) {
      RealtimeSync.instance = new RealtimeSync();
    }
    return RealtimeSync.instance;
  }

  constructor() {
    this.sessionId = `session-${Date.now()}-${Math.random()}`;
  }

  // Ativar sincronização
  enable() {
    this.isEnabled = true;
    this.setupListeners();
  }

  // Desativar sincronização (modo offline)
  disable() {
    this.isEnabled = false;
  }

  // Sincronizar membros
  syncMembers(members: any[]) {
    if (!this.isEnabled) return;

    const membersRef = ref(database, "members");
    set(membersRef, {
      data: members,
      updatedBy: this.sessionId,
      timestamp: Date.now(),
    });
  }

  // Sincronizar presença
  syncAttendance(attendance: any[]) {
    if (!this.isEnabled) return;

    const attendanceRef = ref(database, "attendance");
    set(attendanceRef, {
      data: attendance,
      updatedBy: this.sessionId,
      timestamp: Date.now(),
    });
  }

  // Sincronizar votos
  syncVotes(votes: any) {
    if (!this.isEnabled) return;

    const votesRef = ref(database, "votes");
    set(votesRef, {
      data: votes,
      updatedBy: this.sessionId,
      timestamp: Date.now(),
    });
  }

  // Sincronizar quórum
  syncQuorum(quorum: any) {
    if (!this.isEnabled) return;

    const quorumRef = ref(database, "quorum");
    set(quorumRef, {
      data: quorum,
      updatedBy: this.sessionId,
      timestamp: Date.now(),
    });
  }

  // Escutar mudanças de outros dispositivos
  private setupListeners() {
    // Escutar membros
    const membersRef = ref(database, "members");
    onValue(membersRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.updatedBy !== this.sessionId) {
        this.eventSystem.emit(EventTypes.SYNC_MEMBERS_UPDATED, data.data);
      }
    });

    // Escutar presença
    const attendanceRef = ref(database, "attendance");
    onValue(attendanceRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.updatedBy !== this.sessionId) {
        this.eventSystem.emit(EventTypes.SYNC_ATTENDANCE_UPDATED, data.data);
      }
    });

    // Escutar votos
    const votesRef = ref(database, "votes");
    onValue(votesRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.updatedBy !== this.sessionId) {
        this.eventSystem.emit(EventTypes.SYNC_VOTES_UPDATED, data.data);
      }
    });

    // Escutar quórum
    const quorumRef = ref(database, "quorum");
    onValue(quorumRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.updatedBy !== this.sessionId) {
        this.eventSystem.emit(EventTypes.SYNC_QUORUM_UPDATED, data.data);
      }
    });
  }
}
```

---

#### 2.3. Atualizar Módulo de Presença

```typescript
// src/modules/attendance.ts (adicionar ao método saveToStorage)
private async saveToStorage(): Promise<void> {
  try {
    const records = Array.from(this.attendanceRecords.values());

    // Salvar localmente
    localStorage.setItem(StorageKeys.ATTENDANCE, JSON.stringify(records));

    // Sincronizar com Firebase
    RealtimeSync.getInstance().syncAttendance(records);

    this.eventSystem.emit(EventTypes.ATTENDANCE_SAVED, {
      count: records.length,
      timestamp: new Date(),
    });
  } catch (error) {
    ErrorHandler.log(error as Error, "AttendanceManager.saveToStorage");
  }
}
```

---

#### 2.4. Atualizar UIManager para Receber Updates

```typescript
// src/ui/manager.ts
private setupSyncListeners(): void {
  const eventSystem = EventSystem.getInstance();

  // Escutar atualizações de presença
  eventSystem.on(EventTypes.SYNC_ATTENDANCE_UPDATED, (data: any[]) => {
    // Atualizar localStorage
    localStorage.setItem(StorageKeys.ATTENDANCE, JSON.stringify(data));

    // Recarregar UI
    if (this.currentTab === 'attendance') {
      this.loadAttendanceData();
    }

    // Sempre atualizar quórum
    this.loadVotingData();
  });

  // Escutar atualizações de membros
  eventSystem.on(EventTypes.SYNC_MEMBERS_UPDATED, (data: any[]) => {
    localStorage.setItem(StorageKeys.MEMBERS, JSON.stringify(data));

    if (this.currentTab === 'members') {
      this.loadMembersData();
    }

    this.loadVotingData();
  });

  // Escutar atualizações de votos
  eventSystem.on(EventTypes.SYNC_VOTES_UPDATED, (data: any) => {
    localStorage.setItem(StorageKeys.VOTES, JSON.stringify(data));

    if (this.currentTab === 'voting') {
      this.loadVotingData();
    }
  });
}
```

---

#### 2.5. Adicionar Novos EventTypes

```typescript
// src/types/index.ts
export enum EventTypes {
  // ... eventos existentes ...

  // Sincronização em tempo real
  SYNC_MEMBERS_UPDATED = "sync:members:updated",
  SYNC_ATTENDANCE_UPDATED = "sync:attendance:updated",
  SYNC_VOTES_UPDATED = "sync:votes:updated",
  SYNC_QUORUM_UPDATED = "sync:quorum:updated",
}
```

---

#### 2.6. Ativar Sincronização no App

```typescript
// src/app.ts
import { RealtimeSync } from '@/utils/realtime-sync';

async initialize(): Promise<{ success: boolean; error?: string }> {
  if (this.isInitialized) {
    return { success: true };
  }

  try {
    // ... código existente ...

    // Ativar sincronização em tempo real
    RealtimeSync.getInstance().enable();

    console.log("[ElectionApp] ✓ Sincronização em tempo real ativada!");

    this.isInitialized = true;
    return { success: true };
  } catch (error) {
    // ...
  }
}
```

---

#### 2.7. Regras de Segurança Firebase

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "members": {
      ".indexOn": ["id", "nome"]
    },
    "attendance": {
      ".indexOn": ["memberId", "timestamp"]
    },
    "votes": {
      ".indexOn": ["candidateId"]
    }
  }
}
```

**⚠️ IMPORTANTE:** Para produção, configure autenticação e regras mais restritivas.

---

### 🔴 Opção 3: WebSocket com Backend Próprio

**Complexidade:** ⭐⭐⭐ Alta  
**Custo:** 💰 Servidor (R$ 20-50/mês)  
**Benefício:** Controle total, sem limites

#### 3.1. Backend Node.js + Socket.IO

```typescript
// backend/server.ts
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Estado em memória (ou use Redis/MongoDB)
let state = {
  members: [],
  attendance: [],
  votes: {},
  quorum: {},
};

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Enviar estado atual para novo cliente
  socket.emit("initial-state", state);

  // Escutar atualizações de presença
  socket.on("update-attendance", (data) => {
    state.attendance = data;
    // Broadcast para todos os outros clientes
    socket.broadcast.emit("attendance-updated", data);
  });

  // Escutar atualizações de membros
  socket.on("update-members", (data) => {
    state.members = data;
    socket.broadcast.emit("members-updated", data);
  });

  // Escutar atualizações de votos
  socket.on("update-votes", (data) => {
    state.votes = data;
    socket.broadcast.emit("votes-updated", data);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Servidor WebSocket rodando na porta 3001");
});
```

#### 3.2. Frontend com Socket.IO Client

```typescript
// src/utils/websocket-sync.ts
import { io, Socket } from "socket.io-client";
import { EventSystem } from "./events";
import { EventTypes } from "@/types";

export class WebSocketSync {
  private static instance: WebSocketSync;
  private socket: Socket;
  private eventSystem = EventSystem.getInstance();

  static getInstance(): WebSocketSync {
    if (!WebSocketSync.instance) {
      WebSocketSync.instance = new WebSocketSync();
    }
    return WebSocketSync.instance;
  }

  constructor() {
    this.socket = io("http://localhost:3001");
    this.setupListeners();
  }

  // Enviar atualizações
  updateAttendance(data: any[]) {
    this.socket.emit("update-attendance", data);
  }

  updateMembers(data: any[]) {
    this.socket.emit("update-members", data);
  }

  updateVotes(data: any) {
    this.socket.emit("update-votes", data);
  }

  // Receber atualizações
  private setupListeners() {
    // Estado inicial
    this.socket.on("initial-state", (state) => {
      console.log("Estado inicial recebido:", state);
      // Atualizar localStorage com estado do servidor
    });

    // Presença atualizada
    this.socket.on("attendance-updated", (data) => {
      this.eventSystem.emit(EventTypes.SYNC_ATTENDANCE_UPDATED, data);
    });

    // Membros atualizados
    this.socket.on("members-updated", (data) => {
      this.eventSystem.emit(EventTypes.SYNC_MEMBERS_UPDATED, data);
    });

    // Votos atualizados
    this.socket.on("votes-updated", (data) => {
      this.eventSystem.emit(EventTypes.SYNC_VOTES_UPDATED, data);
    });

    // Reconexão
    this.socket.on("reconnect", () => {
      console.log("Reconectado ao servidor");
    });
  }
}
```

---

## 📊 Comparação das Soluções

| Característica         | Broadcast Channel | Firebase | WebSocket    |
| ---------------------- | ----------------- | -------- | ------------ |
| **Entre computadores** | ❌ Não            | ✅ Sim   | ✅ Sim       |
| **Configuração**       | 5 min             | 30 min   | 2-3 horas    |
| **Custo**              | Grátis            | Grátis\* | R$ 20-50/mês |
| **Manutenção**         | Zero              | Baixa    | Alta         |
| **Latência**           | Instantânea       | <100ms   | <50ms        |
| **Offline**            | ❌                | ✅ Queue | ❌           |
| **Escalabilidade**     | Limitada          | Alta     | Média        |
| **Controle**           | Baixo             | Médio    | Total        |

\*Firebase: Grátis até 10GB/mês, depois R$ 0,50/GB

---

## 🎯 Recomendação

### Para sua igreja, recomendo **Firebase Realtime Database**:

✅ **Prós:**

- Sincronização automática entre dispositivos
- Grátis para uso de igreja (baixo volume)
- Funciona offline (queue automático)
- Configuração em 30 minutos
- Não precisa manter servidor
- Google cuida da infraestrutura
- SDKs oficiais e documentação

❌ **Contras:**

- Depende de internet
- Dados armazenados no Firebase (Google)
- Limitações no plano gratuito (suficientes para igrejas)

---

## 🚀 Implementação Passo a Passo (Firebase)

### Fase 1: Setup Firebase (30 min)

1. ✅ Criar projeto Firebase
2. ✅ Instalar `npm install firebase`
3. ✅ Criar `src/config/firebase.ts`
4. ✅ Criar `src/utils/realtime-sync.ts`
5. ✅ Adicionar novos `EventTypes`

### Fase 2: Integrar Módulos (1 hora)

1. ✅ Atualizar `AttendanceManager.saveToStorage()`
2. ✅ Atualizar `MemberManager.saveToStorage()`
3. ✅ Atualizar `VotingManager.saveToStorage()`
4. ✅ Adicionar listeners em `UIManager.setupSyncListeners()`

### Fase 3: Testar (30 min)

1. ✅ Abrir app em 2 navegadores
2. ✅ Marcar presença no navegador 1
3. ✅ Verificar atualização instantânea no navegador 2
4. ✅ Testar com celular na mesma rede WiFi

---

## 🔧 Modo Híbrido (Recomendado)

Combine **localStorage + Firebase** para melhor experiência:

```typescript
// src/utils/hybrid-storage.ts
export class HybridStorage {
  // Salvar localmente E no Firebase
  async save(key: string, data: any) {
    // 1. Salvar localmente (rápido)
    localStorage.setItem(key, JSON.stringify(data));

    // 2. Sincronizar com Firebase (async)
    try {
      await RealtimeSync.getInstance().sync(key, data);
    } catch (error) {
      console.warn("Falha ao sincronizar, dados salvos localmente");
    }
  }

  // Carregar do localStorage (instantâneo)
  load(key: string) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
}
```

**Benefícios:**

- ✅ App funciona offline
- ✅ Sincronização automática quando online
- ✅ Performance instantânea
- ✅ Backup automático na nuvem

---

## 📱 Fluxo de Uso Real

### Cenário: Eleição no Domingo

**09:00 - Setup**

1. Abrir app no computador de controle (presença)
2. Abrir app no projetor (votação)
3. Firebase sincroniza estado inicial

**09:30 - Membros Chegando**

1. Operador marca presença no computador
2. Projetor atualiza quórum **automaticamente**
3. Sem refresh, sem delay

**10:00 - Votação**

1. Membros votam (papel ou digitalmente)
2. Operador registra votos no computador
3. Projetor mostra contagem **em tempo real**

**11:00 - Resultados**

1. Ata gerada no computador
2. Projetor mostra resultados finais
3. Dados salvos no Firebase (backup)

---

## ⚠️ Considerações Importantes

### Segurança

**Firebase:**

```json
// Regras para eleição (mais restritivas)
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null && auth.token.role == 'admin'",
    "members": {
      ".indexOn": ["id"]
    }
  }
}
```

### Performance

- **Firebase:** ~100ms latência (aceitável)
- **LocalStorage:** <1ms (instantâneo)
- **Híbrido:** Melhor dos dois mundos

### Fallback

```typescript
// Verificar conexão antes de sincronizar
if (navigator.onLine) {
  RealtimeSync.getInstance().sync(data);
} else {
  console.warn("Offline: dados salvos apenas localmente");
}
```

---

## 📚 Recursos

### Firebase

- Docs: https://firebase.google.com/docs/database
- Console: https://console.firebase.google.com/
- Pricing: https://firebase.google.com/pricing

### Alternativas Gratuitas

- **Supabase:** Open-source, PostgreSQL + Realtime
- **Appwrite:** Self-hosted, controle total
- **PocketBase:** SQLite + Realtime, single binary

---

## 🎓 Conclusão

Para sincronização entre **dispositivos diferentes em tempo real**, você precisa de:

1. **Backend/Serviço:** Firebase, WebSocket, ou similar
2. **Camada de Sincronização:** `RealtimeSync` class
3. **Event Listeners:** Atualizar UI automaticamente
4. **Modo Híbrido:** localStorage + Firebase

**Implementação recomendada:** Firebase (30 min setup, grátis, robusto)

**Próximos passos:**

1. Criar projeto Firebase
2. Instalar dependência
3. Implementar `RealtimeSync`
4. Testar com 2 dispositivos

Quer que eu implemente a solução Firebase completa?
