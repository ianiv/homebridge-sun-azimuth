# orchestrate-fix profile — homebridge-sun-azimuth

- **Ticket source:** GitHub issues via `gh issue view <n>` / `gh issue create`. Repo `ianiv/homebridge-sun-azimuth`.
- **Isolation:** git worktrees. Controller runs in a worktree under `.claude/worktrees/`. Fixers get their own isolated worktree (Agent `isolation: "worktree"`), branched from `origin/master`.
- **Build/typecheck gate:** ⚠️ NO node/npm in this environment. `npm run lint` / build cannot run locally. Fixers do manual syntax review only; real `npm install`/lint is deferred to the user. Note this in every PR test plan.
- **Run/verify harness:** none available (no node runtime). Runtime verification is NOT possible in-session; verifier role is limited to static diff review.
- **Code conventions:** minimal comments — no comments explaining why/library behavior; rationale goes in commit/PR (see user memory `feedback-minimal-comments`). Match surrounding CommonJS style. 2-space indent.
- **Ship:** `gh pr create --draft --repo ianiv/homebridge-sun-azimuth --base master`. **Do NOT bump the version (package.json / package-lock.json) and do NOT edit CHANGELOG.md — releases (version + changelog) are handled by a separate workflow driven by the conventional-commit messages. Fix PRs contain only the code change.** Use conventional-commit messages (`fix:` / `feat:` / `chore:`) so the release workflow can pick them up.
- **Agents:** general-purpose (fixer), Explore/general-purpose (reviewer), Plan (planner). No repo-specific agents.
- **NEVER push to master.** origin/master already contains the suncalc 2.0 work (landed directly, user-approved). Branch fresh fixes from it.
