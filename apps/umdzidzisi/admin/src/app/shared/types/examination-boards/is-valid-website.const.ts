/**
 * Accepts an empty value (website is optional) or something the backend's
 * `@IsUrl()` will take: a host with a dot, with or without an http(s) scheme.
 */
export const IS_VALID_WEBSITE: (value: string) => boolean = (
  value: string,
): boolean => {
  const trimmed: string = value.trim();
  if (!trimmed) {
    return true;
  }
  if (/\s/.test(trimmed)) {
    return false;
  }
  try {
    const url: URL = new URL(
      /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.hostname.includes('.')
    );
  } catch {
    return false;
  }
};
