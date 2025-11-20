import { database, isConfigured } from "@/config/firebase";
import {
  ref,
  set,
  onValue,
  onChildAdded,
  get,
  runTransaction,
} from "firebase/database";
import { EventSystem } from "./events";
import { EventTypes } from "@/types";
import type { Member, QuorumConfig, ConfigData, AuditVote } from "@/types";

export class RealtimeSync {
  private static instance: RealtimeSync;
  private eventSystem = EventSystem.getInstance();
  private sessionId: string;
  private isEnabled: boolean = false;
  private listeners: Map<string, () => void> = new Map();

  static getInstance(): RealtimeSync {
    if (!RealtimeSync.instance) {
      RealtimeSync.instance = new RealtimeSync();
    }
    return RealtimeSync.instance;
  }

  constructor() {
    // ID único da sessão para evitar loops de atualização
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (!isConfigured) {
      console.warn(
        "[RealtimeSync] Firebase não configurado - sincronização desabilitada"
      );
    }
  }

  /**
   * Ativar sincronização em tempo real
   */
  enable(): void {
    if (!isConfigured || !database) {
      console.warn(
        "[RealtimeSync] Não é possível ativar - Firebase não configurado"
      );
      return;
    }

    if (this.isEnabled) {
      return;
    }

    this.isEnabled = true;
    this.setupListeners();
  }

  disable(): void {
    this.isEnabled = false;
    this.removeAllListeners();
  }

  isActive(): boolean {
    return this.isEnabled && isConfigured;
  }

  async syncMembers(members: Member[]): Promise<void> {
    if (!this.isActive()) {
      return;
    }

    if (!database) {
      console.warn(
        "[RealtimeSync] ⚠️ Firebase database NÃO INICIALIZADO! Sincronização ignorada."
      );
      return;
    }

    try {
      console.log(
        `[RealtimeSync] 📤 Sincronizando ${members.length} membros para Firebase...`
      );
      const membersRef = ref(database, "members");
      await set(membersRef, {
        data: members,
        updatedBy: this.sessionId,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("[RealtimeSync] Erro ao sincronizar membros:", error);
    }
  }

  async syncConfig(
    config: QuorumConfig | { quorum: QuorumConfig; system?: any }
  ): Promise<void> {
    if (!this.isActive() || !database) return;

    try {
      const configRef = ref(database, "config");
      const configData = "quorum" in config ? config : { quorum: config };

      await set(configRef, {
        data: configData,
        updatedBy: this.sessionId,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("[RealtimeSync] Erro ao sincronizar configuração:", error);
    }
  }

  /**
   * Sincronizar logs de auditoria de votos (LEGADO - será descontinuado)
   * PADRÃO: { data, updatedBy, timestamp }
   * @deprecated Usar syncVoteToFirebase() para estrutura incremental
   */
  async syncAuditLog(auditLog: string): Promise<void> {
    if (!this.isActive() || !database) return;

    try {
      const auditRef = ref(database, "audit");

      await set(auditRef, {
        data: auditLog,
        updatedBy: this.sessionId,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("[RealtimeSync] Erro ao sincronizar audit log:", error);
    }
  }

  /**
   * ✅ NOVO: Sincronizar voto individual no Firebase (estrutura incremental)
   * Cada voto é salvo em /audit/{voteId}/ como nó independente
   * Elimina race conditions e permite votação simultânea
   *
   * @param vote - Voto completo com id, timestamp, candidatos e hash
   * @returns Promise com sucesso/erro
   */
  /**
   * ✅ NOVO: Obter próximo ID de voto usando transação atômica
   * Elimina race conditions garantindo atomicidade na leitura e escrita
   *
   * @returns Promise com próximo ID disponível
   */
  async getNextVoteIdAtomic(): Promise<number> {
    if (!this.isActive() || !database) {
      throw new Error("Firebase não configurado ou inativo");
    }

    try {
      const metadataRef = ref(database, "audit/metadata");

      let nextId = 0;

      // Usar transação atômica para ler e incrementar contador
      await runTransaction(metadataRef, (currentData) => {
        if (currentData === null) {
          // Primeira vez: inicializar metadata
          nextId = 0;
          return {
            totalVotes: 1,
            lastUpdated: Date.now(),
            version: "2.0",
          };
        }

        // Calcular próximo ID
        nextId = currentData.totalVotes || 0;

        // Incrementar contador atomicamente
        return {
          ...currentData,
          totalVotes: nextId + 1,
          lastUpdated: Date.now(),
        };
      });

      console.log(`[RealtimeSync] ✅ Próximo ID atômico obtido: ${nextId}`);
      return nextId;
    } catch (error) {
      console.error("[RealtimeSync] ❌ Erro em transação atômica:", error);
      throw error;
    }
  }

  /**
   * ✅ ATUALIZADO: Sincronizar voto usando ID obtido atomicamente
   * Agora recebe o ID já calculado pela transação
   */
  async syncVoteToFirebase(
    vote: AuditVote
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isActive() || !database) {
      return {
        success: false,
        error: "Firebase não configurado ou inativo",
      };
    }

    try {
      // Criar referência para o voto específico: /audit/{voteId}/
      const voteRef = ref(database, `audit/${vote.id}`);

      // Salvar voto com metadados
      await set(voteRef, {
        id: vote.id,
        timestamp: vote.timestamp,
        presbyteros: vote.presbyteros,
        diaconos: vote.diaconos,
        hash: vote.hash,
        createdBy: this.sessionId,
        createdAt: Date.now(),
      });

      console.log(
        `[RealtimeSync] ✅ Voto ${vote.id} sincronizado com Firebase`
      );
      return { success: true };
    } catch (error) {
      console.error(
        `[RealtimeSync] ❌ Erro ao sincronizar voto ${vote.id}:`,
        error
      );
      return {
        success: false,
        error: `Erro ao sincronizar voto: ${String(error)}`,
      };
    }
  }

  /**
   * ✅ NOVO: Atualizar metadata de auditoria
   * Atualiza /audit/metadata/ com total de votos e timestamp
   * Executa em background sem bloquear
   */
  private async updateAuditMetadata(): Promise<void> {
    if (!this.isActive() || !database) return;

    try {
      const metadataRef = ref(database, "audit/metadata");

      // Contar total de votos (nós numéricos em /audit/)
      const auditRef = ref(database, "audit");
      const snapshot = await get(auditRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        // Contar apenas nós numéricos (votos), ignorar 'metadata'
        const totalVotes = Object.keys(data).filter((key) =>
          /^\d+$/.test(key)
        ).length;

        await set(metadataRef, {
          totalVotes,
          lastUpdated: Date.now(),
          version: "2.0",
        });
      }
    } catch (error) {
      console.error("[RealtimeSync] ✗ Erro ao atualizar metadata:", error);
    }
  }

  /**
   * ✅ NOVO: Carregar votos do Firebase (estrutura incremental)
   * Lê todos os nós em /audit/ e retorna array de votos ordenado
   *
   * @returns Array de votos ordenados por ID
   */
  async loadVotesFromFirebase(): Promise<AuditVote[]> {
    if (!this.isActive() || !database) {
      return [];
    }

    try {
      const auditRef = ref(database, "audit");
      const snapshot = await get(auditRef);

      if (!snapshot.exists()) {
        return [];
      }

      const data = snapshot.val();
      const votes: AuditVote[] = [];

      // Extrair apenas nós numéricos (votos), ignorar 'metadata'
      Object.keys(data).forEach((key) => {
        if (/^\d+$/.test(key)) {
          const voteData = data[key];
          votes.push({
            id: voteData.id,
            timestamp: voteData.timestamp,
            presbyteros: voteData.presbyteros || [],
            diaconos: voteData.diaconos || [],
            hash: voteData.hash,
          });
        }
      });

      // Ordenar por ID
      votes.sort((a, b) => a.id - b.id);

      return votes;
    } catch (error) {
      console.error("[RealtimeSync] ❌ Erro ao carregar votos:", error);
      return [];
    }
  }

  /**
   * Limpar todos os dados de auditoria do Firebase
   * Remove todos os votos e metadata
   */
  async clearAuditData(): Promise<{ success: boolean; error?: string }> {
    if (!this.isActive() || !database) {
      return {
        success: false,
        error: "Firebase inativo ou não configurado",
      };
    }

    try {
      const auditRef = ref(database, "audit");
      await set(auditRef, null);
      console.log("[RealtimeSync] 🗑️ Dados de auditoria limpos no Firebase");
      return { success: true };
    } catch (error) {
      console.error("[RealtimeSync] ❌ Erro ao limpar auditoria:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Carregar estado inicial do Firebase
   * PADRÃO: Ambos usam { data, updatedBy, timestamp }
   *
   * ✅ ESTRUTURA FIREBASE:
   * - members/data -> Member[]
   * - config/data -> ConfigData {quorum: QuorumConfig, system: SystemConfig}
   */
  async loadInitialState(): Promise<{
    members: Member[] | null;
    config: ConfigData | null;
  }> {
    if (!this.isActive() || !database) {
      console.log("[RealtimeSync] ⚠️ Firebase inativo ou não configurado");
      return { members: null, config: null };
    }

    try {
      // ✅ CORREÇÃO: Ler diretamente de 'members/data' e 'config/data' com timeout
      const timeoutMs =
        Number(import.meta.env.VITE_FIREBASE_LOAD_TIMEOUT) || 3000;

      const promiseGet = async () => {
        const [membersSnap, configSnap] = await Promise.all([
          get(ref(database!, "members/data")),
          get(ref(database!, "config/data")),
        ]);
        return { membersSnap, configSnap };
      };

      const promiseWithTimeout = (p: Promise<any>, ms: number) =>
        new Promise((resolve, reject) => {
          const t = setTimeout(() => reject(new Error("timeout")), ms);
          p.then((res) => {
            clearTimeout(t);
            resolve(res);
          }).catch((err) => {
            clearTimeout(t);
            reject(err);
          });
        });

      let membersSnap: any;
      let configSnap: any;

      try {
        const res = (await promiseWithTimeout(promiseGet(), timeoutMs)) as any;
        membersSnap = res.membersSnap;
        configSnap = res.configSnap;
      } catch (err) {
        console.warn(
          `[RealtimeSync] ⚠️ loadInitialState timed out or failed (${String(err)}). Proceeding with local cache.`
        );
        return { members: null, config: null };
      }

      // 🐛 DEBUG: Log do que foi lido
      console.log("[RealtimeSync] 🐛 DEBUG loadInitialState:", {
        membersExists: membersSnap.exists(),
        configExists: configSnap.exists(),
        membersVal: membersSnap.exists()
          ? `${membersSnap.val()?.length || 0} items`
          : null,
        configVal: configSnap.exists() ? "exists" : null,
      });

      return {
        members: membersSnap.exists() ? membersSnap.val() : null,
        config: configSnap.exists() ? configSnap.val() : null,
      };
    } catch (error) {
      console.error("[RealtimeSync] ✗ Erro ao carregar estado inicial:", error);
      return { members: null, config: null };
    }
  }

  /**
   * Configurar listeners para mudanças em tempo real
   * Apenas 2 nós: members (todos os dados) e config (configurações)
   */
  private setupListeners(): void {
    if (!database) return;

    // Listener de membros (única fonte da verdade)
    const membersRef = ref(database, "members");
    const membersUnsubscribe = onValue(membersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Ignorar atualizações da própria sessão
        if (data.updatedBy !== this.sessionId) {
          console.log("[RealtimeSync] 🔄 Membros atualizados remotamente");
          this.eventSystem.emit(EventTypes.SYNC_MEMBERS_UPDATED, data.data);
        }
      }
    });
    this.listeners.set("members", membersUnsubscribe);

    // Listener de configuração
    const configRef = ref(database, "config");
    const configUnsubscribe = onValue(configRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data && data.updatedBy !== this.sessionId) {
          console.log("[RealtimeSync] 🔄 Configuração atualizada remotamente");
          // ✅ PADRÃO MEMBERS: Config usa wrapper 'data'
          // Emitir apenas o conteúdo de 'data', sem metadados
          this.eventSystem.emit(EventTypes.SYNC_CONFIG_UPDATED, data.data);
        }
      }
    });
    this.listeners.set("config", configUnsubscribe);

    // ✅ V2: Listener incremental de auditoria (onChildAdded)
    // Escuta apenas novos votos individuais, evitando race conditions
    const auditRef = ref(database, "audit");
    const auditUnsubscribe = onChildAdded(auditRef, (snapshot) => {
      const key = snapshot.key;

      // Ignorar nó de metadata (não é um voto)
      if (key === "metadata") {
        return;
      }

      // Validar que é um nó numérico (voto válido)
      if (key && /^\d+$/.test(key)) {
        const vote = snapshot.val() as AuditVote;

        // Ignorar votos criados pela própria sessão (prevenir loop)
        if (vote.createdBy !== this.sessionId) {
          console.log(`[RealtimeSync] 🔄 Novo voto recebido: ID ${vote.id}`);
          // Emitir evento com voto individual
          this.eventSystem.emit(EventTypes.SYNC_VOTE_ADDED, vote);
        }
      }
    });
    this.listeners.set("audit", auditUnsubscribe);

    console.log(
      "[RealtimeSync] �� Listeners configurados (3 - audit incremental)"
    );
  }

  /**
   * Remover todos os listeners
   */
  private removeAllListeners(): void {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
    console.log("[RealtimeSync] 🔇 Listeners removidos");
  }

  /**
   * Obter informações de status
   */
  getStatus(): {
    enabled: boolean;
    configured: boolean;
    sessionId: string;
    listeners: number;
  } {
    return {
      enabled: this.isEnabled,
      configured: isConfigured,
      sessionId: this.sessionId,
      listeners: this.listeners.size,
    };
  }

  /**
   * ✅ REFATORADO: Incrementar voto usando estrutura /candidates/votes/{id}
   * Transação lê apenas 1 integer ao invés de array completo (99% mais rápido)
   */
  async incrementVoteAtomically(
    candidateId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isActive() || !database) {
      return { success: false, error: "Firebase não configurado ou inativo" };
    }

    try {
      const voteRef = ref(database, `candidates/votes/${candidateId}`);

      const result = await runTransaction(
        voteRef,
        (currentVotes: number | null) => {
          return (currentVotes || 0) + 1;
        }
      );

      if (result.committed) {
        return { success: true };
      } else {
        return {
          success: false,
          error: "Transação abortada - possível conflito de concorrência",
        };
      }
    } catch (error) {
      console.error(
        `[RealtimeSync] ❌ Erro na transação para candidato ${candidateId}:`,
        error
      );
      return { success: false, error: `Erro na transação: ${String(error)}` };
    }
  }

  /**
   * ✅ REFATORADO: Decrementar voto usando estrutura /candidates/votes/{id}
   * Usado para rollback em caso de erro durante votação
   */
  async decrementVoteAtomically(
    candidateId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isActive() || !database) {
      return { success: false, error: "Firebase não configurado ou inativo" };
    }

    try {
      const voteRef = ref(database, `candidates/votes/${candidateId}`);

      const result = await runTransaction(
        voteRef,
        (currentVotes: number | null) => {
          return Math.max(0, (currentVotes || 0) - 1);
        }
      );

      if (result.committed) {
        return { success: true };
      } else {
        return { success: false, error: "Transação de rollback abortada" };
      }
    } catch (error) {
      console.error(
        `[RealtimeSync] ❌ Erro na transação de rollback para candidato ${candidateId}:`,
        error
      );
      return {
        success: false,
        error: `Erro na transação de rollback: ${String(error)}`,
      };
    }
  }

  /**
   * ✅ NOVO: Sincronizar dados de exibição do candidato em /candidates/active/{id}
   * Chamado quando membro-candidato é editado (nome, foto, etc.)
   */
  async syncCandidateActive(
    candidateId: string,
    data: { nome: string; tipo: string; photoUrl?: string | null }
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isActive() || !database) {
      return { success: false, error: "Firebase não configurado ou inativo" };
    }

    try {
      const activeRef = ref(database, `candidates/active/${candidateId}`);
      await set(activeRef, {
        nome: data.nome,
        tipo: data.tipo,
        photoUrl: data.photoUrl || null,
        syncedAt: Date.now(),
      });

      return { success: true };
    } catch (error) {
      console.error(
        `[RealtimeSync] ❌ Erro ao sincronizar candidato ativo ${candidateId}:`,
        error
      );
      return {
        success: false,
        error: `Erro ao sincronizar candidato: ${String(error)}`,
      };
    }
  }

  /**
   * ✅ NOVO: Criar nó de votos para novo candidato
   * Inicializa /candidates/votes/{id} com 0
   */
  async createCandidateVoteNode(
    candidateId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isActive() || !database) {
      return { success: false, error: "Firebase não configurado ou inativo" };
    }

    try {
      const voteRef = ref(database, `candidates/votes/${candidateId}`);
      await set(voteRef, 0);
      return { success: true };
    } catch (error) {
      console.error(
        `[RealtimeSync] ❌ Erro ao criar nó de votos para ${candidateId}:`,
        error
      );
      return {
        success: false,
        error: `Erro ao criar nó de votos: ${String(error)}`,
      };
    }
  }

  /**
   * ✅ NOVO: Remover candidato das estruturas /candidates/*
   * Chamado quando membro deixa de ser candidato
   */
  async removeCandidateNodes(
    candidateId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isActive() || !database) {
      return { success: false, error: "Firebase não configurado ou inativo" };
    }

    try {
      await set(ref(database, `candidates/votes/${candidateId}`), null);
      await set(ref(database, `candidates/active/${candidateId}`), null);
      return { success: true };
    } catch (error) {
      console.error(
        `[RealtimeSync] ❌ Erro ao remover nós do candidato ${candidateId}:`,
        error
      );
      return {
        success: false,
        error: `Erro ao remover candidato: ${String(error)}`,
      };
    }
  }

  /**
   * ✅ NOVO: Carregar votos de todos os candidatos
   * Retorna Map<candidateId, votes>
   */
  async loadCandidateVotes(): Promise<Map<string, number>> {
    if (!this.isActive() || !database) {
      return new Map();
    }

    try {
      const votesRef = ref(database, "candidates/votes");
      const snapshot = await get(votesRef);

      const votesMap = new Map<string, number>();

      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.entries(data).forEach(([id, votes]) => {
          votesMap.set(id, votes as number);
        });
      }

      return votesMap;
    } catch (error) {
      console.error("[RealtimeSync] ❌ Erro ao carregar votos:", error);
      return new Map();
    }
  }

  /**
   * ✅ NOVO: Carregar dados de exibição de candidatos ativos
   * Retorna Map<candidateId, {nome, tipo, photoUrl}>
   */
  async loadCandidateActiveData(): Promise<
    Map<string, { nome: string; tipo: string; photoUrl?: string | null }>
  > {
    if (!this.isActive() || !database) {
      return new Map();
    }

    try {
      const activeRef = ref(database, "candidates/active");
      const snapshot = await get(activeRef);

      const activeMap = new Map<
        string,
        { nome: string; tipo: string; photoUrl?: string | null }
      >();

      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.entries(data).forEach(([id, candidateData]: [string, any]) => {
          activeMap.set(id, {
            nome: candidateData.nome,
            tipo: candidateData.tipo,
            photoUrl: candidateData.photoUrl,
          });
        });
      }

      return activeMap;
    } catch (error) {
      console.error(
        "[RealtimeSync] ❌ Erro ao carregar dados de candidatos ativos:",
        error
      );
      return new Map();
    }
  }
}
