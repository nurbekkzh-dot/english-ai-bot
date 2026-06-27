import os
import sqlite3

DATABASE_URL = os.getenv("DATABASE_URL")
DB_PATH = os.getenv("DB_PATH", "mini_app.db")


def is_postgres() -> bool:
    return bool(DATABASE_URL)


def get_connection():
    if is_postgres():
        import psycopg2
        from psycopg2.extras import RealDictCursor

        return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    if is_postgres():
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id         BIGINT PRIMARY KEY,
                username        TEXT,
                english_level   TEXT,
                current_mode    TEXT DEFAULT 'free_chat',
                response_format TEXT DEFAULT 'text',
                xp              INTEGER DEFAULT 0,
                streak          INTEGER DEFAULT 0,
                last_activity   TEXT
            )
        """)
    else:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id         INTEGER PRIMARY KEY,
                username        TEXT,
                english_level   TEXT,
                current_mode    TEXT DEFAULT 'free_chat',
                response_format TEXT DEFAULT 'text',
                xp              INTEGER DEFAULT 0,
                streak          INTEGER DEFAULT 0,
                last_activity   TEXT
            )
        """)

    conn.commit()
    cursor.close()
    conn.close()
    print("✅ База данных инициализирована.")
