import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appendStockEvent, appendTransfer, availableStock, stockBalance,
} from './inventory.mjs';

const receipt = (overrides = {}) => ({
  eventId: 'receipt-1', itemId: 'ITEM-A', locationId: 'WH-A',
  movement: 'receipt', quantity: 20, occurredAt: '2026-11-01T10:00:00Z',
  ...overrides,
});

test('ledger balance is derived from append-only events and filters by stock identity', () => {
  const ledger = [
    receipt(),
    receipt({ eventId: 'issue-1', movement: 'issue', quantity: 4 }),
    receipt({ eventId: 'other-warehouse', locationId: 'WH-B', quantity: 7 }),
    receipt({ eventId: 'other-item', itemId: 'ITEM-B', quantity: 9 }),
  ];
  assert.equal(stockBalance(ledger, { itemId: 'ITEM-A', locationId: 'WH-A' }), 16);
  assert.equal(stockBalance(ledger, { itemId: 'ITEM-A', locationId: 'WH-B' }), 7);
  assert.equal(stockBalance(ledger, { itemId: 'ITEM-B' }), 9);
});

test('appending returns a new frozen ledger without mutating the original', () => {
  const original = Object.freeze([Object.freeze(receipt())]);
  const next = appendStockEvent(original, receipt({ eventId: 'receipt-2', quantity: 3 }));
  assert.equal(original.length, 1);
  assert.equal(next.length, 2);
  assert.ok(Object.isFrozen(next));
  assert.ok(Object.isFrozen(next[1]));
});

test('duplicate event IDs are rejected', () => {
  assert.throws(() => appendStockEvent([receipt()], receipt()), /Duplicate eventId/);
});

test('invalid or fractional quantities are rejected', () => {
  for (const quantity of [0, -1, 1.25, Number.MAX_SAFE_INTEGER + 1, NaN]) {
    assert.throws(() => appendStockEvent([], receipt({ quantity })), /positive safe integer/);
  }
});

test('issues cannot create negative stock unless explicitly allowed', () => {
  assert.throws(() => appendStockEvent([], receipt({ movement: 'issue' })), /Insufficient stock/);
  const allowed = appendStockEvent([], receipt({ movement: 'issue' }), { allowNegative: true });
  assert.equal(stockBalance(allowed, { itemId: 'ITEM-A', locationId: 'WH-A' }), -20);
});

test('reservations reduce availability and cannot exceed on-hand', () => {
  assert.equal(availableStock(12, 5), 7);
  assert.throws(() => availableStock(4, 5), /Invalid on-hand/);
  assert.throws(() => availableStock(4.5, 1), /Invalid on-hand/);
});

test('transfer appends balanced source and destination events', () => {
  const ledger = [receipt()];
  const next = appendTransfer(ledger, {
    transferId: 'TR-1', itemId: 'ITEM-A', fromLocationId: 'WH-A',
    toLocationId: 'WH-B', quantity: 6, occurredAt: '2026-11-01T12:00:00Z',
  });
  assert.equal(ledger.length, 1);
  assert.equal(next.length, 3);
  assert.equal(stockBalance(next, { itemId: 'ITEM-A', locationId: 'WH-A' }), 14);
  assert.equal(stockBalance(next, { itemId: 'ITEM-A', locationId: 'WH-B' }), 6);
  assert.equal(stockBalance(next, { itemId: 'ITEM-A' }), 20);
});

test('transfers reject overselling, same-location movement and duplicate IDs', () => {
  const ledger = [receipt()];
  const base = {
    transferId: 'TR-2', itemId: 'ITEM-A', fromLocationId: 'WH-A',
    toLocationId: 'WH-B', quantity: 21, occurredAt: '2026-11-01T12:00:00Z',
  };
  assert.throws(() => appendTransfer(ledger, base), /Insufficient stock/);
  assert.throws(() => appendTransfer(ledger, { ...base, toLocationId: 'WH-A', quantity: 1 }), /different/);
  const moved = appendTransfer(ledger, { ...base, quantity: 1 });
  assert.throws(() => appendTransfer(moved, { ...base, quantity: 1 }), /Duplicate transferId/);
});

test('lot identity is preserved when deriving balances', () => {
  const ledger = [
    receipt({ eventId: 'lot-1', lotId: 'LOT-1', quantity: 5 }),
    receipt({ eventId: 'lot-2', lotId: 'LOT-2', quantity: 8 }),
  ];
  assert.equal(stockBalance(ledger, { itemId: 'ITEM-A', lotId: 'LOT-1' }), 5);
  assert.equal(stockBalance(ledger, { itemId: 'ITEM-A', lotId: 'LOT-2' }), 8);
});

test('malformed events are rejected', () => {
  assert.throws(() => appendStockEvent([], { ...receipt(), movement: 'mystery' }), /Unsupported stock movement/);
  assert.throws(() => appendStockEvent([], { ...receipt(), occurredAt: 'not-a-date' }), /valid date-time/);
  assert.throws(() => appendStockEvent([], { ...receipt(), locationId: '' }), /locationId is required/);
});
