/**
 * Normalizes a Zimbabwean phone number to `+263XXXXXXXXX`.
 * Accepts `+263775962445`, `263775962445`, `0775962445`, and `775962445`.
 * Returns `null` if the input doesn't match one of those shapes.
 */
export function normalizeZimbabweanPhoneNumber(phone: string): string | null {
  const cleaned: string = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+263') && cleaned.length === 13) {
    return cleaned;
  }
  if (cleaned.startsWith('263') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+263${cleaned.substring(1)}`;
  }
  if (
    !cleaned.startsWith('+') &&
    !cleaned.startsWith('0') &&
    cleaned.length === 9
  ) {
    return `+263${cleaned}`;
  }
  return null;
}
