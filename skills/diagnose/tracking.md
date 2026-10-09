---
platform: tracking
facts:
  - id: TRK-FACT-01
    claim: Explicit UTM tagging requires utm_source, utm_medium, and utm_campaign query parameters to identify traffic attribution in web analytics.
    source: https://support.google.com/analytics/answer/10917952
    checked: 2026-09-15
    expires: 2027-09-15
  - id: TRK-FACT-02
    claim: Server-side conversion deduplication requires passing an identical transaction_id between client data layer events and server API payloads.
    source: https://support.google.com/tagmanager/answer/9383630
    checked: 2026-09-15
    expires: 2027-09-15
  - id: TRK-FACT-03
    claim: WebKit Intelligent Tracking Prevention (ITP) caps client-side document.cookie expiration to 1 to 7 days for inbound query click parameters.
    source: https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
    checked: 2026-09-15
    expires: 2027-09-15
  - id: TRK-FACT-04
    claim: Consent Mode v2 regulates Google conversion tags dynamically based on end-user consent signals for ad_storage and ad_user_data.
    source: https://support.google.com/google-ads/answer/10000067
    checked: 2026-09-15
    expires: 2027-09-15
  - id: TRK-FACT-05
    claim: Conversion reporting lag delays final settled attribution figures, causing conversion metrics within the last 24 to 72 hours to appear incomplete.
    source: https://support.google.com/google-ads/answer/2375438
    checked: 2026-09-15
    expires: 2027-09-15
  - id: TRK-FACT-06
    claim: Dynamic transaction value and currency parameters must be passed in purchase payloads to enable valid ROAS calculations in analytics.
    source: https://support.google.com/analytics/answer/9267735
    checked: 2026-09-15
    expires: 2027-09-15
---

# Tracking & Attribution Hygiene Platform Reference

Official reference rules and telemetry standards for UTM tagging, cookie lifespans, consent, and server-side deduplication.

## Fact Index

### TRK-FACT-01: Standard UTM Tagging Parameters
- **Claim:** Explicit UTM tagging requires utm_source, utm_medium, and utm_campaign query parameters to identify traffic attribution in web analytics.
- **Source:** [Google Analytics Help](https://support.google.com/analytics/answer/10917952)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### TRK-FACT-02: Server-Side Deduplication Key Matching
- **Claim:** Server-side conversion deduplication requires passing an identical transaction_id between client data layer events and server API payloads.
- **Source:** [Google Tag Manager Help](https://support.google.com/tagmanager/answer/9383630)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### TRK-FACT-03: Browser Cookie Lifespan Caps (ITP)
- **Claim:** WebKit Intelligent Tracking Prevention (ITP) caps client-side document.cookie expiration to 1 to 7 days for inbound query click parameters.
- **Source:** [WebKit Official Documentation](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### TRK-FACT-04: Consent Mode v2 Consent Signals
- **Claim:** Consent Mode v2 regulates Google conversion tags dynamically based on end-user consent signals for ad_storage and ad_user_data.
- **Source:** [Google Ads Help](https://support.google.com/google-ads/answer/10000067)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### TRK-FACT-05: Conversion Reporting Lag Window
- **Claim:** Conversion reporting lag delays final settled attribution figures, causing conversion metrics within the last 24 to 72 hours to appear incomplete.
- **Source:** [Google Ads Help](https://support.google.com/google-ads/answer/2375438)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15

### TRK-FACT-06: Dynamic Value & Currency Parameter Requirements
- **Claim:** Dynamic transaction value and currency parameters must be passed in purchase payloads to enable valid ROAS calculations in analytics.
- **Source:** [Google Analytics Help](https://support.google.com/analytics/answer/9267735)
- **Checked:** 2026-09-15 | **Expires:** 2027-09-15
