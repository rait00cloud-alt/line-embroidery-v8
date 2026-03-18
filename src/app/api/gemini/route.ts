import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const HF_TOKEN = process.env.HF_TOKEN!;

const SYSTEM_PROMPT = `You are a logo generator. Generate logos exactly as the user requests.

CRITICAL: ALWAYS respond in the EXACT same language the user is using. If they write in Portuguese, respond in Portuguese. If they write in Spanish, respond in Spanish. If they write in English, respond in English.

Behavior:
- If user describes a logo, ask ONLY: "Do you want this as a normal logo or embroidered logo?" BUT translate this question to match the user's language:
  * Portuguese: "Você quer isso como uma logo normal ou logo bordada?"
  * Spanish: "¿Quieres esto como un logo normal o logo bordado?"
  * English: "Do you want this as a normal logo or embroidered logo?"
- ONLY generate if they choose normal logo
- If they choose embroidered logo, say in their language:
  * Portuguese: "Para logos bordadas, use nossas ferramentas de design para enviar sua imagem"
  * Spanish: "Para logos bordados, usa nuestras herramientas de diseño para subir tu imagen"
  * English: "For embroidered logos, please use our design tools to upload your image"
- Follow user's exact specifications
- Make a brief comment about the logo in the user's language BEFORE generating

When ready to generate (ONLY for normal logos), end with:
GENERATE:{"imagePrompt":"..."}

LOGO FORMAT:
"professional logo design, [exactly what user described], [user requested colors or vibrant colors], solid filled design, white background, vector illustration, modern logo"

Always:
- Create exactly what the user asks for
- Use exact colors user specifies
- MATCH THE USER'S LANGUAGE in ALL your responses
- Only generate normal logos, never embroidered ones
- Let user refine through multiple iterations
- Put your comment BEFORE the GENERATE command, never after`;

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
    console.log("[logo-ai] Input messages:", messages);
    const assistantText = await chatWithGroq(messages);
    console.log("[logo-ai] Raw assistant response:", assistantText);

    const cleanedText = assistantText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    console.log("[logo-ai] Cleaned text:", cleanedText);

    const generateIndex = cleanedText.indexOf("GENERATE:");
    console.log("[logo-ai] Generate index:", generateIndex);
    
    if (generateIndex !== -1) {
      const jsonStr = cleanedText.slice(generateIndex + "GENERATE:".length).trim();
      const replyText = cleanedText.slice(0, generateIndex).trim();
      console.log("[logo-ai] JSON string:", jsonStr);
      console.log("[logo-ai] Reply text:", replyText);

      try {
        // Decode HTML entities and normalize quotes
        const decodedJson = jsonStr
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/[\u201C\u201D]/g, '"') // " "
          .replace(/[\u2018\u2019]/g, "'"); // ' '
        console.log("[logo-ai] Decoded JSON:", decodedJson);
        const parsed = JSON.parse(decodedJson);
        console.log("[logo-ai] Parsed JSON:", parsed);
        const image = await generateImage(parsed.imagePrompt);
        return NextResponse.json({ reply: replyText, image, imagePrompt: parsed.imagePrompt });
      } catch (parseErr) {
        console.error("[logo-ai] JSON parse failed:", jsonStr, parseErr);
        return NextResponse.json({ reply: replyText });
      }
    }

    return NextResponse.json({ reply: cleanedText });
  } catch (err: any) {
    console.error("[logo-ai] error:", err);
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 500 });
  }
}