import {
  Component,
  Input,
  ChangeDetectionStrategy,
  signal,
  WritableSignal,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OverlayModule, ConnectedPosition } from '@angular/cdk/overlay';
import { TreeNavigationComponent } from '../tree-navigation/tree-navigation.component';
import { RailFlyoutComponent } from '../rail-flyout/rail-flyout.component';
import {
  TreeNavNode,
  TreeNavConfig,
} from '../tree-navigation/tree-navigation.model';

@Component({
  selector: 'mushaviri-sidebar-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OverlayModule,
    TreeNavigationComponent,
    RailFlyoutComponent,
  ],
  templateUrl: './sidebar-layout.component.html',
  styleUrls: ['./sidebar-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarLayoutComponent implements OnDestroy {
  /** Navigation nodes to display in the sidebar */
  @Input() public navigationNodes: TreeNavNode[] = [];

  /**
   * Icon-rail nodes (the thin left column of circular icon buttons).
   * When omitted, no rail renders and the sidebar is a single tree panel.
   */
  @Input() public railNodes?: TreeNavNode[];

  /**
   * Rail nodes pinned to the bottom of the rail (e.g. logout).
   * Rendered below a spacer so they sit at the foot of the column.
   */
  @Input() public railFooterNodes?: TreeNavNode[];

  /** Tree navigation configuration */
  @Input() public navigationConfig?: TreeNavConfig;

  /** Logo or brand name to display at the top */
  @Input() public brandName?: string;

  /** Logo image URL */
  @Input() public logoUrl?: string;

  /** Whether the sidebar is collapsed */
  @Input() public set collapsed(value: boolean) {
    this.isCollapsed.set(value);
  }

  /** Whether the sidebar is collapsible */
  @Input() public collapsible: boolean = true;

  /** Width of the sidebar when expanded (in rem or px) */
  @Input() public sidebarWidth: string = '16rem';

  /** Width of the sidebar when collapsed (in rem or px) */
  @Input() public sidebarCollapsedWidth: string = '4rem';

  /** Signal for collapsed state */
  public readonly isCollapsed: WritableSignal<boolean> = signal(false);

  /**
   * Id of the rail node whose hover flyout is currently open. Only meaningful
   * while the sidebar is collapsed to the icon rail.
   */
  public readonly hoveredRailId: WritableSignal<string | null> = signal<
    string | null
  >(null);

  /** Pending close timer, so moving into the flyout can cancel the dismissal. */
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  /** Grace period (ms) before a flyout closes, letting the pointer cross the gap. */
  private static readonly FLYOUT_CLOSE_DELAY_MS: number = 150;

  /**
   * Overlay positions for the rail flyout: anchored to the right of the icon,
   * top-aligned, with a bottom-aligned fallback so it shifts up when there is
   * no room below (e.g. rail icons near the viewport bottom).
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

  /** Whether a rail should render */
  public get hasRail(): boolean {
    return !!this.railNodes && this.railNodes.length > 0;
  }

  /**
   * True when collapsing should hide the tree panel outright, leaving only the
   * icon rail. Only valid when a rail exists — otherwise there is nothing to
   * fall back to, so a rail-less sidebar keeps its tree even when collapsed.
   */
  public get railOnlyCollapsed(): boolean {
    return this.hasRail && this.isCollapsed();
  }

  /**
   * Invokes a rail node's action, if any. The active highlight is driven purely
   * by routerLinkActive in the template (route-backed rail nodes), so this only
   * needs to fire side effects like logout for action-only nodes.
   */
  public selectRail(node: TreeNavNode): void {
    node.action?.();
  }

  /** trackBy for rail nodes */
  public trackRail(index: number, node: TreeNavNode): string | number {
    return node.id ?? node.label ?? index;
  }

  /** Stable key for a rail node (id, falling back to its label). */
  public railNodeId(node: TreeNavNode): string {
    return node.id ?? node.label;
  }

  /**
   * Whether the hover flyout should be shown for a given rail node. Flyouts only
   * apply while collapsed — expanded, the tree panel already shows submenus.
   */
  public flyoutOpenFor(node: TreeNavNode): boolean {
    return this.isCollapsed() && this.hoveredRailId() === this.railNodeId(node);
  }

  /** Opens the flyout for a rail node (on hover or keyboard focus). */
  public openFlyout(node: TreeNavNode): void {
    this.cancelClose();
    this.hoveredRailId.set(this.railNodeId(node));
  }

  /** Schedules the flyout to close after a short grace delay. */
  public scheduleClose(): void {
    this.cancelClose();
    this.closeTimer = setTimeout((): void => {
      this.hoveredRailId.set(null);
      this.closeTimer = null;
    }, SidebarLayoutComponent.FLYOUT_CLOSE_DELAY_MS);
  }

  /** Cancels a pending flyout close (e.g. the pointer moved into the panel). */
  public cancelClose(): void {
    if (this.closeTimer !== null) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }

  /** Closes the flyout immediately (e.g. after following a submenu link or Escape). */
  public closeFlyout(): void {
    this.cancelClose();
    this.hoveredRailId.set(null);
  }

  public ngOnDestroy(): void {
    this.cancelClose();
  }

  /**
   * Toggles the sidebar collapsed state
   */
  public toggleSidebar(): void {
    if (this.collapsible) {
      this.isCollapsed.update((value: boolean) => !value);
    }
  }

  /**
   * Gets the current tree-panel width based on collapsed state.
   * With a rail present, collapsing hides the tree panel entirely (width 0) so
   * only the icon rail remains. Without a rail, the tree panel is the only
   * column, so it keeps its normal width.
   */
  public get currentSidebarWidth(): string {
    if (this.railOnlyCollapsed) {
      return '0';
    }
    return this.isCollapsed() ? this.sidebarCollapsedWidth : this.sidebarWidth;
  }
}
