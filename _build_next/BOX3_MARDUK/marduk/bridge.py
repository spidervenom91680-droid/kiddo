"""Marduk import-only bridge. Does not patch recall-clock or live Kiddo."""

from pathlib import Path

ROOT = Path(__file__).resolve().parent


def load_index() -> str:
    p = ROOT / "MEMORY.md"
    return p.read_text(encoding="utf-8") if p.exists() else ""


def load_persona() -> str:
    p = ROOT / "PERSONA.md"
    return p.read_text(encoding="utf-8") if p.exists() else ""
