# AI Development Log (`AI_LOG.md`)

A brief log of 5 key cases where I reviewed, caught issues in, and corrected AI-generated output while building the **Parametric Overhead Crane Drawing Generator** for **Moderen Crane Co.**

---

## 1. Missing `NaN` / `Infinity` Validation (`backend/models/schemas.py`)

- **Task:** Define the Pydantic v2 input schema (`CraneParameters`) for crane parameters.
- **What AI generated:** Created `CraneParameters` with `ge`/`le` bounds and a blank-name validator.
- **Issue I found:** Python's `float("nan")` and `float("inf")` bypass normal `ge`/`le` checks unless explicitly blocked, which could pass non-finite values into the geometry engine.
- **How I reviewed it:** Checked `schemas.py` during Step 1 review and asked for `ConfigDict(allow_inf_nan=False)` plus a `NaN` test case.
- **Fix applied:** Added `model_config = ConfigDict(allow_inf_nan=False)` to `CraneParameters`. Verified that valid inputs were accepted, while out-of-range values and `NaN` were rejected. The Pydantic configuration also disallows Infinity values.
- **Takeaway:** Range checks (`ge`/`le`) alone do not block non-finite floats in Python; schemas must explicitly reject them.

---

## 2. Decoupling `lift_height` from Hook Coordinates (`backend/services/geometry_engine.py`)

- **Task:** Represent `lift_height` (maximum hook travel) in the Front Elevation drawing.
- **What AI generated:** First placed the hook using `lift_height × SCALE` with a `Max Lift Height (Schematic)` dimension line, and later used a shorter `Maximum Lift Height: X.X m` label.
- **Issue I found:** Maximum hook travel is not the same as the physical girder-to-hook distance, so scaling the hook from `lift_height` or drawing a dimension line could imply a verified installation clearance.
- **How I reviewed it:** Flagged this during plan review and Step 3 code review, and requested a test confirming `lift_height` does not affect scale or hook position.
- **Fix applied:** Used a fixed drawing-only offset (`EST_ILLUSTRATIVE_ROPE_LENGTH_M = 1.50`) for the hook and updated the label to `Maximum Lift Height: X.X m (input only; not shown geometrically)`. Confirmed via test (`lift_height=2.0` vs `15.0`) that scale and hook coordinates stay unchanged.
- **Takeaway:** AI can mix up domain inputs with visual layout coordinates; human review is needed to keep schematic estimates honest.

---

## 3. Shared Orthographic Scale & Unrounded Scale Output (`backend/services/geometry_engine.py`)

- **Task:** Fit both Front Elevation and Top View inside fixed SVG canvases across all valid inputs.
- **What AI generated:** Initially used two separate scales (`scale_front` and `scale_top`), and later rounded `common_scale_px_per_m` to 2 decimal places in the API response.
- **Issue I found:** Separate scales rendered the same crane at different proportions in Front vs Top View (`86.15` vs `150.00 px/m` at `span = 3.0 m`), and rounding `common_scale_px_per_m` hid the exact scale used in coordinate math.
- **How I reviewed it:** Reviewed the boundary calculations in the plan and checked the Step 3 `geometry_engine.py` output.
- **Fix applied:** Used `common_scale = min(front_width_scale, front_height_scale, top_width_scale, top_height_scale)` for both views and returned the unrounded float in `common_scale_px_per_m` (keeping 1-decimal `_r()` rounding for SVG pixels). Verified on standard (`10 m`), min (`3 m`), and max (`30 m`) cases.
- **Takeaway:** Orthographic views need one shared scale, and returned metadata should match the actual calculation precision.

---

## 4. `Promise.all()` Failure Handling in Save & Update Flows (`HomePage.jsx`, `DesignsPage.jsx`)

- **Task:** Save/update a design in SQLite and refresh the drawing (and list on the Saved Designs page).
- **What AI generated:** Used `Promise.all([createDesign(data), previewDesign(data)])` in `HomePage.jsx`, and in an earlier `DesignsPage.jsx` revision used separate `setError()` calls without an outer `finally`.
- **Issue I found:** With `Promise.all()`, a failed preview after a successful save rejected the whole call—making it look like the save failed and risking duplicate records. Separate `setError()` calls could also overwrite earlier refresh errors, and missing `finally` risked leaving `loading` stuck at `true`.
- **How I reviewed it:** Reviewed `handleSave` (F11) and `handleUpdate` (F12) control flow before approving.
- **Fix applied:** Switched both to sequential calls:
  - `HomePage.jsx`: runs `createDesign(data)` first (returning early on failure), sets the success banner, then refreshes `previewDesign(data)` in its own `try/catch/finally`.
  - `DesignsPage.jsx`: wraps `handleUpdate` in `try/finally { setLoading(false) }`, runs `updateDesign()` first, then runs `getDesigns()` and `previewDesign()` while collecting any refresh failures in `refreshErrors`.
- **Takeaway:** Never pair a database write and a non-critical UI refresh inside `Promise.all()`; partial failures need accurate user feedback.

---

## 5. `DesignResponse` Shape & UI Redesign Compatibility (`DesignsPage.jsx`, `CraneForm.jsx`, `CraneDrawing.jsx`, `App.css`)

- **Task:** Wire `DesignsPage.jsx` to the backend and review the UI redesign files.
- **What AI generated:** Initial F12 assumptions expected `design.parameters` to be nested, and the UI redesign drafts included unused symbols (`useRef`, `label`, `scale`), mismatched button labels (`Generate` / `Save`), hardcoded `"Out of range"` text hiding `"Enter a valid number."`, and missing padding on `.panel > .helper-text`.
- **Issue I found:** Reading `design.parameters` would fail because `DesignResponse` is flat, and the UI redesign had small UX/lint regressions visible in code review and in the Saved Designs browser screenshot.
- **How I reviewed it:** Cross-checked `design_service.py`/`schemas.py`, audited each redesigned file against existing pages, and inspected the live Saved Designs Edit panel.
- **Fix applied:** Mapped flat `DesignResponse` fields in `extractFormValues()`, removed unused imports/variables, matched button labels (`Generate Drawing` / `Save Design`) to `DesignsPage.jsx` helper text, restored `'Enter a valid number.'` display in `CraneForm.jsx`, and added `.panel > .helper-text { padding: 0.75rem 1.5rem 0; }` in `App.css`.
- **Takeaway:** Always verify API response shapes and check redesigned UI components against live screenshots and existing page text.