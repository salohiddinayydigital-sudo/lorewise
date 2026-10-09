---
type: regex
pattern: "LTV[:\\s]+([$]?[0-9]+)"
match: not_contains
---
Report must NOT invent or hallucinate an LTV dollar figure because LTV is absent from all source files.
