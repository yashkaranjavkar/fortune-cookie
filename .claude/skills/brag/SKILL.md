---
name: brag
description: Turn recent work in this repo (commits and uncommitted changes) into brag-document entries — concise, impact-focused accomplishments. Use when the user runs /brag or asks to log wins or update their brag doc.
argument-hint: "[since, e.g. '1 week ago' or a commit hash] (optional)"
---

# /brag — log your wins

Write brag-document entries for the work done in this repo.

## Steps

1. **Pick the range.** If `$ARGUMENTS` is given, use it as the starting point (a date like `2 weeks ago` or a commit hash). Otherwise use the last entry date in `BRAG.md` if it exists, else the last 7 days.
2. **Gather the work:**
   - `git log --since="<range>" --author="$(git config user.name)" --stat --format="%h %ad %s" --date=short` (use `<hash>..HEAD` for a hash)
   - `git status --short` and `git diff --stat` for uncommitted work in progress
   - Skim the relevant diffs in `src/` (skip `build/`, lockfiles and generated assets) to understand what actually changed.
3. **Write entries.** Group related changes into accomplishments, not one bullet per commit. Each entry:
   - Starts with a strong verb (Built, Designed, Shipped, Fixed, Refactored…)
   - Says what was done **and why it matters** — player experience, polish, performance, maintainability
   - Names concrete specifics (components, features, numbers) where they exist
   - Is one or two lines; no fluff, no invented impact
   Mark uncommitted work as *(in progress)*.
4. **Save.** Prepend a new dated section to `BRAG.md` at the repo root (create it with a `# Brag Document` heading if missing):

   ```markdown
   ## 2026-10-10 — Fortune Cookie

   - **Designed** a custom cursor and added walking sounds, making factory navigation feel tactile.
   - ...
   ```

   Never rewrite or delete earlier sections.
5. **Report.** Show the new entries in chat and the range covered.
