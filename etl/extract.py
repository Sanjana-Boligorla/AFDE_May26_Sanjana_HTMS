"""
extract.py - ETL Extract Stage
Reads the raw CSV dataset and performs initial validation.
"""
import pandas as pd
from config import DATASET_PATH


def extract() -> pd.DataFrame:
    print("=" * 55)
    print("  EXTRACT STAGE")
    print("=" * 55)
    print(f"  Source: {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)

    print(f"  Rows loaded   : {len(df)}")
    print(f"  Columns       : {list(df.columns)}")
    print(f"  Missing values:\n{df.isnull().sum().to_string()}")

    return df


if __name__ == "__main__":
    df = extract()
    print(df.head(3).to_string())
