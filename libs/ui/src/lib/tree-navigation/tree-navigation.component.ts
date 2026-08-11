import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { TreeNodeComponent } from '../tree-node/tree-node.component';
import { TreeNavNode, TreeNavConfig } from './tree-navigation.model';

@Component({
  selector: 'org-tree-navigation',
  standalone: true,
  imports: [TreeNodeComponent],
  templateUrl: './tree-navigation.component.html',
  styleUrls: ['./tree-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeNavigationComponent {
  /** Array of root-level navigation nodes */
  @Input() public nodes: TreeNavNode[] = [];

  /** Configuration options */
  @Input() public config: TreeNavConfig = {
    showIcons: true,
    showBadges: true,
    collapsible: true,
    defaultExpanded: false,
    highlightActiveRoute: true,
  };

  /**
   * TrackBy function for ngFor performance
   */
  public trackByFn(index: number, item: TreeNavNode): string | number {
    return item.id || item.label || index;
  }
}
