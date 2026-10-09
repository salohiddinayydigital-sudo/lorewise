# How Lorewise Works

Lorewise is an open Claude Code plugin and agent skills framework built for media buyers and performance marketers.
It functions as an operator's second brain: retaining client memory, proving every reported figure with raw file receipts, and grading its own advice against next week's real performance.

---

## 1. Architectural Philosophy: The Three Pillars

```
+-------------------------------------------------------------------------+
|                         1. Operator-First Shell                         |
|     /lorewise:start  *  /lorewise:week  *  /lorewise:diagnose           |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                        2. Brain-First Memory Ledger                     |
|      client.md  *  journal.md  *  desk.md  *  playbook/lessons/         |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                       3. Proof-First Verification                       |
|   receipts [rX]  *  non-additive guard  *  spend guard  *  skeptic agent|
+-------------------------------------------------------------------------+
```

### Pillar 1: Operator-First Shell
- **Zero Configuration Ceremonies:** No mandatory onboarding interviews or API token configurations before getting value.
- **5-Minute Value Loop:** A user can run `/lorewise:start`, select the demo store, and inspect an audited cross-channel report with planted attribution anomalies within 3 minutes.
- **Read-Only Non-Destructive Operation:** Direct account mutations are strictly barred. Advice is rendered as human-executable **change packets**.

### Pillar 2: Brain-First Compounding Ledger
- **Persistent Client Context:** Target CPA, gross margins, attribution lag windows, and historical decisions persist cleanly in Markdown files (`client.md`, `journal.md`).
- **Falsifiable Bets (`bets.md`):** Strategic suggestions are phrased as testable bets with explicit success criteria (`win_if`), target evaluation windows, and noise bands.
- **Compounding Playbook:** Winning bets graduate into durable account patterns and shared agency lessons; losing bets update counter-evidence (`against` counts).

### Pillar 3: Proof-First Verification
- **Receipts Engine:** Every metric cited in weekly reports must carry a verifiable receipt pointer `[rX]` tied to exact source rows.
- **Non-Additive Metric Guard:** Algorithmic refusal to sum non-additive metrics (reach, frequency, CTR, CPC, CPM, ROAS) across campaigns or timeframes.
- **Deterministic Spend Guard:** PreToolUse hook interceptor blocking 100% of mutating advertising tools in under 150 ms.
- **Adversarial Skeptic:** Independent reviewer agent (`agents/skeptic.md`) checking drafts for ungrounded claims and causal leaps before final presentation.

---

## 2. The Weekly Review Lifecycle

```
[ Raw CSV Exports in Inbox ]
            |
            v
   ( 1. Ingest & Profile )   --> Delimiter, header & totals row detection
            |
            v
   ( 2. Compile Receipts )   --> ledger.json with [rX] fact citations
            |
            v
   ( 3. Reconcile Sources )  --> Meta vs Google vs GA4 vs Store Backend
            |
            v
   ( 4. Diagnostic Audit )   --> 20 checks (4 states: pass/fail/unknown/na)
            |
            v
   ( 5. Settle Due Bets )    --> Evaluate held/missed outside lag window
            |
            v
   ( 6. Draft Weekly Plan )  --> Next week's bets + change packets
            |
            v
   ( 7. Adversarial QA )     --> Skeptic audit + Receipts stamp
            |
            v
[ reports/YYYY-Wxx.md & Clean Client Summary ]
```

1. **Intake:** Drag weekly platform exports into `lorewise/inbox/`.
2. **Deterministic Ledger:** `scripts/lorewise.mjs ledger` parses CSVs, detects totals rows, and computes verified metrics down to the penny.
3. **Cross-Channel Reconciliation:** Side-by-side reconciliation between ad network claims (e.g. Meta reported purchases) and ground-truth store receipts. Never averages disparate numbers.
4. **Diagnostic Checks:** Evaluates the 20-check framework in `skills/diagnose/method.md`. If observational data coverage is below 60%, flags `needs_input` and declines to assign an arbitrary score.
5. **Bet Settlement:** Inspects due bets. If the test date has passed the conversion lag window, evaluates outcome against noise bands and updates playbook lessons.
6. **Change Packets:** Generates step-by-step instructions with safety ceilings and rollback triggers for the human media buyer.
7. **Verification & Audit Badge:** Stamps the report with verified receipt counts; PostToolUse hook warns if unsourced claims slipped through.

---

## 3. Knowledge Evolution & Playbook Hygiene

Marketing tactics decay as ad algorithms evolve. Lorewise enforces dated hygiene:
- Every platform reference carries an official documentation URL, a `checked` date, and an `expires` date.
- Stale claims older than 30 days past expiration trigger CI test failures.
- Running `/lorewise:check` flags expired notes, missing sources, and contradictory claims across all client records.
