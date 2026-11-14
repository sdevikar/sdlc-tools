"""Post-skill hook: regenerate `AGENTS.md` and `intent/intent.md` from versioned Jinja2 templates.

Runs after any `.mission/` write (via the `sync_after_write` decorator applied
to the write skills). All user-supplied text is sanitized before rendering;
prompt-injection patterns raise `SanitizationError`.
"""

from __future__ import annotations

import functools
import re
from pathlib import Path
from typing import Any, Callable

from jinja2 import Environment, FileSystemLoader, StrictUndefined
from mission_ctrl_core.logic.planner import suggest_next
from mission_ctrl_core.models import Bucket, SpecStatus
from mission_ctrl_core.stores import IntentStore

TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates"
TEMPLATE_NAME = "agents_md.jinja2"
INTENT_MD_TEMPLATE_NAME = "intent_md.jinja2"
AGENTS_MD_FILENAME = "AGENTS.md"
INTENT_DIR = "intent"
INTENT_MD_FILENAME = "intent.md"


class SanitizationError(ValueError):
    """A user-supplied field contains a prompt-injection pattern."""


_FENCED_WITH_LANG = re.compile(r"```\w")
_HEADING_LEAD = re.compile(r"(?m)^(\s*)#{1,6}(?=\s)")
_MD_CHARS = re.compile(r"([`\[\]])")


def sanitize_field(value: str | None) -> str:
    """Escape Markdown metacharacters in user-supplied text.

    Raises `SanitizationError` on the primary prompt-injection vectors:
    HTML comment markers and fenced code blocks with a language identifier.
    Otherwise escapes heading markers, backticks, and square brackets so the
    text cannot be interpreted as headings, code fences, or link definitions.
    """
    if not value:
        return ""
    if "<!--" in value or "-->" in value:
        raise SanitizationError("HTML comment markers are not allowed")
    if _FENCED_WITH_LANG.search(value):
        raise SanitizationError(
            "fenced code blocks with a language identifier are not allowed"
        )
    text = _HEADING_LEAD.sub(r"\1\\#", value)
    return _MD_CHARS.sub(r"\\\1", text)


def _mvp_progress(store: IntentStore) -> tuple[int, int, list[dict[str, Any]]]:
    mvp = store.mvp.read()
    done_specs = {n.id for n in store.specs.read().nodes if n.status is SpecStatus.DONE}
    items = []
    completed = 0
    for item in mvp.items:
        done = bool(item.linked_specs) and all(
            s in done_specs for s in item.linked_specs
        )
        completed += done
        items.append({"title": sanitize_field(item.title), "done": done})
    return completed, len(mvp.items), items


def render_agents_md(store: IntentStore) -> str:
    """Render the `AGENTS.md` body for the current store state (no writes)."""
    nodes = store.specs.read().nodes
    focus = next((n for n in nodes if n.status is SpecStatus.IN_PROGRESS), None)
    if focus is None:
        current_focus = "none (no spec in progress)"
    else:
        current_focus = (
            f"{focus.id} — {sanitize_field(focus.title)} [{focus.status.value}]"
        )
    env = Environment(
        loader=FileSystemLoader(TEMPLATE_DIR),
        undefined=StrictUndefined,
        autoescape=False,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    mvp_done, mvp_total, mvp_items = _mvp_progress(store)
    return env.get_template(TEMPLATE_NAME).render(
        mission_statement=sanitize_field(store.mission.read().statement),
        mvp_version=store.mvp.read().version,
        mvp_done=mvp_done,
        mvp_total=mvp_total,
        mvp_items=mvp_items,
        constraints=[
            {"severity": c.severity.value, "rule": sanitize_field(c.rule)}
            for c in store.constraints.read().constraints
        ],
        current_focus=current_focus,
        next_up=[
            {"id": s.spec_id, "title": sanitize_field(s.title), "detail": s.reason}
            for s in suggest_next(store)
        ],
        backlog={
            "mvp_critical": len(store.backlog.search(bucket=Bucket.MVP_CRITICAL)),
            "parked": len(store.backlog.search(bucket=Bucket.PARKED)),
            "untriaged": len(store.backlog.search(bucket=Bucket.UNTRIAGED)),
        },
    )


def write_agents_md(store: IntentStore, root: Path | str | None = None) -> Path:
    """Render and write `AGENTS.md` next to `.mission/`; returns its path."""
    path = (Path(root) if root is not None else store.root) / AGENTS_MD_FILENAME
    path.write_text(render_agents_md(store), encoding="utf-8")
    return path


def render_intent_md(store: IntentStore) -> str:
    """Render `intent/intent.md` body for the current store state (no writes)."""
    nodes = store.specs.read().nodes
    focus = next((n for n in nodes if n.status is SpecStatus.IN_PROGRESS), None)
    current_focus = (
        f"{focus.id} — {sanitize_field(focus.title)} [{focus.status.value}]"
        if focus
        else "none (no spec in progress)"
    )
    untriaged = store.backlog.search(bucket=Bucket.UNTRIAGED)
    mvp_done, mvp_total, mvp_items = _mvp_progress(store)
    env = Environment(
        loader=FileSystemLoader(TEMPLATE_DIR),
        undefined=StrictUndefined,
        autoescape=False,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    return env.get_template(INTENT_MD_TEMPLATE_NAME).render(
        project_name=sanitize_field(store.root.name),
        mission_statement=sanitize_field(store.mission.read().statement),
        mvp_version=store.mvp.read().version,
        mvp_done=mvp_done,
        mvp_total=mvp_total,
        mvp_items=mvp_items,
        constraints=[
            {"severity": c.severity.value, "rule": sanitize_field(c.rule)}
            for c in store.constraints.read().constraints
        ],
        open_questions=[sanitize_field(i.title) for i in untriaged],
        current_focus=current_focus,
    )


def write_intent_md(store: IntentStore, root: Path | str | None = None) -> Path:
    """Render and write `intent/intent.md` under project root; returns its path."""
    project_root = Path(root) if root is not None else store.root
    intent_dir = project_root / INTENT_DIR
    intent_dir.mkdir(parents=True, exist_ok=True)
    path = intent_dir / INTENT_MD_FILENAME
    path.write_text(render_intent_md(store), encoding="utf-8")
    return path


def sync_after_write(
    func: Callable[..., Any],
) -> Callable[..., Any]:
    """Decorator for write skills: regenerate `AGENTS.md` and `intent/intent.md` after the write."""

    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        result = func(*args, **kwargs)
        store = kwargs.get("store")
        if not isinstance(store, IntentStore):
            store = next((a for a in args if isinstance(a, IntentStore)), None)
        if store is None:
            # CLI path: store was created inside the skill from the `root` kwarg.
            # The skill already succeeded so .mission/ exists — resolve it now.
            store = IntentStore(kwargs.get("root", "."))
        write_agents_md(store)
        write_intent_md(store)
        return result

    return wrapper
