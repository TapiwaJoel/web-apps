import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TreeNavNode } from '../tree-navigation/tree-navigation.model';

@Component({
  selector: 'org-tree-node',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tree-node.component.html',
  styleUrls: ['./tree-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeNodeComponent {
  /** The tree node data */
  @Input() public node!: TreeNavNode;

  /** Current nesting level (for indentation) */
  @Input() public level: number = 0;

  /** Whether the node is expanded */
  @Input() public expanded: boolean = false;

  /** Whether to show icons */
  @Input() public showIcons: boolean = true;

  /** Whether to show badges */
  @Input() public showBadges: boolean = true;

  /** Whether the node can be collapsed/expanded */
  @Input() public collapsible: boolean = true;

  /** Emits when the expand/collapse state changes */
  @Output() public expandedChange: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  /** Emits when the action button is clicked */
  @Output() public actionClick: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Toggles the expanded state of the node
   */
  public toggleExpanded(): void {
    if (this.hasChildren && this.collapsible) {
      this.expanded = !this.expanded;
      this.expandedChange.emit(this.expanded);
    }
  }

  /**
   * Handles action button click
   */
  public onActionClick(event: Event): void {
    event.stopPropagation();
    this.actionClick.emit();
    if (this.node.action) {
      this.node.action();
    }
  }

  /**
   * Whether the node has children
   */
  public get hasChildren(): boolean {
    return !!this.node.children && this.node.children.length > 0;
  }

  /**
   * Calculates the indentation padding based on nesting level
   */
  public get indentationPadding(): string {
    return `${this.level * 1.25}rem`;
  }

  /**
   * Determines if a leading glyph should be shown.
   * Icons live on top-level items only; nested children are pure typography.
   * (A node with an explicit iconBg can still opt in at any level.)
   */
  public get shouldShowIcon(): boolean {
    return this.level === 0 || !!this.node.iconBg;
  }

  /**
   * Icon background colour, exposed as a host CSS custom property so the
   * template never needs a `style`/`[style.*]` binding (banned by
   * @angular-eslint/template/no-inline-styles). Consumed by
   * `.tree-node-icon-container` in the stylesheet.
   */
  @HostBinding('style.--tree-node-icon-bg')
  public get iconBgVar(): string | null {
    return this.node?.iconBg || null;
  }

  /**
   * Icon glyph colour (only meaningful when an iconBg is set — mirrors the
   * previous inline `[style.color]` logic). Consumed by `.tree-node-icon`.
   */
  @HostBinding('style.--tree-node-icon-color')
  public get iconColorVar(): string | null {
    return this.node?.iconBg ? this.node.iconColor || '#FFFFFF' : null;
  }

  /**
   * Whether this node is rendered as a quiet group header rather than a link.
   */
  public get isSection(): boolean {
    return this.node.variant === 'section';
  }

  /**
   * TrackBy function for ngFor performance
   */
  public trackByFn(index: number, item: TreeNavNode): string | number {
    return item.id || item.label || index;
  }
}
