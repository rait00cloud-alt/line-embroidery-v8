// hooks/useTextTexture.ts
import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';

export function useTextTexture(
  text: string,
  options: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string; // e.g., 'transparent' or '#ffffff00'
    padding?: number;
  } = {}
) {
  const {
    fontSize = 64,
    fontFamily = 'Arial, sans-serif',
    color = '#000000',
    backgroundColor = 'transparent',
    padding = 20,
  } = options;

  // Generate a data URL from text
  const textDataUrl = useMemo(() => {
    if (!text.trim()) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Measure text
    ctx.font = `${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    const width = metrics.width + padding * 2;
    const height = fontSize + padding * 2;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Optional: fill background (useful for debugging)
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    // Draw text
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(text, padding, padding);

    return canvas.toDataURL('image/png');
  }, [text, fontSize, fontFamily, color, backgroundColor, padding]);

  // Load as Three.js texture
  const texture = useTexture(textDataUrl || '');
  
  return textDataUrl ? texture : null;
}