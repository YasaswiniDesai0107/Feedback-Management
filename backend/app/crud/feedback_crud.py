"""
crud/feedback_crud.py
---------------------
CRUD = Create, Read, Update, Delete

This layer contains ALL direct database operations.
It only knows about SQLAlchemy — it does NOT know about HTTP or FastAPI.

Step 3 additions:
  - search_feedbacks()     → keyword + rating + program filter with pagination
  - get_distinct_programs() → unique program names for filter dropdown
"""

from typing import List, Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.feedback_model import Feedback
from app.schemas.feedback_schema import FeedbackCreate, FeedbackUpdate


# -------------------------------------------------------------------
# READ: Get all feedback records
# -------------------------------------------------------------------
def get_all_feedbacks(db: Session) -> List[Feedback]:
    """
    Retrieve all feedback records from the database.

    Args:
        db: The active SQLAlchemy database session.

    Returns:
        A list of Feedback ORM objects (can be empty).
    """
    return db.query(Feedback).order_by(Feedback.submitted_at.desc()).all()


# -------------------------------------------------------------------
# READ: Get a single feedback record by its ID
# -------------------------------------------------------------------
def get_feedback_by_id(db: Session, feedback_id: int) -> Optional[Feedback]:
    """
    Retrieve a single feedback record by its primary key.

    Args:
        db         : The active database session.
        feedback_id: The integer ID of the feedback to retrieve.

    Returns:
        A Feedback ORM object, or None if no record was found.
    """
    return db.query(Feedback).filter(Feedback.feedback_id == feedback_id).first()


# -------------------------------------------------------------------
# CREATE: Insert a new feedback record
# -------------------------------------------------------------------
def create_feedback(db: Session, feedback_data: FeedbackCreate) -> Feedback:
    """
    Create a new feedback record in the database.

    Process:
        1. Convert the Pydantic schema into a SQLAlchemy ORM object.
        2. Add it to the current DB session (staging area).
        3. Commit the transaction (write to DB permanently).
        4. Refresh to reload auto-generated fields (feedback_id, submitted_at).

    Args:
        db           : The active database session.
        feedback_data: Validated data from the POST request body.

    Returns:
        The newly created Feedback ORM object with all auto-generated fields.
    """
    # Convert Pydantic model → dict → SQLAlchemy ORM model
    new_feedback = Feedback(**feedback_data.model_dump())

    db.add(new_feedback)      # stage the new record
    db.commit()               # write to the database
    db.refresh(new_feedback)  # reload from DB (gets the auto-generated ID + timestamp)

    return new_feedback


# -------------------------------------------------------------------
# UPDATE: Modify an existing feedback record
# -------------------------------------------------------------------
def update_feedback(
    db: Session,
    feedback_id: int,
    update_data: FeedbackUpdate,
) -> Optional[Feedback]:
    """
    Update an existing feedback record with the provided fields.

    Only updates fields that are explicitly provided (non-None values).
    This enables partial updates — the client doesn't need to resend all fields.

    Args:
        db          : The active database session.
        feedback_id : ID of the feedback record to update.
        update_data : Pydantic model containing the fields to update.

    Returns:
        The updated Feedback ORM object, or None if the record wasn't found.
    """
    # First, find the existing record
    existing_feedback = get_feedback_by_id(db, feedback_id)

    if existing_feedback is None:
        return None  # caller will raise HTTP 404

    # Get only the fields the client actually sent (exclude unset/None fields)
    update_fields = update_data.model_dump(exclude_unset=True)

    # Apply each update field to the ORM object dynamically
    for field_name, new_value in update_fields.items():
        setattr(existing_feedback, field_name, new_value)

    db.commit()                    # persist changes
    db.refresh(existing_feedback)  # reload updated state from DB

    return existing_feedback


# -------------------------------------------------------------------
# DELETE: Remove a feedback record
# -------------------------------------------------------------------
def delete_feedback(db: Session, feedback_id: int) -> Optional[Feedback]:
    """
    Delete a feedback record from the database by ID.

    Args:
        db          : The active database session.
        feedback_id : ID of the feedback record to delete.

    Returns:
        The deleted Feedback ORM object (so the caller can confirm what was deleted),
        or None if the record wasn't found.
    """
    # First check the record exists
    existing_feedback = get_feedback_by_id(db, feedback_id)

    if existing_feedback is None:
        return None  # caller will raise HTTP 404

    db.delete(existing_feedback)  # mark for deletion
    db.commit()                   # execute DELETE in DB

    return existing_feedback      # return the deleted object for confirmation


# -------------------------------------------------------------------
# SEARCH: Filter feedbacks by keyword / rating / program (Step 3)
# -------------------------------------------------------------------
def search_feedbacks(
    db: Session,
    keyword: Optional[str] = None,
    rating: Optional[int] = None,
    program_name: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
) -> dict:
    """
    Search and filter feedback records with optional combined filters.

    Args:
        db           : Active SQLAlchemy session.
        keyword      : Free-text search across participant_name, program_name, comments.
        rating       : Exact rating match (1–5).
        program_name : Partial match against program_name (case-insensitive).
        skip         : Pagination offset (0 = first page).
        limit        : Max records to return per page (default 20, max 100).

    Returns:
        dict with keys:
          - 'results'  : List of Feedback ORM objects for current page
          - 'total'    : Total matching records (for pagination UI)
          - 'skip'     : Current offset
          - 'limit'    : Current page size
    """
    # Start with the base query
    query = db.query(Feedback)

    # --- Keyword search: match any of the three text fields ---
    # ilike = case-insensitive LIKE in SQLAlchemy
    if keyword and keyword.strip():
        pattern = f"%{keyword.strip()}%"
        query = query.filter(
            or_(
                Feedback.participant_name.ilike(pattern),
                Feedback.program_name.ilike(pattern),
                Feedback.comments.ilike(pattern),
            )
        )

    # --- Exact rating filter ---
    if rating is not None:
        query = query.filter(Feedback.rating == rating)

    # --- Program name partial match ---
    if program_name and program_name.strip():
        query = query.filter(
            Feedback.program_name.ilike(f"%{program_name.strip()}%")
        )

    # --- Count total BEFORE applying pagination ---
    # This lets the frontend show "X results found"
    total = query.count()

    # --- Apply sort + pagination ---
    results = (
        query
        .order_by(Feedback.submitted_at.desc())
        .offset(skip)
        .limit(min(limit, 100))  # cap at 100 to prevent abuse
        .all()
    )

    return {"results": results, "total": total, "skip": skip, "limit": limit}


# -------------------------------------------------------------------
# UTILITY: Get distinct program names for filter dropdown (Step 3)
# -------------------------------------------------------------------
def get_distinct_programs(db: Session) -> List[str]:
    """
    Return a sorted list of all unique program names in the database.
    Used to populate the 'Filter by Program' dropdown in the frontend.

    Returns:
        List of unique program name strings, alphabetically sorted.
    """
    rows = (
        db.query(Feedback.program_name)
        .distinct()
        .order_by(Feedback.program_name.asc())
        .all()
    )
    # Each row is a tuple like ('Data Science Bootcamp',) — extract the string
    return [row[0] for row in rows]
