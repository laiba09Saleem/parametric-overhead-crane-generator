from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Parametric Overhead Crane Generator",
    description="Backend API for generating dimensioned 2D crane drawings.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Crane Generator API is running."}

@app.get("/health")
def health():
    return {"status": "ok"}