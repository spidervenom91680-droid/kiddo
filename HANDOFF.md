# Nexus BRIDGE — handoff

KH4 Engineering. Lyra on the glass. Grok on the wire.

**Repos**

| Node | Repo | Role |
|---|---|---|
| lyra | https://github.com/spidervenom91680-droid/CYBERLYRA- | companion · brains (Python) |
| brie | https://github.com/spidervenom91680-droid/inventions | Nexus BRIDGE (this pack) |
| kiddo | https://github.com/spidervenom91680-droid/kiddo | code rack |

`WIRE.md` is on all three. Owner: `spidervenom91680-droid`.

**Loop**

1. Tell Lyra in Ask anything.
2. Copy `LYRA → GROK` (header includes `WIRE CYBERLYRA- | inventions | kiddo`).
3. Paste that block to Grok.
4. Paste `GROK → LYRA` back so she files it.

---

## 1. Architecture

Home is one column: glass, prompt, banks. Zustand is the helm. Git is the wire. The browser does not talk to GitHub.

```
window (ship viewport)
  3D cyberspace     ← idle (no prompt, no padMsgs)
  markdown pad      ← first keystroke or any packet
prompt (latched -mt-3 to the glass)
1 2 3 4 5           ← 5 runs wirepack
```

Glass + prompt are one flex column. They travel up/down together. Banks sit outside that pair.

```
src/routes/index.tsx                 shell + latch
src/routes/__root.tsx                title: Nexus BRIDGE
src/components/cockpit/CyberCockpit  window switch
src/components/cockpit/ScratchPad    markdown + copy
src/components/cockpit/ButtonPanel   banks
src/components/command/PromptBar     lift / send / + pics
src/components/command/CommandDeck   wrench split (kits)
src/game/CyberScreen3D.tsx           sun + 4 brains
src/lib/game-store.ts                helm
src/lib/wire.ts                      repo channel
src/lib/markdown.tsx                 packets + fences
src/lib/kits.ts                      Kiddo / wirepack / bay
src/styles.css                       ship-window + scanlines
src/lib/og/site.json                 Nexus BRIDGE
```

**Live vs archive**

- Live: window, 3D-in-glass, pad, latched prompt, banks, wire, packets.
- Archive (not mounted on `/`): hangar chair, HoleHall, BuildDesk, TugPilot, Scene.tsx. Still in `src/game/`.

---

## 2. Zustand store (`useGame`)

One `create<GameState>()`. No persist. Side deck writes `scratch` to `localStorage` itself.

Camera/keys are **not** in Zustand. They live in `src/game/sim.ts` (mutable). `start()` / `enterBridge()` call `toCockpit()`.

### Live cluster (Nexus BRIDGE)

| Field | Job |
|---|---|
| `prompt` / `promptUp` | textarea + lift |
| `padMsgs[]` | `{ id, role: "you" \| "lyra", md }` cap 40 |
| `pics[]` | object URLs from `+`, cap 8 |
| `bank` | 0–3 tint 3D; 4 → `runKit("wirepack")` |
| `working` | glass has gone black / pad live |
| `split` / `padTab` / `scratch` / `activeKit` | wrench deck |
| `log[12]` | ticker |

### Archive cluster (hangar)

`view`, `room`, `modules`, `welding`, `weldT`, `nearStation`, `launched`, `touch`, `deskTool`, `ink`, `marks`, `lookLock`, `curtain`, `cyberScreen`.

### Hot path — `sendPrompt`

- Empty → `promptUp: false` only (drop the lift).
- Else `isGrokReply(line)`:
  - ask → Lyra emits fenced `LYRA → GROK` + `wireHeader()`
  - paste → she files the body
- One `set`: clear prompt, drop lift, two PadMsgs, mirror `scratch`, stamp log.

`pushPad(role, md)` is how the wire kit lands on the glass.

`useGame.getState()` for writes. Never subscribe to actions.

---

## 3. Zustand selectors (performance)

Rerender only when the **selector return** changes (`Object.is`).

```ts
useGame()                      // whole store — every set() paints. don’t.
useGame((s) => s.bank)         // primitive — this is the pattern
useGame.getState().sendPrompt() // writes, zero subscription
```

On each keystroke (`setPrompt`):

| Component | Selector | Renders? |
|---|---|---|
| PromptBar | prompt, pics, promptUp | yes (input) |
| ScratchPad | padMsgs, pics, prompt | yes (ghost line) |
| CyberCockpit | prompt, padMsgs | yes (onPad uses length) |
| ButtonPanel | bank | no |
| Home | split | no |

Traps we did not take:

- `useGame((s) => ({ prompt: s.prompt, pics: s.pics }))` — new object every time → always rerender.
- `useGame((s) => s.sendPrompt)` in render — use `getState()` instead.

Tighter glass switch (optional later):

```ts
useGame((s) => s.prompt.length > 0 || s.padMsgs.length > 0)
```

After the first letter `true === true` and the window chrome would stop painting. ScratchPad still needs `prompt` for the ghost.

3D: `CyberScreen3D` selects `working` and `bank` only. `useFrame` is 60fps and does not go through Zustand.

Caps: log 12, padMsgs 40, pics 8, marks ~140.

---

## 4. Packet format

Outbound (Lyra → you → Grok):

```
LYRA → GROK
WIRE CYBERLYRA- | inventions | kiddo

<need>
```

Inbound (Grok → you → Lyra). She detects `GROK → LYRA` or `GROK:` and files the body.

Code fences on the pad have **Copy to Grok**.

Enter sends. Shift+Enter newline. Click prompt → box grows, window rides up. Send → both drop, latched.

---

## 5. Banks

1–4: 3D accent (`#ff2bd6` `#00ffe0` `#b14dff` `#f0c14a`).
5: `runKit("wirepack")` — drops KH4 WIRE markdown onto the pad.

---

## 6. Archive 3D (still in tree)

Keep these. Do not delete on handoff.

```
src/game/Scene.tsx
src/game/Bridge.tsx          locked chair, desk, computer, hole hall
src/game/BuildDesk.tsx
src/game/CyberComputer.tsx
src/game/HoleHall.tsx
src/game/HoloInterface.tsx
src/game/TugPilot.tsx
src/game/HangarWorld.tsx
src/game/StarshipBrie.tsx
src/game/Cyberspace.tsx      hangar-scale sun (y=72)
src/game/sim.ts              lookYaw / dolly / lookLock
src/game/stations.ts
docs/nexus-cockpit-math.md
screenshots/bridge-idle.png
screenshots/bridge-zoom.png
screenshots/bridge-helm.png
```

Home does **not** mount `Scene`. Remount via a kit if you want the chair back.

---

## 7. Kit list (`src/lib/kits.ts`)

Lyra: Kiddo Code, Prompt Rack, Memory, Forensic, **Wire**.
Bay: Weld hull/drive/grid/core, Commit Launch.
Deck: Helm, Starship Bay, Nexus Lab, Control, Cyberspace.
Desk: Draw, Blocks, Wire (rings), Wipe Pad.

---

## 8. How to continue

1. Preview is the live BRIDGE.
2. Source of truth for this pack: `inventions/starship-brie/`.
3. Pull a node with Grok’s GitHub connector; do not put tokens in the app.
4. Next work: paste a `LYRA → GROK` block. Reply `GROK → LYRA`. She files it.

---

## 9. File checklist (this pack)

```
HANDOFF.md                 this document
WIRE.md                    same file on all three repos
BUILD.md                   short map
MATH.md                    chair / lookLock math (archive)
src/                       live + archive source
public/nexus/cyber.jpg
public/nexus/nave.jpg
screenshots/bridge-*.png
```
