# Strip generator fingerprints: metadata and default shape names
import re, sys, zipfile, shutil
src = sys.argv[1]; tmp = src + ".tmp"
names = {"rect": "Rectangle", "ellipse": "Oval", "line": "Straight Connector", "pie": "Partial Circle"}
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "docProps/core.xml":
            t = data.decode()
            t = re.sub(r"<dc:subject>.*?</dc:subject>", "<dc:subject></dc:subject>", t)
            t = re.sub(r"<dc:creator>.*?</dc:creator>", "<dc:creator></dc:creator>", t)
            t = re.sub(r"<cp:lastModifiedBy>.*?</cp:lastModifiedBy>", "<cp:lastModifiedBy></cp:lastModifiedBy>", t)
            data = t.encode()
        elif item.filename == "docProps/app.xml":
            data = data.decode().replace("PptxGenJS", "").encode()
        elif item.filename.startswith("ppt/slides/slide") and item.filename.endswith(".xml"):
            t = data.decode()
            def fix(m):
                block = m.group(0)
                g = re.search(r'prst="(\w+)"', block)
                kind = "TextBox" if 'txBox="1"' in block else names.get(g.group(1) if g else "", "Shape")
                return re.sub(r'(<p:cNvPr id="(\d+)" name=")[^"]*"', lambda n: f'{n.group(1)}{kind} {int(n.group(2)) - 1}"', block, count=1)
            t = re.sub(r"<p:(sp|cxnSp)>.*?</p:\1>", fix, t, flags=re.S)
            # Apply PowerPoint's built-in "Medium Style 2 - Accent 1" (the Insert > Table default)
            # Let the table style drive borders and text color, as in a table inserted by hand
            def clean_tbl(m):
                tb = m.group(0)
                tb = re.sub(r"<a:ln[LRTB] [^>]*>.*?</a:ln[LRTB]>", "", tb, flags=re.S)
                tb = tb.replace('<a:solidFill><a:srgbClr val="000000"/></a:solidFill>', "")
                return tb
            t = re.sub(r"<a:tbl>.*?</a:tbl>", clean_tbl, t, flags=re.S)
            t = t.replace("<a:tblPr/>", '<a:tblPr firstRow="1" bandRow="1"><a:tableStyleId>{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}</a:tableStyleId></a:tblPr>')
            data = t.encode()
        zout.writestr(item, data)
shutil.move(tmp, src)
