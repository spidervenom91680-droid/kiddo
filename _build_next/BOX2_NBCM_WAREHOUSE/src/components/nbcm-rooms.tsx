import { useEffect, useState } from "react";
import {
  BookOpen,
  Brain,
  Clapperboard,
  FolderKanban,
  Globe,
  LayoutGrid,
  ShieldOff,
  Terminal,
  Warehouse,
} from "lucide-react";
import { askLyra } from "@/lib/lyra";
import { netFetch } from "@/lib/net-runner";

export type ZoneId =
  | "map"
  | "control"
  | "studio"
  | "ghost"
  | "code"
  | "aera"
  | "store"
  | "net"
  | "brain";

export const FLOOR: Array<{ id: ZoneId; label: string }> = [
  { id: "map", label: "Floor Map" },
  { id: "control", label: "Master Control" },
  { id: "studio", label: "KH4 Studio" },
  { id: "ghost", label: "Ghostwriter" },
  { id: "code", label: "CodeWriter" },
  { id: "aera", label: "Aeradue" },
  { id: "store", label: "Storage / Tank" },
  { id: "net", label: "Net Runner" },
  { id: "brain", label: "Floating Brain" },
];

export const ZONE_META: Record<
  ZoneId,
  { title: string; body: string; agent: string }
> = {
  map: {
    title: "NBCM WAREHOUSE · THE NEXUS",
    body: "Neo-Babylonian Core Matrix. You are on the floor. Enter a bay. Lyra main is under this glass.",
    agent: "Floor marshal",
  },
  control: {
    title: "MASTER CONTROL",
    body: "KH4 at center. Overhead 3DAI glass. Comms below talk to live Grok.",
    agent: "Command",
  },
  studio: {
    title: "KH4 STUDIO",
    body: "Cyber Screen. Ask Lyra to plate walls and doors.",
    agent: "Design",
  },
  ghost: {
    title: "GHOSTWRITER",
    body: "Narrative desk. Drafts go through live Grok.",
    agent: "Narrative",
  },
  code: {
    title: "CODEWRITER BAY",
    body: "Scratch through live Grok. Faceplate on Lyra main stays hers.",
    agent: "Code",
  },
  aera: {
    title: "AERADUE CORNER",
    body: "Local notes. Wired folders. Not live disk.",
    agent: "Integration",
  },
  store: {
    title: "STORAGE · TRON TANK",
    body: "Left garage door. Tank docked. Depot backdoor stays dark.",
    agent: "Tank",
  },
  net: {
    title: "NET RUNNER",
    body: "Allowlisted public fetch. Live GET. No keys. 1s rate limit.",
    agent: "Net Runner",
  },
  brain: {
    title: "FLOATING BRAIN",
    body: "Core processor. Comms below are live Grok with this zone in context.",
    agent: "Core",
  },
};

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-cyan/50 bg-panel/80 p-4">
      <h2 className="mb-3 font-display text-xs tracking-[0.2em] text-muted">{title}</h2>
      {children}
    </section>
  );
}

function Cell({
  id,
  label,
  onEnter,
}: {
  id: ZoneId;
  label: string;
  onEnter: (id: ZoneId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onEnter(id)}
      className="flex min-h-24 flex-col items-start justify-between border border-cyan/40 bg-ink p-3 text-left hover:border-cyan hover:bg-cyan/10"
    >
      <span className="font-display text-xs tracking-widest text-cyan">{label}</span>
      <span className="font-display text-[0.65rem] text-muted">ENTER</span>
    </button>
  );
}

function StudioBay() {
  const [note, setNote] = useState("");
  const [plate, setPlate] = useState("Waiting on a brief.");
  const [busy, setBusy] = useState(false);

  async function run() {
    const prompt = note.trim();
    if (!prompt || busy) return;
    setBusy(true);
    const res = await askLyra({
      data: { prompt, zone: "studio", mode: "studio", history: [] },
    });
    setPlate(res.ok ? res.text : res.error);
    setBusy(false);
  }

  return (
    <Panel title="BLUEPRINT PLATE · LIVE GROK">
      <div className="mb-3 flex items-center gap-2 text-cyan">
        <Clapperboard className="size-5" />
        <span className="font-display text-xs tracking-widest">CYBER SCREEN</span>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        maxLength={4000}
        placeholder="Describe the room to plate…"
        className="mb-2 w-full border border-cyan bg-ink p-2 text-sm text-fg placeholder:text-muted"
      />
      <button
        type="button"
        disabled={busy}
        onClick={run}
        className="min-h-11 border-2 border-cyan px-4 font-display text-xs tracking-widest text-cyan disabled:opacity-50"
      >
        {busy ? "PLATING…" : "PLATE"}
      </button>
      <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap bg-ink p-3 font-mono text-xs text-fg">
        {plate}
      </pre>
    </Panel>
  );
}

function GhostBay() {
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState("Draft empty.");
  const [busy, setBusy] = useState(false);

  async function run() {
    const prompt = note.trim();
    if (!prompt || busy) return;
    setBusy(true);
    const res = await askLyra({
      data: { prompt, zone: "ghost", mode: "ghost", history: [] },
    });
    setDraft(res.ok ? res.text : res.error);
    setBusy(false);
  }

  return (
    <Panel title="NARRATIVE DESK · LIVE GROK">
      <BookOpen className="mb-2 size-5 text-cyan" />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        maxLength={4000}
        placeholder="Give Ghostwriter a beat…"
        className="mb-2 w-full border border-cyan bg-ink p-2 text-sm text-fg placeholder:text-muted"
      />
      <button
        type="button"
        disabled={busy}
        onClick={run}
        className="min-h-11 border-2 border-mint px-4 font-display text-xs tracking-widest text-mint disabled:opacity-50"
      >
        {busy ? "DRAFTING…" : "DRAFT"}
      </button>
      <p className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap text-sm leading-relaxed text-fg">{draft}</p>
    </Panel>
  );
}

function CodeBay() {
  const [note, setNote] = useState("");
  const [out, setOut] = useState("scratch READY");
  const [busy, setBusy] = useState(false);

  async function run() {
    const prompt = note.trim();
    if (!prompt || busy) return;
    setBusy(true);
    const res = await askLyra({
      data: { prompt, zone: "code", mode: "code", history: [] },
    });
    setOut(res.ok ? res.text : res.error);
    setBusy(false);
  }

  return (
    <Panel title="VM RACK · LIVE GROK">
      <Terminal className="mb-2 size-5 text-cyan" />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        maxLength={4000}
        placeholder="Ask CodeWriter…"
        className="mb-2 w-full border border-cyan bg-ink p-2 font-mono text-sm text-fg placeholder:text-muted"
      />
      <button
        type="button"
        disabled={busy}
        onClick={run}
        className="min-h-11 border-2 border-cyan px-4 font-display text-xs tracking-widest text-cyan disabled:opacity-50"
      >
        {busy ? "RUNNING…" : "RUN"}
      </button>
      <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap bg-ink p-3 font-mono text-xs text-mint">
        {out}
      </pre>
    </Panel>
  );
}

function AeraBay() {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    try {
      setNotes(localStorage.getItem("nbcm-aera") ?? "");
    } catch {
      /* ignore */
    }
  }, []);

  function save(v: string) {
    setNotes(v);
    try {
      localStorage.setItem("nbcm-aera", v);
    } catch {
      /* ignore */
    }
  }

  return (
    <Panel title="WIRED FOLDERS · LOCAL NOTES">
      <FolderKanban className="mb-2 size-5 text-cyan" />
      <ul className="mb-3 space-y-1 font-display text-sm text-fg">
        <li>Aeradue ↔ Obsidian brain</li>
        <li>Kiddo / Lyra project</li>
        <li>KH4 Studio</li>
        <li>Ghostwriter</li>
      </ul>
      <textarea
        value={notes}
        onChange={(e) => save(e.target.value)}
        rows={5}
        maxLength={4000}
        placeholder="Integration notes stay in this browser…"
        className="w-full border border-cyan bg-ink p-2 text-sm text-fg placeholder:text-muted"
      />
    </Panel>
  );
}

function NetBay() {
  const [excerpt, setExcerpt] = useState("Idle. Pick a host.");
  const [busy, setBusy] = useState<string | null>(null);

  async function run(id: string) {
    if (busy) return;
    setBusy(id);
    const res = await netFetch({ data: { id } });
    setExcerpt(res.ok ? `${res.host}\n\n${res.excerpt}` : res.error);
    setBusy(null);
  }

  return (
    <Panel title="ALLOWLIST · LIVE FETCH">
      <Globe className="mb-2 size-5 text-cyan" />
      <div className="space-y-2">
        {[
          ["spacex", "spacex.com"],
          ["nasa", "nasa.gov"],
          ["mdn", "developer.mozilla.org"],
        ].map(([id, label]) => (
          <div key={id} className="flex items-center justify-between gap-2 border border-cyan/30 px-3 py-2">
            <span className="font-display text-sm">{label}</span>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => run(id)}
              className="min-h-11 border border-cyan px-3 font-display text-xs tracking-widest text-cyan disabled:opacity-50"
            >
              {busy === id ? "GET…" : "FETCH"}
            </button>
          </div>
        ))}
      </div>
      <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap bg-ink p-3 font-mono text-xs text-fg">
        {excerpt}
      </pre>
      <p className="mt-2 text-xs text-muted">1 s host rate-limit · 1 MiB max · public GET only</p>
    </Panel>
  );
}

export function RoomView({
  zone,
  onEnter,
}: {
  zone: ZoneId;
  onEnter: (id: ZoneId) => void;
}) {
  if (zone === "map") {
    return (
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Cell id="control" label="MASTER CONTROL" onEnter={onEnter} />
        <Cell id="studio" label="KH4 STUDIO" onEnter={onEnter} />
        <Cell id="ghost" label="GHOSTWRITER" onEnter={onEnter} />
        <Cell id="code" label="CODEWRITER" onEnter={onEnter} />
        <Cell id="aera" label="AERADUE" onEnter={onEnter} />
        <Cell id="store" label="STORAGE / TANK" onEnter={onEnter} />
        <Cell id="net" label="NET RUNNER" onEnter={onEnter} />
        <Cell id="brain" label="FLOATING BRAIN" onEnter={onEnter} />
      </div>
    );
  }

  if (zone === "control") {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <Panel title="3DAI PROJECTOR">
          <p className="font-display text-sm leading-relaxed text-fg">
            N · Neo — evolve
            <br />
            B · Babylonian — structure
            <br />
            C · Core — processor
            <br />
            M · Matrix — interconnect
          </p>
          <p className="mt-3 font-display text-xs text-mint">Callsign: THE NEXUS · NBCM</p>
        </Panel>
        <Panel title="CENTER PROMPT">
          <LayoutGrid className="mb-2 size-5 text-cyan" />
          <p className="text-sm text-muted">
            Use COMMS below. That line is live Grok, zone-aware. LYRA MAIN drops the overlay.
          </p>
        </Panel>
      </div>
    );
  }

  if (zone === "studio") return <StudioBay />;
  if (zone === "ghost") return <GhostBay />;
  if (zone === "code") return <CodeBay />;
  if (zone === "aera") return <AeraBay />;

  if (zone === "store") {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <Panel title="GARAGE DOOR">
          <Warehouse className="mb-2 size-5 text-cyan" />
          <p className="font-display text-sm text-fg">Closed. Left side of the floor.</p>
        </Panel>
        <Panel title="TANK / DEPOT">
          <ShieldOff className="mb-2 size-5 text-warn" />
          <p className="font-display text-sm text-warn">Tank docked. Depot backdoor ARMED OFF.</p>
          <p className="mt-2 text-xs text-muted">No action until explicit order. This bay will not arm itself.</p>
        </Panel>
      </div>
    );
  }

  if (zone === "net") return <NetBay />;

  return (
    <Panel title="CORE THREADS">
      <Brain className="mb-2 size-5 text-mint" />
      <p className="font-display text-sm leading-relaxed text-fg">
        CORE ↔ NEXUS ↔ WWW
        <br />
        Comms below are live Grok with this zone in the system prompt.
      </p>
    </Panel>
  );
}
