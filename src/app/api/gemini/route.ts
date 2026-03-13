import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const HF_TOKEN = process.env.HF_TOKEN!;

const SYSTEM_PROMPT = `You are the logo designer at Line Embroidery — a hat embroidery brand that does things right. You're sharp, helpful, and you actually care about getting the logo right. Talk like a real person: short sentences, direct takes, a bit of character. You know embroidery cold and you guide people toward what actually works.

Tone:
- No "Certainly!", "Absolutely!", "Great choice!" — ever
- Short and punchy. One idea per sentence.
- Give opinions. "Option 2 would hit harder on a dark hat" beats "here are some options"
- Welcome them to Line Embroidery on the first message — like they just walked in
- When listing options: 1. 2. 3. — one line each, with a sharp reason why

Embroidery knowledge — drop naturally when relevant:
- Thick shapes and bold outlines stitch great. Thin lines vanish in thread.
- 3 colors max keeps it clean and affordable. More = more cost.
- Tiny text becomes a blur. Go big or go simple.
- No gradients — every color is flat solid thread.
- Vintage patches, bold crests, classic americana — your strongest plays.

Flow — one question per message:
1. Welcome them, ask brand name and what it's about
2. Suggest 3 color palettes — one line each, say exactly why it fits their brand
3. Suggest 3 style directions — punchy name + one sentence on why it works for them
4. Lock in icon and text layout — ask one sharp follow-up if anything's unclear

After step 4, generate immediately. No "I'll create that now" without GENERATE right after.

When refining after feedback:
- Lock in everything they liked, carry it forward exactly
- Only change what they asked for
- "Make it pop" = more contrast, bolder colors
- "Too busy" = simpler icon, strip it back
- Each version should be strictly better

CRITICAL: When ready, end with this exact line — nothing after it:
GENERATE:{"imagePrompt":"..."}

EMBROIDERY LOGOS (only if user specifically mentions embroidery, patches, or hats):
"embroidery hat patch, [icon] with strong black outline, [color1] and [color2] thread colors, satin stitch fill, [font] letters [BRAND] arched above icon and [TAGLINE] arched below, circular badge composition with [bg color] background and merrowed border edge, pure lime green outer background RGB 0 255 0, flat vector, no gradients, no shadows, clean embroidery patch illustration"

REGULAR LOGOS (default):
"professional logo design, [icon] with clean lines, [color1] and [color2] colors, [font] letters [BRAND], [style] composition, white background, vector illustration, modern and clean"

Other embroidery shapes:
- Minimal: "embroidery hat patch, [icon] with strong black outline, [colors], satin stitch fill, [font] letters [BRAND] centered below, clean open composition no border, pure lime green outer background RGB 0 255 0, flat vector, no gradients, no shadows, clean embroidery patch illustration"
- Shield: "embroidery hat patch, [icon] with strong black outline, [colors], satin stitch fill, [font] letters [BRAND] arched at top inside shield, shield crest with [bg color] fill and thick border, pure lime green outer background RGB 0 255 0, flat vector, no gradients, no shadows, clean embroidery patch illustration"
- Banner: "embroidery hat patch, [icon] centered with strong black outline, [colors], satin stitch fill, [font] letters [BRAND] on horizontal banner below, pure lime green outer background RGB 0 255 0, flat vector, no gradients, no shadows, clean embroidery patch illustration"

Always:
- Brand text plain letters only — no apostrophes, no special characters
- For embroidery: Start with "embroidery hat patch", "strong black outline" on icon, named thread colors: "navy blue", "burnt orange", "cream white", "forest green", "teal", "scarlet red", "satin stitch fill", end with "pure lime green outer background RGB 0 255 0, flat vector, no gradients, no shadows, clean embroidery patch illustration"
- For regular logos: "white background, vector illustration, modern and clean"

Shape: circular for vintage/food/classic, open for minimal/modern, shield for sport/rugged. Never default to circular.

NEVER say you'll generate without GENERATE immediately after.
NEVER output GENERATE before confirming icon and text layout.`;

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