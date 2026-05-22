"""
routers/tickets.py - All /api/tickets endpoints including comments
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List

import crud
import schemas
from database import get_db

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


# ── POST /api/tickets/ ────────────────────────────────────────────────────────

@router.post("/", response_model=schemas.TicketResponse, status_code=status.HTTP_201_CREATED,
             summary="Create a new support ticket")
def create_ticket(ticket: schemas.TicketCreate, db: Session = Depends(get_db)):
    return crud.create_ticket(db=db, ticket=ticket)


# ── GET /api/tickets/ ─────────────────────────────────────────────────────────

@router.get("/", response_model=schemas.TicketListResponse,
            summary="Get all tickets with optional filters")
def get_tickets(
    skip     : int            = Query(default=0,   ge=0),
    limit    : int            = Query(default=100, ge=1, le=500),
    status   : Optional[str] = Query(default=None),
    category : Optional[str] = Query(default=None),
    priority : Optional[str] = Query(default=None),
    db       : Session        = Depends(get_db),
):
    tickets, total = crud.get_tickets(db=db, skip=skip, limit=limit,
                                      status=status, category=category, priority=priority)
    return {"total": total, "tickets": tickets}


# NOTE: /search and /stats must come BEFORE /{ticket_id} to avoid route conflicts

# ── GET /api/tickets/search ───────────────────────────────────────────────────

@router.get("/search", response_model=schemas.TicketListResponse,
            summary="Search tickets by keyword")
def search_tickets(
    q     : str     = Query(..., min_length=1),
    skip  : int     = Query(default=0,   ge=0),
    limit : int     = Query(default=100, ge=1, le=500),
    db    : Session = Depends(get_db),
):
    tickets, total = crud.search_tickets(db=db, keyword=q, skip=skip, limit=limit)
    return {"total": total, "tickets": tickets}


# ── GET /api/tickets/stats ────────────────────────────────────────────────────

@router.get("/stats", response_model=schemas.DashboardStats,
            summary="Get dashboard statistics")
def get_stats(db: Session = Depends(get_db)):
    stats = crud.get_dashboard_stats(db=db)
    return {
        "total"          : stats["total"],
        "by_status"      : stats["by_status"],
        "by_priority"    : stats["by_priority"],
        "recent_tickets" : [schemas.TicketResponse.model_validate(t) for t in stats["recent_tickets"]],
    }


# ── GET /api/tickets/{id} ─────────────────────────────────────────────────────

@router.get("/{ticket_id}", response_model=schemas.TicketDetailResponse,
            summary="Get full ticket details including comment thread")
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = crud.get_ticket(db=db, ticket_id=ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found.")
    return ticket


# ── PUT /api/tickets/{id} ─────────────────────────────────────────────────────

@router.put("/{ticket_id}", response_model=schemas.TicketResponse,
            summary="Update ticket details or status")
def update_ticket(ticket_id: int, updates: schemas.TicketUpdate, db: Session = Depends(get_db)):
    ticket = crud.update_ticket(db=db, ticket_id=ticket_id, updates=updates)
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found.")
    return ticket


# ── DELETE /api/tickets/{id} ──────────────────────────────────────────────────

@router.delete("/{ticket_id}", response_model=schemas.MessageResponse,
               summary="Delete a ticket and all its comments")
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_ticket(db=db, ticket_id=ticket_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found.")
    return {"message": f"Ticket {ticket_id} deleted successfully."}


# ════════════════════════════════════════════════════════════════════════════
# COMMENT ENDPOINTS
# ════════════════════════════════════════════════════════════════════════════

@router.post("/{ticket_id}/comments", response_model=schemas.CommentResponse,
             status_code=status.HTTP_201_CREATED, summary="Add a comment to a ticket")
def add_comment(ticket_id: int, comment: schemas.CommentCreate, db: Session = Depends(get_db)):
    result = crud.add_comment(db=db, ticket_id=ticket_id, comment=comment)
    if not result:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found.")
    return result


@router.get("/{ticket_id}/comments", response_model=List[schemas.CommentResponse],
            summary="Get all comments for a ticket")
def get_comments(ticket_id: int, db: Session = Depends(get_db)):
    ticket = crud.get_ticket(db=db, ticket_id=ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found.")
    return crud.get_comments(db=db, ticket_id=ticket_id)


@router.delete("/{ticket_id}/comments/{comment_id}", response_model=schemas.MessageResponse,
               summary="Delete a specific comment")
def delete_comment(ticket_id: int, comment_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_comment(db=db, comment_id=comment_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Comment {comment_id} not found.")
    return {"message": f"Comment {comment_id} deleted successfully."}
