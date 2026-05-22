"""
etl/pipeline.py — Master ETL orchestrator
Usage:  cd etl && python pipeline.py
"""

import time
import sys
import io

# Force UTF-8 output so emojis print on Windows terminals
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from extract   import extract
from transform import transform
from load      import load


def run_pipeline() -> None:
    print("=" * 60)
    print("  🚀  Helpdesk Historical Data ETL Pipeline")
    print("=" * 60)
    total_start = time.time()

    # ── STAGE 1: EXTRACT ─────────────────────────────────────────────────────
    print("\n── STAGE 1: EXTRACT ─────────────────────────────────────────")
    t0  = time.time()
    raw = extract()
    t1  = time.time()
    print(f"   ⏱  Extract completed in {t1 - t0:.2f}s")

    if raw is None or raw.empty:
        print("   ❌ Extraction returned no data. Aborting.")
        sys.exit(1)

    # ── STAGE 2: TRANSFORM ───────────────────────────────────────────────────
    print("\n── STAGE 2: TRANSFORM ───────────────────────────────────────")
    t0    = time.time()
    clean = transform(raw)
    t1    = time.time()
    print(f"   ⏱  Transform completed in {t1 - t0:.2f}s")
    print(f"   📋  Clean rows ready for load: {len(clean)}")

    # ── STAGE 3: LOAD ────────────────────────────────────────────────────────
    print("\n── STAGE 3: LOAD ────────────────────────────────────────────")
    t0     = time.time()
    result = load(clean)
    t1     = time.time()
    print(f"   ⏱  Load completed in {t1 - t0:.2f}s")

    # ── SUMMARY ──────────────────────────────────────────────────────────────
    total_elapsed = time.time() - total_start
    print("\n" + "=" * 60)
    print("  ✅  PIPELINE COMPLETE")
    print("=" * 60)
    print(f"  Rows inserted      : {result['inserted']}")
    print(f"  Rows skipped (dup) : {result['skipped']}")
    print(f"  Total in DB table  : {result['total_in_table']}")
    print(f"  Total elapsed time : {total_elapsed:.2f}s")
    print("=" * 60)


if __name__ == "__main__":
    run_pipeline()
