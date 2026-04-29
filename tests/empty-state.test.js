const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('public/main.js', 'utf8');
const mappingMatch = source.match(/function renderMappingEmptyState[\s\S]*?\n}\n/);
const batchMatch = source.match(/function renderBatchEmptyState[\s\S]*?\n}\n/);

assert.ok(mappingMatch, 'renderMappingEmptyState helper should exist');
assert.ok(batchMatch, 'renderBatchEmptyState helper should exist');

const context = {};
vm.createContext(context);
vm.runInContext(`${mappingMatch[0]}; ${batchMatch[0]}; this.renderMappingEmptyState = renderMappingEmptyState; this.renderBatchEmptyState = renderBatchEmptyState;`, context);

const firstColumn = context.renderMappingEmptyState(0, 'Primitive', false, true);
assert.match(firstColumn, /暂无 Variable/);
assert.match(firstColumn, /openModal\(0\)/);
assert.doesNotMatch(firstColumn, /openImportModal\(\)/);
assert.doesNotMatch(firstColumn, /map-empty-copy/);

const aliasColumn = context.renderMappingEmptyState(1, 'Semantic', false, false);
assert.match(aliasColumn, /暂无 Variable/);
assert.match(aliasColumn, /openModal\(1\)/);
assert.doesNotMatch(aliasColumn, /openImportModal\(\)/);

const filteredEmpty = context.renderMappingEmptyState(2, 'Component', true, false);
assert.match(filteredEmpty, /筛选下暂无相关 Variable/);
assert.match(filteredEmpty, /clearFocusToken\(\)/);
assert.doesNotMatch(filteredEmpty, /openModal\(2\)/);
assert.doesNotMatch(filteredEmpty, /map-empty-copy/);

const batchEmpty = context.renderBatchEmptyState(1, 'Semantic');
assert.match(batchEmpty, /此 Collection 暂无 Variable/);
assert.match(batchEmpty, /添加 Variable/);
assert.match(batchEmpty, /openModal\(1\)/);
