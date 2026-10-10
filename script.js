
const settingsButton = document.getElementById("settings-button");
const settingsPanel = document.getElementById("settings-panel");
const levelSelect = document.getElementById("level-select");

/* 設定パネルの開閉 */
function setSettingsOpen(isOpen) {
  settingsPanel.classList.toggle("is-open", isOpen);

  settingsPanel.setAttribute(
    "aria-hidden",
    String(!isOpen)
  );

  settingsButton.setAttribute(
    "aria-expanded",
    String(isOpen)
  );

  settingsButton.setAttribute(
    "aria-label",
    isOpen ? "設定を閉じる" : "設定を開く"
  );
}

/* 歯車ボタンを押すと設定パネルを開閉 */
settingsButton.addEventListener("click", () => {
  const isOpen = settingsPanel.classList.contains("is-open");
  setSettingsOpen(!isOpen);
});

/* 選択した提示情報量を取得 */
levelSelect.addEventListener("change", () => {
  console.log("選択された提示情報量:", levelSelect.value);
});