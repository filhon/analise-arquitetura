// Módulo de gerenciamento de membros

import type {
  Member,
  ImportResult,
  AsyncResult,
  ValidationResult,
  CandidateRole,
} from "@/types";
import { StorageKeys, EventTypes } from "@/types";
import {
  SmartCache,
  Validator,
  Formatter,
  generateId,
  ErrorHandler,
  RealtimeSync,
  safeParseJSON,
} from "@/utils";
import { uploadImage, deleteFileByUrl } from "@/utils/storage";
import { EventSystem } from "@/utils/events";
import { DebugLogger } from "@/config/debug";

export class MemberManager {
  private static instance: MemberManager;
  private cache = new SmartCache<Member[]>();
  private eventSystem = EventSystem.getInstance();

  static getInstance(): MemberManager {
    if (!MemberManager.instance) {
      MemberManager.instance = new MemberManager();
    }
    return MemberManager.instance;
  }

  /**
   * Obter todos os membros.
   *
   * ⚠️ PADRÃO DE CACHE:
   * 1. Memory Cache (performance) → retorno imediato se existir
   * 2. localStorage (cache do Firebase) → read-only
   * 3. Firebase é SSOT (Single Source of Truth)
   *
   * ✅ localStorage aqui é READ-ONLY cache do Firebase.
   * Escrita acontece apenas via saveMembers() que sincroniza com Firebase.
   */
  async getMembers(): Promise<Member[]> {
    try {
      // 1️⃣ Tentar memory cache primeiro (mais rápido)
      const cached = this.cache.get("all-members");
      if (cached) return cached;

      // 2️⃣ Carregar do localStorage (cache do Firebase)
      const stored = localStorage.getItem(StorageKeys.MEMBERS);
      // ✅ Use safeParseJSON to avoid throwing on malformed localStorage
      const members =
        (safeParseJSON<Member[]>(stored) as Member[] | null) || [];

      // 3️⃣ Atualizar memory cache
      this.cache.set("all-members", members);

      return members;
    } catch (error) {
      ErrorHandler.log(error as Error, "MemberManager.getMembers");
      return [];
    }
  }

  async getMember(id: string): Promise<Member | null> {
    try {
      const members = await this.getMembers();
      return members.find((m) => m.id === id) || null;
    } catch (error) {
      ErrorHandler.log(error as Error, "MemberManager.getMember");
      return null;
    }
  }

  async addMember(
    memberData: Omit<Member, "id">
  ): Promise<AsyncResult<Member>> {
    try {
      // Validar dados
      const validation = this.validateMember(memberData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(", "),
        };
      }

      // Validação: Apenas Membros Comungantes podem ser candidatos
      if (memberData.candidato && memberData.candidato !== null) {
        if (memberData.tipo !== "Membro Comungante") {
          return {
            success: false,
            error:
              "Apenas Membros Comungantes podem ser candidatos a Presbítero ou Diácono",
          };
        }
      }

      const members = await this.getMembers();

      // Verificar duplicatas
      const duplicate = members.find(
        (m) =>
          m.nome === memberData.nome ||
          (memberData.cpf && m.cpf === memberData.cpf)
      );

      if (duplicate) {
        return {
          success: false,
          error: "Membro já existe",
        };
      }

      const newMember: Member = {
        id: generateId(),
        ...memberData,
        cpf: memberData.cpf ? Formatter.cpf(memberData.cpf) : undefined,
        rg: memberData.rg ? Formatter.rg(memberData.rg) : undefined,
        telefone: memberData.telefone
          ? Formatter.phone(memberData.telefone)
          : undefined,
      };

      // ✅ CRÍTICO: Limpar cache ANTES de salvar (se for candidato)
      if (
        newMember.candidato &&
        (newMember.candidato === "Presbítero" ||
          newMember.candidato === "Diácono")
      ) {
        try {
          const { VotingManager } = await import("./voting");
          const votingManager = VotingManager.getInstance();
          votingManager.clearCache();
          console.log(
            "[MemberManager] ✅ Cache limpo ANTES de adicionar (candidato detectado)"
          );
        } catch (error) {
          ErrorHandler.log(
            error as Error,
            "MemberManager.addMember - limpar cache"
          );
        }
      }

      const updatedMembers = [...members, newMember];
      await this.saveMembers(updatedMembers);

      // Emitir evento (cache já limpo se for candidato)
      this.eventSystem.emit(EventTypes.MEMBER_ADDED, newMember);

      console.log(
        `[MemberManager] ✅ Membro adicionado e evento emitido: ${newMember.nome}`
      );

      // Marcar não-comungantes e visitantes como presentes automaticamente
      // (Eles não contam para quórum, apenas para registro em ata)
      if (
        newMember.tipo === "Visitante" ||
        newMember.tipo === "Membro Não-Comungante"
      ) {
        try {
          const { AttendanceManager } = await import("./attendance");
          const attendanceManager = AttendanceManager.getInstance();

          await attendanceManager.markPresence(newMember.id, true);
        } catch (error) {
          // Log do erro mas não falha a adição do membro
          ErrorHandler.log(
            error as Error,
            "MemberManager.addMember.markNonVotingMemberPresent"
          );
        }
      }

      return {
        success: true,
        data: newMember,
      };
    } catch (error) {
      ErrorHandler.log(error as Error, "MemberManager.addMember");
      return {
        success: false,
        error: "Erro interno ao adicionar membro",
      };
    }
  }

  async importFromCSV(csvContent: string): Promise<ImportResult> {
    try {
      const lines = csvContent.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      let membersAdded = 0;
      let candidatesAdded = 0;
      const errors: string[] = [];

      // Validar headers obrigatórios
      if (!headers.includes("nome")) {
        return {
          success: false,
          totalProcessed: lines.length - 1,
          membersAdded: 0,
          candidatesAdded: 0,
          errors: ['Header "nome" é obrigatório'],
        };
      }

      const members = await this.getMembers();
      const newMembers: Member[] = [];

      DebugLogger.log(
        "CSV_IMPORT",
        "[CSV Import] Total de linhas:",
        lines.length
      );
      DebugLogger.log("CSV_IMPORT", "[CSV Import] Headers:", headers);

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i]);
          DebugLogger.log("CSV_IMPORT", `[CSV Import] Linha ${i}:`, values);

          const memberData = this.mapCSVToMember(headers, values);
          DebugLogger.log(
            "CSV_IMPORT",
            `[CSV Import] Membro mapeado ${i}:`,
            memberData
          );

          // Validar membro
          const validation = this.validateMember(memberData);
          if (!validation.isValid) {
            DebugLogger.warn(
              "CSV_IMPORT",
              `[CSV Import] Validação falhou linha ${i + 1}:`,
              validation.errors
            );
            errors.push(`Linha ${i + 1}: ${validation.errors.join(", ")}`);
            continue;
          }

          // Verificar duplicata (normalizar CPF removendo formatação)
          const normalizeCPF = (cpf?: string) => cpf?.replace(/\D/g, "") || "";
          const memberCPF = normalizeCPF(memberData.cpf);

          const isDuplicate =
            members.some(
              (m) =>
                m.nome.toLowerCase() === memberData.nome.toLowerCase() ||
                (memberCPF && normalizeCPF(m.cpf) === memberCPF)
            ) ||
            newMembers.some(
              (m) =>
                m.nome.toLowerCase() === memberData.nome.toLowerCase() ||
                (memberCPF && normalizeCPF(m.cpf) === memberCPF)
            );

          if (isDuplicate) {
            console.warn(`[CSV Import] Duplicata detectada linha ${i + 1}`);
            errors.push(`Linha ${i + 1}: Membro já existe`);
            continue;
          }

          const member: Member = {
            id: generateId(),
            ...memberData,
            cpf: memberData.cpf ? Formatter.cpf(memberData.cpf) : undefined,
            rg: memberData.rg ? Formatter.rg(memberData.rg) : undefined,
            telefone: memberData.telefone
              ? Formatter.phone(memberData.telefone)
              : undefined,
          };

          console.log(`[CSV Import] Membro criado linha ${i}:`, member);
          newMembers.push(member);
          membersAdded++;

          if (member.candidato) {
            console.log(
              `[CSV Import] Membro é candidato:`,
              member.nome,
              member.candidato
            );
            candidatesAdded++;
          }
        } catch (error) {
          console.error(
            `[CSV Import] Erro ao processar linha ${i + 1}:`,
            error
          );
          errors.push(`Linha ${i + 1}: Erro ao processar dados`);
        }
      }

      if (newMembers.length > 0) {
        const allMembers = [...members, ...newMembers];
        await this.saveMembers(allMembers);

        // Emitir eventos para novos membros
        newMembers.forEach((member) => {
          this.eventSystem.emit(EventTypes.MEMBER_ADDED, member);
        });

        // Criar candidatos automaticamente para membros com campo candidato preenchido
        const { VotingManager } = await import("./voting");
        const votingManager = VotingManager.getInstance();

        const candidateCount = newMembers.filter(
          (m) =>
            m.candidato &&
            (m.candidato === "Presbítero" || m.candidato === "Diácono")
        ).length;

        if (candidateCount > 0) {
          votingManager.clearCache();
        }

        // Marcar não-comungantes e visitantes como presentes automaticamente
        const { AttendanceManager } = await import("./attendance");
        const attendanceManager = AttendanceManager.getInstance();

        for (const member of newMembers) {
          if (
            member.tipo === "Visitante" ||
            member.tipo === "Membro Não-Comungante"
          ) {
            try {
              await attendanceManager.markPresence(member.id, true);
            } catch (error) {
              console.error(
                `[CSV Import] Erro ao marcar membro ${member.nome}:`,
                error
              );
            }
          }
        }
      }

      return {
        success: true,
        totalProcessed: lines.length - 1,
        membersAdded,
        candidatesAdded,
        errors,
      };
    } catch (error) {
      ErrorHandler.log(error as Error, "MemberManager.importFromCSV");
      return {
        success: false,
        totalProcessed: 0,
        membersAdded: 0,
        candidatesAdded: 0,
        errors: ["Erro interno na importação"],
      };
    }
  }

  private validateMember(member: Omit<Member, "id">): ValidationResult {
    // Exigir nome e tipo obrigatórios
    const validations = [
      Validator.required(member.nome),
      Validator.required(member.tipo),
    ];

    console.log(`[CSV Import] Validando membro:`, {
      nome: member.nome,
      cpf: member.cpf,
      email: member.email,
      hasCpf: !!member.cpf,
      hasEmail: !!member.email,
    });

    // Validar que apenas Membros Comungantes podem ser candidatos
    if (member.candidato && member.tipo !== "Membro Comungante") {
      return {
        isValid: false,
        errors: ["Apenas Membros Comungantes podem ser candidatos"],
      };
    }

    if (member.cpf && member.cpf.trim() !== "") {
      const cpfValidation = Validator.cpf(member.cpf);
      console.log(`[CSV Import] Validação CPF "${member.cpf}":`, cpfValidation);
      validations.push(cpfValidation);
    }

    if (member.email && member.email.trim() !== "") {
      const emailValidation = Validator.email(member.email);
      console.log(
        `[CSV Import] Validação Email "${member.email}":`,
        emailValidation
      );
      validations.push(emailValidation);
    }

    const result = Validator.combine(...validations);
    console.log(`[CSV Import] Resultado validação final:`, result);
    return result;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
        // Não adicionar as aspas ao valor
        continue;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private mapCSVToMember(
    headers: string[],
    values: string[]
  ): Omit<Member, "id"> {
    const memberData: any = {};

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || "";

      switch (header) {
        case "nome":
          memberData.nome = value;
          break;
        case "tipo":
          // Só adicionar tipo se não for vazio
          if (value) {
            memberData.tipo = value;
          }
          break;
        case "cpf":
          // Só adicionar CPF se não for vazio
          if (value) {
            memberData.cpf = value;
          }
          break;
        case "rg":
          // Só adicionar RG se não for vazio
          if (value) {
            memberData.rg = value;
          }
          break;
        case "candidato":
          // Só adicionar candidato se não for vazio
          if (value) {
            memberData.candidato = value;
          }
          break;
        case "email":
          // Só adicionar email se não for vazio
          if (value) {
            memberData.email = value;
          }
          break;
        case "telefone":
          // Só adicionar telefone se não for vazio
          if (value) {
            memberData.telefone = value;
          }
          break;
      }
    });

    return memberData;
  }

  /**
   * Salvar membros (Write-Through Cache Pattern).
   *
   * ⚠️ PADRÃO DE ESCRITA:
   * 1. Memory Cache → atualização imediata (UI responsiva)
   * 2. localStorage → cache persistente (cold start)
   * 3. Firebase → SSOT (sincronização multi-dispositivo)
   *
   * ✅ Escrita acontece em TODAS as 3 camadas simultaneamente.
   * Não remover localStorage aqui - necessário para cache de leitura.
   */
  private async saveMembers(members: Member[]): Promise<void> {
    const now = new Date().toISOString();
    const cleanMember = (m: any) => {
      const obj: any = { ...m, lastUpdated: now };
      Object.keys(obj).forEach((k) => {
        if (obj[k] === undefined) delete obj[k];
      });
      return obj;
    };
    const membersWithTimestamps = members.map(cleanMember);

    // 1️⃣ Atualizar memory cache (UI imediata)
    this.cache.set("all-members", membersWithTimestamps);

    // 2️⃣ Atualizar localStorage (cache persistente)
    localStorage.setItem(
      StorageKeys.MEMBERS,
      JSON.stringify(membersWithTimestamps)
    );

    // 3️⃣ Sincronizar com Firebase (SSOT)
    RealtimeSync.getInstance().syncMembers(membersWithTimestamps as any);
  }

  async updateMember(
    id: string,
    updates: Partial<Member>
  ): Promise<AsyncResult<Member>> {
    try {
      const members = await this.getMembers();
      const index = members.findIndex((m) => m.id === id);

      if (index === -1) {
        return {
          success: false,
          error: "Membro não encontrado",
        };
      }

      const oldMember = members[index];

      // Validação: Apenas Membros Comungantes podem ser candidatos
      if (updates.candidato && updates.candidato !== null) {
        const finalType = updates.tipo || oldMember.tipo;
        if (finalType !== "Membro Comungante") {
          return {
            success: false,
            error:
              "Apenas Membros Comungantes podem ser candidatos a Presbítero ou Diácono",
          };
        }
      }

      // Tratamento especial para photoUrl: se o caller passou uma data URL (base64),
      // tentar fazer upload para Storage e substituir por URL pública.
      const processedUpdates: any = { ...updates };
      try {
        if (updates.photoUrl && typeof updates.photoUrl === "string") {
          const val = updates.photoUrl;
          if (val.startsWith("data:")) {
            // Converter dataURL para Blob
            const blob = ((): Blob | null => {
              try {
                const arr = val.split(",");
                const mime =
                  arr[0].match(/data:(.*);base64/)?.[1] || "image/png";
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                  u8arr[n] = bstr.charCodeAt(n);
                }
                return new Blob([u8arr], { type: mime });
              } catch (err) {
                console.warn("Falha ao converter dataURL para Blob:", err);
                return null;
              }
            })();

            if (blob instanceof Blob) {
              try {
                const url = await uploadImage(
                  new File([blob], `upload_${Date.now()}.png`)
                );
                processedUpdates.photoUrl = url;
                console.log(
                  "[MemberManager] Foto enviada para Storage durante updateMember"
                );
              } catch (err) {
                console.warn(
                  "[MemberManager] Upload para Storage falhou, mantendo base64:",
                  err
                );
                // mantemos processedUpdates.photoUrl = original base64 (updates.photoUrl)
                processedUpdates.photoUrl = val;
              }
            }
          }
        }
      } catch (err) {
        console.warn("[MemberManager] Erro ao processar photoUrl:", err);
      }

      let updatedMember: Member = {
        ...oldMember,
        ...processedUpdates,
        id, // Não permite alterar o ID
      };

      const updatedMembers = [...members];
      updatedMembers[index] = updatedMember;

      // ✅ CRÍTICO: Limpar cache ANTES de salvar e emitir evento
      // Garante que quando o evento for processado, o cache já estará limpo
      const oldCandidato = oldMember.candidato;
      const newCandidato = updatedMember.candidato;
      const isOrWasCandidate = oldCandidato || newCandidato;

      if (isOrWasCandidate) {
        try {
          const { VotingManager } = await import("./voting");
          const votingManager = VotingManager.getInstance();
          votingManager.clearCache();
          console.log(
            "[MemberManager] ✅ Cache limpo ANTES de salvar (candidato detectado)"
          );
        } catch (error) {
          ErrorHandler.log(
            error as Error,
            "MemberManager.updateMember - limpar cache"
          );
        }
      }

      // Se o caller solicitou remoção de photoUrl (string vazia), e o membro antigo
      // possuía uma URL do Storage, tentamos excluir o arquivo (best-effort)
      try {
        if (processedUpdates.photoUrl === "") {
          const oldPhoto = oldMember.photoUrl;
          if (
            oldPhoto &&
            (oldPhoto.startsWith("https://firebasestorage.googleapis.com") ||
              oldPhoto.startsWith("gs://"))
          ) {
            await deleteFileByUrl(oldPhoto).catch((err) =>
              console.warn(
                "Falha ao excluir arquivo no Storage during updateMember:",
                err
              )
            );
          }

          // Criar um novo objeto sem photoUrl
          const newMember: any = { ...updatedMember } as any;
          delete newMember.photoUrl;
          updatedMember = newMember as Member;
          updatedMembers[index] = updatedMember;
        }
      } catch (err) {
        console.warn(
          "[MemberManager] Erro ao tentar remover arquivo do Storage:",
          err
        );
      }

      // Agora sim, salvar
      await this.saveMembers(updatedMembers);

      // Emitir evento (listeners verão dados atualizados e cache limpo)
      this.eventSystem.emit(EventTypes.MEMBER_UPDATED, updatedMember);

      console.log(
        `[MemberManager] ✅ Membro atualizado e evento emitido: ${updatedMember.nome}`
      );

      return {
        success: true,
        data: updatedMember,
      };
    } catch (error) {
      ErrorHandler.log(error as Error, "MemberManager.updateMember");
      return {
        success: false,
        error: "Erro interno ao atualizar membro",
      };
    }
  }

  async deleteMember(id: string): Promise<AsyncResult<void>> {
    try {
      const members = await this.getMembers();
      const memberToDelete = members.find((m) => m.id === id);
      const updatedMembers = members.filter((m) => m.id !== id);

      if (members.length === updatedMembers.length) {
        return {
          success: false,
          error: "Membro não encontrado",
        };
      }

      // ✅ CRÍTICO: Limpar cache ANTES de salvar (se for candidato)
      if (memberToDelete?.candidato) {
        try {
          const { VotingManager } = await import("./voting");
          const votingManager = VotingManager.getInstance();
          votingManager.clearCache();
          console.log(
            "[MemberManager] ✅ Cache limpo ANTES de deletar (candidato detectado)"
          );
        } catch (votingError) {
          ErrorHandler.log(
            votingError as Error,
            "MemberManager.deleteMember - limpar cache"
          );
        }
      }

      await this.saveMembers(updatedMembers);

      // Se o membro tinha uma foto armazenada no Firebase Storage, tentar remover o arquivo (best-effort)
      try {
        const photo = memberToDelete?.photoUrl;
        if (
          photo &&
          (photo.startsWith("https://firebasestorage.googleapis.com") ||
            photo.startsWith("gs://"))
        ) {
          await deleteFileByUrl(photo).catch((err) =>
            console.warn(
              "Falha ao excluir arquivo do Storage durante deleteMember:",
              err
            )
          );
        }
      } catch (err) {
        console.warn(
          "[MemberManager] Erro ao tentar deletar arquivo do Storage:",
          err
        );
      }

      // Remover registro de presença do membro
      try {
        const { AttendanceManager } = await import("./attendance");
        const attendanceManager = AttendanceManager.getInstance();
        await attendanceManager.removeMemberAttendance(id);
      } catch (attendanceError) {
        ErrorHandler.log(
          attendanceError as Error,
          "MemberManager.deleteMember - remover presença"
        );
        // Não falha a operação se falhar a remoção da presença
      }

      // Emitir evento (cache já limpo)
      this.eventSystem.emit(EventTypes.MEMBER_DELETED, id);

      console.log(
        `[MemberManager] ✅ Membro deletado e evento emitido: ${memberToDelete?.nome || id}`
      );

      return {
        success: true,
      };
    } catch (error) {
      ErrorHandler.log(error as Error, "MemberManager.deleteMember");
      return {
        success: false,
        error: "Erro interno ao deletar membro",
      };
    }
  }

  async loadFromStorage(): Promise<void> {
    // ✅ CRÍTICO: Limpar cache antes de recarregar do localStorage
    // Isso garante que getMembers() vai buscar dados atualizados
    this.cache.clear();
    await this.getMembers();
  }

  async clearAll(): Promise<void> {
    localStorage.removeItem(StorageKeys.MEMBERS);
    this.cache.clear();
  }

  // Métodos utilitários
  async getMemberCount(): Promise<number> {
    const members = await this.getMembers();
    return members.length;
  }

  async getCandidates(): Promise<Member[]> {
    const members = await this.getMembers();
    return members.filter((m) => m.candidato);
  }

  async searchMembers(query: string): Promise<Member[]> {
    const members = await this.getMembers();
    const lowercaseQuery = query.toLowerCase();

    return members.filter(
      (member) =>
        member.nome.toLowerCase().includes(lowercaseQuery) ||
        member.cpf?.includes(query) ||
        member.rg?.includes(query) ||
        member.email?.toLowerCase().includes(lowercaseQuery)
    );
  }

  // ============================================
  // SSOT Methods - Single Source of Truth
  // ============================================

  /**
   * FASE 2.1: Atualizar votos de um candidato (Member)
   * SSOT para contagem de votos
   */
  async updateMemberVotes(
    memberId: string,
    increment: number
  ): Promise<AsyncResult<Member>> {
    try {
      const members = await this.getMembers();
      const member = members.find((m) => m.id === memberId);

      if (!member) {
        return { success: false, error: "Membro não encontrado" };
      }

      if (!member.candidato) {
        return {
          success: false,
          error: "Membro não é candidato",
        };
      }

      const currentVotes = member.votes || 0;
      const newVotes = Math.max(0, currentVotes + increment); // Não permitir votos negativos

      const updatedMember: Member = {
        ...member,
        votes: newVotes,
      };

      const updatedMembers = members.map((m) =>
        m.id === memberId ? updatedMember : m
      );

      console.log(
        `[MemberManager] 💾 Salvando membros atualizados... (${member.nome}: ${currentVotes} → ${newVotes})`
      );
      await this.saveMembers(updatedMembers);
      console.log("[MemberManager] ✅ Membros salvos com sucesso!");

      console.log(
        `[MemberManager] ✅ Votos atualizados: ${member.nome} (${currentVotes} → ${newVotes})`
      );

      return { success: true, data: updatedMember };
    } catch (error) {
      ErrorHandler.log(error as Error, "MemberManager.updateMemberVotes");
      return { success: false, error: "Erro ao atualizar votos" };
    }
  }

  /**
   * FASE 2.2: Marcar membro como tendo votado
   * SSOT para controle de quem votou
   */
  async markMemberVoted(
    memberId: string,
    candidateIds: string[]
  ): Promise<AsyncResult<Member>> {
    try {
      const members = await this.getMembers();
      const member = members.find((m) => m.id === memberId);

      if (!member) {
        return { success: false, error: "Membro não encontrado" };
      }

      // Validação: apenas Membros Comungantes podem votar
      if (member.tipo !== "Membro Comungante") {
        return {
          success: false,
          error: "Apenas Membros Comungantes podem votar",
        };
      }

      // Validação: membro deve estar presente
      if (!member.presente) {
        return {
          success: false,
          error: "Membro deve estar presente para votar",
        };
      }

      const updatedMember: Member = {
        ...member,
        jaVotou: true,
        votedFor: candidateIds,
      };

      const updatedMembers = members.map((m) =>
        m.id === memberId ? updatedMember : m
      );

      await this.saveMembers(updatedMembers);

      console.log(
        `[MemberManager] ✅ Membro marcado como votou: ${member.nome}`
      );

      return { success: true, data: updatedMember };
    } catch (error) {
      ErrorHandler.log(error as Error, "MemberManager.markMemberVoted");
      return { success: false, error: "Erro ao marcar membro como votou" };
    }
  }

  /**
   * FASE 2.3: Alternar presença de um membro
   * SSOT para controle de presença
   */
  async toggleMemberPresence(memberId: string): Promise<AsyncResult<Member>> {
    try {
      const members = await this.getMembers();
      const member = members.find((m) => m.id === memberId);

      if (!member) {
        return { success: false, error: "Membro não encontrado" };
      }

      const nowPresent = !member.presente;
      const now = new Date();
      const timeString = nowPresent ? Formatter.date(now) : null;

      const updatedMember: Member = {
        ...member,
        presente: nowPresent,
        horarioChegada: timeString,
      };

      const updatedMembers = members.map((m) =>
        m.id === memberId ? updatedMember : m
      );

      await this.saveMembers(updatedMembers);

      this.eventSystem.emit(EventTypes.ATTENDANCE_MARKED, {
        memberId,
        present: nowPresent,
        timestamp: now,
      });

      console.log(
        `[MemberManager] ✅ Presença alternada: ${member.nome} (${member.presente} → ${nowPresent})`
      );

      return { success: true, data: updatedMember };
    } catch (error) {
      ErrorHandler.log(error as Error, "MemberManager.toggleMemberPresence");
      return { success: false, error: "Erro ao alternar presença" };
    }
  }

  /**
   * FASE 2.4: Obter candidatos (filtered by role)
   * SSOT para lista de candidatos
   */
  async getCandidatesByRole(role?: CandidateRole): Promise<Member[]> {
    try {
      const members = await this.getMembers();
      let candidates = members.filter(
        (m): m is Member & { candidato: CandidateRole } =>
          m.candidato !== null && m.candidato !== undefined
      );

      if (role) {
        candidates = candidates.filter((c) => c.candidato === role);
      }

      return candidates;
    } catch (error) {
      ErrorHandler.log(error as Error, "MemberManager.getCandidatesByRole");
      return [];
    }
  }

  /**
   * FASE 2.5: Obter membros presentes
   * SSOT para lista de presentes
   */
  async getPresentMembers(): Promise<Member[]> {
    try {
      const members = await this.getMembers();
      return members.filter((m) => m.presente === true);
    } catch (error) {
      ErrorHandler.log(error as Error, "MemberManager.getPresentMembers");
      return [];
    }
  }

  /**
   * FASE 2.6: Obter membros que já votaram
   * SSOT para lista de eleitores
   */
  async getVoters(): Promise<Member[]> {
    try {
      const members = await this.getMembers();
      return members.filter((m) => m.jaVotou === true);
    } catch (error) {
      ErrorHandler.log(error as Error, "MemberManager.getVoters");
      return [];
    }
  }

  /**
   * FASE 2.7: Validar elegibilidade de um membro para votar
   */
  async validateVoterEligibility(memberId: string): Promise<ValidationResult> {
    try {
      const member = await this.getMember(memberId);

      if (!member) {
        return {
          isValid: false,
          errors: ["Membro não encontrado"],
        };
      }

      const errors: string[] = [];

      if (member.tipo !== "Membro Comungante") {
        errors.push("Apenas Membros Comungantes podem votar");
      }

      if (!member.presente) {
        errors.push("Membro deve estar presente para votar");
      }

      if (member.jaVotou) {
        errors.push("Membro já votou");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      ErrorHandler.log(
        error as Error,
        "MemberManager.validateVoterEligibility"
      );
      return {
        isValid: false,
        errors: ["Erro ao validar elegibilidade"],
      };
    }
  }
}
