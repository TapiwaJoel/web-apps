import {
  Component,
  Input,
  ChangeDetectionStrategy,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TreeNavigationComponent } from '../tree-navigation/tree-navigation.component';
import {
  TreeNavNode,
  TreeNavConfig,
} from '../tree-navigation/tree-navigation.model';

@Component({
  selector: 'mushaviri-sidebar-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TreeNavigationComponent],
  templateUrl: './sidebar-layout.component.html',
  styleUrls: ['./sidebar-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarLayoutComponent {
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

  /** Signal for mobile menu open state */
  public readonly isMobileMenuOpen: WritableSignal<boolean> = signal(false);

  /** Id of the currently-active rail node (falls back to a node's own `active` flag) */
  public readonly activeRailId: WritableSignal<string | null> = signal<
    string | null
  >(null);

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
   * Whether a rail node is the active one. Route-backed rail nodes rely on
   * routerLinkActive in the template; this covers explicit `active`/click state.
   */
  public isRailActive(node: TreeNavNode): boolean {
    const id: string = node.id ?? node.label;
    if (this.activeRailId() !== null) {
      return this.activeRailId() === id;
    }
    return !!node.active;
  }

  /** Selects a rail node (and invokes its action, if any) */
  public selectRail(node: TreeNavNode): void {
    this.activeRailId.set(node.id ?? node.label);
    node.action?.();
  }

  /** trackBy for rail nodes */
  public trackRail(index: number, node: TreeNavNode): string | number {
    return node.id ?? node.label ?? index;
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
   * Toggles the mobile menu
   */
  public toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((value: boolean) => !value);
  }

  /**
   * Closes the mobile menu
   */
  public closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
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
