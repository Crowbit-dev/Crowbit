**Project & README are WIP**

# Crowbit

An open-source, privacy-first social media alternative that gives users full control over their personal data and content visibility.

**Key ideas:** privacy-by-default, user-owned data, simple moderation controls, and transparent open-source design.

**Privacy Principles**
- Complete control over your data and the right to be forgotten
- No analytics or third-party trackers
- Encryption at rest and in transit

**Repository Layout**
- `client/` — frontend app (Vite + React + TypeScript)
- `server/` — API and backend services
- `client/public/` — static assets served by the client
- `.github/` — CI workflows and Dependabot config

**Quick Start (development)**
Prerequisites: `node` (20+), `npm` (the repo uses `package-lock.json`, so stick to npm).

1. Install dependencies (npm workspaces — one command at the root covers both apps)

```bash
npm ci
```

2. Run dev servers (two terminals, or use the root shortcuts below)

Terminal A (server):

```bash
npm run server
```

Terminal B (client):

```bash
npm run dev
```

Root shortcuts: `npm run dev` (client), `npm run server` (server), `npm run build` (client build), `npm run lint` (client lint), `npm run typecheck` (server typecheck).

The client dev server proxies `/api` to `http://localhost:3001`, so run both halves together.

**Environment**
The server exits on boot without a secret. Create a `.env` file in `server/`:

```bash
SESSION_SECRET=replace-me-with-a-long-random-string
# Optional:
# PORT=3001
# NODE_ENV=development
```

See `server/src/env.ts` for the full list of variables.

**Contributing**
- Open an issue to discuss large changes.
- Fork, create a feature branch, implement changes, then open a pull request.
- Keep changes focused and include tests where applicable.

**Contact & Security**
- For questions or security reports, open an issue or contact the maintainers via the repository or email gizzi@crowbit.dev


Thanks for checking out Crowbit — privacy-first social for people who value control.
