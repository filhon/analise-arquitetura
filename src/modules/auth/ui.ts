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
  private loadingElement!: HTMLElement;

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
    this.loadingElement = document.getElementById("login-loading")!;

    if (
      !this.loginScreen ||
      !this.loginForm ||
      !this.emailInput ||
      !this.passwordInput
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

    // Mostrar loading
    this.setLoading(true);

    try {
      const result = await this.authManager.login(credentials);

      if (result.success) {
        NotificationService.show("Login realizado com sucesso!", "success");
        this.hideLoginScreen();
      } else {
        NotificationService.show(result.error || "Erro no login", "error");
        this.passwordInput.focus();
      }
    } catch (error) {
      console.error("Erro no login:", error);
      NotificationService.show("Erro interno no sistema", "error");
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
      this.loadingElement.style.display = "flex";
    } else {
      this.submitButton.innerHTML = `
        <span class="material-icons md-20">login</span>
        Entrar
      `;
      this.loadingElement.style.display = "none";
    }
  }

  showLoginScreen(): void {
    this.loginScreen.style.display = "flex";
    this.emailInput.focus();

    // Reset form
    this.loginForm.reset();
    this.setLoading(false);
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
}
