// utils/scrollLock.ts
export const lockScroll = () => {
  document.body.style.overflow = 'hidden';
  document.body.style.touchAction = 'none'; // Prevents iOS rubber-band scrolling
};

export const unlockScroll = () => {
  document.body.style.overflow = '';
  document.body.style.touchAction = '';
};