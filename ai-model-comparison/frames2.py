"""Background glow and corner-bracket frames as transparent PNGs (sizes in inches)."""
import json
import numpy as np
from PIL import Image, ImageDraw

DPI = 200
SS = 3


def hex2rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


def background(w_in, h_in, base, glow1, glow2):
    """Deep indigo base with two soft radial glows (top right, bottom left)."""
    w, h = round(w_in * 150), round(h_in * 150)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    img = np.ones((h, w, 3), np.float32) * hex2rgb(base)
    for (cx, cy, r, col, strength) in [(0.88, 0.05, 0.75, glow1, 0.75), (0.05, 1.0, 0.6, glow2, 0.45)]:
        d = np.hypot((xx / w - cx) * (w / h), yy / h - cy) / r
        t = (np.clip(1 - d, 0, 1) ** 2 * strength)[..., None]
        img = img * (1 - t) + hex2rgb(col) * t
    Image.fromarray(img.clip(0, 255).astype(np.uint8), "RGB").save("bg.png")


def brackets(w_in, h_in, radius, width_pt, reach, c0, c1, out):
    """Rounded outline kept only near the top-left and bottom-right corners, fading along each edge."""
    k = DPI * SS
    pad = 0.04
    W, H = round((w_in + 2 * pad) * k), round((h_in + 2 * pad) * k)
    mask = Image.new("L", (W, H), 0)
    wpx = max(1, round(width_pt / 72 * k))
    ImageDraw.Draw(mask).rounded_rectangle([pad * k, pad * k, (pad + w_in) * k, (pad + h_in) * k],
                                           radius=radius * k, outline=255, width=wpx)
    m = np.asarray(mask, np.float32) / 255
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    # distance travelled along the outline from each corner, approximated by the Manhattan distance
    d_tl = (xx - pad * k) + (yy - pad * k)
    d_br = ((pad + w_in) * k - xx) + ((pad + h_in) * k - yy)
    L = reach * k
    a = np.maximum(np.clip(1 - d_tl / L, 0, 1), np.clip(1 - d_br / L, 0, 1)) ** 1.3
    t = ((xx / W) * 0.8 + (yy / H) * 0.2)[..., None]
    rgb = hex2rgb(c0) * (1 - t) + hex2rgb(c1) * t
    rgba = np.dstack([rgb, m * a * 255]).clip(0, 255).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").resize((round((w_in + 2 * pad) * DPI), round((h_in + 2 * pad) * DPI)),
                                          Image.LANCZOS).save(out)


if __name__ == "__main__":
    g = json.load(open("frames2.json"))
    background(13.333, 7.5, "0C1440", "26307A", "1A2E6E")
    brackets(g["CW"], g["CH"], 0.18, 1.5, 2.2, "7B6CFF", "6FD6FF", "br-card.png")
    brackets(g["KW"], g["KH"], 0.18, 1.5, 3.2, "7B6CFF", "6FD6FF", "br-kt.png")
    print("ok")
