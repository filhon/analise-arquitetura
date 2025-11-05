// Módulo de relatórios

import type { Candidate, ExportData, ConfigData } from "@/types";
import { ErrorHandler, Formatter } from "@/utils";
import generateValidCPF from "@/utils/cpf";
import { MemberManager } from "./members";
import { VotingManager } from "./voting";
import { AttendanceManager } from "./attendance";
import { AuditManager } from "./audit";

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

  /**
   * Sanitiza texto para garantir compatibilidade com PDF
   * Converte caracteres especiais para formas compatíveis
   */
  private sanitizeText(text: string): string {
    if (!text) return "";

    return text
      .normalize("NFD") // Decompõe caracteres acentuados
      .replace(/[\u0300-\u036f]/g, "") // Remove diacríticos
      .replace(/[""]/g, '"') // Padroniza aspas
      .replace(/['']/g, "'") // Padroniza apóstrofos
      .replace(/–/g, "-") // Converte traço longo
      .replace(/—/g, "-") // Converte traço duplo
      .replace(/…/g, "..."); // Converte reticências
  }

  async generatePDFReport(): Promise<{ success: boolean; error?: string }> {
    try {
      // Dinamically import jsPDF to avoid bundling issues
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
        putOnlyUsedFonts: true,
        floatPrecision: 16,
      });

      // Configurar fonte com suporte UTF-8
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);

      // Forçar codificação UTF-8 para caracteres especiais
      pdf.setLanguage("pt-BR");

      // Cabeçalho
      this.addHeader(pdf);

      // Dados da eleição
      const [results, attendance] = await Promise.all([
        this.votingManager.getElectionResults(),
        this.attendanceManager.getAttendanceStats(),
      ]);

      let currentY = 45; // Espaço maior após cabeçalho visual

      // Seção de quórum e presença
      currentY = this.addQuorumSection(
        pdf,
        results.quorum,
        attendance,
        currentY
      );

      // Seção de resultados Presbíteros
      currentY = this.addCandidatesSection(
        pdf,
        "Presbíteros Eleitos",
        results.presbyteros,
        currentY
      );

      // Seção de resultados Diáconos
      currentY = this.addCandidatesSection(
        pdf,
        "Diáconos Eleitos",
        results.diaconos,
        currentY
      );

      // Seção de presença detalhada
      if (currentY > 220) {
        // Verificar espaço antes da seção de presença
        pdf.addPage();
        currentY = 20;
      }
      currentY = await this.addAttendanceSection(pdf, currentY);

      // Seção de auditoria de votos
      if (currentY > 220) {
        // Verificar espaço antes da seção de auditoria
        pdf.addPage();
        currentY = 20;
      }
      currentY = await this.addAuditSection(pdf, currentY);

      // Rodapé
      this.addFooter(pdf);

      // Salvar PDF com nome mais descritivo
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      pdf.save(`relatorio-eleicao-oficiais-${timestamp}.pdf`);

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
    // Fundo azul institucional para o cabeçalho
    pdf.setFillColor(41, 128, 185); // Azul institucional
    pdf.rect(0, 0, 210, 35, "F");

    // Título principal em branco
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text(this.sanitizeText("RELATÓRIO DE ELEIÇÃO"), 105, 15, {
      align: "center",
    });

    pdf.setFontSize(16);
    pdf.text(this.sanitizeText("OFICIAIS DA IGREJA"), 105, 25, {
      align: "center",
    });

    // Data em destaque
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(255, 255, 255);
    pdf.text(`Gerado em: ${Formatter.date(new Date())}`, 105, 32, {
      align: "center",
    });

    // Resetar cor do texto para preto
    pdf.setTextColor(0, 0, 0);
  }

  private addQuorumSection(
    pdf: any,
    quorum: any,
    attendance: any,
    startY: number
  ): number {
    let currentY = startY;

    // Título da seção com fundo azul claro
    pdf.setFillColor(240, 248, 255); // Azul muito claro
    pdf.rect(15, currentY - 3, 180, 10, "F");

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 128, 185); // Azul institucional
    pdf.text(this.sanitizeText("DADOS DE QUÓRUM E PRESENÇA"), 20, currentY + 3);
    currentY += 15;

    // Resetar cor do texto
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");

    // Criar cards visuais para as métricas
    const metrics = [
      { label: "Total de Membros", value: quorum.totalMembers, icon: "TOT" },
      { label: "Membros Presentes", value: quorum.presentMembers, icon: "PRE" },
      { label: "Quórum Mínimo", value: quorum.minimumQuorum, icon: "MIN" },
      { label: "Votos Necessários", value: quorum.votesRequired, icon: "VOT" },
      {
        label: "Taxa de Presença",
        value: `${attendance.attendanceRate.toFixed(1)}%`,
        icon: "TAX",
      },
    ];

    // Desenhar métricas em formato de cards
    const cardY = currentY;
    const cardWidth = 55;
    const cardHeight = 18;
    const cardsPerRow = 3;

    metrics.forEach((metric, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      const x = 20 + col * (cardWidth + 10);

      // Fundo do card
      pdf.setFillColor(248, 249, 250);
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(x, cardY + row * (cardHeight + 5), cardWidth, cardHeight, "FD");

      // Ícone e valor
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        `${metric.icon} ${metric.value}`,
        x + 2,
        cardY + 8 + row * (cardHeight + 5)
      );

      // Label
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        this.sanitizeText(metric.label),
        x + 2,
        cardY + 15 + row * (cardHeight + 5)
      );
    });

    currentY += Math.ceil(metrics.length / cardsPerRow) * (cardHeight + 5) + 10;

    // Status do quórum em destaque
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    if (quorum.isValid) {
      pdf.setTextColor(34, 197, 94); // Verde sucesso
      pdf.text(this.sanitizeText("STATUS DO QUÓRUM: VÁLIDO"), 20, currentY);
    } else {
      pdf.setTextColor(239, 68, 68); // Vermelho erro
      pdf.text(
        this.sanitizeText("STATUS DO QUÓRUM: INSUFICIENTE"),
        20,
        currentY
      );
    }

    // Resetar cor do texto
    pdf.setTextColor(0, 0, 0);

    return currentY + 15;
  }

  private addCandidatesSection(
    pdf: any,
    title: string,
    candidates: Candidate[],
    startY: number
  ): number {
    let currentY = startY;

    // Título da seção com fundo azul claro
    pdf.setFillColor(240, 248, 255); // Azul muito claro
    pdf.rect(15, currentY - 3, 180, 10, "F");

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 128, 185); // Azul institucional
    pdf.text(`${this.sanitizeText(title.toUpperCase())}`, 20, currentY + 3);
    currentY += 15;

    // Resetar cor do texto
    pdf.setTextColor(0, 0, 0);

    if (candidates.length === 0) {
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        this.sanitizeText("Nenhum candidato registrado nesta categoria"),
        20,
        currentY
      );
      pdf.setTextColor(0, 0, 0);
      return currentY + 15;
    }

    const electedCandidates = candidates.filter((c) => c.isElected);

    // Candidatos eleitos em destaque
    if (electedCandidates.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(34, 197, 94); // Verde sucesso
      pdf.text(this.sanitizeText("CANDIDATOS ELEITOS:"), 20, currentY);
      currentY += 8;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);

      electedCandidates.forEach((candidate) => {
        // Fundo verde claro para eleitos
        pdf.setFillColor(240, 255, 240);
        pdf.rect(25, currentY - 3, 160, 8, "F");

        pdf.text(`${this.sanitizeText(candidate.name)}`, 30, currentY + 2);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${candidate.votes} votos`, 160, currentY + 2, {
          align: "right",
        });
        pdf.setFont("helvetica", "normal");
        currentY += 8;
      });
    } else {
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(239, 68, 68); // Vermelho
      pdf.text(
        this.sanitizeText("Nenhum candidato atingiu os votos necessários"),
        20,
        currentY
      );
      pdf.setTextColor(0, 0, 0);
      currentY += 8;
    }

    // Todos os candidatos
    currentY += 5;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 128, 185);
    pdf.text(this.sanitizeText("TODOS OS CANDIDATOS:"), 20, currentY);
    currentY += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);

    candidates.forEach((candidate, index) => {
      const statusColor = candidate.isElected ? [34, 197, 94] : [239, 68, 68];

      // Fundo alternado para melhor leitura
      if (index % 2 === 0) {
        pdf.setFillColor(248, 249, 250);
        pdf.rect(25, currentY - 2, 160, 6, "F");
      }

      pdf.text(`${this.sanitizeText(candidate.name)}`, 30, currentY + 2);
      pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.text(`${candidate.votes} votos`, 160, currentY + 2, {
        align: "right",
      });
      pdf.setTextColor(0, 0, 0);
      currentY += 6;
    });

    return currentY + 10;
  }

  private async addAttendanceSection(
    pdf: any,
    startY: number
  ): Promise<number> {
    let currentY = startY;

    // Título da seção com fundo azul claro
    pdf.setFillColor(240, 248, 255); // Azul muito claro
    pdf.rect(15, currentY - 3, 180, 10, "F");

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(41, 128, 185); // Azul institucional
    pdf.text(this.sanitizeText("LISTA DE PRESENÇA"), 20, currentY + 3);
    currentY += 15;

    // Resetar cor do texto
    pdf.setTextColor(0, 0, 0);

    try {
      const [presentMembers, absentMembers] = await Promise.all([
        this.attendanceManager.getPresentMembers(),
        this.attendanceManager.getAbsentMembers(),
      ]);

      // Membros presentes - Tabela profissional
      if (presentMembers.length > 0) {
        // Forçar quebra de página antes da lista de presentes
        pdf.addPage();
        currentY = 20;

        // Título da tabela
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(34, 197, 94); // Verde
        pdf.text(this.sanitizeText("MEMBROS PRESENTES"), 20, currentY);
        currentY += 10;

        // Configuração da tabela
        const tableX = 15;
        const colWidths = [80, 40, 55]; // Nome, CPF, Assinatura
        const rowHeight = 10;
        const tableWidth = colWidths.reduce((a, b) => a + b, 0);

        // Cabeçalho da tabela
        pdf.setFillColor(41, 128, 185); // Azul institucional
        pdf.rect(tableX, currentY, tableWidth, rowHeight, "F");

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(255, 255, 255);

        let headerX = tableX + 2;
        pdf.text(this.sanitizeText("Nome"), headerX, currentY + 7);
        headerX += colWidths[0];
        pdf.text(this.sanitizeText("CPF"), headerX, currentY + 7);
        headerX += colWidths[1];
        pdf.text(this.sanitizeText("Assinatura"), headerX, currentY + 7);

        currentY += rowHeight;

        // Resetar cores
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "normal");

        for (const [index, member] of presentMembers.entries()) {
          // Quebrar página se necessário
          if (currentY + rowHeight > 270) {
            pdf.addPage();
            currentY = 20;
            // Redesenhar cabeçalho
            pdf.setFillColor(41, 128, 185);
            pdf.rect(tableX, currentY, tableWidth, rowHeight, "F");
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(255, 255, 255);
            headerX = tableX + 2;
            pdf.text(this.sanitizeText("Nome"), headerX, currentY + 7);
            headerX += colWidths[0];
            pdf.text(this.sanitizeText("CPF"), headerX, currentY + 7);
            headerX += colWidths[1];
            pdf.text(this.sanitizeText("Assinatura"), headerX, currentY + 7);
            currentY += rowHeight;
            pdf.setTextColor(0, 0, 0);
            pdf.setFont("helvetica", "normal");
          }

          // Fundo alternado para linhas
          if (index % 2 === 0) {
            pdf.setFillColor(248, 249, 250);
            pdf.rect(tableX, currentY, tableWidth, rowHeight, "F");
          }

          // Bordas da linha
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(tableX, currentY, tableWidth, rowHeight, "S");

          // Dados
          let dataX = tableX + 2;
          const nomeText =
            member.nome?.length > 25
              ? member.nome.slice(0, 22) + "..."
              : member.nome || "";
          pdf.text(this.sanitizeText(nomeText), dataX, currentY + 7);

          dataX += colWidths[0];
          pdf.text(member.cpf || "", dataX, currentY + 7);

          // Linha para assinatura
          dataX += colWidths[1] + 2;
          pdf.line(dataX, currentY + 5, dataX + colWidths[2] - 4, currentY + 5);

          currentY += rowHeight;
        }

        // Forçar quebra de página depois da lista de presentes
        pdf.addPage();
        currentY = 20;
      }

      // Membros ausentes
      if (absentMembers.length > 0) {
        // Título da seção
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(239, 68, 68); // Vermelho
        pdf.text(this.sanitizeText("MEMBROS AUSENTES"), 20, currentY);
        currentY += 10;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);

        absentMembers.forEach((member, index) => {
          // Fundo alternado
          if (index % 2 === 0) {
            pdf.setFillColor(255, 240, 240); // Vermelho muito claro
            pdf.rect(25, currentY - 2, 160, 6, "F");
          }

          pdf.text(`• ${this.sanitizeText(member.nome)}`, 30, currentY + 2);
          currentY += 6;

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
      pdf.setTextColor(239, 68, 68);
      pdf.text(
        this.sanitizeText("Erro ao carregar dados de presença"),
        20,
        currentY
      );
      pdf.setTextColor(0, 0, 0);
      currentY += 10;
    }

    return currentY;
  }

  private async addAuditSection(pdf: any, startY: number): Promise<number> {
    let currentY = startY;
    const auditManager = AuditManager.getInstance();

    try {
      const auditData = await auditManager.getReportData();

      // Se não há votos registrados, pular seção
      if (auditData.totalVotes === 0) {
        return currentY;
      }

      // Nova página para auditoria
      pdf.addPage();
      currentY = 20;

      // Título da seção com fundo azul claro
      pdf.setFillColor(240, 248, 255);
      pdf.rect(15, currentY - 3, 180, 10, "F");

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(41, 128, 185);
      pdf.text(this.sanitizeText("REGISTRO DE AUDITORIA"), 20, currentY + 3);
      currentY += 15;

      // Resetar cor do texto
      pdf.setTextColor(0, 0, 0);

      // Informações gerais
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(this.sanitizeText("RESUMO GERAL"), 20, currentY);
      currentY += 8;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Total de Votos Registrados: ${auditData.totalVotes}`,
        25,
        currentY
      );
      currentY += 6;

      // Status de integridade
      const integrityColor = auditData.integrity.isValid
        ? [34, 197, 94]
        : [239, 68, 68];
      const integrityText = auditData.integrity.isValid
        ? "VALIDO"
        : "COMPROMETIDA";
      pdf.setTextColor(...integrityColor);
      pdf.text(`Integridade dos Dados: ${integrityText}`, 25, currentY);
      pdf.setTextColor(0, 0, 0);
      currentY += 10;

      // Estatísticas por candidato
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(this.sanitizeText("ESTATISTICAS POR CANDIDATO"), 20, currentY);
      currentY += 8;

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");

      // Agrupar por cargo
      const presbíteros = auditData.statistics.filter(
        (s) => s.role === "Presbítero"
      );
      const diáconos = auditData.statistics.filter((s) => s.role === "Diácono");

      if (presbíteros.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.text(this.sanitizeText("Presbiteros:"), 25, currentY);
        currentY += 5;
        pdf.setFont("helvetica", "normal");

        for (const stat of presbíteros) {
          pdf.text(
            `  • ${this.sanitizeText(stat.name)}: ${stat.votes} votos (${stat.percentage}%)`,
            25,
            currentY
          );
          currentY += 5;
        }
        currentY += 3;
      }

      if (diáconos.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.text(this.sanitizeText("Diaconos:"), 25, currentY);
        currentY += 5;
        pdf.setFont("helvetica", "normal");

        for (const stat of diáconos) {
          pdf.text(
            `  • ${this.sanitizeText(stat.name)}: ${stat.votes} votos (${stat.percentage}%)`,
            25,
            currentY
          );
          currentY += 5;
        }
        currentY += 3;
      }

      currentY += 5;

      // Lista aleatória de votos (para verificação manual)
      pdf.addPage();
      currentY = 20;

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        this.sanitizeText("LISTA COMPLETA DE VOTOS (ORDEM ALEATORIA)"),
        20,
        currentY
      );
      currentY += 8;

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        this.sanitizeText(
          "Os votos abaixo estao em ordem aleatoria para preservar o anonimato dos votantes."
        ),
        20,
        currentY
      );
      currentY += 5;
      pdf.text(
        this.sanitizeText(
          "Cada linha representa uma cedula de votacao completa."
        ),
        20,
        currentY
      );
      currentY += 10;

      pdf.setTextColor(0, 0, 0);

      // Renderizar votos aleatorizados
      const randomizedVotes = auditData.randomizedVotes;

      for (let i = 0; i < randomizedVotes.length; i++) {
        const vote = randomizedVotes[i];

        // Verificar espaço na página
        if (currentY > 270) {
          pdf.addPage();
          currentY = 20;
        }

        // ID e timestamp
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        const voteHeader = `Voto ${vote.id} - ${new Date(vote.timestamp).toLocaleString("pt-BR")}`;
        pdf.text(this.sanitizeText(voteHeader), 20, currentY);
        currentY += 5;

        // Candidatos selecionados
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);

        // Buscar nomes dos candidatos
        const members = await this.memberManager.getMembers();
        const membersMap = new Map(members.map((m) => [m.id, m]));

        const presNames = vote.presbyteros
          .map((id) => {
            const member = membersMap.get(id);
            return member?.nome || id;
          })
          .join(", ");

        const diaNames = vote.diaconos
          .map((id) => {
            const member = membersMap.get(id);
            return member?.nome || id;
          })
          .join(", ");

        pdf.text(
          `  PRE: ${this.sanitizeText(presNames) || "Nenhum"}`,
          25,
          currentY
        );
        currentY += 4;
        pdf.text(
          `  DIA: ${this.sanitizeText(diaNames) || "Nenhum"}`,
          25,
          currentY
        );
        currentY += 4;

        // Hash (primeiros 16 caracteres)
        pdf.setFontSize(7);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`  Hash: ${vote.hash.substring(0, 16)}...`, 25, currentY);
        pdf.setTextColor(0, 0, 0);
        currentY += 8;
      }
    } catch (error) {
      ErrorHandler.log(error as Error, "ReportManager.addAuditSection");
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(239, 68, 68);
      pdf.text(
        this.sanitizeText("Erro ao carregar dados de auditoria"),
        20,
        currentY
      );
      pdf.setTextColor(0, 0, 0);
      currentY += 10;
    }

    return currentY;
  }

  private addFooter(pdf: any): void {
    const pageCount = pdf.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);

      // Linha separadora
      pdf.setDrawColor(41, 128, 185);
      pdf.setLineWidth(0.5);
      pdf.line(15, 275, 195, 275);

      // Fundo azul claro para o rodapé
      pdf.setFillColor(240, 248, 255);
      pdf.rect(0, 276, 210, 20, "F");

      // Informações do rodapé
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);

      const footerText = `Sistema de Eleição de Oficiais - Página ${i} de ${pageCount}`;
      pdf.text(footerText, 105, 282, { align: "center" });

      pdf.setFontSize(8);
      const dateText = `Gerado em ${Formatter.date(new Date())}`;
      pdf.text(dateText, 105, 288, { align: "center" });

      // Logo/assinatura da igreja (opcional)
      pdf.setFontSize(7);
      pdf.setTextColor(41, 128, 185);
      pdf.text(
        this.sanitizeText("Igreja Presbiteriana em Águas Compridas"),
        105,
        292,
        {
          align: "center",
        }
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
        exportDate: new Date().toISOString(),
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
    jsonData: string
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
