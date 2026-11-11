# RideOn Client

React + Vite + Tailwind CSS front end for the RideOn bike rental system (public site, customer dashboard and admin dashboard).

It needs the RideOn API (the separate server repository) running.

```bash
npm install
npm run dev        # http://localhost:5173
```

In development, Vite forwards `/api` and `/uploads` to `http://localhost:5000` (change with `VITE_PROXY_TARGET`).

Optional settings go in `.env` (see `.env.example`):

| Variable | Purpose |
|---|---|
| `VITE_CURRENCY` | Currency used to format prices, e.g. `USD` |
| `VITE_API_URL` | Full API URL when the built site is hosted separately from the API |

```bash
npm run build      # production build in dist/
```

The login cookie is SameSite=Lax, so in production host the site and the API under the same site (for example `app.example.com` and `api.example.com`), or let the API serve the `dist/` folder.
