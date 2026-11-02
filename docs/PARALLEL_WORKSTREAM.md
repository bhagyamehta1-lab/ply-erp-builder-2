# Parallel Workstream: Inventory & warehouse

## Purpose
Build a complete, independently testable inventory domain module in this public repository. Builder-1 coordinates cross-module interfaces and integration.

## Assigned scope
Warehouse/location identifiers, stock identity, append-only movements, reservations, transfers, cycle-count adjustment contract, stock balances, valuation/ageing/reorder interface contracts, and FEFO/FIFO extension points. The initial implementation slice establishes the immutable movement ledger, available quantity calculation, and balanced transfers.

## Architecture constraints
- Offline/local-first domain logic; no network calls, telemetry, or automatic sync.
- Platform-neutral deterministic functions shared by Windows and Android clients.
- Posted stock movements are append-only; balances are derived, not independently edited.
- Quantities use safe integer smallest-units to avoid floating-point drift.
- Negative stock is rejected by default and can only be enabled explicitly by a caller.
- Public examples use synthetic identifiers and values only.
- No production-readiness claim without end-to-end platform tests and Factory Process Owner acceptance.

## Delivery rules
1. Inspect the current public repository state and exact base SHA before each change.
2. Keep changes feature-sized and confined to this module.
3. Add unit tests for validation, idempotency, transfer balancing and failure cases.
4. Run `node --test src/*.test.mjs` in CI.
5. Publish stable interfaces for Builder-1 integration.
6. Never access or copy content from the private ERP repository.

## Current implementation
- `src/inventory.mjs`: immutable stock ledger, derived balances, availability and paired transfer events.
- `src/inventory.test.mjs`: deterministic validation and ledger tests.
- Next: add reservation lifecycle and cycle-count reconciliation contracts, then valuation/ageing/reorder.
