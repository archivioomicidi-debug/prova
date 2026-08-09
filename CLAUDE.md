# CLAUDE.md

Guidance for Claude Code and other AI assistants working in this repository.

## Repository status: empty scaffold

**As of the latest commit (`ceb2977` "Initial commit"), this repository contains no
source code.** The complete file listing is:

```
.
├── .git/
├── CLAUDE.md   # this file
└── README.md   # single line: "# prova"
```

There is no build system, no dependency manifest (no `package.json`, `pyproject.toml`,
`go.mod`, `Cargo.toml`, `pom.xml`, …), no test suite, no linter or formatter config, no
CI workflows, and no `.gitignore`.

Practical consequences for an assistant working here:

- **Do not assume a stack.** Nothing in the repo implies a language, framework, or
  runtime. The name `prova` ("test"/"trial" in Italian) suggests a sandbox or
  experimentation repo.
- **There are no build, test, or lint commands to run.** Do not invent them, and do not
  report a build or test as passing when nothing was executed.
- **Verify before you describe.** This file is the state at the time it was written. Run
  `ls -la` and `git log --oneline -5` at the start of a session to confirm nothing has
  landed since. If code exists, the "To fill in" sections below are stale — update them.

## Repository facts

| | |
|---|---|
| Remote | `https://github.com/archivioomicidi-debug/prova` |
| Default branch | `main` |
| History | single commit, `ceb2977` |
| Working directory | `/home/user/prova` |

## Git workflow

Branch naming follows the pattern already present on the remote:
`claude/<short-kebab-case-topic>-<suffix>` (e.g. `claude/claude-md-docs-7fsbl6`).

Conventions to follow:

- Never commit directly to `main`. Create or check out a feature branch first.
- Push with `git push -u origin <branch-name>`.
- On network failure, retry the push with exponential backoff (2s, 4s, 8s, 16s) rather
  than switching branches or force-pushing.
- Write imperative, descriptive commit messages ("Add user auth middleware", not
  "changes").
- Open a pull request only when explicitly asked.
- If the PR for a branch has already merged, do not stack new commits on the merged
  history — restart the branch from the latest `main`
  (`git fetch origin main && git checkout -B <branch> origin/main`), preserving any
  unmerged commits by rebasing them onto the new base.

## Working conventions

Until the repo has a real stack, apply these defaults:

- **Match the surrounding code.** Once files exist, mirror their naming, comment density,
  indentation, and idioms instead of importing conventions from elsewhere.
- **Prefer the smallest change that does the job.** This is a sandbox repo; avoid
  introducing frameworks, build tooling, or dependency trees that the task did not ask
  for.
- **Add tooling deliberately, not incidentally.** If a task genuinely requires a package
  manager, test runner, or CI workflow, introduce it as an explicit, visible part of the
  change and record it in the sections below — don't let it appear as a side effect.
- **Keep `README.md` truthful.** It currently says nothing beyond the project name; if
  real code lands, the README should describe what the project is and how to run it.

## To fill in when code lands

These sections are intentionally empty because there is nothing to document yet. The
first substantive change to this repository should replace the corresponding placeholder
rather than leaving it blank.

### Architecture

_No source code exists. Document the module layout, entry points, and the data/control
flow between major components once they exist._

### Commands

_No build, test, lint, or run commands exist. Record the exact invocations here (install,
build, test, single-test, lint, format, dev server) as soon as tooling is added._

### Testing

_No test suite or framework exists. Record the framework, where tests live, the naming
convention, and how to run a single test._

### Code style

_No linter, formatter, or style config exists. Record formatting rules, import ordering,
type-checking strictness, and naming conventions once they are established._

### CI

_No CI workflows exist under `.github/workflows/`. Record which checks gate a merge and
how to reproduce them locally._
