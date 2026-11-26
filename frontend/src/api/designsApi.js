const BASE = '/api/designs'

/**
 * Parse a Response. If the status is not OK, extract FastAPI's
 * `detail` message and throw a descriptive Error.
 */
async function handleResponse(response) {
  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    try {
      const body = await response.json()
      if (body.detail) {
        detail = typeof body.detail === 'string'
          ? body.detail
          : JSON.stringify(body.detail)
      }
    } catch {
      // Response body is not JSON — keep the status code message
    }
    throw new Error(detail)
  }
  return response.json()
}

/** Shared options for POST and PUT requests that send JSON bodies. */
function jsonOptions(method, data) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }
}

/**
 * POST /api/designs/preview
 * Validate parameters and return Front + Top View SVG geometry.
 * Does NOT save anything to the database.
 */
export async function previewDesign(data) {
  try {
    const response = await fetch(`${BASE}/preview`, jsonOptions('POST', data))
    return handleResponse(response)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Cannot reach the backend. Is the FastAPI server running on port 8000?')
    }
    throw error
  }
}

/**
 * POST /api/designs
 * Save a new crane design to SQLite. Returns the created DesignResponse.
 */
export async function createDesign(data) {
  try {
    const response = await fetch(BASE, jsonOptions('POST', data))
    return handleResponse(response)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Cannot reach the backend. Is the FastAPI server running on port 8000?')
    }
    throw error
  }
}

/**
 * GET /api/designs
 * Return a summary list of all saved designs.
 */
export async function getDesigns() {
  try {
    const response = await fetch(BASE)
    return handleResponse(response)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Cannot reach the backend. Is the FastAPI server running on port 8000?')
    }
    throw error
  }
}

/**
 * GET /api/designs/{id}
 * Return one saved design by ID. Throws if the design is not found (404).
 */
export async function getDesign(id) {
  try {
    const response = await fetch(`${BASE}/${id}`)
    return handleResponse(response)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Cannot reach the backend. Is the FastAPI server running on port 8000?')
    }
    throw error
  }
}

/**
 * PUT /api/designs/{id}
 * Update an existing saved design by ID. Throws if the design is not found (404).
 */
export async function updateDesign(id, data) {
  try {
    const response = await fetch(`${BASE}/${id}`, jsonOptions('PUT', data))
    return handleResponse(response)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Cannot reach the backend. Is the FastAPI server running on port 8000?')
    }
    throw error
  }
}