#!/usr/bin/env python3
"""
Pick 4 training rgb.mp4 clips per dataset for the OSCAR Data section grids.

Reads from pre-built cache JSONs (no NFS dir scan, which is slow on Turbo):
  - Robot: pipeline_output_fix/.cam_dirs_cache/<dataset>.json  (key: cam_dirs)
  - Human: pipeline_output_<dataset>/features/episode_ids.json (list of relative IDs)

Output: static/videos/data/manifest.json adjacent to this script.

Deterministic: random.Random("oscar-data-section-v1").sample(...).
Excludes any episode IDs used in static/videos/teaser/manifest.json.
"""

import json
import random
import re
from pathlib import Path

SEED = "oscar-data-section-v1"
HERE = Path(__file__).resolve().parent
TEASER_MANIFEST = HERE.parent / "teaser" / "manifest.json"
OUT_MANIFEST = HERE / "manifest.json"

ROBOT_ROOT = Path("/nfs/turbo/coe-jungaocv-turbo2/wzy/datasets/pipeline_output_fix")
HUMAN_ROOT = Path("/nfs/turbo/coe-jungaocv-turbo2/wzy/datasets/pipeline_output_human")
ROBOT_CACHE = ROBOT_ROOT / ".cam_dirs_cache"

DATASETS = [
    {"id": "agibot",     "label": "AgiBot",        "embodiment": "AgiBot G1 humanoid", "hours": "181 h"},
    {"id": "airoa_moma", "label": "AIROA-MoMa",    "embodiment": "Toyota HSR",         "hours": "16 h"},
    {"id": "droid",      "label": "DROID",         "embodiment": "Franka + Robotiq",   "hours": "157 h"},
    {"id": "interndata", "label": "InternData-A1", "embodiment": "Franka (synthetic)", "hours": "12 h"},
    {"id": "rh20t_cfg5", "label": "RH20T (cfg5)",  "embodiment": "Franka Panda",       "hours": "15 h"},
    {"id": "rh20t_cfg7", "label": "RH20T (cfg7)",  "embodiment": "KUKA iiwa",          "hours": "merged with cfg5"},
    {"id": "egodex",     "label": "EgoDex",        "embodiment": "MANO hand",          "hours": "256 h"},
    {"id": "vitra_epic", "label": "EPIC-Kitchens", "embodiment": "MANO hand",          "hours": "6 h"},
]

ROBOT_IDS = {"agibot", "airoa_moma", "droid", "interndata", "rh20t_cfg5", "rh20t_cfg7"}


def candidates_for(dataset_id):
    """Return a list of absolute rgb.mp4 paths for the dataset, sourced from cache JSON."""
    if dataset_id in ROBOT_IDS:
        cache = ROBOT_CACHE / f"{dataset_id}.json"
        d = json.loads(cache.read_text())
        cam_dirs = d["cam_dirs"]
        return [f"{cam_dir}/rgb.mp4" for cam_dir in cam_dirs]
    if dataset_id == "egodex":
        cache = HUMAN_ROOT / "egodex" / "features" / "episode_ids.json"
        ids = json.loads(cache.read_text())
        prefix = HUMAN_ROOT / "egodex" / "egodex"
        return [f"{prefix}/{rel}/ego/rgb.mp4" for rel in ids]
    if dataset_id == "vitra_epic":
        cache = HUMAN_ROOT / "vitra_epic" / "features" / "episode_ids.json"
        ids = json.loads(cache.read_text())
        prefix = HUMAN_ROOT / "vitra_epic"
        return [f"{prefix}/{rel}/ego/rgb.mp4" for rel in ids]
    raise ValueError(f"unknown dataset: {dataset_id}")


def load_teaser_episode_ids():
    if not TEASER_MANIFEST.is_file():
        return set()
    data = json.loads(TEASER_MANIFEST.read_text())
    ids = set()
    for tile in data.get("tiles", []):
        for key in ("clip_a", "clip_b"):
            p = tile.get(key, "")
            m = re.search(r"/([^/]+)_comparison\.mp4$", p)
            if m:
                ids.add(m.group(1))
    return ids


def sample_existing(rng, pool, k=4, max_tries=200):
    """Sample k paths that actually exist on disk. Cache JSONs may list episodes
    whose rgb.mp4 was later removed; we verify with os.path.isfile and resample
    misses (bounded by max_tries to avoid infinite loops)."""
    import os
    picks = []
    seen = set()
    tries = 0
    while len(picks) < k and tries < max_tries:
        cand = rng.choice(pool)
        if cand in seen:
            tries += 1
            continue
        seen.add(cand)
        tries += 1
        if os.path.isfile(cand):
            picks.append(cand)
    if len(picks) < k:
        raise RuntimeError(f"only {len(picks)} existing files after {tries} tries (pool size {len(pool)})")
    return picks


def main():
    teaser_ids = load_teaser_episode_ids()
    print(f"teaser-exclude IDs: {len(teaser_ids)}", flush=True)
    rng = random.Random(SEED)
    out = {"seed": SEED, "datasets": []}
    for ds in DATASETS:
        ds_id = ds["id"]
        print(f"== {ds_id} ==", flush=True)
        cands = candidates_for(ds_id)
        filtered = [c for c in cands if not any(tid in c for tid in teaser_ids)]
        print(f"  {len(cands)} candidates, {len(filtered)} after teaser-exclude", flush=True)
        if len(filtered) < 4:
            raise RuntimeError(f"dataset {ds_id}: only {len(filtered)} candidates after teaser exclusion")
        picks = sample_existing(rng, filtered, k=4)
        entry = {**ds, "clips": [{"src": p} for p in picks]}
        out["datasets"].append(entry)
        for p in picks:
            print(f"  pick: {p}", flush=True)
    OUT_MANIFEST.write_text(json.dumps(out, indent=2) + "\n")
    print(f"wrote {OUT_MANIFEST}", flush=True)


if __name__ == "__main__":
    main()
