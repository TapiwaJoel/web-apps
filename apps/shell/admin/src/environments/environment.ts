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
    'umdzidzisi-admin': {
      url: 'http://localhost:4203/remoteEntry.json',
      auth: { mode: 'required' as const }, // Admin portal - immediate auth required
    },
    'umtengesi-admin': {
      url: 'http://localhost:4204/remoteEntry.json',
      auth: { mode: 'required' as const }, // Admin portal - immediate auth required
    },
  },
};
