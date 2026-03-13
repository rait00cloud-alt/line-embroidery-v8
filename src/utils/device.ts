// utils/device.ts
export const isMobileOrSafari = () => {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;

  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  return isIOS || isSafari || isAndroid;
};
