import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createDesign, previewDesign } from '../api/designsApi.js'
import CraneDrawing from '../components/CraneDrawing.jsx'
import CraneForm from '../components/CraneForm.jsx'

function HomePage() {
  const [geometry, setGeometry] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [success, setSuccess]   = useState(null)

  // -----------------------------------------------------------------
  // Generate Drawing — preview only, no database write
  // -----------------------------------------------------------------
  async function handlePreview(data) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await previewDesign(data)
      setGeometry(result)
    } catch (err) {
      setError(err.message || 'Failed to generate drawing. Please check your inputs.')
    } finally {
      setLoading(false)
    }
  }

  // -----------------------------------------------------------------
  // Save Design — sequential: save first, then refresh preview.
  //
  // Why not Promise.all()?
  // If createDesign() succeeds but previewDesign() fails, Promise.all()
  // rejects entirely and the user may think the design was NOT saved —
  // causing them to submit again and creating a duplicate record.
  // Sequential handling lets us confirm the save before attempting the
  // preview refresh.
  // -----------------------------------------------------------------
  async function handleSave(data) {
    setLoading(true)
    setError(null)
    setSuccess(null)

    let saved = null

    // Step 1: Save to database
    try {
      saved = await createDesign(data)
      setSuccess(
        `Design "${saved.name}" saved successfully (ID: ${saved.id}).`
      )
    } catch (err) {
      setError(err.message || 'Failed to save design. Please try again.')
      setLoading(false)
      return
    }

    // Step 2: Refresh preview drawing (save already succeeded above)
    try {
      const result = await previewDesign(data)
      setGeometry(result)
    } catch (err) {
      // The save succeeded — do not clear the success message.
      // Add a separate note that only the preview refresh failed.
      setError(
        'Design was saved successfully, but the drawing preview could not be refreshed. ' +
        'You can open your design from Saved Designs to view it.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">

      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-header-inner">
          <div>
            <div className="app-title">Parametric Overhead Crane Generator</div>
            <div className="app-subtitle">
              Top-Running Single-Girder EOT Crane — 2D Drawing Generator
            </div>
          </div>
          <nav className="app-nav" aria-label="Main navigation">
            <Link to="/" className="nav-link active">
              New Drawing
            </Link>
            <Link to="/designs" className="nav-link">
              Saved Designs
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Main workspace ── */}
      <main className="page-container">

        {/* Feedback banners */}
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="status">
            {success}
          </div>
        )}

        <div className="workspace-grid">

          {/* Left panel — parameter form */}
          <div className="panel">
            <h2 className="section-heading">Crane Parameters</h2>
            <CraneForm
              onPreview={handlePreview}
              onSave={handleSave}
              loading={loading}
            />
          </div>

          {/* Right panel — SVG drawing */}
          <div className="panel">
            <h2 className="section-heading">Generated Drawing</h2>
            <CraneDrawing geometry={geometry} />
          </div>

        </div>
      </main>

    </div>
  )
}

export default HomePage