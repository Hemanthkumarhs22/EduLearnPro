# Edu Learn Pro Frontend

This package houses the React single-page application for Edu Learn Pro. It provides route-based navigation, protected layouts, and integration with the FastAPI backend.

## Key Libraries
- React 19 with Vite + TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Query for server-side state
- Axios for HTTP and JWT interceptors

## Available Scripts
- `pnpm dev` – start the development server on `http://localhost:5173`
- `pnpm build` – generate a production build
- `pnpm preview` – preview the production build locally
- `pnpm lint` – run ESLint with the configured ruleset

## Environment Variables
Copy `.env.example` to `.env` and set:
- `VITE_API_URL` – base URL for the FastAPI backend (defaults to `http://localhost:8000/api/v1`)

## Folder Highlights
- `src/pages` – screen-level components for each route
- `src/components` – reusable UI pieces (course cards, progress bars, forms)
- `src/routes` – route guards and layout wrappers
- `src/providers` – authentication context handling JWT storage
- `src/lib/api.ts` – Axios instance with interceptors and base config

## Styling
Tailwind is configured via `tailwind.config.js`; global styles live in `src/index.css`. Utility-first styling keeps components concise and responsive out of the box.

## Testing & Linting
Add component tests with Vitest/React Testing Library as needed. Run `pnpm lint` to ensure code quality before committing.
