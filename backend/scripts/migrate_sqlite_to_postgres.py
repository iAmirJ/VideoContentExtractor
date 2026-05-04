#!/usr/bin/env python3
"""
Simple migration script to copy relational data from local SQLite to Postgres.

Usage:
  python migrate_sqlite_to_postgres.py --sqlite-file ../sql_app.db --pg-url postgresql://user:pass@localhost:5432/dbname
If --pg-url is not provided it will use the environment variable `SQLALCHEMY_DATABASE_URL`.
"""
import os
import sys
import argparse
from pathlib import Path
from sqlalchemy import create_engine, text

# Ensure the backend package root is on sys.path so `import app` works
# This allows running: `python scripts\migrate_sqlite_to_postgres.py` from the backend folder.
HERE = Path(__file__).resolve()
PROJECT_ROOT = HERE.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


def main():
    parser = argparse.ArgumentParser(description="Migrate SQLite DB to Postgres")
    parser.add_argument("--sqlite-file", help="Path to sqlite file (default: backend/sql_app.db)", default=None)
    parser.add_argument("--pg-url", help="Postgres SQLAlchemy URL (overrides env var)", default=None)
    args = parser.parse_args()

    base_dir = Path(__file__).resolve().parent.parent

    if args.sqlite_file:
        sqlite_path = Path(args.sqlite_file).expanduser()
    else:
        sqlite_path = base_dir.joinpath("sql_app.db")

    if not sqlite_path.exists():
        print(f"SQLite file not found: {sqlite_path}")
        sys.exit(1)

    pg_url = args.pg_url or os.getenv("SQLALCHEMY_DATABASE_URL")
    if not pg_url:
        print("Error: No Postgres URL provided. Set --pg-url or SQLALCHEMY_DATABASE_URL env var.")
        sys.exit(1)

    sqlite_url = f"sqlite:///{sqlite_path}"
    print(f"SQLite URL: {sqlite_url}")
    print(f"Postgres URL: {pg_url}")

    # Create engines
    sqlite_engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    pg_engine = create_engine(pg_url)

    # Import models and ensure tables exist in Postgres
    from app import models

    print("Creating tables on Postgres if missing...")
    models.Base.metadata.create_all(bind=pg_engine)

    tables = [
        ("users", ["user_id", "username", "email", "password_hash", "plan_id", "created_at"]),
        ("video_projects", ["project_id", "user_id", "source_url", "title", "thumbnail_url", "status", "created_at"]),
        ("processing_requests", ["request_id", "project_id", "job_status", "progress_percent"]),
        ("summaries", ["summary_id", "project_id", "concise_summary", "blog_post_content"]),
    ]

    with sqlite_engine.connect() as s_conn, pg_engine.begin() as pg_conn:
        for table, cols in tables:
            print(f"\nCopying {table}...")
            select_sql = text(f"SELECT {', '.join(cols)} FROM {table}")
            try:
                res = s_conn.execute(select_sql)
            except Exception as e:
                print(f" - Skipping {table}: {e}")
                continue

            rows = res.fetchall()
            if not rows:
                print(f" - No rows in {table}")
                continue

            insert_cols = ", ".join(cols)
            insert_params = ", ".join([f":{c}" for c in cols])
            pk = cols[0]
            insert_sql = text(
                f"INSERT INTO {table} ({insert_cols}) VALUES ({insert_params}) ON CONFLICT ({pk}) DO NOTHING"
            )

            inserted = 0
            for row in rows:
                data = dict(row._mapping)
                try:
                    # SQLAlchemy Connection.execute expects parameters as a single mapping
                    pg_conn.execute(insert_sql, data)
                    inserted += 1
                except Exception as e:
                    print(f"   - Failed to insert {table} row {data.get(pk)}: {e}")

            print(f" - Inserted {inserted}/{len(rows)} rows into {table}")

        # Reset Postgres sequences (if any)
        seqs = [("users", "user_id"), ("video_projects", "project_id"), ("processing_requests", "request_id"), ("summaries", "summary_id")]
        for t, pk in seqs:
            try:
                pg_conn.execute(text(f"SELECT setval(pg_get_serial_sequence('{t}','{pk}'), COALESCE(MAX({pk}), 1)) FROM {t}"))
            except Exception as e:
                print(f" - Could not set sequence for {t}: {e}")

    print("\nMigration finished.")


if __name__ == '__main__':
    main()
