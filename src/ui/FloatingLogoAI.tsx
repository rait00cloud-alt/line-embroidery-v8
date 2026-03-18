"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

type Message = {
  role: "assistant" | "user";
  content: string;
  image?: string;
};

// Removes chroma green background client-side using canvas
async function removeGreenBackground(imageSrc: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        if (g > 120 && g > r * 1.5 && g > b * 1.5) d[i + 3] = 0;
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = imageSrc;
  });
}

export default function FloatingLogoAI() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [reasoning, setReasoning] = useState(false); // simulated reasoning on open
  const [promptCount, setPromptCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastImagePrompt, setLastImagePrompt] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const tooltipTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Tooltip: show every 5s when closed, or on hover
  useEffect(() => {
    if (open) {
      setShowTooltip(false);
      if (tooltipTimerRef.current) clearInterval(tooltipTimerRef.current);
      return;
    }

    const initial = setTimeout(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);

      tooltipTimerRef.current = setInterval(() => {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 13000);
      }, 20000);
    }, 2000);

    return () => {
      clearTimeout(initial);
      if (tooltipTimerRef.current) clearInterval(tooltipTimerRef.current);
    };
  }, [open]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Simulated reasoning on first open — show typing bubble for 1s then show initial message
  useEffect(() => {
    if (!open) return;
    if (messages.length > 0) return; // already initialized

    setReasoning(true);
    const timer = setTimeout(() => {
      setReasoning(false);
      setMessages([
        {
          role: "assistant",
          content: t("generate.initial"),
        },
      ]);
    }, 5000);

    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, reasoning]);

  const sendPrompt = async () => {
    if (!input.trim() || loading || promptCount >= 15) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const apiMessages = updatedMessages
        .filter((m) => !(m.role === "assistant" && m.image)) // strip messages that have images (just keep text)
        .filter((m, i) => !(i === 0 && m.role === "assistant")) // strip initial greeting
        .map(({ role, content }) => ({ role, content }));

      const messagesWithContext = lastImagePrompt
        ? [
            {
              role: "assistant" as const,
              content: `The last logo I generated used this prompt: "${lastImagePrompt}". I will use this as the base if the user wants to keep any elements.`,
            },
            ...apiMessages,
          ]
        : apiMessages;

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesWithContext, lastImagePrompt }),
      });

      const data = await res.json();
      console.log("[logo-ai] response:", data);
      if (!res.ok) throw new Error(data.error ?? "Request failed");

      if (data.image) {
        const cleanImage = await removeGreenBackground(data.image);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply || t("generate.generated"),
            image: cleanImage,
          },
        ]);
        setPromptCount((c) => c + 1);
        if (data.imagePrompt) setLastImagePrompt(data.imagePrompt);
      } else if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt();
    }
  };

  return (
    <>
      {/* FAB + Tooltip */}
      <div className="fixed bottom-6 right-4 z-50 flex items-center gap-2">
        <AnimatePresence>
          {(showTooltip || isHovered) && !open && (
            <motion.div
              initial={{ opacity: 0, x: 8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className=" max-w-[180px] absolute bottom-14 right-4 flex items-center gap-1.5 bg-black text-white text-xs font-[HandoRegular] px-3 py-2 rounded-full shadow-lg whitespace-nowrap pointer-events-none"
            >
              
              {t("generate.logo")}
              <Sparkles size={11} />
              
              
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => { setOpen(true); setShowTooltip(false); }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileTap={{ scale: 0.9 }}
          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs border-[black]/40 border shadow-xl flex items-center justify-center"
        >
          <img src="/favicon/favicon.png" alt="logo-ai" className="w-6 h-6" />
        </motion.button>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[9999] pt-16 flex items-end sm:items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: "100vh" }}
              animate={{ y: 0 }}
              exit={{ y: "100vh" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="bg-white w-full h-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 shadow-xl sm:mb-12 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <img src="/favicon/favicon.png" className="w-6 h-6" />
                  <h3 className="font-[HandoBold] text-lg">{t("generate.title")}</h3>
                </div>
                <button onClick={() => setOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              {/* CHAT */}
              <div ref={chatRef} className="flex-1 overflow-y-auto space-y-3 px-1">
                {reasoning && <TypingBubble />}
                {messages.map((msg, i) => (
                  <ChatBubble key={i} message={msg} />
                ))}
                {loading && <TypingBubble />}
              </div>

              {/* ERROR */}
              {error && (
                <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
              )}

              {/* INPUT */}
              <div className="mt-4 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("generate.placeholder")}
                  disabled={loading || reasoning || promptCount >= 15}
                  className="flex-1 border rounded-md px-3 py-2 text-sm font-[HandoRegular] disabled:opacity-50"
                />
                <button
                  onClick={sendPrompt}
                  disabled={loading || reasoning || promptCount >= 15}
                  className="bg-black text-white px-4 rounded-md text-sm disabled:opacity-40"
                >
                  {t("generate.send")}
                </button>
              </div>

              <p className="text-[11px] text-neutral-400 mt-2 text-center">
                {15 - promptCount} {t("generate.remaining")}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}>
        <div
          className={`max-w-[78%] px-4 py-2 rounded-2xl text-sm whitespace-pre-line font-[HandoRegular] ${
            isUser
              ? "bg-[#007AFF] text-white rounded-br-sm"
              : "bg-[#F1F1F1] text-black rounded-bl-sm"
          }`}
        >
          {message.content}
        </div>
        {!isUser && (
          <img src="/favicon/favicon.png" className="w-4 h-4 ml-1 self-end opacity-60" />
        )} 
      </div>

      {message.image && (
        <div className="mt-2 border rounded-xl p-2 bg-gray-50 w-full max-w-[78%]">
          <img src={message.image} alt="Generated logo" className="rounded-lg w-full" />
          <a
            href={message.image}
            download="logo.png"
            className="block text-center text-xs text-blue-500 mt-2 underline"
          >
            Download PNG
          </a>
        </div>
      )}
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="bg-[#F1F1F1] px-4 py-4 rounded-2xl rounded-bl-sm flex gap-1 items-center">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}