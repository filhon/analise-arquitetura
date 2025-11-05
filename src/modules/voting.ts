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
        console.log(
          `[VotingManager.getCandidates] ⚡ Retornando ${cached.length} candidatos do cache (key: ${cacheKey})`
        );
        return cached;
      }

      console.log(
        `[VotingManager.getCandidates] 🔄 Cache vazio, buscando de MEMBERS (key: ${cacheKey})`
      );

      // NOVA IMPLEMENTAÇÃO: Buscar candidatos de MEMBERS
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

      // Converter para formato Candidate (compatibilidade temporária)
      const candidates: Candidate[] = candidateMembers.map((m) => ({
        id: m.id, // Usar ID do membro!
        name: m.nome,
        role: m.candidato,
        photoUrl: m.photoUrl,
        votes: m.votes || 0,
        isElected: m.isElected || false,
      }));

      // Cachear resultado
      this.candidatesCache.set(cacheKey, candidates);

      console.log(
        `[DEBUG VotingManager.getCandidates] ${candidates.length} candidatos carregados de MEMBERS`
      );

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
      console.log("[VotingManager] 🗑️ Limpando cache de candidatos...");
      this.candidatesCache.clear();
      console.log("[VotingManager] ✅ Cache limpo!");

      // 7. Emitir evento
      console.log("[VotingManager] 📡 Emitindo evento VOTE_CAST...");
      this.eventSystem.emit(EventTypes.VOTE_CAST, { candidateId, memberId });

      // 8. Atualizar resultados (debounced)
      console.log("[VotingManager] 📊 Atualizando resultados...");
      this.updateResults();

      // 9. Retornar dados compatíveis (formato antigo)
      const votingData: VotingData = {
        candidateId,
        votes: voteResult.data?.votes || 0,
        lastUpdated: new Date(),
      };

      console.log(
        `[VotingManager] ✅ Voto registrado: ${candidate.nome} agora tem ${votingData.votes} votos`
      );

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

  /**
   * 🎥 PROJEÇÃO: Incrementar voto sem validação de eleitor
   * Usado na tela de projeção onde não há login individual
   */
  async incrementVoteProjection(
    candidateId: string
  ): Promise<AsyncResult<VotingData>> {
    try {
      // 0. Verificar se votação foi encerrada
      if (this.votingClosed) {
        return {
          success: false,
          error: "Votação encerrada",
        };
      }

      console.log(
        "[VotingManager] 🎥 Incrementando voto (projeção):",
        candidateId
      );

      // 1. Validar que candidato existe
      const candidate = await this.memberManager.getMember(candidateId);
      if (!candidate || !candidate.candidato) {
        return {
          success: false,
          error: "Candidato não encontrado",
        };
      }

      // 2. Verificar se votos já atingiram o limite de presentes (ANTES de incrementar)
      const auditManager = (await import("./audit")).AuditManager.getInstance();
      const totalVotes = auditManager.getVotesCount();
      const quorumData = await this.getQuorumData();
      const presentMembers = quorumData.presentMembers;

      if (totalVotes >= presentMembers) {
        // Marcar votação como encerrada
        this.votingClosed = true;
        this.eventSystem.emit(EventTypes.VOTING_CLOSED, {
          totalVotes,
          presentMembers,
        });
        return {
          success: false,
          error: "Votação encerrada - limite de votos atingido",
        };
      }

      // 2. Incrementar votos diretamente (sem validar eleitor)
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

      // 3. Limpar cache
      this.candidatesCache.clear();

      // 4. Emitir evento
      this.eventSystem.emit(EventTypes.VOTE_CAST, {
        candidateId,
        memberId: "projection",
      });

      // 5. Atualizar resultados
      this.updateResults();

      // 6. Retornar dados
      const votingData: VotingData = {
        candidateId,
        votes: voteResult.data?.votes || 0,
        lastUpdated: new Date(),
      };

      console.log(
        `[VotingManager] ✅ Voto incrementado (projeção): ${candidate.nome} = ${votingData.votes} votos`
      );

      return { success: true, data: votingData };
    } catch (error) {
      ErrorHandler.log(error as Error, "VotingManager.incrementVoteProjection");
      return {
        success: false,
        error: "Erro ao incrementar voto",
      };
    }
  }

  /**
   * 🎥 PROJEÇÃO: Decrementar voto sem validação de eleitor
   * Usado na tela de projeção onde não há login individual
   */
  async decrementVoteProjection(
    candidateId: string
  ): Promise<AsyncResult<VotingData | null>> {
    try {
      console.log(
        "[VotingManager] 🎥 Decrementando voto (projeção):",
        candidateId
      );

      // 1. Validar que candidato existe
      const candidate = await this.memberManager.getMember(candidateId);
      if (!candidate || !candidate.candidato) {
        return {
          success: false,
          error: "Candidato não encontrado",
        };
      }

      // 2. Verificar se há votos para remover
      if (!candidate.votes || candidate.votes === 0) {
        return {
          success: false,
          error: "Candidato não possui votos para remover",
        };
      }

      // 3. Decrementar votos diretamente (sem validar eleitor)
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

      // 4. Limpar cache
      this.candidatesCache.clear();

      // 5. Emitir evento
      this.eventSystem.emit(EventTypes.VOTE_CAST, {
        candidateId,
        memberId: "projection",
      });

      // 6. Atualizar resultados
      this.updateResults();

      // 7. Retornar dados
      const votingData: VotingData = {
        candidateId,
        votes: voteResult.data?.votes || 0,
        lastUpdated: new Date(),
      };

      console.log(
        `[VotingManager] ✅ Voto decrementado (projeção): ${candidate.nome} = ${votingData.votes} votos`
      );

      return { success: true, data: votingData };
    } catch (error) {
      ErrorHandler.log(error as Error, "VotingManager.decrementVoteProjection");
      return {
        success: false,
        error: "Erro ao decrementar voto",
      };
    }
  }

  /**
   * 🎥 PROJEÇÃO: Resetar votos sem validação
   * Usado na tela de projeção para zerar contador
   */
  async resetVotesProjection(
    candidateId: string
  ): Promise<AsyncResult<VotingData>> {
    try {
      console.log(
        "[VotingManager] 🎥 Resetando votos (projeção):",
        candidateId
      );

      // 1. Validar que candidato existe
      const candidate = await this.memberManager.getMember(candidateId);
      if (!candidate || !candidate.candidato) {
        return {
          success: false,
          error: "Candidato não encontrado",
        };
      }

      // 2. Obter votos atuais
      const currentVotes = candidate.votes || 0;

      if (currentVotes === 0) {
        return {
          success: true,
          data: {
            candidateId,
            votes: 0,
            lastUpdated: new Date(),
          },
        };
      }

      // 3. Resetar votos (decrementar todos)
      const voteResult = await this.memberManager.updateMemberVotes(
        candidateId,
        -currentVotes
      );
      if (!voteResult.success) {
        return {
          success: false,
          error: voteResult.error || "Erro ao resetar votos",
        };
      }

      // 4. Limpar cache
      this.candidatesCache.clear();

      // 5. Emitir evento
      this.eventSystem.emit(EventTypes.VOTE_CAST, {
        candidateId,
        memberId: "projection",
      });

      // 6. Atualizar resultados
      this.updateResults();

      // 7. Retornar dados
      const votingData: VotingData = {
        candidateId,
        votes: 0,
        lastUpdated: new Date(),
      };

      console.log(
        `[VotingManager] ✅ Votos resetados (projeção): ${candidate.nome} = 0 votos`
      );

      return { success: true, data: votingData };
    } catch (error) {
      ErrorHandler.log(error as Error, "VotingManager.resetVotesProjection");
      return {
        success: false,
        error: "Erro ao resetar votos",
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

      // 2. Verificar se há votos para remover
      if (!candidate.votes || candidate.votes <= 0) {
        return {
          success: false,
          error: "Nenhum voto para remover",
        };
      }

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

      console.log(
        `[VotingManager] ✅ Voto removido: ${candidate.nome} agora tem ${votingData.votes} votos`
      );

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

      console.log("[VotingManager.getQuorumData] Stats recebidos:", stats);

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
   * FASE 3.4: Refatorado para usar Member.votes diretamente (SSOT)
   */
  async getElectionResults(): Promise<ElectionResults> {
    try {
      // Buscar candidatos diretamente do MemberManager (SSOT)
      const [candidateMembers, quorumData] = await Promise.all([
        this.memberManager.getCandidatesByRole(),
        this.getQuorumData(),
      ]);

      // Converter para formato Candidate e ordenar por votos
      // ✅ CRÍTICO: Candidato só é eleito se quórum for VÁLIDO e votos >= votesRequired
      const candidatesWithVotes: Candidate[] = candidateMembers
        .map((m) => ({
          id: m.id,
          name: m.nome,
          role: m.candidato as CandidateRole,
          photoUrl: m.photoUrl,
          votes: m.votes || 0,
          isElected:
            quorumData.isValid && (m.votes || 0) >= quorumData.votesRequired,
        }))
        .sort((a, b) => b.votes - a.votes);

      // Separar por categoria
      const presbyteros = candidatesWithVotes.filter(
        (c) => c.role === "Presbítero"
      );
      const diaconos = candidatesWithVotes.filter((c) => c.role === "Diácono");

      // Calcular total de votos somando Member.votes
      const totalVotes = candidateMembers.reduce(
        (sum, m) => sum + (m.votes || 0),
        0
      );

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
    console.log("[VotingManager] 🧹 Cache de candidatos limpo");
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
   * FASE 3.7: Zerar todos os votos e resetar estado de votação
   */
  async resetVotes(): Promise<{ success: boolean; error?: string }> {
    try {
      const members = await this.memberManager.getMembers();

      const updatedMembers = members.map((m) => ({
        ...m,
        votes: m.candidato ? 0 : m.votes, // Zerar apenas candidatos
        jaVotou: false,
        votedFor: [],
      }));

      // Salvar via MemberManager para garantir sincronização
      localStorage.setItem(StorageKeys.MEMBERS, JSON.stringify(updatedMembers));
      RealtimeSync.getInstance().syncMembers(updatedMembers);

      console.log("[VotingManager] ✅ Todos os votos foram resetados");

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
    console.log("[VotingManager] 🔄 Votação reaberta");
  }

  /**
   * FASE 3.10: Obter estatísticas de votação
   */
  async getVotingStats(): Promise<{
    totalVotes: number;
    voters: number;
    abstentions: number;
    presentMembers: number;
  }> {
    try {
      const [candidateMembers, presentMembers, voters] = await Promise.all([
        this.memberManager.getCandidatesByRole(),
        this.memberManager.getPresentMembers(),
        this.memberManager.getVoters(),
      ]);

      const totalVotes = candidateMembers.reduce(
        (sum, m) => sum + (m.votes || 0),
        0
      );
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
