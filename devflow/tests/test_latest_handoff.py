import json
import os
import subprocess
import sys
import tempfile
import unittest

SCRIPT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "scripts",
    "latest_handoff.py",
)


def run(cwd, *args, stdin=""):
    out = subprocess.run(
        [sys.executable, SCRIPT, *args],
        cwd=cwd, input=stdin, capture_output=True, text=True,
    )
    return out.returncode, out.stdout.strip()


class LatestHandoffTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.repo = os.path.realpath(self.tmp.name)
        git = ["git", "-C", self.repo, "-c", "user.name=t", "-c", "user.email=t@t"]
        subprocess.run(["git", "init", "-q", "-b", "feat/x", self.repo], check=True)
        subprocess.run(git + ["commit", "-q", "--allow-empty", "-m", "init"], check=True)
        self.folder = os.path.join(self.repo, "docs", "handoffs")
        os.makedirs(self.folder)
        self.write("0900", "in-progress")
        self.write("1400", "in-progress", next_step="Write the tests.")
        self.write("1600", "done")

    def tearDown(self):
        self.tmp.cleanup()

    def write(self, hhmm, status, branch="feat/x", next_step="Keep going"):
        path = os.path.join(self.folder, f"handoff_feat-x_20261112-{hhmm}.md")
        with open(path, "w") as f:
            f.write(f"---\nbranch: {branch}\nhead: abc\nbase: main\npr:\n"
                    f"status: {status}\nnext: {next_step}\n---\n\n# Handoff\n")
        return path

    def test_newest_open_handoff(self):
        code, out = run(self.repo)
        self.assertEqual(code, 0)
        self.assertEqual(out, os.path.join(self.folder, "handoff_feat-x_20261112-1400.md"))

    def test_hook_mode_prints_pointer(self):
        code, out = run(os.getcwd(), "--hook", stdin=json.dumps({"cwd": self.repo}))
        self.assertEqual(code, 0)
        data = json.loads(out)
        line = data["systemMessage"]
        self.assertIn("docs/handoffs/handoff_feat-x_20261112-1400.md", line)
        self.assertIn("Next: Write the tests. Run", line)
        self.assertIn("/devflow:pickup", line)
        self.assertEqual(data["hookSpecificOutput"]["additionalContext"], line)

    def test_other_branch_prints_nothing(self):
        subprocess.run(["git", "-C", self.repo, "switch", "-q", "-c", "feat/y"], check=True)
        self.assertEqual(run(self.repo), (0, ""))
        self.assertEqual(run(self.repo, "--hook", stdin=json.dumps({"cwd": self.repo})), (0, ""))

    def test_outside_git_repo_prints_nothing(self):
        with tempfile.TemporaryDirectory() as plain:
            self.assertEqual(run(plain, "--hook", stdin=json.dumps({"cwd": plain})), (0, ""))


if __name__ == "__main__":
    unittest.main()
