# NBCM WAREHOUSE — FORWARD BOX

Staged 2026-09-08. **Bootstrap beside her. Change nothing that already runs.**

This is a new overlay layer. It does **not** replace Kiddo brain, wake, stash, standing orders, live `main.py`/`ui.py`, keys, or CATCH_UP add-ons.

Full protocol: [docs/LOCKS.md](docs/LOCKS.md) · [docs/PRE_APPLY.md](docs/PRE_APPLY.md) · [docs/OPENCODE_ORDER.md](docs/OPENCODE_ORDER.md)

## What you get (after INSTALL, not before)

- **NBCM OVERLAY** drops into **VR floor** (brain + desks). Work view only from a desk click.
- Click **brain** → Lyra core. Click Kiddo / KH4 cores. **Double-click** center to pop.
- Hold-drag orbit, wheel zoom.
- Comms / Ghostwriter / CodeWriter / Studio / Net Runner = live Grok + allowlisted GET. Key never stored in this box.
- Depot **ARMED OFF**.

## Gates (same as CATCH_UP)

| Word | Meaning |
|---|---|
| *(silence)* | box stays staged |
| **PRE-APPLY** | restore point + 2 sim passes + cold relaunch. No live copy. |
| **INSTALL NBCM** | only after both sims green + restore exists |
| **RUN** | only after INSTALL; **KILL DUAL** first if pythonw pair still up |
| **KILL DUAL** | separate word; never implied |

No INSTALL without restore + PASS 1 + PASS 2. No RUN without INSTALL. No keys in any copy.

## KEEP

| Staged | Target | Rule |
|---|---|---|
| `src/components/nbcm-*.tsx` `vr-*.tsx` `lyra-main.tsx` `hud-chip.tsx` `brain-canvas.tsx` | **new** overlay tree | additive |
| `src/lib/lyra.ts` `net-runner.ts` | **new** server fns | no key files |
| `src/routes/index.tsx` | overlay toggle in **new** host | does not rewrite live Kiddo `ui.py` |
| `public/brain.webp` | texture | operator image |
| npm three / r3f / drei / postprocessing | sim/host deps only | free, no keys |

## KICK

HELD_REPLACE, stash `main.py`/`ui.py`, wake-diag, standing_orders, quarantine, secrets, mem0, CI, Mark-L remote, faceplate reverse, dual-PID kill.

## Crash / loss prevention

- Restore snapshot is the only on-spot fix.
- Sim is a **clone**, never the live folder.
- PASS 2 is stop-then-start, not a refresh.
- Fail in sim → stop, restore from snapshot, report. Do not "fix live."
- Live PIDs stay up through pre-apply.
