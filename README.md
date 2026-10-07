**Project & README are WIP**

**FOR STARDANCE REVIEWERS: *THERE IS NO BACKEND YET !!!! THIS IS JUST A UI DESIGN SHIP***

# Crowbit

Open-source privacy-based social media alternative that gives the user full control over their personal data and content visibility.

Crowbit is designed to minimize trust with the server as much as a centralized social media possibly can to prevent any data profiles being built on the user while maintaining convenience for the user.

### Ethics

This project is built on the philosophy that you should not have to trade convenience for privacy.

Crowbit does not collect data for AI training or resale to third parties, and it is designed to completely minimize data collection.

### Crowbit monorepo

This monorepo includes the client app, the server API, and related tooling/configuration:

- [Client app](./client)
- [Server API](./server)
- [Root workspace configuration](./package.json)

## To-do list for everything still waiting on a backend

The client is a working mock: anything below either does nothing yet or only
persists locally.

### Account & auth
- [ ] Signup / login endpoints and session handling
- [ ] Password change/reset
- [ ] Two-factor enforcement
- [ ] Active-sessions device list
- [ ] Account disable and delete

### Posting & feed
- [ ] Post creation, editing, and deletion API
- [ ] Working likes, comments and sharing

### Messaging
- [ ] Real-time E2EE messaging delivery
- [ ] Pinned messages
- [ ] Group DMs
- [ ] Message search
- [ ] Message-request audience enforcement
- [ ] Read receipts, typing indicators, and read-activity enforcement

### Social graph
- [ ] Friend requests (send, accept and decline with inbox buttons included)
- [ ] Follow graph (follower-only messaging, mute filters, and request rules assume it)
- [ ] Block and mute list management plus enforcement
- [ ] Close-friends list management

### Communities & moderation
- [ ] Join / leave enforcement
- [ ] Channel search and channel pins
- [ ] Moderation actions (mute, kick, ban) and message menus

### Profiles & navigation
- [ ] Click-through on community tags, thread/comment authors, and DM avatars

### Settings enforcement
- [ ] Server-side enforcement of visibility, messaging, notification, and voice prefs

### Accessibility & UX finishing
- [ ] Density scaling behind the compact-density toggle
- [ ] High-contrast theme
- [ ] Keyboard-shortcuts dialog

### Customizability
- [ ] Custom profile avatars and banners
- [ ] Custom community icons and banners
- [ ] Custom colors for communities and profiles

### Voice & video
- [ ] Device selection, noise suppression, and echo cancellation wiring
- [ ] Voice and video calls

# Getting Started (development)

### Prerequisites
Before running the application, make sure you have the following installed:
- Node.js (20+)

### Installation

1. Clone the repo

```bash
git clone https://github.com/crowbit-dev/Crowbit
```

2. Install dependencies (run in the root folder)

```bash
npm ci
```
3. Environment

The server exits on boot without a `.env` file. Create a `.env` file in [server/](./server):

```bash
SESSION_SECRET=replace-me-with-a-long-random-string
# Optional:
# PORT=3001
# NODE_ENV=development
```

See [server/src/env.ts](./server/src/env.ts) for more details.

4. Run dev servers (two terminals)

Terminal 1 (client):

```bash
npm run dev
```

Terminal 2 (server):

```bash
npm run server
```

### npm shortcuts

See [package.json](./package.json) for the root workspace scripts.

## Contributing

Open issues with any bugs or errors that you find or to discuss features.

For security reports, refer to the section below.

## Contact

Email [gizzixz@crowbit.dev](mailto:gizzixz@crowbit.dev) for any questions or security reports that can't be disclosed publicly.