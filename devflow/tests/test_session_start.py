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

    def test_no_charter_offers_charter(self):
        data = self.output()
        text = data["hookSpecificOutput"]["additionalContext"]
        self.assertTrue(text.startswith("# devflow workflow map"))
        self.assertIn("offer /devflow:charter once", text)
        self.assertNotIn("systemMessage", data)

    def test_charter_digest(self):
        body = "\n".join(f"- [ ] line {i}" for i in range(10))
        self.write("charter.md", f"# Charter\n\n## Goal\n\nShip it.\n\n## Done means\n\n"
                                 f"{body}\n\n## Process\n\nTDD.\n\n## Out of scope\n\n"
                                 "- A GUI.\n\n## Parking lot\n\n- Secret idea.\n")
        text = self.output()["hookSpecificOutput"]["additionalContext"]
        digest = text[text.index("# Charter"):]
        for part in ("Goal:\nShip it.", "Process:\nTDD.", "- A GUI.", "- [ ] line 7",
                     "(more in the file)"):
            self.assertIn(part, digest)
        self.assertNotIn("line 8", digest)
        self.assertNotIn("Secret idea", digest)

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
