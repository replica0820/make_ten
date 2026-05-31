import './style.css' // CSSのパスも構成に合わせて調整してください

// ボタン要素の取得
const btnGoPractice = document.getElementById("btn-go-practice");
const btnGoDaily = document.getElementById("btn-go-daily");
const settingsBtn = document.getElementById("btn-setting-home");
const settingsDialog = document.getElementById("setting-dialog") as HTMLDialogElement;
const closeSettingsBtn = document.getElementById("btn-close-settings");
const rankingBtn = document.getElementById("btn-show-ranking");
const rankingDialog = document.getElementById("ranking-dialog") as HTMLDialogElement;
const closeRankingBtn = document.getElementById("btn-close-ranking");

// エンドレスモードへの画面遷移
if (btnGoPractice) {
  btnGoPractice.addEventListener("click", () => {
    // practiceフォルダへ移動！
    window.location.href = "./practice/";
  });
}

// デイリーモードへの画面遷移（これから作る予定のページ）
if (btnGoDaily) {
  btnGoDaily.addEventListener("click", () => {
    window.location.href = "./daily/";
  });
}

// ホーム画面の設定ボタン（今後の拡張用）
if (settingsBtn && settingsDialog) {
  settingsBtn.addEventListener("click", () => settingsDialog.showModal());
}
if (closeSettingsBtn && settingsDialog) {
  closeSettingsBtn.addEventListener("click", () => settingsDialog.close());
}

if (rankingBtn && rankingDialog) {
  rankingBtn.addEventListener("click", async () => {
    await fetchAndDisplayRanking();

    rankingDialog.showModal();
  });
}

if (closeRankingBtn && rankingDialog) {
  closeRankingBtn.addEventListener("click", () => rankingDialog.close());
}



const ruleBtn = document.getElementById("btn-rule");
const ruleDialog = document.getElementById("rule-dialog") as HTMLDialogElement;
const closeRuleBtn = document.getElementById("btn-close-rule");

if (ruleBtn && ruleDialog) {
  ruleBtn.addEventListener("click", () => ruleDialog.showModal());
}
if (closeRuleBtn && ruleDialog) {
  closeRuleBtn.addEventListener("click", () => ruleDialog.close());
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

async function fetchAndDisplayRanking() {
  try {
    const response = await fetch("http://localhost:8000/ranking");
    const data = await response.json();
    
    const rankingList = document.getElementById("home-ranking-list");
    if (!rankingList) return;
    
    rankingList.innerHTML = ""; // 一旦リストを空にする

    data.ranking.forEach((item: any, index: number) => {
      const rank = index + 1;
      const timeStr = item.time.toFixed(2);

      rankingList.innerHTML += `<li>${rank}位: ${item.name} - ${timeStr}秒</li>`
    });

  } catch (error) {
    console.error("ランキング取得エラー:", error);
  }
}