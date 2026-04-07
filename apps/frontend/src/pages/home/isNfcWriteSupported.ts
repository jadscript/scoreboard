export function isNfcWriteSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.isSecureContext) return false;
  return "NDEFReader" in window;
}
