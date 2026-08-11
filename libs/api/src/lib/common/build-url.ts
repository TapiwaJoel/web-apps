/**
 * Compose a gateway URL: {base}/{servicePath}/{segments...}
 * Trims slashes so callers can pass 'authentications', '/authentications', etc.
 */
export function buildUrl(
  base: string,
  servicePath: string,
  ...segments: string[]
): string {
  const parts: string[] = [servicePath, ...segments]
    .map((s: string): string => s.replace(/^\/+|\/+$/g, ''))
    .filter((s: string): boolean => s.length > 0);
  return `${base.replace(/\/+$/g, '')}/${parts.join('/')}`;
}
