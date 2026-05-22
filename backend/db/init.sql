-- =============================================================================
-- Task Manager — Database initialization
-- PostgreSQL 16
-- =============================================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- for gen_random_uuid()

-- =============================================================================
-- TABLES
-- =============================================================================

-- Users -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(120) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Categories ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL      PRIMARY KEY,
    name        VARCHAR(80) NOT NULL UNIQUE,
    color       CHAR(7)     NOT NULL DEFAULT '#6366f1',  -- hex color
    icon        VARCHAR(40),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    status       VARCHAR(20)  NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','in_progress','completed','cancelled')),
    priority     VARCHAR(10)  NOT NULL DEFAULT 'medium'
                    CHECK (priority IN ('low','medium','high','urgent')),
    due_date     DATE,
    completed_at TIMESTAMPTZ,
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id  INTEGER     REFERENCES categories(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Lookup tasks by owner (most common query)
CREATE INDEX IF NOT EXISTS idx_tasks_user_id     ON tasks(user_id);
-- Filter by status (dashboard filters)
CREATE INDEX IF NOT EXISTS idx_tasks_status      ON tasks(status);
-- Filter by due date (overdue detection)
CREATE INDEX IF NOT EXISTS idx_tasks_due_date    ON tasks(due_date);
-- Filter by category
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
-- Composite: user + status (very frequent combined filter)
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
-- Full-text search on title
CREATE INDEX IF NOT EXISTS idx_tasks_title_trgm  ON tasks USING gin (to_tsvector('english', title));

-- =============================================================================
-- AUTO-UPDATE updated_at TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Users
INSERT INTO users (id, name, email, avatar_url) VALUES
    ('a1b2c3d4-0000-0000-0000-000000000001', 'Alice Johnson',  'alice@example.com',  'https://i.pravatar.cc/64?u=alice'),
    ('a1b2c3d4-0000-0000-0000-000000000002', 'Bob Martinez',   'bob@example.com',    'https://i.pravatar.cc/64?u=bob'),
    ('a1b2c3d4-0000-0000-0000-000000000003', 'Carol Williams', 'carol@example.com',  'https://i.pravatar.cc/64?u=carol')
ON CONFLICT DO NOTHING;

-- Categories
INSERT INTO categories (name, color, icon) VALUES
    ('Development',  '#6366f1', 'code'),
    ('Design',       '#ec4899', 'palette'),
    ('Marketing',    '#f59e0b', 'megaphone'),
    ('DevOps',       '#10b981', 'server'),
    ('Research',     '#3b82f6', 'search'),
    ('Management',   '#8b5cf6', 'briefcase')
ON CONFLICT DO NOTHING;

-- Tasks (mix of statuses, priorities and dates)
INSERT INTO tasks (title, description, status, priority, due_date, user_id, category_id) VALUES
    ('Set up CI/CD pipeline',
     'Configure GitHub Actions for automated testing and deployment to staging.',
     'in_progress', 'high',  CURRENT_DATE + 3,
     'a1b2c3d4-0000-0000-0000-000000000001',
     (SELECT id FROM categories WHERE name = 'DevOps')),

    ('Design landing page mockups',
     'Create high-fidelity Figma mockups for the new product landing page.',
     'pending',     'medium', CURRENT_DATE + 7,
     'a1b2c3d4-0000-0000-0000-000000000002',
     (SELECT id FROM categories WHERE name = 'Design')),

    ('Write unit tests for auth module',
     'Achieve 80% coverage on authentication and authorisation flows.',
     'pending',     'high',  CURRENT_DATE + 1,
     'a1b2c3d4-0000-0000-0000-000000000001',
     (SELECT id FROM categories WHERE name = 'Development')),

    ('Quarterly marketing report',
     'Compile Q1 KPIs: traffic, conversion rate and CAC breakdown.',
     'completed',   'medium', CURRENT_DATE - 5,
     'a1b2c3d4-0000-0000-0000-000000000003',
     (SELECT id FROM categories WHERE name = 'Marketing')),

    ('Research competitor pricing',
     'Analyse top-5 competitor pricing models and prepare comparison matrix.',
     'in_progress', 'low',   CURRENT_DATE + 14,
     'a1b2c3d4-0000-0000-0000-000000000002',
     (SELECT id FROM categories WHERE name = 'Research')),

    ('Fix login bug on mobile',
     'JWT token not being stored correctly on iOS Safari — investigate & patch.',
     'pending',     'urgent', CURRENT_DATE - 1,
     'a1b2c3d4-0000-0000-0000-000000000001',
     (SELECT id FROM categories WHERE name = 'Development')),

    ('Sprint planning meeting',
     'Prepare user stories and story-point estimates for next sprint.',
     'completed',   'medium', CURRENT_DATE - 3,
     'a1b2c3d4-0000-0000-0000-000000000003',
     (SELECT id FROM categories WHERE name = 'Management')),

    ('Deploy PostgreSQL to production',
     'Migrate from SQLite to managed PostgreSQL on AWS RDS.',
     'pending',     'high',  CURRENT_DATE + 5,
     'a1b2c3d4-0000-0000-0000-000000000001',
     (SELECT id FROM categories WHERE name = 'DevOps')),

    ('Update npm dependencies',
     'Run npm audit and update packages with known vulnerabilities.',
     'cancelled',   'low',   CURRENT_DATE + 10,
     'a1b2c3d4-0000-0000-0000-000000000002',
     (SELECT id FROM categories WHERE name = 'Development')),

    ('Social media content calendar',
     'Plan 30 days of posts for Twitter, LinkedIn and Instagram.',
     'in_progress', 'medium', CURRENT_DATE + 6,
     'a1b2c3d4-0000-0000-0000-000000000003',
     (SELECT id FROM categories WHERE name = 'Marketing'));

-- Mark completed tasks
UPDATE tasks SET completed_at = NOW() - INTERVAL '2 days' WHERE status = 'completed';

-- =============================================================================
-- COMPLEX QUERIES (for reference / interview demonstration)
-- =============================================================================

/*
-- QUERY 1: Task summary per user with category breakdown (JOIN + GROUP BY)
SELECT
    u.name                                       AS user_name,
    c.name                                       AS category,
    COUNT(t.id)                                  AS total_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'completed')   AS done,
    COUNT(t.id) FILTER (WHERE t.status = 'pending')     AS pending,
    ROUND(
        100.0 * COUNT(t.id) FILTER (WHERE t.status = 'completed')
        / NULLIF(COUNT(t.id), 0), 1
    )                                            AS completion_pct
FROM users u
JOIN tasks t ON t.user_id = u.id
LEFT JOIN categories c ON c.id = t.category_id
GROUP BY u.name, c.name
ORDER BY u.name, total_tasks DESC;


-- QUERY 2: Overdue tasks with owner info (JOIN + WHERE on computed column)
SELECT
    t.id,
    t.title,
    t.priority,
    t.due_date,
    NOW()::date - t.due_date                AS days_overdue,
    u.name                                  AS assigned_to,
    u.email
FROM tasks t
JOIN users u ON u.id = t.user_id
WHERE t.due_date < CURRENT_DATE
  AND t.status NOT IN ('completed', 'cancelled')
ORDER BY days_overdue DESC;


-- QUERY 3: Users with more pending tasks than the global average (subquery)
SELECT
    u.id,
    u.name,
    u.email,
    pending_count
FROM (
    SELECT
        user_id,
        COUNT(*) AS pending_count
    FROM tasks
    WHERE status = 'pending'
    GROUP BY user_id
) AS pending_per_user
JOIN users u ON u.id = pending_per_user.user_id
WHERE pending_count > (
    SELECT AVG(cnt)
    FROM (
        SELECT COUNT(*) AS cnt
        FROM tasks
        WHERE status = 'pending'
        GROUP BY user_id
    ) AS sub
)
ORDER BY pending_count DESC;
*/
