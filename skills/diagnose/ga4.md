---
platform: ga4
facts:
  - id: GA4-FACT-01
    claim: GA4 reporting attribution defaults to Data-Driven Attribution (DDA), distributing fractional conversion credit across multiple customer touchpoints.
    source: https://support.google.com/analytics/answer/10596866
    checked: 2026-09-15
    expires: 2027-09-15
  - id: GA4-FACT-02
    claim: Traffic acquisition reports attribute sessions based on the session's campaign source and medium, whereas user acquisition attributes by the user's first-ever touchpoint.
    source: https://support.google.com/analytics/answer/11086398
    checked: 2026-09-15
    expires: 2027-09-15
  - id: GA4-FACT-03
    claim: Inbound web traffic lacking valid UTM parameters or referrer headers is grouped into Direct or Unassigned channel categories.
    source: https://support.google.com/analytics/answer/9756891
    checked: 2026-09-15
    expires: 2027-09-15
  - id: GA4-FACT-04
    claim: GA4 registers conversion events at the exact timestamp of event firing, unlike ad network click-date attribution models.
    source: https://support.google.com/analytics/answer/9191807
    checked: 2026-09-15
    expires: 2027-09-15
  - id: GA4-FACT-05
    claim: Data thresholding in GA4 reports is applied to prevent inferring individual user identity when Google Signals is enabled with low row counts.
    source: https://support.google.com/analytics/answer/9383630
    checked: 2026-09-15
    expires: 2027-09-15
  - id: GA4-FACT-06
    claim: An engaged session in GA4 requires session duration of at least 10 seconds, 2 or more page views, or at least 1 conversion event.
    source: https://support.google.com/analytics/answer/12159447
    checked: 2026-09-15
    expires: 2027-09-15
---

# Google Analytics 4 (GA4) Platform Reference

Official reference rules and measurement mechanics for Google Analytics 4.

## Fact Index

### GA4-FACT-01: Data-Driven Attribution Default
- **Claim:** GA4 reporting attribution defaults to Data-Driven Attribution (DDA), distributing fractional conversion credit across multiple customer touchpoints.
- **Source:** [Google Analytics Help](https://support.google.com/analytics/answer/10596866)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### GA4-FACT-02: User Acquisition vs Traffic Acquisition Scopes
- **Claim:** Traffic acquisition reports attribute sessions based on the session's campaign source and medium, whereas user acquisition attributes by the user's first-ever touchpoint.
- **Source:** [Google Analytics Help](https://support.google.com/analytics/answer/11086398)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### GA4-FACT-03: Direct & Unassigned Channel Classification
- **Claim:** Inbound web traffic lacking valid UTM parameters or referrer headers is grouped into Direct or Unassigned channel categories.
- **Source:** [Google Analytics Help](https://support.google.com/analytics/answer/9756891)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### GA4-FACT-04: Event Timestamp Attribution
- **Claim:** GA4 registers conversion events at the exact timestamp of event firing, unlike ad network click-date attribution models.
- **Source:** [Google Analytics Help](https://support.google.com/analytics/answer/9191807)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### GA4-FACT-05: Google Signals Data Thresholding
- **Claim:** Data thresholding in GA4 reports is applied to prevent inferring individual user identity when Google Signals is enabled with low row counts.
- **Source:** [Google Analytics Help](https://support.google.com/analytics/answer/9383630)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### GA4-FACT-06: Engaged Session Threshold Criteria
- **Claim:** An engaged session in GA4 requires session duration of at least 10 seconds, 2 or more page views, or at least 1 conversion event.
- **Source:** [Google Analytics Help](https://support.google.com/analytics/answer/12159447)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15
