/*
# Add Monthly and Yearly Pricing

1. Modified Tables
- `cars` - Added price_per_month and price_per_year columns
  - price_per_month (decimal) - Monthly rental rate
  - price_per_year (decimal) - Yearly rental rate

2. Notes
- All existing cars will have null values for new price fields (optional pricing)
- Admin can update these via the dashboard
*/

ALTER TABLE cars ADD COLUMN IF NOT EXISTS price_per_month decimal(10,2);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS price_per_year decimal(10,2);