"""
config.py - ETL database connection configuration
Reads from backend/.env (shared credentials)
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend folder
env_path = Path(__file__).parent.parent / "backend" / ".env"
load_dotenv(dotenv_path=env_path)

DB_HOST     = os.getenv("DB_HOST", "localhost")
DB_PORT     = os.getenv("DB_PORT", "3306")
DB_USER     = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_NAME     = os.getenv("DB_NAME", "helpdesk_db")

DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    "?charset=utf8mb4"
)

# Path to the CSV dataset
DATASET_PATH = Path(__file__).parent.parent / "datasets" / "tickets_historical.csv"
