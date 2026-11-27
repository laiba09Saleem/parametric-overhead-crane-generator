# AI Development Log (`AI_LOG.md`)

This log documents key AI-assisted development interactions during the creation of the **Parametric Overhead Crane Drawing Generator** for **Moderen Crane Co.**, focusing on issues caught through human review, testing, and verification against the codebase.

---

## 1. Adding Finite-Number Validation (`NaN` / `Infinity`) to `CraneParameters`

- **Task:** Implementing `backend/models/schemas.py` (Step 1) to validate incoming crane parameters with Pydantic v2.
- **Initial AI contribution:** Generated `CraneParameters` with `Field(..., ge=..., le=...)` numeric bounds and a `@field_validator("name")` to reject empty or whitespace-only design names.
- **Issue identified:** In Python, `float("nan")` and `float("inf")` are valid `float` values that bypass standard `ge`/`le` range checks unless explicitly disallowed. If passed through the API, non-finite numbers could propagate into `geometry_engine.py` arithmetic and produce broken SVG coordinates or invalid JSON.
- **Human review:** During review of Step 1 (`schemas.py`), the developer identified the missing finite-number guard and requested explicit `NaN`/`Infinity` rejection plus a dedicated `NaN` test case.
- **Correction:** Imported `ConfigDict` from `pydantic` and added `model_config = ConfigDict(allow_inf_nan=False)` to `CraneParameters`, along with a Python CLI test passing `span=float('nan')`. Verified that valid inputs were accepted, while out-of-range values and `NaN` were rejected. The Pydantic configuration also disallows Infinity values.
- **Learning:** Standard numeric range validators (`ge`/`le`) are not sufficient on their own for Python `float` inputs; API boundaries must explicitly reject non-finite values.

---

## 2. Decoupling `lift_height` from Physical Hook SVG Coordinates

- **Task:** Designing the Front Elevation geometry and labels for `lift_height` (maximum hook travel) in the backend implementation plan and `backend/services/geometry_engine.py`.
- **Initial AI contribution:** Initially mapped `lift_height` directly to the vertical drop from `girder_bottom_y` to `hook_cy` (`lift_height × SCALE`) with a dimension line labelled `Max Lift Height (Schematic)`. Later, in the initial Step 3 `geometry_engine.py` draft, used the info label `Maximum Lift Height: X.X m`.
- **Issue identified:** Maximum hook travel (`lift_height`) is not necessarily the same engineering measurement as the girder-to-hook vertical distance. Drawing a dimension line or positioning the hook from `lift_height` could falsely imply a verified physical installation clearance, and the shorter label did not explicitly state that the value is not represented geometrically.
- **Human review:** During architecture plan review and Step 3 code review, the developer required `lift_height` to be decoupled from hook coordinates and requested an explicit test proving `lift_height` does not alter `common_scale_px_per_m` or hook coordinates.
- **Correction:** Introduced a separate drawing-only visual constant (`EST_ILLUSTRATIVE_ROPE_LENGTH_M = 1.50`) to place the hook schematically, and updated the Front View info label to `Maximum Lift Height: {params.lift_height:.1f} m (input only; not shown geometrically)`. Verified with a two-case test (`lift_height=2.0` vs `15.0`) confirming identical scale and hook coordinates.
- **Learning:** AI can conflate user-entered engineering parameters with visual layout coordinates; domain review is necessary to keep schematic assumptions honest and clearly separated from physical dimensions.

---

## 3. Enforcing a Common Orthographic Scale and Full-Precision Scale Reporting

- **Task:** Ensuring all permitted parameter combinations fit within fixed SVG canvases while keeping Front Elevation and Top (Plan) View proportions consistent (`backend-implementation-plan.md` and `backend/services/geometry_engine.py`).
- **Initial AI contribution:** First proposed independent fit-to-canvas scales (`scale_front` and `scale_top`), which rendered the same crane at different scales in the two views (e.g., `86.15 px/m` vs `150.00 px/m` at `span = 3.0 m`). Later, in the initial Step 3 code, rounded `common_scale_px_per_m` to 2 decimal places in the response while using the unrounded float for coordinate math.
- **Issue identified:** Independent scales broke orthographic consistency between Front and Top Views, and rounding `common_scale_px_per_m` created a mismatch between the reported scale and the actual scale used to compute SVG coordinates.
- **Human review:** Caught both issues during plan review and Step 3 code review, requesting a single shared minimum scale and unrounded scale reporting.
- **Correction:** Replaced the separate scales with `common_scale = min(front_width_scale, front_height_scale, top_width_scale, top_height_scale)` applied to both views, and returned the full-precision `scale` in `common_scale_px_per_m` while keeping `_r(value)` (`round(value, 1)`) for SVG pixel coordinates. Verified across standard (`10 m`), minimum (`3 m`), and maximum (`30 m`) test cases.
- **Learning:** Multi-view engineering drawings require a shared scale constraint, and API metadata should report the exact precision used in underlying calculations.

---

## 4. Replacing `Promise.all()` with Sequential Save/Refresh Error Handling

- **Task:** Implementing `handleSave` in `frontend/src/pages/HomePage.jsx` and `handleUpdate` in `frontend/src/pages/DesignsPage.jsx` to persist a design and refresh the drawing and list.
- **Initial AI contribution:** In the initial `HomePage.jsx` implementation, used `Promise.all([createDesign(data), previewDesign(data)])` inside a single `try/catch`. In `DesignsPage.jsx`, an intermediate `handleUpdate` revision used two separate `catch` blocks calling `setError` and moved `setLoading(false)` outside a `finally` block.
- **Issue identified:** With `Promise.all()`, if `createDesign()` succeeded but `previewDesign()` failed, `Promise.all()` rejected as a whole—causing the UI to show a failure message even though the record was saved, which could prompt the user to resubmit and create duplicate records. In `DesignsPage.jsx`, separate `setError()` calls could overwrite an earlier refresh error, and omitting `finally` risked leaving `loading` stuck at `true` on an early return or unexpected error.
- **Human review:** During F11 and F12 reviews, the developer rejected `Promise.all()` and required sequential execution, preserved save/update confirmation messages, combined refresh error reporting, and an outer `try/finally`.
- **Correction:**
  - In `HomePage.jsx` (`handleSave`), executed `createDesign(data)` first (returning early on failure after resetting `loading`), immediately set the success message, and then ran `previewDesign(data)` in a separate `try/catch/finally` so a preview failure preserves the save confirmation and resets `loading` in `finally`.
  - In `DesignsPage.jsx` (`handleUpdate`), wrapped the operation in an outer `try/finally { setLoading(false) }`, executed `updateDesign(selectedId, data)` first (returning early on failure), immediately set the success message, and then ran `getDesigns()` and `previewDesign(data)` sequentially while collecting any refresh failures in a `refreshErrors` array to display a single combined error message.
- **Learning:** Concurrent `Promise.all()` is unsuitable when one call mutates persistent state and another performs a non-critical UI refresh; error handling must accurately communicate partial success.

---

## 5. Resolving `DesignResponse` Schema Assumptions and UI Redesign Compatibility Issues

- **Task:** Integrating `frontend/src/pages/DesignsPage.jsx` with the backend API and auditing the UI redesign files (`App.css`, `CraneForm.jsx`, `CraneDrawing.jsx`).
- **Initial AI contribution:** During F12 (`DesignsPage.jsx`), the task assumptions expected `DesignResponse` to nest parameters under a `parameters` key (mirroring the SQLite column), whereas `design_service.py` returned a flat response. During the UI redesign review, proposed files included unused symbols (`useRef`, `label`, `scale`), button labels (`Generate` / `Save`) that did not match `DesignsPage.jsx` helper text (`Generate Drawing` / `Save Design`), hardcoded `"Out of range"` text that masked `"Enter a valid number."`, and missing padding for `.helper-text` inside `.panel`.
- **Issue identified:** Reading `design.parameters` would have failed to populate the edit form, and the UI redesign regressions caused misleading `NaN` validation messages and misaligned helper text in the Edit Design panel.
- **Human review:** Cross-checked `design_service.py` and `schemas.py` before writing `extractFormValues(design)`, audited each proposed UI file against existing JSX/CSS, and inspected a live browser screenshot of the Saved Designs edit panel.
- **Correction:**
  - Implemented `extractFormValues(design)` in `DesignsPage.jsx` using the flat top-level `DesignResponse` fields.
  - Removed unused imports/variables (`useRef` and `label` in `CraneForm.jsx`; `scale` in `CraneDrawing.jsx`).
  - Aligned `CraneForm.jsx` button labels (`Generate Drawing` and `Save Design`) with `DesignsPage.jsx` helper text.
  - Updated numeric error rendering in `CraneForm.jsx` to display `errors[key]` when it equals `'Enter a valid number.'` and `Out of range (${min}–${max} ${unit})` otherwise.
  - Added `.panel > .helper-text { padding: 0.75rem 1.5rem 0; }` in `App.css` to align the Edit Design helper text.
- **Learning:** Verifying actual API response shapes and reviewing redesigned components against existing pages and live screenshots prevents silent integration mismatches and subtle UX regressions.