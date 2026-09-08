# BOX 1 — CATCH_UP

Forward add-on only. Do not reverse Lyra.

Full protocol: [LOCKS.md](LOCKS.md) · [OPENCODE_ORDER.md](OPENCODE_ORDER.md)

## State
- HEAD: `8669714` detached (unchanged)
- origin: FatihMakes/Mark-L (ignored, not rebound)
- stash@{0}: parked (`main.py` + `ui.py`) — do not pop/drop
- live PIDs: do not kill unless operator says **KILL DUAL**
- live package path: `_build_next\CATCH_UP\`
- restore: `C:\Users\LokiH\Kiddo\.restore-safety-CATCH_UP-20260908\`
- Kiddo sim PASS 1 + PASS 2: green (22 tests, dry_probe identical, leftover 0)
- keys: never copy `.env` `api_keys.json` `vis.key` `secrets.bin` wake-sens

## KEEP
`tools\ingest`, `tools\chunk`, `tools\budget.py`, `scripts\dry_probe.py`,
`docs\RESOURCE_BUDGET.md`, `lyra-agent\bridge` + lyra package (no mem0),
addon tests. Additive paths only.

## KICK
HELD_REPLACE, stash `main.py`/`ui.py`, `wake.py`, `standing_orders`, actions,
faceplate, secrets, quarantine, snapshots, CI, Mark-L remote.

## Gates
- INSTALL FORBIDDEN until operator says **INSTALL CATCH_UP**
- LAUNCH FORBIDDEN until operator says **RUN**
- **KILL DUAL** is a separate word
- fail → restore from CATCH_UP snapshot only, do not patch live
