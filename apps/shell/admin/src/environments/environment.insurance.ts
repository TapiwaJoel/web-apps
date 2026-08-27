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
  defaultTheme: 'insurance' as
    'default' | 'umdzidzisi' | 'umtengesi' | 'insurance',
  landingApp: 'insurance-admin',
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
    'insurance-website': {
      url: 'http://localhost:4207/remoteEntry.json',
      auth: { mode: 'none' as const }, // Public website - no auth required
    },
    'insurance-admin': {
      url: 'http://localhost:4208/remoteEntry.json',
      auth: { mode: 'required' as const }, // Admin portal - immediate auth required
    },
    'insurance-client': {
      url: 'http://localhost:4209/remoteEntry.json',
      auth: { mode: 'optional' as const }, // Client portal - browse freely, login for policy features
    },
  },
};
