
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
- `public/` — static assets served by the client

**Quick Start (development)**
Prerequisites: `node` (16+), `npm` or `pnpm`.

1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

2. Run dev servers (two terminals)

Terminal A (server):
```bash
cd server
npm run dev
```

Terminal B (client):
```bash
cd client
npm run dev
```

If `dev` scripts differ, use the appropriate `start` / `serve` script defined in each `package.json`.

**Environment**
- See `server/src/env.ts` for environment variables used by the server. Create a `.env` file in `server/` with the required keys before running.

**Contributing**
- Open an issue to discuss large changes.
- Fork, create a feature branch, implement changes, then open a pull request.
- Keep changes focused and include tests where applicable.

**Contact & Security**
- For questions or security reports, open an issue or contact the maintainers via the repository or email gizzixz@gmail.com


Thanks for checking out Crowbit — privacy-first social for people who value control.
