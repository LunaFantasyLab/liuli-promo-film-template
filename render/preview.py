#!/usr/bin/env python3
"""Capture still frames at given timestamps (seconds) for quick review.

usage: python3 render/preview.py out/stills 2.5 10 32 66 [--width 1920 --height 1080]
"""
import os, argparse, functools, http.server, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
p = argparse.ArgumentParser()
p.add_argument("out"); p.add_argument("times", nargs="+", type=float)
p.add_argument("--width", type=int, default=1920); p.add_argument("--height", type=int, default=1080)
a = p.parse_args()
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *x):
        pass

srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT / "film")))
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as pw:
    br = pw.chromium.launch(headless=True, executable_path=os.environ.get("CHROME_PATH") or None, args=["--no-sandbox", "--disable-dev-shm-usage"])
    pg = br.new_page(viewport={"width": a.width, "height": a.height}, device_scale_factor=1)
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.goto(f"http://127.0.0.1:{srv.server_address[1]}/index.html", wait_until="load")
    pg.evaluate("(z)=>{document.documentElement.style.zoom=z}", str(a.width / 3840.0))
    pg.evaluate("()=>Promise.resolve(window.ready).catch(()=>true)")
    pg.evaluate("()=>document.fonts.ready")
    for t in a.times:
        pg.evaluate("(t)=>window.seek(t)", t)
        f = out / f"frame_{t:06.2f}.png"
        f.write_bytes(pg.screenshot())
        print(f)
    if errors:
        print("page errors:", errors[:5])
    br.close()
srv.shutdown()
