from fastapi import APIRouter, HTTPException, status

from models.schemas import CraneParameters, DesignResponse, DesignSummary
from services.design_service import (
    create_design,
    get_design,
    list_designs,
    preview_design,
    update_design,
)

router = APIRouter(prefix="/api/designs", tags=["designs"])


@router.post("/preview")
def preview_crane_design(params: CraneParameters) -> dict:
    """
    Validate crane parameters and return Front and Top View SVG geometry.
    Does not save anything to the database.
    """
    return preview_design(params)


@router.post(
    "",
    response_model=DesignResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_crane_design(params: CraneParameters) -> DesignResponse:
    """Validate and save a new crane design to SQLite."""
    return create_design(params)


@router.get("", response_model=list[DesignSummary])
def list_crane_designs() -> list[DesignSummary]:
    """Return a summary list of all saved crane designs."""
    return list_designs()


@router.get("/{design_id}", response_model=DesignResponse)
def get_crane_design(design_id: int) -> DesignResponse:
    """Retrieve one saved crane design by its ID."""
    design = get_design(design_id)
    if design is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Design not found",
        )
    return design


@router.put("/{design_id}", response_model=DesignResponse)
def update_crane_design(design_id: int, params: CraneParameters) -> DesignResponse:
    """Update an existing saved crane design by its ID."""
    design = update_design(design_id, params)
    if design is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Design not found",
        )
    return design