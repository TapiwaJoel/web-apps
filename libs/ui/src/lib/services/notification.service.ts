import { Injectable, signal, Signal } from '@angular/core';

const DEFAULT_DURATION_MS: number = 5000;

const DEFAULT_TITLES: Record<Notification['type'], string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Information',
};

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  /** Auto-dismiss delay in ms. Defaults to 5000; ignored when `sticky` is true. */
  duration?: number;
  /** When true, the notification stays until the user dismisses it manually. */
  sticky?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSignal: ReturnType<typeof signal<Notification[]>> =
    signal<Notification[]>([]);
  public notifications: Signal<Notification[]> =
    this.notificationsSignal.asReadonly();

  public show(
    notification: Omit<Notification, 'id' | 'title'> & { title?: string },
  ): void {
    const id: string = this.generateId();
    const sticky: boolean = notification.sticky ?? false;
    const duration: number = sticky
      ? 0
      : (notification.duration ?? DEFAULT_DURATION_MS);
    const title: string =
      notification.title ?? DEFAULT_TITLES[notification.type];
    const newNotification: Notification = {
      id,
      ...notification,
      title,
      sticky,
      duration,
    };

    const currentNotifications: Notification[] = this.notificationsSignal();
    this.notificationsSignal.set([...currentNotifications, newNotification]);

    if (!sticky && duration) {
      setTimeout((): void => {
        this.dismiss(id);
      }, duration);
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
