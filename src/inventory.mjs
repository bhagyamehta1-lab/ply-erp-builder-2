const MOVEMENT_SIGN = Object.freeze({
  receipt: 1,
  issue: -1,
  adjustment_in: 1,
  adjustment_out: -1,
  transfer_in: 1,
  transfer_out: -1,
});

function assertNonEmpty(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${field} is required`);
  }
}

function assertPositiveQuantity(value, field = 'quantity') {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive safe integer in the item's smallest unit`);
  }
}

function validateEvent(event) {
  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    throw new Error('Stock event must be an object');
  }
  for (const field of ['eventId', 'itemId', 'locationId', 'movement', 'occurredAt']) {
    assertNonEmpty(event[field], field);
  }
  assertPositiveQuantity(event.quantity);
  if (!Object.hasOwn(MOVEMENT_SIGN, event.movement)) {
    throw new Error('Unsupported stock movement');
  }
  if (Number.isNaN(Date.parse(event.occurredAt))) {
    throw new Error('occurredAt must be a valid date-time');
  }
  if (event.lotId !== undefined && event.lotId !== null) assertNonEmpty(event.lotId, 'lotId');
  if (event.referenceId !== undefined && event.referenceId !== null) assertNonEmpty(event.referenceId, 'referenceId');
  return Object.freeze({ ...event });
}

export function stockBalance(entries, { itemId, locationId, lotId } = {}) {
  if (!Array.isArray(entries)) throw new Error('entries must be an array');
  return entries.reduce((balance, entry) => {
    if (itemId !== undefined && entry.itemId !== itemId) return balance;
    if (locationId !== undefined && entry.locationId !== locationId) return balance;
    if (lotId !== undefined && entry.lotId !== lotId) return balance;
    return balance + MOVEMENT_SIGN[entry.movement] * entry.quantity;
  }, 0);
}

export function availableStock(onHand, reserved) {
  if (!Number.isSafeInteger(onHand) || !Number.isSafeInteger(reserved) ||
      onHand < 0 || reserved < 0 || reserved > onHand) {
    throw new Error('Invalid on-hand or reserved quantity');
  }
  return onHand - reserved;
}

/** Returns a new ledger; the supplied ledger and its entries are never mutated. */
export function appendStockEvent(entries, rawEvent, { allowNegative = false } = {}) {
  if (!Array.isArray(entries)) throw new Error('entries must be an array');
  const event = validateEvent(rawEvent);
  if (entries.some(existing => existing.eventId === event.eventId)) {
    throw new Error('Duplicate eventId');
  }
  const decreasesStock = MOVEMENT_SIGN[event.movement] < 0;
  if (decreasesStock && !allowNegative) {
    const current = stockBalance(entries, {
      itemId: event.itemId,
      locationId: event.locationId,
      lotId: event.lotId,
    });
    if (event.quantity > current) throw new Error('Insufficient stock; negative stock is disabled');
  }
  return Object.freeze([...entries, event]);
}

/** Appends a balanced pair of transfer events after validating source availability. */
export function appendTransfer(entries, {
  transferId, itemId, fromLocationId, toLocationId, quantity, occurredAt, lotId,
}) {
  assertNonEmpty(transferId, 'transferId');
  assertNonEmpty(itemId, 'itemId');
  assertNonEmpty(fromLocationId, 'fromLocationId');
  assertNonEmpty(toLocationId, 'toLocationId');
  assertNonEmpty(occurredAt, 'occurredAt');
  assertPositiveQuantity(quantity);
  if (fromLocationId === toLocationId) throw new Error('Transfer locations must be different');
  if (entries.some(entry => entry.transferId === transferId)) throw new Error('Duplicate transferId');

  const sourceBalance = stockBalance(entries, { itemId, locationId: fromLocationId, lotId });
  if (quantity > sourceBalance) throw new Error('Insufficient stock for transfer');

  const common = { transferId, itemId, quantity, occurredAt, ...(lotId ? { lotId } : {}) };
  const outbound = validateEvent({
    ...common, eventId: `${transferId}:out`, locationId: fromLocationId,
    movement: 'transfer_out', referenceId: transferId,
  });
  const inbound = validateEvent({
    ...common, eventId: `${transferId}:in`, locationId: toLocationId,
    movement: 'transfer_in', referenceId: transferId,
  });
  return Object.freeze([...entries, outbound, inbound]);
}
