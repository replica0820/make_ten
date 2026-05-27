import './style.css' // CSSを読み込む

const API_URL = "http://localhost:8000/daily";

async function fetchDailyNumbers() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    const container = document.getElementById("numbers-container");
    if (!container) return;

    // 「数字を取得中...」の文字を消す
    container.innerHTML = "";

    // 取得した4つの数字をループして、ボタン(buttonタグ)を生成する
    data.numbers.forEach((num: number, index: number) => {
      const btn = document.createElement("button");
      btn.textContent = num.toString();
      btn.className = "btn num-btn"; // CSSのデザインを適用
      btn.id = `num-btn-${index}`;   // 後で操作しやすいようにIDを振る
      
      // 画面（container）にボタンを追加
      container.appendChild(btn);
    });

  } catch (error) {
    console.error("APIエラー:", error);
  }
}

fetchDailyNumbers();