
import cv2

image = cv2.imread("images/mouse.jpg")

if image is None:
    print("画像を読み込めませんでした。")
    exit()

print("画像の読み込みに成功しました。")
print("画像サイズ:", image.shape)
print("画素の最小値:", image.min())
print("画素の最大値:", image.max())


# 元画像をコピー
result = image.copy()

# =========================
# 2. 画像の前処理
# =========================

# グレースケールに変換
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# ノイズを軽減
blur = cv2.GaussianBlur(gray, (5, 5), 0)

# 輪郭を検出
edges = cv2.Canny(blur, 50, 150)

# 途切れたエッジをつなぐ
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))

closed = cv2.morphologyEx(
    edges,
    cv2.MORPH_CLOSE,
    kernel,
    iterations=2
)

# =========================
# 3. 輪郭の取得
# =========================

contours, hierarchy = cv2.findContours(
    closed,
    cv2.RETR_EXTERNAL,
    cv2.CHAIN_APPROX_SIMPLE
)

print("検出した輪郭の数:", len(contours))

for i, contour in enumerate(contours):
    print(
        f"輪郭{i}: 面積={cv2.contourArea(contour)}"
    )

# 一定以上の大きさの輪郭を抽出
large_contours = [
    contour for contour in contours
    if cv2.contourArea(contour) > 100
]

# 検出された輪郭をすべて描画する
contour_image = image.copy()

cv2.drawContours(
    contour_image,
    contours,
    -1,
    (0, 255, 0),
    2
)

cv2.imshow("All Contours", contour_image)

print("一定以上の大きさの輪郭の数:", len(large_contours))

if len(large_contours) == 0:
    print("対象物を検出できませんでした。")

else:
    # 最も大きい輪郭を取得
    target = max(large_contours, key=cv2.contourArea)

    # 対象物を囲む四角形を取得
    x, y, w, h = cv2.boundingRect(target)

    # 四角形を描画
    cv2.rectangle(
        result,
        (x, y),
        (x + w, y + h),
        (0, 255, 0),
        3
    )

    # 中心座標を計算
    center_x = x + w // 2
    center_y = y + h // 2

    # 中心点を描画
    cv2.circle(
        result,
        (center_x, center_y),
        5,
        (0, 0, 255),
        -1
    )

    print("対象物を検出しました。")
    print(f"左上の座標: ({x}, {y})")
    print(f"中心座標: ({center_x}, {center_y})")
    print(f"幅: {w}px")
    print(f"高さ: {h}px")

# =========================
# 4. 結果の表示
# =========================

# 表示用に画像を50%に縮小
display_image = cv2.resize(
    result,
    None,
    fx=0.45,
    fy=0.45
)

display_edges = cv2.resize(
    edges,
    None,
    fx=0.45,
    fy=0.45 
)

cv2.imshow("Original Image", cv2.resize(
    image, None, fx=0.45, fy=0.45
))

cv2.imshow("Edge Detection", display_edges)
cv2.imshow("Detection Result", display_image)

cv2.waitKey(0)
cv2.destroyAllWindows()
