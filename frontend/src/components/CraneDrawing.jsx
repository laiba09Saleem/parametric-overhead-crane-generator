import { useState } from 'react'
import DimensionLine from './DimensionLine.jsx'

// --- Component-specific fill/stroke colours ---
const STYLE = {
  structure:   { fill: '#334155', stroke: '#1e293b', strokeWidth: 1.2 }, // end trucks + girder
  rail:        { fill: '#64748b', stroke: '#475569', strokeWidth: 1 },   // runway rails
  equipment:   { fill: '#1d4ed8', stroke: '#1e40af', strokeWidth: 1.2 }, // trolley + hoist
  hookBody:    { fill: 'none',    stroke: '#1d4ed8', strokeWidth: 2 },   // hook circle
  rope:        { fill: 'none',    stroke: '#475569', strokeWidth: 1, strokeDasharray: '4,3' },
  railLine:    { fill: 'none',    stroke: '#94a3b8', strokeWidth: 1.5,  strokeDasharray: '8,4' },
  dimension:   { color: '#64748b' },
}

/** Render one front-view component object by inspecting its shape. */
function FrontComponent({ name, shape }) {
  if (shape.cx !== undefined) {
    // Circle: hook
    return <circle cx={shape.cx} cy={shape.cy} r={shape.r} {...STYLE.hookBody} />
  }
  if (shape.x1 !== undefined) {
    // Line: rope
    return (
      <line
        x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2}
        {...STYLE.rope}
      />
    )
  }
  // Rect
  const style =
    name === 'left_rail' || name === 'right_rail' ? STYLE.rail
    : name === 'trolley' || name === 'hoist'       ? STYLE.equipment
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

/** Render one top-view component object by inspecting its shape. */
function TopComponent({ name, shape }) {
  if (shape.x1 !== undefined) {
    // Dashed rail centreline
    return (
      <line
        x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2}
        {...STYLE.railLine}
      />
    )
  }
  // Rect
  const style =
    name === 'trolley' ? STYLE.equipment : STYLE.structure
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
      style={{ display: 'block', maxWidth: canvas_width, border: '1px solid var(--border)', borderRadius: 6, background: '#f8fafc' }}
      aria-label="Crane drawing view"
    >
      {/* Components */}
      <g>
        {Object.entries(components).map(([name, shape]) =>
          renderComponent(name, shape)
        )}
      </g>

      {/* Dimension lines (coordinates are pre-computed by backend) */}
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

      {/* Info labels (capacity, lift height) */}
      {info_labels && (
        <g>
          {info_labels.map((lbl, i) => (
            <text
              key={i}
              x={lbl.x} y={lbl.y}
              fontSize="12"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#64748b"
              fontFamily="system-ui, sans-serif"
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
      <div className="empty-state">
        <p>No drawing to display yet.</p>
        <p className="helper-text">Enter crane parameters and click <strong>Generate Drawing</strong>.</p>
      </div>
    )
  }

  const { front_view, top_view } = geometry

  return (
    <div>
      {/* View selector tabs */}
      <div className="view-tabs">
        <button
          className={`btn ${activeView === 'front' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveView('front')}
        >
          Front View
        </button>
        <button
          className={`btn ${activeView === 'top' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveView('top')}
        >
          Top View
        </button>
      </div>

      {activeView === 'front' && (
        <div>
          <p className="helper-text" style={{ marginBottom: '0.5rem' }}>
            Elevation — looking along runway direction
          </p>
          <CraneView
            view={front_view}
            renderComponent={(name, shape) => (
              <FrontComponent key={name} name={name} shape={shape} />
            )}
          />
        </div>
      )}

      {activeView === 'top' && (
        <div>
          <p className="helper-text" style={{ marginBottom: '0.5rem' }}>
            Plan — looking straight down from above
          </p>
          <CraneView
            view={top_view}
            renderComponent={(name, shape) => (
              <TopComponent key={name} name={name} shape={shape} />
            )}
          />
        </div>
      )}

      {/* Scale reference */}
      <p className="helper-text" style={{ marginTop: '0.5rem' }}>
        Scale: {geometry.common_scale_px_per_m.toFixed(2)} px/m
      </p>
    </div>
  )
}

export default CraneDrawing