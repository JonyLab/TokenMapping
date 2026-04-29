const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('public/main.js', 'utf8');
const match = source.match(/function renderMappingEmptyState[\s\S]*?\n}\n/);

assert.ok(match, 'renderMappingEmptyState helper should exist');

const context = {};
vm.createContext(context);
vm.runInContext(`${match[0]}; this.renderMappingEmptyState = renderMappingEmptyState;`, context);

const firstColumn = context.renderMappingEmptyState(0, 'Primitive', false, true);
assert.match(firstColumn, /暂无 Variable/);
assert.match(firstColumn, /从基础色开始/);
assert.match(firstColumn, /openModal\(0\)/);
assert.match(firstColumn, /openImportModal\(\)/);

const aliasColumn = context.renderMappingEmptyState(1, 'Semantic', false, false);
assert.match(aliasColumn, /添加或关联上游 Variable/);
assert.match(aliasColumn, /openModal\(1\)/);
assert.doesNotMatch(aliasColumn, /openImportModal\(\)/);

const filteredEmpty = context.renderMappingEmptyState(2, 'Component', true, false);
assert.match(filteredEmpty, /筛选下暂无相关 Variable/);
assert.match(filteredEmpty, /clearFocusToken\(\)/);
assert.doesNotMatch(filteredEmpty, /openModal\(2\)/);
