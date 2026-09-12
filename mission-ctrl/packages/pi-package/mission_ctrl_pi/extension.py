"""Secondary harness adapter — wires mission-ctrl hooks and skills for Pi/openspec environments.

Primary surface is the Claude Code plugin (`packages/claude-plugin/`). This module provides
an equivalent adapter for Pi using the same `mission_ctrl_core` library and `.mission/` store.
"""

from __future__ import annotations

from typing import Any, Callable

from .hooks import before_send_hook, session_start_hook
from .skills import (
    intent_add_idea,
    intent_design_approve,
    intent_design_propose,
    intent_init,
    intent_log_feedback,
    intent_next,
    intent_recap,
    intent_spec_create,
    intent_spec_status,
    intent_status,
    intent_triage,
)

MANIFEST: dict[str, Any] = {
    "name": "mission-ctrl",
    "version": "0.1.0",
    "description": "Intent layer for coding sessions — Pi/openspec harness adapter",
    "hooks": {
        "on_session_start": session_start_hook,
        "on_before_send": before_send_hook,
    },
    "skills": {
        "init": intent_init,
        "add-idea": intent_add_idea,
        "triage": intent_triage,
        "spec-create": intent_spec_create,
        "spec-status": intent_spec_status,
        "next": intent_next,
        "status": intent_status,
        # M2b: design-gate skills
        "recap": intent_recap,
        "design-propose": intent_design_propose,
        "design-approve": intent_design_approve,
        # log-feedback-06
        "log-feedback": intent_log_feedback,
    },
}


class Extension:
    """Extension wrapper providing access to skills and hooks."""

    def __init__(self) -> None:
        self.manifest = MANIFEST
        self.skills: dict[str, Callable[..., Any]] = MANIFEST["skills"]
        self.hooks: dict[str, Callable[..., Any]] = MANIFEST["hooks"]

    def get_skill(self, name: str) -> Callable[..., Any] | None:
        return self.skills.get(name)
