import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../user-menu/user-menu.component';

@Component({
  selector: 'org-shell-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shell-layout.component.html',
  styleUrls: ['./shell-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellLayoutComponent {
  @Input() public user: User | null = null;
  @Input() public theme: string = 'light';
  @Input() public showHeader: boolean = true;
  @Input() public showFooter: boolean = true;

  public currentYear: number = new Date().getFullYear();
}
