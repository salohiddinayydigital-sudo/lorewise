# Budget Math & Forecast Guide

Lorewise approaches budgeting with unit-economics-first math rather than arbitrary multiplier guesses.

---

## 1. Breakeven CPA Formula
$$\text{Breakeven CPA} = \text{AOV} \times \text{Gross Margin Percentage}$$
*Example:* With `$58.00` AOV and `62%` gross margin:
`$58.00 * 0.62 = $35.96` (rounded to `$36.00` breakeven CPA ceiling).

---

## 2. Target CPA from Desired Margin
$$\text{Target CPA} = \text{AOV} \times (\text{Gross Margin Percentage} - \text{Target Net Contribution Margin})$$
*Example:* Aiming for a `10%` net profit margin on ad spend:
`$58.00 * (0.62 - 0.10) = $30.16` target CPA.

---

## 3. Daily Budget Ceilings
When scaling an ad set or campaign:
- **Maximum Daily Step:** Never increase an active ad set's daily budget by more than `20%` in a single 48-hour window to avoid triggering an algorithmic learning reset.
- **Account Budget Ceiling:** Every change packet must define an explicit account-level daily spend ceiling.

---

## 4. Forecasting Conversions
$$\text{Expected Purchases} = \frac{\text{Allocated Spend}}{\text{Historical Ad Set CPA}}$$
*Rule:* Forecasts must cite the entity's historical CPA receipt ID, never an ungrounded target.


## Unit Economics Reference Formulas

- **CAC (Customer Acquisition Cost)** = Total Marketing Spend / New Customers
- **CPL (Cost Per Lead)** = Total Spend / Leads Generated
- **LTV (Lifetime Value)** = AOV × Purchase Frequency × Avg Customer Lifespan
- **ROAS (Return on Ad Spend)** = Revenue / Ad Spend
- **POAS (Profit on Ad Spend)** = (Revenue - COGS) / Ad Spend
- **MER (Marketing Efficiency Ratio)** = Total Revenue / Total Marketing Spend
- **Break-even ROAS** = 1 / Gross Margin
- **Break-even CPA** = AOV × Gross Margin
- **Marginal CPA** = (New Spend - Old Spend) / (New Conversions - Old Conversions)
- **Marginal ROAS** = (New Revenue - Old Revenue) / (New Spend - Old Spend)
- **Reverse Budget Calculator**: Required Budget = Target Conversions × Target CPA

## Scaling Decision Math

- **When Marginal ROAS > Break-even ROAS** → Scale budget (you are profitably acquiring incremental revenue).
- **When Marginal ROAS < Break-even ROAS** → Stop scaling (the next dollar spent destroys profit, even if average ROAS looks okay).
- **Blended Business ROAS vs In-Platform ROAS distinction**: Always prioritize Blended ROAS (MER) for business health, as in-platform ROAS suffers from attribution loss and overlap.
- **Net Free Cash Flow** = Revenue - COGS - Ad Spend - Operating Costs
