
/*
 * LEGO組み立て手順データ
 * ※以下は動作確認用の仮データです。
 * 実際のLEGOの組み立て手順ではありません。
 *
 * 条件A：逐次的な組立手順のみ
 * 条件B：条件Aの情報＋部品群の構造・配置情報
 */

// 条件A・Bで共通する組立手順
const assemblySteps = [
  {
    step: 1,

    // 使用する部品
    parts: [
      {
        partId: "part-A",
        partName: "赤いブロック",
        quantity: 1
      }
    ],

    // 組み合わせ方
    procedure: "赤いブロックを取り付ける",

    // 取り付け位置・向き
    position: "マーカーの中央",
    orientation: "平らな面を上にする"
  },

  {
    step: 2,

    parts: [
      {
        partId: "part-B",
        partName: "黒いブロック",
        quantity: 1
      }
    ],

    procedure: "黒いブロックを赤いブロックの右側に取り付ける",
    position: "赤いブロックの右側",
    orientation: "突起を上にする"
  }
];


// 条件Bでのみ提示する部品群の追加情報
const groupInfo = {
  2: {
    // 部品群の名称
    groupName: "ブロックのまとまり",

    // 部品群の完成形
    completedForm: "赤いブロックと黒いブロックを組み合わせた形",

    // 部品同士の相対的な位置関係・接続箇所
    internalStructure: "赤いブロックの右側に黒いブロックを接続する",

    // 完成モデル内での配置位置
    modelPosition: "マーカーの中央に配置する",

    // 条件Bで表示する図のパス
    structureImage: null,
    placementImage: null
  }
};


/*
 * 手順データと実験条件から、
 * ARに表示する文章を生成する
 *
 * condition:
 *   "A" = 逐次的な組立手順のみ
 *   "B" = 組立手順＋部品群の構造・配置情報
 */
function getInstructionText(stepIndex, condition) {
  const step = assemblySteps[stepIndex];

  // 指定された手順が存在しない場合
  if (!step) {
    return "表示できる手順がありません";
  }

  // 使用する部品と数量
  const partLines = step.parts.map(part =>
    `${part.partName} × ${part.quantity}`
  );

  const lines = [
    `使用する部品\n${partLines.join("\n")}`,
    `作業手順\n${step.procedure}`,
    `取り付け位置\n${step.position}`,
    `部品の向き\n${step.orientation}`
  ];

  // 条件Bの場合のみ追加情報を表示
  if (condition === "B") {
    const group = groupInfo[step.step];

    if (group) {
      lines.push(
        `部品群\n${group.groupName}`,
        `完成形\n${group.completedForm}`,
        `部品同士の位置関係・接続箇所\n${group.internalStructure}`,
        `完成モデル内の配置位置\n${group.modelPosition}`
      );
    }
  }

  return lines.join("\n\n");
}
