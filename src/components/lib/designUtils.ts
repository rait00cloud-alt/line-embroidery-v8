// lib/designUtils.ts
import * as THREE from "three";

export function createTextTexture(text: string, fontSize = 64, fontFamily = "Arial"): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve("/fallback-text.png");
    ctx.font = `${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    const width = Math.ceil(metrics.width + 20);
    const height = fontSize + 20;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillText(text, width / 2, height / 2);
    canvas.toBlob((blob) => {
      if (!blob) return resolve("/fallback-text.png");
      resolve(URL.createObjectURL(blob));
    }, "image/png");
  });
}

export async function removeWhiteBackground(file: File): Promise<File> {
  const blobUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(blobUrl);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas not supported");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const whiteThreshold = 245;
    const tolerance = 18;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      if (max >= whiteThreshold && max - min <= tolerance) data[i + 3] = 0;
    }
    ctx.putImageData(imageData, 0, 0);
    const outBlob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png")
    );
    return new File([outBlob], file.name.replace(/\.[^.]+$/, "") + "-processed.png", { type: "image/png" });
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}