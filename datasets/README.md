# Datasets

## tickets_historical.csv

Historical support ticket data used as input for the Phase 2 ETL pipeline.

| Column | Type | Description |
|---|---|---|
| employee_name | string | Name of the employee who raised the ticket |
| department | string | Employee's department |
| issue_category | string | Type of IT issue |
| description | string | Issue description |
| priority | string | Low / Medium / High / Critical |
| status | string | Open / In Progress / Resolved / Closed |
| created_date | date (YYYY-MM-DD) | When ticket was created |
| resolved_date | date (YYYY-MM-DD) | When ticket was resolved (empty if unresolved) |
| resolution_time_hours | float | Hours taken to resolve (empty if unresolved) |

**Stats:** 260 rows · 12 issue categories · 10 departments · 30 unique employees  
**Date range:** May 2025 – April 2026  
**Intentional data quality issues:** 4 duplicate rows (cleaned during ETL transform stage)

## Running the ETL Pipeline

```bash
cd etl
pip install -r requirements.txt
python pipeline.py
```
