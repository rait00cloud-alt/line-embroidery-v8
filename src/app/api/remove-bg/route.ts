import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const image = formData.get("image");

  if (!image || !(image instanceof Blob)) {
    return NextResponse.json({ error: "No image" }, { status: 400 });
  }

  const clipdropRes = await fetch(
    "https://clipdrop-api.co/remove-background/v1",
    {
      method: "POST",
      headers: {
        "x-api-key": process.env.CLIPDROP_API_KEY!,
      },
      body: (() => {
        const fd = new FormData();
        fd.append("image_file", image);
        return fd;
      })(),
    }
  );

  if (!clipdropRes.ok) {
    return NextResponse.json(
      { error: "ClipDrop failed" },
      { status: 500 }
    );
  }

  const buffer = await clipdropRes.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
    },
  });
}
