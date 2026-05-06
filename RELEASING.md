# Releasing BBG

The N Games launcher checks the latest GitHub release for a new
`BBG-<version>-portable.exe` and downloads it for users.
`electron-updater` (built into the running app) does the same.

## Cut a new release

```bash
npm run release:patch   # 1.0.0 → 1.0.1   (bug fixes)
npm run release:minor   # 1.0.0 → 1.1.0   (new features)
npm run release:major   # 1.0.0 → 2.0.0   (breaking changes)
```

That command bumps `package.json`, commits, tags `v<x.y.z>`, and pushes
the tag. The push triggers `.github/workflows/release.yml`, which:

1. Spins up a Windows runner.
2. Installs deps, builds the Vite frontend.
3. Runs `electron-builder --win portable --publish always`.
4. Creates a GitHub Release named `v<x.y.z>` and uploads
   `BBG-<x.y.z>-portable.exe` to it.

After the workflow finishes (~5 min), the launcher will see the new release.

## Manual trigger

If you want to build a release without a tag bump (e.g. retry a failed
build), use the **Run workflow** button on the
[Actions tab](https://github.com/ktdtech223dev/bbg-black-board-games/actions).
