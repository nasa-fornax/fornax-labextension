---
name: test
description: Run unit tests, integration tests, or both for the fornax-labextension
user_invocable: true
---

# Test skill

Run tests for the fornax-labextension project.

## Instructions

Parse the user's request to determine which tests to run. Default to unit tests if unspecified.

### Unit tests (Jest)

From the project root:

```bash
jlpm test
```

To run a specific test file:

```bash
npx jest --testPathPattern <pattern>
```

### Integration tests (Playwright/Galata)

From the `ui-tests/` directory:

```bash
cd ui-tests
jlpm playwright test
```

To run a specific integration test:

```bash
cd ui-tests
jlpm playwright test <pattern>
```

**Note:** Integration tests require JupyterLab running on `localhost:8888`. If it's not running, start it first with `jlpm start` from `ui-tests/`.

### Lint

```bash
jlpm run lint:check
```

### All checks

Run unit tests, lint, and build (mirrors CI):

```bash
jlpm run lint:check
jlpm test
jlpm build
```

## Reporting

After running tests, report:
1. How many tests passed/failed
2. Any failure details with file and test name
3. Suggest fixes if failures are obvious
