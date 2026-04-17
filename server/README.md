# DelphiMinds Backend

Production-ready Node.js API for DelphiMinds.

## Database migrations

- SQL schema and migrations live in ../database.
- On server startup, migrations are auto-applied from ../database/migrations.

## Run locally

1. Install dependencies:
   npm install
2. Configure environment in .env
3. Start server:
   npm run dev

Backend listens on port 5000 by default and exposes API under /api.
