// utils/removeBlackBackground.ts
export function removeBlackBackground(
  canvas: HTMLCanvasElement,
  tolerance = 30
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // If pixel is "close to black", make it transparent
    if (r < tolerance && g < tolerance && b < tolerance) {
      data[i + 3] = 0; // alpha = 0 → fully transparent
    }
  }

  const output = document.createElement('canvas');
  output.width = canvas.width;
  output.height = canvas.height;
  const outCtx = output.getContext('2d')!;
  outCtx.putImageData(imageData, 0, 0);
  
  return output;
}