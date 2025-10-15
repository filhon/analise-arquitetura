// Definições de tipos para o sistema de eleição

export interface Member {
  readonly id: string;
  readonly nome: string;
  readonly tipo?: MemberType;
  readonly cpf?: string;
  readonly rg?: string;
  readonly email?: string;
  readonly telefone?: string;
  readonly dataNascimento?: string; // formato: YYYY-MM-DD
  readonly dataBatismo?: string; // formato: YYYY-MM-DD
  /**
   * Timestamp ISO da última atualização deste registro (SSOT helper)
   * Usado para resolução simples de conflitos e auditoria.
   */
  readonly lastUpdated?: string;

  // Campos de candidatura (só usados se candidato !== null)
  readonly candidato?: CandidateRole | null;
  readonly photoUrl?: string;
  readonly photoThumbUrl?: string;
  readonly votes?: number;
  readonly isElected?: boolean;

  // Campos de presença
  readonly presente?: boolean;
  readonly horarioChegada?: string | null;

  // Campos de votação
  readonly jaVotou?: boolean;
  readonly votedFor?: string[]; // IDs dos candidatos que o membro votou
}

// ============================================
// Type Helpers - Tipos Derivados de Member
// ============================================

/**
 * Membro que é candidato (tem campo candidato preenchido)
 */
export type CandidateMember = Required<Pick<Member, "candidato" | "votes">> &
  Member & {
    candidato: CandidateRole; // override para garantir non-null
  };

/**
 * Membro presente (tem campo presente = true)
 */
export type PresentMember = Required<
  Pick<Member, "presente" | "horarioChegada">
> &
  Member & {
    presente: true; // override para garantir true
  };

/**
 * Membro que já votou (tem campo jaVotou = true)
 */
export type VoterMember = Required<Pick<Member, "jaVotou" | "votedFor">> &
  Member & {
    jaVotou: true; // override para garantir true
  };

/**
 * @deprecated USE CandidateMember type instead
 * Esta interface foi transformada em type alias na Fase 8 da refatoração
 * Mantida como alias apenas para compatibilidade temporária
 */
export type Candidate = {
  readonly id: string;
  readonly name: string;
  readonly role: CandidateRole;
  readonly photoUrl?: string;
  readonly votes: number;
  readonly isElected: boolean;
};

/**
 * @deprecated USE Member.presente, Member.horarioChegada directly
 * AttendanceRecord agora é derivado de Member
 * Esta interface foi transformada em type alias na Fase 8 da refatoração
 * Mantida apenas para compatibilidade temporária
 */
export type AttendanceRecord = {
  readonly memberId: string;
  readonly memberName: string;
  readonly present: boolean;
  readonly arrivalTime: string | null;
  readonly timestamp: Date;
};

/**
 * @deprecated USE Member.votes directly
 * VotingData agora é armazenado em Member.votes
 * Esta interface foi transformada em type alias na Fase 8 da refatoração
 * Mantida apenas para compatibilidade temporária
 */
export type VotingData = {
  readonly candidateId: string;
  readonly votes: number;
  readonly lastUpdated: Date;
};

export interface QuorumConfig {
  readonly minimumPercentage: number;
  readonly votesCriteria?: "simple-majority" | "custom";
  readonly votesRequiredPercentage: number; // -1 para maioria simples
  readonly presbyteroPositions: number;
  readonly diaconoPositions: number;
}

/**
 * ConfigData - Configuração unificada do sistema
 * Armazenada em localStorage.CONFIG e Firebase /config
 */
export interface ConfigData {
  readonly quorum: QuorumConfig;
  readonly system: SystemConfig;
  readonly lastUpdated?: Date;
}

export interface QuorumData {
  readonly totalMembers: number;
  readonly presentMembers: number;
  readonly minimumQuorum: number;
  readonly votesRequired: number;
  readonly isValid: boolean;
}

export interface ElectionResults {
  readonly presbyteros: Candidate[];
  readonly diaconos: Candidate[];
  readonly totalVotes: number;
  readonly quorum: QuorumData;
  readonly timestamp: Date;
}

export interface SystemConfig {
  readonly version: string;
  readonly maxCandidates: number;
  readonly batchSize: number;
  readonly cacheTimeout: number;
  readonly autosaveInterval: number;
}

export interface ImportResult {
  readonly success: boolean;
  readonly totalProcessed: number;
  readonly membersAdded: number;
  readonly candidatesAdded: number;
  readonly errors: string[];
}

/**
 * FASE 8: ExportData simplificado usando SSOT
 * Members contém todos os dados (candidatura, votos, presença)
 *
 * Observação: este payload é usado para exportação/backup e precisa ser
 * serializável para JSON. Por isso `exportDate` é armazenado como string
 * ISO (YYYY-MM-DDTHH:mm:ss.sssZ). O campo `results` é opcional para
 * permitir exports parciais onde os resultados podem ser recalculados pelo
 * importador. `source` identifica a origem do export (ex: 'SSOT' ou nome da
 * ferramenta).
 */
export interface ExportData {
  readonly members: Member[]; // ✅ SSOT - contém tudo
  readonly config: ConfigData; // ✅ Configurações do sistema
  readonly quorum: QuorumData; // Status do quórum no momento do export
  readonly results?: ElectionResults; // Resultados calculados (opcional)
  readonly exportDate: string; // ISO string (ex: new Date().toISOString())
  readonly version: string;
  readonly source?: string; // opcional - origem do export
}

// Enums
export type CandidateRole = "Presbítero" | "Diácono";
export type MemberType =
  | "Membro Comungante"
  | "Membro Não-Comungante"
  | "Visitante";

/**
 * FASE 8: StorageKeys limpos - apenas SSOT
 * Removidos: CANDIDATES, VOTES, ATTENDANCE, QUORUM (deprecated)
 */
export enum StorageKeys {
  MEMBERS = "MEMBERS", // ✅ SSOT - Single Source of Truth
  CONFIG = "CONFIG", // ✅ System configuration (quorum + system settings)
}

export enum EventTypes {
  // Members
  MEMBER_ADDED = "members:added",
  MEMBER_UPDATED = "members:updated",
  MEMBER_DELETED = "members:deleted",
  MEMBERS_IMPORTED = "members:imported",

  // Candidates
  CANDIDATE_ADDED = "candidate:added",

  // Voting
  VOTE_CAST = "vote:cast",
  RESULTS_UPDATED = "results:updated",

  // Attendance
  ATTENDANCE_MARKED = "attendance:marked",
  ATTENDANCE_BULK_UPDATED = "attendance:bulk-updated",
  ATTENDANCE_SAVED = "attendance:saved",

  // System
  QUORUM_UPDATED = "quorum:updated",
  QUORUM_CONFIG_REQUIRED = "quorum:config:required", // Nenhuma configuração encontrada
  ERROR_OCCURRED = "error:occurred",
  APP_INITIALIZED = "app:initialized",
  APP_RESET = "app:reset",

  // Real-time Sync (Firebase) - Arquitetura Centralizada
  SYNC_MEMBERS_UPDATED = "sync:members:updated", // Inclui dados pessoais, presença, candidatura, votos
  SYNC_CONFIG_UPDATED = "sync:config:updated", // Configurações do sistema (quórum, etc)
}

// Types utilitários
export type CacheEntry<T> = {
  readonly data: T;
  readonly timestamp: Date;
  readonly ttl: number;
};

export type ValidationResult = {
  readonly isValid: boolean;
  readonly errors: string[];
};

export type AsyncResult<T> = Promise<{
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}>;

// Event handlers
export type EventHandler<T = any> = (data: T) => void | Promise<void>;

export type EventMap = {
  [EventTypes.MEMBER_ADDED]: Member;
  [EventTypes.MEMBER_UPDATED]: Member;
  [EventTypes.MEMBER_DELETED]: string;
  [EventTypes.MEMBERS_IMPORTED]: { count: number; errors?: string[] };
  [EventTypes.CANDIDATE_ADDED]: Candidate;
  [EventTypes.VOTE_CAST]: { candidateId: string; memberId: string };
  [EventTypes.RESULTS_UPDATED]: ElectionResults;
  [EventTypes.ATTENDANCE_MARKED]: {
    memberId: string;
    present: boolean;
    timestamp: Date;
  };
  [EventTypes.ATTENDANCE_BULK_UPDATED]: { updated: number; errors?: string[] };
  [EventTypes.ATTENDANCE_SAVED]: { count: number; timestamp: Date };
  [EventTypes.QUORUM_UPDATED]: QuorumConfig;
  [EventTypes.QUORUM_CONFIG_REQUIRED]: {
    reason: string;
    source: string;
  };
  [EventTypes.ERROR_OCCURRED]: {
    message: string;
    context?: string;
    timestamp: Date;
  };
  [EventTypes.APP_INITIALIZED]: { timestamp: Date; message: string };
  [EventTypes.APP_RESET]: { timestamp: Date; message: string };
  // Real-time Sync Events (centralized in Member)
  [EventTypes.SYNC_MEMBERS_UPDATED]: Member[];
  [EventTypes.SYNC_CONFIG_UPDATED]: ConfigData;
};

// ============================================
// FASE 8: Helper Functions - Conversão para compatibilidade
// ============================================

/**
 * Converter Member para formato Candidate (compatibilidade UI)
 */
export function memberToCandidate(member: Member): Candidate | null {
  if (!member.candidato) return null;

  return {
    id: member.id,
    name: member.nome,
    role: member.candidato,
    photoUrl: member.photoUrl,
    votes: member.votes || 0,
    isElected: member.isElected || false,
  };
}

/**
 * Converter Member para formato AttendanceRecord (compatibilidade UI)
 */
export function memberToAttendanceRecord(member: Member): AttendanceRecord {
  return {
    memberId: member.id,
    memberName: member.nome,
    present: member.presente || false,
    arrivalTime: member.horarioChegada || null,
    timestamp: member.horarioChegada
      ? new Date(member.horarioChegada)
      : new Date(),
  };
}

/**
 * Converter array de Members para Candidates
 */
export function membersToCandidates(members: Member[]): Candidate[] {
  return members
    .map(memberToCandidate)
    .filter((c): c is Candidate => c !== null);
}

/**
 * Converter array de Members para AttendanceRecords
 */
export function membersToAttendanceRecords(
  members: Member[]
): AttendanceRecord[] {
  return members.map(memberToAttendanceRecord);
}
