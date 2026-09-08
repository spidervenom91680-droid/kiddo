import { lazy, Suspense, useEffect, useState } from "react";
import { BrainCanvas } from "@/components/brain-canvas";
import { HudChip } from "@/components/hud-chip";
import { FLOOR, RoomView, ZONE_META, type ZoneId } from "@/components/nbcm-rooms";
import { askLyra, grokStatus, type ChatTurn } from "@/lib/lyra";

const NbcmVr = lazy(() =>
  import("@/components/nbcm-vr").then((m) => ({ default: m.NbcmVr })),
);

const KEY_ZONES: Record<string, ZoneId> = {
  Digit1: "control",
  Digit2: "studio",
  Digit3: "ghost",
  Digit4: "code",
  Digit5: "aera",
  Digit6: "store",
  Digit7: "net",
  Digit8: "brain",
  Digit0: "map",
};

type Props = {
  onClose: () => void;
};

export function NbcmOverlay({ onClose }: Props) {
  const [zone, setZone] = useState<ZoneId>("map");
  const [vrOn, setVrOn] = useState(true);
  const [vrReady, setVrReady] = useState(false);
  const [fromVr, setFromVr] = useState(false);
  const [feed, setFeed] = useState<Array<{ who: string; text: string }>>([
    { who: "LYRA", text: "Nexus online. Comms are live Grok. V opens VR outlook. Pick a bay or hit LYRA MAIN." },
  ]);
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [core, setCore] = useState<"checking" | "live" | "down">("checking");
  const meta = ZONE_META[zone];

  useEffect(() => {
    setVrReady(true);
    grokStatus().then((s) => setCore(s.available ? "live" : "down"));
  }, []);

  function enter(id: ZoneId, viaVr = false) {
    setZone(id);
    setFromVr(viaVr);
    setVrOn(false);
    setFeed((f) => [...f, { who: "LYRA", text: `Entered ${ZONE_META[id].title}.` }]);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if (e.code === "Escape") {
        e.preventDefault();
        if (vrOn) return;
        if (fromVr) {
          setVrOn(true);
          setFromVr(false);
        } else if (zone !== "map") setZone("map");
        else onClose();
        return;
      }
      if (typing) return;
      if (e.code === "KeyV") {
        setVrOn((v) => !v);
        return;
      }
      const next = KEY_ZONES[e.code];
      if (next) enter(next, vrOn);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [vrOn, fromVr, zone, onClose]);

  async function send() {
    const t = msg.trim();
    if (!t || busy) return;
    const lower = t.toLowerCase();
    if (lower.includes("lyra main")) {
      onClose();
      return;
    }
    if (lower === "vr" || lower.includes("outlook")) {
      setVrOn(true);
      setMsg("");
      return;
    }
    if (lower === "map" || lower === "floor") {
      setZone("map");
      setMsg("");
      setFeed((f) => [...f, { who: "KH4", text: t }, { who: "LYRA", text: "Back on the floor map." }]);
      return;
    }
    setMsg("");
    setBusy(true);
    setFeed((f) => [...f, { who: "KH4", text: t }]);
    let reply = "Grok call failed.";
    try {
      const res = await askLyra({
        data: { prompt: t, zone, mode: "chat", history },
      });
      reply = res.ok ? res.text : res.error;
    } catch (err) {
      reply = err instanceof Error ? err.message : "Grok call failed.";
    }
    setHistory((h) =>
      [...h, { role: "user" as const, content: t }, { role: "assistant" as const, content: reply }].slice(-8),
    );
    setFeed((f) => [...f, { who: "LYRA", text: reply }]);
    setBusy(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ink text-fg"
      role="dialog"
      aria-modal="true"
      aria-label="NBCM warehouse overlay"
    >
      {vrReady && vrOn ? (
        <Suspense fallback={null}>
          <NbcmVr onExit={onClose} onEnter={(id) => enter(id, true)} />
        </Suspense>
      ) : null}

      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 50% 18%, color-mix(in oklab, var(--color-cyan) 22%, transparent) 0%, transparent 55%)",
        }}
      />
      <BrainCanvas />

      <header className="relative z-10 flex flex-wrap items-center gap-2 border-b border-cyan bg-ink/90 px-3 py-2">
        <HudChip as="button" mint active onClick={onClose}>
          LYRA MAIN
        </HudChip>
        <HudChip as="button" mint active onClick={() => setVrOn(true)}>
          VR OUTLOOK
        </HudChip>
        <HudChip active>NBCM OVERLAY ON</HudChip>
        <HudChip active={core === "live"} mint={core === "live"}>
          {core === "live" ? "GROK LIVE" : core === "down" ? "GROK DOWN" : "GROK…"}
        </HudChip>
        <HudChip active>SEC CLEARED</HudChip>
        <HudChip>PROTOCOL XLIX</HudChip>
        <p className="ml-auto hidden font-display text-[0.65rem] tracking-widest text-muted lg:block">
          NBCM · THE NEXUS
        </p>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1">
        <aside className="hidden w-52 shrink-0 overflow-auto border-r border-cyan/40 bg-ink/80 p-3 md:block">
          <p className="mb-2 font-display text-[0.7rem] tracking-[0.2em] text-muted">FLOOR</p>
          {FLOOR.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => enter(item.id)}
              className={`mb-2 flex min-h-11 w-full items-center border px-3 text-left font-display text-xs tracking-wide ${
                zone === item.id
                  ? "border-cyan bg-cyan/15 text-cyan"
                  : "border-cyan/40 text-cyan hover:bg-cyan/10"
              }`}
            >
              {item.label}
            </button>
          ))}
          <HudChip as="button" mint active onClick={() => setVrOn(true)} className="mt-2 w-full">
            VR OUTLOOK
          </HudChip>
          <HudChip as="button" mint active onClick={onClose} className="mt-2 w-full">
            LYRA MAIN INTERFACE
          </HudChip>
          <p className="mt-4 font-display text-[0.7rem] leading-relaxed text-warn">
            Depot backdoor: ARMED OFF
          </p>
          <p className="mt-3 font-display text-[0.65rem] leading-relaxed text-muted">
            Keys: V VR · Esc back · 1–8 bays · 0 map
          </p>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-3 overflow-auto p-3">
          <div className="flex gap-2 overflow-x-auto md:hidden">
            {FLOOR.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => enter(item.id)}
                className="min-h-11 shrink-0 border border-cyan px-3 font-display text-xs text-cyan"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-display text-[0.65rem] tracking-[0.25em] text-mint">AGENT · {meta.agent}</p>
              <h1 className="font-display text-xl tracking-[0.14em] text-cyan">{meta.title}</h1>
              <p className="mt-1 max-w-prose text-sm text-muted">{meta.body}</p>
            </div>
            {fromVr ? (
              <HudChip as="button" mint active onClick={() => setVrOn(true)}>
                BACK TO VR
              </HudChip>
            ) : null}
            {zone !== "map" ? (
              <HudChip as="button" onClick={() => enter("map")}>
                FLOOR MAP
              </HudChip>
            ) : null}
          </div>
          <RoomView zone={zone} onEnter={enter} />
          {zone === "map" ? (
            <HudChip as="button" mint active onClick={() => setVrOn(true)} className="w-fit">
              ENTER VR OUTLOOK
            </HudChip>
          ) : null}
          <section className="mt-auto border border-cyan/50 bg-ink/80 p-3">
            <h2 className="mb-2 font-display text-xs tracking-[0.2em] text-muted">
              COMMS · LYRA ↔ KH4 · LIVE GROK
            </h2>
            <div className="mb-2 max-h-40 overflow-auto font-display text-sm leading-relaxed">
              {feed.map((row, i) => (
                <p key={i} className={row.who === "KH4" ? "text-fg" : "text-mint"}>
                  {row.who}: {row.text}
                </p>
              ))}
              {busy ? <p className="text-muted">LYRA: …</p> : null}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Message Lyra through Grok…"
                disabled={busy}
                className="min-h-11 flex-1 border border-cyan bg-ink px-3 text-sm text-fg placeholder:text-muted"
              />
              <button
                type="submit"
                disabled={busy}
                className="min-h-11 border-2 border-cyan px-4 font-display text-xs tracking-widest text-cyan disabled:opacity-50"
              >
                SEND
              </button>
            </form>
          </section>
        </main>

        <aside className="hidden w-52 shrink-0 overflow-auto border-l border-cyan/40 bg-ink/80 p-3 lg:block">
          <p className="mb-2 font-display text-[0.7rem] tracking-[0.2em] text-muted">AGENTS</p>
          <ul className="space-y-3 font-display text-xs leading-relaxed text-fg">
            <li>
              <span className="text-cyan">Design</span> — plate via Grok
            </li>
            <li>
              <span className="text-cyan">Narrative</span> — draft via Grok
            </li>
            <li>
              <span className="text-cyan">Code</span> — scratch via Grok
            </li>
            <li>
              <span className="text-cyan">Net Runner</span> — live allowlist
            </li>
            <li>
              <span className="text-cyan">Tank</span> — docked
            </li>
          </ul>
        </aside>
      </div>

      <footer className="relative z-10 border-t border-cyan bg-ink/90 px-3 py-2 font-display text-[0.65rem] tracking-widest text-muted">
        LIVE GROK · VR OUTLOOK · DEPOT DARK · LYRA MAIN ALWAYS REACHABLE
      </footer>
    </div>
  );
}
