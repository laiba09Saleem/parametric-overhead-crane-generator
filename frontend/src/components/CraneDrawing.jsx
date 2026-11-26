import { useState } from 'react'
import DimensionLine from './DimensionLine.jsx'

/* ================================================================
   Component visual styles — engineering drawing colours
   ================================================================ */
const STYLE = {
  structure: {
    fill: '#1e3a5f',
    stroke: '#0a1628',
    strokeWidth: 1.5,
  },
  equipment: {
    fill: '#2563eb',
    stroke: '#1d4ed8',
    strokeWidth: 1.5,
  },
  rail: {
    fill: '#374151',
    stroke: '#111827',
    strokeWidth: 1,
  },
  rope: {
    stroke: '#6b7280',
    strokeWidth: 1.5,
    strokeDasharray: '4 3',
  },
  hookBody: {
    fill: '#374151',
    stroke: '#111827',
    strokeWidth: 1.5,
  },
  railLine: {
    stroke: '#3b82f6',
    strokeWidth: 1,
    strokeDasharray: '8 4',
  },
  dimension: {
    color: '#dc2626',
  },
}

/** Render one front-view component object by inspecting its shape fields. */
function FrontComponent({ name, shape }) {
  if (shape.cx !== undefined) {
    // Circle — hook body
    return (
      <circle
        cx={shape.cx} cy={shape.cy} r={shape.r}
        {...STYLE.hookBody}
      />
    )
  }
  if (shape.x1 !== undefined) {
    // Line — hoist rope
    return (
      <line
        x1={shape.x1} y1={shape.y1}
        x2={shape.x2} y2={shape.y2}
        {...STYLE.rope}
      />
    )
  }
  // Rect — girder, end trucks, rails, trolley, hoist body
  const style =
    name === 'left_rail' || name === 'right_rail' ? STYLE.rail
    : name === 'trolley'  || name === 'hoist'      ? STYLE.equipment
    : STYLE.structure
  return (
    <rect
      x={shape.x} y={shape.y}
      width={shape.width} height={shape.height}
      rx={2}
      {...style}
    />
  )
}

/** Render one top-view component object by inspecting its shape fields. */
function TopComponent({ name, shape }) {
  if (shape.x1 !== undefined) {
    // Line — dashed rail centreline
    return (
      <line
        x1={shape.x1} y1={shape.y1}
        x2={shape.x2} y2={shape.y2}
        {...STYLE.railLine}
      />
    )
  }
  // Rect — girder, end trucks, trolley
  const style = name === 'trolley' ? STYLE.equipment : STYLE.structure
  return (
    <rect
      x={shape.x} y={shape.y}
      width={shape.width} height={shape.height}
      rx={2}
      {...style}
    />
  )
}

/** Render one full view (front or top) as a responsive SVG. */
function CraneView({ view, renderComponent }) {
  const { canvas_width, canvas_height, components, dimensions, info_labels } = view

  return (
    <svg
      viewBox={`0 0 ${canvas_width} ${canvas_height}`}
      width="100%"
      style={{ display: 'block', background: 'transparent' }}
      aria-label="Crane drawing view"
    >
      {/* White semi-transparent surface over the grid background */}
      <rect
        x={0} y={0}
        width={canvas_width} height={canvas_height}
        fill="rgba(255,255,255,0.72)"
      />

      {/* Structural and equipment components */}
      <g>
        {Object.entries(components).map(([name, shape]) =>
          renderComponent(name, shape)
        )}
      </g>

      {/* Dimension lines — coordinates pre-computed by backend; offset=0 */}
      <g style={{ color: STYLE.dimension.color }}>
        {dimensions.map((dim, i) => (
          <DimensionLine
            key={i}
            x1={dim.x1} y1={dim.y1}
            x2={dim.x2} y2={dim.y2}
            label={dim.label}
            offset={0}
            vertical={dim.orientation === 'vertical'}
          />
        ))}
      </g>

      {/* Information labels (capacity, lift height) — illustrative only */}
      {info_labels && (
        <g>
          {info_labels.map((lbl, i) => (
            <text
              key={i}
              x={lbl.x} y={lbl.y}
              fontSize="11"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#64748b"
              fontFamily="system-ui, sans-serif"
              fontStyle="italic"
            >
              {lbl.label}
            </text>
          ))}
        </g>
      )}
    </svg>
  )
}

/** Main exported component. Accepts the full geometry dict from the backend. */
function CraneDrawing({ geometry }) {
  const [activeView, setActiveView] = useState('front')

  if (!geometry) {
    return (
      <div className="drawing-panel-inner">
        <div className="empty-state">
          <div className="empty-state-icon">🏗</div>
          <div className="empty-state-title">No drawing generated yet</div>
          <p className="empty-state-hint">
            Enter crane parameters in the left panel and click{' '}
            <strong>Generate Drawing</strong> to produce a dimensioned 2D drawing.
          </p>
        </div>
      </div>
    )
  }

  const { front_view, top_view, common_scale_px_per_m } = geometry

  const isFront = activeView === 'front'
  const activeData = isFront ? front_view : top_view
  const viewLabel = isFront ? 'FRONT ELEVATION' : 'PLAN VIEW'
  const projection = isFront
    ? 'Looking along runway direction'
    : 'Looking straight down from above'

  return (
    <div className="drawing-panel-inner">

      {/* View selector tabs */}
      <div className="view-tabs">
        <button
          className={`btn ${activeView === 'front' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveView('front')}
        >
          Front Elevation
        </button>
        <button
          className={`btn ${activeView === 'top' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveView('top')}
        >
          Plan View
        </button>
      </div>

      {/* View caption */}
      <div className="drawing-caption">{projection}</div>

      {/* CAD drawing frame with grid background (from CSS) */}
      <div className="drawing-frame">
        <div className="drawing-svg-wrap">
          <CraneView
            view={activeData}
            renderComponent={(name, shape) =>
              isFront
                ? <FrontComponent key={name} name={name} shape={shape} />
                : <TopComponent key={name} name={name} shape={shape} />
            }
          />
        </div>
      </div>

      {/* Engineering title block */}
      <div className="drawing-title-block">
        <div className="title-block-cell">
          <span className="title-block-label">Project</span>
          <span className="title-block-value">Parametric EOT Crane Generator</span>
        </div>
        <div className="title-block-cell">
          <span className="title-block-label">View</span>
          <span className="title-block-value">{viewLabel}</span>
        </div>
        <div className="title-block-cell">
          <span className="title-block-label">Scale (px/m)</span>
          <span className="title-block-value">
            {common_scale_px_per_m != null
              ? common_scale_px_per_m.toFixed(1)
              : '—'}
          </span>
        </div>
      </div>

      {/* Disclaimer meta row */}
      <div className="drawing-meta">
        <span>Top-Running Single-Girder EOT · Under-Running Trolley Hoist</span>
        <span>🔶 Geometric estimate — not for structural use</span>
      </div>

    </div>
  )
}

export default CraneDrawing