from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import random
from datetime import datetime
import json
import sqlite3
from pydantic import BaseModel


with open('make_10_problem.json', 'r', encoding="utf-8") as f:
    json_data = json.load(f)

with open('make_10_problem_hard.json', 'r', encoding="utf-8") as f:
    hard_data = json.load(f)

with open('ng_words.json', 'r', encoding="utf-8") as f:
    ng_word = json.load(f)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開発中はどこからのアクセスでも許可する設定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def init_db():
    conn = sqlite3.connect("ranking.db")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS rankings(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            time REAL,
            play_date TEXT
        )
    """)

    conn.commit()
    conn.close()

init_db()

class RankingSubmit(BaseModel):
    name: str
    time: float

@app.get("/")
def read_root():
    return {"message":"Hello,World!"}

@app.get("/daily")
def get_daily_numbers():
    dt = datetime.now().date()
    seed_num = int(dt.strftime("%Y%m%d"))

    random.seed(seed_num)

    normal_items = random.sample(json_data, 8)
    hard_items = random.sample(hard_data, 2)

    daily_items = normal_items + hard_items

    questions = [item['numbers'] for item in daily_items]

    random.seed()

    return {"questions": questions}

@app.get("/random")
def get_random_numbers():
    random_item = random.choice(json_data)
    numbers = random_item['numbers']
    return {"numbers": numbers}

@app.get("/hard")
def get_random_numbers_hard():
    hard_item = random.choice(hard_data)
    numbers = hard_item['numbers']
    return {"numbers": numbers}

@app.post("/ranking")
def submit_ranking(data: RankingSubmit):

    for word in ng_word:
        if word in data.name:
            raise HTTPException(status_code=400, detail='使用禁止ワードが含まれています')

    today_str = datetime.now().date().isoformat()
    conn = sqlite3.connect("ranking.db")
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO rankings (name, time, play_date) VALUES (?, ?, ?)
    """, (data.name, data.time, today_str))

    conn.commit()
    conn.close()

    return {"status": "success"}

@app.get("/ranking")
def get_ranking():
    today_str = datetime.now().date().isoformat()
    conn = sqlite3.connect("ranking.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("""
        SELECT name, time
        FROM rankings
        WHERE play_date = ?
        ORDER BY time ASC
        LIMIT 10;
    """, (today_str,))

    results = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return {"ranking": results}
    