# Task Manager — Proyecto de Portafolio Full-Stack

Dashboard de gestión de tareas construido para demostrar dominio real de JavaScript, HTML5, CSS3 y SQL.

**Stack:** React + Vite · Node.js + Express · PostgreSQL · Docker

---

## Capturas de pantalla

> _Dashboard (modo claro)_
> ![Dashboard claro](docs/screenshot-light.png)

> _Dashboard (modo oscuro)_
> ![Dashboard oscuro](docs/screenshot-dark.png)

---

## Tecnologías utilizadas

| Capa       | Tecnología                           |
|------------|--------------------------------------|
| Frontend   | React 18, Vite 5, CSS3 (sin lib UI)  |
| Backend    | Node.js 18+, Express 4               |
| Base de datos | PostgreSQL 16                     |
| Infraestructura | Docker + docker-compose         |

---

## Inicio rápido

### 1. Clonar y configurar el entorno

```bash
git clone <url-del-repo>
cd task-manager
cp .env.example .env          # ajustar valores si es necesario
```

### 2. Iniciar PostgreSQL (Docker)

```bash
docker-compose up -d
```

Esto crea la base de datos, ejecuta `init.sql` (tablas + datos de prueba) y expone PostgreSQL en el **puerto 5432**.

### 3. Iniciar el backend

```bash
cd backend
npm install
npm run dev          # corre en http://localhost:3001
```

### 4. Iniciar el frontend

```bash
cd frontend
npm install
npm run dev          # corre en http://localhost:5173
```

Abrir **http://localhost:5173** en el navegador.

---

## Estructura del proyecto

```
task-manager/
├── docker-compose.yml          # Servicio de PostgreSQL
├── .env.example                # Plantilla de variables de entorno
├── .gitignore
│
├── backend/
│   ├── server.js               # Punto de entrada de Express
│   ├── package.json
│   ├── db/
│   │   ├── connection.js       # Pool de conexiones pg
│   │   └── init.sql            # Esquema, índices, seed y queries complejas
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
        │   └── api.js          # Wrapper de fetch tipado
        └── styles/
            ├── variables.css   # Custom properties CSS
            ├── global.css
            ├── navbar.css
            ├── dashboard.css
            ├── taskCard.css
            ├── taskForm.css
            └── filters.css
```

---

## Endpoints de la API

### Tareas

| Método   | Endpoint              | Descripción                                  |
|----------|-----------------------|----------------------------------------------|
| `GET`    | `/api/tasks`          | Listar tareas (soporta filtros por query)    |
| `GET`    | `/api/tasks/stats`    | Conteos KPI (total, pendientes, vencidas…)   |
| `GET`    | `/api/tasks/:id`      | Obtener una tarea por ID                     |
| `POST`   | `/api/tasks`          | Crear una tarea                              |
| `PATCH`  | `/api/tasks/:id`      | Actualizar campos (actualización parcial)    |
| `DELETE` | `/api/tasks/:id`      | Eliminar una tarea                           |

**Parámetros de query para `GET /api/tasks`:**

| Parámetro     | Ejemplo          |
|---------------|------------------|
| `status`      | `pending`        |
| `priority`    | `high`           |
| `category_id` | `3`              |
| `user_id`     | `<uuid>`         |
| `search`      | `pipeline`       |

### Categorías

| Método | Endpoint            | Descripción               |
|--------|---------------------|---------------------------|
| `GET`  | `/api/categories`   | Listar todas las categorías |
| `POST` | `/api/categories`   | Crear una categoría       |

### Usuarios

| Método | Endpoint        | Descripción              |
|--------|-----------------|--------------------------|
| `GET`  | `/api/users`    | Listar todos los usuarios |
| `GET`  | `/api/users/:id`| Obtener un usuario por ID |

### Health check

| Método | Endpoint       |
|--------|----------------|
| `GET`  | `/api/health`  |

---

## Esquema de la base de datos

```sql
users        (id uuid PK, name, email UNIQUE, avatar_url, created_at, updated_at)
categories   (id serial PK, name UNIQUE, color, icon, created_at)
tasks        (id uuid PK, title, description, status, priority, due_date,
              completed_at, user_id FK→users, category_id FK→categories,
              created_at, updated_at)
```

Ver `backend/db/init.sql` para índices, triggers, datos de prueba y tres queries SQL complejas comentadas (JOINs, GROUP BY, subconsultas).

---

## Funcionalidades

- **KPIs en el dashboard** — conteos de total, pendientes, en progreso, completadas y vencidas
- **Búsqueda en tiempo real** — búsqueda full-text con debounce sobre el título de las tareas
- **Filtros múltiples** — filtrar por estado, prioridad y categoría simultáneamente
- **CRUD completo** — crear, editar y eliminar tareas desde un formulario modal
- **Completar con un clic** — alternar el estado de la tarea directamente desde la lista
- **Acento por prioridad** — borde izquierdo de color según nivel de prioridad
- **Modo oscuro** — tema oscuro completo mediante CSS custom properties
- **Diseño responsive** — layout mobile-first con CSS Grid + Flexbox
- **Animaciones suaves** — slide-in en tarjetas, fade-in en el modal

---

## Variables de entorno

| Variable      | Valor por defecto | Descripción                |
|---------------|-------------------|----------------------------|
| `DB_HOST`     | `localhost`       | Host de PostgreSQL          |
| `DB_PORT`     | `5432`            | Puerto de PostgreSQL        |
| `DB_NAME`     | `taskmanager`     | Nombre de la base de datos  |
| `DB_USER`     | `taskuser`        | Usuario de la base de datos |
| `DB_PASSWORD` | `taskpass123`     | Contraseña de la base de datos |
| `PORT`        | `3001`            | Puerto del servidor Express |
| `VITE_API_URL`| `/api`            | URL base de la API en el frontend |
