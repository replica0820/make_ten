import '../src/style.css'

// ==========================================
// 1. 定数・DOM要素の取得
// ==========================================
const API_URL = "http://localhost:8000/daily";
const settingBtn = document.getElementById("btn-setting");
const settingDialog = document.getElementById("setting-dialog") as HTMLDialogElement;
const closeSettingBtn = document.getElementById("btn-close-setting");
const btnGoHome = document.getElementById("btn-go-home");

const alreadyClearedDialog = document.getElementById("already-cleared-dialog") as HTMLDialogElement;
const btnReturnHomeEarly = document.getElementById("btn-return-home-early");

const clearResultDialog = document.getElementById("clear-result-dialog") as HTMLDialogElement;
const clearTimeDisplay = document.getElementById("clear-time-display");
const btnReturnHomeClear = document.getElementById("btn-return-home-clear");

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

let dailyQuestions: number[][] = [];
let currentQuestionIndex: number = 0;
let startTime: number = 0;

// ==========================================
// 3. ロジック・画面更新用の関数群
// ==========================================

const toast = document.getElementById("toast");

function showToast(message: string, isSuccess: boolean) {
  if (!toast) return;

  toast.textContent = message;

  if (isSuccess) {
    toast.style.backgroundColor = "#4caf50";
  } else {
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
    if (btn) btn.disabled = false;
  }
  openBracketCount = 0;
  updateDisplay();
}

function getTodayString(): string {
  let today = new Date;
  let formattedDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  return formattedDate;
}

// ==========================================
// 4. API取得と「動的」な要素の生成・イベント登録
// ==========================================

async function initDailyMode() {
  const todayStr = getTodayString();
  const lastCleareDate = localStorage.getItem('clearedDate');

  if (lastCleareDate == todayStr) {
    if (alreadyClearedDialog) {
      alreadyClearedDialog.showModal();
    }
    return;
  }

  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    dailyQuestions = data.questions;
    currentQuestionIndex = 0;
    
    startTime = Date.now();

    // 最初の問題を画面に展開する関数を呼ぶ
    loadCurrentQuestion();

  } catch (error) {
    console.error("APIエラー:", error);
  }
}

function loadCurrentQuestion() {
  // まずは画面の数式などをリセット
  resetState();

  const currentNumbers = dailyQuestions[currentQuestionIndex];
  used = new Array(currentNumbers.length).fill(false);

  // タイトルを更新して進捗を表示
  const titleElement = document.querySelector(".header-container h1");
  if (titleElement) {
    titleElement.textContent = `今日のMake 10 パズル (${currentQuestionIndex + 1}/10)`;
  }

  const container = document.getElementById("numbers-container");
  if (!container) return;
  container.innerHTML = "";

  currentNumbers.forEach((num: number, index: number) => {
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
      showToast("数字をすべて使ってください！", false);
      return;
    }

    if (openBracketCount !== 0) {
      showToast("カッコが閉じられていません！", false);
      return;
    }

    const lastItem = formula.at(-1);
    const operators = ["+", "-", "*", "/"];
    if (lastItem && operators.includes(lastItem.char)) {
      showToast("数式が途中で終わっています！", false);
      return;
    }

    const formulaString = formula.map((item) => item.char).join("");

    try {
      const result = eval(formulaString);

      if (Math.abs(result - 10) < 0.00001) {
        currentQuestionIndex++; 

        if (currentQuestionIndex < 10) {
          showToast(`正解！次の問題へ...`, true);
          
          setTimeout(() => {
            loadCurrentQuestion();
          }, 600);

        } else {
          const elapsedSeconds = ((Date.now() -startTime) / 1000);
          const m = Math.floor(elapsedSeconds / 60);
          const s = (elapsedSeconds % 60).toFixed(2).padStart(5, '0');
          const timeText = m > 0? `${m}:${s}` : `${s}`

          if (clearTimeDisplay) clearTimeDisplay.textContent = timeText;
          if (clearResultDialog) clearResultDialog.showModal();

          if (submitBtn) (submitBtn as HTMLButtonElement).disabled = true;

          const todayStr = getTodayString();
          localStorage.setItem('clearedDate', todayStr)
        }

      } else {
        showToast(`残念！計算結果は ${result} でした。やり直してください！`, false);
      }
      
    } catch (error) {
      showToast("数式を正しく計算できませんでした！", false);
    }
  });
}

if (btnReturnHomeEarly) {
  btnReturnHomeEarly.addEventListener("click", () => window.location.href = "/");
}

if (btnReturnHomeClear) {
  btnReturnHomeClear.addEventListener("click", () => window.location.href = "/");
}
// ==========================================
// 6. 初期化処理の実行
// ==========================================
initDailyMode();