// hooks/clipdrop.ts
export async function removeBackgroundClipdrop(file: File): Promise<Blob> {
  const fd = new FormData();
  fd.append("image", file);

  const res = await fetch("/api/remove-bg/", {
    method: "POST",
    body: fd,
  });

  if (!res.ok) throw new Error("ClipDrop error");
  return await res.blob();
}
