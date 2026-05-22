"""
models.py - SQLAlchemy ORM models
Tables: tickets, ticket_comments (one-to-many relationship)
"""

from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id               = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_name    = Column(String(100), nullable=False)
    department       = Column(String(100), nullable=False)
    issue_category   = Column(String(100), nullable=False)
    description      = Column(Text, nullable=False)
    priority         = Column(Enum("Low", "Medium", "High", "Critical"), nullable=False, default="Medium")
    status           = Column(Enum("Open", "In Progress", "Resolved", "Closed"), nullable=False, default="Open")
    resolution_notes = Column(Text, nullable=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at       = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # One ticket -> many comments (cascade delete)
    comments = relationship(
        "TicketComment",
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="TicketComment.created_at",
    )


class TicketComment(Base):
    __tablename__ = "ticket_comments"

    id           = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ticket_id    = Column(Integer, ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    author       = Column(String(100), nullable=False)
    comment_text = Column(Text, nullable=False)
    created_at   = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    ticket = relationship("Ticket", back_populates="comments")
