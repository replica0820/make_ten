from fastapi import FastAPI
import random

app = FastAPI()

@app.get("/")
def read_root():
    return {"message":"Hello,World!"}

@app.get("/daily")
def get_daily_numbers():
    numbers = [random.randint(1,9) for _ in range(4)]
    return {"numbers": numbers}