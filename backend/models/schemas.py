from pydantic import BaseModel, ConfigDict, Field, field_validator

class CraneParameters(BaseModel):
    """
    Input schema for crane preview, creation, and updates.
    Numeric ranges are software validation bounds for 2D rendering,
    not manufacturer or structural engineering limits.
    """

    model_config = ConfigDict(allow_inf_nan=False)

    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Design name for saving and listing.",
    )
    span: float = Field(
        ...,
        ge=3.0,
        le=30.0,
        description="Distance between runway rail centrelines in metres (software limit: 3.0–30.0 m).",
    )
    capacity_t: float = Field(
        ...,
        ge=0.5,
        le=20.0,
        description="Lifting capacity in tonnes, shown as an info label only (software limit: 0.5–20.0 t).",
    )
    girder_height: float = Field(
        ...,
        ge=0.2,
        le=2.0,
        description="Main girder vertical height in metres (software limit: 0.2–2.0 m).",
    )
    end_truck_length: float = Field(
        ...,
        ge=0.5,
        le=3.0,
        description="End truck length along the runway direction in metres (software limit: 0.5–3.0 m).",
    )
    lift_height: float = Field(
        ...,
        ge=1.0,
        le=15.0,
        description="Maximum hook travel in metres, shown as an info label only (software limit: 1.0–15.0 m).",
    )

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Design name cannot be empty or whitespace only.")
        return cleaned


class DesignSummary(BaseModel):
    """Summary item returned when listing saved designs (GET /api/designs)."""

    id: int
    name: str
    span: float
    capacity_t: float
    created_at: str
    updated_at: str


class DesignResponse(BaseModel):
    """Full design record returned on create, retrieve, and update."""

    id: int
    name: str
    span: float
    capacity_t: float
    girder_height: float
    end_truck_length: float
    lift_height: float
    created_at: str
    updated_at: str