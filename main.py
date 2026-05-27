from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
from datetime import datetime
import json

with open('make_10_problem.json', 'r', encoding="utf-8") as f:
    json_data = json.load(f)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開発中はどこからのアクセスでも許可する設定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message":"Hello,World!"}

@app.get("/daily")
def get_daily_numbers():
    dt = datetime.now().date()
    seed_num = int(dt.strftime("%Y%m%d"))
    daily_random = random.Random(seed_num)
    today_item = daily_random.choice(json_data)
    numbers = today_item['numbers']
    return {"numbers": numbers}