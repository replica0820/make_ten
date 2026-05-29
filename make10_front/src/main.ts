import './style.css'

// ==========================================
// 1. 定数・DOM要素の取得
// ==========================================
const API_URL = "http://localhost:8000/daily";

type FormulaItem = {
  char: string;
  index: number | null;
};
// 例: HTMLに最初から存在するディスプレイや演算子ボタンをここで取得しておく

// ==========================================
// 2. 状態変数（State）の定義
// ==========================================
let used: boolean[] = [false,false,false,false];
let formula: FormulaItem[] = [];
// ここに「機能A：現在の状態を記憶する」変数を定義します。
// （競技プログラミングのグローバル変数や、探索済みのフラグ配列と同じような感覚です）
// 例: 数式を保持する変数、ボタンの使用状況を管理する配列など

// ==========================================
// 3. ロジック・画面更新用の関数群
// ==========================================
// ここに「画面の書き換え」や「計算」など、独立した処理を関数として定義します。
// 例: 
// function updateDisplay() { ... }
// function evaluateFormula() { ... }

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
      
      // ★ポイント: APIから取得して「動的に生成したボタン」のクリックイベントは、
      // ボタンを作った直後のここに書くのが一番キレイで確実です。
      btn.addEventListener(
        "click", () => {

         }
        
        );

      container.appendChild(btn);
    });

  } catch (error) {
    console.error("APIエラー:", error);
  }
}

// ==========================================
// 5. 「静的」な要素のイベント登録
// ==========================================
// 最初からHTMLに存在しているボタン（記号、カッコ、1つ消す、やり直す、提出）の
// クリックイベント（addEventListener）は、ファイルの末尾にまとめて記述します。

// ==========================================
// 6. 初期化処理の実行
// ==========================================
fetchDailyNumbers();