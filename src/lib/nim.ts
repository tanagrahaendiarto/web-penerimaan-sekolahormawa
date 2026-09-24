// Shared by the client form (immediate feedback) and the API route (source
// of truth) so both agree on what counts as a well-formed NIM before it's
// worth a network round-trip.
const NIM_PATTERN = /^[A-Za-z0-9]{6,20}$/;

export function normalizeNim(rawNim: string): string {
  return rawNim.trim().toUpperCase();
}

export function isValidNim(rawNim: string): boolean {
  return NIM_PATTERN.test(normalizeNim(rawNim));
}
