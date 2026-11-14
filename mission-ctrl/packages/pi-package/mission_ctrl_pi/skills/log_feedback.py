from __future__ import annotations

from pathlib import Path

from mission_ctrl_core.models import Actor, SessionRef
from mission_ctrl_core.stores import IntentStore

from ..schemas import LogFeedbackInput, LogFeedbackResult
from .common import get_store, require_initialized


def intent_log_feedback(
    input: LogFeedbackInput,
    store: IntentStore | None = None,
    root: Path | str = ".",
    actor: Actor | None = None,
    session: SessionRef | None = None,
) -> LogFeedbackResult:
    st = get_store(store, root)
    require_initialized(st)

    act = actor or Actor(type="human", name="developer")
    ses = session or SessionRef(id="ses_0001")
    event = st.builder().feedback_logged(
        category=input.category,
        description=input.description,
        severity=input.severity,
        related_spec_id=input.related_spec_id,
        actor=act,
        reasoning=f"Feedback [{input.severity}] {input.description[:80]}",
        session=ses,
    )
    return LogFeedbackResult(event_id=event.event_id)
