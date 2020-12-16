import formatMoney from '../lib/formatMoney'

describe('formatMoney Function', () => {
    it.skip('works with fraction dollars' , () => {
        expect(formatMoney(1)).toEqual('$0.01');
        expect(formatMoney(10)).toEqual('$0.10')
        expect(formatMoney(40)).toEqual('$0.40')
    });

    it.skip('leaves cents off for whole dollars', () => {
        expect(formatMoney(5000)).toEqual('$50');
        expect(formatMoney(100)).toEqual('$1');
        expect(formatMoney(50000000)).toEqual('$500,000');
      });
    
      it.skip('works with whole and fractional dollars', () => {
        expect(formatMoney(5012)).toEqual('$50.12');
        expect(formatMoney(101)).toEqual('$1.01');
        expect(formatMoney(110)).toEqual('$1.10');
        expect(formatMoney(20893749823749823749)).toEqual('$208,937,498,237,498,240.00');
      });
      
})