# GamePlan

GamePlan is a full-stack platform designed to manage and streamline operations for competitive cheer programs. It consolidates scheduling, communication, progress tracking, roster management, and video feedback into one, intuitive application.

## Project Structure
```
GamePlan/
├── packages/
│   ├── backend/        # Node.js + Express API server
│   ├── frontend/       # React + Vite web application
│   └── shared/         # Shared TypeScript types
├── docker/             # Docker Compose for local services
├── .github/workflows/  # CI pipelines
└── context/            # Project documentation and design assets
```

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite 7 (build tool + dev server)
- ESLint

### Backend
- Node.js + Express 5 + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication + Role-Based Access Control (RBAC)

### Infrastructure
- pnpm workspaces (monorepo management)
- Docker Compose (local PostgreSQL + pgAdmin)
- GitHub Actions (CI/CD)

## Prerequisites

1. **Node.js 20+** — [Download](https://nodejs.org)
2. **pnpm 9+** — Install globally: `npm install -g pnpm`
3. **Docker Desktop** — [Download](https://www.docker.com/products/docker-desktop/)

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/amacthedev/GamePlan.git
cd GamePlan

# 2. Install all dependencies
pnpm install

# 3. Start PostgreSQL and pgAdmin
docker compose -f docker/docker-compose.yml up -d

# 4. Set up environment variables
cp .env.example .env

# 5. Start the dev servers (backend + frontend)
pnpm dev
```

After setup:
- **Frontend** runs at `http://localhost:5173`
- **Backend** runs at `http://localhost:3000`
- **pgAdmin** runs at `http://localhost:5050` (login: `admin@gameplan.dev` / `admin`)

## Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers in parallel |
| `pnpm dev:backend` | Start only the backend |
| `pnpm dev:frontend` | Start only the frontend |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all tests |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed the database |
| `pnpm db:studio` | Open Prisma Studio (DB browser) |

## Development Workflow

See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming, PR process, and coding patterns.

## Status

Phase 1 complete — monorepo structure, Docker, CI/CD, and workspace configuration set up. Database and auth implementation next.
