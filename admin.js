
/* =========================
   実験ログの読み込み
========================= */

const LOG_STORAGE_KEY = "ar-assembly-experiment-logs";

// 現在選択している実験ログの番号
let selectedLogIndex = null;

// 現在編集中の作業ミスの番号
let editingErrorIndex = null;

// 保存済みの実験ログを取得
function loadExperimentLogs() {
  const savedLogs = localStorage.getItem(LOG_STORAGE_KEY);

  if (!savedLogs) {
    return [];
  }

  try {
    const logs = JSON.parse(savedLogs);
    return Array.isArray(logs) ? logs : [];
  } catch (error) {
    console.error("実験ログの読み込みに失敗しました:", error);
    return [];
  }
}

// 実験ログを保存
function saveExperimentLogs(logs) {
  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
}

// 実験ログを参加者IDごとにグループ化して一覧表示
function displayExperimentLogs() {
  const logList = document.getElementById("log-list");
  const logs = loadExperimentLogs();

  if (logs.length === 0) {
    logList.textContent = "保存済みの実験ログはありません。";
    return;
  }

  logList.innerHTML = "";

  // 参加者IDごとに実験ログをまとめる
  const groupedLogs = new Map();

  logs.forEach((log, index) => {
    const participantId = log.participantId || "参加者ID不明";

    if (!groupedLogs.has(participantId)) {
      groupedLogs.set(participantId, []);
    }

    groupedLogs.get(participantId).push({ log, index });
  });

  // 参加者ごとのグループを作成
  groupedLogs.forEach((experiments, participantId) => {
    const participantSection = document.createElement("div");
    participantSection.className = "participant-group";

    const participantTitle = document.createElement("h3");
    participantTitle.textContent =
      `${participantId}（${experiments.length}件）`;

    participantSection.appendChild(participantTitle);

    // 参加者に紐づく各実験ログを表示
    experiments.forEach(({ log, index }) => {
      const logItem = document.createElement("button");

      logItem.textContent =
        `条件${log.condition} / セッションID：${log.sessionId}`;

      logItem.addEventListener("click", () => {
        displayExperimentDetail(index);
      });

      participantSection.appendChild(logItem);
    });

    logList.appendChild(participantSection);
  });
}


// 実験ログの詳細を表示
function displayExperimentDetail(index) {
  const logDetail = document.getElementById("log-detail");
  const logs = loadExperimentLogs();
  const log = logs[index];

  if (!log) {
    logDetail.textContent = "実験ログが見つかりません。";
    return;
  }

  selectedLogIndex = index;
  document.getElementById("error-entry-section").hidden = false;

  document.getElementById("log-detail-section").hidden = false;

  logDetail.innerHTML = "";

   // 参加者・実験情報
  const info = document.createElement("div");
  info.className = "experiment-info";

  // 日時を日本時間に変換
  function formatDateTime(dateString) {
    if (!dateString) return "未終了";

    return new Date(dateString).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  const infoItems = [
    ["参加者ID", log.participantId],
    ["セッションID", log.sessionId],
    ["実験固有ID", log.experimentId || "未設定（旧データ）"],
    ["年齢", `${log.age}歳`],
    ["AR経験", log.arExperience],
    ["組立経験", log.assemblyExperience],
    ["実験条件", `条件${log.condition}`],
    ["開始日時", formatDateTime(log.startedAt)],
    ["終了日時", formatDateTime(log.endedAt)],
    ["作業時間", formatDuration(log.durationMs)]
  ];

  infoItems.forEach(([label, value]) => {
    const row = document.createElement("p");

    const labelElement = document.createElement("strong");
    labelElement.textContent = `${label}：`;

    const valueElement = document.createElement("span");
    valueElement.textContent = value;

    row.appendChild(labelElement);
    row.appendChild(valueElement);

    info.appendChild(row);
  });

  logDetail.appendChild(info);
    // 操作履歴
  const eventTitle = document.createElement("h3");
  eventTitle.textContent = "操作履歴";
  logDetail.appendChild(eventTitle);

    if (log.events && log.events.length > 0) {
    const eventList = document.createElement("ul");

    const eventNames = {
      next_step: "次の手順へ",
      previous_step: "前の手順へ",
      pause_timer: "一時停止",
      resume_timer: "再開"
    };

    // 最新5件を初期表示
    const visibleCount = 5;
    const reversedEvents = log.events.map((event, index) => ({
      ...event,
      originalIndex: index
    })).reverse();

    function createEventItem(event) {
      const item = document.createElement("li");

      const eventDate = new Date(event.timestamp);
      const formattedTime = eventDate.toLocaleString("ja-JP", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

      const eventName = eventNames[event.type] || event.type;

      let eventDetails = `手順${event.step}`;

      if (
        (event.type === "next_step" || event.type === "previous_step") &&
        event.details
      ) {
        eventDetails =
          `手順${event.details.fromStep} → 手順${event.details.toStep}`;
      }

      item.textContent =
        `${formattedTime} / ${eventName} / ${eventDetails}`;

      return item;
    }

    // 最初の5件を表示
    reversedEvents.slice(0, visibleCount).forEach((event) => {
      eventList.appendChild(createEventItem(event));
    });

    logDetail.appendChild(eventList);

    // 6件以上ある場合に展開ボタンを表示
    if (reversedEvents.length > visibleCount) {
      const toggleButton = document.createElement("button");
      toggleButton.textContent =
        `ほか${reversedEvents.length - visibleCount}件を表示`;

      toggleButton.addEventListener("click", () => {
        const isExpanded = toggleButton.dataset.expanded === "true";

        if (isExpanded) {
          eventList.innerHTML = "";

          reversedEvents.slice(0, visibleCount).forEach((event) => {
            eventList.appendChild(createEventItem(event));
          });

          toggleButton.textContent =
            `ほか${reversedEvents.length - visibleCount}件を表示`;
          toggleButton.dataset.expanded = "false";
        } else {
          eventList.innerHTML = "";

          reversedEvents.forEach((event) => {
            eventList.appendChild(createEventItem(event));
          });

          toggleButton.textContent = "閉じる";
          toggleButton.dataset.expanded = "true";
        }
      });

      logDetail.appendChild(toggleButton);
    }
  } else {
    const message = document.createElement("p");
    message.textContent = "操作履歴はありません。";
    logDetail.appendChild(message);
  }
      // 作業ミス
  const errorTitle = document.createElement("h3");
  errorTitle.textContent = "作業ミス";
  logDetail.appendChild(errorTitle);

  if (log.errors && log.errors.length > 0) {
    log.errors.forEach((error, errorIndex) => {
      const errorCard = document.createElement("div");
      errorCard.className = "error-card";

      const typeNames = {
        wrong_position: "指定位置と異なる場所への取り付け",
        wrong_orientation: "指定方向と異なる向きでの取り付け",
        wrong_part: "指定部品と異なる部品の使用",
        missing_part: "必要な部品の取り付け忘れ",
        order_deviation: "工程順序の逸脱"
      };

      const content = document.createElement("p");
      content.textContent = [
        `ミス番号：${errorIndex + 1}`,
        `ミスの種類：${typeNames[error.type] || error.type}`,
        `発生手順：手順${error.step}`,
        `動画内の時刻：${error.videoTime || "未入力"}`,
        `詳細：${error.description || "なし"}`,
        `自己修正：${error.corrected ? "あり" : "なし"}`
      ].join("\n");

      errorCard.appendChild(content);

      // 編集ボタン
      const editButton = document.createElement("button");
      editButton.textContent = "編集";
      editButton.addEventListener("click", () => {
        startEditError(errorIndex);
      });

      // 削除ボタン
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "削除";
      deleteButton.addEventListener("click", () => {
        deleteError(errorIndex);
      });

      errorCard.appendChild(editButton);
      errorCard.appendChild(deleteButton);

      logDetail.appendChild(errorCard);
    });
  } else {
    const message = document.createElement("p");
    message.textContent = "作業ミスの記録はありません。";
    logDetail.appendChild(message);
  }
}


// 作業ミスの編集を開始
function startEditError(errorIndex) {
  const logs = loadExperimentLogs();
  const log = logs[selectedLogIndex];

  if (!log || !log.errors || !log.errors[errorIndex]) {
    alert("編集する作業ミスが見つかりません。");
    return;
  }

  const error = log.errors[errorIndex];

  // 編集対象の番号を保存
  editingErrorIndex = errorIndex;

  // 既存の情報をフォームに反映
  document.getElementById("error-type").value = error.type;
  document.getElementById("error-step").value = error.step;
  document.getElementById("error-video-time").value = error.videoTime || "";
  document.getElementById("error-description").value = error.description || "";
  document.getElementById("error-corrected").checked = error.corrected;

  // 登録ボタンの表示を変更
  document.getElementById("save-error-button").textContent = "変更を保存";

  // 入力フォームまで移動
  document.getElementById("error-entry-section").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

// 作業時間を表示用の形式に変換
function formatDuration(milliseconds) {
  const totalSeconds = Math.floor((milliseconds || 0) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0")
  ].join(":");
}

// 作業ミスを削除
function deleteError(errorIndex) {
  if (!confirm("この作業ミスを削除しますか？")) {
    return;
  }

  const logs = loadExperimentLogs();
  const log = logs[selectedLogIndex];

  if (!log || !Array.isArray(log.errors)) {
    alert("作業ミスが見つかりません。");
    return;
  }

  log.errors.splice(errorIndex, 1);

  saveExperimentLogs(logs);

  // 詳細画面を更新
  displayExperimentDetail(selectedLogIndex);
}

// 詳細画面を閉じる
const closeDetailButton = document.getElementById("close-detail-button");
const logDetailSection = document.getElementById("log-detail-section");

closeDetailButton.addEventListener("click", () => {
  logDetailSection.hidden = true;
});

// 作業ミスを登録・編集
document.getElementById("save-error-button").addEventListener("click", () => {
  if (selectedLogIndex === null) {
    alert("実験ログを選択してください。");
    return;
  }

  const logs = loadExperimentLogs();
  const log = logs[selectedLogIndex];

  if (!log) {
    alert("実験ログが見つかりません。");
    return;
  }

  const error = {
    step: Number(document.getElementById("error-step").value),
    videoTime: document.getElementById("error-video-time").value,
    type: document.getElementById("error-type").value,
    description: document.getElementById("error-description").value,
    corrected: document.getElementById("error-corrected").checked
  };

  if (!error.step || error.step < 1) {
    alert("発生した手順番号を入力してください。");
    return;
  }

  if (!Array.isArray(log.errors)) {
    log.errors = [];
  }

  if (editingErrorIndex !== null) {
    // 既存の作業ミスを編集
    log.errors[editingErrorIndex] = {
      ...log.errors[editingErrorIndex],
      ...error,
      updatedAt: new Date().toISOString()
    };

    alert("作業ミスを更新しました。");
  } else {
    // 新しい作業ミスを登録
    log.errors.push({
      timestamp: new Date().toISOString(),
      ...error
    });

    alert("作業ミスを登録しました。");
  }

  saveExperimentLogs(logs);

  // 編集状態を解除
  editingErrorIndex = null;

  // 入力欄を初期状態に戻す
  document.getElementById("error-step").value = "";
  document.getElementById("error-video-time").value = "";
  document.getElementById("error-description").value = "";
  document.getElementById("error-corrected").checked = false;
  document.getElementById("error-type").selectedIndex = 0;
  document.getElementById("save-error-button").textContent = "作業ミスを登録";

  // 詳細画面を更新
  displayExperimentDetail(selectedLogIndex);
});

// 画面表示時に実行
displayExperimentLogs();

/* =========================
   CSV出力機能
========================= */

// CSVの1セル分を整形
function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

// CSVファイルをダウンロード
function downloadCsv(filename, headers, rows) {
  const csvContent = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map(row => row.map(escapeCsvValue).join(","))
  ].join("\r\n");

  // Excelで日本語が文字化けしにくいようBOMを付ける
  const blob = new Blob(
    ["\uFEFF" + csvContent],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// ファイル名に使用する日時
function getCsvDateString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

// 実験ログCSV
document.getElementById("export-logs-button").addEventListener("click", () => {
  const logs = loadExperimentLogs();

  if (logs.length === 0) {
    alert("出力できる実験ログがありません。");
    return;
  }

  const headers = [
    "参加者ID",
    "セッションID",
    "実験固有ID",
    "年齢",
    "AR経験",
    "組立経験",
    "実験条件",
    "開始日時",
    "終了日時",
    "作業時間(ms)"
  ];

  const rows = logs.map(log => [
    log.participantId,
    log.sessionId,
    log.experimentId || "",
    log.age,
    log.arExperience,
    log.assemblyExperience,
    log.condition,
    log.startedAt,
    log.endedAt,
    log.durationMs
  ]);

  downloadCsv(
    `実験ログ_${getCsvDateString()}.csv`,
    headers,
    rows
  );
});

// 操作履歴CSV
document.getElementById("export-events-button").addEventListener("click", () => {
  const logs = loadExperimentLogs();

  if (logs.length === 0) {
    alert("出力できる実験ログがありません。");
    return;
  }

  const headers = [
    "参加者ID",
    "セッションID",
    "実験固有ID",
    "実験条件",
    "操作日時",
    "操作内容",
    "手順番号",
    "移動前の手順",
    "移動後の手順"
  ];

  const rows = [];

  logs.forEach(log => {
    (log.events || []).forEach(event => {
      rows.push([
        log.participantId,
        log.sessionId,
        log.experimentId || "",
        log.condition,
        event.timestamp,
        event.type,
        event.step,
        event.fromStep ?? "",
        event.toStep ?? ""
      ]);
    });
  });

  downloadCsv(
    `操作履歴_${getCsvDateString()}.csv`,
    headers,
    rows
  );
});

// 作業ミスCSV
document.getElementById("export-errors-button").addEventListener("click", () => {
  const logs = loadExperimentLogs();

  if (logs.length === 0) {
    alert("出力できる実験ログがありません。");
    return;
  }

  const headers = [
    "参加者ID",
    "セッションID",
    "実験固有ID",
    "実験条件",
    "ミス番号",
    "発生日時",
    "発生手順",
    "動画内の時刻",
    "ミスの種類",
    "詳細",
    "自己修正"
  ];

  const typeNames = {
    wrong_position: "指定位置と異なる場所への取り付け",
    wrong_orientation: "指定方向と異なる向きでの取り付け",
    wrong_part: "指定部品と異なる部品の使用",
    missing_part: "必要な部品の取り付け忘れ",
    order_deviation: "工程順序の逸脱"
  };

  const rows = [];

  logs.forEach(log => {
    (log.errors || []).forEach((error, index) => {
      rows.push([
        log.participantId,
        log.sessionId,
        log.experimentId || "",
        log.condition,
        index + 1,
        error.timestamp,
        error.step,
        error.videoTime || "",
        typeNames[error.type] || error.type,
        error.description || "",
        error.corrected ? "あり" : "なし"
      ]);
    });
  });

  downloadCsv(
    `作業ミス_${getCsvDateString()}.csv`,
    headers,
    rows
  );
});