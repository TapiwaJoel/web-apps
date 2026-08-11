/**
 * Represents a node in the tree navigation structure
 */
export interface TreeNavNode {
  /** Display label for the navigation item */
  label: string;

  /** Icon name or path (can be heroicon name, emoji, or custom icon) */
  icon?: string;

  /** Background color for icon container (hex color) */
  iconBg?: string;

  /** Icon color (hex color) */
  iconColor?: string;

  /** Router link path */
  route?: string;

  /** Child nodes for nested navigation */
  children?: TreeNavNode[];

  /** Badge content (number or text) to display next to the label */
  badge?: number | string;

  /** Initial expanded state for nodes with children */
  expanded?: boolean;

  /** Callback function for action buttons (e.g., "+" button) */
  action?: () => void;

  /** Additional CSS classes to apply to the node */
  cssClass?: string;

  /** Whether this node is disabled */
  disabled?: boolean;

  /** Unique identifier for the node */
  id?: string;

  /**
   * Visual treatment for the row.
   * - 'item' (default): a normal navigation item.
   * - 'section': a quiet group header (used for top-level parents that group children).
   */
  variant?: 'item' | 'section';

  /**
   * Marks the node as active without relying on the router.
   * Route-backed nodes should keep using routerLinkActive; this is for rail icons
   * and other emphasis that isn't tied to an exact route match.
   */
  active?: boolean;
}

/**
 * Configuration options for the tree navigation component
 */
export interface TreeNavConfig {
  /** Whether to show icons */
  showIcons?: boolean;

  /** Whether to show badges */
  showBadges?: boolean;

  /** Whether to allow collapsing/expanding nodes */
  collapsible?: boolean;

  /** Default expanded state for all nodes */
  defaultExpanded?: boolean;

  /** Maximum nesting depth to display */
  maxDepth?: number;

  /** Whether to highlight the active route */
  highlightActiveRoute?: boolean;
}
