"""
crud.py — All database operations for tickets and ticket_comments
"""

from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional

import models
import schemas


# ════════════════════════════════════════════════════════════════════════════
# TICKET OPERATIONS
# ════════════════════════════════════════════════════════════════════════════

def create_ticket(db: Session, ticket: schemas.TicketCreate) -> models.Ticket:
    db_ticket = models.Ticket(
        employee_name  = ticket.employee_name,
        department     = ticket.department,
        issue_category = ticket.issue_category,
        description    = ticket.description,
        priority       = ticket.priority.value,
        status         = "Open",
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def get_ticket(db: Session, ticket_id: int) -> Optional[models.Ticket]:
    """Returns ticket WITH comments eagerly loaded."""
    return db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()


def get_tickets(
    db       : Session,
    skip     : int            = 0,
    limit    : int            = 100,
    status   : Optional[str] = None,
    category : Optional[str] = None,
    priority : Optional[str] = None,
) -> tuple[list[models.Ticket], int]:
    query = db.query(models.Ticket)

    if status:
        query = query.filter(models.Ticket.status == status)
    if category:
        query = query.filter(models.Ticket.issue_category == category)
    if priority:
        query = query.filter(models.Ticket.priority == priority)

    total   = query.count()
    tickets = (
        query
        .order_by(models.Ticket.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return tickets, total


def search_tickets(
    db      : Session,
    keyword : str,
    skip    : int = 0,
    limit   : int = 100,
) -> tuple[list[models.Ticket], int]:
    like_pattern = f"%{keyword}%"
    query = db.query(models.Ticket).filter(
        or_(
            models.Ticket.employee_name.ilike(like_pattern),
            models.Ticket.department.ilike(like_pattern),
            models.Ticket.issue_category.ilike(like_pattern),
            models.Ticket.description.ilike(like_pattern),
            models.Ticket.resolution_notes.ilike(like_pattern),
        )
    )
    total   = query.count()
    tickets = (
        query
        .order_by(models.Ticket.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return tickets, total


def update_ticket(
    db        : Session,
    ticket_id : int,
    updates   : schemas.TicketUpdate,
) -> Optional[models.Ticket]:
    db_ticket = get_ticket(db, ticket_id)
    if not db_ticket:
        return None

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(value, "value"):   # convert enum → string
            value = value.value
        setattr(db_ticket, field, value)

    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def delete_ticket(db: Session, ticket_id: int) -> bool:
    db_ticket = get_ticket(db, ticket_id)
    if not db_ticket:
        return False
    db.delete(db_ticket)
    db.commit()
    return True


# ════════════════════════════════════════════════════════════════════════════
# COMMENT OPERATIONS
# ════════════════════════════════════════════════════════════════════════════

def add_comment(
    db        : Session,
    ticket_id : int,
    comment   : schemas.CommentCreate,
) -> Optional[models.TicketComment]:
    """Add a comment to a ticket. Returns None if ticket not found."""
    ticket = get_ticket(db, ticket_id)
    if not ticket:
        return None

    db_comment = models.TicketComment(
        ticket_id    = ticket_id,
        author       = comment.author,
        comment_text = comment.comment_text,
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


def get_comments(db: Session, ticket_id: int) -> list[models.TicketComment]:
    return (
        db.query(models.TicketComment)
        .filter(models.TicketComment.ticket_id == ticket_id)
        .order_by(models.TicketComment.created_at.asc())
        .all()
    )


def delete_comment(db: Session, comment_id: int) -> bool:
    comment = db.query(models.TicketComment).filter(models.TicketComment.id == comment_id).first()
    if not comment:
        return False
    db.delete(comment)
    db.commit()
    return True


# ════════════════════════════════════════════════════════════════════════════
# DASHBOARD STATS
# ════════════════════════════════════════════════════════════════════════════

def get_dashboard_stats(db: Session) -> dict:
    total = db.query(func.count(models.Ticket.id)).scalar()

    status_counts = (
        db.query(models.Ticket.status, func.count(models.Ticket.id))
        .group_by(models.Ticket.status)
        .all()
    )

    priority_counts = (
        db.query(models.Ticket.priority, func.count(models.Ticket.id))
        .group_by(models.Ticket.priority)
        .all()
    )

    recent_tickets = (
        db.query(models.Ticket)
        .order_by(models.Ticket.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total"          : total,
        "by_status"      : {s: c for s, c in status_counts},
        "by_priority"    : {p: c for p, c in priority_counts},
        "recent_tickets" : recent_tickets,
    }
