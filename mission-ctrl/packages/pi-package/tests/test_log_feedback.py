from __future__ import annotations

import json
from pathlib import Path

import pytest
from mission_ctrl_core.models import FeedbackLoggedDecision
from mission_ctrl_core.stores import IntentStore
from mission_ctrl_pi.schemas import InitInput, LogFeedbackInput
from mission_ctrl_pi.skills import intent_init, intent_log_feedback


@pytest.fixture
def initialized_store(tmp_path):
    st = IntentStore(tmp_path)
    intent_init(InitInput(project_name="FeedbackTest", mission="Test mission"), store=st)
    return st


def test_feedback_logged_decision_valid():
    d = FeedbackLoggedDecision(
        category="bug",
        description="recap always fires in full mode",
        severity="polish",
    )
    assert d.category == "bug"
    assert d.related_spec_id is None


def test_feedback_logged_decision_rejects_bad_category():
    with pytest.raises(Exception):
        FeedbackLoggedDecision(
            category="typo",
            description="something",
            severity="backlog",
        )


def test_read_feedback_filters_correctly(initialized_store):
    st = initialized_store
    # write one feedback event and one non-feedback event via add-idea
    from mission_ctrl_pi.schemas import AddIdeaInput
    from mission_ctrl_pi.skills import intent_add_idea

    intent_add_idea(AddIdeaInput(title="some idea"), store=st)
    intent_log_feedback(
        LogFeedbackInput(
            category="ux",
            description="button is confusing",
            severity="polish",
        ),
        store=st,
    )

    feedback = st.meta.read_feedback()
    assert len(feedback) == 1
    assert feedback[0].event_type == "FEEDBACK_LOGGED"
    assert feedback[0].decision.category == "ux"


def test_log_feedback_skill_writes_only_meta_jsonl(initialized_store):
    st = initialized_store
    files_before = {p: p.stat().st_mtime for p in st.intent_dir.iterdir() if p.is_file()}

    result = intent_log_feedback(
        LogFeedbackInput(
            category="recap_verbosity",
            description="too verbose",
            severity="backlog",
            related_spec_id="spec_001",
        ),
        store=st,
    )

    assert result.status == "logged"
    assert result.event_id.startswith("evt_")

    files_after = {p: p.stat().st_mtime for p in st.intent_dir.iterdir() if p.is_file()}
    changed = {p for p, t in files_after.items() if files_before.get(p) != t}
    assert changed == {st.meta.path}, f"unexpected files changed: {changed}"

    # verify jsonl content
    last_line = st.meta.path.read_text().strip().splitlines()[-1]
    event = json.loads(last_line)
    assert event["event_type"] == "FEEDBACK_LOGGED"
    assert event["decision"]["category"] == "recap_verbosity"
    assert event["decision"]["related_spec_id"] == "spec_001"
