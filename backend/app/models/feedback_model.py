"""
models/feedback_model.py
------------------------
Defines the SQLAlchemy ORM model for the 'feedbacks' table.

An ORM model is a Python class that maps directly to a database table.
Each class attribute = one column in the table.
"""

from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, CheckConstraint
from sqlalchemy.sql import func

from app.database import Base


class Feedback(Base):
    """
    ORM representation of the 'feedbacks' table in MySQL.

    Columns:
        feedback_id     : Primary key, auto-incremented
        participant_name: Name of the person submitting feedback (required)
        program_name    : Name of the program/course being reviewed (required)
        rating          : Integer rating from 1 to 5 (required, validated)
        comments        : Optional free-text comments
        submitted_at    : Timestamp auto-set when the record is created
    """

    # SQLAlchemy uses __tablename__ to know which table this class maps to
    __tablename__ = "feedbacks"

    # -------------------------------------------------------------------
    # Column Definitions
    # -------------------------------------------------------------------

    feedback_id = Column(
        Integer,
        primary_key=True,    # uniquely identifies each row
        index=True,          # creates a DB index for fast lookups
        autoincrement=True,  # MySQL auto-assigns the next available ID
    )

    participant_name = Column(
        String(150),         # VARCHAR(150) in MySQL
        nullable=False,      # this field is required (NOT NULL)
    )

    program_name = Column(
        String(200),         # VARCHAR(200) in MySQL
        nullable=False,
    )

    rating = Column(
        Integer,
        nullable=False,
    )

    comments = Column(
        Text,                # TEXT column — good for long strings
        nullable=True,       # optional field (can be NULL)
    )

    submitted_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,          # Python-level default
        server_default=func.now(),        # DB-level default (belt & suspenders)
    )

    # -------------------------------------------------------------------
    # Table Constraints
    # Enforce rating must be between 1 and 5 at the database level.
    # This acts as a second layer of validation (Pydantic handles layer 1).
    # -------------------------------------------------------------------
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
    )

    def __repr__(self):
        """String representation — helpful for debugging."""
        return (
            f"<Feedback(id={self.feedback_id}, "
            f"participant='{self.participant_name}', "
            f"program='{self.program_name}', "
            f"rating={self.rating})>"
        )
