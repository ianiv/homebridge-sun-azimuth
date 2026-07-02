# orchestrate-fix profile — homebridge-sun-azimuth

- **Ticket source:** GitHub issues via `gh issue view <n>` / `gh issue create`. Repo `ianiv/homebridge-sun-azimuth`.
- **Isolation:** git worktrees. Controller runs in a worktree under `.claude/worktrees/`. Fixers get their own isolated worktree (Agent `isolation: "worktree"`), branched from `origin/master`.
- **Build/typecheck gate:** node (v24) + npm (v11) ARE available. No lint/test/build scripts are defined in package.json (only `nodemon.json` for dev auto-restart) and there is no CI. Gate = `npm install` resolves cleanly + `node --check` on changed `.js` files + `node -e "require('./index')"` smoke-loads the plugin.
- **Run/verify harness:** no test suite. Verify pure logic (interval/threshold/altitude computations) with a throwaway node snippet that requires the module or replicates the branch. Full Homebridge integration runtime is not set up here, so end-to-end plugin behavior under Homebridge still needs the user.
- **Code conventions:** minimal comments — no comments explaining why/library behavior; rationale goes in commit/PR (see user memory `feedback-minimal-comments`). Match surrounding CommonJS style. 2-space indent.
- **Ship:** `gh pr create --draft --repo ianiv/homebridge-sun-azimuth --base master`. **Do NOT bump the version (package.json / package-lock.json) and do NOT edit CHANGELOG.md — releases (version + changelog) are handled by a separate workflow driven by the conventional-commit messages. Fix PRs contain only the code change.** Use conventional-commit messages (`fix:` / `feat:` / `chore:`) so the release workflow can pick them up.
- **Agents:** general-purpose (fixer), Explore/general-purpose (reviewer), Plan (planner). No repo-specific agents.
- **NEVER push to master.** origin/master already contains the suncalc 2.0 work (landed directly, user-approved). Branch fresh fixes from it.
