declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.gltf';
declare module '*.glb';
declare module '*.bin';

interface Window {
  __MODEL_CACHE__?: Record<string, any>;
}
