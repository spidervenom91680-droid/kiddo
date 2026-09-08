import { useEffect, useState } from "react";
import {
  Aperture,
  Sun,
  Square,
  Pause,
  Play,
  Sparkles,
  Mic,
  Send,
} from "lucide-react";
import { HudChip } from "@/components/hud-chip";
import { askLyra, grokStatus, type ChatTurn } from "@/lib/lyra";

const ICONS = [
  { id: "shutter", Icon: Aperture, label: "Shutter" },
  { id: "sun", Icon: Sun, label: "Brightness" },
  { id: "stop", Icon: Square, label: "Stop" },
  { id: "pause", Icon: Pause, label: "Pause" },
  { id: "play", Icon: Play, label: "Play" },
  { id: "spiral", Icon: Sparkles, label: "Spiral" },
] as const;

type Props = {
  onOpenNbcm: () => void;
};

export function LyraMain({ onOpenNbcm }: Props) {
  const [message, setMessage] = useState("");
  const [log, setLog] = useState<string[]>(["Lyra, live and direct. What's up?"]);
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileText, setFileText] = useState<string>("");
  const [codeOpen, setCodeOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [core, setCore] = useState<"checking" | "live" | "down">("checking");

  useEffect(() => {
    grokStatus().then((s) => setCore(s.available ? "live" : "down"));
  }, []);

  function takeFile(file: File) {
    setFileName(file.name);
    if (file.size > 200_000) {
      setFileText("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const raw = typeof reader.result === "string" ? reader.result : "";
      setFileText(raw.slice(0, 4000));
    };
    reader.readAsText(file);
  }

  async function send() {
    const t = message.trim();
    if (!t || busy) return;
    const prompt = fileText ? `${t}\n\n[file ${fileName}]\n${fileText}` : t;
    setMessage("");
    setBusy(true);
    setLog((prev) => [...prev, `You: ${t}`]);
    let reply = "Grok call failed.";
    try {
      const res = await askLyra({
        data: { prompt, zone: "lyra-main", mode: "chat", history },
      });
      reply = res.ok ? res.text : res.error;
    } catch (err) {
      reply = err instanceof Error ? err.message : "Grok call failed.";
    }
    setHistory((h) =>
      [...h, { role: "user" as const, content: prompt }, { role: "assistant" as const, content: reply }].slice(-8),
    );
    setLog((prev) => [...prev, `Lyra: ${reply}`]);
    setBusy(false);
  }

  function dictate() {
    const w = window as unknown as {
      webkitSpeechRecognition?: new () => Recog;
      SpeechRecognition?: new () => Recog;
    };
    type Recog = {
      lang: string;
      onresult: ((ev: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
      onend: (() => void) | null;
      start: () => void;
    };
    const SR = w.webkitSpeechRecognition || w.SpeechRecognition;
    if (!SR) {
      setLog((prev) => [...prev, "Lyra: Dictation not available in this browser."]);
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.onresult = (ev) => {
      const said = ev.results[0]?.[0]?.transcript ?? "";
      setMessage((m) => (m ? `${m} ${said}` : said));
    };
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  }

  function exportLog() {
    const blob = new Blob([log.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lyra-log.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-ink text-fg">
      <header className="flex flex-wrap items-center gap-2 border-b border-cyan/40 bg-ink-2 px-3 py-3">
        <p className="font-display text-sm tracking-[0.28em] text-cyan">KIDDO INPUT</p>
        <select
          className="min-h-11 border-2 border-cyan bg-ink px-3 font-display text-xs tracking-widest text-cyan"
          defaultValue="CODEWRITER"
          aria-label="Mode"
        >
          <option>CODEWRITER</option>
        </select>
        <div className="ml-auto flex flex-wrap gap-2">
          <HudChip active={core === "live"} mint={core === "live"}>
            {core === "live" ? "GROK LIVE" : core === "down" ? "GROK DOWN" : "GROK…"}
          </HudChip>
          <HudChip active>SEC CLEARED</HudChip>
          <HudChip>PROTOCOL XLIX</HudChip>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 px-3 py-3">
        {ICONS.map(({ id, Icon, label }) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            onClick={() => id === "shutter" && setCodeOpen((v) => !v)}
            className="flex min-h-11 min-w-11 items-center justify-center border-2 border-cyan text-cyan shadow-hud hover:bg-cyan/10"
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </button>
        ))}
        <HudChip as="button" mint onClick={onOpenNbcm} className="ml-auto">
          NBCM OVERLAY
        </HudChip>
      </div>

      {codeOpen ? (
        <section className="mx-3 mb-3 border-2 border-cyan/70 bg-panel p-4">
          <div
            className="flex min-h-28 cursor-pointer flex-col items-center justify-center border border-dashed border-cyan/50 bg-ink px-4 py-6 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) takeFile(f);
            }}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.onchange = () => {
                const f = input.files?.[0];
                if (f) takeFile(f);
              };
              input.click();
            }}
          >
            <p className="font-display text-sm tracking-wide text-cyan">
              Drop file here or Click to Browse
            </p>
            <p className="mt-1 text-xs text-muted">
              Text files ride with the next Grok send (4k cap)
            </p>
          </div>
          <p className="mt-3 font-display text-xs tracking-widest text-muted">
            {fileName ? fileName : "No file loaded - drop or click above"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p className="font-display text-sm text-cyan">CODE WRITER — type or dictate</p>
            <button
              type="button"
              onClick={dictate}
              className="inline-flex min-h-11 items-center gap-2 border-2 border-cyan px-3 font-display text-xs tracking-widest text-cyan"
            >
              <Mic className="size-4" />
              {listening ? "LISTENING" : "DICTATE"}
            </button>
          </div>
        </section>
      ) : null}

      <div className="mx-3 min-h-24 flex-1 overflow-auto border border-cyan/30 bg-ink-2 p-3 font-display text-sm leading-relaxed">
        {log.map((line, i) => (
          <p key={i} className={line.startsWith("You") ? "text-fg" : "text-mint"}>
            {line}
          </p>
        ))}
        {busy ? <p className="text-muted">Lyra: …</p> : null}
      </div>

      <form
        className="mt-auto border-t border-cyan/40 bg-ink-2 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <label className="sr-only" htmlFor="kiddo-msg">
          Message Kiddo
        </label>
        <div className="flex gap-2">
          <input
            id="kiddo-msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message Lyra (live Grok)…"
            disabled={busy}
            className="min-h-11 flex-1 border-2 border-cyan bg-ink px-3 font-body text-sm text-fg placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-11 min-w-11 items-center justify-center border-2 border-mint bg-mint/15 text-mint disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="size-4" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onOpenNbcm}
            className="min-h-11 border-2 border-cyan font-display text-xs tracking-widest text-cyan"
          >
            ROUTE
          </button>
          <button
            type="submit"
            disabled={busy}
            className="min-h-11 border-2 border-mint bg-mint/10 font-display text-xs tracking-widest text-mint disabled:opacity-50"
          >
            SEND
          </button>
          <button
            type="button"
            onClick={exportLog}
            className="min-h-11 border-2 border-cyan font-display text-xs tracking-widest text-cyan"
          >
            EXPORT
          </button>
        </div>
      </form>
    </div>
  );
}
