"""Draw the double, overlapping, fading outlines and logo badges as transparent PNGs.

Sizes are in inches so they drop straight onto the 13.333 x 7.5 slide.
"""
import json
import numpy as np
from PIL import Image, ImageDraw

DPI = 200      # output resolution
SS = 3         # supersampling for smooth anti-aliased strokes
BG = (0x00, 0x1D, 0x3B)


def hex2rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def stroke_mask(size_px, box_in, radius_in, width_pt):
    """Anti-aliasing is done by the caller's downsample; this draws at SS scale."""
    k = DPI * SS
    img = Image.new("L", size_px, 0)
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = [v * k for v in box_in]
    w = max(1, round(width_pt / 72 * k))
    d.rounded_rectangle([x0, y0, x1, y1], radius=radius_in * k, outline=255, width=w)
    return np.asarray(img, dtype=np.float32) / 255.0


def diag(shape, c0, c1, a0, a1, angle=(1.0, 0.7)):
    """Linear gradient along a direction, colour and alpha interpolated."""
    h, w = shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    t = (xx / w) * angle[0] + (yy / h) * angle[1]
    t = (t - t.min()) / (t.max() - t.min())
    c0, c1 = np.array(hex2rgb(c0), np.float32), np.array(hex2rgb(c1), np.float32)
    rgb = c0[None, None, :] * (1 - t[..., None]) + c1[None, None, :] * t[..., None]
    alpha = a0 * (1 - t) + a1 * t
    return rgb, alpha


def gap_fade(shape, gaps, fade_in, band_in):
    """1 everywhere, falling to 0 inside each gap; gaps are (edge, x_start, x_end) in inches."""
    k = DPI * SS
    h, w = shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    m = np.ones(shape, np.float32)
    for g in gaps:
        if g[0] == "radial":  # ("radial", cx, cy, r): clear a circle and taper every line around it
            _, cx, cy, r = g
            dist = np.hypot(xx - cx * k, yy - cy * k) - r * k
            m = np.minimum(m, np.clip(dist / (fade_in * k), 0, 1))
            continue
        edge, xs, xe = g
        xs, xe, f, band = xs * k, xe * k, fade_in * k, band_in * k
        # distance outside the gap, ramped over the fade length
        dist = np.maximum(xs - xx, xx - xe)
        ramp = np.clip(dist / f, 0, 1)
        rows = (yy < band) if edge == "top" else (yy > h - band)
        m = np.where(rows, np.minimum(m, ramp), m)
    return m


def compose(size_in, layers, gaps=(), fade_in=0.35):
    k = DPI * SS
    size_px = (round(size_in[0] * k), round(size_in[1] * k))
    shape = (size_px[1], size_px[0])
    out_rgb = np.zeros(shape + (3,), np.float32)
    out_a = np.zeros(shape, np.float32)
    fade = gap_fade(shape, gaps, fade_in, 0.25)
    for L in layers:
        m = stroke_mask(size_px, L["box"], L["radius"], L["width"])
        rgb, a = diag(shape, L["c0"], L["c1"], L["a0"], L["a1"], L.get("dir", (1.0, 0.7)))
        a = m * a * fade
        # "over" compositing
        out_rgb = rgb * a[..., None] + out_rgb * (1 - a[..., None])
        out_a = a + out_a * (1 - a)
    rgba = np.dstack([out_rgb, out_a * 255]).clip(0, 255).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")
    return img.resize((round(size_in[0] * DPI), round(size_in[1] * DPI)), Image.LANCZOS)


def badge(d_in, ring_pt=2.2):
    k = DPI * SS
    n = round(d_in * k)
    shape = (n, n)
    disc = Image.new("L", (n, n), 0)
    ImageDraw.Draw(disc).ellipse([0, 0, n - 1, n - 1], fill=255)
    disc = np.asarray(disc, np.float32) / 255
    ring = Image.new("L", (n, n), 0)
    w = round(ring_pt / 72 * k)
    ImageDraw.Draw(ring).ellipse([w / 2, w / 2, n - 1 - w / 2, n - 1 - w / 2], outline=255, width=w)
    ring = np.asarray(ring, np.float32) / 255
    rgb, _ = diag(shape, "2563EB", "BFD6F6", 1, 1, (0.6, 1.0))
    bg = np.array(BG, np.float32)[None, None, :] * np.ones(shape + (3,), np.float32)
    col = bg * (1 - ring[..., None]) + rgb * ring[..., None]
    rgba = np.dstack([col, disc * 255]).clip(0, 255).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA").resize((round(d_in * DPI),) * 2, Image.LANCZOS)


if __name__ == "__main__":
    spec = json.load(open("frames.json"))
    CW, CH, OFF, PAD = spec["CW"], spec["CH"], spec["OFF"], spec["PAD"]
    # Cards: bright blue outline fading down, plus an offset pale outline fading in toward the bottom right.
    card = compose(
        (CW + OFF + 2 * PAD, CH + OFF + 2 * PAD),
        [
            dict(box=(PAD + OFF, PAD + OFF, PAD + OFF + CW, PAD + OFF + CH), radius=0.16, width=1.0,
                 c0="1C5EDD", c1="D5E0EF", a0=0.0, a1=0.9),
            dict(box=(PAD, PAD, PAD + CW, PAD + CH), radius=0.16, width=1.4,
                 c0="2E6BEA", c1="5DAAFF", a0=1.0, a1=0.35),
        ],
        gaps=[("radial", PAD + CW - 0.4, PAD + CH + 0.02, 0.36)],
        fade_in=0.45,
    )
    card.save("frame-card.png")

    KW, KH, LX0, LX1 = spec["KW"], spec["KH"], spec["LX0"], spec["LX1"]
    kt = compose(
        (KW + OFF + 2 * PAD, KH + OFF + 2 * PAD),
        [
            dict(box=(PAD + OFF, PAD + OFF, PAD + OFF + KW, PAD + OFF + KH), radius=0.16, width=1.0,
                 c0="3B6FD8", c1="DDE6F2", a0=0.25, a1=0.95),
            dict(box=(PAD, PAD, PAD + KW, PAD + KH), radius=0.16, width=1.4,
                 c0="2E6BEA", c1="5DAAFF", a0=1.0, a1=0.55),
        ],
        gaps=[("top", PAD + LX0, PAD + LX1)],
        fade_in=0.6,
    )
    kt.save("frame-kt.png")
    badge(spec["BD"]).save("badge.png")
    print("ok")
