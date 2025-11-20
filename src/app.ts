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
      return { success: true };
    }

    try {
      // Migrar dados antigos para formato unificado
      autoMigrate();

      // Configurar listeners de eventos
      this.setupEventListeners();

      // ✅ CORREÇÃO CRÍTICA: Ativar Firebase ANTES de tentar ler dados
      RealtimeSync.getInstance().enable();

      // ✅ CRÍTICO: SEMPRE sincronizar com Firebase ANTES de renderizar
      // Firebase é Single Source of Truth - dados locais podem estar desatualizados
      await this.syncFromFirebaseBeforeRender();

      // Verificar config APÓS sync (garante dados atualizados)
      await this.checkQuorumConfiguration();

      // Carregar dados iniciais (agora garantidamente atualizados do Firebase)
      await this.loadInitialData();

      // Configurar listeners de sincronização (Firebase já está ativo)
      this.setupSyncListeners();

      this.isInitialized = true;

      this.eventSystem.emit(EventTypes.APP_INITIALIZED, {
        timestamp: new Date(),
        message: "Sistema inicializado com sucesso",
      });

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
        // Emitir evento para UI abrir o modal
        this.eventSystem.emit(EventTypes.QUORUM_CONFIG_REQUIRED, {
          reason: "no_config_on_firebase",
          source: "checkQuorum",
        });
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
      console.log("[ElectionApp] 🔄 Sincronizando com Firebase (SSOT)...");

      // 1️⃣ Carregar dados ATUAIS do Firebase (SEMPRE)
      const firebaseData = await RealtimeSync.getInstance().loadInitialState();

      let membersUpdated = false;
      let configUpdated = false;

      // 2️⃣ Sincronizar MEMBROS - Firebase é SEMPRE a fonte da verdade
      if (firebaseData.members && firebaseData.members.length > 0) {
        // SEMPRE sobrescrever localStorage com dados do Firebase
        localStorage.setItem(
          StorageKeys.MEMBERS,
          JSON.stringify(firebaseData.members)
        );
        membersUpdated = true;
        console.log(
          `[ElectionApp] ✅ ${firebaseData.members.length} membros sincronizados do Firebase`
        );
      }

      // 3️⃣ Sincronizar CONFIGURAÇÃO - Firebase é SEMPRE a fonte da verdade
      if (firebaseData.config) {
        // SEMPRE sobrescrever localStorage com dados do Firebase
        localStorage.setItem(
          StorageKeys.CONFIG,
          JSON.stringify(firebaseData.config)
        );
        configUpdated = true;
        console.log("[ElectionApp] ✅ Configuração sincronizada do Firebase");
      } else {
        // ✅ Nenhuma config no Firebase - verificar se localStorage também está vazio
        const localConfig = localStorage.getItem(StorageKeys.CONFIG);
        const hasLocalConfig =
          localConfig && localConfig !== "undefined" && localConfig !== "null";

        if (!hasLocalConfig) {
          // ✅ Nenhuma config no Firebase nem no localStorage
          // Emitir evento para UIManager abrir modal de configuração

          // Emitir evento após um pequeno delay para garantir que UIManager já inicializou
          setTimeout(() => {
            this.eventSystem.emit(EventTypes.QUORUM_CONFIG_REQUIRED, {
              reason: "no_config_found",
              source: "firebase_sync",
            });
          }, 500);
        }
      }

      // 4️⃣ Recarregar managers se houver atualizações
      if (membersUpdated) {
        await this.memberManager.loadFromStorage();
        await this.attendanceManager.loadFromStorage();
        await this.votingManager.loadFromStorage();
      }

      if (configUpdated) {
        await this.votingManager.loadFromStorage();
      }

      // 5️⃣ Emitir eventos se houve atualizações
      if (membersUpdated) {
        this.eventSystem.emit(EventTypes.MEMBERS_IMPORTED, {
          count: firebaseData.members?.length || 0,
        });
      }

      if (!membersUpdated && !configUpdated) {
        console.log(
          "[ElectionApp] ℹ️ Firebase vazio - usando dados locais (se existirem)"
        );
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
    if (data.errors && data.errors.length > 0) {
      console.warn("Erros na importação:", data.errors);
    }
  }

  private handleMemberAdded(_member: Member): void {
    // Membro adicionado com sucesso
  }

  private handleMemberUpdated(_member: Member): void {
    // Membro atualizado com sucesso
  }

  private handleVoteCast(_data: {
    candidateId: string;
    memberId: string;
  }): void {
    // Voto registrado com sucesso
  }

  private handleCandidateAdded(_candidate: Candidate): void {
    // Candidato adicionado com sucesso
  }

  private handleResultsUpdated(_results: any): void {
    // Resultados atualizados
  }

  private handleAttendanceMarked(_data: {
    memberId: string;
    present: boolean;
    timestamp: Date;
  }): void {
    // Presença marcada com sucesso
  }

  private handleBulkAttendanceUpdate(data: {
    updated: number;
    errors?: string[];
  }): void {
    if (data.errors && data.errors.length > 0) {
      console.warn("Erros na atualização em lote:", data.errors);
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
      const candidateMembers = await this.memberManager.getCandidatesByRole();
      checks.push({
        name: "Candidatos",
        status: "OK",
        message: `${candidateMembers.length} candidatos registrados`,
      });

      // 4. Verificar soma de votos (carrega de /candidates/votes/)
      const candidates = await this.votingManager.getCandidates();
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
