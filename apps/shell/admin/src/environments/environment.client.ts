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
    'umdzidzisi-client': {
      url: 'http://localhost:4205/remoteEntry.json',
      auth: { mode: 'optional' as const }, // E-commerce - browse freely, login for features
    },
    'umtengesi-client': {
      url: 'http://localhost:4206/remoteEntry.json',
      auth: { mode: 'optional' as const }, // E-commerce - browse freely, login for features
    },
  },
};
