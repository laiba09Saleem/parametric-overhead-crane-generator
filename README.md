# Parametric Overhead Crane Drawing Generator

A local full-stack web application that generates dimensioned 2D drawings of a **Top-Running Single-Girder EOT Crane with Under-Running Trolley Hoist** from user-defined parameters.

---

## Project Overview

Users can:

- Enter crane parameters (span, capacity, girder height, etc.)
- Generate a dimensioned 2D drawing (front view and top view)
- Save designs to a local database
- List and reopen previously saved designs
- Edit existing designs and save updates

This is a **geometric drawing generator** — not a structural engineering certification system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, JavaScript, Vite |
| Styling | Plain CSS |
| Drawing | SVG (native browser rendering) |
| Routing | React Router DOM |
| Backend | Python 3.10+, FastAPI |
| Validation | Pydantic (via FastAPI) |
| Database | SQLite (Python built-in `sqlite3`) |
| Server | Uvicorn (ASGI) |
| Version Control | Git + GitHub |

---

## Project Structure

```
parametric-overhead-crane-generator/
├── backend/
│   ├── venv/                    # Python virtual environment (not committed)
│   ├── routers/
│   │   └── designs.py           # /designs API endpoints
│   ├── services/
│   │   ├── geometry_engine.py   # Crane geometry calculations
│   │   └── design_service.py   # CRUD business logic
│   ├── models/
│   │   └── schemas.py           # Pydantic schemas
│   ├── database/
│   │   ├── db.py                # SQLite connection and table creation
│   │   └── crane.db             # SQLite file (auto-created, not committed)
│   ├── main.py                  # FastAPI app entry point
│   └── requirements.txt         # Python dependencies
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── designsApi.js    # All fetch() calls to FastAPI
│   │   ├── components/
│   │   │   ├── CraneForm.jsx
│   │   │   ├── CraneDrawing.jsx
│   │   │   ├── DimensionLine.jsx
│   │   │   └── DesignList.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   └── DesignsPage.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Local Setup Instructions

### Prerequisites

Ensure the following are installed before proceeding:

| Software | Minimum Version | Check Command |
|---|---|---|
| Node.js | 18.x.x | `node --version` |
| npm | 9.x.x | `npm --version` |
| Python | 3.10.x | `python --version` |
| Git | 2.x.x | `git --version` |

---

### 1. Clone the Repository

```bash
git clone https://github.com/laiba09Saleem/parametric-overhead-crane-generator.git
cd parametric-overhead-crane-generator
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload --port 8000
```

Backend will be available at: `http://localhost:8000`  
Interactive API docs: `http://localhost:8000/docs`

---

### 3. Frontend Setup

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

### 4. Using the Application

1. Open `http://localhost:5173` in your browser.
2. Enter crane parameters in the form.
3. Click **Generate Drawing** to view the dimensioned SVG.
4. Click **Save Design** to persist the design.
5. Navigate to **Saved Designs** to list, reopen, or edit previous designs.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/designs/preview` | Generate drawing geometry (not saved) |
| `POST` | `/designs` | Save a new design |
| `GET` | `/designs` | List all saved designs |
| `GET` | `/designs/{id}` | Retrieve a saved design by ID |
| `PUT` | `/designs/{id}` | Update an existing design |

Full interactive documentation available at `http://localhost:8000/docs` when the backend is running.

---

## Notes

- The SQLite database file (`crane.db`) is created automatically on first backend run.
- The database file is excluded from version control via `.gitignore`.
- Each developer starts with a clean local database.
- No internet connection is required after initial setup.

---

## Assignment Context

**Course:** Modern Crane Co — Home Assignment  
**Project Type:** Take-home assignment  
**Configuration:** Top-Running Single-Girder EOT Crane with Under-Running Trolley Hoist  
**Scope:** Geometric drawing generator only — no structural strength calculations
