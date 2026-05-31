from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
from datetime import datetime
import json

with open('make_10_problem.json', 'r', encoding="utf-8") as f:
    json_data = json.load(f)

with open('make_10_problem_hard.json', 'r', encoding="utf-8") as f:
    hard_data = json.load(f)

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