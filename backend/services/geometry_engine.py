from models.schemas import CraneParameters

# --- Fixed SVG Canvas Sizes & Margins (pixels) ---
FRONT_CANVAS_W = 900.0
FRONT_CANVAS_H = 440.0
TOP_CANVAS_W = 900.0
TOP_CANVAS_H = 320.0

MARGIN_LEFT = 100.0
MARGIN_RIGHT = 180.0
FRONT_MARGIN_TOP = 80.0
FRONT_MARGIN_BOTTOM = 80.0
TOP_MARGIN_TOP = 80.0
TOP_MARGIN_BOTTOM = 60.0

FRONT_AVAIL_W = FRONT_CANVAS_W - MARGIN_LEFT - MARGIN_RIGHT  # 620 px
FRONT_AVAIL_H = FRONT_CANVAS_H - FRONT_MARGIN_TOP - FRONT_MARGIN_BOTTOM  # 280 px
TOP_AVAIL_W = TOP_CANVAS_W - MARGIN_LEFT - MARGIN_RIGHT  # 620 px
TOP_AVAIL_H = TOP_CANVAS_H - TOP_MARGIN_TOP - TOP_MARGIN_BOTTOM  # 180 px

# --- Illustrative Visual Assumptions (metres) ---
# NOTE: These are drawing-only visual estimates, NOT manufacturer or engineering specs.
EST_END_TRUCK_WIDTH_M = 0.40
EST_END_TRUCK_HEIGHT_RATIO = 0.50  # fraction of girder_height
EST_RAIL_WIDTH_M = 0.20
EST_RAIL_HEIGHT_M = 0.20
EST_GIRDER_PLAN_WIDTH_M = 0.40
EST_TROLLEY_WIDTH_M = 0.60
EST_TROLLEY_HEIGHT_M = 0.40
EST_TROLLEY_PLAN_LENGTH_M = 0.60
EST_HOIST_WIDTH_M = 0.50
EST_HOIST_HEIGHT_M = 0.35
EST_HOOK_RADIUS_M = 0.10

# Drawing-only visual offset for the hook below the hoist.
# lift_height is NOT used to place the hook physically.
EST_ILLUSTRATIVE_ROPE_LENGTH_M = 1.50


def _r(value: float) -> float:
    """Round pixel coordinates to 1 decimal place for clean SVG output."""
    return round(value, 1)


def compute_common_scale(params: CraneParameters) -> float:
    """
    Compute one shared scale (pixels per metre) so both Front and Top Views
    fit inside their available canvas areas with identical 1:1 proportions.
    """
    end_truck_height_m = EST_END_TRUCK_HEIGHT_RATIO * params.girder_height

    front_w_m = params.span + EST_END_TRUCK_WIDTH_M
    front_h_m = (
        max(params.girder_height, end_truck_height_m + EST_RAIL_HEIGHT_M)
        + EST_TROLLEY_HEIGHT_M
        + EST_HOIST_HEIGHT_M
        + EST_ILLUSTRATIVE_ROPE_LENGTH_M
        + 2.0 * EST_HOOK_RADIUS_M
    )

    top_w_m = params.span + EST_END_TRUCK_WIDTH_M
    top_h_m = max(
        params.end_truck_length,
        EST_TROLLEY_PLAN_LENGTH_M,
        EST_GIRDER_PLAN_WIDTH_M,
    )

    front_width_scale = FRONT_AVAIL_W / front_w_m
    front_height_scale = FRONT_AVAIL_H / front_h_m
    top_width_scale = TOP_AVAIL_W / top_w_m
    top_height_scale = TOP_AVAIL_H / top_h_m

    return min(front_width_scale, front_height_scale, top_width_scale, top_height_scale)


def generate_crane_geometry(params: CraneParameters) -> dict:
    """
    Generate Front View and Top View SVG geometry dictionaries from validated parameters.
    """
    scale = compute_common_scale(params)

    # --- Shared Horizontal Coordinates (Span Direction: X-axis) ---
    total_w_px = (params.span + EST_END_TRUCK_WIDTH_M) * scale
    left_truck_x = MARGIN_LEFT + (FRONT_AVAIL_W - total_w_px) / 2.0

    end_truck_w_px = EST_END_TRUCK_WIDTH_M * scale
    span_px = params.span * scale

    left_rail_x = left_truck_x + end_truck_w_px / 2.0
    right_rail_x = left_rail_x + span_px
    mid_x = (left_rail_x + right_rail_x) / 2.0

    right_truck_x = right_rail_x - end_truck_w_px / 2.0
    right_truck_right_x = right_truck_x + end_truck_w_px

    # Girder spans between the inner faces of the two end trucks (zero overlap)
    girder_left_x = left_truck_x + end_truck_w_px
    girder_w_px = right_truck_x - girder_left_x

    # =========================================================================
    # FRONT VIEW (Looking along runway direction: X = span, Y = elevation)
    # =========================================================================
    top_y = FRONT_MARGIN_TOP
    end_truck_h_px = (EST_END_TRUCK_HEIGHT_RATIO * params.girder_height) * scale
    rail_w_px = EST_RAIL_WIDTH_M * scale
    rail_h_px = EST_RAIL_HEIGHT_M * scale
    girder_h_px = params.girder_height * scale

    rail_top_y = top_y + end_truck_h_px
    girder_bottom_y = top_y + girder_h_px

    trolley_w_px = EST_TROLLEY_WIDTH_M * scale
    trolley_h_px = EST_TROLLEY_HEIGHT_M * scale
    trolley_top_y = girder_bottom_y
    trolley_bottom_y = trolley_top_y + trolley_h_px

    hoist_w_px = EST_HOIST_WIDTH_M * scale
    hoist_h_px = EST_HOIST_HEIGHT_M * scale
    hoist_top_y = trolley_bottom_y
    hoist_bottom_y = hoist_top_y + hoist_h_px

    rope_len_px = EST_ILLUSTRATIVE_ROPE_LENGTH_M * scale
    hook_r_px = EST_HOOK_RADIUS_M * scale
    rope_y1 = hoist_bottom_y
    rope_y2 = rope_y1 + rope_len_px
    hook_cy = rope_y2 + hook_r_px

    front_dim_x = right_truck_right_x + 45.0

    front_view = {
        "canvas_width": int(FRONT_CANVAS_W),
        "canvas_height": int(FRONT_CANVAS_H),
        "components": {
            "left_truck": {
                "x": _r(left_truck_x),
                "y": _r(top_y),
                "width": _r(end_truck_w_px),
                "height": _r(end_truck_h_px),
            },
            "right_truck": {
                "x": _r(right_truck_x),
                "y": _r(top_y),
                "width": _r(end_truck_w_px),
                "height": _r(end_truck_h_px),
            },
            "left_rail": {
                "x": _r(left_rail_x - rail_w_px / 2.0),
                "y": _r(rail_top_y),
                "width": _r(rail_w_px),
                "height": _r(rail_h_px),
            },
            "right_rail": {
                "x": _r(right_rail_x - rail_w_px / 2.0),
                "y": _r(rail_top_y),
                "width": _r(rail_w_px),
                "height": _r(rail_h_px),
            },
            "girder": {
                "x": _r(girder_left_x),
                "y": _r(top_y),
                "width": _r(girder_w_px),
                "height": _r(girder_h_px),
            },
            "trolley": {
                "x": _r(mid_x - trolley_w_px / 2.0),
                "y": _r(trolley_top_y),
                "width": _r(trolley_w_px),
                "height": _r(trolley_h_px),
            },
            "hoist": {
                "x": _r(mid_x - hoist_w_px / 2.0),
                "y": _r(hoist_top_y),
                "width": _r(hoist_w_px),
                "height": _r(hoist_h_px),
            },
            "rope": {
                "x1": _r(mid_x),
                "y1": _r(rope_y1),
                "x2": _r(mid_x),
                "y2": _r(rope_y2),
            },
            "hook": {
                "cx": _r(mid_x),
                "cy": _r(hook_cy),
                "r": _r(hook_r_px),
            },
        },
        "dimensions": [
            {
                "label": f"Span: {params.span:.1f} m",
                "x1": _r(left_rail_x),
                "y1": 45.0,
                "x2": _r(right_rail_x),
                "y2": 45.0,
                "orientation": "horizontal",
            },
            {
                "label": f"Girder Height: {params.girder_height:.1f} m",
                "x1": _r(front_dim_x),
                "y1": _r(top_y),
                "x2": _r(front_dim_x),
                "y2": _r(girder_bottom_y),
                "orientation": "vertical",
            },
        ],
        "info_labels": [
            {
                "label": f"Capacity: {params.capacity_t:.1f} t",
                "x": _r(mid_x),
                "y": 395.0,
            },
            {
                "label": f"Maximum Lift Height: {params.lift_height:.1f} m (input only; not shown geometrically)",
                "x": _r(mid_x),
                "y": 415.0,
            },
        ],
    }

    # =========================================================================
    # TOP VIEW (Looking down: X = span direction, Y = runway direction)
    # =========================================================================
    top_mid_y = TOP_MARGIN_TOP + TOP_AVAIL_H / 2.0  # 170.0 px
    end_truck_len_px = params.end_truck_length * scale
    girder_plan_w_px = EST_GIRDER_PLAN_WIDTH_M * scale
    trolley_plan_len_px = EST_TROLLEY_PLAN_LENGTH_M * scale

    truck_top_y = top_mid_y - end_truck_len_px / 2.0
    truck_bottom_y = top_mid_y + end_truck_len_px / 2.0
    top_dim_x = right_truck_right_x + 45.0

    top_view = {
        "canvas_width": int(TOP_CANVAS_W),
        "canvas_height": int(TOP_CANVAS_H),
        "components": {
            "left_rail_line": {
                "x1": _r(left_rail_x),
                "y1": 55.0,
                "x2": _r(left_rail_x),
                "y2": 275.0,
            },
            "right_rail_line": {
                "x1": _r(right_rail_x),
                "y1": 55.0,
                "x2": _r(right_rail_x),
                "y2": 275.0,
            },
            "left_truck": {
                "x": _r(left_truck_x),
                "y": _r(truck_top_y),
                "width": _r(end_truck_w_px),
                "height": _r(end_truck_len_px),
            },
            "right_truck": {
                "x": _r(right_truck_x),
                "y": _r(truck_top_y),
                "width": _r(end_truck_w_px),
                "height": _r(end_truck_len_px),
            },
            "girder": {
                "x": _r(girder_left_x),
                "y": _r(top_mid_y - girder_plan_w_px / 2.0),
                "width": _r(girder_w_px),
                "height": _r(girder_plan_w_px),
            },
            "trolley": {
                "x": _r(mid_x - trolley_w_px / 2.0),
                "y": _r(top_mid_y - trolley_plan_len_px / 2.0),
                "width": _r(trolley_w_px),
                "height": _r(trolley_plan_len_px),
            },
        },
        "dimensions": [
            {
                "label": f"Span: {params.span:.1f} m",
                "x1": _r(left_rail_x),
                "y1": 40.0,
                "x2": _r(right_rail_x),
                "y2": 40.0,
                "orientation": "horizontal",
            },
            {
                "label": f"End Truck Length: {params.end_truck_length:.1f} m",
                "x1": _r(top_dim_x),
                "y1": _r(truck_top_y),
                "x2": _r(top_dim_x),
                "y2": _r(truck_bottom_y),
                "orientation": "vertical",
            },
        ],
    }

    return {
        "common_scale_px_per_m": scale,
        "front_view": front_view,
        "top_view": top_view,
    }