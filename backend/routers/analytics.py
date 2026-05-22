"""
routers/analytics.py - Analytics API endpoints (Phase 2)
All endpoints query the historical_tickets table populated by the ETL pipeline.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import crud
import schemas
from database import get_db

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


# ── GET /api/analytics/overview ───────────────────────────────────────────────

@router.get(
    "/overview",
    response_model=schemas.AnalyticsOverview,
    summary="High-level KPIs from historical ticket data",
)
def analytics_overview(db: Session = Depends(get_db)):
    """
    Returns aggregate stats across all historical tickets:
    total count, resolution rate, avg/min/max resolution time,
    unique departments & categories, and date range.
    """
    return crud.get_analytics_overview(db=db)


# ── GET /api/analytics/category-summary ───────────────────────────────────────

@router.get(
    "/category-summary",
    response_model=List[schemas.CategorySummaryItem],
    summary="Ticket volume and resolution stats grouped by issue category",
)
def analytics_category_summary(db: Session = Depends(get_db)):
    """
    Returns each issue category with ticket count, resolved count,
    resolution rate %, and average resolution time in hours.
    Sorted by ticket count descending.
    """
    return crud.get_category_summary(db=db)


# ── GET /api/analytics/priority-distribution ──────────────────────────────────

@router.get(
    "/priority-distribution",
    response_model=List[schemas.PriorityDistItem],
    summary="Ticket count and percentage by priority level",
)
def analytics_priority_distribution(db: Session = Depends(get_db)):
    """
    Returns breakdown of tickets by priority (Critical → Low) with
    percentage share and average resolution time per priority.
    """
    return crud.get_priority_distribution(db=db)


# ── GET /api/analytics/department-summary ─────────────────────────────────────

@router.get(
    "/department-summary",
    response_model=List[schemas.DeptSummaryItem],
    summary="Ticket volume and resolution rate per department",
)
def analytics_department_summary(db: Session = Depends(get_db)):
    """
    Returns each department with ticket count, resolved count,
    resolution rate %, and average resolution time.
    Sorted by ticket count descending.
    """
    return crud.get_department_summary(db=db)


# ── GET /api/analytics/resolution-trends ──────────────────────────────────────

@router.get(
    "/resolution-trends",
    response_model=List[schemas.ResolutionTrendItem],
    summary="Monthly resolution performance over time",
)
def analytics_resolution_trends(db: Session = Depends(get_db)):
    """
    Returns month-by-month breakdown of ticket volume, resolved count,
    and average resolution time. Useful for trend charts.
    """
    return crud.get_resolution_trends(db=db)


# ── GET /api/analytics/monthly-volume ─────────────────────────────────────────

@router.get(
    "/monthly-volume",
    response_model=List[schemas.MonthlyVolumeItem],
    summary="Monthly ticket volume split by status",
)
def analytics_monthly_volume(db: Session = Depends(get_db)):
    """
    Returns month-by-month ticket counts broken down by status
    (Open / In Progress / Resolved / Closed). Useful for stacked bar charts.
    """
    return crud.get_monthly_volume(db=db)
