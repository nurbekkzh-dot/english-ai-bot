from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database.db_core import init_db
from routers import chat, user, voice

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="AI English Bot API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router,  prefix="/api/chat",  tags=["chat"])
app.include_router(user.router,  prefix="/api/user",  tags=["user"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])

app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="static")
