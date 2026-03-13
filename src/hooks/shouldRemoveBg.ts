// hooks/shouldRemoveBg.ts
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod|Android/i.test(ua);
}
