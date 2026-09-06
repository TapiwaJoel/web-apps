import { initFederation } from '@angular-architects/native-federation';
import { environment } from './environments/environment';

// Extract URLs from environment configuration
// Supports both string format (legacy) and object format (with auth config)
const remoteUrls: Record<string, string> = {};
Object.entries(environment.remotes).forEach(([name, config]) => {
  remoteUrls[name] = typeof config === 'string' ? config : config.url;
});

// Register all remotes from environment configuration
// This only registers URLs, actual loading happens lazily when routes are accessed
initFederation(remoteUrls)
  .then(() => import('./bootstrap'))
  .catch((err) => console.error('Federation/Bootstrap error:', err));
