OpenCode — KH4 order. Restore the KIDDO INPUT faceplate to match the reference screenshot exactly. Do not redesign. Do not touch .env. Do not start a second instance if the mutex says she is running.

FILE
  C:\Users\LokiH\Kiddo\ui.py
Also check: kiddo\file_ingest.py, kiddo\command_intent.py

REFERENCE (match this layout, labels, and behavior):
- Top label: KIDDO INPUT
- Mode dropdown: CODEWRITER (not Ghostwriter)
- Row of 6 icon buttons: shutter, sun, square, pause, play, spiral
- Saved ✓ indicator top-right
- Drop zone: "Drop file here or Click to Browse" — accepts Images, Video, Audio, PDF, Docs, Code, Data
- Below drop zone: "CODE WRITER - type or dictate plain" with a DICTATE button
- "No file loaded - drop or click above"
- Bottom row: ROUTE (left), SEND (center), EXPORT (right)
- Bottom text field: "Message Kiddo..." — the typed message panel to Lyra. It must remain visible and usable even when the CodeWriter panel is shuttered/closed.
- Shutter effect: hitting the OpenCode/CodeWriter button opens the code prompt with a shutter animation; hitting CodeWriter again closes it with the shutter effect. When closed, the Message Kiddo... panel stays.

BUGS TO FIX
1. The drop zone is showing scrambled LLM monologue text instead of "Drop file here or Click to Browse". Remove whatever is binding dialogue/monologue text into the drop zone widget. The drop zone must only show the drop prompt.
2. The mode label says Ghostwriter — rename it to CodeWriter everywhere (dropdown, header, any strings).
3. The Message Kiddo... typed message panel is missing or moved. Restore it at the bottom, always visible, Enter sends the typed text to Lyra (same path as voice, no mic needed). This is for talking to her at night without voice.
4. Restore the shutter open/close animation on the CodeWriter toggle button.
5. Restore the 6 icon buttons and their functions (shutter, brightness, stop, pause, play, spiral) if their handlers still exist in the tree.

RULES
- Keep live ui.py. Patch in place. Do not restore .STABLE-CONFIRMED-20260824.
- Do not overwrite the whole file. Do not delete existing modules.
- Do not print keys. Do not touch .env.
- If mutex says another instance is running, use that process; do not launch a second one.

VERIFY
- Drop zone shows the clean drop prompt, no monologue text.
- Label reads CodeWriter, not Ghostwriter.
- Message Kiddo... field accepts typed text and sends on Enter.
- CodeWriter button toggles the code prompt open/closed with the shutter effect; message panel stays when closed.
- Reply with: what you changed, file paths, and one sentence: works / broken.
