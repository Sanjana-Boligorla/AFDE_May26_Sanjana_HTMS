"""
crud.py — All database operations for tickets and ticket_comments
"""

from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional, List

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


# ════════════════════════════════════════════════════════════════════════════
# ANALYTICS CRUD (Phase 2 — queries historical_tickets)
# ════════════════════════════════════════════════════════════════════════════

def get_analytics_overview(db: Session) -> dict:
    """High-level summary stats from historical_tickets."""
    total = db.query(func.count(models.HistoricalTicket.id)).scalar() or 0

    resolved = (
        db.query(func.count(models.HistoricalTicket.id))
        .filter(models.HistoricalTicket.is_resolved == True)
        .scalar() or 0
    )

    avg_hrs = (
        db.query(func.avg(models.HistoricalTicket.resolution_time_hours))
        .filter(models.HistoricalTicket.resolution_time_hours.isnot(None))
        .scalar()
    )
    min_hrs = (
        db.query(func.min(models.HistoricalTicket.resolution_time_hours))
        .filter(models.HistoricalTicket.resolution_time_hours.isnot(None))
        .scalar()
    )
    max_hrs = (
        db.query(func.max(models.HistoricalTicket.resolution_time_hours))
        .filter(models.HistoricalTicket.resolution_time_hours.isnot(None))
        .scalar()
    )

    unique_depts = (
        db.query(func.count(func.distinct(models.HistoricalTicket.department))).scalar() or 0
    )
    unique_cats = (
        db.query(func.count(func.distinct(models.HistoricalTicket.issue_category))).scalar() or 0
    )

    date_start = db.query(func.min(models.HistoricalTicket.created_date)).scalar()
    date_end   = db.query(func.max(models.HistoricalTicket.created_date)).scalar()

    return {
        "total_historical"       : total,
        "total_resolved"         : resolved,
        "total_unresolved"       : total - resolved,
        "resolution_rate_pct"    : round(resolved / total * 100, 1) if total else 0.0,
        "avg_resolution_hours"   : round(float(avg_hrs), 1) if avg_hrs else None,
        "fastest_resolution_hrs" : round(float(min_hrs), 1) if min_hrs else None,
        "slowest_resolution_hrs" : round(float(max_hrs), 1) if max_hrs else None,
        "unique_departments"     : unique_depts,
        "unique_categories"      : unique_cats,
        "date_range_start"       : str(date_start) if date_start else "",
        "date_range_end"         : str(date_end)   if date_end   else "",
    }


def get_category_summary(db: Session) -> List[dict]:
    rows = (
        db.query(
            models.HistoricalTicket.issue_category,
            func.count(models.HistoricalTicket.id).label("ticket_count"),
            func.sum(
                func.IF(models.HistoricalTicket.is_resolved == True, 1, 0)
            ).label("resolved_count"),
            func.avg(models.HistoricalTicket.resolution_time_hours).label("avg_hrs"),
        )
        .group_by(models.HistoricalTicket.issue_category)
        .order_by(func.count(models.HistoricalTicket.id).desc())
        .all()
    )
    result = []
    for cat, cnt, res, avg_hrs in rows:
        result.append({
            "issue_category"       : cat,
            "ticket_count"         : cnt,
            "resolved_count"       : int(res or 0),
            "resolution_rate_pct"  : round(int(res or 0) / cnt * 100, 1) if cnt else 0.0,
            "avg_resolution_hours" : round(float(avg_hrs), 1) if avg_hrs else None,
        })
    return result


def get_priority_distribution(db: Session) -> List[dict]:
    total = db.query(func.count(models.HistoricalTicket.id)).scalar() or 1
    rows  = (
        db.query(
            models.HistoricalTicket.priority,
            func.count(models.HistoricalTicket.id).label("ticket_count"),
            func.avg(models.HistoricalTicket.resolution_time_hours).label("avg_hrs"),
        )
        .group_by(models.HistoricalTicket.priority)
        .order_by(func.count(models.HistoricalTicket.id).desc())
        .all()
    )
    order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    result = []
    for pri, cnt, avg_hrs in rows:
        result.append({
            "priority"             : pri,
            "ticket_count"         : cnt,
            "percentage"           : round(cnt / total * 100, 1),
            "avg_resolution_hours" : round(float(avg_hrs), 1) if avg_hrs else None,
        })
    result.sort(key=lambda x: order.get(x["priority"], 99))
    return result


def get_department_summary(db: Session) -> List[dict]:
    rows = (
        db.query(
            models.HistoricalTicket.department,
            func.count(models.HistoricalTicket.id).label("ticket_count"),
            func.sum(
                func.IF(models.HistoricalTicket.is_resolved == True, 1, 0)
            ).label("resolved_count"),
            func.avg(models.HistoricalTicket.resolution_time_hours).label("avg_hrs"),
        )
        .group_by(models.HistoricalTicket.department)
        .order_by(func.count(models.HistoricalTicket.id).desc())
        .all()
    )
    result = []
    for dept, cnt, res, avg_hrs in rows:
        result.append({
            "department"           : dept,
            "ticket_count"         : cnt,
            "resolved_count"       : int(res or 0),
            "resolution_rate_pct"  : round(int(res or 0) / cnt * 100, 1) if cnt else 0.0,
            "avg_resolution_hours" : round(float(avg_hrs), 1) if avg_hrs else None,
        })
    return result


def get_resolution_trends(db: Session) -> List[dict]:
    rows = (
        db.query(
            models.HistoricalTicket.created_month,
            func.count(models.HistoricalTicket.id).label("ticket_count"),
            func.sum(
                func.IF(models.HistoricalTicket.is_resolved == True, 1, 0)
            ).label("resolved_count"),
            func.avg(models.HistoricalTicket.resolution_time_hours).label("avg_hrs"),
        )
        .group_by(models.HistoricalTicket.created_month)
        .order_by(models.HistoricalTicket.created_month.asc())
        .all()
    )
    return [
        {
            "created_month"        : month,
            "ticket_count"         : cnt,
            "resolved_count"       : int(res or 0),
            "avg_resolution_hours" : round(float(avg_hrs), 1) if avg_hrs else None,
        }
        for month, cnt, res, avg_hrs in rows
    ]


def get_monthly_volume(db: Session) -> List[dict]:
    rows = (
        db.query(
            models.HistoricalTicket.created_month,
            func.count(models.HistoricalTicket.id).label("ticket_count"),
            func.sum(func.IF(models.HistoricalTicket.status == "Open",        1, 0)).label("open_count"),
            func.sum(func.IF(models.HistoricalTicket.status == "Resolved",    1, 0)).label("resolved_count"),
            func.sum(func.IF(models.HistoricalTicket.status == "Closed",      1, 0)).label("closed_count"),
            func.sum(func.IF(models.HistoricalTicket.status == "In Progress", 1, 0)).label("in_progress_count"),
        )
        .group_by(models.HistoricalTicket.created_month)
        .order_by(models.HistoricalTicket.created_month.asc())
        .all()
    )
    return [
        {
            "created_month"    : month,
            "ticket_count"     : cnt,
            "open_count"       : int(op  or 0),
            "resolved_count"   : int(res or 0),
            "closed_count"     : int(cl  or 0),
            "in_progress_count": int(ip  or 0),
        }
        for month, cnt, op, res, cl, ip in rows
    ]
