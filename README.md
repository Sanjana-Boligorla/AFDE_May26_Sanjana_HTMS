# Helpdesk Ticket Management System

A full-stack web application for managing internal IT support tickets.

## Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend  | Python FastAPI                |
| Database | MySQL                         |
| ORM      | SQLAlchemy + PyMySQL          |

## Project Structure

```
Helpdesk_ticket_management_system/
├── frontend/          # React + Vite + Tailwind
├── backend/           # FastAPI REST API
├── database/          # SQL schema & migration scripts
├── screenshots/       # Application screenshots
├── docs/              # API documentation
├── README.md
├── requirements.txt
└── .gitignore
```

## Features (Phase 1)

- ✅ Create, view, update, and delete support tickets
- ✅ Filter tickets by status, category, and priority
- ✅ Keyword search across all ticket fields
- ✅ Dashboard with ticket statistics and recent activity
- ✅ RESTful API with FastAPI + Swagger docs

## Setup Instructions

### 1. Database

```bash
# Run the schema script in MySQL Workbench or CLI:
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
# Edit .env with your MySQL credentials (if different from defaults)
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at: http://localhost:5173

## API Endpoints

| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| GET    | /api/tickets/stats     | Dashboard statistics     |
| GET    | /api/tickets/          | List all tickets         |
| POST   | /api/tickets/          | Create a ticket          |
| GET    | /api/tickets/search    | Search tickets           |
| GET    | /api/tickets/{id}      | Get ticket by ID         |
| PUT    | /api/tickets/{id}      | Update ticket            |
| DELETE | /api/tickets/{id}      | Delete ticket            |

## Ticket Categories

VPN Issue · Password Reset · Software Installation · Laptop Issue · Email Access · Network Connectivity · Hardware Request

## Priority Levels

Low · Medium · High · Critical

## Status Values

Open · In Progress · Resolved · Closed
