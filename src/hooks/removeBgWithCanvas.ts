// utils/removeBgCanvas.ts
export const removeBackgroundCanvas = async (file: File): Promise<string> => {
  const img = await createImageBitmap(file);

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Example: remove all pixels near a color (adaptive threshold)
  // Here we just remove "white-ish" for simplicity, but we can remove anything
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    // calculate brightness
    const brightness = 0.299*r + 0.587*g + 0.114*b;
    if (brightness > 240) { // adjust threshold as needed
      data[i+3] = 0; // alpha = 0
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
};
