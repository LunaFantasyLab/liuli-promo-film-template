#!/usr/bin/env python3
"""Frame-accurate capture of the film: headless Chromium -> window.seek(t) -> screenshot -> ffmpeg (x264).

Every frame is a pure function of t, so the output is deterministic and can be rendered in parallel chunks.

usage:
  python3 render/render.py                       # 3840x2160 @ 60 fps -> out/raw.mp4
  python3 render/render.py --width 1920 --height 1080 --fps 30 --out out/raw-1080p.mp4
  python3 render/render.py --start 10 --end 15   # only a range (seconds)

needs: pip install playwright && python3 -m playwright install chromium ; ffmpeg on PATH
"""
import os, argparse, functools, http.server, subprocess, threading, time
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILM = ROOT / "film"

def args():
    p = argparse.ArgumentParser()
    p.add_argument("--width", type=int, default=3840)
    p.add_argument("--height", type=int, default=2160)
    p.add_argument("--fps", type=int, default=60)
    p.add_argument("--duration", type=float, default=69.5, help="film length in seconds")
    p.add_argument("--start", type=float, default=0.0)
    p.add_argument("--end", type=float, default=None)
    p.add_argument("--workers", type=int, default=3)
    p.add_argument("--chunk", type=int, default=120, help="frames per chunk")
    p.add_argument("--png", action="store_true", help="lossless PNG capture (slower, sharper)")
    p.add_argument("--crf", type=int, default=16)
    p.add_argument("--out", default=str(ROOT / "out" / "raw.mp4"))
    return p.parse_args()

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 128
    allow_reuse_address = True

def render_chunk(job):
    s, e, a, part = job
    from playwright.sync_api import sync_playwright
    part = Path(part)
    if part.exists() and part.stat().st_size > 10000:
        return str(part)
    srv = Server(("127.0.0.1", 0), functools.partial(Quiet, directory=str(FILM)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{srv.server_address[1]}/index.html?fast=1"
    tmp = part.with_suffix(".tmp.mp4")
    codec = "png" if a.png else "mjpeg"
    enc = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-vcodec", codec,
                            "-framerate", str(a.fps), "-i", "-", "-c:v", "libx264", "-preset", "medium",
                            "-crf", str(a.crf), "-pix_fmt", "yuv420p", "-r", str(a.fps), str(tmp)],
                           stdin=subprocess.PIPE)
    zoom = a.width / 3840.0
    with sync_playwright() as pw:
        br = pw.chromium.launch(headless=True, executable_path=os.environ.get("CHROME_PATH") or None, args=["--no-sandbox", "--disable-dev-shm-usage",
                                                     "--force-device-scale-factor=1"])
        pg = br.new_page(viewport={"width": a.width, "height": a.height}, device_scale_factor=1)
        pg.set_default_timeout(180000)
        pg.on("pageerror", lambda err: print("PAGE ERROR", err, flush=True))
        pg.goto(url, wait_until="load")
        pg.evaluate("(z)=>{document.documentElement.style.zoom=z}", str(zoom))
        pg.evaluate("()=>Promise.resolve(window.ready).catch(()=>true)")
        pg.evaluate("()=>document.fonts.ready")
        for f in range(s, e):
            pg.evaluate("(t)=>window.seek(t)", f / a.fps)
            shot = pg.screenshot(type="png") if a.png else pg.screenshot(type="jpeg", quality=94)
            enc.stdin.write(shot)
        br.close()
    enc.stdin.close(); enc.wait(); srv.shutdown()
    tmp.rename(part)
    return str(part)

def main():
    a = args()
    out = Path(a.out).resolve(); out.parent.mkdir(parents=True, exist_ok=True)
    parts_dir = out.parent / (out.stem + ".parts"); parts_dir.mkdir(exist_ok=True)
    first = int(round(a.start * a.fps))
    last = int(round((a.end if a.end is not None else a.duration) * a.fps))
    jobs = [(s, min(last, s + a.chunk), a, str(parts_dir / f"c_{s:06d}.mp4")) for s in range(first, last, a.chunk)]
    t0 = time.time()
    with ProcessPoolExecutor(a.workers) as ex:
        parts = []
        for i, p in enumerate(ex.map(render_chunk, jobs), 1):
            parts.append(p)
            print(f"chunk {i}/{len(jobs)} done  ({time.time() - t0:.0f}s)", flush=True)
    lst = parts_dir / "concat.txt"
    lst.write_text("".join(f"file '{Path(p).name}'\n" for p in parts))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst),
                    "-c", "copy", str(out)], check=True)
    print("wrote", out, f"{a.width}x{a.height}@{a.fps}", f"in {(time.time() - t0) / 60:.1f} min")

if __name__ == "__main__":
    main()
