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
  production: false,
  defaultTheme: 'umdzidzisi' as 'default' | 'umdzidzisi' | 'umtengesi',
  landingApp: 'umdzidzisi-admin',
  remotes: {
    'umdzidzisi-website': {
      url: 'http://localhost:4201/remoteEntry.json',
      auth: { mode: 'none' as const }, // Public website - no auth required
    },
    'umdzidzisi-admin': {
      url: 'http://localhost:4203/remoteEntry.json',
      auth: { mode: 'required' as const }, // Admin portal - immediate auth required
    },
    'umdzidzisi-client': {
      url: 'http://localhost:4205/remoteEntry.json',
      auth: { mode: 'optional' as const }, // E-commerce - browse freely, login for features
    },
    'umtengesi-website': {
      url: 'http://localhost:4202/remoteEntry.json',
      auth: { mode: 'none' as const }, // Public website - no auth required
    },
    'umtengesi-admin': {
      url: 'http://localhost:4204/remoteEntry.json',
      auth: { mode: 'required' as const }, // Admin portal - immediate auth required
    },
    'umtengesi-client': {
      url: 'http://localhost:4206/remoteEntry.json',
      auth: { mode: 'optional' as const }, // E-commerce - browse freely, login for features
    },
  },
};
