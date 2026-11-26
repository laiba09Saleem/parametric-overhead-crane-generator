import json
from datetime import datetime, timezone
import sqlite3

from database.db import get_connection
from models.schemas import CraneParameters, DesignResponse, DesignSummary
from services.geometry_engine import generate_crane_geometry


def _now_iso() -> str:
    """Return the current UTC timestamp as an ISO 8601 string with microseconds."""
    return datetime.now(timezone.utc).isoformat(timespec="microseconds")


def _serialize_parameters(params: CraneParameters) -> str:
    """
    Convert the 5 numeric crane parameters to a JSON string.
    'name' is excluded because it is stored in its own SQLite column.
    """
    numeric_data = params.model_dump(exclude={"name"})
    return json.dumps(numeric_data)


def _row_to_design_response(row: sqlite3.Row) -> DesignResponse:
    """Combine a SQLite row and its parsed JSON parameters into a DesignResponse."""
    params_data = json.loads(row["parameters"])
    return DesignResponse(
        id=row["id"],
        name=row["name"],
        span=params_data["span"],
        capacity_t=params_data["capacity_t"],
        girder_height=params_data["girder_height"],
        end_truck_length=params_data["end_truck_length"],
        lift_height=params_data["lift_height"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def _row_to_design_summary(row: sqlite3.Row) -> DesignSummary:
    """Combine a SQLite row and summary fields from JSON into a DesignSummary."""
    params_data = json.loads(row["parameters"])
    return DesignSummary(
        id=row["id"],
        name=row["name"],
        span=params_data["span"],
        capacity_t=params_data["capacity_t"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def preview_design(params: CraneParameters) -> dict:
    """Generate Front and Top View SVG geometry without saving to the database."""
    return generate_crane_geometry(params)


def create_design(params: CraneParameters) -> DesignResponse:
    """Insert a new crane design into SQLite and return the created record."""
    now = _now_iso()
    params_json = _serialize_parameters(params)

    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO designs (name, parameters, created_at, updated_at)
            VALUES (?, ?, ?, ?);
            """,
            (params.name, params_json, now, now),
        )
        conn.commit()
        new_id = cursor.lastrowid
        row = conn.execute(
            "SELECT id, name, parameters, created_at, updated_at FROM designs WHERE id = ?;",
            (new_id,),
        ).fetchone()
        return _row_to_design_response(row)
    finally:
        conn.close()


def list_designs() -> list[DesignSummary]:
    """Return all saved designs ordered by most recently updated first."""
    conn = get_connection()
    try:
        rows = conn.execute(
            """
            SELECT id, name, parameters, created_at, updated_at
            FROM designs
            ORDER BY updated_at DESC, id DESC;
            """
        ).fetchall()
        return [_row_to_design_summary(row) for row in rows]
    finally:
        conn.close()


def get_design(design_id: int) -> DesignResponse | None:
    """Return one saved design by ID, or None if no matching row exists."""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT id, name, parameters, created_at, updated_at FROM designs WHERE id = ?;",
            (design_id,),
        ).fetchone()
        if row is None:
            return None
        return _row_to_design_response(row)
    finally:
        conn.close()


def update_design(design_id: int, params: CraneParameters) -> DesignResponse | None:
    """
    Update an existing design's name, parameters, and updated_at timestamp.
    Returns the updated record, or None if the design ID does not exist.
    """
    now = _now_iso()
    params_json = _serialize_parameters(params)

    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            UPDATE designs
            SET name = ?, parameters = ?, updated_at = ?
            WHERE id = ?;
            """,
            (params.name, params_json, now, design_id),
        )
        conn.commit()
        if cursor.rowcount == 0:
            return None
        row = conn.execute(
            "SELECT id, name, parameters, created_at, updated_at FROM designs WHERE id = ?;",
            (design_id,),
        ).fetchone()
        return _row_to_design_response(row)
    finally:
        conn.close()