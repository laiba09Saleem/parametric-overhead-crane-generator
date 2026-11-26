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
    hint: 'Distance between runway rail centrelines.',
  },
  {
    key: 'capacity_t',
    label: 'Lifting Capacity',
    unit: 't',
    min: 0.5,
    max: 20,
    step: 0.5,
    hint: 'Shown as a label on the drawing only. Does not size components.',
  },
  {
    key: 'girder_height',
    label: 'Girder Height',
    unit: 'm',
    min: 0.2,
    max: 2,
    step: 0.05,
    hint: 'Vertical height of the main bridge girder.',
  },
  {
    key: 'end_truck_length',
    label: 'End Truck Length',
    unit: 'm',
    min: 0.5,
    max: 3,
    step: 0.1,
    hint: 'End truck dimension along the runway direction.',
  },
  {
    key: 'lift_height',
    label: 'Maximum Lift Height',
    unit: 'm',
    min: 1,
    max: 15,
    step: 0.5,
    hint: 'Maximum hook travel. Shown as an input label only; not drawn geometrically.',
  },
]

function validate(values) {
  const errors = {}

  if (!values.name || values.name.trim().length === 0) {
    errors.name = 'Design name is required.'
  } else if (values.name.trim().length > 100) {
    errors.name = 'Design name must be 100 characters or fewer.'
  }

  FIELDS.forEach(({ key, label, min, max }) => {
    const val = parseFloat(values[key])
    if (isNaN(val)) {
      errors[key] = `${label} must be a number.`
    } else if (val < min || val > max) {
      errors[key] = `${label} must be between ${min} and ${max}.`
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

  // Repopulate form when a saved design is opened for editing
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
    const errs = validate(values)
    setErrors(errs)
  }

  function handleSubmit(callback) {
    // Mark all fields as touched to show every error
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
    <form
      onSubmit={(e) => e.preventDefault()}
      noValidate
      aria-label="Crane parameters form"
    >
      <div className="form-stack">

        {/* Disclaimer */}
        <p className="helper-text">
          Input ranges are application limits for the 2D drawing generator only —
          not structural design or safety standards.
        </p>

        {/* Design Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="field-name">
            Design Name
          </label>
          <input
            id="field-name"
            className="form-input"
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={100}
            disabled={disabled}
            aria-describedby={errors.name && touched.name ? 'err-name' : undefined}
          />
          {errors.name && touched.name && (
            <span id="err-name" className="helper-text" style={{ color: 'var(--danger)' }}>
              {errors.name}
            </span>
          )}
        </div>

        {/* Numeric Fields */}
        {FIELDS.map(({ key, label, unit, min, max, step, hint }) => (
          <div className="form-group" key={key}>
            <label className="form-label" htmlFor={`field-${key}`}>
              {label}&nbsp;
              <span className="helper-text">({unit})</span>
            </label>
            <input
              id={`field-${key}`}
              className="form-input"
              type="number"
              name={key}
              value={values[key]}
              onChange={handleChange}
              onBlur={handleBlur}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              aria-describedby={
                errors[key] && touched[key]
                  ? `err-${key}`
                  : `hint-${key}`
              }
            />
            {errors[key] && touched[key] ? (
              <span id={`err-${key}`} className="helper-text" style={{ color: 'var(--danger)' }}>
                {errors[key]}
              </span>
            ) : (
              <span id={`hint-${key}`} className="helper-text">
                {hint} ({min}–{max} {unit})
              </span>
            )}
          </div>
        ))}

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSubmit(onPreview)}
            disabled={disabled}
          >
            {loading ? 'Generating…' : 'Generate Drawing'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSubmit(onSave)}
            disabled={disabled}
          >
            {loading ? 'Saving…' : 'Save Design'}
          </button>
        </div>

      </div>
    </form>
  )
}

export default CraneForm