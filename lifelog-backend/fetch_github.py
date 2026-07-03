import sqlite3
import requests
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("GITHUB_TOKEN")
USERNAME = "Goldie7k7"  # change as needed
HEADERS = {"Authorization": f"token {TOKEN}"}

def init_db():
    conn = sqlite3.connect("lifelog.db")
    conn.execute("""
        CREATE TABLE IF NOT EXISTS commits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            repo TEXT,
            sha TEXT UNIQUE,
            message TEXT,
            date TEXT
        )
    """)
    conn.commit()
    return conn

def fetch_repos():
    url = f"https://api.github.com/users/{USERNAME}/repos"
    resp = requests.get(url, headers=HEADERS)
    resp.raise_for_status()
    return [repo["name"] for repo in resp.json()]

def fetch_commits(conn, repo):
    url = f"https://api.github.com/repos/{USERNAME}/{repo}/commits"
    resp = requests.get(url, headers=HEADERS, params={"author": USERNAME, "per_page": 100})
    if resp.status_code != 200:
        print(f"Skipping {repo}: {resp.status_code}")
        return
    for commit in resp.json():
        sha = commit["sha"]
        message = commit["commit"]["message"]
        date = commit["commit"]["author"]["date"]
        try:
            conn.execute(
                "INSERT INTO commits (repo, sha, message, date) VALUES (?, ?, ?, ?)",
                (repo, sha, message, date)
            )
        except sqlite3.IntegrityError:
            pass  # already have this commit
    conn.commit()

if __name__ == "__main__":
    conn = init_db()
    repos = fetch_repos()
    print(f"Found {len(repos)} repos")
    for repo in repos:
        print(f"Fetching commits from {repo}...")
        fetch_commits(conn, repo)
    conn.close()
    print("Done. Data saved to lifelog.db")