import '../src/style.css'

// ==========================================
// 1. 定数・DOM要素の取得
// ==========================================
const settingBtn = document.getElementById("btn-setting");
const settingDialog = document.getElementById("setting-dialog") as HTMLDialogElement;
const closeSettingBtn = document.getElementById("btn-close-setting");
const difficultyToggle = document.getElementById("difficulty-toggle") as HTMLInputElement;
const modeLabel = document.getElementById("mode-label");
const API_URL = "https://make-ten.onrender.com/random";
const API_Hard = "https://make-ten.onrender.com/hard";

type FormulaItem = {
  char: string;
  index: number | null;
};

// ==========================================
// 2. 状態変数（State）の定義
// ==========================================
let isHardMode: boolean = false;
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
  }, 1000);
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
    let currentApiUrl = (isHardMode) ? API_Hard: API_URL;
    const response = await fetch(currentApiUrl);
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
const btnGoHome = document.getElementById("btn-go-home");

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

if (difficultyToggle) {
  difficultyToggle.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    isHardMode = target.checked;

    if (modeLabel) {
      modeLabel.textContent = isHardMode ? "Hard" : "Normal";
    }

    formula.splice(0);
    openBracketCount = 0;
    updateDisplay();
    fetchDailyNumbers();
  })
}

if (settingBtn && settingDialog) {
  settingBtn.addEventListener("click", () => {
    settingDialog.showModal();
  })
}

if (closeSettingBtn && settingDialog) {
  closeSettingBtn.addEventListener("click", () => {
    settingDialog.close();
  })
}

if (btnGoHome) {
  btnGoHome.addEventListener("click", () => {
    window.location.href = "/";
  })
}

const darkModeToggle = document.getElementById("dark-mode-toggle") as HTMLInputElement;
const darkModeLabel = document.getElementById("dark-mode-label");

const saveTheme = localStorage.getItem("theme");
if (saveTheme == "dark") {
  document.body.setAttribute("data-theme", "dark");
  if (darkModeToggle) darkModeToggle.checked = true;
  if (darkModeLabel) darkModeLabel.textContent = "ON";
}
if (darkModeToggle) {
  darkModeToggle.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement;
    if (target.checked) {
      document.body.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      if (darkModeLabel) darkModeLabel.textContent = "ON";
    } else {
      document.body.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
      if (darkModeLabel) darkModeLabel.textContent = "OFF";
    }
  })
}

// ==========================================
// ★最終実装：提出する（Submit）ボタン
// ==========================================
const submitBtn = document.getElementById("btn-submit");

if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    if (used.includes(false)) {
      showToast("数字を4つすべて使ってください！",false);
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
        }, 500);

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