# API Infrastructure Pipeline

An **API Data Dashboard** built with React, Vite and TypeScript. It fetches
products from a public API and demonstrates a complete asynchronous data
pipeline:

1. **Asynchronous integration** — a typed API service layer with clear error handling.
2. **Latency mitigation** — skeleton loaders and a hard 5-second request timeout.
3. **Off-main-thread processing** — a Web Worker filters, sorts and aggregates
   the data so the UI stays responsive.

> 🚧 Work in progress — built incrementally. See the roadmap below.

**Data source:** [`https://dummyjson.com/products?limit=100`](https://dummyjson.com/products?limit=100)

## Tech stack

React 18 · Vite 7 · TypeScript (strict) · native Fetch API · Web Workers ·
modern CSS (custom properties, Grid/Flex, light & dark themes).
No UI or data-fetching libraries.

## Getting started

Requires **Node.js 20.19+** (or 22.12+).

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`).

| Script              | What it does                         |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the Vite dev server            |
| `npm run build`     | Type-check and build to `dist/`      |
| `npm run preview`   | Serve the production build locally   |
| `npm run typecheck` | Run the TypeScript compiler only     |

## Roadmap

- [x] Project scaffold, design tokens and app shell
- [x] API service layer with typed error handling
- [x] Skeleton loading and 5-second AbortController timeout
- [x] Web Worker processing pipeline
- [ ] Search, category filter and sorting
- [ ] Large-dataset demo, statistics and architecture panel
- [ ] Refactoring for testability
- [ ] Unit tests, bug fixes and CI
- [ ] Deployment and final documentation
