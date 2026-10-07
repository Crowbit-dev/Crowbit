#!/bin/bash
# Vercel Ignored Build Step for the client project.
# Exit 0 tells Vercel to SKIP the deployment; anything else builds as normal.
# A build proceeds when the deploy commit touches the client bundle inputs:
# everything under client/ plus the root dependency manifests (a hoisted
# dependency bump can change the bundle even when client/ is untouched).
# When in doubt (no git repo, shallow history), fall through to building.
set -u

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 1
git -C "$ROOT" rev-parse --verify HEAD^ >/dev/null 2>&1 || exit 1
git -C "$ROOT" diff --quiet HEAD^ HEAD -- client/ package.json package-lock.json
