# PRE-APPLY — restore + two sims + relaunch (no live apply)

Same CATCH_UP protocol. Do this **before** anyone says INSTALL NBCM.

## 0. Hold

HEAD stays detached `8669714`. origin Mark-L ignored. stash@{0} parked. live PIDs untouched. keys untouched.

## 1. Restore point (on-spot fix source)

Copy **live tree as-is** to:

`C:\Users\LokiH\Kiddo\.restore-safety-NBCM-WAREHOUSE-20260908\`

Include: `main.py`, `ui.py`, `kiddo\`, `config\` **minus** `api_keys.json` and `certs\` (leave `vis.key` in place on live; do not copy it into the snapshot). Copy this box's README into the snapshot as `README-NBCM.md`.

Keys audit after copy: **0** (`api_keys.json`, `.env`, `secrets.bin`, `vis.key`, wake-sens all absent from snapshot). If a bak sneaks in, purge it from the snapshot only.

If anything later fails, restore **only** from this folder. Do not invent a third tree.

## 2. Simulator tree (fresh, not live)

Build `C:\Users\LokiH\Kiddo\_sim_nbcm\` as a **copy of live 8669714 + CATCH_UP add-ons already present + this box copied under `_sim_nbcm\_overlay\`**.

Never copy keys into sim. Never overlay onto `C:\Users\LokiH\Kiddo\` itself.

## 3. Sim PASS 1

From the sim tree only:

1. Keys audit: 0 secrets.
2. Import/boot the overlay process in sim (not `main.py` live). If Node overlay: install deps **in sim only**, start, hit `/`, click NBCM OVERLAY, confirm VR canvas.
3. Work desk click → work view → BACK TO VR.
4. Brain click → core. Esc / double-click core → previous.
5. LYRA MAIN returns to faceplate in sim.
6. **Close the sim process fully.** Confirm **zero leftover sim python/node**.

Record: imports, any tests, leftover process count = 0.

## 4. Sim PASS 2 (cold relaunch)

Delete leftover sim processes if any (sim only). Cold-start the **same** `_sim_nbcm\` tree. Repeat step 3. Bytes/behavior must match PASS 1 (no flake, no new fail). Close again. Zero leftover sim processes.

Relaunch rule: PASS 2 is a **stop then start**, not a refresh of PASS 1.

## 5. Report back — then STOP

Return to Grok:

- restore path + file count + keys audit 0
- PASS 1 + PASS 2 results
- HEAD still `8669714`
- stash@{0} parked
- live PIDs untouched
- **no INSTALL, no RUN, no git**

Live apply stays gated on **INSTALL NBCM**. Launch stays gated on **RUN** (and **KILL DUAL** first if dual pythonw still up).
