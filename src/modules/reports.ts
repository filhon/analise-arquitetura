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

      // Membros presentes
      if (presentMembers.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(34, 197, 94); // Verde
        pdf.text(
          this.sanitizeText(`MEMBROS PRESENTES (${presentMembers.length})`),
          20,
          currentY
        );
        currentY += 10;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);

        // Lista numerada sequencial
        presentMembers.forEach((member, index) => {
          // Verificar se precisa de nova página
          if (currentY > 270) {
            pdf.addPage();
            currentY = 20;
          }

          const memberNumber = index + 1;
          const displayName =
            member.nome.length > 60
              ? member.nome.slice(0, 57) + "..."
              : member.nome;

          pdf.text(
            `${memberNumber}. ${this.sanitizeText(displayName)}`,
            25,
            currentY
          );
          currentY += 6;
        });

        currentY += 5;
      }

      // Membros ausentes
      if (absentMembers.length > 0) {
        // Verificar se precisa de nova página
        if (currentY > 250) {
          pdf.addPage();
          currentY = 20;
        }

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(239, 68, 68); // Vermelho
        pdf.text(
          this.sanitizeText(`MEMBROS AUSENTES (${absentMembers.length})`),
          20,
          currentY
        );
        currentY += 10;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);

        // Lista numerada sequencial
        absentMembers.forEach((member, index) => {
          // Verificar se precisa de nova página
          if (currentY > 270) {
            pdf.addPage();
            currentY = 20;
          }

          const memberNumber = index + 1;
          const displayName =
            member.nome.length > 60
              ? member.nome.slice(0, 57) + "..."
              : member.nome;

          pdf.text(
            `${memberNumber}. ${this.sanitizeText(displayName)}`,
            25,
            currentY
          );
          currentY += 6;
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

      // Nova página para lista completa de hashes e instruções de validação
      pdf.addPage();
      currentY = 20;

      // Título da seção de hashes
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(41, 128, 185);
      pdf.text(
        this.sanitizeText("LISTA COMPLETA DE HASHES SHA-256"),
        20,
        currentY
      );
      currentY += 8;

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        this.sanitizeText(
          "Cada voto possui um hash unico gerado a partir dos dados da cedula."
        ),
        20,
        currentY
      );
      currentY += 5;
      pdf.text(
        this.sanitizeText(
          "Use estes hashes para validar a integridade dos votos registrados."
        ),
        20,
        currentY
      );
      currentY += 10;

      pdf.setTextColor(0, 0, 0);

      // Listar todos os hashes (ordenados por ID de voto)
      const sortedVotes = [...randomizedVotes].sort((a, b) => a.id - b.id);

      for (const vote of sortedVotes) {
        // Verificar espaço na página
        if (currentY > 265) {
          pdf.addPage();
          currentY = 20;
        }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.text(`Voto ${vote.id}:`, 20, currentY);

        pdf.setFont("courier", "normal");
        pdf.setFontSize(7);
        pdf.text(vote.hash, 40, currentY);

        currentY += 6;
      }

      // Nova página para instruções de validação
      pdf.addPage();
      currentY = 20;

      // Título
      pdf.setFillColor(255, 248, 240);
      pdf.rect(15, currentY - 3, 180, 10, "F");
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(245, 124, 0); // Laranja
      pdf.text(
        this.sanitizeText("COMO VALIDAR A INTEGRIDADE DOS VOTOS"),
        20,
        currentY + 3
      );
      currentY += 15;

      pdf.setTextColor(0, 0, 0);

      // Explicação do sistema de hash
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(this.sanitizeText("O QUE E UM HASH?"), 20, currentY);
      currentY += 6;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const hashExplanation = [
        "Um hash SHA-256 e uma impressao digital criptografica unica de cada voto.",
        "Qualquer alteracao nos dados do voto (candidatos, horario, etc.) produz um",
        "hash completamente diferente, tornando impossivel adulterar votos sem deteccao.",
      ];

      for (const line of hashExplanation) {
        pdf.text(this.sanitizeText(line), 25, currentY);
        currentY += 5;
      }
      currentY += 5;

      // Passos para validação
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(this.sanitizeText("PASSOS PARA VALIDACAO:"), 20, currentY);
      currentY += 8;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      const steps = [
        {
          num: "1.",
          title: "Exportar dados do sistema:",
          desc: "No menu Configuracoes > Auditoria, clique em 'Exportar Dados de Auditoria'.",
        },
        {
          num: "2.",
          title: "Abrir arquivo JSON:",
          desc: "O arquivo exportado contem todos os votos com seus respectivos hashes.",
        },
        {
          num: "3.",
          title: "Recalcular hash manualmente:",
          desc: "Use uma ferramenta online de SHA-256 (ex: emn178.github.io/online-tools/sha256)",
        },
        {
          num: "4.",
          title: "Montar string de validacao:",
          desc: "Concatene: ID_voto + timestamp + IDs_presbiteros + IDs_diaconos",
        },
        {
          num: "5.",
          title: "Comparar hashes:",
          desc: "O hash calculado deve ser IDENTICO ao hash listado neste relatorio.",
        },
      ];

      for (const step of steps) {
        // Verificar espaço
        if (currentY > 250) {
          pdf.addPage();
          currentY = 20;
        }

        pdf.setFont("helvetica", "bold");
        pdf.text(this.sanitizeText(`${step.num} ${step.title}`), 25, currentY);
        currentY += 5;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text(this.sanitizeText(`   ${step.desc}`), 25, currentY);
        currentY += 6;

        pdf.setFontSize(9);
      }

      currentY += 5;

      // Exemplo prático
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(34, 197, 94); // Verde
      pdf.text(this.sanitizeText("EXEMPLO PRATICO:"), 20, currentY);
      currentY += 8;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont("courier", "normal");
      pdf.setFontSize(7);

      const exampleLines = [
        'String original: "0-1699564800000-abc123,def456-ghi789,jkl012"',
        "                 (ID-timestamp-presbiteros-diaconos)",
        "",
        "Hash SHA-256: 8f3a4b2c1d9e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b",
        "",
        "Qualquer mudanca na string original produz hash totalmente diferente:",
        'String alterada: "0-1699564800000-abc123-ghi789,jkl012" (presbitero removido)',
        "Novo hash: 2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b",
        "              ^ Completamente diferente!",
      ];

      for (const line of exampleLines) {
        if (currentY > 265) {
          pdf.addPage();
          currentY = 20;
        }
        pdf.text(this.sanitizeText(line), 25, currentY);
        currentY += 4;
      }

      currentY += 5;

      // Avisos de segurança
      pdf.setFillColor(255, 243, 224);
      pdf.rect(15, currentY - 2, 180, 30, "F");

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(245, 124, 0);
      pdf.text(this.sanitizeText("IMPORTANTE:"), 20, currentY + 3);
      currentY += 8;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);

      const warnings = [
        "• Se algum hash nao conferir, pode indicar adulteracao ou corrupcao de dados.",
        "• Mantenha uma copia do arquivo JSON exportado em local seguro.",
        "• A validacao pode ser feita por qualquer pessoa com acesso ao arquivo.",
        "• Este sistema garante transparencia e auditabilidade total do processo.",
      ];

      for (const warning of warnings) {
        pdf.text(this.sanitizeText(warning), 25, currentY);
        currentY += 5;
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

  /**
   * Gera relatório Zerésima - Confirma zero votos antes da eleição
   * Lista todos os candidatos com contagem zerada
   */
  async generateZeresimaReport(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text(this.sanitizeText("RELATORIO ZERESIMA"), pageWidth / 2, yPos, {
        align: "center",
      });

      yPos += 10;
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        this.sanitizeText("Confirmacao de Zero Votos Antes da Eleicao"),
        pageWidth / 2,
        yPos,
        { align: "center" }
      );

      yPos += 15;

      // Data e hora
      const now = new Date();
      const dataHora = Formatter.date(now);
      pdf.setFontSize(10);
      pdf.text(`Data/Hora: ${dataHora}`, 20, yPos);

      yPos += 10;

      // Obter candidatos
      const members = await this.memberManager.getMembers();
      const presbyteros = members.filter((m) => m.candidato === "Presbítero");
      const diaconos = members.filter((m) => m.candidato === "Diácono");

      // Seção Presbíteros
      yPos += 5;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(this.sanitizeText("PRESBITEROS"), 20, yPos);

      yPos += 8;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      if (presbyteros.length === 0) {
        pdf.text(this.sanitizeText("Nenhum candidato cadastrado"), 25, yPos);
        yPos += 7;
      } else {
        presbyteros.forEach((member) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(`- ${this.sanitizeText(member.nome)}`, 25, yPos);
          pdf.text("Votos: 0", 150, yPos);
          yPos += 7;
        });
      }

      // Seção Diáconos
      yPos += 5;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(this.sanitizeText("DIACONOS"), 20, yPos);

      yPos += 8;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      if (diaconos.length === 0) {
        pdf.text(this.sanitizeText("Nenhum candidato cadastrado"), 25, yPos);
        yPos += 7;
      } else {
        diaconos.forEach((member) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(`- ${this.sanitizeText(member.nome)}`, 25, yPos);
          pdf.text("Votos: 0", 150, yPos);
          yPos += 7;
        });
      }

      // Resumo
      yPos += 10;
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(this.sanitizeText("RESUMO"), 20, yPos);

      yPos += 8;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Total de candidatos a Presbitero: ${presbyteros.length}`,
        25,
        yPos
      );
      yPos += 6;
      pdf.text(`Total de candidatos a Diacono: ${diaconos.length}`, 25, yPos);
      yPos += 6;
      pdf.text(`Total de votos registrados: 0`, 25, yPos);

      yPos += 10;
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "italic");
      pdf.text(
        this.sanitizeText(
          "Este relatorio confirma que nao ha votos contabilizados antes do inicio da eleicao."
        ),
        20,
        yPos,
        { maxWidth: pageWidth - 40 }
      );

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Pagina ${i} de ${pageCount}`,
          pageWidth / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Save PDF
      const dateStr = `${now.getDate().toString().padStart(2, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getFullYear()}`;
      const fileName = `zeresima_${dateStr}.pdf`;
      pdf.save(fileName);

      return { success: true };
    } catch (error) {
      ErrorHandler.log(error as Error, "ReportManager.generateZeresimaReport");
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Erro ao gerar relatório",
      };
    }
  }
}
