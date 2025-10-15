// Sistema de notificações

export type NotificationType = "success" | "error" | "warning" | "info";

export interface NotificationOptions {
  duration?: number;
  closable?: boolean;
  persistent?: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  options: NotificationOptions;
}

export class NotificationService {
  private static instance: NotificationService;
  private container: HTMLElement | null = null;
  private notifications: Map<string, Notification> = new Map();
  private idCounter = 0;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Encontrar ou criar container de notificações
    this.container = document.getElementById("notifications");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "notifications";
      this.container.className = "notifications-container";
      document.body.appendChild(this.container);
    }
  }

  static show(
    message: string,
    type: NotificationType = "info",
    options: NotificationOptions = {}
  ): string {
    return NotificationService.getInstance().show(message, type, options);
  }

  show(
    message: string,
    type: NotificationType = "info",
    options: NotificationOptions = {}
  ): string {
    const id = `notification-${++this.idCounter}`;
    const defaultOptions: NotificationOptions = {
      duration: type === "error" ? 5000 : 3000,
      closable: true,
      persistent: false,
      ...options,
    };

    const notification: Notification = {
      id,
      message,
      type,
      timestamp: new Date(),
      options: defaultOptions,
    };

    this.notifications.set(id, notification);
    this.renderNotification(notification);

    // Auto-remove se não for persistente
    if (!defaultOptions.persistent && defaultOptions.duration) {
      setTimeout(() => {
        this.remove(id);
      }, defaultOptions.duration);
    }

    return id;
  }

  private renderNotification(notification: Notification): void {
    if (!this.container) return;

    const element = document.createElement("div");
    element.id = notification.id;
    element.className = `notification notification-${notification.type}`;

    element.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          ${this.getIcon(notification.type)}
        </div>
        <div class="notification-message">
          ${this.escapeHtml(notification.message)}
        </div>
        ${
          notification.options.closable
            ? `
          <button class="notification-close" title="Fechar">
            <span class="material-icons md-18">close</span>
          </button>
        `
            : ""
        }
      </div>
    `;

    // Adicionar event listeners
    if (notification.options.closable) {
      const closeBtn = element.querySelector(".notification-close");
      closeBtn?.addEventListener("click", () => {
        this.remove(notification.id);
      });
    }

    // Adicionar ao container
    this.container.appendChild(element);

    // Animar entrada
    requestAnimationFrame(() => {
      element.classList.add("notification-enter");
    });
  }

  remove(id: string): void {
    const notification = this.notifications.get(id);
    if (!notification) return;

    const element = document.getElementById(id);
    if (element) {
      element.classList.add("notification-exit");

      setTimeout(() => {
        element.remove();
        this.notifications.delete(id);
      }, 300);
    } else {
      this.notifications.delete(id);
    }
  }

  clear(): void {
    Array.from(this.notifications.keys()).forEach((id) => {
      this.remove(id);
    });
  }

  success(message: string, options?: NotificationOptions): string {
    return this.show(message, "success", options);
  }

  error(message: string, options?: NotificationOptions): string {
    return this.show(message, "error", { persistent: true, ...options });
  }

  warning(message: string, options?: NotificationOptions): string {
    return this.show(message, "warning", options);
  }

  info(message: string, options?: NotificationOptions): string {
    return this.show(message, "info", options);
  }

  private getIcon(type: NotificationType): string {
    const icons = {
      success: '<span class="material-icons md-20">check_circle</span>',
      error: '<span class="material-icons md-20">error</span>',
      warning: '<span class="material-icons md-20">warning</span>',
      info: '<span class="material-icons md-20">info</span>',
    };
    return icons[type] || icons.info;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Métodos estáticos para conveniência
  static success(message: string, options?: NotificationOptions): string {
    return NotificationService.getInstance().success(message, options);
  }

  static error(message: string, options?: NotificationOptions): string {
    return NotificationService.getInstance().error(message, options);
  }

  static warning(message: string, options?: NotificationOptions): string {
    return NotificationService.getInstance().warning(message, options);
  }

  static info(message: string, options?: NotificationOptions): string {
    return NotificationService.getInstance().info(message, options);
  }

  static clear(): void {
    NotificationService.getInstance().clear();
  }
}
