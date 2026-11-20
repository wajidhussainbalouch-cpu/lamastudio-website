#!/usr/bin/env python3
"""Package exactly the public Academy PWA cache assets into Android assets.
The APK MUST NOT contain backend SQL, Supabase secrets, or test-only source.
"""
import ast
import os
import pathlib
import re
import shutil

here=pathlib.Path(__file__).resolve().parent
academy=here.parent
output=here/"app"/"src"/"main"/"assets"/"coding-academy"
source=(academy/"sw.js").read_text("utf-8")
match=re.search(r"const ASSETS = (\[[^\n]+\]);",source)
if not match:
    raise SystemExit("Could not locate immutable PWA asset manifest")
files=ast.literal_eval(match.group(1))
assert files and "./" in files
output.mkdir(parents=True,exist_ok=True)
allowed={".html",".js",".mjs",".py",".svg",".webmanifest",".css",".json"}
for item in files:
    if item == "./":
        continue
    if not item.startswith("./") or ".." in pathlib.PurePosixPath(item).parts:
        raise SystemExit("Unsafe asset path: "+item)
    relative=pathlib.Path(item[2:])
    if relative.suffix not in allowed:
        raise SystemExit("Unexpected asset extension: "+item)
    asset=(academy/relative).resolve()
    if academy.resolve() not in asset.parents or not asset.is_file():
        raise SystemExit("Missing/unsafe asset: "+item)
    destination=output/relative
    destination.parent.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(asset,destination)
print("Bundled",len(files)-1,"public academy assets; no backend files.")
