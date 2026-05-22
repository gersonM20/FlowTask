# Task Manager — Portafolio Full-Stack

Sistema de gestión de tareas construido con JavaScript ES6+, HTML5, CSS3 y SQL. Implementa una arquitectura REST clásica
con separación clara de responsabilidades en cada capa.

---

## Índice

1. [Stack tecnológico](#stack-tecnológico)
2. [Arquitectura del proyecto](#arquitectura-del-proyecto)
3. [Inicio rápido](#inicio-rápido)
4. [Variables de entorno](#variables-de-entorno)
5. [Estructura de carpetas](#estructura-de-carpetas)
6. [API REST — Endpoints](#api-rest--endpoints)
7. [Esquema de base de datos](#esquema-de-base-de-datos)
8. [Funcionalidades](#funcionalidades)
9. [Guía de desarrollo](#guía-de-desarrollo)
10. [Convenciones del código](#convenciones-del-código)

---

## Stack tecnológico

| Capa              | Tecnología                          | Versión  |
|-------------------|-------------------------------------|----------|
| **Frontend**      | React + Vite                        | 18 / 5   |
| **Estilos**       | CSS3 puro (sin framework UI)        | —        |
| **Backend**       | Node.js + Express                   | 18+ / 4  |
| **Base de datos** | PostgreSQL                          | 16       |
| **Infraestructura** | Docker + docker-compose           | —        |
| **Control de versiones** | Git / GitHub                | —        |

---

## Arquitectura del proyecto

```
┌─────────────────────────────────────────────────────────┐
│                     NAVEGADOR                           │
│                                                         │
│   React (Vite)   →   fetch()   →   Express API         │
│   :5173                              :3001              │
└───────────────────────────┬─────────────────────────────┘
                            │ pg Pool (SQL)
                    ┌───────▼────────┐
                    │  PostgreSQL 16  │
                    │  (Docker :5432) │
                    └────────────────┘

Capas del backend
──────────────────
routes/      →  Define los endpoints HTTP (qué URL hace qué)
controllers/ →  Lógica de negocio + queries SQL
db/          →  Pool de conexiones + schema inicial

Capas del frontend
──────────────────
services/    →  Wrapper de fetch (comunicación con la API)
hooks/       →  Estado asíncrono reutilizable (custom hooks)
pages/       →  Vistas completas (una por sección)
components/  →  Bloques UI reutilizables
styles/      →  CSS modular por componente/página
```

---

## Inicio rápido

### Requisitos previos

- [Node.js 18+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com)

### 1 — Clonar y configurar entorno

```bash
git clone <url-del-repo>
cd task-manager

# Crear los archivos .env a partir de la plantilla
copy .env.example backend\.env      # Windows
copy .env.example frontend\.env     # Windows
# cp .env.example backend/.env      # macOS / Linux
# cp .env.example frontend/.env     # macOS / Linux
```

### 2 — Iniciar la base de datos

```bash
docker-compose up -d
```

> Docker crea el contenedor, ejecuta `backend/db/init.sql` automáticamente
> (tablas + índices + datos de prueba) y expone PostgreSQL en el puerto **5432**.

Verificar que el contenedor esté corriendo:

```bash
docker ps
# Debe aparecer: taskmanager_db
```

### 3 — Iniciar el backend

```bash
cd backend
npm install
npm run dev
# ✅ Backend corriendo en http://localhost:3001
```

### 4 — Iniciar el frontend

```bash
# En otra terminal
cd frontend
npm install
npm run dev
# ✅ Frontend corriendo en http://localhost:5173
```

Abrir **http://localhost:5173** en el navegador.

---

## Variables de entorno

Copiar `.env.example` a `backend/.env` y `frontend/.env` antes de iniciar.

| Variable        | Valor por defecto  | Descripción                        |
|-----------------|--------------------|------------------------------------|
| `DB_HOST`       | `localhost`        | Host de PostgreSQL                 |
| `DB_PORT`       | `5432`             | Puerto de PostgreSQL               |
| `DB_NAME`       | `taskmanager`      | Nombre de la base de datos         |
| `DB_USER`       | `taskuser`         | Usuario de PostgreSQL              |
| `DB_PASSWORD`   | `taskpass123`      | Contraseña de PostgreSQL           |
| `PORT`          | `3001`             | Puerto del servidor Express        |
| `NODE_ENV`      | `development`      | Entorno (`development`/`production`)|
| `VITE_API_URL`  | `/api`             | URL base de la API en el frontend  |

> **Producción:** nunca subir el archivo `.env` al repositorio. Ya está en `.gitignore`.

---

## Estructura de carpetas

```
task-manager/
│
├── docker-compose.yml          # Servicio PostgreSQL + volumen persistente
├── .env.example                # Plantilla de variables de entorno
├── .gitignore
│
├── backend/                    # Servidor Express (API REST)
│   ├── server.js               # Punto de entrada: middleware + rutas + arranque
│   ├── package.json
│   │
│   ├── db/
│   │   ├── connection.js       # Pool de conexiones pg (singleton)
│   │   └── init.sql            # Schema, índices, trigger, seed + queries SQL complejas
│   │
│   ├── routes/                 # Definición de endpoints HTTP
│   │   ├── tasks.js
│   │   ├── categories.js
│   │   └── users.js
│   │
│   └── controllers/            # Lógica de negocio + queries SQL
│       ├── tasksController.js
│       ├── categoriesController.js
│       └── usersController.js
│
└── frontend/                   # SPA React + Vite
    ├── index.html
    ├── vite.config.js          # Proxy /api → localhost:3001 en desarrollo
    ├── package.json
    │
    └── src/
        ├── main.jsx            # Punto de entrada React + imports CSS globales
        ├── App.jsx             # Raíz: navegación entre páginas + dark mode
        │
        ├── services/
        │   └── api.js          # Wrapper central de fetch (tasksApi, usersApi, categoriesApi)
        │
        ├── hooks/              # Custom hooks: encapsulan lógica asíncrona
        │   ├── useTasks.js     # CRUD de tareas + estado loading/error
        │   ├── useCategories.js
        │   └── useDebounce.js  # Retrasa el valor hasta que el usuario deja de escribir
        │
        ├── pages/              # Vistas completas (una por sección del navbar)
        │   ├── Dashboard.jsx   # KPIs + lista de tareas con filtros
        │   ├── TasksPage.jsx   # Vista dedicada de todas las tareas
        │   ├── UsersPage.jsx   # CRUD de usuarios
        │   └── CategoriesPage.jsx # CRUD de categorías
        │
        ├── components/         # Bloques UI reutilizables
        │   ├── Navbar.jsx
        │   ├── DarkModeToggle.jsx  # Toggle animado luna/sol
        │   ├── StatsCard.jsx
        │   ├── SearchBar.jsx
        │   ├── TaskFilters.jsx
        │   ├── TaskCard.jsx
        │   └── TaskForm.jsx
        │
        └── styles/             # CSS modular (un archivo por componente/sección)
            ├── variables.css   # Design tokens: colores, espaciado, tipografía
            ├── global.css      # Reset + estilos base + clases utilitarias
            ├── navbar.css
            ├── dashboard.css
            ├── taskCard.css
            ├── taskForm.css
            ├── filters.css
            ├── management.css  # Estilos de UsersPage y CategoriesPage
            └── darkToggle.css
```

---

## API REST — Endpoints

Base URL: `http://localhost:3001/api`

### Tareas

| Método   | Endpoint           | Descripción                                         |
|----------|--------------------|-----------------------------------------------------|
| `GET`    | `/tasks`           | Listar tareas. Soporta filtros por query string     |
| `GET`    | `/tasks/stats`     | KPIs: total, pendientes, en progreso, vencidas...   |
| `GET`    | `/tasks/:id`       | Obtener una tarea con datos de usuario y categoría  |
| `POST`   | `/tasks`           | Crear tarea                                         |
| `PATCH`  | `/tasks/:id`       | Actualización parcial (solo campos enviados)        |
| `DELETE` | `/tasks/:id`       | Eliminar tarea                                      |

**Query params disponibles para `GET /tasks`:**

| Parámetro     | Tipo   | Ejemplo         |
|---------------|--------|-----------------|
| `status`      | string | `pending`       |
| `priority`    | string | `high`          |
| `category_id` | int    | `3`             |
| `user_id`     | uuid   | `a1b2c3d4-...`  |
| `search`      | string | `pipeline`      |

**Cuerpo para `POST /tasks`:**

```json
{
  "title":       "Nombre de la tarea",
  "description": "Descripción opcional",
  "status":      "pending | in_progress | completed | cancelled",
  "priority":    "low | medium | high | urgent",
  "due_date":    "2026-06-01",
  "user_id":     "uuid-del-usuario",
  "category_id": 1
}
```

### Categorías

| Método   | Endpoint              | Descripción                          |
|----------|-----------------------|--------------------------------------|
| `GET`    | `/categories`         | Listar todas con conteo de tareas    |
| `POST`   | `/categories`         | Crear categoría                      |
| `PATCH`  | `/categories/:id`     | Actualizar nombre y/o color          |
| `DELETE` | `/categories/:id`     | Eliminar (tareas quedan sin categoría)|

### Usuarios

| Método | Endpoint      | Descripción                            |
|--------|---------------|----------------------------------------|
| `GET`  | `/users`      | Listar todos con conteo de tareas      |
| `GET`  | `/users/:id`  | Obtener un usuario                     |
| `POST` | `/users`      | Crear usuario                          |

### Health check

| Método | Endpoint  | Respuesta                              |
|--------|-----------|----------------------------------------|
| `GET`  | `/health` | `{ "status": "ok", "timestamp": "…" }`|

---

## Esquema de base de datos

```sql
-- Usuarios del sistema
users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
)

-- Categorías de tareas con color personalizable
categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(80) NOT NULL UNIQUE,
  color      CHAR(7) DEFAULT '#2563eb',   -- color hex
  icon       VARCHAR(40),
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Tareas (tabla principal)
tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  status       VARCHAR(20) CHECK (status IN ('pending','in_progress','completed','cancelled')),
  priority     VARCHAR(10) CHECK (priority IN ('low','medium','high','urgent')),
  due_date     DATE,
  completed_at TIMESTAMPTZ,
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id  INT  REFERENCES categories(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
)
```

**Índices:** `idx_tasks_user_id`, `idx_tasks_status`, `idx_tasks_due_date`,
`idx_tasks_category_id`, `idx_tasks_user_status` (compuesto), `idx_tasks_title_trgm` (full-text GIN).

Ver `backend/db/init.sql` para el trigger `updated_at`, datos de prueba y
**tres queries SQL complejas comentadas** (JOIN + GROUP BY, fecha calculada, subconsulta con AVG).

---

## Funcionalidades

### Dashboard
- Tarjetas KPI: total, pendientes, en progreso, completadas, vencidas
- Lista de tareas ordenada por prioridad y fecha
- Búsqueda en tiempo real con debounce (400 ms)
- Filtros combinables: estado + prioridad + categoría
- Botón "Limpiar filtros" cuando hay filtros activos

### Tareas
- Crear, editar y eliminar desde modal
- Completar/reabrir con un clic
- Indicador de tarea vencida (fecha pasada + no completada)
- Acento de color en borde izquierdo según prioridad

### Usuarios y Categorías
- Formulario lateral para crear registros
- Tabla con todos los registros y contador de tareas asociadas
- Edición in-place (categorías)
- Confirmación de eliminación con advertencia si hay tareas asociadas

### UI / UX
- Modo oscuro completo con toggle animado luna ↔ sol
- Diseño responsive — mobile first con CSS Grid + Flexbox
- Animaciones suaves en tarjetas, modales y toggle
- CSS sin framework externo (variables, grid, flexbox, animaciones propias)

---

## Guía de desarrollo

### Agregar un nuevo endpoint

1. Crear la función en `backend/controllers/`
2. Registrar la ruta en `backend/routes/`
3. Agregar el método en `frontend/src/services/api.js`
4. Consumirlo desde un hook en `frontend/src/hooks/` o directamente en la página

### Agregar una nueva página

1. Crear `frontend/src/pages/NuevaPagina.jsx`
2. Importarla en `frontend/src/App.jsx` y agregarla al objeto `PAGES`
3. Agregar la entrada en el array `NAV_ITEMS` de `frontend/src/components/Navbar.jsx`

### Agregar un nuevo campo a las tareas

1. Actualizar la tabla en PostgreSQL (migración manual o nuevo `init.sql`)
2. Agregar el campo en el `INSERT` y `UPDATE` de `tasksController.js`
3. Agregar el input en `frontend/src/components/TaskForm.jsx`
4. Mostrar el campo en `frontend/src/components/TaskCard.jsx`

### Comandos útiles

```bash
# Conectarse a la base de datos (requiere Docker corriendo)
docker exec -it taskmanager_db psql -U taskuser -d taskmanager

# Ver logs del contenedor
docker logs taskmanager_db

# Reiniciar y recrear la base de datos desde cero
docker-compose down -v && docker-compose up -d

# Build del frontend para producción
cd frontend && npm run build
```

---

## Convenciones del código

| Aspecto            | Convención                                                     |
|--------------------|----------------------------------------------------------------|
| Nombres JS         | `camelCase` para variables/funciones, `PascalCase` para componentes |
| Nombres CSS        | `BEM` simplificado: `.bloque__elemento--modificador`           |
| Comentarios        | Explican el **por qué**, no el qué                             |
| Manejo de errores  | `try/catch` + `next(err)` en backend; estado `error` en hooks  |
| Actualizaciones    | `PATCH` parcial en backend; actualización optimista en frontend |
| Variables de entorno | Siempre a través de `process.env` / `import.meta.env`        |
| Commits            | Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`   |
