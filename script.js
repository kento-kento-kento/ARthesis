
const settingsButton = document.getElementById("settings-button");
const settingsPanel = document.getElementById("settings-panel");

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

/* =========================
   組立手順・実験条件の表示
========================= */

// 現在の手順番号。最初の手順は0
let currentStepIndex = 0;

// 現在の実験条件
let currentCondition = "A";

// 手順番号とボタンの状態を更新
function updateStepControls() {
  stepCounter.textContent =
    `手順 ${currentStepIndex + 1} / ${assemblySteps.length}`;

  prevStepButton.disabled = currentStepIndex === 0;

  nextStepButton.disabled =
    currentStepIndex === assemblySteps.length - 1;
}

// 現在の手順と実験条件に応じてAR表示を更新
function updateInstruction() {
  arInstruction.setAttribute(
    "value",
    getInstructionText(currentStepIndex, currentCondition)
  );

  updateStepControls();

  console.log("現在の手順番号:", currentStepIndex + 1);
  console.log("実験条件:", currentCondition);
}

// 次の手順へ
nextStepButton.addEventListener("click", () => {
  if (currentStepIndex < assemblySteps.length - 1) {
    const previousStepIndex = currentStepIndex;

    currentStepIndex++;
    updateInstruction();

    recordExperimentEvent("next_step", {
      fromStep: previousStepIndex + 1,
      toStep: currentStepIndex + 1
    });
  }
});

// 前の手順へ
prevStepButton.addEventListener("click", () => {
  if (currentStepIndex > 0) {
    const previousStepIndex = currentStepIndex;

    currentStepIndex--;
    updateInstruction();

    recordExperimentEvent("previous_step", {
      fromStep: previousStepIndex + 1,
      toStep: currentStepIndex + 1
    });
  }
});

// 初期表示
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

/* =========================
   実験ログの保存
========================= */

const LOG_STORAGE_KEY = "ar-assembly-experiment-logs";

// 保存済みの実験ログを取得
function loadExperimentLogs() {
  const savedLogs = localStorage.getItem(LOG_STORAGE_KEY);

  if (!savedLogs) {
    return [];
  }

  try {
    return JSON.parse(savedLogs);
  } catch (error) {
    console.error("実験ログの読み込みに失敗しました:", error);
    return [];
  }
}

// 実験ログを保存
function saveExperimentLogs(logs) {
  localStorage.setItem(
    LOG_STORAGE_KEY,
    JSON.stringify(logs)
  );
}

// 現在の実験ログを保存済みデータに反映
function updateSavedExperimentLog() {
  if (!currentExperiment) return;

  const logs = loadExperimentLogs();

  // experimentIdで更新対象を特定
  const index = logs.findIndex(log =>
    log.experimentId === currentExperiment.experimentId
  );

  if (index !== -1) {
    logs[index] = currentExperiment;
    saveExperimentLogs(logs);
  }
}

  // 実験中の操作履歴を記録
  function recordExperimentEvent(type, details = {}) {
    if (!currentExperiment) return;

    const event = {
      type,
      timestamp: new Date().toISOString(),
      step: currentStepIndex + 1,
      ...details
    };

    currentExperiment.events.push(event);

    // 操作履歴を保存済みログに反映
    updateSavedExperimentLog();
  }



/* =========================
   実験条件A/Bの管理
========================= */

const currentConditionLabel = document.getElementById(
  "current-condition-label"
);

// 現在の条件名を表示
function updateConditionLabel() {
  const conditionName =
    currentCondition === "A"
      ? "条件A：逐次的な組立手順のみ"
      : "条件B：組立手順＋部品群の構造・配置情報";

  currentConditionLabel.textContent =
    `現在の条件：${conditionName}`;
}


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
    // 実験ごとに一意のIDを発行
    experimentId: crypto.randomUUID(),

    participantId,
    sessionId,
    age,
    arExperience,
    assemblyExperience,
    condition,

    // 実験開始日時
    startedAt: new Date().toISOString(),

    // 実験終了日時（終了時に設定）
    endedAt: null,

    // 作業時間（ミリ秒）
    durationMs: 0,

    // 操作履歴
    events: [],

    // 作業ミスの記録
    errors: []
  };

  setupError.textContent = "";


/* 実験条件をAR画面に反映 */
    currentCondition = condition;

    currentStepIndex = 0;

    updateConditionLabel();
    updateInstruction();

    /* AR画面を表示 */
    showScreen(null);

    resetExperimentTimer();
    startExperimentTimer();

  console.log("登録した実験情報:", currentExperiment);

  // 実験開始時のログを保存
  const logs = loadExperimentLogs();

  logs.push(currentExperiment);

  saveExperimentLogs(logs);


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

/* 一時停止・再開ボタン */
pauseTimerButton.addEventListener("click", () => {
  if (isTimerRunning) {
    pauseExperimentTimer();

    recordExperimentEvent("pause_timer");
  } else {
    resumeExperimentTimer();

    recordExperimentEvent("resume_timer");
  }
});

/* 実験終了 */
function endExperiment() {
  if (isExperimentEnded) return;

  if (isTimerRunning) {
    accumulatedTime += performance.now() - experimentStartTime;
  }

  // 実験終了日時と作業時間を記録
  if (currentExperiment) {
    currentExperiment.endedAt = new Date().toISOString();
    currentExperiment.durationMs = Math.floor(accumulatedTime);

    // 保存済みの実験ログを更新
    updateSavedExperimentLog();


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