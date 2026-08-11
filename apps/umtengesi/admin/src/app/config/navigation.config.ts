import { TreeNavNode } from '@mushaviri/ui-common';

/**
 * Navigation configuration for Umtengesi Admin application
 */
export const UMTENGESI_ADMIN_NAV_CONFIG: TreeNavNode[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '🏠',
    route: '/dashboard',
  },
  {
    id: 'products',
    label: 'Products',
    icon: '📦',
    iconBg: '#2196F3',
    iconColor: '#FFFFFF',
    route: '/products',
    children: [
      {
        id: 'all-products',
        label: 'All Products',
        route: '/products/all',
      },
      {
        id: 'categories',
        label: 'Categories',
        route: '/products/categories',
      },
      {
        id: 'inventory',
        label: 'Inventory',
        route: '/products/inventory',
      },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: '🛒',
    iconBg: '#FF9800',
    iconColor: '#FFFFFF',
    route: '/orders',
    children: [
      {
        id: 'all-orders',
        label: 'All Orders',
        route: '/orders/all',
      },
      {
        id: 'pending',
        label: 'Pending',
        route: '/orders/pending',
      },
      {
        id: 'completed',
        label: 'Completed',
        route: '/orders/completed',
      },
    ],
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: '👥',
    iconBg: '#9C27B0',
    iconColor: '#FFFFFF',
    route: '/customers',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: '📊',
    iconBg: '#009688',
    iconColor: '#FFFFFF',
    route: '/inventory',
    children: [
      {
        id: 'stock-levels',
        label: 'Stock Levels',
        route: '/inventory/stock-levels',
      },
      {
        id: 'suppliers',
        label: 'Suppliers',
        route: '/inventory/suppliers',
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: '📈',
    iconBg: '#4CAF50',
    iconColor: '#FFFFFF',
    route: '/analytics',
    children: [
      {
        id: 'sales',
        label: 'Sales',
        route: '/analytics/sales',
      },
      {
        id: 'performance',
        label: 'Performance',
        route: '/analytics/performance',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    iconBg: '#757575',
    iconColor: '#FFFFFF',
    route: '/settings',
  },
];

/**
 * User menu configuration (shown at bottom of sidebar)
 */
export const USER_MENU_CONFIG: TreeNavNode[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: '👤',
    route: '/profile',
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: '🎨',
    route: '/preferences',
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: '🚪',
    action: (): void => {
      // Logout action will be handled by component
      console.log('Logout clicked');
    },
  },
];
