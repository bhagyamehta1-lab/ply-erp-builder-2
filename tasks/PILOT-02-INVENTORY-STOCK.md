# Pilot Task 02 — Inventory & Stock
Status: READY FOR CONTRACT REVIEW; implementation blocked pending shared-contract approval.
Shared proposal: [Shared Domain Contract v0.1 (draft)](https://github.com/bhagyamehta1-lab/ply-erp-builder/blob/main/docs/contracts/PILOT-2-3-4-DOMAIN-CONTRACT.md)

## Goal
Produce an independently authored, synthetic-only specification and test plan for one authoritative stock movement journal, lot-aware quantities and reservation-aware sellable stock.

## Non-goals
- Do not create a second stock ledger or canonical database migration.
- Do not implement against guessed private ERP schemas/APIs.
- Do not copy private application source or business data.
- Do not integrate into the private ERP repository.

## Work items
1. Propose read-model definitions for on-hand, reserved, held and sellable quantities, explicitly marking all as proposals.
2. Specify movement types for receipt, issue/consumption, production receipt, dispatch, return, adjustment and reversal.
3. Specify lot traceability and eligibility rules; draft vs posted behaviour.
4. Specify idempotent posting and append-only compensating reversal cases.
5. Define synthetic fixtures and tests for receipt, issue, reservation, dispatch, return, reversal, duplicate request and concurrent allocation.
6. Document UOM handling without hardcoding sheet-area conversions; require explicit dimensions and conversion version.

## Acceptance criteria
- Sellable stock calculation is explicit and reservation-aware.
- Posted movements are immutable; corrections append linked reversals.
- Repeated idempotency key cannot double-post.
- Tests demonstrate insufficient stock and reservation conflict do not mutate stock.
- No competing balance-writing path is proposed.
- Handoff records files, assumptions, tests/commands/results, gaps and integration notes.

## Dependencies
Shared contract is DRAFT v0.1 and requires integration-owner approval. Do not implement schema or posting code until approval.

## Synthetic examples
Use fictional item RM-PLY-01, lot LOT-DEMO-001 and quantities only. Never use real inventory values.

## Handoff
Submit proposed interfaces, state-transition table, test cases and evidence. Any private integration requires human review and a private feature branch.
