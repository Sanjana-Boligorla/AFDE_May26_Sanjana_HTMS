"""
schemas.py - Pydantic models for request validation and response serialization
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


# ── Enums ─────────────────────────────────────────────────────────────────────

class PriorityEnum(str, Enum):
    low      = "Low"
    medium   = "Medium"
    high     = "High"
    critical = "Critical"


class StatusEnum(str, Enum):
    open        = "Open"
    in_progress = "In Progress"
    resolved    = "Resolved"
    closed      = "Closed"


# ── Comment Schemas ───────────────────────────────────────────────────────────

class CommentCreate(BaseModel):
    author       : str = Field(..., min_length=2, max_length=100, example="IT Support")
    comment_text : str = Field(..., min_length=1, example="Ticket is being investigated.")


class CommentResponse(BaseModel):
    id           : int
    ticket_id    : int
    author       : str
    comment_text : str
    created_at   : datetime

    class Config:
        from_attributes = True


# ── Ticket Schemas ────────────────────────────────────────────────────────────

class TicketCreate(BaseModel):
    employee_name  : str          = Field(..., min_length=2, max_length=100, example="Alice Johnson")
    department     : str          = Field(..., min_length=2, max_length=100, example="Engineering")
    issue_category : str          = Field(..., min_length=2, max_length=100, example="VPN Issue")
    description    : str          = Field(..., min_length=10, example="Cannot connect to VPN.")
    priority       : PriorityEnum = Field(default=PriorityEnum.medium)


class TicketUpdate(BaseModel):
    employee_name    : Optional[str]          = Field(None, max_length=100)
    department       : Optional[str]          = Field(None, max_length=100)
    issue_category   : Optional[str]          = Field(None, max_length=100)
    description      : Optional[str]          = None
    priority         : Optional[PriorityEnum] = None
    status           : Optional[StatusEnum]   = None
    resolution_notes : Optional[str]          = None


class TicketResponse(BaseModel):
    id               : int
    employee_name    : str
    department       : str
    issue_category   : str
    description      : str
    priority         : str
    status           : str
    resolution_notes : Optional[str]
    created_at       : datetime
    updated_at       : datetime

    class Config:
        from_attributes = True


class TicketDetailResponse(TicketResponse):
    comments : List[CommentResponse] = []

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    total   : int
    tickets : List[TicketResponse]


class MessageResponse(BaseModel):
    message: str


class DashboardStats(BaseModel):
    total          : int
    by_status      : Dict[str, int]
    by_priority    : Dict[str, int]
    recent_tickets : List[TicketResponse]
