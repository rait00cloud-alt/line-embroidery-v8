import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const HF_TOKEN = process.env.HF_TOKEN!;

const SYSTEM_PROMPT = `You are the logo designer at Line Embroidery. Generate logos directly based on user instructions.

IMPORTANT: Always respond in the same language the user is using. If they write in Spanish, respond in Spanish. If they write in Portuguese, respond in Portuguese, etc.

Behavior:
- If user describes a logo, ask ONLY: "Do you want this as a vectorized logo or embroidered logo?" (translate this question to user's language)
- ONLY generate if they choose vectorized logo
- If they choose embroidered logo, say: "For embroidered logos, please use our design tools to upload your image" (translate to user's language)
- No greetings, no suggestions, no multiple options
- Keep all responses extremely short
- Don't worry about colors - generate with any colors that work

When ready to generate (ONLY for vectorized logos), end with:
GENERATE:{"imagePrompt":"..."}

VECTORIZED LOGO FORMAT (only format to use):
"professional logo design, [icon] with clean lines, [user requested colors or vibrant colors if not specified], [font] letters [BRAND], [style] composition, white background, vector illustration, modern and clean"

Always:
- Brand text plain letters only — no apostrophes, no special characters
- Use any colors that work well for the design
- Match the user's language in your responses
- Only generate vectorized logos, never embroidered ones`;

async function chatWithGroq(messages: { role: string; content: string }[]) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 600,
      temperature: 0.8,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("[logo-ai] Groq error:", JSON.stringify(data));
    throw new Error(data?.error?.message ?? `LLM error ${res.status}`);
  }

  const text = data.choices?.[0]?.message?.content ?? "";
  console.log("[logo-ai] Groq response:", text);
  return text;
}


async function removeChromaGreen(b64: string): Promise<string> {
  const inputBuffer = Buffer.from(b64, "base64");

  const { data: pixels, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const output = Buffer.from(pixels);

  const corners = [0, (width - 1) * channels, (height - 1) * width * channels, ((height - 1) * width + width - 1) * channels];
  console.log("[logo-ai] Corner RGB samples:");
  corners.forEach((idx, i) => {
    console.log(`  Corner ${i}: R=${output[idx]} G=${output[idx+1]} B=${output[idx+2]}`);
  });

  let removed = 0;
  for (let i = 0; i < output.length; i += channels) {
    const r = output[i];
    const g = output[i + 1];
    const b = output[i + 2];
    if (g > 120 && g > r * 1.5 && g > b * 1.5) {
      output[i + 3] = 0;
      removed++;
    }
  }

  console.log(`[logo-ai] Removed ${removed} green pixels out of ${output.length / channels}`);

  const transparentPng = await sharp(output, {
    raw: { width, height, channels },
  })
    .png()
    .toBuffer();

  return `data:image/png;base64,${transparentPng.toString("base64")}`;
}

async function generateImage(prompt: string): Promise<string> {
  console.log("[logo-ai] Generating image:", prompt);

  const res = await fetch("https://router.huggingface.co/nscale/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_TOKEN!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "black-forest-labs/FLUX.1-schnell",
      prompt,
      response_format: "b64_json",
      width: 1024,
      height: 1024,
      n: 1,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `HF image error ${res.status}`);
  }

  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image returned from HuggingFace.");

  return `data:image/png;base64,${b64}`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, lastImagePrompt } = await req.json();
    const assistantText = await chatWithGroq(messages);

    const cleanedText = assistantText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    const generateIndex = cleanedText.indexOf("GENERATE:");
    if (generateIndex !== -1) {
      const jsonStr = cleanedText.slice(generateIndex + "GENERATE:".length).trim();
      const replyText = cleanedText.slice(0, generateIndex).trim();

      try {
        // Normalize smart/curly quotes Groq sometimes outputs
        const normalizedJson = jsonStr
          .replace(/[\u201C\u201D]/g, '"') // " "
          .replace(/[\u2018\u2019]/g, "'"); // ' '
        const parsed = JSON.parse(normalizedJson);
        const image = await generateImage(parsed.imagePrompt);
        return NextResponse.json({ reply: replyText, image, imagePrompt: parsed.imagePrompt });
      } catch (parseErr) {
        console.error("[logo-ai] JSON parse failed:", jsonStr);
        return NextResponse.json({ reply: replyText });
      }
    }

    return NextResponse.json({ reply: cleanedText });
  } catch (err: any) {
    console.error("[logo-ai] error:", err);
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 500 });
  }
}