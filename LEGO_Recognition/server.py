
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import cv2
import numpy as np

app = FastAPI()

# GitHub Pagesからの通信を許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://kento-kento-kento.github.io"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# サーバーの動作確認
@app.get("/")
def read_root():
    return {"message": "Python Server is running!"}


# 画像受信・輪郭検出API
@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):

    # 画像データを受信
    contents = await file.read()

    # OpenCVで画像を読み込む
    image_array = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if image is None:
        return {"message": "画像を読み込めませんでした"}

    height, width, channels = image.shape

    print("画像を受信しました")
    print("画像サイズ:", width, "x", height)

    # グレースケール化
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # ノイズを軽減
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # エッジ検出
    edges = cv2.Canny(blurred, 50, 150)

    # 輪郭の途切れを補完
    kernel = cv2.getStructuringElement(
        cv2.MORPH_RECT, (5, 5)
    )

    closed = cv2.morphologyEx(
        edges,
        cv2.MORPH_CLOSE,
        kernel,
        iterations=2
    )

    # 輪郭を検出
    contours, hierarchy = cv2.findContours(
        closed,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    # 面積が小さすぎる輪郭を除外
    detections = []

    for contour in contours:

        area = cv2.contourArea(contour)

        if area < 500:
            continue

        x, y, w, h = cv2.boundingRect(contour)

        # 矩形の中心座標
        center_x = x + w / 2
        center_y = y + h / 2

        detections.append({
            "x": x,
            "y": y,
            "width": w,
            "height": h,
            "center_x": center_x,
            "center_y": center_y,
            "area": area
        })

    # 面積の大きい順に並べる
    detections.sort(
        key=lambda item: item["area"],
        reverse=True
    )

    # 上位10件に限定
    detections = detections[:10]
    
        # 検出した矩形を画像に描画
    for detection in detections:

        x = detection["x"]
        y = detection["y"]
        w = detection["width"]
        h = detection["height"]

        center_x = int(detection["center_x"])
        center_y = int(detection["center_y"])

        # 緑色の矩形
        cv2.rectangle(
            image,
            (x, y),
            (x + w, y + h),
            (0, 255, 0),
            2
        )

        # 赤色の中心点
        cv2.circle(
            image,
            (center_x, center_y),
            5,
            (0, 0, 255),
            -1
        )

    # 検出結果を画像として保存
    cv2.imwrite("detected.jpg", image)

    print("検出候補数:", len(detections))

    for index, detection in enumerate(detections):
        print(f"候補{index + 1}:", detection)

    # 検出結果をJSONで返す
    return {
        "message": "画像解析が完了しました",
        "image_width": width,
        "image_height": height,
        "detection_count": len(detections),
        "detections": detections
    }

# 検出結果の画像を表示
@app.get("/debug-image")
def get_debug_image():
    return FileResponse(
        "detected.jpg",
        media_type="image/jpeg"
    )