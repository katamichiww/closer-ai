"use client";

import { useEffect, useState } from "react";
import { runLocalTwinkleAgent, type TwinkleResponse } from "@/lib/twinkle";

const fallbackDesireSuggestions = [
  "I want more calm today.",
  "I want to know what to do first.",
  "I want to make more money.",
  "I want to protect my time.",
  "I want to feel brave enough to say no.",
];

export default function Home() {
  const [message, setMessage] = useState("");
  const [bubble, setBubble] = useState(
    "Hi! I am Twinkle AI. What do you desire today?",
  );
  const [desireSuggestion, setDesireSuggestion] = useState(fallbackDesireSuggestions[0]);
  const [isThinking, setIsThinking] = useState(false);
  const supportLabel =
    new Date().getHours() < 12 ? "Buy Me A Coffee" : "Buy Me A Whisky";

  useEffect(() => {
    let isMounted = true;

    async function loadDesires() {
      try {
        const result = await fetch("/api/desires");
        const data = (await result.json()) as { suggestions?: string[] };
        const suggestions = data.suggestions?.length
          ? data.suggestions
          : fallbackDesireSuggestions;

        if (isMounted) {
          setDesireSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
        }
      } catch {
        if (isMounted) {
          setDesireSuggestion(
            fallbackDesireSuggestions[
              Math.floor(Math.random() * fallbackDesireSuggestions.length)
            ],
          );
        }
      }
    }

    void loadDesires();

    return () => {
      isMounted = false;
    };
  }, []);

  async function talkToTwinkle() {
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      setBubble("Tell me one thing that feels messy. Just a few words is okay.");
      return;
    }

    setIsThinking(true);

    try {
      const result = await fetch("/api/twinkle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: cleanMessage, mode: "decision" }),
      });

      if (!result.ok) {
        throw new Error("Twinkle had a sleepy moment.");
      }

      const reply = (await result.json()) as TwinkleResponse;
      setBubble(reply.bubble);
    } catch {
      setBubble(runLocalTwinkleAgent(cleanMessage, "decision").bubble);
    } finally {
      setIsThinking(false);
      setMessage("");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <img
        src="/twinkle.jpeg"
        alt="Twinkle AI"
        className="absolute inset-0 h-full w-full object-contain object-center"
      />
      <div className="absolute inset-0 bg-black/5" />

      <a
        href="https://www.paypal.com/paypalme/ikiguide"
        target="_blank"
        rel="noreferrer"
        className="absolute right-4 top-4 z-20 rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:bg-teal-50 sm:right-6 sm:top-6"
      >
        {supportLabel}
      </a>

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-between px-5 pb-5 pt-10 text-center sm:pb-7 sm:pt-14">
        <h1 className="text-4xl font-black tracking-normal text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.8)] sm:text-6xl">
          Twinkle AI
        </h1>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void talkToTwinkle();
          }}
          className="w-full max-w-[560px]"
        >
          <div className="relative rounded-[24px] border border-white/20 bg-black/70 px-5 py-4 text-left text-white shadow-[0_18px_80px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:px-6 sm:py-5">
            <p className="text-xl font-black leading-snug sm:text-2xl">{bubble}</p>
            <div className="mt-4 flex gap-2 rounded-full border border-white/20 bg-white/10 p-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={desireSuggestion}
                className="min-w-0 flex-1 bg-transparent px-3 text-base font-bold text-white outline-none placeholder:text-white/60"
              />
              <button
                type="submit"
                disabled={isThinking}
                className="rounded-full bg-teal-600 px-4 py-2 text-sm font-black text-white transition hover:bg-teal-500 disabled:bg-slate-500"
              >
                {isThinking ? "Wait" : "Ask"}
              </button>
            </div>
            <span className="absolute -top-2 left-1/2 size-5 -translate-x-1/2 rotate-45 border-l border-t border-white/20 bg-black/70" />
          </div>
        </form>
      </section>
    </main>
  );
}
