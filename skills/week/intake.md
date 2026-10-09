# Weekly Data Intake & Ingestion Guide

This guide describes how to ingest, identify, and organize advertising exports for weekly analysis.

---

## Supported Ingestion Channels

Lorewise ingests performance data from standard platform CSV exports, scheduled email reports, and screenshot images:

1. **Meta Ads Export:**
   - Primary headers: `Reporting starts`, `Reporting ends`, `Campaign name`, `Ad set name`, `Ad name`, `Amount spent (USD)`, `Impressions`, `Link clicks`, `Purchases`, `Cost per Purchase (USD)`, `Frequency`
2. **Google Ads Export:**
   - Primary headers: `Campaign`, `Ad group`, `Cost`, `Impressions`, `Clicks`, `Conversions`, `Cost / conv.`
3. **Google Analytics 4 (GA4):**
   - Primary headers: `Session source / medium`, `Sessions`, `Engaged sessions`, `Key events`, `Total revenue`
4. **Ecommerce Store Orders (Shopify, WooCommerce, Custom):**
   - Primary headers: `Name`, `Created at`, `Financial Status`, `Fulfillment Status`, `Total`, `Discount Amount`, `Lineitem quantity`, `Referring Site`
5. **Generic CSV:**
   - Any CSV file containing an entity name, a spend column, and a conversion or lead column.

---

## Directory Organization

When fresh files arrive:
1. If files are placed in `lorewise/inbox/`, inspect their header row to identify the platform and client.
2. Move them to the target client's dated intake directory:
   `lorewise/clients/<slug>/data/<YYYY-MM-DD>/`
3. If screenshot images are provided, place them in:
   `lorewise/clients/<slug>/data/<YYYY-MM-DD>/shots/`
   Tag extracted numbers with kind `seen` and request operator confirmation.

---

## Verification & Integrity Checks

Before analysis:
- **Delimiter & BOM:** Ensure UTF-8 encoding and comma/tab separation.
- **Totals Rows:** Check whether the export includes a summary "Totals" or "Results" row at the bottom. Never add summary rows to individual campaign rows.
- **Missing Columns:** If an essential column (such as revenue or conversions) is missing, do not attempt to guess it. Add it to the report's `needs_input` list.
