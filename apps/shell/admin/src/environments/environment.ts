interface RemoteConfig {
  url: string;
  auth: { mode: 'none' | 'optional' | 'required' };
}

interface Environment {
  production: boolean;
  apiBaseUrl: string;
  defaultTheme: 'default' | 'admin' | 'umdzidzisi' | 'umtengesi' | 'insurance';
  landingApp?: string;
  remotes: Record<string, RemoteConfig>;
}

export const environment: Environment = {
  production: false,
  apiBaseUrl: 'https://api.mushaviri.com:8443',
  defaultTheme: 'admin' as
    'default' | 'admin' | 'umdzidzisi' | 'umtengesi' | 'insurance',
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
