import {
  Component,
  inject,
  ChangeDetectionStrategy,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NotificationService,
  Notification,
} from '../services/notification.service';
import { NotificationComponent } from './notification.component';

@Component({
  selector: 'org-notification-container',
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  templateUrl: './notification-container.component.html',
  styleUrl: './notification-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationContainerComponent {
  private notificationService: NotificationService =
    inject(NotificationService);
  public notifications: Signal<Notification[]> =
    this.notificationService.notifications;

  public get notificationsList(): Notification[] {
    return this.notifications();
  }

  public onDismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}
