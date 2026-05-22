"""
transform.py - ETL Transform Stage
Cleans, validates, and enriches the raw extracted data.

Steps:
  1. Standardize column types and strip whitespace
  2. Validate and fix category / priority / status enums
  3. Remove duplicate tickets (same employee + category + date)
  4. Fill missing resolved_date / resolution_time_hours
  5. Derive analytics columns: month, quarter, resolution_bucket
  6. Log all transform actions
"""
import pandas as pd
import numpy as np

VALID_PRIORITIES = {"Low", "Medium", "High", "Critical"}
VALID_STATUSES   = {"Open", "In Progress", "Resolved", "Closed"}
VALID_CATEGORIES = {
    "VPN Issue", "Password Reset", "Software Installation", "Laptop Issue",
    "Email Access", "Network Connectivity", "Hardware Request", "Printer Issue",
    "System Crash", "Account Access", "Data Backup", "Server Downtime",
}

# Normalise values that deviate slightly from the standard
PRIORITY_MAP = {
    "low":"Low", "medium":"Medium", "high":"High", "critical":"Critical",
    "urgent":"Critical", "normal":"Medium", "minor":"Low",
}
STATUS_MAP = {
    "open":"Open", "in progress":"In Progress", "in_progress":"In Progress",
    "resolved":"Resolved", "closed":"Closed", "done":"Resolved", "fixed":"Resolved",
}


def transform(df: pd.DataFrame) -> pd.DataFrame:
    print("\n" + "=" * 55)
    print("  TRANSFORM STAGE")
    print("=" * 55)
    original_count = len(df)

    # ── 1. Strip whitespace from all string columns ───────────────
    str_cols = df.select_dtypes("object").columns
    df[str_cols] = df[str_cols].apply(lambda c: c.str.strip())
    print(f"  [1] Stripped whitespace from {len(str_cols)} columns")

    # ── 2. Normalise enums ────────────────────────────────────────
    df["priority"] = df["priority"].apply(
        lambda x: PRIORITY_MAP.get(str(x).lower(), x) if pd.notna(x) else "Medium"
    )
    df["status"] = df["status"].apply(
        lambda x: STATUS_MAP.get(str(x).lower(), x) if pd.notna(x) else "Open"
    )
    bad_prio = df[~df["priority"].isin(VALID_PRIORITIES)]
    bad_stat = df[~df["status"].isin(VALID_STATUSES)]
    if not bad_prio.empty:
        print(f"  [!] {len(bad_prio)} rows with invalid priority → set to 'Medium'")
        df.loc[~df["priority"].isin(VALID_PRIORITIES), "priority"] = "Medium"
    if not bad_stat.empty:
        print(f"  [!] {len(bad_stat)} rows with invalid status   → set to 'Open'")
        df.loc[~df["status"].isin(VALID_STATUSES), "status"] = "Open"
    print(f"  [2] Enum normalisation complete")

    # ── 3. Remove duplicates ──────────────────────────────────────
    dup_mask = df.duplicated(subset=["employee_name","issue_category","created_date"], keep="first")
    dup_count = dup_mask.sum()
    df = df[~dup_mask].reset_index(drop=True)
    print(f"  [3] Removed {dup_count} duplicate rows  ({original_count} → {len(df)})")

    # ── 4. Parse dates & fill missing values ─────────────────────
    df["created_date"]  = pd.to_datetime(df["created_date"],  errors="coerce").dt.date
    df["resolved_date"] = pd.to_datetime(df["resolved_date"], errors="coerce").dt.date
    df["resolution_time_hours"] = pd.to_numeric(df["resolution_time_hours"], errors="coerce")

    # Fill missing resolution_time_hours for resolved/closed tickets
    mask_missing_hrs = (
        df["status"].isin(["Resolved","Closed"]) &
        df["resolution_time_hours"].isna()
    )
    df.loc[mask_missing_hrs, "resolution_time_hours"] = 8.0   # default 8h
    filled = mask_missing_hrs.sum()
    if filled:
        print(f"  [4] Filled {filled} missing resolution_time_hours with default 8h")
    else:
        print(f"  [4] Date parsing and resolution hours complete")

    # ── 5. Derive analytics columns ───────────────────────────────
    df["created_month"]   = pd.to_datetime(df["created_date"]).dt.to_period("M").astype(str)
    df["created_quarter"] = pd.to_datetime(df["created_date"]).dt.to_period("Q").astype(str)
    df["is_resolved"]     = df["status"].isin(["Resolved","Closed"]).astype(int)

    def bucket(h):
        if pd.isna(h):    return "Unresolved"
        if h <= 2:        return "< 2 hrs"
        if h <= 8:        return "2–8 hrs"
        if h <= 24:       return "8–24 hrs"
        if h <= 72:       return "1–3 days"
        return "> 3 days"

    df["resolution_bucket"] = df["resolution_time_hours"].apply(bucket)
    print(f"  [5] Derived: created_month, created_quarter, is_resolved, resolution_bucket")

    # ── 6. Drop rows with null critical fields ─────────────────────
    before = len(df)
    df = df.dropna(subset=["employee_name","department","issue_category","created_date"])
    dropped = before - len(df)
    if dropped:
        print(f"  [6] Dropped {dropped} rows with null critical fields")
    else:
        print(f"  [6] No null critical fields found")

    print(f"\n  ✓ Transform complete: {len(df)} clean rows ready for loading")
    print(f"\n  Resolution buckets:\n{df['resolution_bucket'].value_counts().to_string()}")

    return df


if __name__ == "__main__":
    from extract import extract
    df = extract()
    clean = transform(df)
    print(clean[["employee_name","issue_category","priority","status","resolution_time_hours"]].head(5).to_string())
