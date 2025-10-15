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

export class UIManager {
  private static instance: UIManager;
  private debounceTimers: Map<string, number> = new Map();
  // Acessibilidade: Armazena o elemento que abriu o modal
  private lastFocusedElement: HTMLElement | null = null;
  private activeModal: HTMLElement | null = null;

  static getInstance(): UIManager {
    if (!UIManager.instance) {
      UIManager.instance = new UIManager();
    }
    return UIManager.instance;
  }

  async initialize(): Promise<void> {
    console.log("[UIManager] Configurando event listeners...");
    this.setupEventListeners();

    console.log("[UIManager] Configurando navegação de abas...");
    this.setupTabNavigation();

    console.log("[UIManager] Configurando modais...");
    this.setupModals();

    console.log("[UIManager] Configurando listeners de eventos do sistema...");
    this.setupSystemEventListeners();

    console.log("[UIManager] Carregando dados iniciais...");
    await this.loadInitialData();

    console.log("[UIManager] Inicializando preferências...");
    this.initializeDarkMode();

    console.log("[UIManager] ✓ Inicialização completa!");
  }

  /**
   * Abre o modal de configuração de quórum.
   * ✅ Método público para ser chamado externamente (ex: app.ts)
   */
  public async openQuorumConfigModal(): Promise<void> {
    console.log("[UIManager] 📋 Abrindo modal de configuração de quórum...");
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

  private setupEventListeners(): void {
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
    document
      .getElementById("member-search")
      ?.addEventListener("input", this.handleMemberSearch.bind(this));

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
    document
      .getElementById("exit-fullscreen")
      ?.addEventListener("click", this.closeFullscreen.bind(this));

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

    // Attendance actions
    document
      .getElementById("mark-all-present")
      ?.addEventListener("click", this.handleMarkAllPresent.bind(this));
    document
      .getElementById("mark-all-absent")
      ?.addEventListener("click", this.handleMarkAllAbsent.bind(this));
    document
      .getElementById("attendance-search")
      ?.addEventListener("input", this.handleAttendanceSearch.bind(this));

    // Results actions
    document
      .getElementById("refresh-results")
      ?.addEventListener("click", this.handleRefreshResults.bind(this));

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

    // Setup dark mode toggle
    document
      .getElementById("dark-mode-toggle")
      ?.addEventListener("change", this.handleDarkModeToggle.bind(this));

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
        console.log(
          `[UIManager] 📥 Evento MEMBERS_IMPORTED recebido: ${data.count} membros carregados do Firebase`
        );

        // ✅ CORREÇÃO: Usar debounce para atualizar estatísticas
        this.debouncedUpdateStats();

        // Recarregar aba atual para exibir dados do Firebase
        const currentTab = this.getCurrentTab();

        if (currentTab === "members") {
          console.log("[UIManager] 🔄 Recarregando aba Membros...");
          await this.loadMembersData();
        } else if (currentTab === "candidates") {
          console.log("[UIManager] 🔄 Recarregando aba Candidatos...");
          await this.loadCandidatesData();
        } else if (currentTab === "attendance") {
          console.log("[UIManager] 🔄 Recarregando aba Presença...");
          await this.loadAttendanceData();
        } else if (currentTab === "voting") {
          console.log("[UIManager] 🔄 Recarregando aba Votação...");
          await this.loadVotingData();
        } else if (currentTab === "results") {
          console.log("[UIManager] 🔄 Recarregando aba Resultados...");
          await this.loadResultsData();
        }

        console.log(
          "[UIManager] ✅ UI atualizada com dados carregados do Firebase"
        );
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

      console.log("[UIManager] ✓ Aba Candidatos sincronizada");
    });

    // Ouvir deleção de membros para sincronizar a aba de Candidatos
    electionApp.events.on(EventTypes.MEMBER_DELETED, async () => {
      console.log(
        "[UIManager] Evento MEMBER_DELETED recebido, sincronizando..."
      );
      await this.loadCandidatesData();
      console.log("[UIManager] ✓ Aba Candidatos sincronizada");
    });

    // Ouvir atualizações de presença para atualizar contador e status de quórum
    electionApp.events.on(EventTypes.ATTENDANCE_SAVED, async () => {
      console.log(
        "[UIManager] Evento ATTENDANCE_SAVED recebido, atualizando UI..."
      );

      // ✅ CORREÇÃO: Usar debounce para atualizar estatísticas
      this.debouncedUpdateStats();

      // ✅ CORREÇÃO: Recarregar apenas aba atual (evita múltiplas chamadas de getAttendanceStats)
      const currentTab = this.getCurrentTab();

      if (currentTab === "attendance") {
        await this.loadAttendanceData();
      } else if (currentTab === "voting") {
        await this.loadVotingData();
      }

      console.log("[UIManager] ✓ Contador de presença e quórum atualizados");
    });

    // ✅ CRÍTICO: Ouvir sincronização remota do Firebase para atualizar quórum
    electionApp.events.on(
      EventTypes.SYNC_MEMBERS_UPDATED,
      async (members: Member[]) => {
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

        console.log("[UIManager] ✓ UI sincronizada com dados do Firebase");
      }
    );

    // Ouvir sincronização de configurações do Firebase
    electionApp.events.on(EventTypes.SYNC_CONFIG_UPDATED, async () => {
      console.log(
        "[UIManager] Evento SYNC_CONFIG_UPDATED recebido do Firebase"
      );

      // Recarregar aba de votação se estiver ativa (para atualizar quórum)
      const currentTab = this.getCurrentTab();
      if (currentTab === "voting") {
        await this.loadVotingData();
      }

      console.log("[UIManager] ✓ Configurações sincronizadas com Firebase");
    });

    // ✅ NOVO: Ouvir quando configuração de quórum é necessária
    electionApp.events.on(
      EventTypes.QUORUM_CONFIG_REQUIRED,
      async (data: { reason: string; source: string }) => {
        console.log(
          "[UIManager] 📋 Evento QUORUM_CONFIG_REQUIRED recebido:",
          data
        );
        console.log(
          "[UIManager] ⚠️ Nenhuma configuração de quórum encontrada!"
        );
        console.log(
          "[UIManager] 🔓 Abrindo modal de configuração automaticamente..."
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
      }
    } catch (error) {
      console.error(`Erro ao carregar dados da aba ${tabName}:`, error);
      NotificationService.error(`Erro ao carregar dados da aba ${tabName}`);
    }
  }

  private async loadInitialData(): Promise<void> {
    console.log("[UIManager] Carregando dados de membros...");
    await this.loadMembersData();

    // ✅ CORREÇÃO: Removido updateStats() duplicado
    // loadMembersData() já chama updateStats() internamente

    console.log("[UIManager] ✓ Dados iniciais carregados!");
  }

  // Members
  private async loadMembersData(): Promise<void> {
    const members = await electionApp.getMembers();
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
            Nenhum membro cadastrado. 
            <button class="btn btn-link" onclick="document.getElementById('add-member')?.click()">
              Adicionar primeiro membro
            </button>
          </td>
        </tr>
      `;
      return;
    }

    // Ordenar membros por ordem alfabética (nome)
    const sortedMembers = [...members].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );

    // FASE 7: Usar Member.presente diretamente (SSOT)
    sortedMembers.forEach((member) => {
      const isPresent = member.presente || false;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${this.escapeHtml(member.nome)}</td>
        <td>${member.tipo || "-"}</td>
        <td>${member.candidato || "-"}</td>
        <td>
          <label class="toggle-switch">
            <input type="checkbox" data-member-id="${member.id}" class="attendance-toggle" ${isPresent ? "checked" : ""}>
            <span class="toggle-slider"></span>
          </label>
        </td>
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

    // Setup attendance toggles
    tbody.querySelectorAll(".attendance-toggle").forEach((toggle) => {
      toggle.addEventListener("change", this.handleAttendanceToggle.bind(this));
    });
  }

  // Event handlers
  private debounce(key: string, fn: Function, delay: number): void {
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
          await this.renderMembersTable(results);
        }
      },
      300
    );
  }

  private async handleAttendanceToggle(e: Event): Promise<void> {
    const checkbox = e.target as HTMLInputElement;
    const memberId = checkbox.dataset.memberId;

    if (!memberId) return;

    try {
      const result = await electionApp.markAttendance(
        memberId,
        checkbox.checked
      );
      if (!result.success) {
        checkbox.checked = !checkbox.checked; // Revert
        NotificationService.error(result.error || "Erro ao atualizar presença");
      } else {
        await this.updateStats();
      }
    } catch (error) {
      checkbox.checked = !checkbox.checked; // Revert
      NotificationService.error("Erro ao atualizar presença");
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
      cpf: formData.get("cpf") as string,
      rg: formData.get("rg") as string,
      email: formData.get("email") as string,
      telefone: formData.get("phone") as string,
      candidato: candidato,
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
      console.log("[UIManager] Conteúdo do CSV:", content);

      const result = await electionApp.importMembers(content);
      console.log("[UIManager] Resultado da importação:", result);

      if (result.success) {
        const message =
          result.candidatesAdded > 0
            ? `${result.membersAdded} membros e ${result.candidatesAdded} candidatos importados!`
            : `${result.membersAdded} membros importados com sucesso!`;

        NotificationService.success(message);

        if (result.errors && result.errors.length > 0) {
          console.warn(
            "[UIManager] ⚠️ Erros/Avisos na importação:",
            result.errors
          );
          // Mostrar erros ao usuário
          result.errors.forEach((error) => {
            console.error(`  - ${error}`);
          });
          NotificationService.warning(
            `Importação concluída com ${result.errors.length} aviso(s). Veja o console para detalhes.`
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
      console.log("[DEBUG loadCandidatesData] Carregando candidatos...");

      // Buscar todos os candidatos e separar por cargo
      const allCandidates = await electionApp.getCandidates();

      console.log(
        "[DEBUG loadCandidatesData] Candidatos carregados:",
        allCandidates.map((c) => ({
          id: c.id,
          name: c.name,
          role: c.role,
          hasPhotoUrl: !!c.photoUrl,
          photoUrlLength: c.photoUrl?.length,
        }))
      );

      const presbyteros = allCandidates.filter((c) => c.role === "Presbítero");
      const diaconos = allCandidates.filter((c) => c.role === "Diácono");

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
    console.log("[DEBUG renderCandidateCard] Renderizando card:", {
      id: candidate.id,
      name: candidate.name,
      hasPhotoUrl: !!candidate.photoUrl,
      photoUrlLength: candidate.photoUrl?.length,
      photoUrlStart: candidate.photoUrl?.substring(0, 30),
    });

    const photoHtml = candidate.photoUrl
      ? `<img src="${candidate.photoUrl}" alt="${candidate.name}" />`
      : `<span class="material-icons">person</span>`;

    console.log(
      "[DEBUG renderCandidateCard] photoHtml gerado:",
      photoHtml.substring(0, 100)
    );

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
      console.error(
        `[DEBUG] Membro não encontrado para candidate.id=${candidate.id}`
      );
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

    console.log("[DEBUG handleEditCandidate] Abrindo modal de edição:", {
      candidateId,
      name: candidate.name,
      role: candidate.role,
      hasPhoto: !!candidate.photoUrl,
      photoUrlLength: candidate.photoUrl?.length,
      datasetPhotoUrl: form.dataset.photoUrl?.substring(0, 50),
    });

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

    // Converter para base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const photoUrl = e.target?.result as string;
      const photoPreview = document.getElementById(
        "candidate-photo-preview"
      ) as HTMLDivElement;
      const removePhotoBtn = document.getElementById(
        "remove-photo-btn"
      ) as HTMLButtonElement;

      if (photoPreview) {
        // Substituir conteúdo por imagem
        photoPreview.innerHTML = `<img src="${photoUrl}" alt="Foto do candidato" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />`;
      }

      if (removePhotoBtn) {
        removePhotoBtn.style.display = "inline-flex";
      }

      // Salvar temporariamente no formulário
      const form = document.getElementById("candidate-form") as HTMLFormElement;
      if (form) {
        form.dataset.photoUrl = photoUrl;
        console.log("[DEBUG handlePhotoUpload] Foto carregada:", {
          fileSize: file.size,
          fileType: file.type,
          photoUrlLength: photoUrl.length,
          photoUrlPreview: photoUrl.substring(0, 50) + "...",
        });
      }
    };

    reader.readAsDataURL(file);
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
      // Marcar como removida (string vazia) ao invés de deletar
      form.dataset.photoUrl = "";
    }
  }

  private openFullscreen(role: CandidateRole): void {
    console.log("[openFullscreen] Iniciando com role:", role);

    const fullscreenView = document.getElementById("fullscreen-view");
    const candidatesGrid = document.getElementById(
      "fullscreen-candidates-grid"
    );
    const roleTitle = document.getElementById("fullscreen-role-title");

    console.log("[openFullscreen] Elementos:", {
      fullscreenView: !!fullscreenView,
      candidatesGrid: !!candidatesGrid,
      roleTitle: !!roleTitle,
    });

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

  private closeFullscreen(): void {
    const fullscreenView = document.getElementById("fullscreen-view");
    if (!fullscreenView) return;

    // Sair do fullscreen nativo
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    // Ocultar view
    fullscreenView.style.display = "none";
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
            <h3 class="fullscreen-candidate-name">${candidate.name}</h3>
            <div class="fullscreen-candidate-votes">${candidate.votes}</div>
          </div>
        `;
      })
      .join("");

    // Adicionar event listeners
    this.attachFullscreenSyncListeners();
  }

  private attachFullscreenSyncListeners(): void {
    // Apenas configurar sincronização em tempo real
    // Não há controles de interação na projeção
    console.log("[UIManager] 🎥 Projeção configurada apenas para visualização");
  }

  private async handleRemoveCandidate(
    candidateId: string,
    role: CandidateRole
  ): Promise<void> {
    if (!confirm(`Tem certeza que deseja remover este candidato a ${role}?`)) {
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
      console.log("[UIManager] Carregando dados de votação...");

      // Carregar quórum, candidatos e configuração
      const [results, candidates, quorumConfig] = await Promise.all([
        electionApp.getElectionResults(),
        electionApp.getCandidates(),
        electionApp.getQuorumConfig(),
      ]);

      console.log("[UIManager] Dados de quórum recebidos:", results.quorum);

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

      console.log("[UIManager] ✓ Dados de votação carregados");
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
            <div class="voting-card-actions">
              <button class="btn-vote btn-vote-decrease" data-candidate-id="${candidate.id}" data-action="decrease" ${!isQuorumValid ? "disabled" : ""}>
                <span class="material-icons md-24">remove</span>
              </button>
              <button class="btn-vote btn-vote-reset" data-candidate-id="${candidate.id}" data-action="reset" title="Resetar votos" ${!isQuorumValid ? "disabled" : ""}>
                <span class="material-icons md-24">refresh</span>
              </button>
              <button class="btn-vote btn-vote-increase" data-candidate-id="${candidate.id}" data-action="increase" ${!isQuorumValid ? "disabled" : ""}>
                <span class="material-icons md-24">add</span>
              </button>
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

    // Adicionar event listeners aos botões de voto APENAS se quórum for válido
    if (isQuorumValid) {
      container.querySelectorAll(".btn-vote").forEach((btn) => {
        btn.addEventListener("click", this.handleVoteAction.bind(this));
      });

      // Adicionar event listeners para clique na foto (adiciona voto)
      container.querySelectorAll(".voting-card-header").forEach((header) => {
        const card = header.closest(".voting-card");
        if (!card?.classList.contains("voting-card-empty")) {
          header.addEventListener("click", async () => {
            const increaseBtn = card?.querySelector(
              ".btn-vote-increase"
            ) as HTMLElement;
            if (increaseBtn) {
              increaseBtn.click();
            }
          });
          // Adicionar cursor pointer para indicar que é clicável
          (header as HTMLElement).style.cursor = "pointer";
        }
      });
    } else {
      // Remover cursor pointer quando quórum é inválido
      container.querySelectorAll(".voting-card-header").forEach((header) => {
        (header as HTMLElement).style.cursor = "not-allowed";
      });
    }
  }

  private async handleVoteAction(e: Event): Promise<void> {
    e.preventDefault();
    const button = e.currentTarget as HTMLElement;
    const candidateId = button.dataset.candidateId;
    const action = button.dataset.action;

    console.log("[UIManager] 🎯 handleVoteAction:", { candidateId, action });

    if (!candidateId || !action) return;

    // ✅ Verificar se quórum é válido antes de permitir votação
    const results = await electionApp.getElectionResults();
    if (!results.quorum.isValid) {
      NotificationService.warning(
        "Não é possível votar enquanto o quórum estiver insuficiente"
      );
      return;
    }

    try {
      // 🎥 PROJEÇÃO: Usar métodos específicos sem validação de eleitor
      if (action === "increase") {
        console.log("[UIManager] ➕ Adicionando voto (projeção)...");
        const result = await electionApp.incrementVoteProjection(candidateId);
        console.log("[UIManager] Resultado incrementVoteProjection:", result);

        if (result.success) {
          NotificationService.show("Voto adicionado", "success");
        } else {
          NotificationService.error(result.error || "Erro ao adicionar voto");
          return;
        }
      } else if (action === "decrease") {
        console.log("[UIManager] ➖ Removendo voto (projeção)...");
        const result = await electionApp.decrementVoteProjection(candidateId);
        console.log("[UIManager] Resultado decrementVoteProjection:", result);

        if (result.success) {
          NotificationService.show("Voto removido", "success");
        } else {
          NotificationService.error(result.error || "Erro ao remover voto");
          return;
        }
      } else if (action === "reset") {
        if (
          !confirm("Tem certeza que deseja resetar os votos deste candidato?")
        ) {
          return;
        }

        console.log("[UIManager] 🔄 Resetando votos (projeção)...");
        const result = await electionApp.resetVotesProjection(candidateId);
        console.log("[UIManager] Resultado resetVotesProjection:", result);

        if (result.success) {
          NotificationService.show("Votos resetados", "success");
        } else {
          NotificationService.error(result.error || "Erro ao resetar votos");
          return;
        }
      }

      // Recarregar dados de votação
      console.log("[UIManager] 🔄 Recarregando dados de votação...");
      await this.loadVotingData();
      console.log("[UIManager] ✅ Dados de votação recarregados!");
    } catch (error) {
      console.error("[UIManager] Erro ao processar voto:", error);
      NotificationService.error("Erro ao processar voto");
    }
  }

  private async loadAttendanceData(): Promise<void> {
    try {
      console.log("[UIManager] Recarregando dados de presença...");

      // Recarregar tabela de membros (atualiza checkboxes de presença)
      await this.loadMembersData();

      // ✅ CORREÇÃO: Removido updateStats() duplicado
      // loadMembersData() já chama updateStats() internamente

      console.log("[UIManager] ✓ Dados de presença recarregados");
    } catch (error) {
      console.error("[UIManager] Erro ao recarregar dados de presença:", error);
    }
  }

  private async loadResultsData(): Promise<void> {
    try {
      const results = await electionApp.getElectionResults();

      // Atualizar lista de presbíteros eleitos
      const presbyterosList = document.getElementById("elected-presbyteros");
      if (presbyterosList) {
        if (results.presbyteros.length === 0) {
          presbyterosList.innerHTML =
            '<p class="empty-message">Nenhum presbítero eleito ainda</p>';
        } else {
          presbyterosList.innerHTML = results.presbyteros
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

      // Atualizar lista de diáconos eleitos
      const diaconosList = document.getElementById("elected-diaconos");
      if (diaconosList) {
        if (results.diaconos.length === 0) {
          diaconosList.innerHTML =
            '<p class="empty-message">Nenhum diácono eleito ainda</p>';
        } else {
          diaconosList.innerHTML = results.diaconos
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
                    .sort((a, b) => b.votes - a.votes)
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
              <p><strong>Total de votos:</strong> ${results.totalVotes}</p>
              <p><strong>Quórum:</strong> ${results.quorum.isValid ? "✅ Válido" : "❌ Inválido"}</p>
              <p><strong>Presentes:</strong> ${results.quorum.presentMembers} / ${results.quorum.totalMembers}</p>
            </div>
          `;
        }
      }

      console.log("[UIManager] ✓ Resultados carregados");
    } catch (error) {
      console.error("[UIManager] Erro ao carregar resultados:", error);
      NotificationService.error("Erro ao carregar resultados da eleição");
    }
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

    console.log("[DEBUG handleCandidateSubmit] Iniciando submit:", {
      editingId,
      photoUrl: photoUrl?.substring(0, 50) + "...",
      photoUrlType: typeof photoUrl,
      photoUrlLength: photoUrl?.length,
      hasPhotoUrl: !!photoUrl,
      datasetKeys: Object.keys(form.dataset),
    });

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
      console.log("[DEBUG handleCandidateSubmit] Atualizando candidato:", {
        editingId,
        hasPhotoUrl: !!photoUrl,
        photoUrlLength: photoUrl?.length,
      });

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

      console.log("[DEBUG handleCandidateSubmit] Candidato atualizado:", {
        id: editingId,
        hasPhotoUrl: !!updates.photoUrl,
        photoUrlLength: updates.photoUrl?.length,
      });

      NotificationService.show("Foto atualizada com sucesso", "success");
    } else {
      // ✅ CORRIGIDO: MODO CRIAÇÃO - Atualizar membro diretamente
      const updateResult = await electionApp.updateMember(memberId, {
        candidato: role,
        photoUrl,
      });

      if (updateResult.success) {
        NotificationService.show("Candidato adicionado com sucesso", "success");
        console.log(
          `[UIManager] Membro ${memberId} marcado como candidato ${role}`
        );
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
      console.log("[UIManager] Carregando configuração do Firebase...");
      const firebaseData = await RealtimeSync.getInstance().loadInitialState();

      if (firebaseData.config) {
        console.log("[UIManager] ✓ Configuração sincronizada do Firebase");
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

  private async handleMarkAllPresent(): Promise<void> {
    try {
      const result = await electionApp.markAllPresent();

      if (result.success) {
        NotificationService.success(
          `${result.updated || 0} membros marcados como presentes`
        );
        await this.loadAttendanceData();
      } else {
        NotificationService.error(result.error || "Erro ao marcar presenças");
      }
    } catch (error) {
      console.error("[UIManager] Erro ao marcar todos presentes:", error);
      NotificationService.error("Erro ao marcar todos como presentes");
    }
  }

  private async handleMarkAllAbsent(): Promise<void> {
    try {
      const result = await electionApp.markAllAbsent();

      if (result.success) {
        NotificationService.success(
          `${result.updated || 0} membros marcados como ausentes`
        );
        await this.loadAttendanceData();
      } else {
        NotificationService.error(result.error || "Erro ao marcar ausências");
      }
    } catch (error) {
      console.error("[UIManager] Erro ao marcar todos ausentes:", error);
      NotificationService.error("Erro ao marcar todos como ausentes");
    }
  }

  private async handleAttendanceSearch(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const query = input.value.trim().toLowerCase();

    this.debounce(
      "attendance-search",
      async () => {
        const members = await electionApp.getMembers();

        if (query.length === 0) {
          // Mostrar todos
          await this.renderMembersTable(members);
        } else {
          // Filtrar por nome ou CPF
          const filtered = members.filter((m) => {
            const nameMatch = m.nome.toLowerCase().includes(query);
            const cpfMatch = m.cpf?.includes(query) || false;
            return nameMatch || cpfMatch;
          });
          await this.renderMembersTable(filtered);
        }
      },
      300
    );
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
    const confirmed = confirm(
      `Tem certeza que deseja excluir o membro "${member.nome}"?\n\nEsta ação não pode ser desfeita.`
    );

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
