function formatDateTime(isoString) {
  if (!isoString) return '—'
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString))
  } catch {
    return isoString
  }
}

function DesignList({ designs = [], onSelect, loading = false, selectedId }) {
  if (loading) {
    return <p className="helper-text">Loading saved designs…</p>
  }

  if (designs.length === 0) {
    return (
      <div className="empty-state">
        <p>No saved designs yet.</p>
        <p className="helper-text">
          Generate a drawing and click <strong>Save Design</strong> to store it here.
        </p>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="designs-table">
        <thead>
          <tr>
            <th>Design Name</th>
            <th>Span (m)</th>
            <th>Capacity (t)</th>
            <th>Last Updated</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {designs.map((design) => {
            const isSelected = design.id === selectedId
            return (
              <tr
                key={design.id}
                style={{
                  background: isSelected ? '#eff6ff' : undefined,
                  fontWeight: isSelected ? 500 : undefined,
                }}
              >
                <td>{design.name ?? '—'}</td>
                <td>{design.span != null ? design.span.toFixed(1) : '—'}</td>
                <td>{design.capacity_t != null ? design.capacity_t.toFixed(1) : '—'}</td>
                <td>{formatDateTime(design.updated_at)}</td>
                <td>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }}
                    onClick={() => onSelect(design.id)}
                    aria-label={`Open design ${design.name}`}
                  >
                    {isSelected ? 'Opened' : 'Open'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default DesignList