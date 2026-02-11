/**
 * Generates RELEASE-NOTES.md from conventional commit history.
 * Runs automatically via GitHub Actions on merge to main.
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "..");
const RELEASE_NOTES_PATH = join(ROOT, "RELEASE-NOTES.md");
const MARKER = "<!-- RELEASE_NOTES_START — Do not edit above this line -->";

interface CommitGroup {
  type: string;
  label: string;
  commits: string[];
}

function getLastTag(): string | null {
  try {
    return execSync("git describe --tags --abbrev=0 2>/dev/null", {
      encoding: "utf-8",
    }).trim();
  } catch {
    return null;
  }
}

function getCommitsSince(since: string | null): string[] {
  const range = since ? `${since}..HEAD` : "HEAD";
  try {
    return execSync(`git log ${range} --pretty=format:"%s" --no-merges`, {
      encoding: "utf-8",
    })
      .trim()
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

function categorizeCommits(commits: string[]): CommitGroup[] {
  const groups: Record<string, CommitGroup> = {
    feat: { type: "feat", label: "Features", commits: [] },
    fix: { type: "fix", label: "Bug Fixes", commits: [] },
    perf: { type: "perf", label: "Performance", commits: [] },
    refactor: { type: "refactor", label: "Refactoring", commits: [] },
    docs: { type: "docs", label: "Documentation", commits: [] },
    chore: { type: "chore", label: "Chores", commits: [] },
    test: { type: "test", label: "Tests", commits: [] },
    style: { type: "style", label: "Styling", commits: [] },
  };

  for (const commit of commits) {
    const match = commit.match(/^(\w+)(?:\(.+?\))?:\s*(.+)$/);
    if (match) {
      const [, type, message] = match;
      if (groups[type]) {
        groups[type].commits.push(message);
      }
    }
  }

  return Object.values(groups).filter((g) => g.commits.length > 0);
}

function main() {
  const lastTag = getLastTag();
  const commits = getCommitsSince(lastTag);

  if (commits.length === 0) {
    console.log("No new commits to document.");
    return;
  }

  const groups = categorizeCommits(commits);
  if (groups.length === 0) {
    console.log("No conventional commits found.");
    return;
  }

  const date = new Date().toISOString().split("T")[0];
  let entry = `## ${date}\n\n`;

  for (const group of groups) {
    entry += `### ${group.label}\n`;
    for (const commit of group.commits) {
      entry += `- ${commit}\n`;
    }
    entry += "\n";
  }

  entry += "---\n\n";

  const existing = readFileSync(RELEASE_NOTES_PATH, "utf-8");
  const markerIndex = existing.indexOf(MARKER);

  if (markerIndex === -1) {
    console.error("Marker not found in RELEASE-NOTES.md");
    process.exit(1);
  }

  const before = existing.substring(0, markerIndex + MARKER.length);
  const after = existing.substring(markerIndex + MARKER.length);

  const updated = `${before}\n\n${entry}${after.trimStart()}`;
  writeFileSync(RELEASE_NOTES_PATH, updated);

  console.log(`Release notes updated with ${commits.length} commits.`);
}

main();
