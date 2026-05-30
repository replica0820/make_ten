from fractions import Fraction
import json
import itertools

can_num = []
problem_id = 0

def can_make_10(numbers):
    if len(numbers) == 1:
        return numbers[0] == 10

    n = len(numbers)
    
    for i in range(n):
        for j in range(n):
            if i == j:
                continue
            
            a = numbers[i]
            b = numbers[j]
            
            remaining = [numbers[k] for k in range(n) if k != i and k != j]
            
            if can_make_10(remaining + [a + b]):
                return True
            
            if can_make_10(remaining + [a - b]):
                return True

            if can_make_10(remaining + [a * b]):
                return True
            
            if b != 0:
                if can_make_10(remaining + [a / b]):
                    return True

    return False


# --- 動作確認用のコード ---
if __name__ == "__main__":
    for numbers in itertools.combinations_with_replacement(range(1,10),6):
        num = [Fraction(c) for c in numbers]
        if can_make_10(num):
            can_num.append({
                "id": problem_id,
                "numbers": list(numbers)
            })
            problem_id += 1
    with open("make_10_problem_hard.json", "w", encoding="utf-8") as f:
        json.dump(can_num, f, indent = 4)

    print(f"処理完了: {len(can_num)}個の組み合わせを保存完了")
    