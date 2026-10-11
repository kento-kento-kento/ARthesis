// このファイルは，何の部品がどの手順で
// どの向きでどの位置に取り付けるかを，一元管理する。
// カメラが部品を認識したら，それに対応した手順を表示する。


/*
 * LEGO組み立て手順データ
 * ※以下は動作確認用の仮データです。
 * 実際のLEGOの組み立て手順ではありません。
 */

const assemblySteps = [
  {
    step: 1,

    // 部品を識別するためのID
    partId: "part-A",

    // 部品の基本情報
    partName: "赤いブロック",
    position: "マーカーの中央",

    // 標準・詳しい表示で使う情報
    orientation: "平らな面を上にする",
    procedure: "赤いブロックを取り付ける",

    // 詳しい表示だけで使う情報
    caution: "位置と向きを確認してから取り付ける"
  },

  {
    step: 2,
    partId: "part-B",

    partName: "黒いブロック",
    position: "赤いブロックの右側",

    orientation: "突起を上にする",
    procedure: "黒いブロックを右側に取り付ける",

    caution: "隣の部品との隙間を確認する"
  }
];





/*
 * 手順データと提示情報量から、
 * ARに表示する文章を生成する
 */
function getInstructionText(stepIndex, level) {
  const step = assemblySteps[stepIndex];

  // 指定された手順が存在しない場合
  if (!step) {
    return "表示できる手順がありません";
  }

  // 少ない：部品名と取り付け位置
  const lines = [
    `部品\n${step.partName}`,
    `取り付け位置\n${step.position}`
  ];

  // 標準：手順と向きを追加
  if (level === "medium" || level === "high") {
    lines.push(
      `作業手順\n${step.procedure}`,
      `部品の向き\n${step.orientation}`
    );
  }

  // 詳しい：注意点を追加
  if (level === "high") {
    lines.push(`注意点\n${step.caution}`);
  }

  return lines.join("\n\n");
}