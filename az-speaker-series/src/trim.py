# Crop transparent padding off rendered visuals (keeping room for the drop shadow) and record sizes
import glob, json
from PIL import Image
sizes = {}
for f in glob.glob("img/mock-*.png") + glob.glob("img/art-*.png"):
    im = Image.open(f)
    a = im.split()[-1].point(lambda v: 255 if v > 8 else 0)
    x0, y0, x1, y1 = a.getbbox()
    pad = 24
    im = im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))
    im.save(f)
    sizes[f.split("/")[-1]] = im.size
json.dump(sizes, open("img/sizes.json", "w"), indent=1)
print(sizes)
