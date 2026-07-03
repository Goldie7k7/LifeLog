from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from collections import defaultdict
from datetime import datetime

app = FastAPI()

# Allow your React dev server to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    conn = sqlite3.connect("lifelog.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.get("/api/commits")
def get_commits():
    conn = get_db()
    rows = conn.execute("SELECT repo, date FROM commits").fetchall()
    conn.close()

    # Group commits by day of week (Mon-Sun), same shape your React fake data used
    day_counts = defaultdict(int)
    for row in rows:
        dt = datetime.fromisoformat(row["date"].replace("Z", "+00:00"))
        day_name = dt.strftime("%a")  # 'Mon', 'Tue', etc.
        day_counts[day_name] += 1

    days_order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    result = [{"day": d, "commits": day_counts.get(d, 0)} for d in days_order]
    return result

@app.get("/api/commits/raw")
def get_raw_commits():
    conn = get_db()
    rows = conn.execute("SELECT repo, message, date FROM commits ORDER BY date DESC LIMIT 50").fetchall()
    conn.close()
    return [dict(row) for row in rows]