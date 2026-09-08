import { createServerFn } from "@tanstack/react-start";

const ALLOWED = new Set([
  "www.spacex.com",
  "spacex.com",
  "www.nasa.gov",
  "nasa.gov",
  "developer.mozilla.org",
]);

const HOSTS: Record<string, string> = {
  spacex: "https://www.spacex.com/",
  nasa: "https://www.nasa.gov/",
  mdn: "https://developer.mozilla.org/",
};

let lastFetch = 0;

export const netFetch = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const id = typeof (input as { id?: unknown }).id === "string" ? (input as { id: string }).id : "";
    if (!(id in HOSTS)) throw new Error("host not on allowlist");
    return { id };
  })
  .handler(async ({ data }) => {
    const now = Date.now();
    if (now - lastFetch < 1000) {
      return { ok: false as const, error: "Rate limit 1s" };
    }
    lastFetch = now;

    const url = HOSTS[data.id];
    const host = new URL(url).hostname;
    if (!ALLOWED.has(host)) return { ok: false as const, error: "blocked" };

    const res = await fetch(url, {
      redirect: "follow",
      headers: { Accept: "text/html,application/json,text/plain" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { ok: false as const, error: `HTTP ${res.status}` };

    const buf = await res.arrayBuffer();
    if (buf.byteLength > 1_000_000) {
      return { ok: false as const, error: "over 1 MiB" };
    }
    let raw = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    raw = raw
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1800);
    return { ok: true as const, host, excerpt: raw || "(no text)" };
  });
