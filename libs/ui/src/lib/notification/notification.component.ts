import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from '../services/notification.service';

@Component({
  selector: 'org-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  @Input() public notification!: Notification;
  @Output() public dismiss: EventEmitter<string> = new EventEmitter<string>();

  public onDismiss(): void {
    this.dismiss.emit(this.notification.id);
  }
}
