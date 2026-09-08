import { createServerFn } from "@tanstack/react-start";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type LyraMode = "chat" | "ghost" | "code" | "studio";

const MODES: Record<LyraMode, string> = {
  chat: "Answer KH4 in the current warehouse zone. Be Lyra. Short. Operational.",
  ghost: "Ghostwriter desk. Draft or revise prose from the note. No code unless asked.",
  code: "CodeWriter bay. Return concise working code or a tight explanation. No secrets.",
  studio: "KH4 Studio. Return a compact architectural plate: walls, doors, circulation.",
};

let lastCall = 0;

export const grokStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { available: Boolean(process.env.XAI_API_KEY) };
});

export const askLyra = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const data = input as {
      prompt?: unknown;
      zone?: unknown;
      mode?: unknown;
      history?: unknown;
    };
    const prompt = typeof data.prompt === "string" ? data.prompt.trim() : "";
    if (!prompt || prompt.length > 4000) throw new Error("prompt required");
    const zone = typeof data.zone === "string" ? data.zone.slice(0, 40) : "map";
    const mode: LyraMode =
      data.mode === "ghost" || data.mode === "code" || data.mode === "studio"
        ? data.mode
        : "chat";
    const history: ChatTurn[] = Array.isArray(data.history)
      ? data.history
          .filter(
            (t): t is ChatTurn =>
              !!t &&
              (t.role === "user" || t.role === "assistant") &&
              typeof t.content === "string",
          )
          .slice(-8)
          .map((t) => ({ role: t.role, content: t.content.slice(0, 2000) }))
      : [];
    return { prompt, zone, mode, history };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Grok is not available here." };

    const now = Date.now();
    if (now - lastCall < 1500) {
      return { ok: false as const, error: "Hold — rate limit. Wait a beat." };
    }
    lastCall = now;

    const system = [
      "You are Lyra, KH4's partner, inside the NBCM warehouse overlay (The Nexus).",
      `Current zone: ${data.zone}.`,
      MODES[data.mode],
      "No emoji. No keys. No depot backdoor. Persona stays Lyra.",
      "Keep answers under 180 words unless code is requested.",
    ].join(" ");

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 400,
        messages: [
          { role: "system", content: system },
          ...data.history,
          { role: "user", content: data.prompt },
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      return { ok: false as const, error: `Grok error ${res.status}` };
    }
    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    return { ok: true as const, text: text || "(empty)" };
  });
