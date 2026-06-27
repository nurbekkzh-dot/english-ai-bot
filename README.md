# English AI Mini App

## Local run

Backend:
```bash
cd mini_app/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:
```bash
cd mini_app/frontend
npm install
cp .env.example .env
npm run dev -- --host 0.0.0.0
```

Telegram launcher:
```bash
cd mini_app
cp .env.example .env
python3 bot_launcher.py
```

For local browser testing the app uses a demo Telegram user automatically. Backend uses SQLite locally when DATABASE_URL is not set.
