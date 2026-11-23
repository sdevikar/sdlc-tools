import json
import os
import subprocess
import sys
import tempfile
import time
import unittest

SCRIPT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "scripts",
    "checkpoint.py",
)


class CheckpointTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.repo = os.path.realpath(self.tmp.name)
        subprocess.run(["git", "init", "-q", "-b", "main", self.repo], check=True)
        self.commit("init")
        os.makedirs(os.path.join(self.repo, ".devflow", "handoffs"))
        self.assertEqual(self.run_hook("--start"), "")
        self.past()

    def tearDown(self):
        self.tmp.cleanup()

    def run_hook(self, *args, active=False, env=None, cwd=None):
        data = {"session_id": "s1", "cwd": cwd or self.repo, "stop_hook_active": active}
        out = subprocess.run(
            [sys.executable, SCRIPT, *args], input=json.dumps(data),
            capture_output=True, text=True, env={**os.environ, **(env or {})},
        )
        self.assertEqual(out.returncode, 0)
        return out.stdout.strip()

    def commit(self, msg):
        subprocess.run(["git", "-C", self.repo, "-c", "user.name=t", "-c",
                        "user.email=t@t", "commit", "-q", "--allow-empty", "-m", msg],
                       check=True)

    def past(self):
        """Move the baseline 10 s back, so files written next are newer."""
        path = os.path.join(self.repo, ".devflow", ".checkpoint", "s1.json")
        with open(path) as f:
            state = json.load(f)
        state["time"] -= 10
        with open(path, "w") as f:
            json.dump(state, f)

    def write(self, rel, text="x"):
        path = os.path.join(self.repo, rel)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            f.write(text)
        return path

    def request(self, out):
        return json.loads(out)["hookSpecificOutput"]["additionalContext"]

    def test_no_signal_asks_nothing(self):
        self.write("src/app.py")
        self.assertEqual(self.run_hook(), "")

    def test_commit_asks_once(self):
        self.commit("work")
        self.assertIn("new commit", self.request(self.run_hook()))
        self.assertEqual(self.run_hook(), "")

    def test_stop_hook_active_asks_nothing(self):
        self.commit("work")
        self.assertEqual(self.run_hook(active=True), "")

    def test_doc_file_asks(self):
        self.write(".devflow/plans/plan.md")
        self.assertIn(".devflow/plans/plan.md", self.request(self.run_hook()))

    def test_handoff_is_not_a_signal(self):
        self.write(".devflow/handoffs/handoff_x_20261123-1000.md")
        self.assertEqual(self.run_hook(), "")

    def test_openspec_archive_and_checked_tasks(self):
        os.makedirs(os.path.join(self.repo, "pkg/openspec/changes/archive/2026-11-23-a"))
        self.write("openspec/changes/b/tasks.md", "- [x] 1.1 done\n- [ x] 1.2 done\n")
        self.write("openspec/changes/c/tasks.md", "- [x] 1.1 done\n- [ ] 1.2 open\n")
        text = self.request(self.run_hook())
        self.assertIn("archived: 2026-11-23-a", text)
        self.assertIn("change b", text)
        self.assertNotIn("change c", text)

    def test_session_handoff_newer_asks_nothing(self):
        self.commit("work")
        time.sleep(1.1)
        self.write(".devflow/handoffs/handoff_x_20261123-1000.md",
                   "---\nsession: s1\n---\n")
        self.assertEqual(self.run_hook(), "")

    def test_start_keeps_baseline(self):
        self.commit("work")
        self.run_hook("--start")
        self.assertIn("new commit", self.request(self.run_hook()))

    def test_kill_switch(self):
        self.commit("work")
        self.assertEqual(self.run_hook(env={"DEVFLOW_CHECKPOINT": "off"}), "")

    def test_outside_git_repo(self):
        with tempfile.TemporaryDirectory() as plain:
            self.assertEqual(self.run_hook(cwd=plain), "")


if __name__ == "__main__":
    unittest.main()
