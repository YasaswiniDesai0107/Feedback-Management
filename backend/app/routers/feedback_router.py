"""
routers/feedback_router.py
--------------------------
The Router defines all HTTP endpoints for the /feedback resource.

Responsibilities:
  - Parse and validate incoming HTTP requests (handled by FastAPI + Pydantic)
  - Call the Service layer for business logic
  - Return properly structured HTTP responses

This file should stay THIN:
  - No database logic here
  - No complex business rules here
  - Just: receive request → call service → return response
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.feedback_schema import (
    FeedbackCreate,
    FeedbackResponse,
    FeedbackUpdate,
    SearchResult,
)
from app.services import feedback_service

# -------------------------------------------------------------------
# APIRouter — groups all /feedback endpoints under a common prefix
# -------------------------------------------------------------------
router = APIRouter(
    prefix="/feedback",    # all routes here will start with /feedback
    tags=["Feedback"],     # groups these routes under "Feedback" in Swagger UI
)


# -------------------------------------------------------------------
# GET /feedback
# Returns a list of all feedback records
# -------------------------------------------------------------------
@router.get(
    "/",
    response_model=List[FeedbackResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all feedback records",
    description=(
        "Returns a list of all feedback submissions, ordered by most recent first. "
        "Returns an empty list if no feedback exists."
    ),
)
def get_all_feedbacks(db: Session = Depends(get_db)):
    """
    Retrieve all feedback entries from the database.

    - **Returns**: A list of feedback records.
    - **Status 200**: Always returns 200 (even if empty list).
    """
    return feedback_service.get_all_feedbacks_service(db)


# -------------------------------------------------------------------
# GET /feedback/search  (Step 3)
# IMPORTANT: This route MUST be declared BEFORE /{feedback_id}
# to prevent FastAPI from interpreting "search" as an integer ID.
# -------------------------------------------------------------------
@router.get(
    "/search",
    response_model=SearchResult,
    status_code=status.HTTP_200_OK,
    summary="Search and filter feedbacks",
    description=(
        "Search feedback records using any combination of filters:\n"
        "- **keyword**: searches participant name, program name, and comments\n"
        "- **rating**: exact rating match (1–5)\n"
        "- **program_name**: partial program name match\n"
        "- **skip** / **limit**: pagination controls"
    ),
)
def search_feedbacks(
    keyword:      Optional[str] = Query(default=None, description="Search in name, program, or comments"),
    rating:       Optional[int] = Query(default=None, ge=1, le=5, description="Filter by exact rating (1–5)"),
    program_name: Optional[str] = Query(default=None, description="Filter by program name (partial match)"),
    skip:         int           = Query(default=0,    ge=0, description="Pagination offset"),
    limit:        int           = Query(default=20,   ge=1, le=100, description="Page size (max 100)"),
    db: Session = Depends(get_db),
):
    """
    Search and filter feedbacks with combined criteria.

    **Example URLs:**
    - `/api/v1/feedback/search?keyword=python`
    - `/api/v1/feedback/search?rating=5`
    - `/api/v1/feedback/search?program_name=AI+Workshop`
    - `/api/v1/feedback/search?keyword=data&rating=4&skip=0&limit=10`
    """
    return feedback_service.search_feedbacks_service(
        db,
        keyword=keyword,
        rating=rating,
        program_name=program_name,
        skip=skip,
        limit=limit,
    )


# -------------------------------------------------------------------
# GET /feedback/programs  (Step 3)
# Returns distinct program names for filter dropdown
# -------------------------------------------------------------------
@router.get(
    "/programs",
    response_model=List[str],
    status_code=status.HTTP_200_OK,
    summary="Get distinct program names",
    description="Returns a sorted list of all unique program names. Used to populate filter dropdowns.",
)
def get_distinct_programs(db: Session = Depends(get_db)):
    """
    Returns all unique program names for the filter dropdown.

    - **Returns**: Sorted list of unique program name strings.
    """
    return feedback_service.get_distinct_programs_service(db)


# -------------------------------------------------------------------
# GET /feedback/{feedback_id}
# Returns a single feedback record by its ID
# -------------------------------------------------------------------
@router.get(
    "/{feedback_id}",
    response_model=FeedbackResponse,
    status_code=status.HTTP_200_OK,
    summary="Get feedback by ID",
    description="Retrieve a specific feedback record using its unique ID.",
)
def get_feedback_by_id(feedback_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a single feedback entry by its ID.

    - **feedback_id**: The integer ID of the feedback record.
    - **Returns**: The feedback record if found.
    - **Status 404**: If no record exists with the given ID.
    """
    return feedback_service.get_feedback_by_id_service(db, feedback_id)


# -------------------------------------------------------------------
# POST /feedback
# Creates a new feedback record
# -------------------------------------------------------------------
@router.post(
    "/",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit new feedback",
    description=(
        "Submit a new feedback entry. "
        "Rating must be between 1 and 5. "
        "Comments are optional."
    ),
)
def create_feedback(feedback_data: FeedbackCreate, db: Session = Depends(get_db)):
    """
    Create a new feedback submission.

    **Request Body Example:**
    ```json
    {
        "participant_name": "Alice Johnson",
        "program_name": "Data Science Bootcamp",
        "rating": 5,
        "comments": "Excellent program with hands-on projects!"
    }
    ```

    - **Returns**: The newly created feedback record with generated ID and timestamp.
    - **Status 201**: Record created successfully.
    - **Status 422**: Validation error (e.g., rating out of range).
    """
    return feedback_service.create_feedback_service(db, feedback_data)


# -------------------------------------------------------------------
# PUT /feedback/{feedback_id}
# Updates an existing feedback record
# -------------------------------------------------------------------
@router.put(
    "/{feedback_id}",
    response_model=FeedbackResponse,
    status_code=status.HTTP_200_OK,
    summary="Update existing feedback",
    description=(
        "Update one or more fields of an existing feedback record. "
        "Only include the fields you want to change — all fields are optional."
    ),
)
def update_feedback(
    feedback_id: int,
    update_data: FeedbackUpdate,
    db: Session = Depends(get_db),
):
    """
    Update an existing feedback record (partial update supported).

    **Request Body Example (only update the rating):**
    ```json
    {
        "rating": 4
    }
    ```

    - **feedback_id**: ID of the feedback record to update.
    - **Returns**: The updated feedback record.
    - **Status 404**: If no record exists with the given ID.
    - **Status 400**: If no fields are provided in the request body.
    """
    return feedback_service.update_feedback_service(db, feedback_id, update_data)


# -------------------------------------------------------------------
# DELETE /feedback/{feedback_id}
# Deletes a feedback record
# -------------------------------------------------------------------
@router.delete(
    "/{feedback_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete feedback by ID",
    description="Permanently delete a feedback record by its ID.",
)
def delete_feedback(feedback_id: int, db: Session = Depends(get_db)):
    """
    Delete a feedback record by ID.

    - **feedback_id**: The integer ID of the feedback record to delete.
    - **Returns**: A confirmation message with the deleted record's details.
    - **Status 200**: Record deleted successfully.
    - **Status 404**: If no record exists with the given ID.
    """
    deleted = feedback_service.delete_feedback_service(db, feedback_id)

    # Return a structured confirmation response
    return {
        "success": True,
        "message": f"Feedback ID {deleted.feedback_id} submitted by '{deleted.participant_name}' has been deleted.",
        "deleted_feedback_id": deleted.feedback_id,
    }
