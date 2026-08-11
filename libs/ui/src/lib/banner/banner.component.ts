import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Banner } from '../services/banner.service';

@Component({
  selector: 'org-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerComponent {
  @Input() public banner!: Banner;
  @Output() public dismiss: EventEmitter<string> = new EventEmitter<string>();

  public onDismiss(): void {
    this.dismiss.emit(this.banner.id);
  }

  public onActionClick(handler: () => void): void {
    handler();
  }
}
