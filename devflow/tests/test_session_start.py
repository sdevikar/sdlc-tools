import json
import os
import subprocess
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPT = os.path.join(ROOT, "scripts", "session_start.py")
MAP = os.path.join(ROOT, "references", "workflow-map.md")


def run(cwd):
    out = subprocess.run(
        [sys.executable, SCRIPT], input=json.dumps({"cwd": cwd}),
        capture_output=True, text=True,
    )
    return out.returncode, out.stdout.strip()


class SessionStartTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.repo = os.path.realpath(self.tmp.name)
        subprocess.run(["git", "init", "-q", "-b", "feat/x", self.repo], check=True)
        os.makedirs(os.path.join(self.repo, ".devflow", "handoffs"))

    def tearDown(self):
        self.tmp.cleanup()

    def write(self, rel, text):
        with open(os.path.join(self.repo, ".devflow", rel), "w") as f:
            f.write(text)

    def output(self):
        code, out = run(self.repo)
        self.assertEqual(code, 0)
        return json.loads(out)

    def test_map_is_short(self):
        with open(MAP) as f:
            self.assertLessEqual(len(f.readlines()), 40)

    def intent(self, name, status, outcomes="- [ ] It ships.", constraints="- No GUI."):
        folder = os.path.join(self.repo, "intent", name)
        os.makedirs(folder)
        with open(os.path.join(folder, "intent.md"), "w") as f:
            f.write(f"# Intent: {name} title\nAuthor: Sam. Status: {status}.\n\n"
                    f"## Problem\n\nSecret problem.\n\n## Proposed outcome\n\n{outcomes}\n\n"
                    f"## Affected users and systems\n\nUsers.\n\n"
                    f"## Constraints\n\n{constraints}\n\n## Open questions\n\nNone.\n")

    def digest(self):
        text = self.output()["hookSpecificOutput"]["additionalContext"]
        with open(MAP) as f:
            head = f.read().strip()
        self.assertTrue(text.startswith(head))
        return text[len(head):]

    def test_no_intent_offers_intent(self):
        data = self.output()
        self.assertIn("offer /devflow:intent once", self.digest())
        self.assertNotIn("systemMessage", data)

    def test_draft_only(self):
        self.intent("dark-mode", "draft")
        digest = self.digest()
        self.assertIn("Draft intents waiting for review: intent/dark-mode/intent.md.", digest)
        self.assertNotIn("It ships", digest)

    def test_accepted_digest(self):
        body = "\n".join(f"- [ ] line {i}" for i in range(10))
        self.intent("ship-it", "Accepted", outcomes=body)
        digest = self.digest()
        for part in ("# Accepted intents (intent/)", "## ship-it title (intent/ship-it/intent.md)", "- [ ] line 7",
                     "(more in the file)", "Constraints:\n- No GUI."):
            self.assertIn(part, digest)
        self.assertNotIn("line 8", digest)
        self.assertNotIn("Secret problem", digest)

    def test_digest_limits_and_skips(self):
        for name in ("a", "b", "c", "d"):
            self.intent(name, "accepted")
        self.intent("old", "done")
        self.intent("no", "rejected: not needed")
        digest = self.digest()
        self.assertIn("## c title", digest)
        self.assertNotIn("## d title", digest)
        self.assertIn("(1 more accepted intents in intent/)", digest)
        self.assertNotIn("old title", digest)
        self.assertNotIn("Draft intents", digest)

    def test_handoff_pointer(self):
        self.write("handoffs/handoff_feat-x_20261112-1400.md",
                   "---\nbranch: feat/x\nstatus: in-progress\nsummary: Hook works.\n"
                   "next: Write the tests.\n---\n")
        data = self.output()
        self.assertEqual(data["systemMessage"].splitlines(), [
            "Last session: Hook works.",
            "Next: Write the tests.",
            "Handoff: .devflow/handoffs/handoff_feat-x_20261112-1400.md. "
            "Run /devflow:pickup to continue.",
        ])
        self.assertTrue(data["hookSpecificOutput"]["additionalContext"]
                        .endswith(data["systemMessage"]))

    def test_no_devflow_folder_prints_nothing(self):
        os.rmdir(os.path.join(self.repo, ".devflow", "handoffs"))
        os.rmdir(os.path.join(self.repo, ".devflow"))
        self.assertEqual(run(self.repo), (0, ""))

    def test_outside_git_repo_prints_nothing(self):
        with tempfile.TemporaryDirectory() as plain:
            self.assertEqual(run(plain), (0, ""))


if __name__ == "__main__":
    unittest.main()
