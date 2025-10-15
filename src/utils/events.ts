// Sistema de eventos centralizado

import type { EventTypes, EventHandler, EventMap } from "@/types";

export class EventSystem {
  private static instance: EventSystem;
  private listeners = new Map<EventTypes, Set<EventHandler>>();

  static getInstance(): EventSystem {
    if (!EventSystem.instance) {
      EventSystem.instance = new EventSystem();
    }
    return EventSystem.instance;
  }

  on<T extends EventTypes>(event: T, handler: EventHandler<EventMap[T]>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off<T extends EventTypes>(
    event: T,
    handler: EventHandler<EventMap[T]>,
  ): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  emit<T extends EventTypes>(event: T, data: EventMap[T]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  clear(): void {
    this.listeners.clear();
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }
}
