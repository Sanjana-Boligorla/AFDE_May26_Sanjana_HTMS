# 🎫 Helpdesk Ticket Management System

> A full-stack internal IT support portal built with React, FastAPI, and MySQL.

![Phase](https://img.shields.io/badge/Phase-1%20Complete-brightgreen)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/Frontend-React%2018-61DAFB)
![Database](https://img.shields.io/badge/Database-MySQL-4479A1)
![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-38BDF8)

---

## 📋 Project Overview

Modern organizations struggle with managing internal IT support requests via email or spreadsheets — leading to poor tracking, delayed resolutions, and no historical visibility.

This **Helpdesk Ticket Management System** solves that by providing a centralized web portal where employees raise support tickets and IT admins manage and resolve them.

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

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons |
| **Backend** | Python FastAPI, SQLAlchemy ORM, Pydantic v2 |
| **Database** | MySQL 8.x (with PyMySQL driver) |
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

---

## 📁 Project Structure

```
Helpdesk_ticket_management_system/
│
├── backend/
│   ├── main.py           # FastAPI app entry point + CORS
│   ├── database.py       # MySQL connection (SQLAlchemy)
│   ├── models.py         # ORM models (Ticket, TicketComment)
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── crud.py           # All DB operations
│   ├── routers/
│   │   └── tickets.py    # All API endpoints
│   ├── .env              # DB credentials (gitignored)
│   ├── .env.example      # Credential template
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/   Sidebar · Navbar · Layout
│   │   │   ├── ui/       StatusBadge · PriorityBadge · StatCard · Toast · Skeleton
│   │   │   └── ErrorBoundary.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TicketList.jsx
│   │   │   ├── CreateTicket.jsx
│   │   │   ├── TicketDetail.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   └── api.js    # Axios API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   └── schema.sql        # DDL + seed data
│
├── docs/
│   └── api-docs.md       # Full API reference
│
├── screenshots/          # Application screenshots
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

Creates `helpdesk_db` with both tables and 8 sample tickets.

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

---

## 🔌 API Endpoints

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

Full documentation: [docs/api-docs.md](docs/api-docs.md)

---

## 📸 Screenshots

| Page | Preview |
|---|---|
| Dashboard | `screenshots/dashboard.png` |
| Ticket List | `screenshots/ticket-list.png` |
| Create Ticket | `screenshots/create-ticket.png` |
| Ticket Detail | `screenshots/ticket-detail.png` |
| Search | `screenshots/search.png` |

---

## 🔮 Future Enhancements (Phase 2+)

- 🔐 Authentication & role-based access (Admin vs Employee)
- 📧 Email notifications on ticket updates
- 📊 Analytics dashboard with charts
- 🤖 AI-powered semantic search (RAG)
- ☁️ Cloud deployment (AWS / Azure)
- 📱 Mobile-responsive PWA

---

## 👩‍💻 Author

**Sanjana Boligorla** — Prodapt  
Batch: AFDE May 2026 | Project: HTMS
