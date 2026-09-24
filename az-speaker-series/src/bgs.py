"""Slide backgrounds: deep indigo with soft glows, one tint per theme."""
import numpy as np
from PIL import Image

W, H = 2000, 1125
BASE = "0B1238"


def rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


def bg(name, glows):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    img = np.ones((H, W, 3), np.float32) * rgb(BASE)
    for cx, cy, r, col, k in glows:
        d = np.hypot((xx / W - cx) * (W / H), yy / H - cy) / r
        t = (np.clip(1 - d, 0, 1) ** 2.2 * k)[..., None]
        img = img * (1 - t) + rgb(col) * t
    # a touch of grain so large flat areas don't band
    img += np.random.default_rng(1).normal(0, 1.4, img.shape)
    Image.fromarray(img.clip(0, 255).astype(np.uint8)).save(f"img/{name}.jpg", quality=88, subsampling=0)


bg("bg-cover", [(0.92, 0.1, 0.9, "3B2E8F", 0.85), (0.05, 1.05, 0.8, "123E7A", 0.7)])
bg("bg-plain", [(0.95, 0.0, 0.8, "25307A", 0.6), (0.0, 1.0, 0.6, "182A66", 0.45)])
bg("bg-plain2", [(0.0, 0.0, 0.8, "25307A", 0.55), (1.0, 1.0, 0.7, "2A2470", 0.5)])
themes = {"sys": "1F6E8C", "metal": "8A4A22", "ai": "4B3A9E", "mkt": "1D6B55", "health": "8A2F58", "fun": "7A6420"}
for k, c in themes.items():
    bg(f"bg-{k}", [(0.98, 0.02, 0.85, c, 0.55), (0.0, 1.0, 0.6, "182A66", 0.45)])
print("ok")
