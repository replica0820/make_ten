import './style.css'

// ==========================================
// 1. 定数・DOM要素の取得
// ==========================================
const API_URL = "http://localhost:8000/daily";

type FormulaItem = {
  char: string;
  index: number | null;
};

// ==========================================
// 2. 状態変数（State）の定義
// ==========================================
let used: boolean[] = [false, false, false, false];
let formula: FormulaItem[] = [];
let openBracketCount: number = 0; // カッコの深さを管理する変数を追加

// ==========================================
// 3. ロジック・画面更新用の関数群
// ==========================================
function updateDisplay() {
  const display = document.getElementById("formula-display");
  if (display) {
    const formulaString = formula.map((item) => item.char).join("");
    display.textContent = formulaString;
  }
}

// ==========================================
// 4. API取得と「動的」な要素の生成・イベント登録
// ==========================================
async function fetchDailyNumbers() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    const container = document.getElementById("numbers-container");
    if (!container) return;
    container.innerHTML = "";

    data.numbers.forEach((num: number, index: number) => {
      const btn = document.createElement("button");
      btn.textContent = num.toString();
      btn.className = "btn num-btn";
      btn.id = `num-btn-${index}`;
      
      btn.addEventListener("click", () => {
        // 数字の連続入力を防ぐガード処理
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

opButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const clickedChar = btn.textContent;
    const lastItem = formula.at(-1);

    if (!clickedChar) return;

    // ==========================================
    // パターン1：開きカッコ「 ( 」が押された時
    // ==========================================
    if (clickedChar === "(") {
      // 【穴埋め1-A: 入力ガード】
      // 直前のアイテム(lastItem)が存在し、かつそれが「数字(indexがnullじゃない)」
      // または「閉じカッコ(charが')')」だった場合、弾く(returnする)
      /* ここに処理を書く */
      if (lastItem){
        if (lastItem.index != null || lastItem.char == (')') || openBracketCount >= 3){
          return;
        }
      }

      // 【穴埋め1-B: 状態の更新】
      // 1. カッコの深さ(openBracketCount)を 1 増やす
      // 2. formulaに { char: clickedChar, index: null } をpushする
      /* ここに処理を書く */
      openBracketCount += 1;
      formula.push({ char: clickedChar, index: null});
    } 
    // ==========================================
    // パターン2：閉じカッコ「 ) 」が押された時
    // ==========================================
    else if (clickedChar === ")") {
      // 【穴埋め2-A: 入力ガード】
      // 以下の「どれか1つ」に当てはまる場合は弾く(returnする)
      // 条件①: openBracketCount が 0 以下である
      // 条件②: 直前のアイテムが存在しない (!lastItem)
      // 条件③: 直前のアイテムの char が "(" である
      // 条件④: 直前のアイテムが四則演算である ( ["+", "-", "*", "/"].includes(lastItem.char) )
      /* ここに処理を書く */
      if (!lastItem || openBracketCount <= 0 || ["+", "-", "*", "/", "("].includes(lastItem.char)){
        return;
      }

      // 【穴埋め2-B: 状態の更新】
      // 1. カッコの深さを 1 減らす
      // 2. formulaに push する
      /* ここに処理を書く */
      openBracketCount -= 1
      formula.push({ char: clickedChar, index: null });
    } 
    // ==========================================
    // パターン3：四則演算「 +, -, *, / 」が押された時
    // ==========================================
    else {
      // 【穴埋め3-A: 入れ替え処理】
      // 直前のアイテムが存在し、かつ、それが「四則演算」だった場合のみ、
      // formula の末尾を1つ削る (popする)
      /* ここに処理を書く */
      if (lastItem && ["+", "-", "*", "/"].includes(lastItem.char)){
        formula.pop();
      }

      // 【穴埋め3-B: 状態の更新】
      // formulaに新しい記号(clickedChar)を push する
      /* ここに処理を書く */
      formula.push({ char: clickedChar, index: null });
    }

    updateDisplay();
  });
});

if (deleteBtn) {
  deleteBtn.addEventListener("click", () => {
    const removeItem = formula.pop();
    if (!removeItem) return; // 何も消すものがない場合は終了

    const index = removeItem.index;

    if (index !== null && index !== undefined) {
      used[index] = false;
      const btn = document.getElementById(`num-btn-${index}`) as HTMLButtonElement;
      if (btn) {
        btn.disabled = false;
      }
    } else {
      // 【穴埋め4: 消したものがカッコだった場合のカウント調整】
      // もし消した文字(removeItem.char)が "(" だったら openBracketCount を 1 減らす
      // もし消した文字(removeItem.char)が ")" だったら openBracketCount を 1 増やす
      /* ここに処理を書く */
      if (removeItem.char == '('){
        openBracketCount -= 1;
      }
      else if (removeItem.char == ')'){
        openBracketCount += 1;
      }
    }

    updateDisplay();
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    formula.splice(0);
    used.fill(false);
    for (let i = 0; i < 4; i++) {
      const btn = document.getElementById(`num-btn-${i}`) as HTMLButtonElement;
      if (btn) {
        btn.disabled = false;
      }
    }
    
    // 【穴埋め5: カッコの深さリセット】
    // openBracketCount を 0 に戻す
    /* ここに処理を書く */
    openBracketCount = 0;

    updateDisplay();
  });
}


// ==========================================
// ★最終実装：提出する（Submit）ボタン
// ==========================================
const submitBtn = document.getElementById("btn-submit");

if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    // ----------------------------------------------------
    // 1. 事前チェック
    // ----------------------------------------------------
    
    // 【穴埋めA: 数字を全部使ったか？】
    // used 配列の中に 1つでも false が含まれていたら弾く
    // ヒント: 配列の includes メソッドが便利です！
    if (used.includes(false)) {
      alert("数字を4つすべて使ってください！");
      return;
    }

    // 【穴埋めB: カッコは全部閉じたか？】
    // openBracketCount が 0 ではない場合は弾く
    if (openBracketCount != 0) {
      alert("カッコが閉じられていません！");
      return;
    }

    // 【穴埋めC: 最後が演算子で終わっていないか？】
    // formula の末尾(lastItem)が四則演算だったら弾く
    const lastItem = formula.at(-1);
    const operators = ["+", "-", "*", "/"];
    if (lastItem && operators.includes(lastItem.char)) {
      alert("数式が途中で終わっています！");
      return;
    }

    // ----------------------------------------------------
    // 2. 数式の計算とクリア判定
    // ----------------------------------------------------
    
    // formulaから文字列を作る（updateDisplayと同じ！）
    const formulaString = formula.map((item) => item.char).join("");

    try {
      // evalを使って文字列を計算結果（数値）に変換する
      // （例: "1+3*3" という文字列を入れると 10 という数値が返ってくる）
      const result = eval(formulaString);

      // 【穴埋めD: 判定】
      // result が 10 と等しければクリア！それ以外は残念！
      if (Math.abs(result -10) < 0.00001) {
        alert(`おめでとうございます！計算結果: ${result}`);
        // ※必要であればここで resetBtn.click() を呼んでリセットしても良いですね
      } else {
        alert(`残念！計算結果は ${result} でした。やり直してください！`);
      }
      
    } catch (error) {
      // ユーザーが変な数式を作って eval がエラーになった場合の保険
      alert("数式を正しく計算できませんでした！");
    }
  });
}
// ==========================================
// 6. 初期化処理の実行
// ==========================================
fetchDailyNumbers();