# AI Club Platform

Phase 1 - Member Portal & Face Recognition Attendance System

## Setup

1. Run `npm install` in `server/` and `client/` directories.
2. Set up `.env` files in both directories (see `.env.example`).
3. Set up PostgreSQL and create the `aiclub_db` database.
4. Run `cd server && npx prisma db push` to sync schema.
5. Run `cd server && npm run seed` to create the Super Admin.
6. Run `npm run dev:server` and `npm run dev:client` from the root directory to start the development servers.
