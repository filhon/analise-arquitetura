// Módulo de relatórios

import type { Candidate, ExportData, ConfigData } from "@/types";
import { ErrorHandler, Formatter } from "@/utils";
import generateValidCPF from "@/utils/cpf";
import { MemberManager } from "./members";
import { VotingManager } from "./voting";
import { AttendanceManager } from "./attendance";

// Utiliza a implementação centralizada de geração de CPF em `src/utils/cpf.ts`

export class ReportManager {
  private static instance: ReportManager;
  private memberManager = MemberManager.getInstance();
  private votingManager = VotingManager.getInstance();
  private attendanceManager = AttendanceManager.getInstance();

  static getInstance(): ReportManager {
    if (!ReportManager.instance) {
      ReportManager.instance = new ReportManager();
    }
    return ReportManager.instance;
  }

  async generatePDFReport(): Promise<{ success: boolean; error?: string }> {
    try {
      // Dinamically import jsPDF to avoid bundling issues
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF();

      // Configurar fonte
      pdf.setFont("helvetica");

      // Cabeçalho
      this.addHeader(pdf);

      // Dados da eleição
      const [results, attendance] = await Promise.all([
        this.votingManager.getElectionResults(),
        this.attendanceManager.getAttendanceStats(),
      ]);

      let currentY = 40;

      // Seção de quórum e presença
      currentY = this.addQuorumSection(
        pdf,
        results.quorum,
        attendance,
        currentY,
      );

      // Seção de resultados Presbíteros
      currentY = this.addCandidatesSection(
        pdf,
        "Presbíteros Eleitos",
        results.presbyteros,
        currentY,
      );

      // Seção de resultados Diáconos
      currentY = this.addCandidatesSection(
        pdf,
        "Diáconos Eleitos",
        results.diaconos,
        currentY,
      );

      // Seção de presença detalhada
      if (currentY > 200) {
        pdf.addPage();
        currentY = 20;
      }
      currentY = await this.addAttendanceSection(pdf, currentY);

      // Rodapé
      this.addFooter(pdf);

      // Salvar PDF
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      pdf.save(`relatorio-eleicao-${timestamp}.pdf`);

      return { success: true };
    } catch (error) {
      ErrorHandler.log(error as Error, "ReportManager.generatePDFReport");
      return {
        success: false,
        error: "Erro ao gerar relatório PDF",
      };
    }
  }

  private addHeader(pdf: any): void {
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("RELATÓRIO DE ELEIÇÃO DE OFICIAIS", 105, 20, { align: "center" });

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Data: ${Formatter.date(new Date())}`, 105, 30, {
      align: "center",
    });
  }

  private addQuorumSection(
    pdf: any,
    quorum: any,
    attendance: any,
    startY: number,
  ): number {
    let currentY = startY;

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("DADOS DE QUÓRUM E PRESENÇA", 20, currentY);
    currentY += 10;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    const quorumData = [
      `Total de Membros: ${quorum.totalMembers}`,
      `Membros Presentes: ${quorum.presentMembers}`,
      `Quórum Mínimo Necessário: ${quorum.minimumQuorum}`,
      `Votos Necessários para Eleição: ${quorum.votesRequired}`,
      `Status do Quórum: ${quorum.isValid ? "VÁLIDO" : "INSUFICIENTE"}`,
      `Taxa de Presença: ${attendance.attendanceRate.toFixed(1)}%`,
    ];

    quorumData.forEach((text) => {
      pdf.text(text, 20, currentY);
      currentY += 6;
    });

    return currentY + 10;
  }

  private addCandidatesSection(
    pdf: any,
    title: string,
    candidates: Candidate[],
    startY: number,
  ): number {
    let currentY = startY;

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, 20, currentY);
    currentY += 10;

    if (candidates.length === 0) {
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "italic");
      pdf.text("Nenhum candidato atingiu os votos necessários", 20, currentY);
      return currentY + 15;
    }

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    const electedCandidates = candidates.filter((c) => c.isElected);

    if (electedCandidates.length > 0) {
      electedCandidates.forEach((candidate) => {
        pdf.text(
          `✓ ${candidate.name} - ${candidate.votes} votos`,
          20,
          currentY,
        );
        currentY += 6;
      });
    } else {
      pdf.setFont("helvetica", "italic");
      pdf.text("Nenhum candidato atingiu os votos necessários", 20, currentY);
      currentY += 6;
    }

    // Mostrar todos os candidatos e seus votos
    if (candidates.length > 0) {
      currentY += 5;
      pdf.setFont("helvetica", "bold");
      pdf.text("Todos os candidatos:", 20, currentY);
      currentY += 6;

      pdf.setFont("helvetica", "normal");
      candidates.forEach((candidate) => {
        const status = candidate.isElected ? " (ELEITO)" : "";
        pdf.text(
          `${candidate.name}: ${candidate.votes} votos${status}`,
          25,
          currentY,
        );
        currentY += 5;
      });
    }

    return currentY + 10;
  }

  private async addAttendanceSection(
    pdf: any,
    startY: number,
  ): Promise<number> {
    let currentY = startY;

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("LISTA DE PRESENÇA", 20, currentY);
    currentY += 10;

    try {
      const [presentMembers, absentMembers] = await Promise.all([
        this.attendanceManager.getPresentMembers(),
        this.attendanceManager.getAbsentMembers(),
      ]);

      // Membros presentes
      if (presentMembers.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("MEMBROS PRESENTES:", 20, currentY);
        currentY += 8;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");

        for (const member of presentMembers) {
          const attendance = await this.attendanceManager.getMemberAttendance(
            member.id,
          );
          const arrivalTime =
            attendance?.arrivalTime || "Horário não registrado";
          pdf.text(`• ${member.nome} - ${arrivalTime}`, 25, currentY);
          currentY += 5;

          // Verificar se precisa de nova página
          if (currentY > 270) {
            pdf.addPage();
            currentY = 20;
          }
        }
      }

      // Membros ausentes
      if (absentMembers.length > 0) {
        currentY += 10;
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("MEMBROS AUSENTES:", 20, currentY);
        currentY += 8;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");

        absentMembers.forEach((member) => {
          pdf.text(`• ${member.nome}`, 25, currentY);
          currentY += 5;

          // Verificar se precisa de nova página
          if (currentY > 270) {
            pdf.addPage();
            currentY = 20;
          }
        });
      }
    } catch (error) {
      ErrorHandler.log(error as Error, "ReportManager.addAttendanceSection");
      pdf.setFont("helvetica", "italic");
      pdf.text("Erro ao carregar dados de presença", 20, currentY);
      currentY += 10;
    }

    return currentY;
  }

  private addFooter(pdf: any): void {
    const pageCount = pdf.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Página ${i} de ${pageCount} - Relatório gerado em ${Formatter.date(new Date())}`,
        105,
        285,
        { align: "center" },
      );
    }
  }

  async exportData(): Promise<{
    success: boolean;
    data?: string;
    error?: string;
  }> {
    try {
      // ✅ SSOT: Membros + config + resultados calculados
      const [members, quorumConfig, results] = await Promise.all([
        this.memberManager.getMembers(),
        this.votingManager.getQuorumConfig(),
        this.votingManager.getElectionResults(),
      ]);

      const config: ConfigData = {
        quorum: quorumConfig || {
          minimumPercentage: 50,
          votesRequiredPercentage: -1,
          presbyteroPositions: 0,
          diaconoPositions: 0,
        },
        system: {
          version: "3.0.0",
          maxCandidates: 100,
          batchSize: 50,
          cacheTimeout: 300000,
          autosaveInterval: 60000,
        },
      };

      const exportData: ExportData = {
        members,
        config,
        quorum: results.quorum,
        results,
        exportDate: new Date(),
        version: "3.0.0", // ✅ Versão 3.0 com SSOT
      };

      const jsonData = JSON.stringify(exportData, null, 2);

      // Criar e baixar arquivo
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dados-eleicao-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return {
        success: true,
        data: jsonData,
      };
    } catch (error) {
      ErrorHandler.log(error as Error, "ReportManager.exportData");
      return {
        success: false,
        error: "Erro ao exportar dados",
      };
    }
  }

  async importData(
    jsonData: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const data: ExportData = JSON.parse(jsonData);

      // ✅ SSOT: Validar apenas members (candidatos e presença estão nele)
      if (!data.members) {
        return {
          success: false,
          error: "Arquivo de dados inválido",
        };
      }

      // Limpar dados existentes
      await Promise.all([
        this.memberManager.clearAll(),
        this.votingManager.clearAll(),
        this.attendanceManager.clearAll(),
      ]);

      // ✅ SSOT: Importar apenas membros (contém tudo)
      for (const member of data.members) {
        await this.memberManager.addMember(member);
      }

      // ✅ SSOT: Importar configurações se presente
      if (data.config) {
        await this.votingManager.updateQuorumConfig(data.config.quorum);
      }

      // ✅ SSOT: candidato, presente, jaVotou já estão em Member
      // Não precisa importar separadamente

      return { success: true };
    } catch (error) {
      ErrorHandler.log(error as Error, "ReportManager.importData");
      return {
        success: false,
        error: "Erro ao importar dados",
      };
    }
  }

  async generateCSVTemplate(): Promise<string> {
    const headers = [
      "nome",
      "tipo",
      "cpf",
      "rg",
      "candidato",
      "email",
      "telefone",
    ];

    // Gera CPFs válidos automaticamente usando utilitário centralizado
    const cpf1 = generateValidCPF("111.444.777");
    const cpf2 = generateValidCPF("123.456.789");
    const cpf3 = generateValidCPF("987.654.321");

    console.log("[Template CSV] CPFs gerados e validados:", {
      cpf1,
      cpf2,
      cpf3,
    });

    const exampleData = [
      [
        "João Silva",
        "Membro Comungante",
        cpf1,
        "12.345.678-9",
        "Presbítero",
        "joao@email.com",
        "(11) 99999-9999",
      ],
      [
        "Maria Santos",
        "Membro Comungante",
        cpf2,
        "98.765.432-1",
        "Diácono",
        "maria@email.com",
        "(11) 88888-8888",
      ],
      [
        "José Oliveira",
        "Visitante",
        cpf3,
        "45.678.912-3",
        "",
        "jose@email.com",
        "(11) 77777-7777",
      ],
    ];

    const csvContent = [
      headers.join(","),
      ...exampleData.map((row) => row.join(",")),
    ].join("\n");

    return csvContent;
  }

  async downloadCSVTemplate(): Promise<void> {
    try {
      const csvContent = await this.generateCSVTemplate();
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "template-membros.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      ErrorHandler.log(error as Error, "ReportManager.downloadCSVTemplate");
    }
  }
}
