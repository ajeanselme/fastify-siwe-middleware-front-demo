# SIWE Middleware Front Demo

This project is a browser-based demo for a Fastify SIWE authentication flow. It walks through the full sign-in lifecycle from wallet connection to nonce retrieval, SIWE message signing, token inspection, refresh rotation, and logout.

The UI is intentionally interactive and educational: each step explains what the client is doing and what the server is expected to verify on the backend.

## What It Demonstrates

- Connect an EIP-1193 wallet such as MetaMask.
- Request a server-generated nonce for a wallet address.
- Sign a SIWE message and exchange it for access and refresh tokens.
- Inspect the JWT payload and refresh token state.
- Call protected auth routes such as `/auth/me`, `/auth/refresh`, and `/auth/logout`.
- Use a simulated wallet flow when no browser wallet is available.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Nanostores for UI state
- SIWE for message construction and verification

## Getting Started

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend Expectations

The demo calls relative auth endpoints on the same origin:

- `GET /auth/nonce`
- `POST /auth/verify`
- `GET /auth/me`
- `POST /auth/refresh`
- `DELETE /auth/logout`

That means the frontend should be served alongside the Fastify service, or behind a proxy that forwards `/auth/*` requests to the API.

If a wallet extension is not installed, the app includes a simulated wallet path so you can still explore the flow end to end.

## Project Structure

- `app/page.tsx` renders the demo shell.
- `app/_components/` contains the step-by-step auth screens.
- `app/_stores/` holds shared state for wallet, nonce, JWT, progress, and logs.
- `lib/` contains small helpers and mock token generators used by the demo UI.

## Development

- `npm run dev` starts the local dev server.
- `npm run build` builds the app for production.
- `npm run start` runs the production build.
- `npm run lint` runs ESLint.

## Notes

The app uses relative API paths and does not define backend environment variables in this repository. If the auth service is unavailable, some steps will show an API-unreachable state.
