/**
 * Sistema de Auditoria de Votos
 *
 * Registra todos os votos de forma anônima com:
 * - ID sequencial (0, 1, 2...)
 * - Timestamp de votação
 * - Candidatos selecionados (Presbíteros + Diáconos)
 * - Hash SHA-256 para integridade
 * - Ordem aleatória para preservar anonimato nos relatórios
 *
 * Permite verificação manual e auditoria sem expor identidade dos votantes.
 */

import type { AuditVote } from "@/types";
import { EventTypes, StorageKeys } from "@/types";
import { EventSystem } from "@/utils/events";
import { RealtimeSync } from "@/utils/realtime-sync";
import { MemberManager } from "./members";

export class AuditManager {
  private static instance: AuditManager;
  private eventSystem = EventSystem.getInstance();
  private memberManager = MemberManager.getInstance();
  private votes: AuditVote[] = [];

  static getInstance(): AuditManager {
    if (!AuditManager.instance) {
      AuditManager.instance = new AuditManager();
    }
    return AuditManager.instance;
  }

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Registrar um voto na auditoria
   * @param presbyteros IDs dos candidatos a Presbítero selecionados
   * @param diaconos IDs dos candidatos a Diácono selecionados
   * @returns ID do voto registrado
   */
  async recordVote(presbyteros: string[], diaconos: string[]): Promise<number> {
    const voteId = this.votes.length;
    const timestamp = new Date().toISOString();

    // Gerar hash SHA-256 para integridade
    const hash = await this.generateHash(
      voteId,
      timestamp,
      presbyteros,
      diaconos
    );

    const vote: AuditVote = {
      id: voteId,
      timestamp,
      presbyteros,
      diaconos,
      hash,
    };

    this.votes.push(vote);
    this.saveToStorage();

    console.log(`[AuditManager] ✅ Voto ${voteId} registrado:`, {
      presbyteros: presbyteros.length,
      diaconos: diaconos.length,
      hash: hash.substring(0, 8) + "...",
    });

    // Emitir evento para atualizar UI
    this.eventSystem.emit(EventTypes.VOTE_RECORDED, { voteId });

    return voteId;
  }

  /**
   * Obter contagem total de votos registrados
   */
  getVotesCount(): number {
    return this.votes.length;
  }

  /**
   * Obter todos os votos (sem ordem específica)
   */
  getAllVotes(): AuditVote[] {
    return [...this.votes];
  }

  /**
   * Obter votos aleatorizados (para exibição anônima)
   * Preserva anonimato ao embaralhar a ordem
   */
  getRandomizedVotes(): AuditVote[] {
    const votesWithRandom = this.votes.map((vote) => ({
      ...vote,
      randomOrder: Math.random(),
    }));

    return votesWithRandom.sort(
      (a, b) => (a.randomOrder || 0) - (b.randomOrder || 0)
    );
  }

  /**
   * Obter estatísticas de votação por candidato
   * Retorna: { candidateId: { name: string, role: string, votes: number } }
   */
  async getVoteStatistics(): Promise<
    Record<string, { name: string; role: string; votes: number }>
  > {
    const stats: Record<string, { name: string; role: string; votes: number }> =
      {};
    const members = await this.memberManager.getMembers();
    const membersMap = new Map(members.map((m) => [m.id, m]));

    for (const vote of this.votes) {
      // Contar votos para Presbíteros
      for (const candidateId of vote.presbyteros) {
        if (!stats[candidateId]) {
          const member = membersMap.get(candidateId);
          stats[candidateId] = {
            name: member?.nome || "Desconhecido",
            role: "Presbítero",
            votes: 0,
          };
        }
        stats[candidateId].votes++;
      }

      // Contar votos para Diáconos
      for (const candidateId of vote.diaconos) {
        if (!stats[candidateId]) {
          const member = membersMap.get(candidateId);
          stats[candidateId] = {
            name: member?.nome || "Desconhecido",
            role: "Diácono",
            votes: 0,
          };
        }
        stats[candidateId].votes++;
      }
    }

    return stats;
  }

  /**
   * Validar integridade de todos os votos
   * Retorna true se todos os hashes são válidos
   */
  async validateIntegrity(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const vote of this.votes) {
      const expectedHash = await this.generateHash(
        vote.id,
        vote.timestamp,
        vote.presbyteros,
        vote.diaconos
      );

      if (vote.hash !== expectedHash) {
        errors.push(`Voto ${vote.id}: hash inválido (possível adulteração)`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Exportar dados de auditoria completos
   */
  exportAuditLog(): string {
    return JSON.stringify(
      {
        version: "1.0",
        generatedAt: new Date().toISOString(),
        totalVotes: this.votes.length,
        votes: this.votes,
      },
      null,
      2
    );
  }

  /**
   * Importar dados de auditoria
   */
  importAuditLog(jsonData: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonData);

      if (!data.votes || !Array.isArray(data.votes)) {
        return {
          success: false,
          error: "Formato inválido: votes não encontrado",
        };
      }

      this.votes = data.votes;
      this.saveToStorage();

      console.log(`[AuditManager] ✅ ${this.votes.length} votos importados`);
      return { success: true };
    } catch (error) {
      console.error("[AuditManager] Erro ao importar:", error);
      return { success: false, error: "Erro ao processar arquivo JSON" };
    }
  }

  /**
   * Limpar todos os registros de auditoria
   * ⚠️ ATENÇÃO: Esta ação é irreversível!
   */
  clearAllVotes(): void {
    if (
      confirm(
        "⚠️ ATENÇÃO: Tem certeza que deseja apagar TODOS os registros de auditoria? Esta ação é irreversível!"
      )
    ) {
      this.votes = [];
      this.saveToStorage();
      console.log(
        "[AuditManager] 🗑️ Todos os registros de auditoria foram apagados"
      );
      this.eventSystem.emit(EventTypes.VOTE_RECORDED, { voteId: 0 });
    }
  }

  /**
   * Obter dados estruturados para relatório PDF
   */
  async getReportData(): Promise<{
    totalVotes: number;
    randomizedVotes: AuditVote[];
    statistics: Array<{
      name: string;
      role: string;
      votes: number;
      percentage: string;
    }>;
    integrity: { isValid: boolean; errors: string[] };
  }> {
    const stats = await this.getVoteStatistics();
    const integrity = await this.validateIntegrity();
    const randomizedVotes = this.getRandomizedVotes();

    // Converter stats para array ordenado por votos
    const statisticsArray = Object.entries(stats)
      .map(([_id, data]) => ({
        name: data.name,
        role: data.role,
        votes: data.votes,
        percentage:
          this.votes.length > 0
            ? ((data.votes / this.votes.length) * 100).toFixed(1)
            : "0.0",
      }))
      .sort((a, b) => b.votes - a.votes);

    return {
      totalVotes: this.votes.length,
      randomizedVotes,
      statistics: statisticsArray,
      integrity,
    };
  }

  // ============================================
  // Métodos Privados
  // ============================================

  /**
   * Gerar hash SHA-256 para um voto
   */
  private async generateHash(
    id: number,
    timestamp: string,
    presbyteros: string[],
    diaconos: string[]
  ): Promise<string> {
    const data = JSON.stringify({
      id,
      timestamp,
      presbyteros: presbyteros.sort(),
      diaconos: diaconos.sort(),
    });

    // Usar Web Crypto API para gerar hash SHA-256
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  }

  /**
   * Carregar votos do localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(StorageKeys.AUDIT_LOG);
      if (stored) {
        this.votes = JSON.parse(stored);
        console.log(
          `[AuditManager] 📥 ${this.votes.length} votos carregados do localStorage`
        );
      }
    } catch (error) {
      console.error("[AuditManager] Erro ao carregar votos:", error);
      this.votes = [];
    }
  }

  /**
   * Salvar votos no localStorage e sincronizar com Firebase
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(StorageKeys.AUDIT_LOG, JSON.stringify(this.votes));
      console.log(
        `[AuditManager] 💾 ${this.votes.length} votos salvos no localStorage`
      );

      // Sincronizar com Firebase se estiver ativo
      const realtimeSync = RealtimeSync.getInstance();
      if (realtimeSync.isActive()) {
        const auditLog = this.exportAuditLog();
        realtimeSync.syncAuditLog(auditLog).catch((err) => {
          console.warn(
            "[AuditManager] ⚠️ Erro ao sincronizar audit log com Firebase:",
            err
          );
        });
      }
    } catch (error) {
      console.error("[AuditManager] Erro ao salvar votos:", error);
    }
  }
}
