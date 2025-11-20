// Gerenciador principal da interface do usuário

import { electionApp } from "@/app";
import { NotificationService } from "./notifications";
import type {
  Member,
  CandidateRole,
  MemberType,
  Candidate,
  QuorumConfig,
} from "@/types";
import { EventTypes, StorageKeys } from "@/types";
import { RealtimeSync } from "@/utils";
import { EventSystem } from "@/utils/events";
import { uploadImage, deleteFileByUrl } from "@/utils/storage";
import { resizeImage, generateThumbnail } from "@/utils/image";
import { AuthManager } from "@/modules/auth/manager";
import type { User } from "@/types/auth";
import { UserRole } from "@/types/auth";
import { AuditManager } from "@/modules/audit";
import { ReportManager } from "@/modules/reports";
import { VotingManager } from "@/modules/voting";
import { dialogService } from "./dialog";

export class UIManager {
  private static instance: UIManager;
  private debounceTimers: Map<string, number> = new Map();
  // Acessibilidade: Armazena o elemento que abriu o modal
  private lastFocusedElement: HTMLElement | null = null;
  private activeModal: HTMLElement | null = null;
  // Flag para evitar chamadas duplicadas ao fechar fullscreen
  private isClosingFullscreen: boolean = false;
  // ✅ OTIMIZAÇÃO: Flag para desabilitar event listeners durante votação
  private isVotingInProgress: boolean = false;
  // Pending attendance toggle awaiting confirmation
  private pendingAttendance: {
    memberId: string;
    checkbox: HTMLInputElement;
  } | null = null;

  // Paginação de membros
  private currentPage: number = 1;
  private itemsPerPage: number = 10;
  private totalMembers: Member[] = [];
  private isSearchActive: boolean = false;

  // Paginação de presença
  private currentAttendancePage: number = 1;
  private attendanceItemsPerPage: number = 10;
  private totalAttendanceMembers: Member[] = [];

  static getInstance(): UIManager {
    if (!UIManager.instance) {
      UIManager.instance = new UIManager();
    }
    return UIManager.instance;
  }

  async initialize(): Promise<void> {
    // Ativar sincronização do Firebase (RealtimeSync)
    RealtimeSync.getInstance().enable();

    this.setupEventListeners();
    this.setupTabNavigation();
    this.setupModals();
    this.setupSystemEventListeners();
    await this.loadInitialData();
    this.initializeDarkMode();
    this.initializeBulkAttendanceToggle();
    this.updateUserInfoOnInit();
  }

  /**
   * Abre o modal de configuração de quórum.
   * ✅ Método público para ser chamado externamente (ex: app.ts)
   */
  public async openQuorumConfigModal(): Promise<void> {
    await this.handleConfigQuorum();
  }

  private initializeDarkMode(): void {
    // Carregar preferência salva
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    const toggle = document.getElementById(
      "dark-mode-toggle"
    ) as HTMLInputElement;

    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      if (toggle) toggle.checked = true;
    }
  }

  private initializeBulkAttendanceToggle(): void {
    // Sempre iniciar desmarcado ao carregar a página
    const toggle = document.getElementById(
      "bulk-attendance-toggle"
    ) as HTMLInputElement;
    if (toggle) {
      toggle.checked = false;
    }
  }

  /**
   * Tocar som de confirmação de voto (sucesso)
   * Usa Web Audio API para gerar um som agradável
   */
  private playSuccessSound(): void {
    try {
      // Criar contexto de áudio
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Frequências harmônicas para um som agradável (acorde maior)
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
      const duration = 1.5; // ✅ 3 segundos (aumentado de 0.3s)
      const now = audioContext.currentTime;

      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = "sine";
        oscillator.frequency.value = freq;

        // ✅ Volume aumentado e envelope ajustado para 3 segundos
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.4, now + 0.1); // Attack mais alto (0.15 → 0.4)
        gainNode.gain.linearRampToValueAtTime(0.3, now + 1.0); // Sustain por 2.5s
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // Release suave

        oscillator.start(now + index * 0.05); // Arpejo suave
        oscillator.stop(now + duration + index * 0.05);
      });
    } catch (error) {
      console.warn(
        "[UIManager] Não foi possível tocar som de confirmação:",
        error
      );
    }
  }

  private setupEventListeners(): void {
    // ✅ OTIMIZAÇÃO: Debounce do contador de votos (evita chamadas múltiplas)
    let voteCountUpdateTimeout: number | null = null;

    // Audit system - atualizar contador quando voto é registrado
    EventSystem.getInstance().on(EventTypes.VOTE_RECORDED, () => {
      // Debounce: aguardar 100ms antes de atualizar
      if (voteCountUpdateTimeout) {
        clearTimeout(voteCountUpdateTimeout);
      }

      voteCountUpdateTimeout = window.setTimeout(() => {
        const votesCountEl = document.getElementById("votes-count");
        if (votesCountEl) {
          const auditManager = AuditManager.getInstance();
          votesCountEl.textContent = String(auditManager.getVotesCount());
        }
        voteCountUpdateTimeout = null;
      }, 100);
    });

    // Voting closed - mostrar tela de encerramento
    EventSystem.getInstance().on(
      EventTypes.VOTING_CLOSED,
      async (data: any) => {
        NotificationService.info(
          `Votação encerrada: ${data.totalVotes} votos registrados de ${data.presentMembers} presentes`
        );
        // Atualizar tela de agradecimento para mostrar encerramento
        await this.showThankYouScreen();
      }
    );

    // Header actions
    document
      .getElementById("export-btn")
      ?.addEventListener("click", this.handleExport.bind(this));
    document
      .getElementById("import-btn")
      ?.addEventListener("click", this.handleImport.bind(this));
    document
      .getElementById("report-btn")
      ?.addEventListener("click", this.handleReport.bind(this));
    document
      .getElementById("settings-btn")
      ?.addEventListener("click", this.handleSettings.bind(this));

    // User info actions
    document
      .getElementById("logout-btn")
      ?.addEventListener("click", this.handleLogout.bind(this));

    // Member actions
    document
      .getElementById("download-template")
      ?.addEventListener("click", this.handleDownloadTemplate.bind(this));
    document
      .getElementById("import-csv")
      ?.addEventListener("click", this.handleImportCSV.bind(this));
    document
      .getElementById("add-member")
      ?.addEventListener("click", this.handleAddMember.bind(this));
    const memberSearchInput = document.getElementById(
      "member-search"
    ) as HTMLInputElement | null;
    const clearBtn = document.getElementById(
      "clear-member-search"
    ) as HTMLButtonElement | null;
    if (memberSearchInput) {
      memberSearchInput.addEventListener("input", (e) => {
        this.handleMemberSearch(e);
        if (clearBtn) {
          clearBtn.style.display =
            memberSearchInput.value.length > 0 ? "flex" : "none";
        }
      });
      // Adicionar atalho de teclado Escape para limpar busca
      memberSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          memberSearchInput.value = "";
          if (clearBtn) {
            clearBtn.style.display = "none";
          }
          memberSearchInput.dispatchEvent(new Event("input"));
          memberSearchInput.focus();
        }
      });
      // Estado inicial do botão
      if (clearBtn) {
        clearBtn.style.display =
          memberSearchInput.value.length > 0 ? "flex" : "none";
        clearBtn.addEventListener("click", () => {
          memberSearchInput.value = "";
          clearBtn.style.display = "none";
          memberSearchInput.dispatchEvent(new Event("input"));
          memberSearchInput.focus();
        });
      }
    }

    // Pagination controls - Members
    document
      .getElementById("pagination-first")
      ?.addEventListener("click", () => this.goToPage(1));
    document
      .getElementById("pagination-prev")
      ?.addEventListener("click", () => this.goToPage(this.currentPage - 1));
    document
      .getElementById("pagination-next")
      ?.addEventListener("click", () => this.goToPage(this.currentPage + 1));
    document
      .getElementById("pagination-last")
      ?.addEventListener("click", () => {
        const totalPages = Math.ceil(
          this.totalMembers.length / this.itemsPerPage
        );
        this.goToPage(totalPages);
      });

    // Pagination controls - Attendance
    document
      .getElementById("attendance-pagination-first")
      ?.addEventListener("click", () => this.goToAttendancePage(1));
    document
      .getElementById("attendance-pagination-prev")
      ?.addEventListener("click", () =>
        this.goToAttendancePage(this.currentAttendancePage - 1)
      );
    document
      .getElementById("attendance-pagination-next")
      ?.addEventListener("click", () =>
        this.goToAttendancePage(this.currentAttendancePage + 1)
      );
    document
      .getElementById("attendance-pagination-last")
      ?.addEventListener("click", () => {
        const totalPages = Math.ceil(
          this.totalAttendanceMembers.length / this.attendanceItemsPerPage
        );
        this.goToAttendancePage(totalPages);
      });

    // Candidate actions
    document
      .getElementById("add-candidate")
      ?.addEventListener("click", this.handleAddCandidate.bind(this));
    document
      .getElementById("fullscreen-presbyteros")
      ?.addEventListener("click", () => this.openFullscreen("Presbítero"));
    document
      .getElementById("fullscreen-diaconos")
      ?.addEventListener("click", () => this.openFullscreen("Diácono"));

    // Botão de fechar fullscreen (oculto, mas mantido para acessibilidade)
    const exitFullscreenBtn = document.getElementById("exit-fullscreen");
    if (exitFullscreenBtn) {
      exitFullscreenBtn.addEventListener(
        "click",
        this.closeFullscreen.bind(this)
      );
      // Ocultar botão por padrão
      (exitFullscreenBtn as HTMLElement).style.display = "none";
    }

    // Interceptar tecla Escape durante votação
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const fullscreenView = document.getElementById("fullscreen-view");
        if (fullscreenView && fullscreenView.style.display !== "none") {
          e.preventDefault();
          e.stopPropagation(); // Prevenir propagação do evento
          this.closeFullscreen();
        }
      }
    });

    // Detectar saída do fullscreen nativo (F11, Escape, etc.)
    document.addEventListener("fullscreenchange", () => {
      const fullscreenView = document.getElementById("fullscreen-view");

      // Se saiu do fullscreen mas a view ainda está visível, fechá-la
      if (
        !document.fullscreenElement &&
        fullscreenView &&
        fullscreenView.style.display !== "none"
      ) {
        // Dar um pequeno delay para evitar conflito com o Escape
        setTimeout(() => {
          this.closeFullscreen();
        }, 100);
      }
    });

    // Interceptar botão voltar (mobile) durante votação
    window.addEventListener("popstate", (e) => {
      if (e.state?.fullscreenVoting) {
        e.preventDefault();
        this.closeFullscreen();
      }
    });

    // Photo upload
    document
      .getElementById("upload-photo-btn")
      ?.addEventListener("click", () => {
        document.getElementById("candidate-photo")?.click();
      });
    document
      .getElementById("candidate-photo")
      ?.addEventListener("change", this.handlePhotoUpload.bind(this));
    document
      .getElementById("remove-photo-btn")
      ?.addEventListener("click", this.handleRemovePhoto.bind(this));

    // Voting actions
    document
      .getElementById("config-quorum")
      ?.addEventListener("click", this.handleConfigQuorum.bind(this));

    // Zerésima button - gera relatório com zero votos
    document
      .getElementById("zeresima-btn")
      ?.addEventListener("click", this.handleZeresima.bind(this));

    // Start voting (full flow)
    const startVotingBtn = document.getElementById("start-voting-btn");
    if (startVotingBtn) {
      startVotingBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleStartVoting();
      });
    }

    // Attendance actions
    document
      .getElementById("attendance-search")
      ?.addEventListener("input", this.handleAttendanceSearch.bind(this));

    // Results actions
    document
      .getElementById("refresh-results")
      ?.addEventListener("click", this.handleRefreshResults.bind(this));

    // Users actions
    document
      .getElementById("add-user")
      ?.addEventListener("click", this.handleAddUser.bind(this));

    // File inputs
    document
      .getElementById("csv-file-input")
      ?.addEventListener("change", this.handleCSVFileSelected.bind(this));
    document
      .getElementById("json-file-input")
      ?.addEventListener("change", this.handleJSONFileSelected.bind(this));

    // Info icon buttons
    this.setupInfoTooltips();
  }

  private setupTabNavigation(): void {
    const tabs = document.querySelectorAll(".nav-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLElement;
        const tabName = target.dataset.tab;
        if (tabName) {
          this.switchTab(tabName);
        }
      });
    });
  }

  private setupModals(): void {
    // Setup modal close handlers
    document.querySelectorAll(".modal-close, .modal-cancel").forEach((btn) => {
      btn.addEventListener("click", this.closeAllModals.bind(this));
    });

    // Setup form handlers
    document
      .getElementById("member-form")
      ?.addEventListener("submit", this.handleMemberSubmit.bind(this));
    document
      .getElementById("candidate-form")
      ?.addEventListener("submit", this.handleCandidateSubmit.bind(this));
    document
      .getElementById("quorum-form")
      ?.addEventListener("submit", this.handleQuorumSubmit.bind(this));
    document
      .getElementById("user-form")
      ?.addEventListener("submit", this.handleUserSubmit.bind(this));

    // Setup dark mode toggle
    document
      .getElementById("dark-mode-toggle")
      ?.addEventListener("change", this.handleDarkModeToggle.bind(this));

    // Setup bulk attendance toggle
    document
      .getElementById("bulk-attendance-toggle")
      ?.addEventListener("change", this.handleBulkAttendanceToggle.bind(this));

    // Setup delete all members button
    document
      .getElementById("delete-all-members-btn")
      ?.addEventListener("click", this.handleDeleteAllMembers.bind(this));

    // Setup sync votes button
    document
      .getElementById("sync-votes-btn")
      ?.addEventListener("click", this.handleSyncVotes.bind(this));

    // Setup toggle de senha no modal de usuário
    const toggleUserPassword = document.getElementById("toggle-user-password");
    const userPasswordInput = document.getElementById(
      "user-password"
    ) as HTMLInputElement;
    if (toggleUserPassword && userPasswordInput) {
      toggleUserPassword.addEventListener("click", () => {
        const icon = toggleUserPassword.querySelector(".material-icons");
        if (userPasswordInput.type === "password") {
          userPasswordInput.type = "text";
          if (icon) icon.textContent = "visibility_off";
        } else {
          userPasswordInput.type = "password";
          if (icon) icon.textContent = "visibility";
        }
      });
    }

    // Close modals on backdrop click
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeAllModals();
        }
      });
      // Adiciona listener de teclado para o focus trap
      modal.addEventListener("keydown", (event) =>
        this.handleFocusTrap(event as KeyboardEvent)
      );
    });
  }

  private setupSystemEventListeners(): void {
    // ✅ CRÍTICO: Ouvir importação de membros (carregamento inicial do Firebase)
    electionApp.events.on(
      EventTypes.MEMBERS_IMPORTED,
      async (data: { count: number }) => {
        // ✅ OTIMIZAÇÃO: Ignorar durante votação para não causar lentidão
        if (this.isVotingInProgress) {
          return;
        }

        console.log(
          `[UIManager] 📥 Evento MEMBERS_IMPORTED recebido: ${data.count} membros carregados do Firebase`
        );

        // ✅ CORREÇÃO: Usar debounce para atualizar estatísticas
        this.debouncedUpdateStats();

        // Recarregar aba atual para exibir dados do Firebase
        const currentTab = this.getCurrentTab();

        if (currentTab === "members") {
          await this.loadMembersData();
        } else if (currentTab === "candidates") {
          await this.loadCandidatesData();
        } else if (currentTab === "attendance") {
          await this.loadAttendanceData();
        } else if (currentTab === "voting") {
          await this.loadVotingData();
        } else if (currentTab === "results") {
          await this.loadResultsData();
        }
      }
    );

    // Ouvir atualizações de membros para sincronizar a aba de Candidatos
    electionApp.events.on(EventTypes.MEMBER_UPDATED, async (member: Member) => {
      console.log(
        "[UIManager] Evento MEMBER_UPDATED recebido:",
        member.nome,
        "candidato:",
        member.candidato
      );

      // ✅ SEMPRE atualizar aba de Candidatos para manter sincronização
      // Casos cobertos:
      // 1. Membro virou candidato
      // 2. Nome do candidato mudou
      // 3. Foto do candidato mudou
      // 4. Candidato deixou de ser candidato
      // 5. Tipo de candidato mudou (Presbítero ↔ Diácono)
      await this.loadCandidatesData();
    });

    // Ouvir deleção de membros para sincronizar a aba de Candidatos
    electionApp.events.on(EventTypes.MEMBER_DELETED, async () => {
      await this.loadCandidatesData();
    });

    // Ouvir atualizações de presença para atualizar contador e status de quórum
    electionApp.events.on(EventTypes.ATTENDANCE_SAVED, async () => {
      // ✅ OTIMIZAÇÃO: Ignorar durante votação para não causar lentidão
      if (this.isVotingInProgress) {
        return;
      }

      // ✅ CORREÇÃO: Usar debounce para atualizar estatísticas
      this.debouncedUpdateStats();

      // ✅ CORREÇÃO: Recarregar apenas aba atual (evita múltiplas chamadas de getAttendanceStats)
      const currentTab = this.getCurrentTab();

      if (currentTab === "attendance") {
        await this.loadAttendanceData();
      } else if (currentTab === "voting") {
        await this.loadVotingData();
      }
    });

    // ✅ CRÍTICO: Ouvir sincronização remota do Firebase para atualizar quórum
    electionApp.events.on(
      EventTypes.SYNC_MEMBERS_UPDATED,
      async (members: Member[]) => {
        // ✅ OTIMIZAÇÃO: Ignorar durante votação para não causar lentidão
        if (this.isVotingInProgress) {
          return;
        }

        console.log(
          "[UIManager] Evento SYNC_MEMBERS_UPDATED recebido do Firebase:",
          members.length,
          "membros"
        );

        // ✅ CORREÇÃO: Usar debounce para atualizar estatísticas
        this.debouncedUpdateStats();

        // Recarregar dados de todas as abas afetadas
        const currentTab = this.getCurrentTab();

        if (currentTab === "members") {
          await this.loadMembersData();
        } else if (currentTab === "candidates") {
          await this.loadCandidatesData();
        } else if (currentTab === "attendance") {
          await this.loadAttendanceData();
        } else if (currentTab === "voting") {
          // ✅ Recarregar votação para atualizar quórum com dados do Firebase
          await this.loadVotingData();
        } else if (currentTab === "results") {
          await this.loadResultsData();
        }
      }
    );

    // Ouvir sincronização de configurações do Firebase
    electionApp.events.on(EventTypes.SYNC_CONFIG_UPDATED, async () => {
      // Recarregar aba de votação se estiver ativa (para atualizar quórum)
      const currentTab = this.getCurrentTab();
      if (currentTab === "voting") {
        await this.loadVotingData();
      }
    });

    // ✅ NOVO: Ouvir quando configuração de quórum é necessária
    electionApp.events.on(
      EventTypes.QUORUM_CONFIG_REQUIRED,
      async (data: { reason: string; source: string }) => {
        console.log(
          "[UIManager] 📋 Evento QUORUM_CONFIG_REQUIRED recebido:",
          data
        );

        // Abrir modal de configuração de quórum
        await this.handleConfigQuorum();
      }
    );
  }

  private getCurrentTab(): string {
    const activeTab = document.querySelector(".nav-tab.active");
    return activeTab?.getAttribute("data-tab") || "members";
  }

  private setupInfoTooltips(): void {
    // Gerenciar cliques nos ícones de informação
    document.querySelectorAll(".info-icon-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const button = e.currentTarget as HTMLElement;
        const infoId = button.dataset.info;

        if (!infoId) return;

        const tooltip = document.getElementById(infoId);
        if (!tooltip) return;

        // Toggle visibility
        if (tooltip.style.display === "none" || !tooltip.style.display) {
          tooltip.style.display = "block";
          button.classList.add("active");
        } else {
          tooltip.style.display = "none";
          button.classList.remove("active");
        }
      });
    });

    // Fechar tooltips ao clicar fora
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      // Se clicou fora de um botão de info e fora de um tooltip
      if (
        !target.closest(".info-icon-btn") &&
        !target.closest(".info-tooltip")
      ) {
        document.querySelectorAll(".info-tooltip").forEach((tooltip) => {
          (tooltip as HTMLElement).style.display = "none";
        });
        document.querySelectorAll(".info-icon-btn").forEach((btn) => {
          btn.classList.remove("active");
        });
      }
    });
  }

  private switchTab(tabName: string): void {
    // Update nav tabs
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.classList.remove("active");
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add("active");

    // Update tab content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });
    document.getElementById(`${tabName}-tab`)?.classList.add("active");

    // Load tab-specific data
    this.loadTabData(tabName);
  }

  private async loadTabData(tabName: string): Promise<void> {
    try {
      switch (tabName) {
        case "members":
          await this.loadMembersData();
          break;
        case "candidates":
          await this.loadCandidatesData();
          break;
        case "voting":
          await this.loadVotingData();
          break;
        case "attendance":
          await this.loadAttendanceData();
          break;
        case "results":
          await this.loadResultsData();
          break;
        case "users":
          await this.loadUsersData();
          break;
      }
    } catch (error) {
      console.error(`Erro ao carregar dados da aba ${tabName}:`, error);
      NotificationService.error(`Erro ao carregar dados da aba ${tabName}`);
    }
  }

  private async loadInitialData(): Promise<void> {
    await this.loadMembersData();
  }

  // Members
  private async loadMembersData(): Promise<void> {
    const members = await electionApp.getMembers();
    this.totalMembers = members;
    this.isSearchActive = false;
    this.currentPage = 1;
    await this.renderMembersTable(members);
    await this.updateStats();
  }

  private async renderMembersTable(members: Member[]): Promise<void> {
    const tbody = document.getElementById("members-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (members.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">
            ${this.isSearchActive ? "Nenhum membro encontrado." : "Nenhum membro cadastrado."}
            ${!this.isSearchActive ? '<button class="btn btn-link" onclick="document.getElementById(\'add-member\')?.click()">Adicionar primeiro membro</button>' : ""}
          </td>
        </tr>
      `;
      this.hidePagination();
      return;
    }

    // Ordenar membros por ordem alfabética (nome)
    const sortedMembers = [...members].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );

    // Calcular paginação
    const totalPages = Math.ceil(sortedMembers.length / this.itemsPerPage);

    // Ajustar página atual se exceder total de páginas
    if (this.currentPage > totalPages) {
      this.currentPage = Math.max(1, totalPages);
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(
      startIndex + this.itemsPerPage,
      sortedMembers.length
    );
    const paginatedMembers = sortedMembers.slice(startIndex, endIndex);

    // FASE 7: Usar Member.presente diretamente (SSOT)
    paginatedMembers.forEach((member) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${this.escapeHtml(member.nome)}</td>
        <td>${this.escapeHtml(member.cpf || "-")}</td>
        <td>${this.escapeHtml(member.email || "-")}</td>
        <td>${member.tipo || "-"}</td>
        <td>${member.candidato || "-"}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="editMember('${member.id}')" title="Editar">
            <span class="material-icons md-18">edit</span>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteMember('${member.id}')" title="Excluir">
            <span class="material-icons md-18">delete</span>
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Atualizar controles de paginação
    this.updatePaginationControls(
      sortedMembers.length,
      startIndex,
      endIndex,
      totalPages
    );
  }

  private async renderAttendanceList(): Promise<void> {
    const container = document.getElementById("attendance-list");
    if (!container) return;

    const members = await electionApp.getMembers();
    this.totalAttendanceMembers = members;

    if (members.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="material-icons md-48">people</span>
          <p>Nenhum membro cadastrado</p>
          <small style="color: var(--gray-500); margin-top: 0.5rem;">
            Adicione membros na aba "Membros" para marcar presença
          </small>
        </div>
      `;
      this.hideAttendancePagination();
      return;
    }

    // Ordenar membros por ordem alfabética (nome)
    const sortedMembers = [...members].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );

    // Calcular paginação
    const totalPages = Math.ceil(
      sortedMembers.length / this.attendanceItemsPerPage
    );

    // Ajustar página atual se exceder total de páginas
    if (this.currentAttendancePage > totalPages) {
      this.currentAttendancePage = Math.max(1, totalPages);
    }

    const startIndex =
      (this.currentAttendancePage - 1) * this.attendanceItemsPerPage;
    const endIndex = Math.min(
      startIndex + this.attendanceItemsPerPage,
      sortedMembers.length
    );
    const paginatedMembers = sortedMembers.slice(startIndex, endIndex);

    // Criar lista de presença (apenas membros da página atual)
    const attendanceItems = paginatedMembers.map((member) => {
      const isPresent = member.presente || false;
      const memberType = member.tipo || "Não informado";

      return `
        <div class="attendance-item ${isPresent ? "present" : "absent"}">
          <div class="attendance-info">
            <div class="attendance-name">${this.escapeHtml(member.nome)}</div>
            <div class="attendance-type">${memberType}</div>
          </div>
          <div class="attendance-controls">
            <label class="toggle-switch">
              <input type="checkbox" data-member-id="${member.id}" class="attendance-toggle" ${isPresent ? "checked" : ""}>
              <span class="toggle-slider"></span>
            </label>
            <div class="attendance-status">
              <span class="status-text ${isPresent ? "present-text" : "absent-text"}">
                ${isPresent ? "Presente" : "Ausente"}
              </span>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="attendance-items">
        ${attendanceItems.join("")}
      </div>
    `;

    // Setup attendance toggles
    container.querySelectorAll(".attendance-toggle").forEach((toggle) => {
      toggle.addEventListener("change", this.handleAttendanceToggle.bind(this));
    });

    // Atualizar controles de paginação
    this.updateAttendancePaginationControls(
      sortedMembers.length,
      startIndex,
      endIndex,
      totalPages
    );
  }

  // Event handlers
  private debounce(
    key: string,
    fn: (...args: any[]) => any,
    delay: number
  ): void {
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = window.setTimeout(() => {
      fn();
      this.debounceTimers.delete(key);
    }, delay);

    this.debounceTimers.set(key, timer);
  }

  private async handleMemberSearch(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const query = input.value.trim();

    this.debounce(
      "member-search",
      async () => {
        if (query.length === 0) {
          await this.loadMembersData();
        } else {
          const results = await electionApp.searchMembers(query);
          this.totalMembers = results;
          this.isSearchActive = true;
          this.currentPage = 1;
          await this.renderMembersTable(results);
        }
      },
      300
    );
  }

  // Métodos de paginação
  private goToPage(page: number): void {
    const totalPages = Math.ceil(this.totalMembers.length / this.itemsPerPage);

    if (page < 1 || page > totalPages) {
      return;
    }

    this.currentPage = page;
    this.renderMembersTable(this.totalMembers);
  }

  private updatePaginationControls(
    totalItems: number,
    startIndex: number,
    endIndex: number,
    totalPages: number
  ): void {
    const paginationContainer = document.getElementById("members-pagination");
    const paginationInfoText = document.getElementById("pagination-info-text");
    const paginationPages = document.getElementById("pagination-pages");
    const firstBtn = document.getElementById(
      "pagination-first"
    ) as HTMLButtonElement;
    const prevBtn = document.getElementById(
      "pagination-prev"
    ) as HTMLButtonElement;
    const nextBtn = document.getElementById(
      "pagination-next"
    ) as HTMLButtonElement;
    const lastBtn = document.getElementById(
      "pagination-last"
    ) as HTMLButtonElement;

    if (!paginationContainer) return;

    // Mostrar/ocultar paginação baseado no número de itens
    if (totalItems <= this.itemsPerPage) {
      this.hidePagination();
      return;
    }

    paginationContainer.style.display = "flex";

    // Atualizar texto informativo
    if (paginationInfoText) {
      paginationInfoText.textContent = `Exibindo ${startIndex + 1}-${endIndex} de ${totalItems} membros`;
    }

    // Atualizar número de páginas
    if (paginationPages) {
      paginationPages.textContent = `Página ${this.currentPage} de ${totalPages}`;
    }

    // Habilitar/desabilitar botões
    if (firstBtn) firstBtn.disabled = this.currentPage === 1;
    if (prevBtn) prevBtn.disabled = this.currentPage === 1;
    if (nextBtn) nextBtn.disabled = this.currentPage === totalPages;
    if (lastBtn) lastBtn.disabled = this.currentPage === totalPages;
  }

  private hidePagination(): void {
    const paginationContainer = document.getElementById("members-pagination");
    if (paginationContainer) {
      paginationContainer.style.display = "none";
    }
  }

  // Métodos auxiliares de paginação - Presença
  private goToAttendancePage(page: number): void {
    const totalPages = Math.ceil(
      this.totalAttendanceMembers.length / this.attendanceItemsPerPage
    );

    if (page < 1 || page > totalPages) {
      return;
    }

    this.currentAttendancePage = page;
    this.renderAttendanceList();
  }

  private updateAttendancePaginationControls(
    totalItems: number,
    startIndex: number,
    endIndex: number,
    totalPages: number
  ): void {
    const paginationContainer = document.getElementById(
      "attendance-pagination"
    );
    const paginationInfoText = document.getElementById(
      "attendance-pagination-info-text"
    );
    const paginationPages = document.getElementById(
      "attendance-pagination-pages"
    );
    const firstBtn = document.getElementById(
      "attendance-pagination-first"
    ) as HTMLButtonElement;
    const prevBtn = document.getElementById(
      "attendance-pagination-prev"
    ) as HTMLButtonElement;
    const nextBtn = document.getElementById(
      "attendance-pagination-next"
    ) as HTMLButtonElement;
    const lastBtn = document.getElementById(
      "attendance-pagination-last"
    ) as HTMLButtonElement;

    if (!paginationContainer) return;

    // Mostrar/ocultar paginação baseado no número de itens
    if (totalItems <= this.attendanceItemsPerPage) {
      this.hideAttendancePagination();
      return;
    }

    paginationContainer.style.display = "flex";

    // Atualizar texto informativo
    if (paginationInfoText) {
      paginationInfoText.textContent = `Exibindo ${startIndex + 1}-${endIndex} de ${totalItems} membros`;
    }

    // Atualizar número de páginas
    if (paginationPages) {
      paginationPages.textContent = `Página ${this.currentAttendancePage} de ${totalPages}`;
    }

    // Habilitar/desabilitar botões
    if (firstBtn) firstBtn.disabled = this.currentAttendancePage === 1;
    if (prevBtn) prevBtn.disabled = this.currentAttendancePage === 1;
    if (nextBtn) nextBtn.disabled = this.currentAttendancePage === totalPages;
    if (lastBtn) lastBtn.disabled = this.currentAttendancePage === totalPages;
  }

  private hideAttendancePagination(): void {
    const paginationContainer = document.getElementById(
      "attendance-pagination"
    );
    if (paginationContainer) {
      paginationContainer.style.display = "none";
    }
  }

  private async handleAttendanceToggle(e: Event): Promise<void> {
    const checkbox = e.target as HTMLInputElement;
    const memberId = checkbox.dataset.memberId;

    if (!memberId) return;

    // Se está tentando MARCAR presença (checked === true), solicitar confirmação
    if (checkbox.checked) {
      // Reverter visual imediatamente e desabilitar o toggle até confirmação
      checkbox.checked = false;
      checkbox.disabled = true;

      // Guardar estado pendente e abrir modal de confirmação
      this.pendingAttendance = { memberId, checkbox };
      this.ensureAttendanceConfirmModalExists();
      this.openAttendanceConfirmModal();
      // Não prosseguir com markAttendance até confirmação
      return;
    }

    // Se está desmarcando presença, processar diretamente
    try {
      const result = await electionApp.markAttendance(memberId, false);
      if (!result.success) {
        checkbox.checked = !checkbox.checked; // Revert
        NotificationService.error(result.error || "Erro ao atualizar presença");
      } else {
        const attendanceItem = checkbox.closest(
          ".attendance-item"
        ) as HTMLElement;
        const statusText = attendanceItem?.querySelector(
          ".status-text"
        ) as HTMLElement;

        if (attendanceItem && statusText) {
          attendanceItem.classList.remove("present");
          attendanceItem.classList.add("absent");
          statusText.classList.remove("present-text");
          statusText.classList.add("absent-text");
          statusText.textContent = "Ausente";
        }

        await this.updateStats();
      }
    } catch (error) {
      checkbox.checked = !checkbox.checked; // Revert
      NotificationService.error("Erro ao atualizar presença");
    }
  }

  // Garante que o modal de confirmação para presença exista no DOM
  private ensureAttendanceConfirmModalExists(): void {
    if (document.getElementById("attendance-confirm-modal")) return;

    const modalHtml = `
      <div id="attendance-confirm-modal" class="modal" role="dialog" aria-modal="true">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="attendance-confirm-title">Confirmar presença</h3>
            <button class="modal-close" aria-label="Fechar">×</button>
          </div>
          <div class="modal-form">
            <form id="attendance-confirm-form">
              <div class="form-group">
                <label for="attendance-first-name">Digite o primeiro nome do membro</label>
                <input id="attendance-first-name" name="firstName" type="text" required class="form-input" placeholder="Digite o primeiro nome" autocomplete="off" />
                <small class="field-hint" id="attendance-hint">Digite o nome <strong id="attendance-expected-name"></strong></small>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn btn-outline modal-cancel">Cancelar</button>
                <button type="submit" class="btn btn-primary">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Re-bind modal close handlers
    document
      .querySelectorAll(
        "#attendance-confirm-modal .modal-close, #attendance-confirm-modal .modal-cancel"
      )
      .forEach((btn) => {
        btn.addEventListener("click", this.closeAllModals.bind(this));
      });

    const form = document.getElementById(
      "attendance-confirm-form"
    ) as HTMLFormElement;
    form?.addEventListener("submit", this.handleAttendanceConfirm.bind(this));
  }

  private async openAttendanceConfirmModal(): Promise<void> {
    this.showModal("attendance-confirm-modal");

    // Buscar o membro para pegar o primeiro nome
    if (this.pendingAttendance) {
      try {
        const members = await electionApp.getMembers();
        const member = members.find(
          (m) => m.id === this.pendingAttendance!.memberId
        );

        if (member) {
          // Extrair primeiro nome
          const firstName = member.nome.trim().split(/\s+/)[0];

          // Atualizar hint com o nome esperado
          const expectedNameEl = document.getElementById(
            "attendance-expected-name"
          );
          if (expectedNameEl) {
            expectedNameEl.textContent = firstName;
          }
        }
      } catch (error) {
        console.error("Erro ao buscar membro:", error);
      }
    }

    // Limpar campo e focar
    const input = document.getElementById(
      "attendance-first-name"
    ) as HTMLInputElement | null;
    if (input) {
      input.value = "";
      input.removeAttribute("aria-invalid");
      requestAnimationFrame(() => input.focus());
    }
  }

  // Handler do submit do modal: valida o primeiro nome e marca presença
  private async handleAttendanceConfirm(e: Event): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.querySelector(
      "#attendance-first-name"
    ) as HTMLInputElement;

    if (!this.pendingAttendance) {
      this.closeAllModals();
      return;
    }

    const { memberId, checkbox } = this.pendingAttendance;
    const inputName = input.value.trim();

    if (!inputName) {
      NotificationService.error("Por favor, digite o primeiro nome do membro");
      input.focus();
      return;
    }

    try {
      // Obter membro para verificar nome
      const members = await electionApp.getMembers();
      const member = members.find((m) => m.id === memberId);
      if (!member) {
        NotificationService.error("Membro não encontrado");
        this.closeAllModals();
        return;
      }

      // Extrair primeiro nome do membro
      const firstName = member.nome.trim().split(/\s+/)[0];

      // Comparar (case-insensitive, removendo acentos)
      const normalize = (str: string) =>
        str
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

      if (normalize(firstName) !== normalize(inputName)) {
        NotificationService.error("Nome incorreto");
        // Reverter checkbox
        checkbox.checked = false;
        this.closeAllModals();
        return;
      }

      // Prefixo válido — marcar presença
      const result = await electionApp.markAttendance(memberId, true);
      if (!result.success) {
        NotificationService.error(result.error || "Erro ao marcar presença");
        try {
          checkbox.checked = false;
          checkbox.disabled = false;
        } catch (err) {
          /* ignore */
        }
      } else {
        // Marcar o checkbox e reabilitá-lo
        try {
          checkbox.checked = true;
          checkbox.disabled = false;
        } catch (err) {
          /* ignore */
        }
        // Atualizar UI
        const attendanceItem = checkbox.closest(
          ".attendance-item"
        ) as HTMLElement;
        const statusText = attendanceItem?.querySelector(
          ".status-text"
        ) as HTMLElement;

        if (attendanceItem && statusText) {
          attendanceItem.classList.remove("absent");
          attendanceItem.classList.add("present");
          statusText.classList.remove("absent-text");
          statusText.classList.add("present-text");
          statusText.textContent = "Presente";
        }

        await this.updateStats();
        NotificationService.success("Presença confirmada");
      }
    } catch (error) {
      console.error("Erro ao confirmar presença:", error);
      NotificationService.error("Erro ao confirmar presença");
      checkbox.checked = false;
    } finally {
      this.pendingAttendance = null;
      this.closeAllModals();
    }
  }

  private async handleAddMember(): Promise<void> {
    const form = document.getElementById("member-form") as HTMLFormElement;
    // Limpar o ID de edição, se houver
    if (form) {
      delete form.dataset.editingId;
    }
    this.showModal("member-modal");
    this.clearForm("member-form");
    document.getElementById("member-modal-title")!.textContent =
      "Adicionar Membro";

    // Configurar listener para habilitar/desabilitar campo candidato
    const typeSelect = document.getElementById(
      "member-type"
    ) as HTMLSelectElement;
    const candidateSelect = document.getElementById(
      "member-candidate"
    ) as HTMLSelectElement;

    if (typeSelect && candidateSelect) {
      // Função para atualizar o estado do campo candidato
      const updateCandidateField = () => {
        const isComungante = typeSelect.value === "Membro Comungante";
        candidateSelect.disabled = !isComungante;

        if (!isComungante) {
          candidateSelect.value = "";
          candidateSelect.title =
            "Apenas Membros Comungantes podem ser candidatos";
        } else {
          candidateSelect.title = "";
        }
      };

      // Configurar estado inicial
      updateCandidateField();

      // Listener para mudanças no tipo
      typeSelect.removeEventListener("change", updateCandidateField);
      typeSelect.addEventListener("change", updateCandidateField);
    }
  }

  private async handleAddCandidate(): Promise<void> {
    await this.populateMemberSelect();
    this.clearForm("candidate-form");

    // MODO ADICIONAR: Mostrar selects, ocultar campos informativos
    const memberSelect = document.getElementById(
      "candidate-member"
    ) as HTMLSelectElement;
    const memberSelectGroup = document
      .querySelector("#candidate-member")
      ?.closest(".form-group") as HTMLElement;
    const roleInput = document.getElementById(
      "candidate-role"
    ) as HTMLSelectElement;
    const roleInputGroup = roleInput?.closest(".form-group") as HTMLElement;
    const candidateInfoGroup = document.getElementById("candidate-info-group");

    if (memberSelectGroup) {
      memberSelectGroup.style.display = "block";
    }
    if (roleInputGroup) {
      roleInputGroup.style.display = "block";
    }
    if (candidateInfoGroup) {
      candidateInfoGroup.style.display = "none";
    }
    // Reativar required nos selects (modo adicionar)
    if (memberSelect) {
      memberSelect.required = true;
    }
    if (roleInput) {
      roleInput.required = true;
    }

    // Atualizar título do modal
    const modalTitle = document.getElementById("candidate-modal-title");
    if (modalTitle) {
      modalTitle.textContent = "Novo Candidato";
    }

    // Resetar preview da foto
    const photoPreview = document.getElementById(
      "candidate-photo-preview"
    ) as HTMLDivElement;
    const removePhotoBtn = document.getElementById(
      "remove-photo-btn"
    ) as HTMLButtonElement;

    if (photoPreview) {
      photoPreview.innerHTML =
        '<span class="material-icons md-48">person</span>';
      photoPreview.style.display = "flex";
    }
    if (removePhotoBtn) {
      removePhotoBtn.style.display = "none";
    }

    this.showModal("candidate-modal");
  }

  private async populateMemberSelect(): Promise<void> {
    const members = await electionApp.getMembers();
    const select = document.getElementById(
      "candidate-member"
    ) as HTMLSelectElement;
    const searchInput = document.getElementById(
      "member-search-input"
    ) as HTMLInputElement;
    const noMembersMessage = document.getElementById("no-members-message");

    if (!select) return;

    // FASE 7: Adicionar apenas membros comungantes que ainda não são candidatos
    // Usar Member.candidato diretamente (SSOT)
    const availableMembers = members.filter(
      (m) => m.tipo === "Membro Comungante" && !m.candidato
    );

    // Armazenar membros disponíveis para busca
    (select as any).availableMembers = availableMembers;

    // Renderizar lista inicial
    this.renderMemberOptions(availableMembers, select);

    // Verificar se há membros disponíveis
    if (availableMembers.length === 0) {
      if (noMembersMessage) {
        noMembersMessage.style.display = "block";
      }
      select.disabled = true;
      if (searchInput) {
        searchInput.disabled = true;
      }
    } else {
      if (noMembersMessage) {
        noMembersMessage.style.display = "none";
      }
      select.disabled = false;
      if (searchInput) {
        searchInput.disabled = false;
        // Limpar busca anterior
        searchInput.value = "";
        // Configurar busca
        searchInput.removeEventListener("input", this.handleMemberSearchInput);
        searchInput.addEventListener(
          "input",
          this.handleMemberSearchInput.bind(this)
        );
      }
    }
  }

  private renderMemberOptions(
    members: Member[],
    select: HTMLSelectElement
  ): void {
    select.innerHTML = "";

    if (members.length === 0) {
      // Se não há membros, mostrar mensagem informativa
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Nenhum membro disponível";
      option.disabled = true;
      option.selected = true;
      select.appendChild(option);
      return;
    }

    members.forEach((member) => {
      const option = document.createElement("option");
      option.value = member.id;
      option.textContent = member.nome;
      option.dataset.memberData = JSON.stringify(member);
      select.appendChild(option);
    });
  }

  private handleMemberSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value.toLowerCase().trim();
    const select = document.getElementById(
      "candidate-member"
    ) as HTMLSelectElement;

    if (!select) return;

    const availableMembers = (select as any).availableMembers || [];

    if (query === "") {
      // Mostrar todos
      this.renderMemberOptions(availableMembers, select);
    } else {
      // Filtrar por nome
      const filtered = availableMembers.filter((m: Member) =>
        m.nome.toLowerCase().includes(query)
      );
      this.renderMemberOptions(filtered, select);
    }
  }

  private async handleMemberSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const editingId = form.dataset.editingId;

    const tipo = formData.get("type") as MemberType;
    const candidato = (formData.get("candidate") as CandidateRole | "") || null;

    // Validação: Apenas Membros Comungantes podem ser candidatos
    if (candidato && tipo !== "Membro Comungante") {
      NotificationService.error(
        "Apenas Membros Comungantes podem ser candidatos a Presbítero ou Diácono"
      );
      return;
    }

    const memberData = {
      nome: formData.get("name") as string,
      tipo: tipo,
      cpf: (formData.get("cpf") as string) || "",
      rg: (formData.get("rg") as string) || "",
      email: (formData.get("email") as string) || "",
      telefone: (formData.get("phone") as string) || "",
      candidato: candidato || null,
    };

    try {
      let result;

      if (editingId) {
        // Modo edição
        result = await electionApp.updateMember(editingId, memberData);
        if (result.success) {
          NotificationService.success("Membro atualizado com sucesso!");
          delete form.dataset.editingId;
          this.closeAllModals();
          await this.loadMembersData();
          await this.updateStats();
          // Sempre recarregar candidatos para manter sincronização
          await this.loadCandidatesData();
        } else {
          NotificationService.error(result.error || "Erro ao atualizar membro");
        }
      } else {
        // Modo criação
        result = await electionApp.addMember(memberData);
        if (result.success) {
          NotificationService.success("Membro adicionado com sucesso!");
          this.closeAllModals();
          await this.loadMembersData();
          await this.updateStats();
        } else {
          NotificationService.error(result.error || "Erro ao adicionar membro");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar membro:", error);
      NotificationService.error("Erro ao salvar membro");
    }
  }

  private async handleDownloadTemplate(): Promise<void> {
    try {
      await electionApp.downloadTemplate();
      NotificationService.success("Template CSV baixado com sucesso!");
    } catch (error) {
      NotificationService.error("Erro ao baixar template");
    }
  }

  private handleImportCSV(): void {
    document.getElementById("csv-file-input")?.click();
  }

  private async handleCSVFileSelected(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      const content = await this.readFileAsText(file);
      const result = await electionApp.importMembers(content);

      if (result.success) {
        const message =
          result.candidatesAdded > 0
            ? `${result.membersAdded} membros e ${result.candidatesAdded} candidatos importados!`
            : `${result.membersAdded} membros importados com sucesso!`;

        NotificationService.success(message);

        if (result.errors && result.errors.length > 0) {
          NotificationService.warning(
            `Importação concluída com ${result.errors.length} aviso(s).`
          );
        }
        await this.loadMembersData();
      } else {
        console.error("[UIManager] ✗ Falha na importação:", result.errors);
        NotificationService.error(
          `Erro na importação do CSV: ${result.errors?.[0] || "Erro desconhecido"}`
        );
      }
    } catch (error) {
      console.error("[UIManager] ✗ Exceção ao processar CSV:", error);
      NotificationService.error("Erro ao processar arquivo CSV");
    }

    // Reset input
    input.value = "";
  }

  private handleSettings(): void {
    this.showModal("settings-modal");
  }

  private async handleLogout(): Promise<void> {
    try {
      const authManager = AuthManager.getInstance();
      await authManager.logout();
      NotificationService.success("Logout realizado com sucesso");

      // Esconder user-info e mostrar tela de login
      this.updateUserInfo(null);

      // Esconder aplicação e mostrar tela de login
      const appContainer = document.getElementById("app");
      const loginScreen = document.getElementById("login-screen");
      const loadingScreen = document.getElementById("loading-screen");

      if (appContainer) appContainer.style.display = "none";
      if (loginScreen) loginScreen.style.display = "flex";
      if (loadingScreen) loadingScreen.style.display = "none";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      NotificationService.error("Erro ao fazer logout");
    }
  }

  private updateUserInfo(user: User | null): void {
    const userInfo = document.getElementById("user-info");
    const userName = document.getElementById("user-name");
    const userRole = document.getElementById("user-role");

    if (!userInfo || !userName || !userRole) return;

    if (user) {
      // Usuário logado - mostrar informações
      userName.textContent = user.displayName || user.email || "Usuário";
      userRole.textContent = this.getRoleDisplayName(user.role);
      userInfo.style.display = "flex";
    } else {
      // Usuário não logado - esconder informações
      userInfo.style.display = "none";
    }
  }

  private updateUserInfoOnInit(): void {
    const authManager = AuthManager.getInstance();
    const currentUser = authManager.getCurrentUser();
    this.updateUserInfo(currentUser);

    // Escutar mudanças no estado de autenticação
    authManager.subscribe((state) => {
      this.updateUserInfo(state.user);
    });
  }

  private getRoleDisplayName(role: string | undefined): string {
    switch (role) {
      case "admin":
        return "Admin";
      case "moderator":
        return "Moderador";
      case "user":
        return "Usuário";
      default:
        return "Usuário";
    }
  }

  /**
   * Verifica se o usuário atual é administrador
   * Método reutilizável para evitar repetição de código
   */
  private isCurrentUserAdmin(): boolean {
    const authManager = AuthManager.getInstance();
    const currentUser = authManager.getCurrentUser();
    return currentUser?.role === "admin";
  }

  private handleDarkModeToggle(e: Event): void {
    const checkbox = e.target as HTMLInputElement;
    const isDarkMode = checkbox.checked;

    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "true");
      NotificationService.success("Modo noturno ativado");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "false");
      NotificationService.success("Modo claro ativado");
    }
  }

  private async handleBulkAttendanceToggle(e: Event): Promise<void> {
    const checkbox = e.target as HTMLInputElement;
    const markAsPresent = checkbox.checked;

    const action = markAsPresent ? "marcar" : "desmarcar";
    const confirmed = await dialogService.confirm({
      title: `${markAsPresent ? "Marcar" : "Desmarcar"} Presença em Massa`,
      message: `Tem certeza que deseja ${action} a presença de TODOS os membros? Esta ação será sincronizada com o Firebase.`,
      confirmText: "Sim, continuar",
      cancelText: "Cancelar",
      icon: "how_to_reg",
    });

    if (!confirmed) {
      // Reverter o toggle se cancelado
      checkbox.checked = !markAsPresent;
      return;
    }

    try {
      const members = await electionApp.getMembers();
      let updatedCount = 0;

      for (const member of members) {
        const result = await electionApp.markAttendance(
          member.id,
          markAsPresent
        );
        if (result.success) {
          updatedCount++;
        }
      }

      NotificationService.success(
        `Presença ${markAsPresent ? "marcada" : "desmarcada"} para ${updatedCount} membros`
      );

      // Recarregar dados
      await this.loadAttendanceData();
    } catch (error) {
      console.error("Error in bulk attendance toggle:", error);
      NotificationService.error("Erro ao atualizar presença em massa");
      // Reverter o toggle em caso de erro
      checkbox.checked = !markAsPresent;
    }
  }

  private async handleDeleteAllMembers(): Promise<void> {
    const confirmed = await dialogService.confirm({
      title: "⚠️ ATENÇÃO: Exclusão Total",
      message:
        "Você está prestes a EXCLUIR PERMANENTEMENTE todos os membros do sistema. Esta ação é IRREVERSÍVEL e será sincronizada com o Firebase. Todos os dados de membros, candidatos e votos serão perdidos. Deseja realmente continuar?",
      confirmText: "Sim, excluir tudo",
      cancelText: "Cancelar",
      icon: "delete_forever",
    });

    if (!confirmed) {
      return;
    }

    // Segunda confirmação para ações críticas
    const doubleConfirmed = await dialogService.confirm({
      title: "Confirmação Final",
      message:
        "Esta é sua última chance. Confirme novamente que deseja excluir TODOS os membros permanentemente.",
      confirmText: "Confirmar exclusão",
      cancelText: "Cancelar",
      icon: "warning",
    });

    if (!doubleConfirmed) {
      return;
    }

    try {
      const members = await electionApp.getMembers();
      const totalMembers = members.length;

      if (totalMembers === 0) {
        NotificationService.info("Não há membros para excluir");
        return;
      }

      // Excluir todos os membros
      let deletedCount = 0;
      for (const member of members) {
        const result = await electionApp.deleteMember(member.id);
        if (result.success) {
          deletedCount++;
        }
      }

      NotificationService.success(
        `${deletedCount} de ${totalMembers} membros excluídos com sucesso`
      );

      // Recarregar todas as páginas que dependem de membros
      await this.loadInitialData();
    } catch (error) {
      console.error("Error deleting all members:", error);
      NotificationService.error("Erro ao excluir membros");
    }
  }

  /**
   * Forçar sincronização de votos com Firebase
   */
  private async handleSyncVotes(): Promise<void> {
    const confirmed = await dialogService.confirm({
      title: "Sincronizar Votos",
      message:
        "Esta ação forçará o recarregamento de todos os votos do Firebase, substituindo qualquer dado local. Use apenas se houver discrepância entre o contador local e o Firebase. Deseja continuar?",
      confirmText: "Sim, sincronizar",
      cancelText: "Cancelar",
      icon: "cloud_sync",
    });

    if (!confirmed) {
      return;
    }

    try {
      const auditManager = AuditManager.getInstance();
      await auditManager.reloadFromFirebase();

      // Atualizar UI se estiver na página de votação
      const currentTab = this.getCurrentTab();
      if (currentTab === "voting") {
        await this.loadVotingData();
      }
    } catch (error) {
      console.error("[UIManager] Erro ao sincronizar votos:", error);
      NotificationService.error("Erro ao sincronizar com Firebase");
    }
  }

  private async handleExport(): Promise<void> {
    try {
      const result = await electionApp.exportData();
      if (result.success) {
        NotificationService.success("Dados exportados com sucesso!");
      } else {
        NotificationService.error(result.error || "Erro ao exportar dados");
      }
    } catch (error) {
      NotificationService.error("Erro ao exportar dados");
    }
  }

  private handleImport(): void {
    document.getElementById("json-file-input")?.click();
  }

  private async handleJSONFileSelected(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      const content = await this.readFileAsText(file);
      const result = await electionApp.importData(content);

      if (result.success) {
        NotificationService.success("Dados importados com sucesso!");
        await this.loadInitialData();
      } else {
        NotificationService.error(result.error || "Erro ao importar dados");
      }
    } catch (error) {
      NotificationService.error("Erro ao processar arquivo de dados");
    }

    // Reset input
    input.value = "";
  }

  private async handleReport(): Promise<void> {
    try {
      NotificationService.info("Gerando relatório PDF...");
      const result = await electionApp.generateReport();

      if (result.success) {
        NotificationService.success("Relatório gerado com sucesso!");
      } else {
        NotificationService.error(result.error || "Erro ao gerar relatório");
      }
    } catch (error) {
      NotificationService.error("Erro ao gerar relatório");
    }
  }

  // Utility methods
  private showModal(modalId: string): void {
    this.activeModal = document.getElementById(modalId);
    if (!this.activeModal) return;

    // Salva o elemento que tinha foco antes de abrir o modal
    this.lastFocusedElement = document.activeElement as HTMLElement;

    this.activeModal.classList.add("modal-active");
    document.body.classList.add("modal-open");

    // Foca no primeiro elemento interativo dentro do modal
    const focusableElements = this.activeModal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = Array.from(focusableElements).find(
      (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
    );

    // Usamos requestAnimationFrame para garantir que o elemento esteja visível
    requestAnimationFrame(() => {
      firstFocusable?.focus();
    });
  }

  private closeAllModals(): void {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.classList.remove("modal-active");
    });
    document.body.classList.remove("modal-open");
    this.activeModal = null;

    // Retorna o foco para o elemento que abriu o modal
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
      this.lastFocusedElement = null;
    }

    // Limpar dataset de edição do formulário de membros
    const memberForm = document.getElementById(
      "member-form"
    ) as HTMLFormElement;
    if (memberForm && memberForm.dataset.editingId) {
      delete memberForm.dataset.editingId;
    }

    // Limpar dataset de edição e restaurar campos do formulário de usuário
    const userForm = document.getElementById("user-form") as HTMLFormElement;
    if (userForm && userForm.dataset.editingId) {
      delete userForm.dataset.editingId;

      // Restaurar campo email para estado de criação
      const emailInput = document.getElementById(
        "user-email"
      ) as HTMLInputElement;
      if (emailInput) {
        emailInput.readOnly = false;
        emailInput.style.opacity = "1";
        emailInput.style.cursor = "text";
      }

      // Restaurar campo senha para estado de criação
      const passwordInput = document.getElementById(
        "user-password"
      ) as HTMLInputElement;
      if (passwordInput) {
        passwordInput.disabled = false;
        passwordInput.required = true;
        passwordInput.placeholder = "Mínimo 6 caracteres";
      }

      // Restaurar labels originais
      const emailLabel = document.querySelector(
        'label[for="user-email"]'
      ) as HTMLElement;
      if (emailLabel) {
        emailLabel.textContent = "Email *";
      }

      const passwordLabel = document.querySelector(
        'label[for="user-password"]'
      ) as HTMLElement;
      if (passwordLabel) {
        passwordLabel.textContent = "Senha *";
      }
    }

    // Se havia uma ação de presença pendente (modal de confirmação fechado/cancelado), reverter checkbox
    if (this.pendingAttendance) {
      try {
        this.pendingAttendance.checkbox.disabled = false;
        this.pendingAttendance.checkbox.checked = false;
      } catch (err) {
        // ignore
      }
      this.pendingAttendance = null;
    }
  }

  private handleFocusTrap(event: KeyboardEvent): void {
    if (event.key !== "Tab" || !this.activeModal) return;

    const focusableElements = Array.from(
      this.activeModal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  private clearForm(formId: string): void {
    const form = document.getElementById(formId) as HTMLFormElement;
    if (form) {
      form.reset();
      // Limpar dataset de edição
      if (form.dataset.editingId) {
        delete form.dataset.editingId;
      }

      // Reabilitar campos desabilitados na edição
      if (formId === "user-form") {
        const emailInput = document.getElementById(
          "user-email"
        ) as HTMLInputElement;
        const passwordInput = document.getElementById(
          "user-password"
        ) as HTMLInputElement;

        if (emailInput) emailInput.disabled = false;
        if (passwordInput) {
          passwordInput.style.display = "block";
          passwordInput.required = true;
        }
      }
    }
  }

  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
      reader.readAsText(file);
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * ✅ CORREÇÃO: Debounce para updateStats()
   * Evita múltiplas chamadas quando eventos são disparados em cascata
   */
  private debouncedUpdateStats(): void {
    const timerId = this.debounceTimers.get("updateStats");
    if (timerId) {
      clearTimeout(timerId);
    }

    const newTimerId = window.setTimeout(() => {
      this.updateStats();
      this.debounceTimers.delete("updateStats");
    }, 100); // 100ms de debounce

    this.debounceTimers.set("updateStats", newTimerId);
  }

  private async updateStats(): Promise<void> {
    try {
      // FASE 7: Usar Member.presente diretamente (SSOT)
      const [members, attendanceStats] = await Promise.all([
        electionApp.getMembers(),
        electionApp.getAttendanceStats(),
      ]);

      // Contar apenas Membros Comungantes
      const comungantes = members.filter((m) => m.tipo === "Membro Comungante");

      // Contar não-comungantes e visitantes presentes
      const nonVotingMembers = members.filter(
        (m) => m.tipo === "Membro Não-Comungante" || m.tipo === "Visitante"
      );
      const nonVotingPresent = nonVotingMembers.filter(
        (m) => m.presente === true
      ).length;

      console.log("[updateStats] Attendance stats:", attendanceStats);
      console.log("[updateStats] Membros Comungantes:", comungantes.length);
      console.log("[updateStats] Não-votantes presentes:", nonVotingPresent);

      // Update member stats
      // Total de Membros = apenas comungantes
      this.updateElement("total-members", comungantes.length.toString());

      // Membros Presentes = apenas comungantes presentes
      this.updateElement(
        "present-members",
        attendanceStats.presentMembers?.toString() || "0"
      );

      // Não-Comungantes e Visitantes = não-votantes presentes
      this.updateElement("candidate-members", nonVotingPresent.toString());

      // Update attendance stats
      this.updateElement(
        "attendance-rate",
        `${attendanceStats.attendanceRate?.toFixed(1) || 0}%`
      );
      this.updateElement(
        "attendance-present",
        attendanceStats.presentMembers?.toString() || "0"
      );
      this.updateElement(
        "attendance-absent",
        attendanceStats.absentMembers?.toString() || "0"
      );
    } catch (error) {
      console.error("Erro ao atualizar estatísticas:", error);
    }
  }

  private updateElement(id: string, content: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = content;
    }
  }

  // Placeholder methods for other tabs
  private async loadCandidatesData(): Promise<void> {
    try {
      // Buscar todos os candidatos e separar por cargo
      const allCandidates = await electionApp.getCandidates();

      const presbyteros = allCandidates
        .filter((c) => c.role === "Presbítero")
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
      const diaconos = allCandidates
        .filter((c) => c.role === "Diácono")
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

      // Renderizar Presbíteros
      const presbyterosList = document.getElementById("presbyteros-list");
      if (presbyterosList) {
        if (presbyteros.length === 0) {
          presbyterosList.innerHTML = `
            <div class="empty-state">
              <span class="material-icons md-48">person_off</span>
              <p>Nenhum candidato a Presbítero cadastrado</p>
            </div>
          `;
        } else {
          presbyterosList.innerHTML = presbyteros
            .map((candidate: Candidate) => this.renderCandidateCard(candidate))
            .join("");
        }
      }

      // Renderizar Diáconos
      const diaconosList = document.getElementById("diaconos-list");
      if (diaconosList) {
        if (diaconos.length === 0) {
          diaconosList.innerHTML = `
            <div class="empty-state">
              <span class="material-icons md-48">person_off</span>
              <p>Nenhum candidato a Diácono cadastrado</p>
            </div>
          `;
        } else {
          diaconosList.innerHTML = diaconos
            .map((candidate: Candidate) => this.renderCandidateCard(candidate))
            .join("");
        }
      }

      // Adicionar event listeners
      this.attachCandidateEventListeners();
    } catch (error) {
      console.error("Error loading candidates:", error);
      NotificationService.show("Erro ao carregar candidatos", "error");
    }
  }

  private renderCandidateCard(candidate: Candidate): string {
    const photoHtml = candidate.photoUrl
      ? `<img src="${candidate.photoUrl}" alt="${candidate.name}" />`
      : `<span class="material-icons">person</span>`;

    return `
      <div class="candidate-card" data-id="${candidate.id}">
        <div class="candidate-photo">
          ${photoHtml}
        </div>
        <div class="candidate-info">
          <h4>${candidate.name}</h4>
          <p class="candidate-votes-label">Votos</p>
          <p class="candidate-votes">${candidate.votes}</p>
        </div>
        <div class="candidate-actions">
          <button class="btn btn-sm btn-secondary edit-candidate" data-id="${candidate.id}" title="Editar candidato">
            <span class="material-icons md-18">edit</span>
          </button>
          <button class="btn btn-sm btn-danger remove-candidate" data-id="${candidate.id}" data-role="${candidate.role}" title="Remover candidato">
            <span class="material-icons md-18">delete</span>
          </button>
        </div>
      </div>
    `;
  }

  private attachCandidateEventListeners(): void {
    // Botões de editar
    document.querySelectorAll(".edit-candidate").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const target = e.currentTarget as HTMLElement;
        const candidateId = target.dataset.id;
        if (candidateId) {
          await this.handleEditCandidate(candidateId);
        }
      });
    });

    // Botões de remover
    document.querySelectorAll(".remove-candidate").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const target = e.currentTarget as HTMLElement;
        const candidateId = target.dataset.id;
        const role = target.dataset.role;
        if (candidateId && role) {
          await this.handleRemoveCandidate(candidateId, role as CandidateRole);
        }
      });
    });
  }

  private async handleEditCandidate(candidateId: string): Promise<void> {
    // Buscar dados do candidato
    const allCandidates = await electionApp.getCandidates();
    const candidate = allCandidates.find((c) => c.id === candidateId);

    if (!candidate) {
      NotificationService.show("Candidato não encontrado", "error");
      return;
    }

    // ✅ CORRIGIDO: Buscar o membro correspondente pelo ID (candidate.id === member.id)
    const members = await electionApp.getMembers();
    const member = members.find((m) => m.id === candidate.id);

    if (!member) {
      NotificationService.show("Membro correspondente não encontrado", "error");
      return;
    }

    // Obter elementos do formulário
    const form = document.getElementById("candidate-form") as HTMLFormElement;
    const memberSelect = document.getElementById(
      "candidate-member"
    ) as HTMLSelectElement;
    const memberSelectGroup = document
      .querySelector("#candidate-member")
      ?.closest(".form-group") as HTMLElement;
    const roleInput = document.getElementById(
      "candidate-role"
    ) as HTMLSelectElement;
    const roleInputGroup = roleInput?.closest(".form-group") as HTMLElement;
    const photoPreview = document.getElementById(
      "candidate-photo-preview"
    ) as HTMLDivElement;
    const removePhotoBtn = document.getElementById(
      "remove-photo-btn"
    ) as HTMLButtonElement;

    if (!form || !roleInput) {
      NotificationService.show("Erro ao abrir formulário", "error");
      return;
    }

    // MODO EDIÇÃO: Ocultar select de membro e select de cargo (não editáveis)
    if (memberSelectGroup) {
      memberSelectGroup.style.display = "none";
    }
    if (roleInputGroup) {
      roleInputGroup.style.display = "none";
    }
    // Remover required dos campos ocultos
    if (memberSelect) {
      memberSelect.required = false;
    }
    if (roleInput) {
      roleInput.required = false;
    }

    // Criar campos informativos com nome e cargo (somente leitura)
    let candidateInfoGroup = document.getElementById("candidate-info-group");
    if (!candidateInfoGroup) {
      candidateInfoGroup = document.createElement("div");
      candidateInfoGroup.id = "candidate-info-group";
      candidateInfoGroup.innerHTML = `
        <div class="form-group">
          <label>Nome do Candidato</label>
          <input
            type="text"
            id="candidate-info-name"
            class="form-input"
            readonly
            style="background-color: var(--gray-100); cursor: not-allowed;"
          />
        </div>
        <div class="form-group">
          <label>Cargo</label>
          <input
            type="text"
            id="candidate-info-role"
            class="form-input"
            readonly
            style="background-color: var(--gray-100); cursor: not-allowed;"
          />
        </div>
      `;
      // Inserir antes do campo de cargo original
      roleInputGroup?.insertAdjacentElement("beforebegin", candidateInfoGroup);
    }

    const candidateInfoName = document.getElementById(
      "candidate-info-name"
    ) as HTMLInputElement;
    const candidateInfoRole = document.getElementById(
      "candidate-info-role"
    ) as HTMLInputElement;

    if (candidateInfoName && candidateInfoRole) {
      candidateInfoName.value = candidate.name;
      candidateInfoRole.value =
        candidate.role === "Presbítero" ? "Presbítero" : "Diácono";
      candidateInfoGroup.style.display = "block";
    }

    // Armazenar cargo no dataset (não será editável, mas precisa para salvar)
    form.dataset.candidateRole = candidate.role;

    // Exibir foto se existir
    if (candidate.photoUrl && photoPreview) {
      photoPreview.innerHTML = `<img src="${candidate.photoUrl}" alt="Foto do candidato" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />`;
      photoPreview.style.display = "flex";
      if (removePhotoBtn) removePhotoBtn.style.display = "inline-flex";
    } else {
      photoPreview.innerHTML =
        '<span class="material-icons md-48">person</span>';
      photoPreview.style.display = "flex";
      if (removePhotoBtn) removePhotoBtn.style.display = "none";
    }

    // Salvar dados no formulário para identificar edição
    form.dataset.editingId = candidateId;
    form.dataset.memberId = member.id; // Salvar ID do membro para atualização
    form.dataset.candidateRole = candidate.role; // Já foi definido acima, mas garantir

    // Sempre definir photoUrl, mesmo que seja undefined (para controle de estado)
    if (candidate.photoUrl) {
      form.dataset.photoUrl = candidate.photoUrl;
    } else {
      // Remover photoUrl do dataset se não houver foto
      delete form.dataset.photoUrl;
    }

    // Atualizar título do modal
    const modalTitle = document.getElementById("candidate-modal-title");
    if (modalTitle) {
      modalTitle.textContent = "Editar Candidato";
    }

    // Abrir modal usando método correto
    this.showModal("candidate-modal");
  }

  private async handlePhotoUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      NotificationService.show(
        "Por favor, selecione uma imagem válida",
        "error"
      );
      return;
    }

    // Validar tamanho (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      NotificationService.show("A imagem deve ter no máximo 2MB", "error");
      return;
    }

    // Tentar enviar para Firebase Storage se disponível, senão fallback para base64
    const photoPreview = document.getElementById(
      "candidate-photo-preview"
    ) as HTMLDivElement;
    const removePhotoBtn = document.getElementById(
      "remove-photo-btn"
    ) as HTMLButtonElement;

    try {
      // Gerar imagem redimensionada + thumbnail no cliente
      const resized = await resizeImage(file, 1024, 0.8);
      const thumb = await generateThumbnail(file, 120, 0.7);

      // uploadImage lança se Storage não estiver configurado
      const url = await uploadImage(resized, "photos");
      const thumbUrl = await uploadImage(thumb, "photos/thumbs");

      if (photoPreview) {
        photoPreview.innerHTML = `<img src="${url}" alt="Foto do candidato" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />`;
      }
      if (removePhotoBtn) removePhotoBtn.style.display = "inline-flex";

      const form = document.getElementById("candidate-form") as HTMLFormElement;
      if (form) {
        form.dataset.photoUrl = url;
        form.dataset.photoThumbUrl = thumbUrl;
      }
    } catch (err) {
      // Fallback: converter para base64 (mantém compatibilidade)
      console.warn(
        "Firebase Storage indisponível ou upload falhou, usando base64 fallback",
        err
      );

      // Ler base64 para imagem completa
      const reader = new FileReader();
      reader.onload = async (e) => {
        const photoUrl = e.target?.result as string;

        // Gerar thumbnail em canvas e converter para base64 também
        try {
          const thumbFile = await generateThumbnail(file, 120, 0.7);
          const thumbBase64 = await new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result as string);
            r.onerror = () => rej(new Error("Erro ao gerar base64 do thumb"));
            r.readAsDataURL(thumbFile);
          });

          if (photoPreview) {
            photoPreview.innerHTML = `<img src="${photoUrl}" alt="Foto do candidato" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />`;
          }
          if (removePhotoBtn) removePhotoBtn.style.display = "inline-flex";
          const form = document.getElementById(
            "candidate-form"
          ) as HTMLFormElement;
          if (form) {
            form.dataset.photoUrl = photoUrl;
            form.dataset.photoThumbUrl = thumbBase64;
          }
        } catch (thumbErr) {
          // Se falhar ao gerar thumb, ainda salvar a imagem completa
          if (photoPreview) {
            photoPreview.innerHTML = `<img src="${photoUrl}" alt="Foto do candidato" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />`;
          }
          if (removePhotoBtn) removePhotoBtn.style.display = "inline-flex";
          const form = document.getElementById(
            "candidate-form"
          ) as HTMLFormElement;
          if (form) {
            form.dataset.photoUrl = photoUrl;
            delete form.dataset.photoThumbUrl;
            console.warn("Falha ao gerar thumbnail em fallback:", thumbErr);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  }

  private handleRemovePhoto(): void {
    const photoPreview = document.getElementById(
      "candidate-photo-preview"
    ) as HTMLDivElement;
    const removePhotoBtn = document.getElementById(
      "remove-photo-btn"
    ) as HTMLButtonElement;
    const photoInput = document.getElementById(
      "candidate-photo"
    ) as HTMLInputElement;
    const form = document.getElementById("candidate-form") as HTMLFormElement;

    if (photoPreview) {
      // Restaurar ícone padrão
      photoPreview.innerHTML =
        '<span class="material-icons md-48">person</span>';
    }

    if (removePhotoBtn) {
      removePhotoBtn.style.display = "none";
    }

    if (photoInput) {
      photoInput.value = "";
    }

    if (form) {
      const current = form.dataset.photoUrl;
      const currentThumb = form.dataset.photoThumbUrl;

      // Se for URL do Firebase Storage, tentar deletar tanto imagem completa quanto thumb
      const tryDelete = (url?: string) => {
        if (!url) return;
        if (
          url.startsWith("https://firebasestorage.googleapis.com") ||
          url.startsWith("gs://")
        ) {
          deleteFileByUrl(url).catch((err) =>
            console.warn("Falha ao excluir arquivo no Storage:", err)
          );
        }
      };

      tryDelete(current);
      tryDelete(currentThumb);

      // Marcar como removida (string vazia) ao invés de deletar dataset
      form.dataset.photoUrl = "";
      form.dataset.photoThumbUrl = "";
    }
  }

  private openFullscreen(role: CandidateRole): void {
    console.log("[openFullscreen] Iniciando com role:", role);

    const fullscreenView = document.getElementById("fullscreen-view");
    const candidatesGrid = document.getElementById(
      "fullscreen-candidates-grid"
    );
    const roleTitle = document.getElementById("fullscreen-role-title");

    if (!fullscreenView || !candidatesGrid || !roleTitle) {
      console.error("[openFullscreen] Elementos não encontrados!");
      return;
    }

    // Atualizar título
    roleTitle.textContent = role === "Presbítero" ? "Presbíteros" : "Diáconos";

    // Renderizar candidatos
    this.renderFullscreenCandidates(role, candidatesGrid);

    // Exibir fullscreen
    fullscreenView.style.display = "flex";

    // Solicitar fullscreen nativo
    if (fullscreenView.requestFullscreen) {
      fullscreenView.requestFullscreen().catch((err) => {
        console.error("Erro ao entrar em fullscreen:", err);
      });
    }
  }

  /**
   * Handler para iniciar o fluxo de votação em fullscreen (direto para seleção)
   */
  private async handleStartVoting(): Promise<void> {
    try {
      // ✅ Verificar se votação já foi encerrada (limite de votos atingido)
      const votingManager = VotingManager.getInstance();
      if (votingManager.isVotingClosed()) {
        NotificationService.error(
          "Votação encerrada: todos os votos dos membros presentes já foram registrados."
        );
        return;
      }

      // ✅ Verificar se limite de votos já foi atingido (validação adicional)
      const auditManager = AuditManager.getInstance();
      const totalVotes = auditManager.getVotesCount();
      const quorumData = await votingManager.getQuorumData();
      const presentMembers = quorumData.presentMembers;

      if (totalVotes >= presentMembers) {
        NotificationService.error(
          `Votação encerrada: ${totalVotes} votos já foram registrados de ${presentMembers} presentes.`
        );
        return;
      }

      // Validar quórum (sem sincronização automática)
      const results = await electionApp.getElectionResults();
      if (!results.quorum?.isValid) {
        NotificationService.warning(
          "Quórum insuficiente para iniciar a votação. Aguarde mais membros presentes."
        );
        return;
      }

      // Ativar fullscreen view
      const fullscreenView = document.getElementById("fullscreen-view");
      if (fullscreenView) {
        fullscreenView.style.display = "flex";
        void fullscreenView.offsetWidth;
        fullscreenView.classList.add("active");

        // Adicionar entrada no histórico para interceptar botão voltar (mobile)
        window.history.pushState(
          { fullscreenVoting: true },
          "",
          window.location.href
        );

        if (fullscreenView.requestFullscreen) {
          fullscreenView.requestFullscreen().catch(() => {
            /* ignore fullscreen errors */
          });
        }
      }

      // Iniciar fluxo de seleção diretamente (sem tela de prévia)
      await this.startSelectionFlow();
    } catch (error) {
      console.error("Erro ao iniciar fluxo de votação:", error);
      NotificationService.error("Erro ao iniciar a votação");
    }
  }

  /**
   * Inicia o fluxo de seleção: primeiro presbíteros, depois diáconos.
   * Será implementado nas próximas etapas; aqui apenas navega para a tela de seleção.
   */
  private async startSelectionFlow(
    preSelectedPresbyteros: string[] = [],
    preSelectedDiaconos: string[] = []
  ): Promise<void> {
    // Fluxo de seleção completo (touch-first)
    // 1) Ler candidatos e vagas
    // 2) Mostrar etapa Presbíteros -> permitir selecionar até presbyteroPositions
    // 3) Ao confirmar, avançar para Diáconos
    // 4) Ao final, mostrar resumo com Corrigir / Confirmar
    NotificationService.info("Iniciando seleção de votos...");

    try {
      const results = await electionApp.getElectionResults();
      const quorumConfig =
        (await electionApp.getQuorumConfig()) as QuorumConfig | null;

      const presbyteroPositions = quorumConfig?.presbyteroPositions ?? 3;
      const diaconoPositions = quorumConfig?.diaconoPositions ?? 6;

      const pres = (results.presbyteros || [])
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          role: c.role,
          photoUrl: c.photoUrl,
        }))
        .sort((a: { name: string }, b: { name: string }) =>
          a.name.localeCompare(b.name, "pt-BR")
        ); // Ordem alfabética

      const dia = (results.diaconos || [])
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          role: c.role,
          photoUrl: c.photoUrl,
        }))
        .sort((a: { name: string }, b: { name: string }) =>
          a.name.localeCompare(b.name, "pt-BR")
        ); // Ordem alfabética

      // Estado local de seleção
      const state = {
        presSelected: new Set<string>(preSelectedPresbyteros),
        diaSelected: new Set<string>(preSelectedDiaconos),
      };

      // Função para renderizar etapa de seleção
      const renderSelectionStep = (
        roleLabel: string,
        items: any[],
        maxSelect: number,
        currentSet: Set<string>
      ) => {
        const fullscreenView = document.getElementById("fullscreen-view");
        const grid = document.getElementById("fullscreen-candidates-grid");
        const roleTitle = document.getElementById("fullscreen-role-title");
        if (!fullscreenView || !grid || !roleTitle) return;

        roleTitle.textContent = `Seleção — ${roleLabel}`;

        // Adicionar classe para modo de seleção
        grid.classList.add("selection-mode");

        const cardsHtml = items
          .map((it) => {
            // Fallback: iniciais em círculo colorido
            function getInitials(name: string) {
              return name
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
            }
            function stringToColor(str: string) {
              let hash = 0;
              for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
              }
              const h = hash % 360;
              return `hsl(${h}, 70%, 60%)`;
            }
            const initials = getInitials(it.name);
            const color = stringToColor(it.name);
            return `
                <div class="selection-card selectable" data-id="${it.id}" tabindex="0" role="button" aria-pressed="false">
                  <div class="selection-photo">
                    ${
                      it.photoUrl
                        ? `<img src="${it.photoUrl}" alt="${it.name}"/>`
                        : `<span class="candidate-initials-avatar" style="background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:3rem;font-weight:700;width:100%;height:100%;">${initials}</span>`
                    }
                  </div>
                  <div class="selection-info">
                    <div class="selection-name">${it.name}</div>
                    <div class="selection-role">${it.role}</div>
                  </div>
                  <div class="selection-badge" aria-hidden="true">✓</div>
                </div>`;
          })
          .join("");

        grid.innerHTML = `
          <div class="zoom-controls" id="zoom-controls">
            <button class="zoom-btn" id="zoom-out" aria-label="Diminuir zoom">-</button>
            <div class="zoom-level" id="zoom-level" aria-live="polite">100%</div>
            <button class="zoom-btn" id="zoom-in" aria-label="Aumentar zoom">+</button>
          </div>
          <div class="selection-header">
            <h1 class="selection-title">${roleLabel}</h1>
            <div class="selection-vagas-info">
              Você pode selecionar até <strong id='preview-vagas-restantes'>${maxSelect}</strong> candidato${maxSelect > 1 ? "s" : ""}
            </div>
          </div>
          <div class="selection-grid">
            ${cardsHtml}
          </div>
          <div class="selection-actions">
            <button id="selection-next-btn" class="selection-btn selection-btn-primary">Avançar</button>
          </div>
        `;

        // Attach listeners
        const row = grid.querySelector(".selection-grid");
        const vagasRestantesEl = document.getElementById(
          "preview-vagas-restantes"
        );
        function updateVagasRestantes() {
          if (vagasRestantesEl) {
            vagasRestantesEl.textContent = String(maxSelect - currentSet.size);
          }
        }
        row
          ?.querySelectorAll<HTMLElement>(".selection-card.selectable")
          .forEach((card) => {
            const id = card.dataset.id as string;
            const updateUI = () => {
              const selected = currentSet.has(id);
              card.setAttribute("aria-pressed", selected ? "true" : "false");
              card.classList.toggle("selected", selected);
              const badge = card.querySelector(
                ".selection-badge"
              ) as HTMLElement | null;
              if (badge) {
                badge.style.display = selected ? "flex" : "none";
              }
            };

            // initial
            updateUI();

            const toggle = () => {
              if (currentSet.has(id)) {
                currentSet.delete(id);
              } else {
                if (currentSet.size >= maxSelect) {
                  NotificationService.warning(
                    `Você só pode selecionar até ${maxSelect} para ${roleLabel}`
                  );
                  return;
                }
                currentSet.add(id);
              }
              updateUI();
              updateVagasRestantes();
            };

            card.addEventListener("click", toggle);
            card.addEventListener("keydown", (ev) => {
              if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                toggle();
              }
            });
          });
        updateVagasRestantes();

        // Add zoom controls listeners
        let currentZoom = 1;
        const zoomLevelEl = document.getElementById("zoom-level");
        const zoomInBtn = document.getElementById("zoom-in");
        const zoomOutBtn = document.getElementById("zoom-out");

        const updateZoom = () => {
          if (fullscreenView && zoomLevelEl) {
            fullscreenView.setAttribute("data-zoom", String(currentZoom));
            const percentage = 100 + (currentZoom - 1) * 12.5;
            zoomLevelEl.textContent = `${Math.round(percentage)}%`;
          }
        };

        zoomInBtn?.addEventListener("click", () => {
          if (currentZoom < 5) {
            currentZoom++;
            updateZoom();
            NotificationService.info(
              `Zoom aumentado para ${Math.round(100 + (currentZoom - 1) * 12.5)}%`
            );
          } else {
            NotificationService.warning("Zoom máximo atingido");
          }
        });

        zoomOutBtn?.addEventListener("click", () => {
          if (currentZoom > 1) {
            currentZoom--;
            updateZoom();
            NotificationService.info(
              `Zoom reduzido para ${Math.round(100 + (currentZoom - 1) * 12.5)}%`
            );
          } else {
            NotificationService.warning("Zoom mínimo atingido");
          }
        });

        // Initialize zoom
        updateZoom();

        // Add event listener for the "Avançar" button
        const nextBtn = document.getElementById("selection-next-btn");
        if (nextBtn) {
          nextBtn.addEventListener("click", async () => {
            // Store selection and proceed to next step
            if (roleLabel === "Presbíteros") {
              state.presSelected = new Set(currentSet);
              // Proceed to Diáconos
              renderSelectionStep(
                "Diáconos",
                dia,
                diaconoPositions,
                state.diaSelected
              );
            } else if (roleLabel === "Diáconos") {
              state.diaSelected = new Set(currentSet);
              // Show summary
              await this.showSelectionSummary(
                Array.from(state.presSelected),
                Array.from(state.diaSelected)
              );
            }
          });
        }

        // Show fullscreen
        const fullscreenViewEl = document.getElementById(
          "fullscreen-view"
        ) as HTMLElement;
        fullscreenViewEl.style.display = "flex";
      };

      // Start with Presbíteros
      renderSelectionStep(
        "Presbíteros",
        pres,
        presbyteroPositions,
        state.presSelected
      );
    } catch (err) {
      console.error("Erro no fluxo de seleção:", err);
      NotificationService.error("Erro ao iniciar seleção de votos");
    }
  }

  /**
   * Fechar fullscreen com validação de senha
   * Requer a palavra "sair" para confirmar saída
   */
  private async closeFullscreen(): Promise<void> {
    // Prevenir chamadas duplicadas
    if (this.isClosingFullscreen) {
      return;
    }

    const fullscreenView = document.getElementById("fullscreen-view");
    if (!fullscreenView || fullscreenView.style.display === "none") return;

    // Marcar que o fechamento está em andamento
    this.isClosingFullscreen = true;

    try {
      // Solicitar senha com diálogo personalizado
      const password = await dialogService.prompt({
        title: "Confirmar Saída",
        message: "Para sair da votação, digite a senha de segurança:",
        placeholder: "Digite a senha",
        confirmText: "Sair da Votação",
        cancelText: "Cancelar",
        icon: "lock",
      });

      // Validar senha (case-insensitive)
      if (password?.toLowerCase() !== "sair") {
        if (password !== null) {
          // Null significa que cancelou, não mostrar erro
          NotificationService.warning(
            "Senha incorreta. Permanecendo na votação."
          );
        }

        // Se saiu do fullscreen nativo, voltar ao fullscreen
        if (!document.fullscreenElement && fullscreenView.requestFullscreen) {
          try {
            await fullscreenView.requestFullscreen();
          } catch (err) {
            console.warn("Não foi possível retornar ao fullscreen:", err);
          }
        }

        // Resetar flag antes de retornar
        this.isClosingFullscreen = false;
        return;
      }

      // Sair do fullscreen nativo (se ainda estiver)
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      // Remover animação e ocultar após transição
      fullscreenView.classList.remove("active");
      setTimeout(() => {
        fullscreenView.style.display = "none";
        // Resetar flag após fechar completamente
        this.isClosingFullscreen = false;
      }, 350);

      // Remover entrada do histórico (se foi adicionada)
      if (window.history.state?.fullscreenVoting) {
        window.history.back();
      }

      NotificationService.info("Votação encerrada com sucesso");
    } catch (error) {
      console.error("[UIManager] Erro ao fechar fullscreen:", error);
      // Resetar flag em caso de erro
      this.isClosingFullscreen = false;
    }
  }

  private async renderFullscreenCandidates(
    role: CandidateRole,
    container: HTMLElement
  ): Promise<void> {
    const allCandidates = await electionApp.getCandidates();
    const candidates = allCandidates.filter((c) => c.role === role);

    if (candidates.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="material-icons md-48">person_off</span>
          <p>Nenhum candidato cadastrado</p>
        </div>
      `;
      return;
    }

    // Checar status do quórum para habilitar/desabilitar controles
    const results = await electionApp.getElectionResults();
    const isQuorumValid = results?.quorum?.isValid ?? true;

    container.innerHTML = candidates
      .map((candidate) => {
        const photoHtml = candidate.photoUrl
          ? `<img src="${candidate.photoUrl}" alt="${candidate.name}" />`
          : `<span class="material-icons">person</span>`;

        return `
          <div class="fullscreen-candidate-card" data-id="${candidate.id}">
            <div class="fullscreen-candidate-photo" data-id="${candidate.id}">
              ${photoHtml}
            </div>
            <div class="fullscreen-candidate-meta">
              <h3 class="fullscreen-candidate-name">${candidate.name}</h3>
              <div class="fullscreen-candidate-votes">${candidate.votes}</div>
            </div>
            <div class="fullscreen-candidate-actions">
              <button class="btn-vote btn-vote-decrease" data-candidate-id="${candidate.id}" data-action="decrease" ${!isQuorumValid ? "disabled" : ""} title="Remover voto">
                <span class="material-icons md-24">remove</span>
              </button>
              <button class="btn-vote btn-vote-reset" data-candidate-id="${candidate.id}" data-action="reset" ${!isQuorumValid ? "disabled" : ""} title="Resetar votos">
                <span class="material-icons md-24">refresh</span>
              </button>
              <button class="btn-vote btn-vote-increase" data-candidate-id="${candidate.id}" data-action="increase" ${!isQuorumValid ? "disabled" : ""} title="Adicionar voto">
                <span class="material-icons md-24">add</span>
              </button>
            </div>
          </div>
        `;
      })
      .join("");

    // ✅ Projeção configurada apenas para visualização (sem event listeners)
    // Os votos são atualizados automaticamente via sincronização Firebase
  }

  private async handleRemoveCandidate(
    candidateId: string,
    role: CandidateRole
  ): Promise<void> {
    const confirmed = await dialogService.confirm({
      title: "Remover Candidato",
      message: `Tem certeza que deseja remover este candidato a ${role}?`,
      confirmText: "Sim, Remover",
      cancelText: "Cancelar",
      icon: "person_remove",
    });

    if (!confirmed) {
      return;
    }

    // ✅ ARQUITETURA UNIFICADA: Remover candidato = atualizar membro para candidato: null
    // O candidateId É o member.id - não há base separada de candidatos
    const result = await electionApp.updateMember(candidateId, {
      candidato: null,
    });

    if (result.success) {
      NotificationService.show("Candidato removido com sucesso", "success");
      await this.loadCandidatesData();
      await this.loadMembersData(); // Recarregar tabela de membros
    } else {
      NotificationService.show(
        result.error || "Erro ao remover candidato",
        "error"
      );
    }
  }

  private async loadVotingData(): Promise<void> {
    try {
      // Carregar quórum, candidatos e configuração
      const [results, candidates, quorumConfig] = await Promise.all([
        electionApp.getElectionResults(),
        electionApp.getCandidates(),
        electionApp.getQuorumConfig(),
      ]);

      // Renderizar status do quórum
      this.renderQuorumStatus(results.quorum);

      // Aplicar/desaplicar blur baseado no status do quórum
      this.applyQuorumBlur(results.quorum.isValid);

      // Separar candidatos por cargo
      const presbyteros = candidates.filter((c) => c.role === "Presbítero");
      const diaconos = candidates.filter((c) => c.role === "Diácono");

      // Valores padrão caso não haja configuração
      const presbyteroPositions = quorumConfig?.presbyteroPositions || 3;
      const diaconoPositions = quorumConfig?.diaconoPositions || 6;

      // Renderizar cards de votação com vagas configuradas
      // ✅ CRÍTICO: Passar status do quórum para determinar se candidatos são eleitos
      this.renderVotingCards(
        "voting-presbyteros",
        presbyteros,
        results.quorum.votesRequired,
        presbyteroPositions,
        results.quorum.isValid
      );
      this.renderVotingCards(
        "voting-diaconos",
        diaconos,
        results.quorum.votesRequired,
        diaconoPositions,
        results.quorum.isValid
      );
    } catch (error) {
      console.error("[UIManager] Erro ao carregar dados de votação:", error);
      NotificationService.error("Erro ao carregar dados de votação");
    }
  }

  private renderQuorumStatus(quorum: any): void {
    const quorumInfo = document.getElementById("quorum-info");
    if (!quorumInfo) return;

    const statusClass = quorum.isValid ? "status-valid" : "status-invalid";
    const statusText = quorum.isValid ? "✓ VÁLIDO" : "✗ INSUFICIENTE";

    // Obter contagem de votos registrados
    const auditManager = AuditManager.getInstance();
    const votesCount = auditManager.getVotesCount();

    quorumInfo.innerHTML = `
      <div class="quorum-grid">
        <div class="quorum-item">
          <span class="quorum-label">Total de Membros</span>
          <span class="quorum-value">${quorum.totalMembers}</span>
        </div>
        <div class="quorum-item">
          <span class="quorum-label">Presentes</span>
          <span class="quorum-value">${quorum.presentMembers}</span>
        </div>
        <div class="quorum-item">
          <span class="quorum-label">Quórum Mínimo</span>
          <span class="quorum-value">${quorum.minimumQuorum}</span>
        </div>
        <div class="quorum-item">
          <span class="quorum-label">Votos Necessários</span>
          <span class="quorum-value">${quorum.votesRequired}</span>
        </div>
        <div class="quorum-item">
          <span class="quorum-label">Votos Registrados</span>
          <span class="quorum-value" id="votes-count">${votesCount}</span>
        </div>
        <div class="quorum-item quorum-status-item quorum-status-highlight ${statusClass}">
          <span class="quorum-label">Status do Quórum</span>
          <span class="quorum-value">
            ${statusText}
          </span>
        </div>
      </div>
    `;
  }

  private applyQuorumBlur(isQuorumValid: boolean): void {
    const votingSections = document.querySelectorAll(".voting-category");

    votingSections.forEach((section) => {
      if (isQuorumValid) {
        // Remover blur quando quórum é válido
        section.classList.remove("quorum-blur");
      } else {
        // Aplicar blur quando quórum é insuficiente
        section.classList.add("quorum-blur");
      }
    });

    // Mostrar/ocultar mensagem de quórum insuficiente
    this.toggleQuorumMessage(!isQuorumValid);
  }

  private toggleQuorumMessage(show: boolean): void {
    const votingTab = document.getElementById("voting-tab");
    if (!votingTab) return;

    let messageElement = votingTab.querySelector(
      ".quorum-insufficient-message"
    ) as HTMLElement;

    if (show) {
      if (!messageElement) {
        // Criar mensagem se não existir
        messageElement = document.createElement("div");
        messageElement.className = "quorum-insufficient-message";
        messageElement.innerHTML = `
          <div class="info-banner">
            <div class="info-banner-icon">
              <span class="material-icons">warning</span>
            </div>
            <div class="info-banner-content">
              <div class="info-banner-title">Quórum Insuficiente</div>
              <div class="info-banner-text">
                O número mínimo de membros presentes não foi atingido. A votação está temporariamente bloqueada até que o quórum seja alcançado.
              </div>
            </div>
          </div>
        `;

        // Inserir após o status do quórum
        const quorumCard = votingTab.querySelector(".quorum-card");
        if (quorumCard) {
          quorumCard.insertAdjacentElement("afterend", messageElement);
        }
      }
      messageElement.style.display = "block";
    } else {
      // Ocultar mensagem
      if (messageElement) {
        messageElement.style.display = "none";
      }
    }
  }

  private renderVotingCards(
    containerId: string,
    candidates: any[],
    votesRequired: number,
    totalPositions: number,
    isQuorumValid: boolean = true
  ): void {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Ordenar candidatos alfabeticamente
    const sortedCandidates = [...candidates].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR")
    );

    if (sortedCandidates.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="material-icons md-48">inbox</span>
          <p>Nenhum candidato cadastrado para este cargo</p>
          <small style="color: var(--gray-500); margin-top: 0.5rem;">
            Vagas disponíveis: ${totalPositions}
          </small>
        </div>
      `;
      return;
    }

    // Criar cards para candidatos existentes
    const candidateCards = sortedCandidates.map((candidate) => {
      // ✅ CRÍTICO: Candidato só é eleito se quórum for VÁLIDO e votos >= votesRequired
      const isElected = isQuorumValid && candidate.votes >= votesRequired;
      const electedBadge = isElected
        ? '<span class="elected-badge"><span class="material-icons md-18">check_circle</span> ELEITO</span>'
        : "";

      const photoHtml = candidate.photoUrl
        ? `<img src="${candidate.photoUrl}" alt="${candidate.name}" class="voting-card-photo" />`
        : `<div class="voting-card-photo-placeholder"><span class="material-icons md-48">person</span></div>`;

      return `
          <div class="voting-card ${isElected ? "elected" : ""}">
            <div class="voting-card-header">
              ${photoHtml}
              ${electedBadge}
            </div>
            <div class="voting-card-body">
              <h4 class="voting-card-name">${candidate.name}</h4>
              <div class="voting-card-votes">
                <span class="votes-label">Votos</span>
                <span class="votes-count">${candidate.votes}</span>
              </div>
            </div>
          </div>
        `;
    });

    // Criar cards vazios para vagas não preenchidas
    const emptyCards = [];
    const remainingPositions = Math.max(
      0,
      totalPositions - sortedCandidates.length
    );

    for (let i = 0; i < remainingPositions; i++) {
      emptyCards.push(`
        <div class="voting-card voting-card-empty">
          <div class="voting-card-header">
            <div class="voting-card-photo-placeholder">
              <span class="material-icons md-48" style="opacity: 0.3;">person_outline</span>
            </div>
          </div>
          <div class="voting-card-body">
            <h4 class="voting-card-name" style="color: var(--gray-400);">Vaga Disponível</h4>
            <div class="voting-card-votes">
              <span class="votes-label" style="opacity: 0.5;">Aguardando candidato</span>
            </div>
          </div>
        </div>
      `);
    }

    // Renderizar todos os cards (candidatos + vazios)
    container.innerHTML = [...candidateCards, ...emptyCards].join("");

    // Cards agora são apenas para visualização
    // Os votos são atualizados automaticamente quando o ciclo de votação fullscreen for encerrado
  }

  private async loadAttendanceData(): Promise<void> {
    try {
      // ✅ CORREÇÃO: Renderizar lista específica de presença ao invés da tabela de membros
      await this.renderAttendanceList();
    } catch (error) {
      console.error("[UIManager] Erro ao recarregar dados de presença:", error);
    }
  }

  private async loadResultsData(): Promise<void> {
    try {
      const results = await electionApp.getElectionResults();
      const auditData = await AuditManager.getInstance().getReportData();

      // Atualizar lista de presbíteros eleitos (apenas candidatos marcados como eleitos)
      const presbyterosList = document.getElementById("elected-presbyteros");
      if (presbyterosList) {
        const electedPresbyteros = (results.presbyteros || []).filter(
          (c: Candidate) => c.isElected
        );

        if (electedPresbyteros.length === 0) {
          presbyterosList.innerHTML =
            '<p class="empty-message">Nenhum presbítero eleito ainda</p>';
        } else {
          presbyterosList.innerHTML = electedPresbyteros
            .map(
              (candidate: Candidate) => `
              <div class="elected-item">
                <span class="material-icons md-18">how_to_vote</span>
                <strong>${candidate.name}</strong>
                <span class="vote-count">${candidate.votes} votos</span>
              </div>
            `
            )
            .join("");
        }
      }

      // Atualizar lista de diáconos eleitos (apenas candidatos marcados como eleitos)
      const diaconosList = document.getElementById("elected-diaconos");
      if (diaconosList) {
        const electedDiaconos = (results.diaconos || []).filter(
          (c: Candidate) => c.isElected
        );

        if (electedDiaconos.length === 0) {
          diaconosList.innerHTML =
            '<p class="empty-message">Nenhum diácono eleito ainda</p>';
        } else {
          diaconosList.innerHTML = electedDiaconos
            .map(
              (candidate: Candidate) => `
              <div class="elected-item">
                <span class="material-icons md-18">how_to_vote</span>
                <strong>${candidate.name}</strong>
                <span class="vote-count">${candidate.votes} votos</span>
              </div>
            `
            )
            .join("");
        }
      }

      // Atualizar resultados detalhados
      const detailedResults = document.getElementById(
        "detailed-results-content"
      );
      if (detailedResults) {
        const allCandidates = [...results.presbyteros, ...results.diaconos];

        if (allCandidates.length === 0) {
          detailedResults.innerHTML =
            '<p class="empty-message">Nenhum candidato registrado</p>';
        } else {
          detailedResults.innerHTML = `
            <div class="results-table">
              <table>
                <thead>
                  <tr>
                    <th>Candidato</th>
                    <th>Cargo</th>
                    <th>Votos</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${allCandidates
                    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
                    .map(
                      (candidate) => `
                      <tr>
                        <td>${candidate.name}</td>
                        <td>${candidate.role}</td>
                        <td class="text-center">${candidate.votes}</td>
                        <td class="text-center">
                          ${
                            candidate.isElected
                              ? '<span class="badge badge-success">Eleito</span>'
                              : '<span class="badge badge-secondary">Não Eleito</span>'
                          }
                        </td>
                      </tr>
                    `
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
            <div class="results-summary-stats">
              <p><strong>Total de votos:</strong> ${auditData.totalVotes}</p>
              <p><strong>Quórum:</strong> ${results.quorum.isValid ? "✅ Válido" : "❌ Inválido"}</p>
              <p><strong>Presentes:</strong> ${results.quorum.presentMembers} / ${results.quorum.totalMembers}</p>
            </div>
          `;
        }
      }

      // Inicializar/atualizar charts (import dinâmico para evitar carregar em testes)
      try {
        if (typeof window !== "undefined") {
          const chartsMod = await import("./charts");
          await chartsMod.initCharts();
          const attendanceStats = await electionApp.getAttendanceStats();
          await chartsMod.updateCharts(results, {
            totalMembers: attendanceStats.totalMembers,
            presentMembers: attendanceStats.presentMembers,
          });
        }
      } catch (chartErr) {
        console.warn(
          "[UIManager] Não foi possível inicializar os charts:",
          chartErr
        );
      }
    } catch (error) {
      console.error("[UIManager] Erro ao carregar resultados:", error);
      NotificationService.error("Erro ao carregar resultados da eleição");
    }
  }

  /**
   * Mostrar resumo da seleção com opções Corrigir e Confirmar
   */
  private async showSelectionSummary(
    presIds: string[],
    diaIds: string[]
  ): Promise<void> {
    const fullscreenView = document.getElementById("fullscreen-view");
    const grid = document.getElementById("fullscreen-candidates-grid");
    const roleTitle = document.getElementById("fullscreen-role-title");

    if (!fullscreenView || !grid || !roleTitle) return;

    roleTitle.textContent = "Confirmação da Votação";

    // Adicionar classe para layout lado a lado
    grid.classList.add("summary-mode");
    grid.classList.remove("selection-mode");

    // Carregar dados atualizados dos candidatos
    const allCandidates = await electionApp.getCandidates();
    const presList = allCandidates.filter((c) => c.role === "Presbítero");
    const diaList = allCandidates.filter((c) => c.role === "Diácono");

    const renderList = (items: any[], selectedIds: string[]) => {
      // Separar selecionados e não selecionados
      const selected = items
        .filter((it) => selectedIds.includes(it.id))
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
      const notSelected = items
        .filter((it) => !selectedIds.includes(it.id))
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

      // Concatenar: selecionados primeiro, depois não selecionados
      const orderedItems = [...selected, ...notSelected];

      return orderedItems
        .map(
          (it) => `
            <div class="preview-card summary-item ${selectedIds.includes(it.id) ? "voted" : "not-voted"}">
              <div class="preview-photo">${
                it.photoUrl
                  ? `<img src="${it.photoUrl}" alt="${it.name}"/>`
                  : '<span class="material-icons md-48">person</span>'
              }</div>
              <div class="preview-name">${it.name}</div>
              <div class="preview-role">${it.role}</div>
            </div>`
        )
        .join("");
    };

    grid.innerHTML = `
      <div class="preview-section">
        <h2>Presbíteros</h2>
        <div class="preview-row">${renderList(presList, presIds)}</div>
      </div>
      <div class="preview-section">
        <h2>Diáconos</h2>
        <div class="preview-row">${renderList(diaList, diaIds)}</div>
      </div>
      <div class="preview-actions">
        <button id="summary-correct-btn" class="btn btn-warning btn-lg">
          <span class="material-icons md-20">undo</span>
          Corrigir Voto
        </button>
        <button id="summary-confirm-btn" class="btn btn-cta btn-lg">
          <span class="material-icons md-20">check_circle</span>
          Confirmar Voto
        </button>
      </div>
    `;

    // Corrigir volta para a etapa inicial de seleção (presbíteros)
    const correctBtn = document.getElementById("summary-correct-btn");
    correctBtn?.addEventListener("click", async () => {
      // Reabrir seleção desde o início, mantendo candidatos já selecionados
      await this.startSelectionFlow(presIds, diaIds);
    });

    const confirmBtn = document.getElementById("summary-confirm-btn");
    confirmBtn?.addEventListener("click", async () => {
      try {
        // ✅ OTIMIZAÇÃO: Desabilitar event listeners durante votação
        this.isVotingInProgress = true;

        // Desabilitar botões para evitar duplo envio
        (confirmBtn as HTMLButtonElement).disabled = true;
        const correctBtn = document.getElementById(
          "summary-correct-btn"
        ) as HTMLButtonElement | null;
        if (correctBtn) correctBtn.disabled = true;

        // Indicar progresso
        const originalText = confirmBtn.textContent || "Confirmar";
        confirmBtn.textContent = "Enviando votos...";

        const allCandidateIds = [...presIds, ...diaIds];

        const res = await this.submitVotesAtomically(allCandidateIds);

        if (res.success) {
          // ✅ Registrar voto na auditoria
          const auditManager = AuditManager.getInstance();
          await auditManager.recordVote(presIds, diaIds);

          NotificationService.success("Votos submetidos com sucesso");
          this.showThankYouScreen();
        } else {
          NotificationService.error(
            res.error || "Falha ao submeter votos. Operação revertida."
          );
          // Voltar para prévia para tentar novamente
          await this.handleStartVoting();
        }

        // Restaurar texto
        confirmBtn.textContent = originalText;
      } catch (err) {
        console.error("Erro ao confirmar votos:", err);
        NotificationService.error("Erro ao confirmar votos");
        // Tentar reabrir a prévia
        await this.handleStartVoting();
      } finally {
        // ✅ OTIMIZAÇÃO: Reabilitar event listeners após votação
        this.isVotingInProgress = false;

        // Reabilitar botão
        (confirmBtn as HTMLButtonElement).disabled = false;
        const correctBtn = document.getElementById(
          "summary-correct-btn"
        ) as HTMLButtonElement | null;
        if (correctBtn) correctBtn.disabled = false;
      }
    });
  }

  /**
   * Submete votos em sequência de forma ATÔMICA usando transações Firebase
   * Garante que múltiplos usuários possam votar simultaneamente sem perda de dados
   * ✅ OTIMIZADO: Removido loadInitialState() e retry manual (11/nov/2025)
   */
  private async submitVotesAtomically(
    candidateIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    // ✅ Verificar se votação já foi encerrada
    const votingManager = VotingManager.getInstance();
    if (votingManager.isVotingClosed()) {
      return {
        success: false,
        error: "Votação encerrada - limite de votos atingido",
      };
    }

    // ✅ Verificar limite de votos (sem loadInitialState - dados já sincronizados em tempo real)
    const auditManager = AuditManager.getInstance();
    const totalVotes = auditManager.getVotesCount();
    const quorumData = await votingManager.getQuorumData();
    const presentMembers = quorumData.presentMembers;

    if (totalVotes >= presentMembers) {
      return {
        success: false,
        error: "Votação encerrada - limite de votos atingido",
      };
    }

    // ✅ Incrementar votos atomicamente (sem retry manual - offline-queue gerencia)
    const realtimeSync = RealtimeSync.getInstance();
    const succeeded: string[] = [];

    for (const candidateId of candidateIds) {
      try {
        const result = await realtimeSync.incrementVoteAtomically(candidateId);

        if (result.success) {
          succeeded.push(candidateId);
        } else {
          // Falha - fazer rollback dos votos já incrementados
          console.error(
            `[submitVotesAtomically] ❌ Falha ao incrementar ${candidateId}, iniciando rollback...`
          );

          for (const succeededId of succeeded) {
            try {
              await realtimeSync.decrementVoteAtomically(succeededId);
            } catch (rbErr) {
              console.warn(
                `[submitVotesAtomically] ⚠️ Rollback falhou para ${succeededId}:`,
                rbErr
              );
            }
          }

          return {
            success: false,
            error: result.error || "Falha ao submeter votos",
          };
        }
      } catch (err) {
        // Exceção - fazer rollback dos votos já incrementados
        console.error(
          `[submitVotesAtomically] ❌ Exceção ao incrementar ${candidateId}:`,
          err
        );

        for (const succeededId of succeeded) {
          try {
            await realtimeSync.decrementVoteAtomically(succeededId);
          } catch (rbErr) {
            console.warn(
              `[submitVotesAtomically] ⚠️ Rollback falhou para ${succeededId}:`,
              rbErr
            );
          }
        }

        return {
          success: false,
          error: `Falha ao submeter votos: ${String(err)}`,
        };
      }
    }

    return { success: true };
  }

  private async showThankYouScreen(): Promise<void> {
    const fullscreenView = document.getElementById("fullscreen-view");
    const grid = document.getElementById("fullscreen-candidates-grid");
    const roleTitle = document.getElementById("fullscreen-role-title");
    if (!fullscreenView || !grid || !roleTitle) return;

    // Remover classe summary-mode para centralizar conteúdo
    grid.classList.remove("summary-mode");
    grid.classList.remove("selection-mode");

    // Tocar som de confirmação
    this.playSuccessSound();

    // Verificar se votação foi encerrada (votos = presentes)
    const votingManager = VotingManager.getInstance();
    const auditManager = AuditManager.getInstance();
    const totalVotes = auditManager.getVotesCount();
    const quorumData = await votingManager.getQuorumData();
    const presentMembers = quorumData.presentMembers;
    const votingClosed = totalVotes >= presentMembers;

    if (votingClosed) {
      // ✅ TELA DE ENCERRAMENTO (sem countdown)
      roleTitle.textContent = "Votação Encerrada";
      grid.innerHTML = `
        <div class="empty-state" style="padding: 6rem 1rem; text-align: center;">
          <span class="material-icons md-64" style="color: var(--success); font-size: 4rem;">check_circle</span>
          <h2 style="margin-top: 1.5rem; font-size: 2rem; color: var(--text-primary);">Votação Encerrada</h2>
          <p style="font-size: 1.25rem; color: var(--text-secondary); margin-top: 1rem;">
            Todos os <strong>${totalVotes} votos</strong> dos membros presentes foram registrados.
          </p>
          <p style="font-size: 1rem; color: var(--text-tertiary); margin-top: 2rem;">
            Para sair desta tela, pressione <kbd>ESC</kbd> e digite a senha "sair".
          </p>
        </div>
      `;
      return;
    }

    // ✅ TELA NORMAL DE AGRADECIMENTO (com countdown)
    roleTitle.textContent = "Obrigado";
    let countdown = 10; // Reduzido de 30 para 10 segundos

    grid.innerHTML = `
      <div class="empty-state" style="padding: 6rem 1rem;">
        <span class="material-icons md-48">thumb_up</span>
        <h3>Obrigado por votar!</h3>
        <p id="countdown-text">Voltando para a prévia em <strong>${countdown}</strong> segundos...</p>
      </div>
    `;

    // Contagem regressiva visual
    const countdownElement = document.getElementById("countdown-text");
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdownElement) {
        countdownElement.innerHTML = `Voltando para a prévia em <strong>${countdown}</strong> segundos...`;
      }

      if (countdown <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    // Bloquear confirmação por 10s e depois voltar para preview
    setTimeout(() => {
      clearInterval(countdownInterval);
      // Reabrir a prévia (carregar resultados atualizados)
      (this as any).handleStartVoting();
    }, 10000); // Reduzido de 30000 para 10000
  }

  private async handleCandidateSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const memberSelect = document.getElementById(
      "candidate-member"
    ) as HTMLSelectElement;
    const roleInput = document.getElementById(
      "candidate-role"
    ) as HTMLSelectElement;
    const editingId = form.dataset.editingId;
    const photoUrl = form.dataset.photoUrl;

    // Determinar role e memberId baseado no modo
    let role: CandidateRole;
    let memberId: string;

    if (editingId) {
      // MODO EDIÇÃO: usar dados armazenados no dataset
      memberId = form.dataset.memberId || "";
      role = (form.dataset.candidateRole as CandidateRole) || "";

      if (!memberId) {
        NotificationService.show("Erro: membro não identificado", "error");
        return;
      }
      if (!role) {
        NotificationService.show("Erro: cargo não identificado", "error");
        return;
      }
    } else {
      // MODO CRIAÇÃO: pegar dos selects
      if (!memberSelect || !roleInput) return;

      memberId = memberSelect.value;
      role = roleInput.value as CandidateRole;

      if (!memberId) {
        NotificationService.show("Por favor, selecione um membro", "error");
        return;
      }
      if (!role) {
        NotificationService.show("Por favor, selecione um cargo", "error");
        return;
      }
    }

    if (editingId) {
      // ✅ ARQUITETURA UNIFICADA: MODO EDIÇÃO - Atualizar membro diretamente
      // O editingId É o member.id - não há base separada de candidatos

      // Preparar updates
      const updates: any = {};
      if (photoUrl !== undefined) {
        // photoUrl pode ser: string base64 (adicionou/alterou) ou string vazia (removeu)
        updates.photoUrl = photoUrl || undefined;
      }

      // Atualizar membro via MemberManager
      const result = await electionApp.updateMember(editingId, updates);

      if (!result.success) {
        NotificationService.show(
          result.error || "Erro ao atualizar candidato",
          "error"
        );
        return;
      }

      NotificationService.show("Foto atualizada com sucesso", "success");
    } else {
      // ✅ CORRIGIDO: MODO CRIAÇÃO - Atualizar membro diretamente
      const updateResult = await electionApp.updateMember(memberId, {
        candidato: role,
        photoUrl,
      });

      if (updateResult.success) {
        NotificationService.show("Candidato adicionado com sucesso", "success");
      } else {
        NotificationService.show(
          updateResult.error || "Erro ao adicionar candidato",
          "error"
        );
        return;
      }
    }

    // Limpar formulário e fechar modal
    delete form.dataset.editingId;
    delete form.dataset.photoUrl;
    delete form.dataset.memberId;
    delete form.dataset.candidateRole;
    this.clearForm("candidate-form");
    this.closeAllModals();
    await this.loadCandidatesData();
    await this.loadMembersData(); // Recarregar tabela de membros
  }

  private async handleConfigQuorum(): Promise<void> {
    try {
      // ✅ CRÍTICO: Forçar carregamento do Firebase antes de abrir modal
      const firebaseData = await RealtimeSync.getInstance().loadInitialState();

      if (firebaseData.config) {
        localStorage.setItem(
          StorageKeys.CONFIG,
          JSON.stringify(firebaseData.config)
        );
      }

      // Carregar configuração atual (agora sincronizada)
      const currentConfig = await electionApp.getQuorumConfig();
      const stats = await electionApp.getAttendanceStats();

      // Abrir modal
      const modal = document.getElementById("quorum-modal");
      if (!modal) return;

      modal.classList.add("modal-active");

      // Preencher formulário com valores atuais
      if (currentConfig) {
        (
          document.getElementById("minimum-percentage") as HTMLInputElement
        ).value = currentConfig.minimumPercentage.toString();

        // Determinar se é maioria simples ou percentual personalizado
        const votesCriteriaSelect = document.getElementById(
          "votes-criteria"
        ) as HTMLSelectElement;
        const votesPercentageInput = document.getElementById(
          "votes-percentage"
        ) as HTMLInputElement;
        const customPercentageGroup = document.getElementById(
          "custom-percentage-group"
        );

        // Verifica se a config salva indica maioria simples
        // (Pode verificar por um campo específico ou por valor -1, por exemplo)
        if (
          currentConfig.votesCriteria === "simple-majority" ||
          currentConfig.votesRequiredPercentage === -1
        ) {
          votesCriteriaSelect.value = "simple-majority";
          if (customPercentageGroup)
            customPercentageGroup.style.display = "none";
        } else {
          votesCriteriaSelect.value = "custom";
          votesPercentageInput.value =
            currentConfig.votesRequiredPercentage.toString();
          if (customPercentageGroup)
            customPercentageGroup.style.display = "block";
        }

        (
          document.getElementById("presbítero-positions") as HTMLInputElement
        ).value = currentConfig.presbyteroPositions.toString();
        (
          document.getElementById("diacono-positions") as HTMLInputElement
        ).value = currentConfig.diaconoPositions.toString();
      }

      // Configurar preview em tempo real
      this.setupQuorumPreview(stats);
    } catch (error) {
      console.error("Erro ao abrir configuração de quórum:", error);
      NotificationService.error("Erro ao carregar configurações");
    }
  }

  private setupQuorumPreview(stats: any): void {
    const inputs = [
      "minimum-percentage",
      "votes-criteria",
      "votes-percentage",
      "presbítero-positions",
      "diacono-positions",
    ];

    const updatePreview = () => {
      // Ler valores dos inputs
      const minimumPercentage = parseFloat(
        (document.getElementById("minimum-percentage") as HTMLInputElement)
          .value || "50"
      );

      const votesCriteria = (
        document.getElementById("votes-criteria") as HTMLSelectElement
      ).value;

      const votesPercentage = parseFloat(
        (document.getElementById("votes-percentage") as HTMLInputElement)
          .value || "60"
      );

      const presbyteroPos = parseInt(
        (document.getElementById("presbítero-positions") as HTMLInputElement)
          .value || "3"
      );
      const diaconoPos = parseInt(
        (document.getElementById("diacono-positions") as HTMLInputElement)
          .value || "6"
      );

      const totalMembers = stats.totalMembers;
      const presentMembers = stats.presentMembers;

      // Calcular quórum mínimo (permite decimais)
      const minimumQuorum = Math.ceil((totalMembers * minimumPercentage) / 100);

      // Calcular votos necessários
      let votesRequired: number;
      if (votesCriteria === "simple-majority") {
        // Maioria Simples: 50% + 1 voto
        votesRequired = Math.floor(presentMembers / 2) + 1;
      } else {
        // Percentual personalizado
        votesRequired = Math.ceil((presentMembers * votesPercentage) / 100);
      }

      const totalPositions = presbyteroPos + diaconoPos;

      // Atualizar hints
      const minimumHint = document.getElementById("minimum-percentage-hint");
      if (minimumHint) {
        minimumHint.textContent = `Com ${totalMembers} membros, é necessário pelo menos ${minimumQuorum} presentes`;
      }

      const votesHint = document.getElementById("votes-percentage-hint");
      if (votesHint) {
        if (votesCriteria === "simple-majority") {
          votesHint.textContent = `Com ${presentMembers} presentes, cada candidato precisa de ${votesRequired} votos (maioria simples)`;
        } else {
          votesHint.textContent = `Com ${presentMembers} presentes, cada candidato precisa de ${votesRequired} votos para ser eleito`;
        }
      }

      // Atualizar preview
      const previewQuorum = document.getElementById("preview-quorum");
      if (previewQuorum) {
        previewQuorum.textContent = `${minimumQuorum} membros`;
      }

      const previewVotes = document.getElementById("preview-votes");
      if (previewVotes) {
        previewVotes.textContent = `${votesRequired} votos`;
      }

      const previewPositions = document.getElementById("preview-positions");
      if (previewPositions) {
        previewPositions.textContent = `${totalPositions} oficiais`;
      }
    };

    // Adicionar listener para mostrar/ocultar campo personalizado
    const votesCriteriaSelect = document.getElementById("votes-criteria");
    const customPercentageGroup = document.getElementById(
      "custom-percentage-group"
    );

    if (votesCriteriaSelect && customPercentageGroup) {
      votesCriteriaSelect.addEventListener("change", (e) => {
        const select = e.target as HTMLSelectElement;
        if (select.value === "custom") {
          customPercentageGroup.style.display = "block";
        } else {
          customPercentageGroup.style.display = "none";
        }
        updatePreview();
      });
    }

    // Adicionar listeners aos inputs
    inputs.forEach((inputId) => {
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener("input", updatePreview);
      }
    });

    // Atualizar preview inicial
    updatePreview();
  }

  private async handleQuorumSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const votesCriteria = formData.get("votesCriteria") as
      | "simple-majority"
      | "custom";

    const config: QuorumConfig = {
      minimumPercentage: parseFloat(
        formData.get("minimumPercentage") as string
      ),
      votesCriteria: votesCriteria,
      votesRequiredPercentage:
        votesCriteria === "simple-majority"
          ? -1 // Indica maioria simples
          : parseFloat(formData.get("votesPercentage") as string),
      presbyteroPositions: parseInt(
        formData.get("presbiteroPositions") as string
      ),
      diaconoPositions: parseInt(formData.get("diaconoPositions") as string),
    };

    // Validações
    if (config.minimumPercentage < 0.01 || config.minimumPercentage > 100) {
      NotificationService.error(
        "Percentual de presença deve estar entre 0.01% e 100%"
      );
      return;
    }

    if (votesCriteria === "custom") {
      if (
        config.votesRequiredPercentage < 0.01 ||
        config.votesRequiredPercentage > 100
      ) {
        NotificationService.error(
          "Percentual de votos deve estar entre 0.01% e 100%"
        );
        return;
      }
    }

    if (config.presbyteroPositions < 1 || config.diaconoPositions < 1) {
      NotificationService.error("Deve haver pelo menos 1 vaga por cargo");
      return;
    }

    try {
      const result = await electionApp.updateQuorumConfig(config);

      if (result.success) {
        NotificationService.success("Configurações de quórum atualizadas!");
        this.closeAllModals();

        // Recarregar dados se estiver na aba de votação
        const activeTab = document.querySelector(".tab-content.active");
        if (activeTab?.id === "voting-tab") {
          await this.loadVotingData();
        }
      } else {
        NotificationService.error(
          result.error || "Erro ao salvar configurações"
        );
      }
    } catch (error) {
      console.error("Erro ao salvar configurações de quórum:", error);
      NotificationService.error("Erro ao salvar configurações");
    }
  }

  private async handleZeresima(): Promise<void> {
    try {
      // ETAPA 1: Confirmar reset dos votos
      const confirmReset = await dialogService.confirm({
        title: "Resetar Votos",
        message: "Esta ação é irreversível!\n\n" + "Deseja continuar?",
        confirmText: "Sim",
        cancelText: "Cancelar",
        icon: "warning",
      });

      if (!confirmReset) {
        return;
      }

      NotificationService.info("Resetando todos os votos...");

      // 1. Obter dados ANTES de resetar (para o relatório)
      const auditManager = AuditManager.getInstance();
      const auditDataBeforeReset = await auditManager.getReportData();
      const totalVotesBeforeReset = auditDataBeforeReset.totalVotes;

      // 2. Resetar votos dos membros (Firebase + localStorage)
      const { VotingManager } = await import("@/modules/voting");
      const votingManager = VotingManager.getInstance();
      await votingManager.resetVotes();

      // 3. Resetar auditoria (Firebase + localStorage)
      auditManager.clearAllVotes();

      // 4. Aguardar sincronização
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ✅ NOVO: Atualizar UI da aba de votação imediatamente
      await this.loadVotingData();

      NotificationService.success("✅ Votos resetados com sucesso!");

      // ETAPA 2: Perguntar se deseja gerar relatório
      const confirmReport = await dialogService.confirm({
        title: "Gerar Zerésima",
        message:
          `Total de votos registrados: ${totalVotesBeforeReset}.\n` +
          `Deseja gerar o relatório?`,
        confirmText: "Sim",
        cancelText: "Não",
        icon: "description",
      });

      if (confirmReport) {
        // Gerar relatório
        NotificationService.info("Gerando relatório Zerésima...");

        const reportManager = ReportManager.getInstance();
        const result = await reportManager.generateZeresimaReport();

        if (result.success) {
          NotificationService.success(
            "✅ Relatório Zerésima gerado com sucesso!"
          );
        } else {
          NotificationService.error(
            result.error || "Erro ao gerar relatório Zerésima"
          );
        }
      }

      // 5. Atualizar UI - recarregar página para refletir mudanças
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Erro ao processar Zerésima:", error);
      NotificationService.error("Erro ao processar relatório Zerésima");
    }
  }

  private async handleAttendanceSearch(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const query = input.value.trim().toLowerCase();

    this.debounce(
      "attendance-search",
      async () => {
        const members = await electionApp.getMembers();
        const container = document.getElementById("attendance-list");

        if (!container) return;

        if (query.length === 0) {
          // Resetar para página 1 e mostrar todos
          this.currentAttendancePage = 1;
          await this.renderAttendanceList();
        } else {
          // Filtrar por nome ou CPF
          const filtered = members.filter((m) => {
            const nameMatch = m.nome.toLowerCase().includes(query);
            const cpfMatch = m.cpf?.toLowerCase().includes(query) || false;
            const emailMatch = m.email?.toLowerCase().includes(query) || false;
            return nameMatch || cpfMatch || emailMatch;
          });

          // Renderizar lista filtrada
          if (filtered.length === 0) {
            container.innerHTML = `
              <div class="empty-state">
                <span class="material-icons md-48">search_off</span>
                <p>Nenhum membro encontrado</p>
                <small style="color: var(--gray-500); margin-top: 0.5rem;">
                  Tente buscar por outro nome, CPF ou e-mail
                </small>
              </div>
            `;
            // Ocultar paginação quando não há resultados
            this.hideAttendancePagination();
          } else {
            await this.renderFilteredAttendanceList(filtered);
          }
        }
      },
      300
    );
  }

  private async renderFilteredAttendanceList(members: Member[]): Promise<void> {
    const container = document.getElementById("attendance-list");
    if (!container) return;

    // Ordenar membros por ordem alfabética (nome)
    const sortedMembers = [...members].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );

    // Criar lista de presença filtrada
    const attendanceItems = sortedMembers.map((member) => {
      const isPresent = member.presente || false;
      const memberType = member.tipo || "Não informado";

      return `
        <div class="attendance-item ${isPresent ? "present" : "absent"}">
          <div class="attendance-info">
            <div class="attendance-name">${this.escapeHtml(member.nome)}</div>
            <div class="attendance-type">${memberType}</div>
          </div>
          <div class="attendance-controls">
            <label class="toggle-switch">
              <input type="checkbox" data-member-id="${member.id}" class="attendance-toggle" ${isPresent ? "checked" : ""}>
              <span class="toggle-slider"></span>
            </label>
            <div class="attendance-status">
              <span class="status-text ${isPresent ? "present-text" : "absent-text"}">
                ${isPresent ? "Presente" : "Ausente"}
              </span>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="attendance-items">
        ${attendanceItems.join("")}
      </div>
    `;

    // Setup attendance toggles para itens filtrados
    container.querySelectorAll(".attendance-toggle").forEach((toggle) => {
      toggle.addEventListener("change", this.handleAttendanceToggle.bind(this));
    });

    // Ocultar paginação durante busca/filtro
    this.hideAttendancePagination();
  }

  private async handleRefreshResults(): Promise<void> {
    try {
      await this.loadResultsData();
      NotificationService.success("Resultados atualizados");
    } catch (error) {
      console.error("[UIManager] Erro ao atualizar resultados:", error);
      NotificationService.error("Erro ao atualizar resultados");
    }
  }

  private async handleAddUser(): Promise<void> {
    // Verificar se usuário tem permissão (apenas ADMIN)
    if (!this.isCurrentUserAdmin()) {
      NotificationService.error(
        "Apenas administradores podem gerenciar usuários"
      );
      return;
    }

    // Limpar formulário e mostrar modal
    this.clearForm("user-form");
    const title = document.getElementById("user-modal-title");
    if (title) title.textContent = "Novo Usuário";
    this.showModal("user-modal");
  }

  private async handleUserSubmit(e: Event): Promise<void> {
    e.preventDefault();

    // Verificar permissões novamente
    if (!this.isCurrentUserAdmin()) {
      NotificationService.error(
        "Apenas administradores podem gerenciar usuários"
      );
      return;
    }

    const authManager = AuthManager.getInstance();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const editingId = form.dataset.editingId;

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const displayName = formData.get("displayName") as string;

    // Validações básicas
    if (!email || !role) {
      NotificationService.error("Email e função são obrigatórios");
      return;
    }

    if (!editingId && !password) {
      NotificationService.error("Senha é obrigatória para novos usuários");
      return;
    }

    if (password && password.length < 6) {
      NotificationService.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (!["admin", "user"].includes(role)) {
      NotificationService.error("Função inválida");
      return;
    }

    try {
      if (editingId) {
        // Buscar usuários uma única vez
        const users = await authManager.getUsers();
        const currentUser = users.find((u) => u.uid === editingId);

        // Modo edição - atualizar displayName e role
        const updatePromises: Promise<{ success: boolean; error?: string }>[] =
          [];

        // Atualizar displayName se foi alterado
        if (currentUser && currentUser.displayName !== displayName) {
          updatePromises.push(
            authManager.updateUserDisplayName(editingId, displayName)
          );
        }

        // Sempre atualizar role (pode ter mudado)
        updatePromises.push(
          authManager.updateUserRole(editingId, role as UserRole)
        );

        // Executar todas as atualizações
        const results = await Promise.all(updatePromises);
        const hasError = results.some((result) => !result.success);

        if (!hasError) {
          NotificationService.success("Usuário atualizado com sucesso!");
          this.closeAllModals();

          // Recarregar lista de usuários
          await this.loadUsersData();
        } else {
          const errorMessages = results
            .filter((result) => result.error)
            .map((result) => result.error)
            .join("; ");
          NotificationService.error(
            `Erro ao atualizar usuário: ${errorMessages}`
          );
        }
      } else {
        // Modo criação
        const result = await authManager.createUser(
          email,
          password,
          role as UserRole,
          displayName || undefined
        );

        if (result.success) {
          NotificationService.success("Usuário criado com sucesso!");
          this.closeAllModals();

          // Recarregar lista de usuários
          await this.loadUsersData();
        } else {
          NotificationService.error(result.error || "Erro ao criar usuário");
        }
      }
    } catch (error) {
      NotificationService.error("Erro ao salvar usuário");
    }
  }

  private async loadUsersData(): Promise<void> {
    try {
      // Verificar permissões
      if (!this.isCurrentUserAdmin()) {
        return;
      }

      const authManager = AuthManager.getInstance();

      // Buscar usuários do Firebase Auth
      const users = await authManager.getUsers();

      // Renderizar tabela de usuários
      await this.renderUsersTable(users);

      // Atualizar estatísticas
      this.updateUsersStats(users);
    } catch (error) {
      console.error("Erro ao carregar dados de usuários:", error);
      NotificationService.error("Erro ao carregar usuários");
    }
  }

  private async renderUsersTable(users: User[]): Promise<void> {
    const tbody = document.getElementById("users-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">
            Nenhum usuário cadastrado.
          </td>
        </tr>
      `;
      return;
    }

    // Ordenar usuários por email
    const sortedUsers = [...users].sort((a, b) =>
      (a.email || "").localeCompare(b.email || "", "pt-BR", {
        sensitivity: "base",
      })
    );

    // Usar DocumentFragment para otimizar inserção em lote (~30% mais rápido)
    const fragment = document.createDocumentFragment();

    sortedUsers.forEach((user) => {
      const row = document.createElement("tr");
      const roleDisplay = this.getRoleDisplayName(user.role);
      const statusDisplay = user.emailVerified
        ? "Verificado"
        : "Não verificado";
      const statusClass = user.emailVerified
        ? "user-status-active"
        : "user-status-inactive";
      const lastLoginDisplay = user.lastLoginAt
        ? new Date(user.lastLoginAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Nunca";

      row.innerHTML = `
        <td>${this.escapeHtml(user.displayName || user.email?.split("@")[0] || "N/A")}</td>
        <td>${this.escapeHtml(user.email || "N/A")}</td>
        <td>
          <span class="user-role-badge user-role-${user.role}">${roleDisplay}</span>
        </td>
        <td>
          <span class="user-status ${statusClass}">${statusDisplay}</span>
        </td>
        <td>${lastLoginDisplay}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="editUser('${user.uid}')" title="Editar">
            <span class="material-icons md-18">edit</span>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.uid}')" title="Excluir">
            <span class="material-icons md-18">delete</span>
          </button>
        </td>
      `;
      fragment.appendChild(row);
    });

    // Inserção única otimizada
    tbody.appendChild(fragment);
  }

  private updateUsersStats(users: User[]): void {
    const totalUsers = users.length;
    const adminUsers = users.filter((u) => u.role === "admin").length;
    const regularUsers = users.filter((u) => u.role === "user").length;
    const activeUsers = users.length;

    this.updateElement("total-users", totalUsers.toString());
    this.updateElement("admin-users", adminUsers.toString());
    this.updateElement("regular-users", regularUsers.toString());
    this.updateElement("active-users", activeUsers.toString());
  }

  // @ts-expect-error - Método usado indiretamente via função global editUser()
  private async handleEditUser(uid: string): Promise<void> {
    try {
      const authManager = AuthManager.getInstance();
      const users = await authManager.getUsers();
      const user = users.find((u) => u.uid === uid);

      if (!user) {
        NotificationService.error("Usuário não encontrado");
        return;
      }

      // Preencher o formulário com os dados do usuário
      const modal = document.getElementById("user-modal");
      const form = document.getElementById("user-form") as HTMLFormElement;
      const title = document.getElementById("user-modal-title");

      if (!modal || !form || !title) return;

      title.textContent = "Editar Usuário";

      // Preencher campos
      (document.getElementById("user-display-name") as HTMLInputElement).value =
        user.displayName || "";
      (document.getElementById("user-email") as HTMLInputElement).value =
        user.email || "";
      (document.getElementById("user-role") as HTMLSelectElement).value =
        user.role || "user";

      // Configurar campos para edição
      const emailInput = document.getElementById(
        "user-email"
      ) as HTMLInputElement;
      const passwordInput = document.getElementById(
        "user-password"
      ) as HTMLInputElement;

      // Campo email: visível mas não editável
      if (emailInput) {
        emailInput.readOnly = true; // Usar readOnly ao invés de disabled para manter no FormData
        emailInput.style.display = "block"; // Garantir que está visível
        emailInput.style.opacity = "0.6"; // Visual de desabilitado
        emailInput.style.cursor = "not-allowed"; // Cursor indicando não editável
        // Mostrar label também
        const emailLabel = document.querySelector(
          'label[for="user-email"]'
        ) as HTMLElement;
        if (emailLabel) {
          emailLabel.style.display = "block";
          emailLabel.textContent = "Email (não pode ser alterado)"; // Indicar que não pode ser alterado
        }
      }

      // Campo senha: visível mas desabilitado (funcionalidade ainda não implementada)
      if (passwordInput) {
        passwordInput.style.display = "block"; // Garantir que está visível
        passwordInput.disabled = true; // Desabilitar por enquanto
        passwordInput.required = false; // Não obrigatório na edição
        passwordInput.value = ""; // Limpar campo
        passwordInput.placeholder = "Funcionalidade em desenvolvimento";
        // Mostrar label também
        const passwordLabel = document.querySelector(
          'label[for="user-password"]'
        ) as HTMLElement;
        if (passwordLabel) {
          passwordLabel.style.display = "block";
          passwordLabel.textContent = "Senha (em desenvolvimento)"; // Indicar que está em desenvolvimento
        }
      }

      // Armazenar o UID do usuário sendo editado
      form.dataset.editingId = uid;

      // Mostrar modal usando o método correto
      this.showModal("user-modal");
    } catch (error) {
      NotificationService.error("Erro ao carregar dados do usuário");
    }
  }

  // @ts-expect-error - Método usado indiretamente via função global deleteUser()
  private async handleDeleteUser(uid: string): Promise<void> {
    try {
      const authManager = AuthManager.getInstance();
      const users = await authManager.getUsers();
      const user = users.find((u) => u.uid === uid);

      if (!user) {
        NotificationService.error("Usuário não encontrado");
        return;
      }

      // Não permitir excluir o próprio usuário
      const currentUser = authManager.getCurrentUser();
      if (currentUser && currentUser.uid === uid) {
        NotificationService.error("Você não pode excluir sua própria conta");
        return;
      }

      // Confirmar exclusão
      const confirmed = await dialogService.confirm({
        title: "Excluir Usuário",
        message: `Tem certeza que deseja excluir o usuário "${user.displayName || user.email}"?\n\nEsta ação não pode ser desfeita.`,
        confirmText: "Sim, Excluir",
        cancelText: "Cancelar",
        icon: "delete_forever",
      });

      if (!confirmed) return;

      // Deletar usuário
      const result = await authManager.deleteUser(uid);

      if (result.success) {
        NotificationService.success(
          `Usuário "${user.displayName || user.email}" excluído com sucesso!`
        );

        // Recarregar lista de usuários
        await this.loadUsersData();
      } else {
        NotificationService.error(result.error || "Erro ao excluir usuário");
      }
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      NotificationService.error("Erro ao excluir usuário");
    }
  }
}

// Expose methods globally for inline event handlers
(window as any).editMember = async (id: string) => {
  try {
    const members = await electionApp.getMembers();
    const member = members.find((m) => m.id === id);

    if (!member) {
      NotificationService.error("Membro não encontrado");
      return;
    }

    // Preencher o formulário com os dados do membro
    const modal = document.getElementById("member-modal");
    const form = document.getElementById("member-form") as HTMLFormElement;
    const title = document.getElementById("member-modal-title");

    if (!modal || !form || !title) return;

    title.textContent = "Editar Membro";

    // Preencher campos
    (document.getElementById("member-name") as HTMLInputElement).value =
      member.nome;
    (document.getElementById("member-type") as HTMLSelectElement).value =
      member.tipo || "";
    (document.getElementById("member-cpf") as HTMLInputElement).value =
      member.cpf || "";
    (document.getElementById("member-rg") as HTMLInputElement).value =
      member.rg || "";
    (document.getElementById("member-email") as HTMLInputElement).value =
      member.email || "";
    (document.getElementById("member-phone") as HTMLInputElement).value =
      member.telefone || "";
    (document.getElementById("member-candidate") as HTMLSelectElement).value =
      member.candidato || "";

    // Configurar estado inicial do campo candidato baseado no tipo
    const typeSelect = document.getElementById(
      "member-type"
    ) as HTMLSelectElement;
    const candidateSelect = document.getElementById(
      "member-candidate"
    ) as HTMLSelectElement;

    if (typeSelect && candidateSelect) {
      // Função para atualizar o estado do campo candidato
      const updateCandidateField = () => {
        const isComungante = typeSelect.value === "Membro Comungante";
        candidateSelect.disabled = !isComungante;

        if (!isComungante) {
          candidateSelect.value = "";
          // Adicionar título explicativo
          candidateSelect.title =
            "Apenas Membros Comungantes podem ser candidatos";
        } else {
          candidateSelect.title = "";
        }
      };

      // Configurar estado inicial
      updateCandidateField();

      // Listener para mudanças no tipo
      typeSelect.removeEventListener("change", updateCandidateField);
      typeSelect.addEventListener("change", updateCandidateField);
    }

    // Armazenar o ID do membro sendo editado
    form.dataset.editingId = id;

    // Mostrar modal
    modal.classList.add("modal-active");
    document.body.classList.add("modal-open");
  } catch (error) {
    console.error("Erro ao editar membro:", error);
    NotificationService.error("Erro ao carregar dados do membro");
  }
};

(window as any).deleteMember = async (id: string) => {
  try {
    const members = await electionApp.getMembers();
    const member = members.find((m) => m.id === id);

    if (!member) {
      NotificationService.error("Membro não encontrado");
      return;
    }

    // Confirmar exclusão
    const { dialogService } = await import("./dialog");
    const confirmed = await dialogService.confirm({
      title: "Excluir Membro",
      message: `Tem certeza que deseja excluir o membro "${member.nome}"?\n\nEsta ação não pode ser desfeita.`,
      confirmText: "Sim, Excluir",
      cancelText: "Cancelar",
      icon: "delete_forever",
    });

    if (!confirmed) return;

    // Deletar membro
    const result = await electionApp.deleteMember(id);

    if (result.success) {
      NotificationService.success(
        `Membro "${member.nome}" excluído com sucesso!`
      );

      // Recarregar lista de membros
      const uiManager = UIManager.getInstance();
      await (uiManager as any).loadMembersData();
      await (uiManager as any).updateStats();
    } else {
      NotificationService.error(result.error || "Erro ao excluir membro");
    }
  } catch (error) {
    console.error("Erro ao deletar membro:", error);
    NotificationService.error("Erro ao excluir membro");
  }
};

(window as any).editUser = async (uid: string) => {
  const uiManager = UIManager.getInstance();
  await (uiManager as any).handleEditUser(uid);
};

(window as any).deleteUser = async (uid: string) => {
  const uiManager = UIManager.getInstance();
  await (uiManager as any).handleDeleteUser(uid);
};
