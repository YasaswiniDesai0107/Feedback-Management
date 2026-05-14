"""
services/feedback_service.py
-----------------------------
The Service Layer sits between the Router (HTTP) and CRUD (Database).

Responsibilities:
  - Orchestrate business logic that goes beyond simple DB operations
  - Raise appropriate HTTP exceptions (404, 400, etc.)
  - Keep routers thin and CRUD functions database-only

Think of it as the "brain" of the application:
  Router  → receives HTTP request
  Service → applies business rules, raises HTTP errors
  CRUD    → executes raw database operations
"""

from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud import feedback_crud
from app.models.feedback_model import Feedback
from app.schemas.feedback_schema import FeedbackCreate, FeedbackUpdate


def get_all_feedbacks_service(db: Session) -> List[Feedback]:
    """
    Business logic for retrieving all feedback records.

    Returns an empty list if no records exist (not an error condition).
    """
    return feedback_crud.get_all_feedbacks(db)


def get_feedback_by_id_service(db: Session, feedback_id: int) -> Feedback:
    """
    Business logic for retrieving a single feedback by ID.

    Raises:
        HTTPException 404: If no feedback record matches the given ID.
    """
    feedback = feedback_crud.get_feedback_by_id(db, feedback_id)

    if feedback is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Feedback with ID {feedback_id} was not found.",
        )

    return feedback


def create_feedback_service(db: Session, feedback_data: FeedbackCreate) -> Feedback:
    """
    Business logic for creating a new feedback record.

    Currently delegates directly to CRUD.
    In future phases, this is where we could add:
      - Duplicate detection
      - Notification triggers
      - Analytics events

    Returns:
        The newly created Feedback ORM object.
    """
    return feedback_crud.create_feedback(db, feedback_data)


def update_feedback_service(
    db: Session,
    feedback_id: int,
    update_data: FeedbackUpdate,
) -> Feedback:
    """
    Business logic for updating a feedback record.

    Raises:
        HTTPException 404: If no feedback record matches the given ID.

    Returns:
        The updated Feedback ORM object.
    """
    # Validate at least one field is being updated
    if not update_data.model_dump(exclude_unset=True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided to update. Please include at least one field.",
        )

    updated_feedback = feedback_crud.update_feedback(db, feedback_id, update_data)

    if updated_feedback is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Feedback with ID {feedback_id} was not found.",
        )

    return updated_feedback


def delete_feedback_service(db: Session, feedback_id: int) -> Feedback:
    """
    Business logic for deleting a feedback record.

    Raises:
        HTTPException 404: If no feedback record matches the given ID.

    Returns:
        The deleted Feedback ORM object (for confirmation in the response).
    """
    deleted_feedback = feedback_crud.delete_feedback(db, feedback_id)

    if deleted_feedback is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Feedback with ID {feedback_id} was not found.",
        )

    return deleted_feedback


def search_feedbacks_service(
    db: Session,
    keyword: Optional[str] = None,
    rating: Optional[int] = None,
    program_name: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
) -> dict:
    """
    Business logic for the search/filter endpoint (Step 3).

    Validates the pagination inputs, then delegates to CRUD.

    Args:
        db           : Database session.
        keyword      : Free-text search term.
        rating       : Exact rating filter (1–5).
        program_name : Program name partial filter.
        skip         : Pagination offset (must be ≥ 0).
        limit        : Page size (1–100).

    Returns:
        dict with 'results', 'total', 'skip', 'limit'.
    """
    # Validate pagination params
    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="'skip' must be 0 or greater.",
        )
    if not (1 <= limit <= 100):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="'limit' must be between 1 and 100.",
        )

    return feedback_crud.search_feedbacks(
        db,
        keyword=keyword,
        rating=rating,
        program_name=program_name,
        skip=skip,
        limit=limit,
    )


def get_distinct_programs_service(db: Session) -> list:
    """
    Returns a sorted list of all unique program names.
    Powers the 'Filter by Program' dropdown in the frontend.
    """
    return feedback_crud.get_distinct_programs(db)
