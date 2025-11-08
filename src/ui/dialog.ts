// Sistema de diálogos personalizados

export interface DialogOptions {
  title: string;
  message: string;
  type?: "info" | "warning" | "error" | "success" | "confirm" | "prompt";
  confirmText?: string;
  cancelText?: string;
  placeholder?: string; // Para tipo 'prompt'
  icon?: string; // Material Icons
  onConfirm?: (value?: string) => void | Promise<void>;
  onCancel?: () => void;
}

export class DialogService {
  private static instance: DialogService;
  private activeDialog: HTMLElement | null = null;
  private escapeHandler: ((e: KeyboardEvent) => void) | null = null;

  static getInstance(): DialogService {
    if (!DialogService.instance) {
      DialogService.instance = new DialogService();
    }
    return DialogService.instance;
  }

  /**
   * Exibir diálogo de confirmação
   */
  async confirm(options: Omit<DialogOptions, "type">): Promise<boolean> {
    return new Promise((resolve) => {
      this.show({
        ...options,
        type: "confirm",
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }

  /**
   * Exibir diálogo com campo de input
   */
  async prompt(options: Omit<DialogOptions, "type">): Promise<string | null> {
    return new Promise((resolve) => {
      this.show({
        ...options,
        type: "prompt",
        onConfirm: (value) => resolve(value || null),
        onCancel: () => resolve(null),
      });
    });
  }

  /**
   * Exibir diálogo de alerta
   */
  async alert(
    options: Omit<DialogOptions, "type" | "cancelText">
  ): Promise<void> {
    return new Promise((resolve) => {
      this.show({
        ...options,
        type: "info",
        confirmText: options.confirmText || "OK",
        onConfirm: () => resolve(),
      });
    });
  }

  /**
   * Exibir diálogo genérico
   */
  show(options: DialogOptions): void {
    // Fechar diálogo anterior se existir
    if (this.activeDialog) {
      this.close();
    }

    const {
      title,
      message,
      type = "info",
      confirmText = "Confirmar",
      cancelText = "Cancelar",
      placeholder = "",
      icon,
      onConfirm,
      onCancel,
    } = options;

    // Determinar ícone baseado no tipo
    const dialogIcon = icon || this.getIconForType(type);
    const dialogColor = this.getColorForType(type);

    // Criar overlay
    const overlay = document.createElement("div");
    overlay.className = "custom-dialog-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "dialog-title");

    // Criar diálogo
    const dialog = document.createElement("div");
    dialog.className = "custom-dialog";
    dialog.innerHTML = `
      <div class="custom-dialog-header">
        <div class="custom-dialog-icon" style="color: ${dialogColor};">
          <span class="material-icons md-48">${dialogIcon}</span>
        </div>
        <h3 id="dialog-title" class="custom-dialog-title">${title}</h3>
      </div>
      <div class="custom-dialog-body">
        <p class="custom-dialog-message">${message}</p>
        ${type === "prompt" ? `<input type="text" id="dialog-input" class="custom-dialog-input" placeholder="${placeholder}" autocomplete="off" />` : ""}
      </div>
      <div class="custom-dialog-actions">
        ${type === "confirm" || type === "prompt" ? `<button class="btn btn-secondary custom-dialog-cancel">${cancelText}</button>` : ""}
        <button class="btn btn-primary custom-dialog-confirm">${confirmText}</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    this.activeDialog = overlay;

    // Adicionar classe para animação
    requestAnimationFrame(() => {
      overlay.classList.add("active");
    });

    // Focar no input se for prompt
    if (type === "prompt") {
      const input = dialog.querySelector("#dialog-input") as HTMLInputElement;
      if (input) {
        setTimeout(() => input.focus(), 100);
      }
    } else {
      // Focar no botão de confirmar
      const confirmBtn = dialog.querySelector(
        ".custom-dialog-confirm"
      ) as HTMLButtonElement;
      if (confirmBtn) {
        setTimeout(() => confirmBtn.focus(), 100);
      }
    }

    // Event listeners
    const confirmBtn = dialog.querySelector(".custom-dialog-confirm");
    const cancelBtn = dialog.querySelector(".custom-dialog-cancel");
    const input = dialog.querySelector(
      "#dialog-input"
    ) as HTMLInputElement | null;

    confirmBtn?.addEventListener("click", () => {
      const value = input?.value;
      this.close();
      if (onConfirm) {
        const result = onConfirm(value);
        // Se retornar Promise, aguardar
        if (result instanceof Promise) {
          result.catch(console.error);
        }
      }
    });

    cancelBtn?.addEventListener("click", () => {
      this.close();
      onCancel?.();
    });

    // Fechar com ESC
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        this.close();
        onCancel?.();
      }
    };

    // Armazenar referência e adicionar listener
    this.escapeHandler = handleEscape;
    document.addEventListener("keydown", this.escapeHandler);

    // Enter no input submete
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          confirmBtn?.dispatchEvent(new Event("click"));
        }
      });
    }

    // Clicar fora fecha (apenas para tipos não críticos)
    if (type === "info" || type === "success") {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          this.close();
          onCancel?.();
        }
      });
    }
  }

  /**
   * Fechar diálogo atual
   */
  close(): void {
    if (!this.activeDialog) return;

    // Remover listener de ESC se existir
    if (this.escapeHandler) {
      document.removeEventListener("keydown", this.escapeHandler);
      this.escapeHandler = null;
    }

    // Remover classe active imediatamente
    this.activeDialog.classList.remove("active");

    // Remover do DOM após animação
    const dialogToRemove = this.activeDialog;
    this.activeDialog = null; // Limpar referência imediatamente

    setTimeout(() => {
      // Garantir remoção completa
      if (dialogToRemove && dialogToRemove.parentNode) {
        dialogToRemove.remove();
      }
    }, 300); // Tempo da animação
  }

  /**
   * Obter ícone padrão para tipo de diálogo
   */
  private getIconForType(type: DialogOptions["type"]): string {
    switch (type) {
      case "success":
        return "check_circle";
      case "warning":
        return "warning";
      case "error":
        return "error";
      case "confirm":
        return "help";
      case "prompt":
        return "edit";
      case "info":
      default:
        return "info";
    }
  }

  /**
   * Obter cor padrão para tipo de diálogo
   */
  private getColorForType(type: DialogOptions["type"]): string {
    switch (type) {
      case "success":
        return "var(--success)";
      case "warning":
        return "var(--warning)";
      case "error":
        return "var(--danger)";
      case "confirm":
        return "var(--primary)";
      case "prompt":
        return "var(--primary)";
      case "info":
      default:
        return "var(--info)";
    }
  }
}

// Exportar instância singleton
export const dialogService = DialogService.getInstance();
