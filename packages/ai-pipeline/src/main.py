from fastapi import FastAPI

app = FastAPI(
    title="DecorAI AI Pipeline",
    version="0.1.0",
    description="AI-powered image generation and processing pipeline",
)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
