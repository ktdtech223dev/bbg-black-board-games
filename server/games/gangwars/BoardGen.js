const { buildHexLayout } = require('./Maps');

function generateProcedural(size, seed = 'default') {
  return buildHexLayout(size, [
    { type:'trap', weight:3 },{ type:'corner', weight:3 },{ type:'social', weight:2 },
    { type:'underground', weight:2 },{ type:'wild', weight:1 }
  ], [
    { name:'Block A', size:3, type:'trap' },
    { name:'Block B', size:3, type:'corner' },
    { name:'Block C', size:2, type:'social' },
  ]);
}

module.exports = { generateProcedural };
