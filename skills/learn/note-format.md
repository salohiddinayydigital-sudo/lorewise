# Playbook Note Format Specification

Playbook notes store synthesized marketing knowledge, platform mechanics, and practitioner strategies in `lorewise/playbook/notes/N-<id>.md`.

---

## 1. Schema Specification

```yaml
---
id: N-<topic>-<id>
topic: meta-ads | google-ads | ga4 | ecommerce | creative | attribution
claim: <one_sentence_falsifiable_statement>
kind: platform-fact | practitioner-opinion | own-data
source: <mandatory_url_or_publication>
checked: YYYY-MM-DD
expires: YYYY-MM-DD # mandatory for platform-fact, optional for opinion
summary: <concise_1_to_2_sentence_summary>
---

# Note: <id>

### Context & Core Mechanism
Detailed context explaining the reasoning, scope, and prerequisites.

### Strategic Implications
How this knowledge affects media buying, budget allocation, or creative testing.

### Edge Cases & Exceptions
Known conditions under which this claim breaks or does not apply.
```

---

## 2. Classification Rules

1. `platform-fact`:
   - Must link directly to official documentation (`facebook.com/business/help`, `support.google.com`, etc.).
   - Must specify an explicit `expires` date within 12 months.
2. `practitioner-opinion`:
   - Advice, recommended budget allocations (e.g. 70/20/10), or creative guidelines.
   - Must cite the practitioner or agency source.
   - May never be framed as an algorithmic requirement.
3. `own-data`:
   - Derived directly from cross-client empirical results verified in Lorewise accounts.

---

## 3. Reference Examples

### Example: N-meta-capi-01 (Platform Fact)

```yaml
---
id: N-meta-capi-01
topic: meta-ads
claim: Server-side Conversions API events require matching event_id and event_name parameters to deduplicate against browser pixel fires.
kind: platform-fact
source: "https://www.facebook.com/business/help/823677331451951"
checked: 2026-09-15
expires: 2027-09-15
summary: Meta automatically deduplicates redundant server and browser conversion events when identifiers match identically.
---

# Note: N-meta-capi-01

### Context & Core Mechanism
When transmitting identical events through both the Meta Pixel and the Conversions API, deduplication prevents double-counting conversions in reporting and ad optimization.

### Strategic Implications
Failure to send matching `event_id` keys creates artificial conversion spikes and distorts CPA calculations.
```

### Example: N-creative-hook-02 (Practitioner Opinion)

```yaml
---
id: N-creative-hook-02
topic: creative
claim: User-generated video reviews leading with a problem objection in the first 2 seconds produce higher hook rates than brand logo introductions.
kind: practitioner-opinion
source: "https://example.com/creative-strategy-playbook"
checked: 2026-09-20
summary: Cold prospect attention decays rapidly when ads open with static branding rather than relatable pain points.
---

# Note: N-creative-hook-02

### Context & Core Mechanism
Practitioner analysis across direct-to-consumer skincare brands indicates consumer drop-off occurs within the first 1.5 seconds if the visual does not establish an immediate problem-solution frame.

### Strategic Implications
When briefing video creators, mandate hook testing focused on opening lines before investing in body copy revisions.
```

## 4. Claim Verification Taxonomy

When documenting knowledge, classify the reliability of the claim:

- **FACT**: Verified against official platform documentation with a direct URL and date checked. Highest reliability.
- **EXPERIENCE**: Based on firsthand account data across multiple Lorewise campaigns. High reliability but context-dependent.
- **OPINION**: Practitioner recommendation or hypothesis without statistical proof. Useful but must be explicitly labeled to avoid confusion.
- **AD**: Marketing claim from a vendor, agency, or tool. Lowest reliability, never cite as core evidence.

## 5. Source Quality Score (1-5)

Rank sources according to this hierarchy to maintain data integrity:

- **5**: Official platform documentation (Meta Business Help, Google Ads Help).
- **4**: Peer-reviewed study or official platform engineering blog.
- **3**: Experienced practitioner with a verifiable track record and cross-account data.
- **2**: Industry blog or conference talk (often generalized or outdated).
- **1**: Social media post or anonymous forum comment.

## 6. Conflict Resolution Protocol

When two authoritative sources or notes disagree on a platform mechanic:

- When two sources disagree, immediately tag the note as `contested`.
- Preserve both positions within the note, explicitly noting their respective Source Quality Scores.
- Resolve the conflict by testing in our own accounts. Once verified, graduate the claim to **EXPERIENCE**.
- Never silently pick one side without documenting the discrepancy.
