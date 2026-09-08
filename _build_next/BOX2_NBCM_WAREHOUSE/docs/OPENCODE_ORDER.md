# OPENCODE ORDER — PRE-APPLY NBCM WAREHOUSE (not install, not launch)

Paste and run. STOP when the receipt is written.

```
PRE-APPLY NBCM WAREHOUSE. Same CATCH_UP gates. Forward bootstrap only.

DO NOT:
- INSTALL onto live Kiddo
- RUN / launch live
- KILL DUAL
- stash pop/drop
- git checkout/pull/push/origin rebind
- touch keys (.env, api_keys.json, vis.key, secrets.bin, wake-sens)
- edit kiddo\ brain, wake, standing_orders, live main.py, live ui.py
- copy this overlay over Lyra's existing faceplate files
- write dummy keys

DO:
1) Confirm HEAD 8669714 detached, stash@{0} parked, origin Mark-L ignored.
2) Restore point:
   C:\Users\LokiH\Kiddo\.restore-safety-NBCM-WAREHOUSE-20260908\
   Copy live tree as-is EXCEPT keys/certs. vis.key stays on live, not in snapshot.
   Keys audit on snapshot = 0.
3) Fresh sim tree C:\Users\LokiH\Kiddo\_sim_nbcm\
   Copy live + existing CATCH_UP add-ons + stage this box under _sim_nbcm\_overlay\
   Zero keys in sim.
4) Sim PASS 1: boot overlay in sim only. Overlay → VR. Desk → work → BACK TO VR.
   Brain → core → dbl-click/Esc back. LYRA MAIN. Then FULL STOP sim. leftover = 0.
5) Sim PASS 2: cold relaunch same sim tree. Same checks. Identical. leftover = 0.
6) Write _sim_nbcm\BOX_DROP_RECEIPT.md with HEAD, stash, restore path, both pass results,
   live PIDs still running (do not kill), keys audit 0.
7) STOP. Await operator. INSTALL FORBIDDEN until INSTALL NBCM. LAUNCH FORBIDDEN until RUN.

If any sim fail: restore from the snapshot, do not patch live, report the fail.
```
