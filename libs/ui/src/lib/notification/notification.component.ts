import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  ViewChild,
  ChangeDetectionStrategy,
  inject,
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
export class NotificationComponent implements AfterViewInit {
  @Input() public notification!: Notification;
  @Output() public dismiss: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('progressBar') public progressBar?: ElementRef<HTMLElement>;

  private readonly renderer: Renderer2 = inject(Renderer2);

  public ngAfterViewInit(): void {
    if (this.progressBar && this.notification.duration) {
      this.renderer.setStyle(
        this.progressBar.nativeElement,
        'animation-duration',
        `${this.notification.duration}ms`,
      );
    }
  }

  public onDismiss(): void {
    this.dismiss.emit(this.notification.id);
  }
}
