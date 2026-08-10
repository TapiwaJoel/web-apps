interface RemoteConfig {
  url: string;
  auth: { mode: 'none' | 'optional' | 'required' };
}

interface Environment {
  production: boolean;
  defaultTheme: 'default' | 'admin' | 'umdzidzisi' | 'umtengesi';
  landingApp?: string;
  remotes: Record<string, RemoteConfig>;
}

export const environment: Environment = {
  production: true,
  defaultTheme: 'admin' as 'default' | 'admin' | 'umdzidzisi' | 'umtengesi',
  remotes: {
    'umdzidzisi-website': {
      url: './umdzidzisi-website/remoteEntry.json',
      auth: { mode: 'none' as const }, // Public website - no auth required
    },
    'umdzidzisi-admin': {
      url: './umdzidzisi-admin/remoteEntry.json',
      auth: { mode: 'required' as const }, // Admin portal - immediate auth required
    },
    'umdzidzisi-client': {
      url: './umdzidzisi-client/remoteEntry.json',
      auth: { mode: 'optional' as const }, // E-commerce - browse freely, login for features
    },
    'umtengesi-website': {
      url: './umtengesi-website/remoteEntry.json',
      auth: { mode: 'none' as const }, // Public website - no auth required
    },
    'umtengesi-admin': {
      url: './umtengesi-admin/remoteEntry.json',
      auth: { mode: 'required' as const }, // Admin portal - immediate auth required
    },
    'umtengesi-client': {
      url: './umtengesi-client/remoteEntry.json',
      auth: { mode: 'optional' as const }, // E-commerce - browse freely, login for features
    },
  },
};
