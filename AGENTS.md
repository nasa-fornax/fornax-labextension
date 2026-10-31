# fornax-labextension

A JupyterLab 4 extension for the NASA Fornax science platform. Adds a Fornax menu, navigation commands, launcher items, custom file viewers, a docs search widget, keep-alive session management, and a server-side CPU activity tracker that prevents idle culling.

## Project structure

- `src/` — TypeScript frontend (JupyterLab extension)
  - `index.ts` — Plugin entry point, activates all features
  - `commands.ts` — Navigation commands, launcher items, custom web tabs, save override
  - `handler.ts` — Server API request helpers
  - `search.ts` — Docs search widget for the top menu bar
  - `__tests__/` — Jest unit tests
- `fornax_labextension/` — Python server extension
  - `__init__.py` — Extension registration and server extension loader
  - `activity.py` — CPU-based activity tracker (prevents idle culling)
- `schema/plugin.json` — Menu structure definition (Fornax menu items)
- `style/` — CSS and SVG assets
- `ui-tests/` — Playwright integration tests

## Tech stack

- **Frontend**: TypeScript, JupyterLab 4 APIs (`@jupyterlab/*`, `@lumino/widgets`)
- **Backend**: Python 3.10+, `jupyter_server`, `jupyter_keepalive`, Tornado, psutil
- **Build**: `hatch` + `jupyter-builder` (Python), `jlpm` (JS/TS)
- **Tests**: Jest (unit), Playwright/Galata (integration)

## Development commands

```bash
# Install in dev mode (first time)
python -m venv .venv && source .venv/bin/activate
pip install --editable "."
jupyter-builder develop . --overwrite

# Build after changes
jlpm build

# Watch mode (auto-rebuild)
jlpm watch

# Run JupyterLab
jupyter lab

# Run tests
jlpm test

# Lint
jlpm run lint:check
```

## Environment variables

- `JUPYTER_CPU_ALIVE_PERCENT_MIN` — CPU threshold for activity detection (default: 70)
- `JUPYTER_CPU_ALIVE_INTERVAL` — Activity check interval in seconds (default: 300)

## CI

GitHub Actions runs lint, tests, and build on every PR. See `.github/workflows/build.yml`.

## Key conventions

- Copyright: University of Maryland
- License: BSD-3-Clause
- Menu items and commands are defined in `schema/plugin.json` and registered in `commands.ts`
- The plugin ID is `fornax-labextension:plugin`
- Hub URLs (`hub/home`, `hub/logout`, `hub/spawn`) are forced to open in `_top` target
