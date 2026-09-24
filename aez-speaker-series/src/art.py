"""Backgrounds and the network-line texture used on the title and divider slides."""
import numpy as np
from PIL import Image, ImageDraw

W, H = 2400, 1350


def hexrgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def solid(name, colour, glow=None):
    img = np.ones((H, W, 3), np.float32) * np.array(hexrgb(colour), np.float32)
    if glow:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        cx, cy, r, c, k = glow
        d = np.hypot((xx / W - cx) * (W / H), yy / H - cy) / r
        t = (np.clip(1 - d, 0, 1) ** 2 * k)[..., None]
        img = img * (1 - t) + np.array(hexrgb(c), np.float32) * t
    Image.fromarray(img.clip(0, 255).astype(np.uint8)).save(f"img/{name}.jpg", quality=90, subsampling=0)


def plexus(name, colour, band, seed, alpha=110, w=W, h=H, clear=None):
    """Points on a jittered grid inside a band, joined to near neighbours.

    band = (y0, y1) as fractions of the height. Density fades toward the band's inner edge,
    so the texture sits along one edge of the slide instead of floating randomly.
    """
    rng = np.random.default_rng(seed)
    y0, y1 = band
    pts = []
    step = 120
    for gy in np.arange(y0 * h, y1 * h, step * 0.8):
        for gx in np.arange(-step, w + step, step):
            # keep more points near the outer edge of the band
            edge = (gy - y0 * h) / ((y1 - y0) * h)
            keep = edge if y0 > 0.4 else 1 - edge
            if rng.random() < 0.45 + 0.55 * keep:
                pts.append((gx + rng.uniform(-60, 60), gy + rng.uniform(-45, 45)))
    pts = np.array(pts)
    if clear:  # keep a circle free of lines and dots (the logo sits there)
        cx, cy, r = clear
        pts = pts[np.hypot(pts[:, 0] - cx, pts[:, 1] - cy) > r]
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c = hexrgb(colour)
    for i, p in enumerate(pts):
        dist = np.hypot(*(pts - p).T)
        for j in np.argsort(dist)[1:5]:
            if dist[j] < 330 and j != i:
                d.line([tuple(p), tuple(pts[j])], fill=c + (alpha,), width=2)
    for p in pts:
        r = rng.choice([5, 6, 7, 9, 12], p=[0.35, 0.25, 0.2, 0.12, 0.08])
        d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=c + (min(255, alpha + 70),))
    img.save(f"img/{name}.png")


solid("bg-dark", "0F1740", glow=(0.95, 0.0, 0.9, "1D2A6E", 0.5))
solid("bg-gold", "FDB515")
plexus("plexus-bottom-light", "8C9BD6", (0.52, 1.02), 3, alpha=90)
plexus("plexus-top-dark", "FFFFFF", (-0.02, 0.5), 5, alpha=85)
plexus("plexus-top-light", "8C9BD6", (-0.02, 0.32), 9, alpha=80, clear=(2268, 118, 190))
print("art ok")
