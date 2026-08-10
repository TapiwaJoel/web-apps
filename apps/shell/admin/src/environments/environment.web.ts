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
  defaultTheme: 'admin' as 'default' | 'admin' | 'umdzidzisi' | 'umtengesi',
  remotes: {
    'umdzidzisi-website': {
      url: 'http://localhost:4201/remoteEntry.json',
      auth: { mode: 'none' as const }, // Public website - no auth required
    },
    'umtengesi-website': {
      url: 'http://localhost:4202/remoteEntry.json',
      auth: { mode: 'none' as const }, // Public website - no auth required
    },
  },
};
