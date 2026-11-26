function DimensionLine({ x1, y1, x2, y2, label, offset = 20, vertical = false }) {
  const arrowSize = 7
  const arrowHalf = 3.5

  if (vertical) {
    const minY = Math.min(y1, y2)
    const maxY = Math.max(y1, y2)
    const dimX = x1 + offset
    const midY = (minY + maxY) / 2
    const labelX = dimX + 14

    return (
      <g className="dimension-line" stroke="currentColor" fill="currentColor">
        {/* Extension lines (or end ticks when offset is 0) */}
        {offset !== 0 ? (
          <>
            <line x1={x1} y1={minY} x2={dimX + 5} y2={minY} strokeWidth="1" strokeDasharray="3,2" />
            <line x1={x2} y1={maxY} x2={dimX + 5} y2={maxY} strokeWidth="1" strokeDasharray="3,2" />
          </>
        ) : (
          <>
            <line x1={dimX - 5} y1={minY} x2={dimX + 5} y2={minY} strokeWidth="1" />
            <line x1={dimX - 5} y1={maxY} x2={dimX + 5} y2={maxY} strokeWidth="1" />
          </>
        )}

        {/* Main vertical dimension line */}
        <line x1={dimX} y1={minY} x2={dimX} y2={maxY} strokeWidth="1.2" />

        {/* Top & bottom arrowheads */}
        <polygon
          points={`${dimX},${minY} ${dimX - arrowHalf},${minY + arrowSize} ${dimX + arrowHalf},${minY + arrowSize}`}
          stroke="none"
        />
        <polygon
          points={`${dimX},${maxY} ${dimX - arrowHalf},${maxY - arrowSize} ${dimX + arrowHalf},${maxY - arrowSize}`}
          stroke="none"
        />

        {/* Rotated dimension label */}
        <text
          x={labelX}
          y={midY}
          fontSize="12"
          fontWeight="500"
          textAnchor="middle"
          dominantBaseline="middle"
          stroke="none"
          transform={`rotate(-90, ${labelX}, ${midY})`}
        >
          {label}
        </text>
      </g>
    )
  }

  // Horizontal dimension
  const minX = Math.min(x1, x2)
  const maxX = Math.max(x1, x2)
  const dimY = y1 - offset
  const midX = (minX + maxX) / 2

  return (
    <g className="dimension-line" stroke="currentColor" fill="currentColor">
      {/* Extension lines (or end ticks when offset is 0) */}
      {offset !== 0 ? (
        <>
          <line x1={minX} y1={y1} x2={minX} y2={dimY - 5} strokeWidth="1" strokeDasharray="3,2" />
          <line x1={maxX} y1={y2} x2={maxX} y2={dimY - 5} strokeWidth="1" strokeDasharray="3,2" />
        </>
      ) : (
        <>
          <line x1={minX} y1={dimY - 5} x2={minX} y2={dimY + 5} strokeWidth="1" />
          <line x1={maxX} y1={dimY - 5} x2={maxX} y2={dimY + 5} strokeWidth="1" />
        </>
      )}

      {/* Main horizontal dimension line */}
      <line x1={minX} y1={dimY} x2={maxX} y2={dimY} strokeWidth="1.2" />

      {/* Left & right arrowheads */}
      <polygon
        points={`${minX},${dimY} ${minX + arrowSize},${dimY - arrowHalf} ${minX + arrowSize},${dimY + arrowHalf}`}
        stroke="none"
      />
      <polygon
        points={`${maxX},${dimY} ${maxX - arrowSize},${dimY - arrowHalf} ${maxX - arrowSize},${dimY + arrowHalf}`}
        stroke="none"
      />

      {/* Centered label above the line */}
      <text
        x={midX}
        y={dimY - 7}
        fontSize="12"
        fontWeight="500"
        textAnchor="middle"
        stroke="none"
      >
        {label}
      </text>
    </g>
  )
}

export default DimensionLine