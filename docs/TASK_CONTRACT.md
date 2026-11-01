# Worker task contract — Inventory & stock

## Objective
Deliver a self-contained, executable inventory domain module in this public Builder repository. This repository is an active development workspace, not a test-only lane.

## Scope
- Append-only stock movement ledger and ledger-derived balances.
- Item, location and optional lot identity.
- Reservation-aware availability calculation.
- Transfers represented by balanced outbound/inbound events.
- Explicit negative-stock policy.
- Deterministic quantities represented as safe integer smallest-units.

## Public-repository safety
- Use only generic, synthetic examples and public interface contracts.
- Never access, fetch, inspect, or depend on the private PLY_ERP repository.
- Never add proprietary source, confidential business rules, live factory/customer/supplier data, credentials, tokens, database files, encryption keys, or unredacted logs.
- No cloud sync, telemetry, or external data upload.

## Required task result
Every task result must include task_id, worker_repo, module, base_sha, changed_files, commit_sha, test_commands, test_results, acceptance_total, acceptance_passed, acceptance_failed, acceptance_not_tested, blockers, risks, rollback_note, evidence_links, updated_at and status.

## Integration boundary
- Export stable, documented module APIs and deterministic contract tests.
- Windows and Android clients must be able to consume the same domain contract.
- Do not claim production readiness from isolated domain tests.
- Factory workflow and accounting acceptance require the respective human approvers.
