import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

@Component({
  selector: 'org-user-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenuComponent {
  @Input() public user: User | null = null;
  @Output() public logout: EventEmitter<void> = new EventEmitter<void>();
  @Output() public viewDevices: EventEmitter<void> = new EventEmitter<void>();

  public isMenuOpen: boolean = false;

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  public closeMenu(): void {
    this.isMenuOpen = false;
  }

  public onLogout(): void {
    this.logout.emit();
    this.closeMenu();
  }

  public onViewDevices(): void {
    this.viewDevices.emit();
    this.closeMenu();
  }

  public get userInitials(): string {
    if (!this.user) return '';
    return this.user.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
