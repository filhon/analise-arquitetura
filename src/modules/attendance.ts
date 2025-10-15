// Módulo de ata de presença

import type { AttendanceRecord, Member, AsyncResult } from "@/types";
import { EventTypes } from "@/types";
import { SmartCache, ErrorHandler } from "@/utils";
import { EventSystem } from "@/utils/events";
import { MemberManager } from "./members";

export class AttendanceManager {
  private static instance: AttendanceManager;
  private cache = new SmartCache<AttendanceRecord[]>();
  private eventSystem = EventSystem.getInstance();
  private memberManager = MemberManager.getInstance();

  static getInstance(): AttendanceManager {
    if (!AttendanceManager.instance) {
      AttendanceManager.instance = new AttendanceManager();
    }
    return AttendanceManager.instance;
  }

  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    try {
      const cached = this.cache.get("all-attendance");
      if (cached) return cached;

      // Agora os dados de presença estão centralizados em Member
      const members = await this.memberManager.getMembers();
      const records: AttendanceRecord[] = members.map((member) => ({
        memberId: member.id,
        memberName: member.nome,
        present: member.presente || false,
        arrivalTime: member.horarioChegada || null,
        timestamp: member.horarioChegada
          ? new Date(member.horarioChegada)
          : new Date(),
      }));

      this.cache.set("all-attendance", records);
      return records;
    } catch (error) {
      ErrorHandler.log(
        error as Error,
        "AttendanceManager.getAttendanceRecords"
      );
      return [];
    }
  }

  /**
   * FASE 4.2: Refatorado para delegar para MemberManager (SSOT)
   */
  async markPresence(
    memberId: string,
    present: boolean
  ): Promise<AsyncResult<AttendanceRecord>> {
    try {
      // Delegar para MemberManager que é SSOT
      const member = await this.memberManager.getMember(memberId);
      if (!member) {
        return { success: false, error: "Membro não encontrado" };
      }

      // Se o estado já é o desejado, não fazer nada
      if (member.presente === present) {
        const now = new Date();
        return {
          success: true,
          data: {
            memberId,
            memberName: member.nome,
            present,
            arrivalTime: member.horarioChegada || null,
            timestamp: now,
          },
        };
      }

      // Usar toggleMemberPresence do MemberManager
      const result = await this.memberManager.toggleMemberPresence(memberId);
      if (!result.success) {
        return { success: false, error: result.error };
      }

      const now = new Date();
      const attendanceRecord: AttendanceRecord = {
        memberId,
        memberName: result.data!.nome,
        present: result.data!.presente || false,
        arrivalTime: result.data!.horarioChegada || null,
        timestamp: now,
      };

      this.cache.clear(); // Limpar cache

      return { success: true, data: attendanceRecord };
    } catch (error) {
      ErrorHandler.log(error as Error, "AttendanceManager.markPresence");
      return { success: false, error: "Erro interno ao marcar presença" };
    }
  }

  /**
   * FASE 4.3: Refatorado para delegar para MemberManager (SSOT)
   */
  async togglePresence(
    memberId: string
  ): Promise<AsyncResult<AttendanceRecord>> {
    try {
      // Delegar completamente para MemberManager
      const result = await this.memberManager.toggleMemberPresence(memberId);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const member = result.data!;
      const now = new Date();

      this.cache.clear(); // Limpar cache

      return {
        success: true,
        data: {
          memberId: member.id,
          memberName: member.nome,
          present: member.presente || false,
          arrivalTime: member.horarioChegada || null,
          timestamp: now,
        },
      };
    } catch (error) {
      ErrorHandler.log(error as Error, "AttendanceManager.togglePresence");
      return {
        success: false,
        error: "Erro interno ao alternar presença",
      };
    }
  }

  /**
   * FASE 4.4: Refatorado para usar MemberManager diretamente (SSOT)
   */
  async getAttendanceStats(): Promise<{
    totalMembers: number;
    presentMembers: number;
    absentMembers: number;
    attendanceRate: number;
  }> {
    try {
      // Usar MemberManager diretamente (SSOT)
      const [members, presentMembers] = await Promise.all([
        this.memberManager.getMembers(),
        this.memberManager.getPresentMembers(),
      ]);

      console.log(
        "[AttendanceManager.getAttendanceStats] Total de membros carregados:",
        members.length
      );
      console.log(
        "[AttendanceManager.getAttendanceStats] Membros presentes:",
        presentMembers.length
      );

      // Apenas Membros Comungantes contam para quórum e estatísticas
      // Não-Comungantes e Visitantes são apenas para registro em ata
      const eligibleMembers = members.filter(
        (m) => m.tipo === "Membro Comungante"
      );

      console.log(
        "[AttendanceManager.getAttendanceStats] Membros Comungantes elegíveis:",
        eligibleMembers.length
      );

      const totalMembers = eligibleMembers.length;
      const presentCount = presentMembers.filter(
        (m) => m.tipo === "Membro Comungante"
      ).length;
      const absentMembers = totalMembers - presentCount;
      const attendanceRate =
        totalMembers > 0 ? (presentCount / totalMembers) * 100 : 0;

      console.log("[AttendanceManager.getAttendanceStats] Resultado:", {
        totalMembers,
        presentMembers: presentCount,
        absentMembers,
        attendanceRate,
      });

      return {
        totalMembers,
        presentMembers: presentCount,
        absentMembers,
        attendanceRate,
      };
    } catch (error) {
      ErrorHandler.log(error as Error, "AttendanceManager.getAttendanceStats");
      return {
        totalMembers: 0,
        presentMembers: 0,
        absentMembers: 0,
        attendanceRate: 0,
      };
    }
  }

  /**
   * FASE 4.5: Refatorado para delegar para MemberManager (SSOT)
   */
  async getPresentMembers(): Promise<Member[]> {
    try {
      // Delegar completamente para MemberManager
      return await this.memberManager.getPresentMembers();
    } catch (error) {
      ErrorHandler.log(error as Error, "AttendanceManager.getPresentMembers");
      return [];
    }
  }

  async getAbsentMembers(): Promise<Member[]> {
    try {
      const [members, records] = await Promise.all([
        this.memberManager.getMembers(),
        this.getAttendanceRecords(),
      ]);

      const presentMemberIds = records
        .filter((r) => r.present)
        .map((r) => r.memberId);

      return members.filter((m) => !presentMemberIds.includes(m.id));
    } catch (error) {
      ErrorHandler.log(error as Error, "AttendanceManager.getAbsentMembers");
      return [];
    }
  }

  async markAllPresent(): Promise<AsyncResult<AttendanceRecord[]>> {
    try {
      const members = await this.memberManager.getMembers();
      const results: AttendanceRecord[] = [];

      for (const member of members) {
        const result = await this.markPresence(member.id, true);
        if (result.success && result.data) {
          results.push(result.data);
        }
      }

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      ErrorHandler.log(error as Error, "AttendanceManager.markAllPresent");
      return {
        success: false,
        error: "Erro interno ao marcar todos como presentes",
      };
    }
  }

  async markAllAbsent(): Promise<AsyncResult<AttendanceRecord[]>> {
    try {
      const members = await this.memberManager.getMembers();
      const results: AttendanceRecord[] = [];

      for (const member of members) {
        const result = await this.markPresence(member.id, false);
        if (result.success && result.data) {
          results.push(result.data);
        }
      }

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      ErrorHandler.log(error as Error, "AttendanceManager.markAllAbsent");
      return {
        success: false,
        error: "Erro interno ao marcar todos como ausentes",
      };
    }
  }

  async getMemberAttendance(
    memberId: string
  ): Promise<AttendanceRecord | null> {
    try {
      const records = await this.getAttendanceRecords();
      return records.find((r) => r.memberId === memberId) || null;
    } catch (error) {
      ErrorHandler.log(error as Error, "AttendanceManager.getMemberAttendance");
      return null;
    }
  }

  async initializeFromMembers(): Promise<AsyncResult<number>> {
    try {
      const members = await this.memberManager.getMembers();
      const records = await this.getAttendanceRecords();

      let initializedCount = 0;
      const updatedRecords = [...records];

      for (const member of members) {
        const hasRecord = records.some((r) => r.memberId === member.id);

        if (!hasRecord) {
          const newRecord: AttendanceRecord = {
            memberId: member.id,
            memberName: member.nome,
            present: false,
            arrivalTime: null,
            timestamp: new Date(),
          };

          updatedRecords.push(newRecord);
          initializedCount++;
        }
      }

      if (initializedCount > 0) {
        await this.saveAttendanceRecords(updatedRecords);
      }

      return {
        success: true,
        data: initializedCount,
      };
    } catch (error) {
      ErrorHandler.log(
        error as Error,
        "AttendanceManager.initializeFromMembers"
      );
      return {
        success: false,
        error: "Erro interno ao inicializar presença",
      };
    }
  }

  private async saveAttendanceRecords(
    records: AttendanceRecord[]
  ): Promise<void> {
    // DEPRECATED: Agora os dados estão centralizados em Member
    // Este método permanece apenas para compatibilidade temporária
    // Emitir evento de salvamento
    this.eventSystem.emit(EventTypes.ATTENDANCE_SAVED, {
      count: records.length,
      timestamp: new Date(),
    });
  }

  async loadFromStorage(): Promise<void> {
    // Já carrega automaticamente via getAttendanceRecords()
    await this.getAttendanceRecords();
  }

  async clearAll(): Promise<void> {
    // ✅ SSOT: Apenas limpa cache local
    // ATTENDANCE foi deprecated, agora usa Member.presente
    this.cache.clear();
  }

  async removeMemberAttendance(memberId: string): Promise<AsyncResult<void>> {
    try {
      const records = await this.getAttendanceRecords();
      const updatedRecords = records.filter((r) => r.memberId !== memberId);

      if (records.length === updatedRecords.length) {
        // Nenhum registro foi removido (membro não tinha registro de presença)
        return {
          success: true,
        };
      }

      await this.saveAttendanceRecords(updatedRecords);

      return {
        success: true,
      };
    } catch (error) {
      ErrorHandler.log(
        error as Error,
        "AttendanceManager.removeMemberAttendance"
      );
      return {
        success: false,
        error: "Erro interno ao remover presença do membro",
      };
    }
  }

  // Métodos para filtros e busca
  async searchAttendance(query: string): Promise<AttendanceRecord[]> {
    try {
      const records = await this.getAttendanceRecords();
      const lowercaseQuery = query.toLowerCase();

      return records.filter((record) =>
        record.memberName.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      ErrorHandler.log(error as Error, "AttendanceManager.searchAttendance");
      return [];
    }
  }

  async getAttendanceByStatus(present: boolean): Promise<AttendanceRecord[]> {
    try {
      const records = await this.getAttendanceRecords();
      return records.filter((r) => r.present === present);
    } catch (error) {
      ErrorHandler.log(
        error as Error,
        "AttendanceManager.getAttendanceByStatus"
      );
      return [];
    }
  }
}
