#!/usr/bin/env python3
"""
Inspect Pinecone index stats and optionally query by `video_id` metadata.

Usage:
  cd backend
  venv\Scripts\activate
  python scripts\inspect_pinecone.py                # show index list + stats
  python scripts\inspect_pinecone.py --video-id <ID> # try a metadata-filtered query
"""
import argparse
import json
import sys
from pathlib import Path

# Ensure project root is on sys.path so `app` package is importable
HERE = Path(__file__).resolve()
PROJECT_ROOT = HERE.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.core.config import settings
from pinecone import Pinecone


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--video-id", help="Video ID to filter (optional)")
    parser.add_argument("--topk", type=int, default=5, help="Top K for sample query")
    args = parser.parse_args()

    pc = Pinecone(api_key=settings.PINECONE_API_KEY)

    print("Indexes:", pc.list_indexes())

    idx_name = settings.PINECONE_INDEX_NAME
    print("Inspecting index:", idx_name)
    idx = pc.Index(idx_name)

    stats = idx.describe_index_stats()
    # Ensure the stats object is JSON serializable for printing
    try:
        serial = stats.to_dict() if hasattr(stats, "to_dict") else stats
        print(json.dumps(serial, indent=2, default=str))
    except Exception:
        # Fallback: print a readable representation
        try:
            print(json.dumps(stats, indent=2, default=str))
        except Exception:
            print(repr(stats))

    # Try to surface a simple total vector count if available
    try:
        total = None
        if isinstance(serial, dict):
            total = serial.get("total_vector_count") or serial.get("vectors_count")
            # some client versions return namespaces dict
            if not total and serial.get("namespaces"):
                total = sum(ns.get("vector_count", 0) for ns in serial.get("namespaces", {}).values())
        if total is not None:
            print(f"Total vectors in index: {total}")
    except Exception:
        pass

    if args.video_id:
        # Try to determine dimension (may not be present in stats)
        dim = None
        if isinstance(stats, dict):
            dim = stats.get("dimension")

        # Fallback: ask Pinecone for index description (may work depending on client)
        try:
            desc = pc.describe_index(idx_name)
            if isinstance(desc, dict) and desc.get("dimension"):
                dim = desc.get("dimension")
        except Exception:
            pass

        if not dim:
            print("Could not determine index dimension programmatically. Use Pinecone UI to find dimension and run a filtered query there.")
            return

        zero_vector = [0.0] * int(dim)
        print(f"Running a sample filtered query for video_id={args.video_id} (top_k={args.topk})")
        res = idx.query(vector=zero_vector, top_k=args.topk, include_metadata=True, filter={"video_id": args.video_id})
        try:
            print(json.dumps(res, indent=2, default=str))
        except Exception:
            print(repr(res))


if __name__ == "__main__":
    main()
