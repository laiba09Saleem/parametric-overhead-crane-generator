import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getDesign,
  getDesigns,
  previewDesign,
  updateDesign,
} from '../api/designsApi.js'
import CraneDrawing from '../components/CraneDrawing.jsx'
import CraneForm from '../components/CraneForm.jsx'
import DesignList from '../components/DesignList.jsx'

/**
 * Extract only the form-compatible fields from a flat DesignResponse.
 * DesignResponse returns all fields at the top level (not nested under
 * a "parameters" key) — confirmed from design_service.py.
 */
function extractFormValues(design) {
  return {
    name:             design.name,
    span:             design.span,
    capacity_t:       design.capacity_t,
    girder_height:    design.girder_height,
    end_truck_length: design.end_truck_length,
    lift_height:      design.lift_height,
  }
}

function DesignsPage() {
  const [designs,       setDesigns]       = useState([])
  const [selectedId,    setSelectedId]    = useState(null)
  const [initialValues, setInitialValues] = useState(null)
  const [geometry,      setGeometry]      = useState(null)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState(null)
  const [success,       setSuccess]       = useState(null)

  // -----------------------------------------------------------------
  // Load all saved designs on mount
  // -----------------------------------------------------------------
  useEffect(() => {
    async function loadDesigns() {
      setLoading(true)
      setError(null)
      try {
        const list = await getDesigns()
        setDesigns(list)
      } catch (err) {
        setError(err.message || 'Failed to load saved designs.')
      } finally {
        setLoading(false)
      }
    }
    loadDesigns()
  }, [])

  // -----------------------------------------------------------------
  // Open an existing design
  // -----------------------------------------------------------------
  async function handleSelect(id) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const design = await getDesign(id)
      const formValues = extractFormValues(design)

      setSelectedId(design.id)
      setInitialValues(formValues)   // repopulates CraneForm

      const result = await previewDesign(formValues)
      setGeometry(result)
    } catch (err) {
      setError(err.message || 'Failed to open the selected design.')
    } finally {
      setLoading(false)
    }
  }

  // -----------------------------------------------------------------
  // Preview current form values without saving
  // -----------------------------------------------------------------
  async function handlePreview(data) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await previewDesign(data)
      setGeometry(result)
    } catch (err) {
      setError(err.message || 'Failed to generate drawing.')
    } finally {
      setLoading(false)
    }
  }

  // -----------------------------------------------------------------
  // Update the selected design — sequential, never Promise.all().
  //
  // Why outer try/finally?
  // setLoading(false) must run regardless of whether the update
  // fails early (inner return), succeeds, or an unexpected error
  // occurs. Without finally, any extra return path risks leaving
  // loading permanently true, disabling all form buttons.
  // -----------------------------------------------------------------
  async function handleUpdate(data) {
    if (!selectedId) {
      setError('No design selected. Open a design from the list first.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Step 1: Update in database — if this fails, stop immediately.
      let updated = null
      try {
        updated = await updateDesign(selectedId, data)
        setSuccess(
          `Design "${updated.name}" updated successfully (ID: ${updated.id}).`
        )
      } catch (err) {
        setError(err.message || 'Failed to update the design. Please try again.')
        return
      }

      // Steps 2 & 3: Refresh list and preview — collect failures separately.
      const refreshErrors = []

      try {
        const list = await getDesigns()
        setDesigns(list)
      } catch {
        refreshErrors.push('the saved designs list could not be refreshed')
      }

      try {
        const result = await previewDesign(data)
        setGeometry(result)
      } catch {
        refreshErrors.push('the drawing preview could not be refreshed')
      }

      if (refreshErrors.length > 0) {
        // The database update succeeded — do not imply otherwise.
        setError(
          `Design was updated successfully, but ${refreshErrors.join(' and ')}. ` +
          'You can reload the page to see the latest state.'
        )
      }

    } finally {
      setLoading(false)
    }
  }

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
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
            <Link to="/" className="nav-link">
              New Drawing
            </Link>
            <Link to="/designs" className="nav-link active">
              Saved Designs
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Main content ── */}
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

        {/* ── Saved designs list ── */}
        <div className="panel" style={{ marginBottom: '1.5rem' }}>
          <h2 className="section-heading">Saved Crane Designs</h2>
          <DesignList
            designs={designs}
            onSelect={handleSelect}
            loading={loading && !selectedId}
            selectedId={selectedId}
          />
        </div>

        {/* ── Prompt when nothing is selected ── */}
        {!selectedId && !loading && (
          <p className="helper-text">
            Select a design from the list above to view and edit it.
          </p>
        )}

        {/* ── Edit workspace (shown only after a design is selected) ── */}
        {selectedId && initialValues && (
          <div className="workspace-grid">

            {/* Left: edit form */}
            <div className="panel">
              <h2 className="section-heading">Edit Design</h2>
              <p className="helper-text" style={{ marginBottom: '1rem' }}>
                Editing design ID {selectedId}. Click <strong>Save Design</strong> to
                apply changes, or <strong>Generate Drawing</strong> to preview without saving.
              </p>
              <CraneForm
                initialValues={initialValues}
                onPreview={handlePreview}
                onSave={handleUpdate}
                loading={loading}
              />
            </div>

            {/* Right: drawing */}
            <div className="panel">
              <h2 className="section-heading">Drawing</h2>
              <CraneDrawing geometry={geometry} />
            </div>

          </div>
        )}

      </main>
    </div>
  )
}

export default DesignsPage