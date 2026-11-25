#!/usr/bin/env python3
"""Build film/assets/audio-analysis.json — one entry per 60 fps frame:
   {"wave": [160 samples], "bands": [4 band levels], "rms": float}

usage:
  python3 tools/make_audio_analysis.py                 # synthetic placeholder (no audio needed)
  python3 tools/make_audio_analysis.py my-track.wav    # analyse your own soundtrack (needs numpy + ffmpeg)
"""
import json, math, random, subprocess, sys
from pathlib import Path

FPS, N, SECONDS = 60, 160, 53.9
OUT = Path(__file__).resolve().parent.parent / "film" / "assets" / "audio-analysis.json"

def synthetic():
    rnd = random.Random(7)
    bpm = 198.73 / 2
    frames = []
    for f in range(int(round(SECONDS * FPS)) + 1):
        t = f / FPS
        beat = (t * bpm / 60) % 1.0
        env = 0.05 + 0.18 * math.exp(-beat * 6)
        wave = [round(env * (math.sin(2 * math.pi * (i / N) * (3 + (f % 7)) + t * 9) * 0.6 + rnd.uniform(-0.4, 0.4)), 5) for i in range(N)]
        bands = [round(min(1, env * k), 4) for k in (4.2, 3.1, 2.2, 1.4)]
        frames.append({"wave": wave, "bands": bands, "rms": round(env * 0.6, 5)})
    return frames

def analyse(path):
    import numpy as np
    sr = 48000
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.float32)
    hop = sr // FPS
    frames = []
    for f in range(len(x) // hop + 1):
        seg = x[f * hop:f * hop + hop]
        if len(seg) < hop:
            seg = np.pad(seg, (0, hop - len(seg)))
        wave = seg[:: max(1, hop // N)][:N]
        spec = np.abs(np.fft.rfft(seg * np.hanning(len(seg))))
        edges = [0, 6, 25, 100, len(spec)]
        bands = [float(spec[a:b].mean()) for a, b in zip(edges, edges[1:])]
        peak = max(bands) or 1.0
        frames.append({"wave": [round(float(v), 5) for v in wave],
                       "bands": [round(b / peak, 4) for b in bands],
                       "rms": round(float(np.sqrt(np.mean(seg ** 2))), 5)})
    return frames

if __name__ == "__main__":
    data = analyse(sys.argv[1]) if len(sys.argv) > 1 else synthetic()
    OUT.write_text(json.dumps(data, separators=(",", ":")))
    print(f"wrote {OUT} ({len(data)} frames)")
