# LOCKS — never touch

Forward package only. Bootstrap **beside** her. Change **nothing** that already runs.

## Forbidden on live Kiddo

- `config/api_keys.json`, `.env`, `vis.key`, `secrets.bin`, `api_keys.wake-sens-bak*`
- `kiddo/` brain, wake, standing_orders, hardening, mic, avatar
- live `main.py`, `ui.py` (stash@{0} stays parked)
- HELD_REPLACE, CATCH_UP live overlay (already present add-ons stay as-is)
- git: no checkout, pull, push, stash pop/drop, origin rebind
- dual PIDs (pythonw main.py) — do not kill unless operator says **KILL DUAL**
- depot backdoor stays ARMED OFF
- no dummy keys, no key copies into sim or restore except documented vis.key-in-place on restore (never copy vis.key *into* this box)

## This box contains

New overlay files only. Zero secrets. Zero `.env`. Grok key is read at runtime from the **host** env if present; this package never writes it.
