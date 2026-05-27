from fastapi import FastAPI
import random
from datetime import datetime
import json

with open('make_10_problem.json', 'r', encoding="utf-8") as f:
    json_data = json.load(f)

app = FastAPI()

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