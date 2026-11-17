/** A short haptic tick on phones that support it. Browsers block vibration before the first tap, so check first. */
export function buzz(pattern: number | number[]) {
  const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  if (ua && !ua.hasBeenActive) return;
  navigator.vibrate?.(pattern);
}
