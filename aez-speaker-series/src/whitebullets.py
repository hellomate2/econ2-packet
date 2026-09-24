import sys, zipfile, shutil
src = sys.argv[1]; tmp = src + ".tmp"
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename.startswith("ppt/slides/slide") and item.filename.endswith(".xml"):
            data = data.decode().replace('<a:buSzPct val="100000"/>', '<a:buClr><a:srgbClr val="FFFFFF"/></a:buClr><a:buSzPct val="100000"/>').encode()
        zout.writestr(item, data)
shutil.move(tmp, src)
