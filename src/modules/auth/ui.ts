// Componente UI para tela de login

import { AuthManager } from "@/modules/auth/manager";
import { LoginCredentials } from "@/types/auth";
import { NotificationService } from "@/ui/notifications";

export class LoginUI {
  private authManager: AuthManager;
  private loginScreen!: HTMLElement;
  private loginForm!: HTMLFormElement;
  private emailInput!: HTMLInputElement;
  private passwordInput!: HTMLInputElement;
  private submitButton!: HTMLButtonElement;
  private togglePasswordButton!: HTMLButtonElement;
  private errorMessageElement!: HTMLElement;
  private errorTitleElement!: HTMLElement;
  private errorDescriptionElement!: HTMLElement;

  constructor() {
    this.authManager = AuthManager.getInstance();
    this.initializeElements();
    this.setupEventListeners();
  }

  private initializeElements(): void {
    this.loginScreen = document.getElementById("login-screen")!;
    this.loginForm = document.getElementById("login-form") as HTMLFormElement;
    this.emailInput = document.getElementById(
      "login-email"
    ) as HTMLInputElement;
    this.passwordInput = document.getElementById(
      "login-password"
    ) as HTMLInputElement;
    this.submitButton = this.loginForm.querySelector(
      ".btn-login"
    ) as HTMLButtonElement;
    this.togglePasswordButton = document.getElementById(
      "toggle-password"
    ) as HTMLButtonElement;
    this.errorMessageElement = document.getElementById("login-error-message")!;
    this.errorTitleElement = document.getElementById("error-title")!;
    this.errorDescriptionElement =
      document.getElementById("error-description")!;

    if (
      !this.loginScreen ||
      !this.loginForm ||
      !this.emailInput ||
      !this.passwordInput ||
      !this.errorMessageElement ||
      !this.errorTitleElement ||
      !this.errorDescriptionElement
    ) {
      throw new Error("Elementos da tela de login não encontrados");
    }
  }

  private setupEventListeners(): void {
    // Form submit
    this.loginForm.addEventListener("submit", this.handleLogin.bind(this));

    // Toggle password visibility
    this.togglePasswordButton.addEventListener(
      "click",
      this.togglePasswordVisibility.bind(this)
    );

    // Enter key no campo de senha
    this.passwordInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.loginForm.requestSubmit();
      }
    });

    // Validação em tempo real
    this.emailInput.addEventListener("input", this.validateEmail.bind(this));
    this.passwordInput.addEventListener(
      "input",
      this.validatePassword.bind(this)
    );
  }

  private async handleLogin(event: Event): Promise<void> {
    event.preventDefault();

    const credentials: LoginCredentials = {
      email: this.emailInput.value.trim(),
      password: this.passwordInput.value,
    };

    // Validação básica
    if (!this.validateEmail() || !this.validatePassword()) {
      return;
    }

    // Limpar mensagens de erro anteriores
    this.clearErrorMessage();

    // Mostrar loading
    this.setLoading(true);

    try {
      const result = await this.authManager.login(credentials);

      if (result.success) {
        NotificationService.show("Login realizado com sucesso!", "success");
        this.hideLoginScreen();
      } else {
        // Exibir erro específico baseado no tipo
        this.showErrorMessage(result.error || "Erro no login");
        this.passwordInput.focus();
      }
    } catch (error) {
      console.error("Erro no login:", error);
      this.showErrorMessage("Erro interno no sistema");
    } finally {
      this.setLoading(false);
    }
  }

  private togglePasswordVisibility(): void {
    const isVisible = this.passwordInput.type === "text";
    this.passwordInput.type = isVisible ? "password" : "text";

    const icon = this.togglePasswordButton.querySelector(".material-icons")!;
    icon.textContent = isVisible ? "visibility" : "visibility_off";
  }

  private validateEmail(): boolean {
    const email = this.emailInput.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    this.emailInput.classList.toggle("invalid", !isValid && email.length > 0);
    return isValid;
  }

  private validatePassword(): boolean {
    const password = this.passwordInput.value;
    const isValid = password.length >= 6;

    this.passwordInput.classList.toggle(
      "invalid",
      !isValid && password.length > 0
    );
    return isValid;
  }

  private setLoading(loading: boolean): void {
    this.submitButton.disabled = loading;
    this.emailInput.disabled = loading;
    this.passwordInput.disabled = loading;

    if (loading) {
      this.submitButton.innerHTML = `
        <div class="loading-spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
        Entrando...
      `;
    } else {
      this.submitButton.innerHTML = `
        <span class="material-icons md-20">login</span>
        Entrar
      `;
    }
  }

  showLoginScreen(): void {
    this.loginScreen.style.display = "flex";
    this.emailInput.focus();

    // Reset form
    this.loginForm.reset();
    this.setLoading(false);
    this.clearErrorMessage();
    this.emailInput.classList.remove("invalid");
    this.passwordInput.classList.remove("invalid");
  }

  hideLoginScreen(): void {
    this.loginScreen.style.display = "none";
  }

  // Método para verificar se deve mostrar tela de login
  shouldShowLogin(): boolean {
    const authState = this.authManager.getState();
    return !authState.isAuthenticated;
  }

  // Método para limpar mensagens de erro
  private clearErrorMessage(): void {
    this.errorMessageElement.style.display = "none";
    this.errorMessageElement.className = "login-error-message";
  }

  // Mapeamento de erros (consolidado)
  private readonly ERROR_INFO: Record<
    string,
    { title: string; description: string; focusField?: "email" | "password" }
  > = {
    "user-not-found": {
      title: "Email não encontrado",
      description:
        "Este email não está cadastrado no sistema. Verifique se digitou corretamente ou entre em contato com o administrador.",
      focusField: "email",
    },
    "wrong-password": {
      title: "Senha incorreta",
      description:
        "A senha digitada está incorreta. Tente novamente ou clique em 'Esqueci minha senha' se necessário.",
      focusField: "password",
    },
    "invalid-email": {
      title: "Email inválido",
      description:
        "O formato do email digitado é inválido. Digite um email válido no formato nome@dominio.com.",
      focusField: "email",
    },
    "disabled-account": {
      title: "Conta desabilitada",
      description:
        "Esta conta foi desabilitada pelo administrador. Entre em contato com o administrador do sistema.",
    },
    "too-many-requests": {
      title: "Muitas tentativas",
      description:
        "Detectamos muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.",
    },
    "network-error": {
      title: "Erro de conexão",
      description:
        "Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.",
    },
    "generic-error": {
      title: "Erro no login",
      description:
        "Ocorreu um erro inesperado. Tente novamente em alguns instantes ou entre em contato com o administrador.",
    },
  };

  // Método para exibir mensagem de erro específica
  private showErrorMessage(errorMessage: string): void {
    const errorType = this.categorizeError(errorMessage);
    const errorInfo =
      this.ERROR_INFO[errorType] || this.ERROR_INFO["generic-error"];

    // Atualizar conteúdo
    this.errorTitleElement.textContent = errorInfo.title;
    this.errorDescriptionElement.textContent = errorInfo.description;

    // Atualizar classes CSS para styling específico
    this.errorMessageElement.className = `login-error-message ${errorType}`;
    this.errorMessageElement.style.display = "block";

    // Focar no campo apropriado baseado no tipo de erro
    if (errorInfo.focusField === "email") {
      this.emailInput.focus();
    } else if (errorInfo.focusField === "password") {
      this.passwordInput.focus();
    }
  }

  // Método para categorizar o tipo de erro baseado na mensagem
  private categorizeError(errorMessage: string): string {
    const errorPatterns: Record<string, RegExp> = {
      "user-not-found": /não está cadastrado|user-not-found/i,
      "wrong-password": /senha está incorreta|wrong-password/i,
      "invalid-email": /formato do email é inválido|invalid-email/i,
      "disabled-account": /conta foi desabilitada|user-disabled/i,
      "too-many-requests": /muitas tentativas|too-many-requests/i,
      "network-error": /conexão|network/i,
    };

    for (const [errorType, pattern] of Object.entries(errorPatterns)) {
      if (pattern.test(errorMessage)) {
        return errorType;
      }
    }

    return "generic-error";
  }
}
