# Campaign Pre-Flight Gate & Launch Verification Checklist

A mandatory verification checklist that must be passed before committing live advertising spend to a new campaign, ad account, or promotional offer.

---

## The 10-Point Pre-Flight Verification Gate

Every check must be confirmed before an operator sets campaigns to active in Ads Manager:

```text
[ ] 1. CONVERSION TRACKING VERIFIED
    - Test conversion fired and confirmed in Events Manager / Google Ads diagnostics.
    - Purchase value and currency code match backend cart amounts exactly.
    - Browser pixel and server-side CAPI event deduplication confirmed via event_id.

[ ] 2. AUDIENCE EXCLUSIONS APPLIED
    - Past 180-day purchasers excluded from cold acquisition ad sets.
    - Past 30-day website visitors excluded from cold acquisition sets (unless running retargeting).
    - Existing leads/subscribers excluded from lead gen campaigns.

[ ] 3. ECONOMIC CEILINGS DOCUMENTED
    - Target CPA, Breakeven CPA, and AOV verified in client.md.
    - Maximum daily budget cap configured at campaign or account level.

[ ] 4. DESTINATION & LANDING PAGE INTEGRITY
    - Destination URLs tested on mobile device (iOS and Android).
    - Page loads in under 3.0 seconds on standard 4G connection.
    - No broken redirect chains or 404 errors.
    - Privacy Policy and Terms of Service links visible and functional in footer.

[ ] 5. MESSAGE MATCH & OFFER ALIGNMENT
    - Ad copy headline, discount, or promo code matches the hero section of the landing page.
    - Pricing, shipping terms, and guarantees in ad creative match checkout terms.

[ ] 6. ASSET SPECIFICATIONS & FORMATS
    - Feed creatives formatted to 1:1 or 4:5 ratio.
    - Stories and Reels creatives formatted to 9:16 vertical ratio with UI safe zones observed.
    - RSA ad groups have minimum 5 unique headlines and 3 descriptions.

[ ] 7. COMPLIANCE SCREENING PASSED
    - Zero personal attribute accusations ("Do you have bad skin?", "Are you in debt?").
    - Zero unrealistic health, medical cure, or guaranteed income claims.
    - No prohibited before-and-after imagery or fake countdown timers.

[ ] 8. UTM PARAMETER TAXONOMY ENFORCED
    - Dynamic tracking parameters appended: utm_source, utm_medium, utm_campaign, utm_content.
    - Consistent lowercase naming convention with zero unescaped spaces.

[ ] 9. OPERATIONAL & INVENTORY CAPACITY
    - Client confirms stock or fulfillment bandwidth can support anticipated conversion volume.
    - Customer service or sales reps briefed on active promotional offers.

[ ] 10. DOWNSIDE ROLLBACK TRIGGER ASSIGNED
    - Explicit rule defined: "If account CPA breaches $X over Y days, pause and revert to previous configuration."
    - Account manager and client aligned on evaluation window.
```
