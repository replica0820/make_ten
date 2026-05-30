import '../src/style.css'

// ==========================================
// 1. 定数・DOM要素の取得
// ==========================================
const API_URL = "http://localhost:8000/hard";

type FormulaItem = {
  char: string;
  index: number | null;
};

// ==========================================
// 2. 状態変数（State）の定義
// ==========================================
let used: boolean[] = [];
let formula: FormulaItem[] = [];
let openBracketCount: number = 0;

// ==========================================
// 3. ロジック・画面更新用の関数群
// ==========================================

const toast = document.getElementById("toast");

function showToast(message: string, isSuccess: boolean) {
  if (!toast) return;

  toast.textContent = message;

  if (isSuccess) {
    /* trueの時の処理 */
    toast.style.backgroundColor = "#4caf50";
  } else {
    /* falseの時の処理 */
    toast.style.backgroundColor = "#f44336";
  }

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function updateDisplay() {
  const display = document.getElementById("formula-display");
  if (display) {
    const formulaString = formula.map((item) => item.char).join("");
    display.textContent = formulaString;
  }
}

function resetState() {
  formula.splice(0);
  used.fill(false);
  for (let i = 0; i < used.length; i++) {
    const btn = document.getElementById(`num-btn-${i}`) as HTMLButtonElement;
    if (btn) {
      btn.disabled = false;
    }
  }
  openBracketCount = 0;
  updateDisplay();
}
// ==========================================
// 4. API取得と「動的」な要素の生成・イベント登録
// ==========================================
async function fetchDailyNumbers() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
		used = new Array(data.numbers.length).fill(false);
    
    const container = document.getElementById("numbers-container");
    if (!container) return;
    container.innerHTML = "";

    data.numbers.forEach((num: number, index: number) => {
      const btn = document.createElement("button");
      btn.textContent = num.toString();
      btn.className = "btn num-btn";
      btn.id = `num-btn-${index}`;
      
      btn.addEventListener("click", () => {
        const lastNum = formula.at(-1);
        if (lastNum && lastNum.index !== null) {
          return;
        }

        formula.push({ char: num.toString(), index: index });
        used[index] = true;
        btn.disabled = true;
        updateDisplay();
      });

      container.appendChild(btn);
    });

  } catch (error) {
    console.error("APIエラー:", error);
  }
}

// ==========================================
// 5. 「静的」な要素のイベント登録
// ==========================================
const opButtons = document.querySelectorAll(".op-btn");
const deleteBtn = document.getElementById("btn-delete");
const resetBtn = document.getElementById("btn-reset");
const ruleBtn = document.getElementById("btn-rule");
const ruleDialog = document.getElementById("rule-dialog") as HTMLDialogElement;
const closeRuleBtn = document.getElementById("btn-close-rule");

opButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const clickedChar = btn.textContent;
    const lastItem = formula.at(-1);

    if (!clickedChar) return;

    if (clickedChar === "(") {
      if (lastItem) {
        if (lastItem.index !== null || lastItem.char === ')' || openBracketCount >= 3) {
          return;
        }
      }
      openBracketCount += 1;
      formula.push({ char: clickedChar, index: null});
    } 
    else if (clickedChar === ")") {
      if (!lastItem || openBracketCount <= 0 || ["+", "-", "*", "/", "("].includes(lastItem.char)) {
        return;
      }
      openBracketCount -= 1;
      formula.push({ char: clickedChar, index: null });
    } 
    else {
      if (lastItem && ["+", "-", "*", "/"].includes(lastItem.char)) {
        formula.pop();
      }
      formula.push({ char: clickedChar, index: null });
    }

    updateDisplay();
  });
});

if (deleteBtn) {
  deleteBtn.addEventListener("click", () => {
    const removeItem = formula.pop();
    if (!removeItem) return;

    const index = removeItem.index;

    if (index !== null && index !== undefined) {
      used[index] = false;
      const btn = document.getElementById(`num-btn-${index}`) as HTMLButtonElement;
      if (btn) {
        btn.disabled = false;
      }
    } else {
      if (removeItem.char === '(') {
        openBracketCount -= 1;
      }
      else if (removeItem.char === ')') {
        openBracketCount += 1;
      }
    }

    updateDisplay();
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    // 【穴埋め1-A】作った関数を呼ぶだけ！
    resetState();
  });
}

if(ruleBtn && ruleDialog) {
  ruleBtn.addEventListener("click", () => {
    ruleDialog.showModal();
  })
}

if (closeRuleBtn && ruleDialog){
  closeRuleBtn.addEventListener("click", () => {
    ruleDialog.close();
  })
}

// ==========================================
// ★最終実装：提出する（Submit）ボタン
// ==========================================
const submitBtn = document.getElementById("btn-submit");

if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    if (used.includes(false)) {
      showToast("数字をすべて使ってください！",false);
      return;
    }

    if (openBracketCount !== 0) {
      showToast("カッコが閉じられていません！",false);
      return;
    }

    const lastItem = formula.at(-1);
    const operators = ["+", "-", "*", "/"];
    if (lastItem && operators.includes(lastItem.char)) {
      showToast("数式が途中で終わっています！",false);
      return;
    }

    const formulaString = formula.map((item) => item.char).join("");

    try {
      const result = eval(formulaString);

      // ▼ここを書き換えます！
      if (Math.abs(result - 10) < 0.00001) {
        showToast(`おめでとうございます！計算結果: ${result}`, true);
        
        setTimeout(() => {
          resetState();
          fetchDailyNumbers();
        }, 1500);

      } else {
        showToast(`残念！計算結果は ${result} でした。やり直してください！`, false);
      }
      
    } catch (error) {
      showToast("数式を正しく計算できませんでした！",false);
    }
  });
}

// ==========================================
// 6. 初期化処理の実行
// ==========================================
fetchDailyNumbers();