import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeNodeComponent } from '../tree-node/tree-node.component';
import { TreeNavNode, TreeNavConfig } from './tree-navigation.model';

@Component({
  selector: 'mushaviri-tree-navigation',
  standalone: true,
  imports: [CommonModule, TreeNodeComponent],
  templateUrl: './tree-navigation.component.html',
  styleUrls: ['./tree-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeNavigationComponent {
  /** Array of root-level navigation nodes */
  @Input() nodes: TreeNavNode[] = [];

  /** Configuration options */
  @Input() config: TreeNavConfig = {
    showIcons: true,
    showBadges: true,
    collapsible: true,
    defaultExpanded: false,
    highlightActiveRoute: true,
  };

  /**
   * TrackBy function for ngFor performance
   */
  trackByFn(index: number, item: TreeNavNode): string | number {
    return item.id || item.label || index;
  }
}
