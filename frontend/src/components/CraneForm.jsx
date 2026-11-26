import { useEffect, useState } from 'react'

const DEFAULTS = {
  name: 'My Overhead Crane',
  span: 10,
  capacity_t: 5,
  girder_height: 0.8,
  end_truck_length: 1.2,
  lift_height: 4,
}

const FIELDS = [
  {
    key: 'span',
    label: 'Span',
    unit: 'm',
    min: 3,
    max: 30,
    step: 0.5,
    hint: '3–30 m · Rail centreline to centreline',
  },
  {
    key: 'capacity_t',
    label: 'Lifting Capacity',
    unit: 't',
    min: 0.5,
    max: 20,
    step: 0.5,
    hint: '0.5–20 t · Label only — does not resize components',
  },
  {
    key: 'girder_height',
    label: 'Girder Height',
    unit: 'm',
    min: 0.2,
    max: 2,
    step: 0.05,
    hint: '0.2–2 m · Vertical depth of bridge girder',
  },
  {
    key: 'end_truck_length',
    label: 'End Truck Length',
    unit: 'm',
    min: 0.5,
    max: 3,
    step: 0.1,
    hint: '0.5–3 m · Along runway direction',
  },
  {
    key: 'lift_height',
    label: 'Max Lift Height',
    unit: 'm',
    min: 1,
    max: 15,
    step: 0.5,
    hint: '1–15 m · Hook travel; shown as label only',
  },
]

function validate(values) {
  const errors = {}

  if (!values.name || values.name.trim().length === 0) {
    errors.name = 'Design name is required.'
  } else if (values.name.trim().length > 100) {
    errors.name = 'Must be 100 characters or fewer.'
  }

  FIELDS.forEach(({ key, min, max }) => {
    const val = parseFloat(values[key])
    if (isNaN(val)) {
      errors[key] = `Enter a valid number.`
    } else if (val < min || val > max) {
      errors[key] = `${min}–${max}`
    }
  })

  return errors
}

function buildPayload(values) {
  return {
    name: values.name.trim(),
    span: parseFloat(values.span),
    capacity_t: parseFloat(values.capacity_t),
    girder_height: parseFloat(values.girder_height),
    end_truck_length: parseFloat(values.end_truck_length),
    lift_height: parseFloat(values.lift_height),
  }
}

function CraneForm({ onPreview, onSave, loading = false, initialValues }) {
  const [values, setValues] = useState({ ...DEFAULTS, ...initialValues })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  
  useEffect(() => {
    if (initialValues) {
      setValues({ ...DEFAULTS, ...initialValues })
      setErrors({})
      setTouched({})
    }
  }, [initialValues])

  function handleChange(e) {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  function handleBlur(e) {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors(validate(values))
  }

  function handleSubmit(callback) {
    // Mark all fields touched so every error becomes visible
    const allTouched = Object.fromEntries(
      ['name', ...FIELDS.map((f) => f.key)].map((k) => [k, true])
    )
    setTouched(allTouched)

    const errs = validate(values)
    setErrors(errs)

    if (Object.keys(errs).length > 0) return

    callback(buildPayload(values))
  }

  const disabled = loading

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate aria-label="Crane parameters form">
      <div className="form-stack">

        {/* Disclaimer strip */}
        <div className="form-disclaimer">
          <span>⚠</span>
          <span>
            Parameter ranges are drawing-generator limits only — not structural
            or safety standards.
          </span>
        </div>

        {/* Design Name — full width */}
        <div className={`form-group full-width${errors.name && touched.name ? ' has-error' : ''}`}>
          <label className="form-label" htmlFor="field-name">
            Design Name
          </label>
          <input
            id="field-name"
            className={`form-input${errors.name && touched.name ? ' error' : ''}`}
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={100}
            disabled={disabled}
            autoComplete="off"
          />
          {errors.name && touched.name && (
            <span className="field-error">{errors.name}</span>
          )}
        </div>

        {/* Numeric Fields */}
        {FIELDS.map(({ key, label, unit, min, max, step, hint }) => {
          const hasErr = errors[key] && touched[key]
          return (
            <div
              className={`form-group${hasErr ? ' has-error' : ''}`}
              key={key}
            >
              <label className="form-label" htmlFor={`field-${key}`}>
                {label}
              </label>

              <input
                id={`field-${key}`}
                className={`form-input${hasErr ? ' error' : ''}`}
                type="number"
                name={key}
                value={values[key]}
                min={min}
                max={max}
                step={step}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled}
              />

              {/* Show actual validation message for NaN; range message otherwise */}
              {hasErr ? (
                <span className="field-error">
                  {errors[key] === 'Enter a valid number.'
                    ? errors[key]
                    : `Out of range (${min}–${max} ${unit})`}
                </span>
              ) : (
                <div className="field-hint-wrap">
                  <span className="field-hint">
                    <span className="form-unit">{unit}</span>&nbsp; {hint}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Action buttons — labels match the helper text shown in DesignsPage */}
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleSubmit(onPreview)}
          disabled={disabled}
          title="Generate a 2D drawing preview without saving"
        >
          {loading ? <span className="btn-spinner" /> : '⚙'}
          {loading ? 'Working…' : 'Generate Drawing'}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => handleSubmit(onSave)}
          disabled={disabled}
          title="Save this design to the database"
        >
           Save Design
        </button>
      </div>
    </form>
  )
}

export default CraneForm