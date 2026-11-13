
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np

app = FastAPI()

# GitHub Pagesからの通信を許可
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://kento-kento-kento.github.io"
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# サーバーの動作確認
@app.get("/")
def read_root():
    return {"message": "Python Server is running!"}


# 画像受信用のAPI
@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):

    contents = await file.read()

    image_array = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    if image is None:
        return {"message": "画像を読み込めませんでした"}

    height, width, channels = image.shape

    print("画像を受信しました")
    print("画像サイズ:", width, "x", height)

    return {
        "message": "画像を受信しました",
        "width": width,
        "height": height
    }
