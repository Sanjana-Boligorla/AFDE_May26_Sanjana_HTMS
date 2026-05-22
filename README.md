# 🎫 Helpdesk Ticket Management System

> A full-stack internal IT support portal with analytics pipeline built with React, FastAPI, and MySQL.

![Phase](https://img.shields.io/badge/Phase-2%20Complete-brightgreen)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/Frontend-React%2018-61DAFB)
![Database](https://img.shields.io/badge/Database-MySQL-4479A1)
![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-38BDF8)
![ETL](https://img.shields.io/badge/ETL-Pandas%20%2B%20SQLAlchemy-150458)

---

## 📋 Project Overview

Modern organizations struggle with managing internal IT support requests via email or spreadsheets — leading to poor tracking, delayed resolutions, and no historical visibility.

This **Helpdesk Ticket Management System** solves that by providing a centralized web portal where employees raise support tickets, IT admins manage and resolve them, and analysts explore historical performance data through a dedicated analytics dashboard.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 Dashboard | Live stats — total tickets, counts by status & priority, recent activity |
| ➕ Create Ticket | Form with validation — employee, department, category, description, priority |
| 📋 Ticket List | Filterable table — search by keyword, filter by status/category/priority |
| 🔍 Search | Full-text search across all ticket fields |
| 🎫 Ticket Detail | Full view, inline edit, status management, resolution notes |
| 💬 Comments | Threaded comment history per ticket with timestamps |
| 🗑 Delete | Remove tickets with cascading comment deletion |
| 🔄 ETL Pipeline | Extract → Transform → Load historical CSV data into MySQL |
| 📈 Analytics | Historical dashboard — KPIs, category/department/priority breakdowns, trend charts |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons |
| **Backend** | Python FastAPI, SQLAlchemy ORM, Pydantic v2 |
| **Database** | MySQL 8.x (with PyMySQL driver) |
| **ETL** | Python, Pandas, SQLAlchemy |
| **Dev Tools** | Uvicorn, python-dotenv |

---

## 🗃 Database Schema

### `tickets` table
| Column | Type | Description |
|---|---|---|
| id | INT AUTO_INCREMENT PK | Unique ticket ID |
| employee_name | VARCHAR(100) | Requester's full name |
| department | VARCHAR(100) | Requester's department |
| issue_category | VARCHAR(100) | Type of issue |
| description | TEXT | Full issue description |
| priority | ENUM | Low / Medium / High / Critical |
| status | ENUM | Open / In Progress / Resolved / Closed |
| resolution_notes | TEXT NULL | Admin resolution summary |
| created_at | DATETIME | Auto-set on creation |
| updated_at | DATETIME | Auto-updated on change |

### `ticket_comments` table
| Column | Type | Description |
|---|---|---|
| id | INT AUTO_INCREMENT PK | Comment ID |
| ticket_id | INT FK → tickets.id | Parent ticket (CASCADE DELETE) |
| author | VARCHAR(100) | Comment author name |
| comment_text | TEXT | Comment body |
| created_at | DATETIME | Auto-set on creation |

### `historical_tickets` table (Phase 2 — ETL target)
| Column | Type | Description |
|---|---|---|
| id | INT AUTO_INCREMENT PK | Row ID |
| employee_name | VARCHAR(100) | Requester name |
| department | VARCHAR(100) | Requester department |
| issue_category | VARCHAR(100) | Issue type |
| description | TEXT | Issue description |
| priority | VARCHAR(20) | Low / Medium / High / Critical |
| status | VARCHAR(20) | Open / In Progress / Resolved / Closed |
| created_date | DATE | Ticket creation date |
| resolved_date | DATE NULL | Date resolved (if applicable) |
| resolution_time_hours | FLOAT NULL | Hours from creation to resolution |
| created_month | VARCHAR(7) | Format: YYYY-MM |
| created_quarter | VARCHAR(6) | Format: YYYY-QN |
| is_resolved | TINYINT(1) | Boolean — resolved or not |
| resolution_bucket | VARCHAR(20) | Fast / Normal / Slow / Very Slow |

---

## 📁 Project Structure

```
Helpdesk_ticket_management_system/
│
├── backend/
│   ├── main.py              # FastAPI app entry point + CORS
│   ├── database.py          # MySQL connection (SQLAlchemy)
│   ├── models.py            # ORM models (Ticket, TicketComment, HistoricalTicket)
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── crud.py              # All DB operations
│   ├── routers/
│   │   ├── tickets.py       # Ticket API endpoints
│   │   └── analytics.py     # Analytics API endpoints (Phase 2)
│   ├── .env                 # DB credentials (gitignored)
│   ├── .env.example         # Credential template
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      Sidebar · Navbar · Layout
│   │   │   ├── ui/          StatusBadge · PriorityBadge · StatCard · Toast · Skeleton
│   │   │   └── ErrorBoundary.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TicketList.jsx
│   │   │   ├── CreateTicket.jsx
│   │   │   ├── TicketDetail.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   ├── AnalyticsDashboard.jsx   # Phase 2
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   └── api.js       # Axios API calls (tickets + analytics)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── etl/                     # Phase 2 — ETL Pipeline
│   ├── config.py            # DB URL + dataset path from .env
│   ├── extract.py           # Stage 1: Read CSV, validate
│   ├── transform.py         # Stage 2: Clean, normalize, enrich
│   ├── load.py              # Stage 3: Create table, insert rows
│   ├── pipeline.py          # Orchestrator (run this)
│   └── requirements.txt
│
├── datasets/
│   ├── tickets_historical.csv   # 260-row historical dataset
│   └── README.md
│
├── database/
│   └── schema.sql           # DDL for all 3 tables + seed data
│
├── docs/
│   └── api-docs.md          # Full API reference (tickets + analytics)
│
├── scripts/
│   └── take-screenshots.js  # Puppeteer auto-screenshot (Phase 1 + 2)
│
├── screenshots/             # Application screenshots
├── README.md
└── .gitignore
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8.x running locally

### 1. Clone the Repository

```bash
git clone https://github.com/Sanjana-Boligorla/AFDE_May26_Sanjana_HTMS.git
cd AFDE_May26_Sanjana_HTMS
```

### 2. Database Setup

```bash
# Run in MySQL Workbench or terminal:
mysql -u root -p < database/schema.sql
```

Creates `helpdesk_db` with all three tables and 8 sample tickets.

### 3. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Copy and edit credentials if needed
cp .env.example .env

# Start the server
uvicorn main:app --reload --port 8000
```

API running at: **http://localhost:8000**  
Swagger docs at: **http://localhost:8000/docs**

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App running at: **http://localhost:5173**

### 5. ETL Pipeline (Phase 2)

```bash
cd etl
pip install -r requirements.txt

# Run the full pipeline (reads datasets/tickets_historical.csv → MySQL)
python pipeline.py
```

Populates the `historical_tickets` table. Re-running is safe — duplicates are skipped automatically.

---

## 🔌 API Endpoints

### Tickets

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tickets/stats` | Dashboard statistics |
| `GET` | `/api/tickets/` | List all tickets (supports filters) |
| `POST` | `/api/tickets/` | Create a new ticket |
| `GET` | `/api/tickets/search?q=` | Full-text search |
| `GET` | `/api/tickets/{id}` | Get ticket with comments |
| `PUT` | `/api/tickets/{id}` | Update ticket |
| `DELETE` | `/api/tickets/{id}` | Delete ticket (cascades comments) |
| `POST` | `/api/tickets/{id}/comments` | Add a comment |
| `GET` | `/api/tickets/{id}/comments` | Get all comments |
| `DELETE` | `/api/tickets/{id}/comments/{cid}` | Delete a comment |

### Analytics (Phase 2)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/overview` | KPIs: total, resolution rate, avg hours, date range |
| `GET` | `/api/analytics/category-summary` | Volume + resolution stats per issue category |
| `GET` | `/api/analytics/priority-distribution` | Count + % share per priority level |
| `GET` | `/api/analytics/department-summary` | Ticket load + resolution rate per department |
| `GET` | `/api/analytics/resolution-trends` | Month-by-month resolution performance |
| `GET` | `/api/analytics/monthly-volume` | Monthly ticket counts split by status |

Full documentation: [docs/api-docs.md](docs/api-docs.md)

---

## 🔄 ETL Workflow (Phase 2)

```
datasets/tickets_historical.csv
          │
          ▼
  etl/extract.py       → reads CSV, validates shape & missing values
          │
          ▼
  etl/transform.py     → strips whitespace, normalizes enums,
                          removes duplicates, parses dates,
                          derives: created_month, created_quarter,
                                   is_resolved, resolution_bucket
          │
          ▼
  etl/load.py          → creates historical_tickets table (if needed),
                          inserts new rows, skips existing duplicates
          │
          ▼
  MySQL: historical_tickets   ←── queried by Analytics API
```

---

## 📸 Screenshots

| Page | Preview |
|---|---|
| Dashboard | `screenshots/dashboard.png` |
| Ticket List | `screenshots/ticket-list.png` |
| Create Ticket | `screenshots/create-ticket.png` |
| Ticket Detail | `screenshots/ticket-detail.png` |
| Search | `screenshots/search.png` |
| Analytics (Phase 2) | `screenshots/analytics.png` |

To regenerate all screenshots automatically:

```bash
# From project root (requires puppeteer installed)
npm install puppeteer --save-dev
node scripts/take-screenshots.js
```

> Requires both frontend (port 5173) and backend (port 8000) to be running, and the ETL pipeline to have been executed.

---

## 🔮 Future Enhancements

- 🔐 Authentication & role-based access (Admin vs Employee)
- 📧 Email notifications on ticket updates
- 🤖 AI-powered semantic search (RAG)
- ☁️ Cloud deployment (AWS / Azure)
- 📱 Mobile-responsive PWA
- 📊 Interactive chart library (Recharts/Chart.js) integration

---

## 👩‍💻 Author

**Sanjana Boligorla** — Prodapt  
Batch: AFDE May 2026 | Project: HTMS
