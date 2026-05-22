# API Documentation — Helpdesk Ticket Management System

**Base URL:** `http://localhost:8000`  
**Interactive Docs:** `http://localhost:8000/docs` (Swagger UI)  
**Alternative Docs:** `http://localhost:8000/redoc`

All requests and responses use `Content-Type: application/json`.

---

## Enums

| Field | Values |
|---|---|
| `priority` | `Low` · `Medium` · `High` · `Critical` |
| `status` | `Open` · `In Progress` · `Resolved` · `Closed` |

---

## Health Check

### `GET /`
```json
{ "status": "ok", "message": "Helpdesk API is running 🚀" }
```

---

## Dashboard

### `GET /api/tickets/stats`
Returns aggregated statistics for the dashboard.

**Response 200:**
```json
{
  "total": 8,
  "by_status":   { "Open": 4, "In Progress": 2, "Resolved": 1, "Closed": 1 },
  "by_priority": { "Low": 1, "Medium": 2, "High": 3, "Critical": 1 },
  "recent_tickets": [ /* last 5 TicketResponse objects */ ]
}
```

---

## Tickets

### `GET /api/tickets/`
List all tickets with optional filters.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `status` | string | Filter by status value |
| `category` | string | Filter by issue_category |
| `priority` | string | Filter by priority value |
| `skip` | int (default 0) | Pagination offset |
| `limit` | int (default 100) | Max results (max 500) |

**Response 200:**
```json
{
  "total": 8,
  "tickets": [
    {
      "id": 1,
      "employee_name": "Alice Johnson",
      "department": "Engineering",
      "issue_category": "VPN Issue",
      "description": "Unable to connect to VPN from home.",
      "priority": "High",
      "status": "Open",
      "resolution_notes": null,
      "created_at": "2026-05-22T10:00:00",
      "updated_at": "2026-05-22T10:00:00"
    }
  ]
}
```

---

### `POST /api/tickets/`
Create a new support ticket.

**Request Body:**
```json
{
  "employee_name":  "Alice Johnson",
  "department":     "Engineering",
  "issue_category": "VPN Issue",
  "description":    "Unable to connect to VPN from home network.",
  "priority":       "High"
}
```

**Response 201:** Returns the created `TicketResponse` object. Status defaults to `"Open"`.

**Validation Errors (422):**
- `employee_name` — min 2, max 100 chars
- `description` — min 10 chars
- `priority` — must be a valid enum value

---

### `GET /api/tickets/search?q={keyword}`
Full-text keyword search across employee name, department, category, description, and resolution notes.

**Query Parameters:**
| Param | Required | Description |
|---|---|---|
| `q` | ✅ | Search keyword (min 1 char) |
| `skip` | ❌ | Pagination offset |
| `limit` | ❌ | Max results |

**Response 200:** Same shape as `GET /api/tickets/`.

---

### `GET /api/tickets/{id}`
Get a single ticket with its full comment thread.

**Response 200:**
```json
{
  "id": 1,
  "employee_name": "Alice Johnson",
  "department": "Engineering",
  "issue_category": "VPN Issue",
  "description": "Unable to connect to VPN.",
  "priority": "High",
  "status": "Open",
  "resolution_notes": null,
  "created_at": "2026-05-22T10:00:00",
  "updated_at": "2026-05-22T10:00:00",
  "comments": [
    {
      "id": 1,
      "ticket_id": 1,
      "author": "IT Support",
      "comment_text": "Ticket received. Checking VPN server logs.",
      "created_at": "2026-05-22T10:05:00"
    }
  ]
}
```

**Response 404:**
```json
{ "detail": "Ticket 99 not found." }
```

---

### `PUT /api/tickets/{id}`
Update one or more fields of a ticket. All fields are optional.

**Request Body (all optional):**
```json
{
  "status":           "In Progress",
  "resolution_notes": "VPN certificate has been renewed.",
  "priority":         "Medium",
  "employee_name":    "Alice Johnson",
  "department":       "Engineering",
  "issue_category":   "VPN Issue",
  "description":      "Updated description."
}
```

**Response 200:** Returns updated `TicketResponse`.

---

### `DELETE /api/tickets/{id}`
Delete a ticket and all its associated comments (cascade).

**Response 200:**
```json
{ "message": "Ticket 1 deleted successfully." }
```

---

## Comments

### `POST /api/tickets/{id}/comments`
Add a comment to a ticket.

**Request Body:**
```json
{
  "author":       "IT Support",
  "comment_text": "Escalating to network team."
}
```

**Response 201:** Returns the created `CommentResponse` object.

---

### `GET /api/tickets/{id}/comments`
Get all comments for a ticket, ordered by creation time ascending.

**Response 200:**
```json
[
  {
    "id": 1,
    "ticket_id": 1,
    "author": "IT Support",
    "comment_text": "Ticket received.",
    "created_at": "2026-05-22T10:05:00"
  }
]
```

---

### `DELETE /api/tickets/{id}/comments/{comment_id}`
Delete a specific comment.

**Response 200:**
```json
{ "message": "Comment 1 deleted successfully." }
```

---

## Error Responses

| Status | Meaning |
|---|---|
| `422 Unprocessable Entity` | Validation error — check field constraints |
| `404 Not Found` | Ticket or comment ID does not exist |
| `500 Internal Server Error` | Database or server error |

---

## Postman Quick-Start

Import this base URL into Postman: `http://localhost:8000`

Suggested collection order for testing:
1. `GET /` — health check
2. `GET /api/tickets/stats` — dashboard data
3. `POST /api/tickets/` — create a ticket
4. `GET /api/tickets/` — list all
5. `GET /api/tickets/search?q=VPN` — keyword search
6. `GET /api/tickets/1` — get with comments
7. `PUT /api/tickets/1` — update status to "In Progress"
8. `POST /api/tickets/1/comments` — add a comment
9. `DELETE /api/tickets/1/comments/1` — delete the comment
10. `DELETE /api/tickets/1` — delete the ticket

---

---

# Analytics API (Phase 2)

> All analytics endpoints query the `historical_tickets` table populated by the ETL pipeline.  
> Run `python etl/pipeline.py` before using these endpoints.

---

## `GET /api/analytics/overview`

High-level KPIs across all historical tickets.

**Response 200:**
```json
{
  "total_historical": 256,
  "total_resolved": 189,
  "total_unresolved": 67,
  "resolution_rate_pct": 73.8,
  "avg_resolution_hours": 41.2,
  "fastest_resolution_hrs": 1.5,
  "slowest_resolution_hrs": 167.4,
  "unique_departments": 8,
  "unique_categories": 10,
  "date_range_start": "2025-05-01",
  "date_range_end": "2026-04-28"
}
```

---

## `GET /api/analytics/category-summary`

Ticket volume and resolution stats grouped by issue category. Sorted by ticket count descending.

**Response 200:**
```json
[
  {
    "issue_category": "VPN Issue",
    "ticket_count": 34,
    "resolved_count": 28,
    "resolution_rate_pct": 82.4,
    "avg_resolution_hours": 36.5
  },
  {
    "issue_category": "Hardware Failure",
    "ticket_count": 29,
    "resolved_count": 19,
    "resolution_rate_pct": 65.5,
    "avg_resolution_hours": 58.2
  }
]
```

---

## `GET /api/analytics/priority-distribution`

Breakdown of all tickets by priority level (Critical → Low) with percentage share.

**Response 200:**
```json
[
  {
    "priority": "Critical",
    "ticket_count": 28,
    "percentage": 10.9,
    "avg_resolution_hours": 18.3
  },
  {
    "priority": "High",
    "ticket_count": 67,
    "percentage": 26.2,
    "avg_resolution_hours": 32.7
  },
  {
    "priority": "Medium",
    "ticket_count": 98,
    "percentage": 38.3,
    "avg_resolution_hours": 44.1
  },
  {
    "priority": "Low",
    "ticket_count": 63,
    "percentage": 24.6,
    "avg_resolution_hours": 55.9
  }
]
```

---

## `GET /api/analytics/department-summary`

Ticket load, resolved count, resolution rate, and avg resolution time per department. Sorted by ticket count descending.

**Response 200:**
```json
[
  {
    "department": "Engineering",
    "ticket_count": 48,
    "resolved_count": 38,
    "resolution_rate_pct": 79.2,
    "avg_resolution_hours": 33.4
  },
  {
    "department": "HR",
    "ticket_count": 31,
    "resolved_count": 20,
    "resolution_rate_pct": 64.5,
    "avg_resolution_hours": 52.1
  }
]
```

---

## `GET /api/analytics/resolution-trends`

Month-by-month ticket volume, resolved count, and average resolution time. Ordered by month ascending.

**Response 200:**
```json
[
  {
    "created_month": "2025-05",
    "ticket_count": 18,
    "resolved_count": 14,
    "avg_resolution_hours": 39.2
  },
  {
    "created_month": "2025-06",
    "ticket_count": 22,
    "resolved_count": 17,
    "avg_resolution_hours": 43.8
  }
]
```

---

## `GET /api/analytics/monthly-volume`

Monthly ticket counts broken down by status. Useful for stacked bar charts. Ordered by month ascending.

**Response 200:**
```json
[
  {
    "created_month": "2025-05",
    "ticket_count": 18,
    "open_count": 2,
    "resolved_count": 12,
    "closed_count": 2,
    "in_progress_count": 2
  },
  {
    "created_month": "2025-06",
    "ticket_count": 22,
    "open_count": 4,
    "resolved_count": 13,
    "closed_count": 3,
    "in_progress_count": 2
  }
]
```

---

## Postman Quick-Start (Phase 2 — Analytics)

Run these in order after the ETL pipeline has been executed:

1. `GET /api/analytics/overview` — verify data loaded
2. `GET /api/analytics/category-summary` — check category breakdown
3. `GET /api/analytics/priority-distribution` — check priority %
4. `GET /api/analytics/department-summary` — check per-dept stats
5. `GET /api/analytics/resolution-trends` — check monthly trend data
6. `GET /api/analytics/monthly-volume` — check stacked volume data
