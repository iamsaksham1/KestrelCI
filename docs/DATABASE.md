# KestrelCI Database Specification & Migration Guide

The database layer in **KestrelCI** lives in a dedicated module at `server/database/`.
Zero SQL is permitted outside `server/database/repositories/` and `server/database/migrations/`.

---

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    PROJECTS ||--o{ PIPELINES : "has"
    PROJECTS ||--o{ REPO_ANALYSES : "analyzes"
    PIPELINES ||--o{ PIPELINE_RUNS : "executes"
    PIPELINE_RUNS ||--o{ STAGE_RUNS : "contains (7 stages)"
    PIPELINE_RUNS ||--o{ LOGS : "generates"
    STAGE_RUNS ||--o{ LOGS : "emits"
    PIPELINE_RUNS ||--o| PIPELINE_RUNS : "retries (retry_of)"
    PIPELINE_RUNS ||--o| REPO_ANALYSES : "associated with"

    PROJECTS {
        text id PK
        text name
        text slug UK
        text description
        text repository_url
        text default_branch
        text repo_owner
        text repo_name
        text created_at
        text updated_at
    }

    REPO_ANALYSES {
        text id PK
        text project_id FK
        text run_id FK
        text owner
        text repo
        text branch
        text commit_sha
        text commit_message
        text commit_author
        text commit_date
        text languages_json
        text detected_stack_json
        text manifests_json
        integer stars
        text license
        text fetched_at
        integer rate_limit_remaining
        text source
    }

    PIPELINES {
        text id PK
        text project_id FK
        text name
        text config_json
        text created_at
        text updated_at
    }

    PIPELINE_RUNS {
        text id PK
        text pipeline_id FK
        integer run_number
        text status
        text trigger_type
        text retry_of FK
        text commit_sha
        text commit_message
        text branch
        text error_message
        text failing_stage
        text started_at
        text finished_at
        integer duration_ms
        text config_snapshot_json
        text created_at
        text updated_at
    }

    STAGE_RUNS {
        text id PK
        text run_id FK
        text stage_name
        text display_name
        integer order_index
        text status
        text source
        text error_message
        text started_at
        text finished_at
        integer duration_ms
        text created_at
        text updated_at
    }

    LOGS {
        integer id PK
        text run_id FK
        text stage_run_id FK
        integer order_index
        text timestamp
        text level
        text source
        text message
        text created_at
    }

    CONTACT_MESSAGES {
        text id PK
        text name
        text email
        text subject
        text message
        text created_at
    }

    SCHEMA_MIGRATIONS {
        integer version PK
        text name
        text applied_at
    }
```

---

## 2. Migration History

### Migration 001: Initial Schema (`001_initial_schema.sql`)
- Created `projects`, `pipelines`, `pipeline_runs`, `stage_runs`, `logs`, `contact_messages`, and `schema_migrations`.
- Established index optimizations: `idx_runs_pipeline_created`, `idx_runs_status`, `idx_stage_runs_run_order`, `idx_logs_run_order`, `idx_logs_stage`.

### Migration 002: GitHub Repository Analysis (`002_github_repo_analysis.sql`)
- Added `repo_owner` and `repo_name` columns to `projects`.
- Created `repo_analyses` table for storing full snapshots of GitHub REST API metadata:
  `id, project_id, run_id, owner, repo, branch, commit_sha, commit_message, commit_author, commit_date, languages_json, detected_stack_json, manifests_json, stars, license, fetched_at, rate_limit_remaining, source ('github_api')`.
- Added `source` column (`CHECK(source IN ('real', 'simulated'))`) to `stage_runs` and `logs`.
- Created performance indexes: `idx_repo_analyses_project_fetched`, `idx_repo_analyses_commit_sha`, `idx_pipeline_runs_commit_sha`.

---

## 3. Migration Runner How-To

KestrelCI features a tiny, robust SQL migration runner located at `server/database/migrate.js`.

### Running Migrations
To apply any unexecuted migrations:
```bash
npm run migrate
```
Or directly via node:
```bash
node server/database/migrate.js
```

### Adding a New Migration
1. Create a numbered SQL file inside `server/database/migrations/`:
   ```
   003_add_slack_notifications.sql
   ```
2. Write standard SQL DDL statements:
   ```sql
   ALTER TABLE pipelines ADD COLUMN notify_slack_webhook TEXT;
   ```
3. Run `npm run migrate`. The runner records `version = 3` into `schema_migrations` and executes the script inside a transactional block.

---

## 4. PostgreSQL Migration Path

Moving KestrelCI from SQLite to PostgreSQL is straightforward because **no SQL exists outside `server/database/repositories/`**.

### Migration Steps:
1. **Connection Layer (`server/database/connection.js`)**:
   - Replace the SQLite connection with a `pg` or `pg-promise` Pool:
     ```js
     import pg from 'pg';
     const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
     export function getDb() { return pool; }
     ```
2. **Repository Layer (`server/database/repositories/`)**:
   - Replace `db.prepare(sql).run()` and `.all()` with `pool.query(sql, params)`.
   - Update parameter syntax from `@param` to `$1, $2, $3` or use a lightweight query builder.
3. **Engine & Services**:
   - Zero changes required in `server/engine/`, `server/routes/`, or `server/services/`.
