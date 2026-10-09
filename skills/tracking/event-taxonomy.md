# Conversion Event Taxonomy & Parity Standards

A standardized specification for tracking events across e-commerce, lead generation, and messaging funnels to ensure cross-platform data integrity and clean deduplication.

---

## 1. E-Commerce Standard Event Funnel

| Funnel Stage | Standard Event (Meta) | GA4 Recommended Event | Google Ads Action | Required Parameters |
|---|---|---|---|---|
| **Catalog Browsing** | `ViewContent` | `view_item` | Page view / Product | `content_ids`, `content_type: 'product'`, `value`, `currency` |
| **Cart Addition** | `AddToCart` | `add_to_cart` | Add to cart | `content_ids`, `value`, `currency`, `quantity` |
| **Checkout Start** | `InitiateCheckout` | `begin_checkout` | Begin checkout | `content_ids`, `num_items`, `value`, `currency` |
| **Transaction** | `Purchase` | `purchase` | Purchase (Primary) | `content_ids`, `value`, `currency`, `transaction_id` (mandatory) |

---

## 2. Server-Side Deduplication Protocol (CAPI)

To accurately track conversions despite browser ad blockers and iOS tracking restrictions without double-counting transactions:

1. **Identical Event Name:** Browser `fbq('track', 'Purchase', ...)` and server CAPI payload must both specify `Purchase`.
2. **Unique `event_id` Generation:**
   - Generate a cryptographically unique identifier at checkout initiation (e.g. order number or UUID: `order_94821`).
   - Pass the identical `event_id` in both the client-side JavaScript pixel call and the backend server-side CAPI POST request.
3. **Event Match Quality (EMQ) Customer Data:**
   - Hash all customer data with SHA-256 before transmission:
     * `em`: Lowercase, trimmed email.
     * `ph`: E.164 international formatted phone (e.g. `+14155552671`).
     * `fn`, `ln`: First and last name.
     * `client_ip_address`, `client_user_agent`: Captured from HTTP request headers.

---

## 3. Lead Generation Funnel Taxonomy

| Funnel Stage | Standard Event (Meta) | GA4 Recommended Event | Google Ads Action | Validation Criteria |
|---|---|---|---|---|
| **Landing View** | `PageView` | `page_view` | Page load | Fires on initial page load. |
| **Form Interaction** | Custom: `FormStart` | `form_start` | Interaction | Fires when user focuses on first form field. |
| **Submission** | `Lead` | `generate_lead` | Submit lead form | Fires **only** upon successful form validation or Thank-You page load. |
| **Qualified Call** | `Schedule` | `schedule` | Book appointment | Fires when calendar booking confirmation renders. |

---

## 4. Telegram & Bot Funnel Tracking

When driving traffic to Telegram channels or bots:
1. **Direct Telegram Bot Links:**
   - Append tracking payloads to bot deep-links: `https://t.me/BrandBot?start=src_meta_c12`
   - Capture the `start` payload in the bot's `/start` webhook handler and store it in CRM against the user's Telegram ID.
2. **Channel Join Tracking:**
   - Use unique invite links with join requests enabled: `https://t.me/+AbCdEfGhIjK`
   - Reconcile ad spend against daily member increase reports in Channel Analytics.
