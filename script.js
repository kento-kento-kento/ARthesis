
const settingsButton = document.getElementById("settings-button");
const settingsPanel = document.getElementById("settings-panel");
const levelSelect = document.getElementById("level-select");
const arInstruction = document.getElementById("ar-instruction");

const prevStepButton = document.getElementById("prev-step-button");
const nextStepButton = document.getElementById("next-step-button");
const stepCounter = document.getElementById("step-counter");

/* 設定パネルの開閉 */
function setSettingsOpen(isOpen) {
  settingsPanel.classList.toggle("is-open", isOpen);
  settingsPanel.setAttribute("aria-hidden", String(!isOpen));
  settingsButton.setAttribute("aria-expanded", String(isOpen));
  settingsButton.setAttribute(
    "aria-label",
    isOpen ? "設定を閉じる" : "設定を開く"
  );
}

settingsButton.addEventListener("click", () => {
  const isOpen = settingsPanel.classList.contains("is-open");
  setSettingsOpen(!isOpen);
});

/* 現在の手順番号。最初の手順は 0 */
let currentStepIndex = 0;

/* 手順番号とボタンの状態を更新 */
function updateStepControls() {
  stepCounter.textContent =
    `手順 ${currentStepIndex + 1} / ${assemblySteps.length}`;

  prevStepButton.disabled = currentStepIndex === 0;

  nextStepButton.disabled =
    currentStepIndex === assemblySteps.length - 1;
}

/* 現在の手順と提示情報量に応じてAR表示を更新 */
function updateInstruction() {
  const selectedLevel = levelSelect.value;

  arInstruction.setAttribute(
    "value",
    getInstructionText(currentStepIndex, selectedLevel)
  );

  updateStepControls();

  console.log("現在の手順番号:", currentStepIndex + 1);
  console.log("提示情報量:", selectedLevel);
}

/* 次の手順へ */
nextStepButton.addEventListener("click", () => {
  if (currentStepIndex < assemblySteps.length - 1) {
    currentStepIndex++;
    updateInstruction();
  }
});

/* 前の手順へ */
prevStepButton.addEventListener("click", () => {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    updateInstruction();
  }
});

/* 提示情報量の変更 */
levelSelect.addEventListener("change", updateInstruction);

/* 初期表示 */
updateInstruction();