import test from 'node:test';
import assert from 'node:assert/strict';
export function stockBalance(entries,{productId,warehouseId,lotId}={}) {
 return entries.filter(e=>(!productId||e.productId===productId)&&(!warehouseId||e.warehouseId===warehouseId)&&(!lotId||e.lotId===lotId))
  .reduce((sum,e)=>sum+(e.direction==='in'?e.quantity:-e.quantity),0);
}
export function availableStock(onHand,reserved) {
 if (![onHand,reserved].every(Number.isFinite)||onHand<0||reserved<0||reserved>onHand) throw new Error('Invalid stock or reservation quantity');
 return onHand-reserved;
}
export function validateTransfer({quantity,available,fromWarehouse,toWarehouse}) {
 if (!Number.isFinite(quantity)||quantity<=0) throw new Error('Transfer quantity must be positive');
 if (quantity>available) throw new Error('Insufficient available stock');
 if (!fromWarehouse||!toWarehouse||fromWarehouse===toWarehouse) throw new Error('Distinct source and destination warehouses required');
 return true;
}
test('ledger-derived balance filters by stock identity',()=>{
 const rows=[{productId:'P',warehouseId:'W1',lotId:'L',direction:'in',quantity:10},{productId:'P',warehouseId:'W1',lotId:'L',direction:'out',quantity:3},{productId:'P',warehouseId:'W2',lotId:'L',direction:'in',quantity:8}];
 assert.equal(stockBalance(rows,{productId:'P',warehouseId:'W1',lotId:'L'}),7);
});
test('reservations reduce available stock and cannot exceed on-hand',()=>{
 assert.equal(availableStock(12,5),7);
 assert.throws(()=>availableStock(4,5));
});
test('transfers reject overselling and same-warehouse movement',()=>{
 assert.equal(validateTransfer({quantity:2,available:5,fromWarehouse:'W1',toWarehouse:'W2'}),true);
 assert.throws(()=>validateTransfer({quantity:6,available:5,fromWarehouse:'W1',toWarehouse:'W2'}));
 assert.throws(()=>validateTransfer({quantity:1,available:5,fromWarehouse:'W1',toWarehouse:'W1'}));
});