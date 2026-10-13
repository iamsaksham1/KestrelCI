# KestrelCI REST API Reference (`/api/v1`)

All endpoints are versioned under `/api/v1`.
Mutation endpoints (`POST`, `PUT`, `DELETE`) require the `X-API-Key` authentication header.

---

## 1. Authentication & Configuration

```js
// ╔══════════════════════════════════════════════════════════════╗
// ║  API KEY  >>>  set API_KEY in server/.env  (never commit it)  ║
// ╚══════════════════════════════════════════════════════════════╝
```

Pass the key as an HTTP header:
```http
X-API-Key: kestrel_demo_key_7f8d9a2b1c4e6f
```

Optional GitHub token for raised rate limits (5,000/hour vs 60/hour):
```env
GITHUB_TOKEN=ghp_your_read_only_token_here
GITHUB_API_BASE=https://api.github.com
REPO_ANALYSIS_ENABLED=true
REPO_CACHE_TTL_SECONDS=600
GITHUB_TIMEOUT_MS=8000
```

---

## 2. Standard Response & Error Format

Successful responses return:
```json
{
  "data": { ... },
  "pagination": { ... }
}
```

Error responses always return:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error explanation",
    "details": [ ... ]
  }
}
```

---

## 3. Endpoints Table

| Method | Path | Auth Required | Purpose |
|---|---|---|---|
| `GET` | `/api/v1/health` | No | System health, database connection, and simulation flag probe |
| `POST` | `/api/v1/projects/analyze-url` | **Yes** | Inspect a public GitHub repo before saving (`{ repository_url }`) |
| `GET` | `/api/v1/projects` | No | List registered projects |
| `POST` | `/api/v1/projects` | **Yes** | Create project and default pipeline |
| `GET` | `/api/v1/projects/:id` | No | Project detail |
| `DELETE` | `/api/v1/projects/:id` | **Yes** | Delete project (cascades to pipelines and runs) |
| `GET` | `/api/v1/projects/:id/pipelines` | No | List pipelines belonging to project |
| `POST` | `/api/v1/projects/:id/analyze` | **Yes** | Refresh repository stack analysis (`{ force: true }`) |
| `GET` | `/api/v1/projects/:id/analysis` | No | Get latest cached repository stack intelligence |
| `POST` | `/api/v1/pipelines/:id/run` | **Yes** | **Dispatch run (returns 202 Accepted immediately)** |
| `GET` | `/api/v1/runs` | No | Paginated execution history with query filters |
| `DELETE` | `/api/v1/runs/history` | **Yes** | Wipe run history archive |
| `GET` | `/api/v1/runs/:id` | No | Get run details and all 7 ordered stage runs |
| `GET` | `/api/v1/runs/:id/analysis` | No | Get repository analysis snapshot associated with run |
| `GET` | `/api/v1/runs/:id/logs` | No | Diagnostic logs (`?stage=...&level=...&source=real|simulated`) |
| `POST` | `/api/v1/runs/:id/retry` | **Yes** | Retry failed run starting from failed stage |
| `POST` | `/api/v1/runs/:id/cancel` | **Yes** | Abort active in-flight pipeline run |
| `GET` | `/api/v1/dashboard/stats` | No | Aggregate metrics & recent activity |
| `GET` | `/api/v1/search?q=` | No | Global site search across records & docs |
| `POST` | `/api/v1/contact` | No | Public contact inquiry submission |

---

## 4. cURL Dispatch Examples

### 1. Inspect a Public GitHub Repository
```bash
curl -X POST http://localhost:4000/api/v1/projects/analyze-url \
  -H "Content-Type: application/json" \
  -H "X-API-Key: kestrel_demo_key_7f8d9a2b1c4e6f" \
  -d '{"repository_url": "https://github.com/expressjs/express"}'
```

### 2. Trigger Clean Run
```bash
curl -X POST http://localhost:4000/api/v1/pipelines/pipe_core_main/run \
  -H "Content-Type: application/json" \
  -H "X-API-Key: kestrel_demo_key_7f8d9a2b1c4e6f" \
  -d '{"branch": "main", "commitMessage": "Release candidate build"}'
```

### 3. Trigger Run with Injected Failure
```bash
curl -X POST http://localhost:4000/api/v1/pipelines/pipe_core_main/run \
  -H "Content-Type: application/json" \
  -H "X-API-Key: kestrel_demo_key_7f8d9a2b1c4e6f" \
  -d '{"failAt": "security_scan", "failureRate": 1.0}'
```

### 4. Fetch Logs Filtered by Provenance Source
```bash
curl "http://localhost:4000/api/v1/runs/run_mv6lmhds_c3684c/logs?source=real"
```
