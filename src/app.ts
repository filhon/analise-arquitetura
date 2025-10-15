// Aplicação principal

import { EventSystem, RealtimeSync } from "@/utils";
import { MemberManager } from "@/modules/members";
import { VotingManager } from "@/modules/voting";
import { AttendanceManager } from "@/modules/attendance";
import { ReportManager } from "@/modules/reports";
import { ErrorHandler, Validator } from "@/utils";
import { autoMigrate } from "@/utils/migration";
import { StorageKeys } from "@/types";
import type {
  Member,
  Candidate,
  QuorumConfig,
  ConfigData,
  ImportResult,
} from "@/types";
import { EventTypes } from "@/types";

export class ElectionApp {
  private static instance: ElectionApp;
  private eventSystem = EventSystem.getInstance();
  private memberManager = MemberManager.getInstance();
  private votingManager = VotingManager.getInstance();
  private attendanceManager = AttendanceManager.getInstance();
  private reportManager = ReportManager.getInstance();
  private isInitialized = false;

  static getInstance(): ElectionApp {
    if (!ElectionApp.instance) {
      ElectionApp.instance = new ElectionApp();
    }
    return ElectionApp.instance;
  }

  // Getter público para o sistema de eventos
  get events(): EventSystem {
    return this.eventSystem;
  }

  async initialize(): Promise<{ success: boolean; error?: string }> {
    if (this.isInitialized) {
      console.log("[ElectionApp] Já inicializado, pulando...");
      return { success: true };
    }

    try {
      console.log("[ElectionApp] Executando migração automática...");
      // Migrar dados antigos para formato unificado
      autoMigrate();

      console.log("[ElectionApp] Configurando listeners de eventos...");
      // Configurar listeners de eventos
      this.setupEventListeners();

      console.log("[ElectionApp] Ativando sincronização em tempo real...");
      // ✅ CORREÇÃO CRÍTICA: Ativar Firebase ANTES de tentar ler dados
      RealtimeSync.getInstance().enable();

      console.log("[ElectionApp] � Sincronizando com Firebase (SSOT)...");
      // ✅ CRÍTICO: SEMPRE sincronizar com Firebase ANTES de renderizar
      // Firebase é Single Source of Truth - dados locais podem estar desatualizados
      await this.syncFromFirebaseBeforeRender();

      console.log(
        "[ElectionApp] 🔍 Verificando configuração de quórum no Firebase..."
      );
      // Verificar config APÓS sync (garante dados atualizados)
      await this.checkQuorumConfiguration();

      console.log("[ElectionApp] Carregando dados iniciais...");
      // Carregar dados iniciais (agora garantidamente atualizados do Firebase)
      await this.loadInitialData();

      console.log("[ElectionApp] Configurando listeners de sincronização...");
      // Configurar listeners de sincronização (Firebase já está ativo)
      this.setupSyncListeners();

      this.isInitialized = true;

      console.log("[ElectionApp] Emitindo evento APP_INITIALIZED...");
      this.eventSystem.emit(EventTypes.APP_INITIALIZED, {
        timestamp: new Date(),
        message: "Sistema inicializado com sucesso",
      });

      console.log("[ElectionApp] ✓ Inicialização completa!");
      console.log(
        `[ElectionApp] 📡 Sincronização: ${RealtimeSync.getInstance().isActive() ? "ATIVA" : "INATIVA"}`
      );

      return { success: true };
    } catch (error) {
      console.error("[ElectionApp] ✗ Erro na inicialização:", error);
      ErrorHandler.log(error as Error, "ElectionApp.initialize");
      return {
        success: false,
        error: "Erro ao inicializar sistema",
      };
    }
  }

  /**
   * Verifica se há configuração de quórum NO FIREBASE.
   * Se não houver, emite evento para abrir modal automaticamente.
   *
   * ⚠️ IMPORTANTE: Verifica APENAS Firebase, ignorando localStorage.
   * Isso garante que modal abre em primeira execução mesmo se
   * houver dados antigos em cache.
   */
  private async checkQuorumConfiguration(): Promise<void> {
    try {
      // ✅ CORREÇÃO: Removido log duplicado (já existe na linha 61-62 do initialize)

      // ✅ CRÍTICO: Verificar APENAS Firebase (fonte da verdade)
      // NÃO verificar localStorage para evitar cache antigo
      const firebaseData = await RealtimeSync.getInstance().loadInitialState();

      const hasFirebaseConfig = !!firebaseData.config;

      if (!hasFirebaseConfig) {
        console.log(
          "[ElectionApp] ⚠️ Nenhuma configuração de quórum no Firebase!"
        );
        console.log(
          "[ElectionApp] 📋 Abrindo modal de configuração automaticamente..."
        );

        // Emitir evento para UI abrir o modal
        this.eventSystem.emit(EventTypes.QUORUM_CONFIG_REQUIRED, {
          reason: "no_config_on_firebase",
          source: "checkQuorum",
        });
      } else {
        console.log(
          "[ElectionApp] ✓ Configuração de quórum encontrada no Firebase:",
          firebaseData.config
        );
      }
    } catch (error) {
      console.error(
        "[ElectionApp] ✗ Erro ao verificar configuração de quórum:",
        error
      );
      ErrorHandler.log(error as Error, "ElectionApp.checkQuorumConfiguration");
    }
  }

  private setupEventListeners(): void {
    // Eventos de membros
    this.eventSystem.on(
      EventTypes.MEMBERS_IMPORTED,
      this.handleMembersImported.bind(this)
    );
    this.eventSystem.on(
      EventTypes.MEMBER_ADDED,
      this.handleMemberAdded.bind(this)
    );
    this.eventSystem.on(
      EventTypes.MEMBER_UPDATED,
      this.handleMemberUpdated.bind(this)
    );

    // Eventos de votação
    this.eventSystem.on(EventTypes.VOTE_CAST, this.handleVoteCast.bind(this));
    this.eventSystem.on(
      EventTypes.CANDIDATE_ADDED,
      this.handleCandidateAdded.bind(this)
    );
    this.eventSystem.on(
      EventTypes.RESULTS_UPDATED,
      this.handleResultsUpdated.bind(this)
    );

    // Eventos de presença
    this.eventSystem.on(
      EventTypes.ATTENDANCE_MARKED,
      this.handleAttendanceMarked.bind(this)
    );
    this.eventSystem.on(
      EventTypes.ATTENDANCE_BULK_UPDATED,
      this.handleBulkAttendanceUpdate.bind(this)
    );

    // Eventos de erro
    this.eventSystem.on(EventTypes.ERROR_OCCURRED, this.handleError.bind(this));
  }

  /**
   * Configurar listeners para sincronização em tempo real (Firebase)
   *
   * ⚠️ IMPORTANTE: Listeners NÃO salvam em localStorage diretamente.
   * O padrão é: Firebase (SSOT) → loadFromStorage() → cache interno dos managers
   */
  private setupSyncListeners(): void {
    // Escutar atualizações de membros vindas do Firebase
    // Agora todos os dados (presença, votos, candidatura) estão centralizados no Member
    this.eventSystem.on(EventTypes.SYNC_MEMBERS_UPDATED, (data: Member[]) => {
      console.log("[ElectionApp] 🔄 Membros atualizados remotamente");

      // ✅ Firebase é SSOT: Salvar no localStorage apenas como cache
      // Managers usam localStorage como cache read-only
      localStorage.setItem(StorageKeys.MEMBERS, JSON.stringify(data));

      // Recarregar managers (eles leem do cache localStorage)
      this.memberManager.loadFromStorage();
      this.attendanceManager.loadFromStorage();
      this.votingManager.loadFromStorage();

      // Emitir eventos para atualizar UI
      this.eventSystem.emit(EventTypes.MEMBERS_IMPORTED, {
        count: data.length,
      });
      this.eventSystem.emit(EventTypes.ATTENDANCE_SAVED, {
        count: data.filter((m) => m.presente).length,
        timestamp: new Date(),
      });
    });

    // Escutar atualizações de configurações vindas do Firebase
    this.eventSystem.on(EventTypes.SYNC_CONFIG_UPDATED, (data: ConfigData) => {
      console.log("[ElectionApp] 🔄 Configurações atualizadas remotamente");

      // ✅ CRÍTICO: Validar se data existe e tem quorum
      if (!data) {
        console.warn(
          "[ElectionApp] ⚠️ ConfigData é undefined, ignorando atualização"
        );
        return;
      }

      // ✅ Firebase é SSOT: Salvar no localStorage apenas como cache
      localStorage.setItem(StorageKeys.CONFIG, JSON.stringify(data));

      // Recarregar manager (ele lê do cache localStorage)
      this.votingManager.loadFromStorage();

      // Emitir evento para atualizar UI (apenas se quorum existir)
      if (data.quorum) {
        this.eventSystem.emit(EventTypes.QUORUM_UPDATED, data.quorum);
      }
    });

    console.log("[ElectionApp] 👂 Listeners de sincronização configurados");
  }

  private async loadInitialData(): Promise<void> {
    try {
      // Carregar dados dos módulos
      await Promise.all([
        this.memberManager.loadFromStorage(),
        this.votingManager.loadFromStorage(),
        this.attendanceManager.loadFromStorage(),
      ]);
    } catch (error) {
      ErrorHandler.log(error as Error, "ElectionApp.loadInitialData");
    }
  }

  /**
   * 🔄 Sincronizar com Firebase ANTES de renderizar (SSOT Pattern).
   *
   * ⚠️ CRÍTICO: Firebase é Single Source of Truth.
   * SEMPRE carregamos dados do Firebase antes de renderizar,
   * garantindo que a UI exibe a versão mais recente dos dados.
   *
   * Fluxo:
   * 1. Carregar dados do Firebase (SSOT)
   * 2. Comparar timestamps (Firebase vs localStorage)
   * 3. Atualizar localStorage se Firebase for mais recente
   * 4. Recarregar managers com dados atualizados
   * 5. Renderizar UI
   */
  private async syncFromFirebaseBeforeRender(): Promise<void> {
    try {
      console.log("[ElectionApp] 📡 Conectando ao Firebase (SSOT)...");

      // 1️⃣ Carregar dados ATUAIS do Firebase
      const firebaseData = await RealtimeSync.getInstance().loadInitialState();

      // 🐛 DEBUG: Verificar o que Firebase retornou
      console.log("[ElectionApp] 🐛 DEBUG firebaseData:", {
        members: firebaseData.members
          ? `${firebaseData.members.length} items`
          : null,
        config: firebaseData.config ? "exists" : null,
        membersType: typeof firebaseData.members,
        configType: typeof firebaseData.config,
      });

      let membersUpdated = false;
      let configUpdated = false;

      // 2️⃣ Sincronizar MEMBROS
      if (firebaseData.members && firebaseData.members.length > 0) {
        const localMembers = localStorage.getItem(StorageKeys.MEMBERS);
        const hasLocalMembers = localMembers && localMembers !== "[]";

        if (!hasLocalMembers) {
          // Caso 1: localStorage vazio → hidratar do Firebase
          console.log(
            `[ElectionApp] 📦 localStorage vazio - hidratando ${firebaseData.members.length} membros do Firebase`
          );
          localStorage.setItem(
            StorageKeys.MEMBERS,
            JSON.stringify(firebaseData.members)
          );
          membersUpdated = true;
        } else {
          // Caso 2: localStorage tem dados → SEMPRE usar Firebase (SSOT)
          console.log(
            `[ElectionApp] 🔄 Sobrescrevendo cache local com ${firebaseData.members.length} membros do Firebase (SSOT)`
          );
          localStorage.setItem(
            StorageKeys.MEMBERS,
            JSON.stringify(firebaseData.members)
          );
          membersUpdated = true;
        }
      } else {
        console.log("[ElectionApp] ℹ️ Firebase não tem membros cadastrados");
      }

      // 3️⃣ Sincronizar CONFIGURAÇÃO
      if (firebaseData.config) {
        const localConfig = localStorage.getItem(StorageKeys.CONFIG);
        const hasLocalConfig =
          localConfig && localConfig !== "undefined" && localConfig !== "null";

        // ✅ CORREÇÃO CRÍTICA: firebaseData.config agora retorna ConfigData completo
        // Estrutura: { quorum: QuorumConfig, system: SystemConfig }
        // Não precisa mais criar wrapper manualmente!

        if (!hasLocalConfig) {
          // Caso 1: localStorage vazio → hidratar do Firebase
          console.log(
            "[ElectionApp] 📦 localStorage vazio - hidratando config do Firebase"
          );
          localStorage.setItem(
            StorageKeys.CONFIG,
            JSON.stringify(firebaseData.config)
          );
          configUpdated = true;
        } else {
          // Caso 2: localStorage tem dados → SEMPRE usar Firebase (SSOT)
          console.log(
            "[ElectionApp] 🔄 Sobrescrevendo cache local com config do Firebase (SSOT)"
          );
          localStorage.setItem(
            StorageKeys.CONFIG,
            JSON.stringify(firebaseData.config)
          );
          configUpdated = true;
        }
      } else {
        console.log("[ElectionApp] ℹ️ Firebase não tem configuração de quórum");

        // ✅ CORREÇÃO: Verificar se localStorage também está vazio
        const localConfig = localStorage.getItem(StorageKeys.CONFIG);
        const hasLocalConfig =
          localConfig && localConfig !== "undefined" && localConfig !== "null";

        if (!hasLocalConfig) {
          // ✅ Nenhuma config no Firebase nem no localStorage
          // Emitir evento para UIManager abrir modal de configuração
          console.log(
            "[ElectionApp] ⚠️ Nenhuma configuração encontrada (Firebase e localStorage vazios)"
          );
          console.log(
            "[ElectionApp] 📋 Emitindo evento QUORUM_CONFIG_REQUIRED..."
          );

          // Emitir evento após um pequeno delay para garantir que UIManager já inicializou
          setTimeout(() => {
            this.eventSystem.emit(EventTypes.QUORUM_CONFIG_REQUIRED, {
              reason: "no_config_found",
              source: "firebase_sync",
            });
          }, 500);
        } else {
          console.log(
            "[ElectionApp] ✓ Config encontrada no localStorage (Firebase sync não necessário)"
          );
        }
      }

      // 4️⃣ Recarregar managers se houver atualizações
      if (membersUpdated) {
        console.log("[ElectionApp] 🔃 Recarregando managers de membros...");
        await this.memberManager.loadFromStorage();
        await this.attendanceManager.loadFromStorage();
        await this.votingManager.loadFromStorage();
      }

      if (configUpdated) {
        console.log("[ElectionApp] 🔃 Recarregando manager de configuração...");
        await this.votingManager.loadFromStorage();
      }

      // 5️⃣ Log final
      if (membersUpdated || configUpdated) {
        console.log(
          "[ElectionApp] ✅ Sincronização completa - dados atualizados do Firebase (SSOT)"
        );
        // Emitir evento para UI
        if (membersUpdated) {
          this.eventSystem.emit(EventTypes.MEMBERS_IMPORTED, {
            count: firebaseData.members?.length || 0,
          });
        }
      } else {
        // ✅ CORREÇÃO: Mensagem mais clara sobre estado real
        const hasFirebaseMembers =
          firebaseData.members && firebaseData.members.length > 0;
        const hasFirebaseConfig = !!firebaseData.config;

        if (!hasFirebaseMembers && !hasFirebaseConfig) {
          console.log(
            "[ElectionApp] ℹ️ Firebase vazio - usando dados do localStorage (se existirem)"
          );
        } else {
          console.log(
            "[ElectionApp] ✅ localStorage já sincronizado com Firebase"
          );
        }
      }
    } catch (error) {
      console.error("[ElectionApp] ✗ Erro ao sincronizar com Firebase:", error);
      ErrorHandler.log(
        error as Error,
        "ElectionApp.syncFromFirebaseBeforeRender"
      );
      // Não bloquear inicialização - continuar com dados locais se Firebase falhar
      console.warn(
        "[ElectionApp] ⚠️ Continuando com dados locais (Firebase indisponível)"
      );
    }
  }

  /**
   * ⚠️ DEPRECADO: Não é mais necessário criar configuração padrão.
   * O sistema agora abre modal automaticamente se não houver config.
   */
  private async setupDefaultQuorum(): Promise<void> {
    try {
      const currentConfig = await this.votingManager.getQuorumConfig();
      if (!currentConfig) {
        const defaultConfig: QuorumConfig = {
          minimumPercentage: 50,
          votesRequiredPercentage: 60,
          presbyteroPositions: 3,
          diaconoPositions: 6,
        };
        await this.votingManager.updateQuorumConfig(defaultConfig);
      }
    } catch (error) {
      ErrorHandler.log(error as Error, "ElectionApp.setupDefaultQuorum");
    }
  }

  // Event handlers
  private handleMembersImported(data: {
    count: number;
    errors?: string[];
  }): void {
    console.log(`${data.count} membros importados`);
    if (data.errors && data.errors.length > 0) {
      console.warn("Erros na importação:", data.errors);
    }
  }

  private handleMemberAdded(member: Member): void {
    console.log(`Membro adicionado: ${member.nome}`);
  }

  private handleMemberUpdated(member: Member): void {
    console.log(`Membro atualizado: ${member.nome}`);
  }

  private handleVoteCast(data: {
    candidateId: string;
    memberId: string;
  }): void {
    console.log(
      `Voto registrado - Candidato: ${data.candidateId}, Membro: ${data.memberId}`
    );
  }

  private handleCandidateAdded(candidate: Candidate): void {
    console.log(`Candidato adicionado: ${candidate.name} (${candidate.role})`);
  }

  private handleResultsUpdated(results: any): void {
    console.log("Resultados atualizados:", results);
  }

  private handleAttendanceMarked(data: {
    memberId: string;
    present: boolean;
    timestamp: Date;
  }): void {
    const status = data.present ? "presente" : "ausente";
    console.log(
      `Presença marcada - Membro: ${data.memberId}, Status: ${status}`
    );
  }

  private handleBulkAttendanceUpdate(data: {
    updated: number;
    errors?: string[];
  }): void {
    console.log(`${data.updated} presenças atualizadas em lote`);
    if (data.errors && data.errors.length > 0) {
      console.warn("Erros na atualização:", data.errors);
    }
  }

  private handleError(error: {
    message: string;
    context?: string;
    timestamp: Date;
  }): void {
    console.error(`Erro no sistema [${error.context}]:`, error.message);
  }

  // Métodos públicos para integração com UI
  async importMembers(csvContent: string): Promise<ImportResult> {
    return await this.memberManager.importFromCSV(csvContent);
  }

  async exportData(): Promise<{
    success: boolean;
    data?: string;
    error?: string;
  }> {
    return await this.reportManager.exportData();
  }

  async importData(
    jsonData: string
  ): Promise<{ success: boolean; error?: string }> {
    return await this.reportManager.importData(jsonData);
  }

  async generateReport(): Promise<{ success: boolean; error?: string }> {
    return await this.reportManager.generatePDFReport();
  }

  async downloadTemplate(): Promise<void> {
    await this.reportManager.downloadCSVTemplate();
  }

  async addMember(
    member: Omit<Member, "id">
  ): Promise<{ success: boolean; member?: Member; error?: string }> {
    return await this.memberManager.addMember(member);
  }

  async updateMember(
    id: string,
    updates: Partial<Member>
  ): Promise<{ success: boolean; member?: Member; error?: string }> {
    return await this.memberManager.updateMember(id, updates);
  }

  async deleteMember(
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    return await this.memberManager.deleteMember(id);
  }

  async getMembers(): Promise<Member[]> {
    return await this.memberManager.getMembers();
  }

  async searchMembers(query: string): Promise<Member[]> {
    return await this.memberManager.searchMembers(query);
  }

  // ❌ REMOVIDOS: addCandidate(), updateCandidate(), removeCandidate()
  // Use MemberManager.updateMember() para manipular status de candidato

  async getCandidates(): Promise<Candidate[]> {
    return await this.votingManager.getCandidates();
  }

  async castVote(
    candidateId: string,
    memberId: string
  ): Promise<{ success: boolean; error?: string }> {
    return await this.votingManager.castVote(candidateId, memberId);
  }

  async removeVote(
    candidateId: string,
    memberId: string
  ): Promise<{ success: boolean; error?: string }> {
    return await this.votingManager.removeVote(candidateId, memberId);
  }

  // 🎥 Métodos para Projeção (sem validação de eleitor)
  async incrementVoteProjection(
    candidateId: string
  ): Promise<{ success: boolean; error?: string }> {
    return await this.votingManager.incrementVoteProjection(candidateId);
  }

  async decrementVoteProjection(
    candidateId: string
  ): Promise<{ success: boolean; error?: string }> {
    return await this.votingManager.decrementVoteProjection(candidateId);
  }

  async resetVotesProjection(
    candidateId: string
  ): Promise<{ success: boolean; error?: string }> {
    return await this.votingManager.resetVotesProjection(candidateId);
  }

  async getElectionResults(): Promise<any> {
    return await this.votingManager.getElectionResults();
  }

  async markAttendance(
    memberId: string,
    present: boolean = true
  ): Promise<{ success: boolean; error?: string }> {
    return await this.attendanceManager.markPresence(memberId, present);
  }

  async toggleAttendance(
    memberId: string
  ): Promise<{ success: boolean; error?: string }> {
    return await this.attendanceManager.togglePresence(memberId);
  }

  async getAttendanceRecords(): Promise<any[]> {
    return await this.attendanceManager.getAttendanceRecords();
  }

  async getAttendanceStats(): Promise<any> {
    return await this.attendanceManager.getAttendanceStats();
  }

  async getPresentMembers(): Promise<Member[]> {
    return await this.attendanceManager.getPresentMembers();
  }

  async getAbsentMembers(): Promise<Member[]> {
    return await this.attendanceManager.getAbsentMembers();
  }

  async markAllPresent(): Promise<{
    success: boolean;
    updated?: number;
    error?: string;
  }> {
    const result = await this.attendanceManager.markAllPresent();
    return {
      success: result.success,
      updated: result.data?.length,
      error: result.error,
    };
  }

  async markAllAbsent(): Promise<{
    success: boolean;
    updated?: number;
    error?: string;
  }> {
    const result = await this.attendanceManager.markAllAbsent();
    return {
      success: result.success,
      updated: result.data?.length,
      error: result.error,
    };
  }

  async updateQuorumConfig(
    config: QuorumConfig
  ): Promise<{ success: boolean; error?: string }> {
    return await this.votingManager.updateQuorumConfig(config);
  }

  async getQuorumConfig(): Promise<QuorumConfig | null> {
    return await this.votingManager.getQuorumConfig();
  }

  async validateData(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Validar membros
      const members = await this.getMembers();
      for (const member of members) {
        if (!Validator.isValidCPF(member.cpf)) {
          errors.push(`CPF inválido para ${member.nome}: ${member.cpf}`);
        }
        if (!Validator.isValidEmail(member.email)) {
          errors.push(`Email inválido para ${member.nome}: ${member.email}`);
        }
      }

      // Validar candidatos
      const candidates = await this.getCandidates();
      for (const candidate of candidates) {
        if (!candidate.name || candidate.name.trim().length === 0) {
          errors.push(`Nome de candidato inválido: ${candidate.name}`);
        }
      }

      // Validar quórum
      const quorumConfig = await this.getQuorumConfig();
      if (!quorumConfig) {
        errors.push("Configuração de quórum não encontrada");
      } else {
        if (
          quorumConfig.minimumPercentage <= 0 ||
          quorumConfig.minimumPercentage > 100
        ) {
          errors.push("Percentual mínimo de quórum deve estar entre 1 e 100");
        }
        if (
          quorumConfig.votesRequiredPercentage <= 0 ||
          quorumConfig.votesRequiredPercentage > 100
        ) {
          errors.push(
            "Percentual de votos necessários deve estar entre 1 e 100"
          );
        }
      }
    } catch (error) {
      ErrorHandler.log(error as Error, "ElectionApp.validateData");
      errors.push("Erro durante validação dos dados");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * FASE 6.3: Resetar eleição (zera votos e presença, mantém membros e candidatos)
   */
  async resetElection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Zerar votos via VotingManager (usa MemberManager internamente)
      const resetResult = await this.votingManager.resetVotes();
      if (!resetResult.success) {
        return resetResult;
      }

      // Limpar presença de todos os membros
      const members = await this.memberManager.getMembers();
      const updatedMembers = members.map((m) => ({
        ...m,
        presente: false,
        horarioChegada: null,
      }));

      localStorage.setItem(StorageKeys.MEMBERS, JSON.stringify(updatedMembers));
      RealtimeSync.getInstance().syncMembers(updatedMembers);

      console.log(
        "[ElectionApp] ✅ Eleição resetada: votos e presença zerados"
      );

      this.eventSystem.emit(EventTypes.APP_RESET, {
        timestamp: new Date(),
        message: "Eleição resetada",
      });

      return { success: true };
    } catch (error) {
      ErrorHandler.log(error as Error, "ElectionApp.resetElection");
      return {
        success: false,
        error: "Erro ao resetar eleição",
      };
    }
  }

  async resetSystem(): Promise<{ success: boolean; error?: string }> {
    try {
      await Promise.all([
        this.memberManager.clearAll(),
        this.votingManager.clearAll(),
        this.attendanceManager.clearAll(),
      ]);

      await this.setupDefaultQuorum();

      this.eventSystem.emit(EventTypes.APP_RESET, {
        timestamp: new Date(),
        message: "Sistema reiniciado",
      });

      return { success: true };
    } catch (error) {
      ErrorHandler.log(error as Error, "ElectionApp.resetSystem");
      return {
        success: false,
        error: "Erro ao reiniciar sistema",
      };
    }
  }

  async clearCandidatesCache(): Promise<void> {
    this.votingManager.clearCache();
  }

  /**
   * FASE 6.5: Verificar integridade dos dados e status do sistema
   */
  async getSystemHealth(): Promise<{
    isHealthy: boolean;
    checks: { name: string; status: "OK" | "ERROR"; message?: string }[];
  }> {
    const checks: { name: string; status: "OK" | "ERROR"; message?: string }[] =
      [];

    try {
      // 1. Verificar localStorage
      const membersData = localStorage.getItem(StorageKeys.MEMBERS);
      if (!membersData) {
        checks.push({
          name: "localStorage MEMBERS",
          status: "ERROR",
          message: "Dados de membros não encontrados",
        });
      } else {
        const members = JSON.parse(membersData);
        checks.push({
          name: "localStorage MEMBERS",
          status: "OK",
          message: `${members.length} membros encontrados`,
        });
      }

      // 2. Verificar Firebase sync
      const firebaseStatus = RealtimeSync.getInstance().isActive();
      checks.push({
        name: "Firebase Sync",
        status: firebaseStatus ? "OK" : "ERROR",
        message: firebaseStatus ? "Ativo" : "Inativo",
      });

      // 3. Verificar integridade de candidatos
      const candidates = await this.memberManager.getCandidatesByRole();
      checks.push({
        name: "Candidatos",
        status: "OK",
        message: `${candidates.length} candidatos registrados`,
      });

      // 4. Verificar soma de votos
      const totalVotes = candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
      const voters = await this.memberManager.getVoters();
      checks.push({
        name: "Votos",
        status: "OK",
        message: `${totalVotes} votos de ${voters.length} eleitores`,
      });

      // 5. Verificar quórum
      const quorumConfig = await this.votingManager.getQuorumConfig();
      if (!quorumConfig) {
        checks.push({
          name: "Quórum",
          status: "ERROR",
          message: "Configuração não encontrada",
        });
      } else {
        checks.push({
          name: "Quórum",
          status: "OK",
          message: `${quorumConfig.minimumPercentage}% mínimo`,
        });
      }

      const isHealthy = checks.every((c) => c.status === "OK");
      return { isHealthy, checks };
    } catch (error) {
      ErrorHandler.log(error as Error, "ElectionApp.getSystemHealth");
      checks.push({
        name: "System",
        status: "ERROR",
        message: "Erro ao verificar integridade",
      });
      return { isHealthy: false, checks };
    }
  }

  destroy(): void {
    this.eventSystem.removeAllListeners();
    this.isInitialized = false;
  }
}

// Instância global da aplicação
export const electionApp = ElectionApp.getInstance();
