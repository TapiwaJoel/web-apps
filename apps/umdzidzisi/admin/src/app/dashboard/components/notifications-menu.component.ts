import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { AppNotification } from './notification.model';

/**
 * Header notifications dropdown: a bell trigger with an unread count pill and a
 * CDK connected-overlay panel listing dummy notifications. Read/unread state is
 * in-memory only (no backend). Mirrors the rail-flyout panel language.
 */
@Component({
  selector: 'org-notifications-menu',
  standalone: true,
  imports: [OverlayModule],
  templateUrl: './notifications-menu.component.html',
  styleUrls: ['./notifications-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsMenuComponent {
  /** Whether the overlay panel is open. */
  protected readonly isOpen: WritableSignal<boolean> = signal(false);

  /** Dummy notification feed (newest first). */
  protected readonly notifications: WritableSignal<AppNotification[]> = signal<
    AppNotification[]
  >([
    {
      id: 'n1',
      icon: 'fi fi-rr-graduation-cap',
      title: 'New examination board added',
      body: 'Cambridge International AS is now available.',
      time: '2m',
      read: false,
    },
    {
      id: 'n2',
      icon: 'fi fi-rr-credit-card',
      title: 'Subscription expiring soon',
      body: '12 learner subscriptions expire in 3 days.',
      time: '1h',
      read: false,
    },
    {
      id: 'n3',
      icon: 'fi fi-rr-document',
      title: '3 papers pending review',
      body: 'Awaiting your approval before publishing.',
      time: '5h',
      read: false,
    },
    {
      id: 'n4',
      icon: 'fi fi-rr-trophy',
      title: 'Learner milestone reached',
      body: '12,480 active learners this term.',
      time: '1d',
      read: true,
    },
    {
      id: 'n5',
      icon: 'fi fi-rr-settings',
      title: 'System update installed',
      body: 'Reporting improvements are now live.',
      time: '2d',
      read: true,
    },
  ]);

  /** Count of unread notifications, capped display handled in the template. */
  protected readonly unreadCount: Signal<number> = computed(
    () => this.notifications().filter((n: AppNotification) => !n.read).length,
  );

  /** True when nothing is left unread — drives the empty state. */
  protected readonly allRead: Signal<boolean> = computed(
    () => this.unreadCount() === 0,
  );

  protected toggle(): void {
    this.isOpen.update((open: boolean) => !open);
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  /** Marks a single notification read (on row click). */
  protected markRead(id: string): void {
    this.notifications.update((list: AppNotification[]) =>
      list.map((n: AppNotification) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  /** Marks every notification read. */
  protected markAllRead(): void {
    this.notifications.update((list: AppNotification[]) =>
      list.map((n: AppNotification) => ({ ...n, read: true })),
    );
  }

  protected trackById(_index: number, item: AppNotification): string {
    return item.id;
  }
}
