"""
etl/load.py — Stage 3: Load cleaned DataFrame into MySQL historical_tickets table
"""

import pandas as pd
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Date, Boolean, Text,
    inspect, text
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.exc import SQLAlchemyError

from config import DATABASE_URL

Base = declarative_base()


# ── ORM model (mirrors the DB table) ─────────────────────────────────────────

class HistoricalTicket(Base):
    __tablename__ = "historical_tickets"

    id                    = Column(Integer, primary_key=True, autoincrement=True)
    employee_name         = Column(String(100), nullable=False)
    department            = Column(String(100), nullable=False)
    issue_category        = Column(String(100), nullable=False)
    description           = Column(Text, nullable=False)
    priority              = Column(String(20), nullable=False)
    status                = Column(String(20), nullable=False)
    created_date          = Column(Date, nullable=False)
    resolved_date         = Column(Date, nullable=True)
    resolution_time_hours = Column(Float, nullable=True)
    created_month         = Column(String(7), nullable=False)   # YYYY-MM
    created_quarter       = Column(String(6), nullable=False)   # YYYY-QN
    is_resolved           = Column(Boolean, nullable=False)
    resolution_bucket     = Column(String(20), nullable=True)


# ── helpers ───────────────────────────────────────────────────────────────────

def _table_exists(engine, table_name: str) -> bool:
    insp = inspect(engine)
    return insp.has_table(table_name)


def _get_existing_keys(engine) -> set:
    """Return a set of (employee_name, issue_category, created_date) already in the table."""
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT employee_name, issue_category, created_date FROM historical_tickets")
        ).fetchall()
    return {(r[0], r[1], str(r[2])) for r in rows}


# ── main load function ────────────────────────────────────────────────────────

def load(df: pd.DataFrame) -> dict:
    """
    Load the cleaned DataFrame into MySQL historical_tickets.
    Returns a summary dict: {inserted, skipped, total_in_table}
    """
    engine = create_engine(DATABASE_URL, echo=False)

    # Create table if it doesn't exist
    Base.metadata.create_all(bind=engine)

    table_existed = _table_exists(engine, "historical_tickets")
    print(f"\n📦 Table 'historical_tickets': {'already exists' if table_existed else 'created fresh'}")

    # Deduplicate against rows already in the DB
    existing_keys = _get_existing_keys(engine)
    print(f"   Existing rows in DB: {len(existing_keys)}")

    def _row_key(row):
        return (row["employee_name"], row["issue_category"], str(row["created_date"]))

    mask_new = df.apply(_row_key, axis=1).apply(lambda k: k not in existing_keys)
    df_new   = df[mask_new].copy()
    skipped  = len(df) - len(df_new)

    print(f"   New rows to insert : {len(df_new)}")
    print(f"   Skipped (duplicates): {skipped}")

    if df_new.empty:
        print("   ⚠️  Nothing to insert — all rows already present.")
        total = _count_rows(engine)
        return {"inserted": 0, "skipped": skipped, "total_in_table": total}

    # Convert date columns to Python date objects (MySQL DATE type)
    for col in ("created_date", "resolved_date"):
        if col in df_new.columns:
            df_new[col] = pd.to_datetime(df_new[col], errors="coerce").dt.date

    # Insert
    try:
        df_new.to_sql(
            name        = "historical_tickets",
            con         = engine,
            if_exists   = "append",
            index       = False,
            method      = "multi",
            chunksize   = 100,
        )
    except SQLAlchemyError as exc:
        print(f"   ❌ Insert failed: {exc}")
        raise

    total = _count_rows(engine)
    print(f"   ✅ Inserted {len(df_new)} rows. Total in table: {total}")
    return {"inserted": len(df_new), "skipped": skipped, "total_in_table": total}


def _count_rows(engine) -> int:
    with engine.connect() as conn:
        return conn.execute(text("SELECT COUNT(*) FROM historical_tickets")).scalar()


# ── standalone test ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    from extract   import extract
    from transform import transform

    raw = extract()
    clean = transform(raw)
    result = load(clean)
    print("\n📊 Load summary:", result)
