// Módulo de gerenciamento de candidatos e votação

import type {
  Candidate,
  Member,
  VotingData,
  QuorumConfig,
  ConfigData,
  QuorumData,
  ElectionResults,
  AsyncResult,
  CandidateRole,
} from "@/types";
import { StorageKeys, EventTypes } from "@/types";
import {
  SmartCache,
  debounce,
  ErrorHandler,
  RealtimeSync,
  safeParseJSON,
} from "@/utils";
import { EventSystem } from "@/utils/events";
import { MemberManager } from "./members";

export class VotingManager {
  private static instance: VotingManager;
  private candidatesCache = new SmartCache<Candidate[]>();
  private votesCache = new SmartCache<VotingData[]>();
  private eventSystem = EventSystem.getInstance();
  private memberManager = MemberManager.getInstance();
  private votingClosed = false; // Flag para indicar se votação foi encerrada

  // Debounced update para performance
  private updateResults = debounce(this._updateResults.bind(this), 150);

  static getInstance(): VotingManager {
    if (!VotingManager.instance) {
      VotingManager.instance = new VotingManager();
    }
    return VotingManager.instance;
  }

  async getCandidates(role?: CandidateRole): Promise<Candidate[]> {
    try {
      const cacheKey = role || "all";
      const cached = this.candidatesCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // ✅ REFATORADO: Buscar candidatos de MEMBERS + votos de /candidates/votes/
      const members = await this.memberManager.getMembers();

      // Filtrar membros que são candidatos
      let candidateMembers = members.filter(
        (m): m is Member & { candidato: CandidateRole } =>
          m.candidato !== null && m.candidato !== undefined
      );

      // Filtrar por role se especificado
      if (role) {
        candidateMembers = candidateMembers.filter((m) => m.candidato === role);
      }

      // ✅ NOVO: Carregar votos de /candidates/votes/
      const realtimeSync = RealtimeSync.getInstance();
      const votesMap = await realtimeSync.loadCandidateVotes();

      // Converter para formato Candidate (compatibilidade temporária)
      const candidates: Candidate[] = candidateMembers.map((m) => ({
        id: m.id, // Usar ID do membro!
        name: m.nome,
        role: m.candidato,
        photoUrl: m.photoUrl,
        votes: votesMap.get(m.id) || 0, // ✅ Votos de /candidates/votes/
        isElected: m.isElected || false,
      }));

      // Cachear resultado
      this.candidatesCache.set(cacheKey, candidates);

      return candidates;
    } catch (error) {
      ErrorHandler.log(error as Error, "VotingManager.getCandidates");
      return [];
    }
  }

  // ❌ REMOVIDO: addCandidate()
  // Use: MemberManager.updateMember(memberId, { candidato: "Presbítero" | "Diácono" })

  // ❌ REMOVIDO: updateCandidate()
  // Use: MemberManager.updateMember(memberId, { photoUrl, votes, isElected })

  // ❌ REMOVIDO: removeCandidate()
  // Use: MemberManager.updateMember(memberId, { candidato: null })

  /**
   * FASE 3.3: Refatorado para usar MemberManager como SSOT
   * Agora atualiza Member.votes e Member.jaVotou diretamente
   */
  async castVote(
    candidateId: string,
    memberId: string
  ): Promise<AsyncResult<VotingData>> {
    try {
      // 1. Validar quórum
      const quorumData = await this.getQuorumData();
      if (!quorumData.isValid) {
        return {
          success: false,
          error: `Quórum não atingido. Necessário: ${quorumData.minimumQuorum}, Presente: ${quorumData.presentMembers}`,
        };
      }

      // 2. Validar elegibilidade do eleitor
      const eligibility =
        await this.memberManager.validateVoterEligibility(memberId);
      if (!eligibility.isValid) {
        return {
          success: false,
          error: eligibility.errors.join(", "),
        };
      }

      // 3. Obter e validar candidato
      const candidate = await this.memberManager.getMember(candidateId);
      if (!candidate || !candidate.candidato) {
        return {
          success: false,
          error: "Candidato não encontrado",
        };
      }

      // 4. Incrementar votos do candidato via MemberManager (SSOT)
      const voteResult = await this.memberManager.updateMemberVotes(
        candidateId,
        1
      );
      if (!voteResult.success) {
        return {
          success: false,
          error: voteResult.error || "Erro ao registrar voto",
        };
      }

      // 5. Marcar eleitor como tendo votado via MemberManager (SSOT)
      const voterResult = await this.memberManager.markMemberVoted(memberId, [
        candidateId,
      ]);
      if (!voterResult.success) {
        // Reverter voto do candidato
        await this.memberManager.updateMemberVotes(candidateId, -1);
        return {
          success: false,
          error: voterResult.error || "Erro ao marcar eleitor",
        };
      }

      // 6. Limpar cache de candidatos para forçar reload
      this.candidatesCache.clear();

      // 7. Emitir evento
      this.eventSystem.emit(EventTypes.VOTE_CAST, { candidateId, memberId });

      // 8. Atualizar resultados (debounced)
      this.updateResults();

      // 9. Retornar dados compatíveis (formato antigo)
      const votingData: VotingData = {
        candidateId,
        votes: voteResult.data?.votes || 0,
        lastUpdated: new Date(),
      };

      return {
        success: true,
        data: votingData,
      };
    } catch (error) {
      ErrorHandler.log(error as Error, "VotingManager.castVote");
      return {
        success: false,
        error: "Erro interno ao computar voto",
      };
    }
  }

  async removeVote(
    candidateId: string,
    memberId: string
  ): Promise<AsyncResult<VotingData | null>> {
    try {
      // 1. Obter e validar candidato
      const candidate = await this.memberManager.getMember(candidateId);
      if (!candidate || !candidate.candidato) {
        return {
          success: false,
          error: "Candidato não encontrado",
        };
      }

      // 2. ✅ REFATORADO: Votos agora em /candidates/votes/ (validação feita pelo Firebase)

      // 3. Decrementar votos do candidato via MemberManager (SSOT)
      const voteResult = await this.memberManager.updateMemberVotes(
        candidateId,
        -1
      );
      if (!voteResult.success) {
        return {
          success: false,
          error: voteResult.error || "Erro ao remover voto",
        };
      }

      // 4. Limpar cache de candidatos para forçar reload
      this.candidatesCache.clear();

      // 5. Emitir evento
      this.eventSystem.emit(EventTypes.VOTE_CAST, { candidateId, memberId });

      // 6. Atualizar resultados (debounced)
      this.updateResults();

      // 7. Retornar dados compatíveis (formato antigo)
      const votingData: VotingData = {
        candidateId,
        votes: voteResult.data?.votes || 0,
        lastUpdated: new Date(),
      };

      return {
        success: true,
        data: votingData.votes > 0 ? votingData : null,
      };
    } catch (error) {
      ErrorHandler.log(error as Error, "VotingManager.removeVote");
      return {
        success: false,
        error: "Erro interno ao remover voto",
      };
    }
  }

  async getVotes(): Promise<VotingData[]> {
    try {
      const cached = this.votesCache.get("all-votes");
      if (cached) return cached;

      // ✅ SSOT: Deriva dos votos armazenados em Member.votes
      const candidates = await this.getCandidates();
      const votes: VotingData[] = candidates.map((c: Candidate) => ({
        candidateId: c.id,
        votes: c.votes || 0,
        lastUpdated: new Date(),
      }));

      this.votesCache.set("all-votes", votes);
      return votes;
    } catch (error) {
      ErrorHandler.log(error as Error, "VotingManager.getVotes");
      return [];
    }
  }

  /**
   * Obter configuração de quórum (READ-ONLY do cache).
   *
   * ⚠️ PADRÃO: localStorage é cache read-only do Firebase.
   * Firebase (SSOT) → localStorage (cache) → getQuorumConfig()
   */
  async getQuorumConfig(): Promise<QuorumConfig | null> {
    try {
      // ✅ Ler do cache localStorage (populado pelo Firebase)
      const stored = localStorage.getItem(StorageKeys.CONFIG);
      const parsed = safeParseJSON<ConfigData>(stored);
      if (!parsed) return null;
      return parsed.quorum || null;
    } catch (error) {
      ErrorHandler.log(error as Error, "VotingManager.getQuorumConfig");
      return null;
    }
  }

  /**
   * Atualizar configuração de quórum (Write-Through Cache Pattern).
   *
   * ⚠️ PADRÃO DE ESCRITA:
   * 1. localStorage → cache persistente (cold start)
   * 2. Firebase → SSOT (sincronização multi-dispositivo)
   *
   * ✅ Escrita acontece em ambas as camadas simultaneamente.
   */
  async updateQuorumConfig(
    config: QuorumConfig
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // ✅ Obter config existente do cache
      const stored = localStorage.getItem(StorageKeys.CONFIG);
      const existingConfig: ConfigData = (safeParseJSON<ConfigData>(
        stored
      ) as ConfigData) || { quorum: config };

      // Atualizar apenas quorum, mantendo outras configs
      const configData: ConfigData = { ...existingConfig, quorum: config };

      // 1️⃣ Atualizar cache localStorage
      localStorage.setItem(StorageKeys.CONFIG, JSON.stringify(configData));

      // 2️⃣ Sincronizar com Firebase (SSOT)
      RealtimeSync.getInstance().syncConfig(configData);

      this.eventSystem.emit(EventTypes.QUORUM_UPDATED, config);

      // Atualizar resultados se quórum mudou
      this.updateResults();

      return { success: true };
    } catch (error) {
      ErrorHandler.log(error as Error, "VotingManager.updateQuorumConfig");
      return {
        success: false,
        error: "Erro ao atualizar configuração de quórum",
      };
    }
  }

  async getQuorumData(): Promise<QuorumData> {
    try {
      const config = await this.getQuorumConfig();

      // Se não há config, retornar valores padrão
      if (!config) {
        console.warn(
          "[VotingManager.getQuorumData] ⚠️ Config não encontrada no localStorage"
        );
        console.warn(
          "[VotingManager.getQuorumData] localStorage.CONFIG:",
          localStorage.getItem(StorageKeys.CONFIG)
        );
        return {
          totalMembers: 0,
          presentMembers: 0,
          minimumQuorum: 0,
          votesRequired: 0,
          isValid: false,
        };
      }

      // Importar AttendanceManager para obter dados de presença
      const { AttendanceManager } = await import("./attendance");
      const attendanceManager = AttendanceManager.getInstance();
      const stats = await attendanceManager.getAttendanceStats();

      const totalMembers = stats.totalMembers;
      const presentMembers = stats.presentMembers;
      const minimumQuorum = Math.ceil(
        (totalMembers * config.minimumPercentage) / 100
      );

      // Calcular votos necessários baseado no critério
      let votesRequired: number;
      if (
        config.votesCriteria === "simple-majority" ||
        config.votesRequiredPercentage === -1
      ) {
        // Maioria Simples: 50% + 1 voto
        votesRequired = Math.floor(presentMembers / 2) + 1;
      } else {
        // Percentual personalizado
        votesRequired = Math.ceil(
          (presentMembers * config.votesRequiredPercentage) / 100
        );
      }

      const isValid = presentMembers >= minimumQuorum;

      return {
        totalMembers,
        presentMembers,
        minimumQuorum,
        votesRequired,
        isValid,
      };
    } catch (error) {
      ErrorHandler.log(error as Error, "VotingManager.getQuorumData");
      return {
        totalMembers: 0,
        presentMembers: 0,
        minimumQuorum: 0,
        votesRequired: 0,
        isValid: false,
      };
    }
  }

  /**
   * ✅ REFATORADO: Usa /candidates/votes/ para carregar votos
   */
  async getElectionResults(): Promise<ElectionResults> {
    try {
      // Buscar candidatos usando getCandidates() que já carrega votos de /candidates/votes/
      const [candidates, quorumData] = await Promise.all([
        this.getCandidates(), // ✅ Já inclui votos de /candidates/votes/
        this.getQuorumData(),
      ]);

      // Aplicar lógica de eleição e ordenar por votos
      // ✅ CRÍTICO: Candidato só é eleito se quórum for VÁLIDO e votos >= votesRequired
      const candidatesWithElection: Candidate[] = candidates
        .map((c) => ({
          ...c,
          isElected: quorumData.isValid && c.votes >= quorumData.votesRequired,
        }))
        .sort((a, b) => b.votes - a.votes);

      // Separar por categoria
      const presbyteros = candidatesWithElection.filter(
        (c) => c.role === "Presbítero"
      );
      const diaconos = candidatesWithElection.filter(
        (c) => c.role === "Diácono"
      );

      // Calcular total de votos
      const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

      return {
        presbyteros,
        diaconos,
        totalVotes,
        quorum: quorumData,
        timestamp: new Date(),
      };
    } catch (error) {
      ErrorHandler.log(error as Error, "VotingManager.getElectionResults");
      const defaultQuorum: QuorumData = {
        totalMembers: 0,
        presentMembers: 0,
        minimumQuorum: 0,
        votesRequired: 0,
        isValid: false,
      };

      return {
        presbyteros: [],
        diaconos: [],
        totalVotes: 0,
        quorum: defaultQuorum,
        timestamp: new Date(),
      };
    }
  }

  private async _updateResults(): Promise<void> {
    try {
      const results = await this.getElectionResults();
      this.eventSystem.emit(EventTypes.RESULTS_UPDATED, results);
    } catch (error) {
      ErrorHandler.log(error as Error, "VotingManager._updateResults");
    }
  }

  // ✅ DEPRECATED: Método removido - votos agora estão em Member.votes
  // Sincronização acontece automaticamente via MemberManager.saveMembers()

  // ❌ REMOVIDOS: removeCandidate() e removeCandidateByName()
  // Esses métodos manipulavam o storage obsoleto CANDIDATES
  // Use: MemberManager.updateMember(memberId, { candidato: null })

  async loadFromStorage(): Promise<void> {
    // Já carrega automaticamente via getCandidates() e getVotes()
    await Promise.all([this.getCandidates(), this.getVotes()]);
  }

  clearCache(): void {
    console.trace("[VotingManager] Stack trace do clearCache:");
    this.candidatesCache.clear();
  }

  async clearAll(): Promise<void> {
    // ✅ SSOT: Limpa apenas caches locais
    // MEMBERS e CONFIG são gerenciados por MemberManager
    this.candidatesCache.clear();
    this.votesCache.clear();
  }

  // Métodos utilitários
  async getCandidateById(id: string): Promise<Candidate | null> {
    const candidates = await this.getCandidates();
    return candidates.find((c) => c.id === id) || null;
  }

  async getTotalVotes(): Promise<number> {
    const votes = await this.getVotes();
    return votes.reduce((sum: number, v: VotingData) => sum + v.votes, 0);
  }

  async getElectedCandidates(): Promise<Candidate[]> {
    const results = await this.getElectionResults();
    return [...results.presbyteros, ...results.diaconos].filter(
      (c) => c.isElected
    );
  }

  // ============================================
  // FASE 3 - Novos Métodos SSOT
  // ============================================

  /**
   * ✅ REFATORADO: Zerar votos usando estrutura /candidates/votes/
   */
  async resetVotes(): Promise<{ success: boolean; error?: string }> {
    try {
      const members = await this.memberManager.getMembers();

      // 1. Limpar status de votação dos membros
      const updatedMembers = members.map((m) => ({
        ...m,
        jaVotou: false,
        votedFor: [],
      }));

      // Salvar localmente
      localStorage.setItem(StorageKeys.MEMBERS, JSON.stringify(updatedMembers));

      // ✅ Aguardar sincronização com Firebase
      await RealtimeSync.getInstance().syncMembers(updatedMembers);

      // 2. ✅ NOVO: Zerar contadores de votos em /candidates/votes/
      const realtimeSync = RealtimeSync.getInstance();
      if (realtimeSync.isActive()) {
        const candidateMembers = members.filter((m) => m.candidato);
        for (const member of candidateMembers) {
          await realtimeSync.createCandidateVoteNode(member.id); // Reseta para 0
        }
      }

      // Resetar flag de votação encerrada
      this.votingClosed = false;

      return { success: true };
    } catch (error) {
      ErrorHandler.log(error as Error, "VotingManager.resetVotes");
      return { success: false, error: "Erro ao resetar votos" };
    }
  }

  /**
   * Verificar se a votação foi encerrada (votos = presentes)
   */
  isVotingClosed(): boolean {
    return this.votingClosed;
  }

  /**
   * Resetar flag de votação encerrada (usar ao iniciar nova votação)
   */
  reopenVoting(): void {
    this.votingClosed = false;
  }

  /**
   * ✅ REFATORADO: Usar getCandidates() que carrega de /candidates/votes/
   */
  async getVotingStats(): Promise<{
    totalVotes: number;
    voters: number;
    abstentions: number;
    presentMembers: number;
  }> {
    try {
      const [candidates, presentMembers, voters] = await Promise.all([
        this.getCandidates(), // ✅ Carrega votos de /candidates/votes/
        this.memberManager.getPresentMembers(),
        this.memberManager.getVoters(),
      ]);

      const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
      const votersCount = voters.length;
      const presentCount = presentMembers.filter(
        (m) => m.tipo === "Membro Comungante"
      ).length; // Apenas comungantes podem votar
      const abstentions = presentCount - votersCount;

      return {
        totalVotes,
        voters: votersCount,
        abstentions: Math.max(0, abstentions),
        presentMembers: presentCount,
      };
    } catch (error) {
      ErrorHandler.log(error as Error, "VotingManager.getVotingStats");
      return {
        totalVotes: 0,
        voters: 0,
        abstentions: 0,
        presentMembers: 0,
      };
    }
  }
}
