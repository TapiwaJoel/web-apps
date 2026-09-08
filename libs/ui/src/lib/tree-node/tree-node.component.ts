import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostBinding,
  OnDestroy,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OverlayModule, ConnectedPosition } from '@angular/cdk/overlay';
import { TreeNavNode } from '../tree-navigation/tree-navigation.model';
import { RailFlyoutComponent } from '../rail-flyout/rail-flyout.component';

@Component({
  selector: 'org-tree-node',
  standalone: true,
  imports: [CommonModule, RouterModule, OverlayModule, RailFlyoutComponent],
  templateUrl: './tree-node.component.html',
  styleUrls: ['./tree-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeNodeComponent implements OnDestroy {
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

  /** Whether the parent sidebar is collapsed to its icon-only width */
  @Input() public isCollapsed: boolean = false;

  /** Emits when the expand/collapse state changes */
  @Output() public expandedChange: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  /** Emits when the action button is clicked */
  @Output() public actionClick: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Whether this node's hover flyout is currently open. Only meaningful at
   * level 0 while the sidebar is collapsed — mirrors SidebarLayoutComponent's
   * rail flyout, but kept local since each tree node is a self-contained
   * recursive component instance rather than a flat list the parent already
   * iterates directly.
   */
  private readonly hoveredFlyout: WritableSignal<boolean> = signal(false);

  /** Pending close timer, so moving into the flyout can cancel the dismissal. */
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  /** Grace period (ms) before a flyout closes, letting the pointer cross the gap. */
  private static readonly FLYOUT_CLOSE_DELAY_MS: number = 150;

  /**
   * Overlay positions for the flyout: anchored to the right of the icon,
   * top-aligned, with a bottom-aligned fallback so it shifts up when there is
   * no room below. Mirrors SidebarLayoutComponent's rail flyout positioning.
   */
  public readonly flyoutPositions: ConnectedPosition[] = [
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top',
      offsetX: 8,
    },
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetX: 8,
    },
  ];

  /**
   * Whether the hover flyout should render for this node. Only top-level,
   * non-section nodes get a flyout, and only while the sidebar is collapsed
   * — expanded, the tree panel already shows labels (and submenus inline).
   */
  public get showFlyout(): boolean {
    return (
      this.isCollapsed &&
      this.level === 0 &&
      !this.isSection &&
      this.hoveredFlyout()
    );
  }

  /**
   * Whether this node should render nothing at all while the sidebar is
   * collapsed. Only applies to section-header rows with no icon of their own
   * (e.g. insurance-admin's "Main Menu"/"Admin & Data") — at icon-rail width
   * their label has nothing to render but clipped text ("M.", "A.."), so they
   * are hidden entirely rather than shown broken. Section nodes that DO carry
   * an icon (e.g. umdzidzisi-admin's expandable "Examinations"/"Subjects"
   * groups) are real navigation, not dead labels, and stay visible.
   */
  public get hideWhenCollapsed(): boolean {
    return this.isCollapsed && this.isSection && !this.node.icon;
  }

  /** Opens the flyout (on hover or keyboard focus). */
  public openFlyout(): void {
    this.cancelClose();
    this.hoveredFlyout.set(true);
  }

  /** Schedules the flyout to close after a short grace delay. */
  public scheduleClose(): void {
    this.cancelClose();
    this.closeTimer = setTimeout((): void => {
      this.hoveredFlyout.set(false);
      this.closeTimer = null;
    }, TreeNodeComponent.FLYOUT_CLOSE_DELAY_MS);
  }

  /** Cancels a pending flyout close (e.g. the pointer moved into the flyout). */
  public cancelClose(): void {
    if (this.closeTimer !== null) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  /** Closes the flyout immediately (e.g. after following a submenu link). */
  public closeFlyout(): void {
    this.cancelClose();
    this.hoveredFlyout.set(false);
  }

  public ngOnDestroy(): void {
    this.cancelClose();
  }

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
