# PlyMetrix Builder 02: Inventory & Stock

This is a public, task-scoped development workspace. It is not the authoritative PlyMetrix ERP source repository.

## Assigned lane
Inventory & Stock

## Scope
Define item, unit-of-measure, stock balance and movement contracts; reservations-aware sellable-stock rules; synthetic tests for receipts, issues, dispatches, returns and reversals. Do not implement a second stock ledger.

## Required working rules
- Work only on independently authored, non-sensitive code, specifications, generic tooling and synthetic test fixtures approved for public release.
- Never copy, mirror, fork, paste or commit private ERP source code, private commit history, database files, business/customer/vendor data, invoices, credentials, PATs, API keys, signing keys, certificates, environment files or production logs.
- Do not add repository secrets, PATs, deploy keys, self-hosted runners or workflows that access the private ERP repository.
- Do not invent or independently redefine shared database tables, migrations, API contracts, stock posting rules, identifiers, decimal precision or unit conversion semantics. Request an approved contract before implementation.
- Do not merge or publish anything directly to the private ERP repository. All outputs require security review, tests and explicit controlled integration.
- Use synthetic data only. Clearly label assumptions and unverified work.

## Required task handoff
For each task, document: goal/non-goals, files changed, approved contract version, assumptions, synthetic test cases, commands run and exact results, known gaps, security review notes, and proposed private-integration steps.

## Status
Workspace initialized with lane instructions only. No application source, secrets, integrations or automated workflows are configured yet.
