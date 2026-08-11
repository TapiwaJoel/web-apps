import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TreeNavNode } from '../tree-navigation/tree-navigation.model';

@Component({
  selector: 'org-rail-flyout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rail-flyout.component.html',
  styleUrls: ['./rail-flyout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RailFlyoutComponent {
  /** The nav node whose label (and optional submenu) this flyout represents */
  @Input() public node!: TreeNavNode;

  /** Emits when a submenu link is followed, so the host can dismiss the flyout */
  @Output() public navigate: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Whether the node has children (i.e. renders a submenu rather than a
   * label-only tooltip).
   */
  public get hasChildren(): boolean {
    return !!this.node?.children && this.node.children.length > 0;
  }

  /**
   * Emits the navigate event after a child link is clicked
   */
  public onNavigate(): void {
    this.navigate.emit();
  }

  /**
   * TrackBy function for ngFor performance
   */
  public trackByFn(index: number, child: TreeNavNode): string | number {
    return child.id ?? child.label ?? index;
  }
}
