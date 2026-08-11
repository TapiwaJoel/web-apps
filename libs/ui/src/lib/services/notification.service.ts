import { Injectable, signal, Signal } from '@angular/core';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSignal: ReturnType<typeof signal<Notification[]>> =
    signal<Notification[]>([]);
  public notifications: Signal<Notification[]> =
    this.notificationsSignal.asReadonly();

  public show(notification: Omit<Notification, 'id'>): void {
    const id: string = this.generateId();
    const newNotification: Notification = { id, ...notification };

    const currentNotifications: Notification[] = this.notificationsSignal();
    this.notificationsSignal.set([...currentNotifications, newNotification]);

    if (notification.duration) {
      setTimeout((): void => {
        this.dismiss(id);
      }, notification.duration);
    }
  }

  public dismiss(id: string): void {
    this.notificationsSignal.update((notifications: Notification[]) =>
      notifications.filter(
        (notification: Notification) => notification.id !== id,
      ),
    );
  }

  public clear(): void {
    this.notificationsSignal.set([]);
  }

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
