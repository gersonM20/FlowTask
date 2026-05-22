# Task Manager — Full-Stack Portfolio Project

A full-stack task management dashboard built to demonstrate real-world proficiency in JavaScript, HTML5, CSS3, and SQL.

**Stack:** React + Vite · Node.js + Express · PostgreSQL · Docker

---

## Screenshots

> _Dashboard (light mode)_
> ![Dashboard light](docs/screenshot-light.png)

> _Dashboard (dark mode)_
> ![Dashboard dark](docs/screenshot-dark.png)

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite 5, CSS3 (no UI lib)  |
| Backend    | Node.js 18+, Express 4              |
| Database   | PostgreSQL 16                       |
| Dev infra  | Docker + docker-compose             |

---

## Quick Start

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd task-manager
cp .env.example .env          # adjust values if needed
```

### 2. Start PostgreSQL (Docker)

```bash
docker-compose up -d
```

This creates the database, runs `init.sql` (tables + seed data), and exposes PostgreSQL on **port 5432**.

### 3. Start the backend

```bash
cd backend
npm install
npm run dev          # runs on http://localhost:3001
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev          # runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Project Structure

```
task-manager/
├── docker-compose.yml          # PostgreSQL service
├── .env.example                # Environment variables template
├── .gitignore
│
├── backend/
│   ├── server.js               # Express entry point
│   ├── package.json
│   ├── db/
│   │   ├── connection.js       # pg Pool
│   │   └── init.sql            # Schema, indexes, seed + complex queries
│   ├── routes/
│   │   ├── tasks.js
│   │   ├── categories.js
│   │   └── users.js
│   └── controllers/
│       ├── tasksController.js
│       ├── categoriesController.js
│       └── usersController.js
│
└── frontend/
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── StatsCard.jsx
        │   ├── SearchBar.jsx
        │   ├── TaskFilters.jsx
        │   ├── TaskCard.jsx
        │   └── TaskForm.jsx
        ├── pages/
        │   └── Dashboard.jsx
        ├── hooks/
        │   ├── useTasks.js
        │   ├── useCategories.js
        │   └── useDebounce.js
        ├── services/
        │   └── api.js          # Typed fetch wrapper
        └── styles/
            ├── variables.css   # CSS custom properties
            ├── global.css
            ├── navbar.css
            ├── dashboard.css
            ├── taskCard.css
            ├── taskForm.css
            └── filters.css
```

---

## API Endpoints

### Tasks

| Method   | Endpoint              | Description                            |
|----------|-----------------------|----------------------------------------|
| `GET`    | `/api/tasks`          | List all tasks (supports query filters)|
| `GET`    | `/api/tasks/stats`    | KPI counts (total, pending, overdue…)  |
| `GET`    | `/api/tasks/:id`      | Get a single task                      |
| `POST`   | `/api/tasks`          | Create a task                          |
| `PATCH`  | `/api/tasks/:id`      | Update task fields (partial update)    |
| `DELETE` | `/api/tasks/:id`      | Delete a task                          |

**Query parameters for `GET /api/tasks`:**

| Param         | Example          |
|---------------|------------------|
| `status`      | `pending`        |
| `priority`    | `high`           |
| `category_id` | `3`              |
| `user_id`     | `<uuid>`         |
| `search`      | `pipeline`       |

### Categories

| Method | Endpoint            | Description           |
|--------|---------------------|-----------------------|
| `GET`  | `/api/categories`   | List all categories   |
| `POST` | `/api/categories`   | Create a category     |

### Users

| Method | Endpoint        | Description       |
|--------|-----------------|-------------------|
| `GET`  | `/api/users`    | List all users    |
| `GET`  | `/api/users/:id`| Get a single user |

### Health

| Method | Endpoint       |
|--------|----------------|
| `GET`  | `/api/health`  |

---

## Database Schema

```sql
users        (id uuid PK, name, email UNIQUE, avatar_url, created_at, updated_at)
categories   (id serial PK, name UNIQUE, color, icon, created_at)
tasks        (id uuid PK, title, description, status, priority, due_date,
              completed_at, user_id FK→users, category_id FK→categories,
              created_at, updated_at)
```

See `backend/db/init.sql` for indexes, triggers, seed data, and three annotated complex SQL queries (JOINs, GROUP BY, subqueries).

---

## Features

- **Dashboard KPIs** — total, pending, in-progress, completed, overdue counts
- **Real-time search** — debounced full-text search on task titles
- **Multi-filter** — filter by status, priority, and category simultaneously
- **CRUD** — create, edit, delete tasks via modal form
- **One-click complete** — toggle task status directly from the list
- **Priority accent** — colored left border per priority level
- **Dark mode** — full dark theme via CSS custom properties
- **Responsive** — mobile-first layout with CSS Grid + Flexbox
- **Smooth animations** — card slide-in, modal fade-in

---

## Environment Variables

| Variable      | Default         | Description              |
|---------------|-----------------|--------------------------|
| `DB_HOST`     | `localhost`     | PostgreSQL host           |
| `DB_PORT`     | `5432`          | PostgreSQL port           |
| `DB_NAME`     | `taskmanager`   | Database name             |
| `DB_USER`     | `taskuser`      | Database user             |
| `DB_PASSWORD` | `taskpass123`   | Database password         |
| `PORT`        | `3001`          | Express server port       |
| `VITE_API_URL`| `/api`          | Frontend API base URL     |
