from datetime import date

from database.db_core import get_connection, is_postgres


def _placeholder() -> str:
    return "%s" if is_postgres() else "?"


def _as_dict(row):
    return dict(row) if row else None


def add_user(user_id: int, username: str | None) -> None:
    conn = get_connection()
    cursor = conn.cursor()
    p = _placeholder()
    if is_postgres():
        cursor.execute(f"""
            INSERT INTO users (user_id, username, english_level, last_activity)
            VALUES ({p}, {p}, NULL, {p})
            ON CONFLICT (user_id) DO UPDATE SET username = COALESCE(EXCLUDED.username, users.username)
        """, (user_id, username, str(date.today())))
    else:
        cursor.execute(f"""
            INSERT INTO users (user_id, username, english_level, last_activity)
            VALUES ({p}, {p}, NULL, {p})
            ON CONFLICT(user_id) DO UPDATE SET username = COALESCE(excluded.username, users.username)
        """, (user_id, username, str(date.today())))
    conn.commit()
    cursor.close()
    conn.close()


def get_user(user_id: int) -> dict | None:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM users WHERE user_id = {_placeholder()}", (user_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return _as_dict(row)


def update_level(user_id: int, level: str) -> None:
    conn = get_connection()
    cursor = conn.cursor()
    p = _placeholder()
    cursor.execute(f"UPDATE users SET english_level = {p} WHERE user_id = {p}", (level, user_id))
    conn.commit()
    cursor.close()
    conn.close()


def update_mode(user_id: int, mode: str) -> None:
    conn = get_connection()
    cursor = conn.cursor()
    p = _placeholder()
    cursor.execute(f"UPDATE users SET current_mode = {p} WHERE user_id = {p}", (mode, user_id))
    conn.commit()
    cursor.close()
    conn.close()


def update_format(user_id: int, fmt: str) -> None:
    conn = get_connection()
    cursor = conn.cursor()
    p = _placeholder()
    cursor.execute(f"UPDATE users SET response_format = {p} WHERE user_id = {p}", (fmt, user_id))
    conn.commit()
    cursor.close()
    conn.close()


def add_xp(user_id: int, amount: int = 10) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    p = _placeholder()
    cursor.execute(f"UPDATE users SET xp = xp + {p} WHERE user_id = {p}", (amount, user_id))
    cursor.execute(f"SELECT xp FROM users WHERE user_id = {p}", (user_id,))
    row = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    return row["xp"] if row else 0


def update_streak(user_id: int) -> int:
    today = date.today()
    conn = get_connection()
    cursor = conn.cursor()
    p = _placeholder()
    cursor.execute(f"SELECT streak, last_activity FROM users WHERE user_id = {p}", (user_id,))
    row = cursor.fetchone()

    if not row:
        cursor.close()
        conn.close()
        return 0

    last = date.fromisoformat(row["last_activity"]) if row["last_activity"] else None
    streak = row["streak"]

    if last == today:
        streak = max(streak, 1)
    elif last and (today - last).days == 1:
        streak += 1
    else:
        streak = 1

    cursor.execute(
        f"UPDATE users SET streak = {p}, last_activity = {p} WHERE user_id = {p}",
        (streak, str(today), user_id),
    )
    conn.commit()
    cursor.close()
    conn.close()
    return streak
