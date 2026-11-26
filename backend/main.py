from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import init_db
from routers.designs import router as designs_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the SQLite database table when the application starts."""
    init_db()
    yield


app = FastAPI(
    title="Parametric Overhead Crane Generator",
    description="Backend API for generating dimensioned 2D crane drawings.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(designs_router)


@app.get("/")
def root():
    return {"message": "Crane Generator API is running."}


@app.get("/health")
def health():
    return {"status": "ok"}