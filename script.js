
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


/* =========================
   画面切り替え
========================= */

const titleScreen = document.getElementById("title-screen");
const helpScreen = document.getElementById("help-screen");
const setupScreen = document.getElementById("setup-screen");
const endScreen = document.getElementById("end-screen");


function showScreen(screenToShow) {
  [
    titleScreen,
    helpScreen,
    setupScreen,
    endScreen
  ].forEach((screen) => {
    screen.hidden = screen !== screenToShow;
  });
}

/* タイトル画面 → 操作説明 */
document.getElementById("show-help-button").addEventListener("click", () => {
  showScreen(helpScreen);
});

/* 操作説明 → タイトル画面 */
document.getElementById("help-back-button").addEventListener("click", () => {
  showScreen(titleScreen);
});

/* タイトル画面 → 参加者設定 */
document.getElementById("go-to-setup-button").addEventListener("click", () => {
  showScreen(setupScreen);
});

/* 参加者設定 → タイトル画面 */
document.getElementById("setup-back-button").addEventListener("click", () => {
  showScreen(titleScreen);
});


/* =========================
   参加者・実験条件の設定
========================= */
const participantIdInput = document.getElementById("participant-id");
const sessionIdInput = document.getElementById("session-id");
const participantAgeInput = document.getElementById("participant-age");
const arExperienceSelect = document.getElementById("ar-experience");
const assemblyExperienceSelect =
  document.getElementById("assembly-experience");
const conditionSelect = document.getElementById("experiment-condition");
const setupError = document.getElementById("setup-error");

let currentExperiment = null;


/* 実験条件に応じて情報量を設定する */
function applyExperimentCondition(condition) {
  if (condition === "fixed_low") {
    levelSelect.value = "low";
    levelSelect.disabled = true;
  } else if (condition === "fixed_medium") {
    levelSelect.value = "medium";
    levelSelect.disabled = true;
  } else if (condition === "fixed_high") {
    levelSelect.value = "high";
    levelSelect.disabled = true;
  } else if (condition === "self_adjust") {
    levelSelect.disabled = false;
  }

  updateInstruction();

  console.log("実験条件:", condition);
  console.log("設定された情報量:", levelSelect.value);
}



/* 実験条件の切り替え */
const nextConditionButton = document.getElementById(
  "next-condition-button"
);
const currentConditionLabel = document.getElementById(
  "current-condition-label"
);

const experimentConditions = [
  { value: "fixed_low", label: "情報量固定：少ない" },
  { value: "fixed_medium", label: "情報量固定：標準" },
  { value: "fixed_high", label: "情報量固定：詳しい" },
  { value: "self_adjust", label: "情報量を自己調整" }
];

let currentConditionIndex = 0;

/* 現在の条件名を表示 */
function updateConditionLabel() {
  const condition = experimentConditions[currentConditionIndex];
  currentConditionLabel.textContent =
    `現在の条件：${condition.label}`;
}

/* 次の実験条件へ進む */
nextConditionButton.addEventListener("click", () => {
  currentConditionIndex++;

  if (currentConditionIndex >= experimentConditions.length) {
    currentConditionIndex = 0;
  }

  const nextCondition = experimentConditions[currentConditionIndex];

  conditionSelect.value = nextCondition.value;

  if (currentExperiment) {
    currentExperiment.condition = nextCondition.value;
  }

  applyExperimentCondition(nextCondition.value);
  updateConditionLabel();

  console.log("実験条件を切り替えました:", nextCondition.label);
});


/* 実験開始 */
document.getElementById("start-ar-button").addEventListener("click", () => {
  const participantId = participantIdInput.value.trim();
  const sessionId = sessionIdInput.value.trim();
  const ageText = participantAgeInput.value.trim();
  const age = Number(ageText);
  const arExperience = arExperienceSelect.value;
  const assemblyExperience = assemblyExperienceSelect.value;
  const condition = conditionSelect.value;

  if (!participantId || !sessionId || !ageText) {
    setupError.textContent =
      "参加者ID、セッションID、年齢を入力してください。";
    return;
  }

  if (!Number.isInteger(age) || age < 18 || age > 100) {
    setupError.textContent =
      "年齢は18〜100歳の整数で入力してください。";
    return;
  }

  currentExperiment = {
    participantId,
    sessionId,
    age,
    arExperience,
    assemblyExperience,
    condition
  };

  setupError.textContent = "";


/* 実験条件をAR画面に反映 */
    currentConditionIndex = experimentConditions.findIndex(
    (item) => item.value === condition
    );

    if (currentConditionIndex === -1) {
    currentConditionIndex = 0;
    }

    applyExperimentCondition(condition);
    updateConditionLabel();

    /* AR画面を表示 */
    showScreen(null);

    resetExperimentTimer();
    startExperimentTimer();

  console.log("登録した実験情報:", currentExperiment);
});



/* =========================
   実験タイマー
========================= */

const experimentTimer = document.getElementById("experiment-timer");
const elapsedTimeDisplay = document.getElementById("elapsed-time");
const timerControls = document.getElementById("timer-controls");
const pauseTimerButton = document.getElementById("pause-timer-button");
const endExperimentButton = document.getElementById("end-experiment-button");

const finalElapsedTimeDisplay =
  document.getElementById("final-elapsed-time");
const returnTitleButton = document.getElementById("return-title-button");

let experimentStartTime = null;
let accumulatedTime = 0;
let timerInterval = null;
let isTimerRunning = false;
let isExperimentEnded = false;

/* ミリ秒を HH:MM:SS に変換 */
function formatElapsedTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0")
  ].join(":");
}

/* 経過時間を計算 */
function getElapsedTime() {
  if (experimentStartTime === null) {
    return accumulatedTime;
  }

  return accumulatedTime + (performance.now() - experimentStartTime);
}

/* 表示を更新 */
function updateExperimentTimer() {
  elapsedTimeDisplay.textContent =
    formatElapsedTime(getElapsedTime());
}

/* タイマー開始 */
function startExperimentTimer() {
  if (isTimerRunning || isExperimentEnded) return;

  experimentStartTime = performance.now();
  isTimerRunning = true;

  experimentTimer.hidden = false;
  timerControls.hidden = false;
  pauseTimerButton.textContent = "一時停止";

  updateExperimentTimer();

  timerInterval = setInterval(updateExperimentTimer, 250);
}

/* 一時停止 */
function pauseExperimentTimer() {
  if (!isTimerRunning || isExperimentEnded) return;

  accumulatedTime += performance.now() - experimentStartTime;
  experimentStartTime = null;
  isTimerRunning = false;

  clearInterval(timerInterval);
  timerInterval = null;

  updateExperimentTimer();
  pauseTimerButton.textContent = "再開";
}

/* 再開 */
function resumeExperimentTimer() {
  if (isTimerRunning || isExperimentEnded) return;

  startExperimentTimer();
}

/* 一時停止ボタン */
pauseTimerButton.addEventListener("click", () => {
  if (isTimerRunning) {
    pauseExperimentTimer();
  } else {
    resumeExperimentTimer();
  }
});

/* 実験終了 */
function endExperiment() {
  if (isExperimentEnded) return;

  if (isTimerRunning) {
    accumulatedTime += performance.now() - experimentStartTime;
  }

  experimentStartTime = null;
  isTimerRunning = false;
  isExperimentEnded = true;

  clearInterval(timerInterval);
  timerInterval = null;

  const finalTime = formatElapsedTime(accumulatedTime);

  elapsedTimeDisplay.textContent = finalTime;
  finalElapsedTimeDisplay.textContent = finalTime;

  experimentTimer.hidden = true;
  timerControls.hidden = true;
  settingsPanel.classList.remove("is-open");

  showScreen(endScreen);
}

/* 実験終了の確認画面 */
const confirmEndDialog = document.getElementById(
  "confirm-end-dialog"
);
const cancelEndButton = document.getElementById(
  "cancel-end-button"
);
const confirmEndButton = document.getElementById(
  "confirm-end-button"
);

/* 実験終了ボタン */
endExperimentButton.addEventListener("click", () => {
  if (isExperimentEnded) return;

  confirmEndDialog.hidden = false;
});

/* キャンセル：AR画面に戻る */
cancelEndButton.addEventListener("click", () => {
  confirmEndDialog.hidden = true;
});

/* 終了を確定 */
confirmEndButton.addEventListener("click", () => {
  confirmEndDialog.hidden = true;
  endExperiment();
});

/* 終了画面からタイトルへ */
returnTitleButton.addEventListener("click", () => {
  showScreen(titleScreen);
});

/* 新しい実験を開始できるよう状態を初期化 */
function resetExperimentTimer() {
  clearInterval(timerInterval);
  timerInterval = null;

  experimentStartTime = null;
  accumulatedTime = 0;
  isTimerRunning = false;
  isExperimentEnded = false;

  elapsedTimeDisplay.textContent = "00:00:00";
  finalElapsedTimeDisplay.textContent = "00:00:00";

  experimentTimer.hidden = true;
  timerControls.hidden = true;
}