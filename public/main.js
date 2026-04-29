// ══════════════════════════════════════════════════════════════
//  SEED DATA (kept intact for migrateData)
// ══════════════════════════════════════════════════════════════
let primitives = [
  { id:'p1',  name:'blue-500',    color:'#3B82F6', group:'Blue'   },
  { id:'p2',  name:'blue-600',    color:'#1D4ED8', group:'Blue'   },
  { id:'p3',  name:'blue-100',    color:'#DBEAFE', group:'Blue'   },
  { id:'p4',  name:'white',       color:'#FFFFFF', group:'Base'   },
  { id:'p5',  name:'red-500',     color:'#EF4444', group:'Red'    },
  { id:'p6',  name:'red-50',      color:'#FEF2F2', group:'Red'    },
  { id:'p7',  name:'green-500',   color:'#22C55E', group:'Green'  },
  { id:'p8',  name:'green-50',    color:'#F0FDF4', group:'Green'  },
  { id:'p9',  name:'yellow-400',  color:'#FACC15', group:'Yellow' },
  { id:'p10', name:'yellow-50',   color:'#FEFCE8', group:'Yellow' },
  { id:'p11', name:'gray-900',    color:'#111827', group:'Gray'   },
  { id:'p12', name:'gray-500',    color:'#6B7280', group:'Gray'   },
  { id:'p13', name:'gray-300',    color:'#D1D5DB', group:'Gray'   },
  { id:'p14', name:'gray-100',    color:'#F3F4F6', group:'Gray'   },
];

let semantics = [
  { id:'s1',  name:'action.primary',        primId:'p1',  group:'Action'  },
  { id:'s2',  name:'action.primary-hover',  primId:'p2',  group:'Action'  },
  { id:'s3',  name:'action.primary-subtle', primId:'p3',  group:'Action'  },
  { id:'s4',  name:'action.fg',             primId:'p4',  group:'Action'  },
  { id:'s5',  name:'status.danger',         primId:'p5',  group:'Status'  },
  { id:'s6',  name:'status.danger-bg',      primId:'p6',  group:'Status'  },
  { id:'s7',  name:'status.success',        primId:'p7',  group:'Status'  },
  { id:'s8',  name:'status.success-bg',     primId:'p8',  group:'Status'  },
  { id:'s9',  name:'status.warning',        primId:'p9',  group:'Status'  },
  { id:'s10', name:'status.warning-bg',     primId:'p10', group:'Status'  },
  { id:'s11', name:'text.primary',          primId:'p11', group:'Text'    },
  { id:'s12', name:'text.secondary',        primId:'p12', group:'Text'    },
  { id:'s13', name:'border.default',        primId:'p13', group:'Border'  },
  { id:'s14', name:'bg.subtle',             primId:'p14', group:'Surface' },
];

let compGroups = [
  { id:'cg1', component:'Button', state:'primary · default', props:[
    { id:'cp1',  name:'bg',          semId:'s1'  },
    { id:'cp2',  name:'text',        semId:'s4'  },
    { id:'cp3',  name:'border',      semId:null  },
  ]},
  { id:'cg2', component:'Button', state:'primary · hover', props:[
    { id:'cp4',  name:'bg',          semId:'s2'  },
    { id:'cp5',  name:'text',        semId:'s4'  },
  ]},
  { id:'cg3', component:'Button', state:'ghost · default', props:[
    { id:'cp6',  name:'bg',          semId:null  },
    { id:'cp7',  name:'text',        semId:'s11' },
    { id:'cp8',  name:'border',      semId:'s13' },
  ]},
  { id:'cg4', component:'Input', state:'default', props:[
    { id:'cp9',  name:'bg',          semId:'s14' },
    { id:'cp10', name:'border',      semId:'s13' },
    { id:'cp11', name:'text',        semId:'s11' },
    { id:'cp12', name:'placeholder', semId:'s12' },
  ]},
  { id:'cg5', component:'Input', state:'focus', props:[
    { id:'cp13', name:'border',      semId:'s1'  },
  ]},
  { id:'cg6', component:'Input', state:'error', props:[
    { id:'cp14', name:'border',      semId:'s5'  },
    { id:'cp15', name:'text',        semId:'s5'  },
  ]},
  { id:'cg7', component:'Badge', state:'info', props:[
    { id:'cp16', name:'bg',          semId:'s3'  },
    { id:'cp17', name:'text',        semId:'s1'  },
  ]},
  { id:'cg8', component:'Badge', state:'danger', props:[
    { id:'cp18', name:'bg',          semId:'s6'  },
    { id:'cp19', name:'text',        semId:'s5'  },
  ]},
  { id:'cg9', component:'Badge', state:'success', props:[
    { id:'cp20', name:'bg',          semId:'s8'  },
    { id:'cp21', name:'text',        semId:'s7'  },
  ]},
  { id:'cg10', component:'Badge', state:'warning', props:[
    { id:'cp22', name:'bg',          semId:'s10' },
    { id:'cp23', name:'text',        semId:'s9'  },
  ]},
];

// ══════════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════════
let levels = [
  { id: 'L0', name: 'Primitive' },
  { id: 'L1', name: 'Semantic' },
  { id: 'L2', name: 'Component' },
];
let tokens = [[], [], []];
let collapsedGroups = [new Set(), new Set(), new Set()];
let renderedLevelCount = 0;
let focusToken = null; // { levelIdx, id, name }

let idSeq = 200;
function uid(prefix) { return prefix + (++idSeq); }

// ══════════════════════════════════════════════════════════════
//  GROUPING / RENDER HELPERS
// ══════════════════════════════════════════════════════════════
function groupTokens(arr) {
  const map = new Map();
  for (const t of arr) {
    const g = t.group || '未分组';
    if (!map.has(g)) map.set(g, []);
    map.get(g).push(t);
  }
  return map;
}

function toggleGroup(li, group) {
  const set = collapsedGroups[li];
  set.has(group) ? set.delete(group) : set.add(group);
  render();
}

function renderGroupedList(tokArr, li, renderItem) {
  const groups = groupTokens(tokArr);
  let html = '';
  for (const [name, items] of groups) {
    const closed = collapsedGroups[li] && collapsedGroups[li].has(name);
    html += `<div class="tok-group">
      <div class="tg-head" onclick="toggleGroup(${li},'${name.replace(/'/g,"\\'")}')">
        <svg class="tg-chev${closed ? ' closed' : ''}" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8">
          <polyline points="2,4 6,8 10,4"/>
        </svg>
        <span class="tg-name">${name}</span>
        <span class="tg-count">${items.length}</span>
      </div>
      <div class="tg-body${closed ? ' closed' : ''}">
        ${items.map(renderItem).join('')}
      </div>
    </div>`;
  }
  return html;
}

function renderMappingEmptyState(li, levelName, isFiltered, isProjectEmpty) {
  if (isFiltered) {
    return `<div class="map-empty">
      <div class="map-empty-icon">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/>
        </svg>
      </div>
      <div class="map-empty-title">筛选下暂无相关 Variable</div>
      <div class="map-empty-copy">当前 Token 在 ${levelName} 中还没有关联项。</div>
      <button class="map-empty-btn" onclick="clearFocusToken()">退出筛选</button>
    </div>`;
  }

  const guide = li === 0
    ? '从基础色开始，添加第一个 Primitive Variable。'
    : '添加或关联上游 Variable，继续搭建这一层映射。';
  const importAction = isProjectEmpty
    ? `<button class="map-empty-link" onclick="openImportModal()">导入一批 Token</button>`
    : '';

  return `<div class="map-empty">
    <div class="map-empty-icon">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M8 2v12"/><path d="M2 8h12"/>
      </svg>
    </div>
    <div class="map-empty-title">暂无 Variable</div>
    <div class="map-empty-copy">${guide}</div>
    <div class="map-empty-actions">
      <button class="map-empty-btn primary" onclick="openModal(${li})">添加 Variable</button>
      ${importAction}
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════
//  TOKEN LOOKUP UTILITIES
// ══════════════════════════════════════════════════════════════
function getTokenById(id) {
  for (const arr of tokens) {
    const t = arr.find(t => t.id === id);
    if (t) return t;
  }
  return null;
}

function getTokenLevelIdx(id) {
  for (let li = 0; li < tokens.length; li++) {
    if (tokens[li].find(t => t.id === id)) return li;
  }
  return -1;
}

function resolveColor(tok) {
  if (!tok) return null;
  if (tok.color) return tok.color;
  if (tok.parentId) return resolveColor(getTokenById(tok.parentId));
  return null;
}

function isLight(hex) {
  if (!hex || hex.length < 7) return false;
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return (r*299 + g*587 + b*114) / 1000 > 200;
}

function isValidHex(v) { return /^#[0-9A-Fa-f]{6}$/.test(v); }

// ══════════════════════════════════════════════════════════════
//  MIGRATION FROM SEED DATA
// ══════════════════════════════════════════════════════════════
function migrateData() {
  tokens[0] = primitives.map(p => ({
    id: p.id, name: p.name, group: p.group || 'Default', color: p.color, parentId: null
  }));
  tokens[1] = semantics.map(s => ({
    id: s.id, name: s.name, group: s.group || 'Default', color: s.color || null, parentId: s.primId || null
  }));
  tokens[2] = [];
  for (const cg of compGroups) {
    const flatGroup = `${cg.component} · ${cg.state}`;
    for (const prop of cg.props) {
      tokens[2].push({
        id: prop.id, name: prop.name, group: flatGroup,
        color: prop.color || null, parentId: prop.semId || prop.primId || null
      });
    }
  }
}

// ══════════════════════════════════════════════════════════════
//  COLUMN / TOOLBAR BUILDERS
// ══════════════════════════════════════════════════════════════
function buildColumnsHTML() {
  const container = document.getElementById('columns-container');
  if (!container) return;
  cancelDraw();
  document.getElementById('layout').style.gridTemplateColumns =
    `repeat(${levels.length}, 1fr) auto`;
  container.innerHTML = levels.map((lev, li) =>
    `<div class="col col-level" id="col-level-${li}">
      <div class="col-inner">
        <div class="col-head" oncontextmenu="levelCtx(event,${li})">
          <button class="col-head-opts" onclick="levelCtx(event,${li})" title="Collection 选项">
            <svg viewBox="0 0 16 16" fill="currentColor" stroke="none"><circle cx="3.5" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="12.5" cy="8" r="1.3"/></svg>
          </button>
          <span class="col-head-label" ondblclick="renameLevel(${li})" style="cursor:default;user-select:none" title="双击重命名">
            <span class="col-head-name">${lev.name}</span>
            <span class="col-head-count" id="col-count-${li}">0</span>
          </span>
          <button class="col-head-add" onclick="openModal(${li})" title="添加 Variable">＋</button>
        </div>
        <div id="level-list-${li}"></div>
      </div>
    </div>`
  ).join('')
  + `<div class="col-add-slot">
       <button class="btn-add-level-canvas" onclick="addLevel()" title="新建 Collection">＋</button>
     </div>`;
  renderedLevelCount = levels.length;
}

function buildToolbar() {
  const plusSvg = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" style="width:14px;height:14px;flex-shrink:0"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>`;
  const el = document.getElementById('tb-add-buttons');
  if (el) el.innerHTML = levels.map((lev, li) =>
    `<button class="btn" onclick="openModal(${li})" style="display:flex;align-items:center;gap:6px">${plusSvg} ${lev.name}</button>`
  ).join('');
}

function ensureColumnsBuilt() {
  if (renderedLevelCount !== levels.length) {
    buildColumnsHTML();
  }
}

// ══════════════════════════════════════════════════════════════
//  RENDER
// ══════════════════════════════════════════════════════════════
function render() {
  ensureColumnsBuilt();
  for (let li = 0; li < levels.length; li++) renderLevel(li);
  requestAnimationFrame(() => {
    updateSVGSize();
    drawLines();
    updateStats();
  });
  scheduleSave();
}

function renderLevel(li) {
  const listEl = document.getElementById(`level-list-${li}`);
  if (!listEl) return;
  const isFirst = li === 0;
  const isLast  = li === levels.length - 1;
  const _related = getRelatedIds();
  const visibleTokens = _related
    ? tokens[li].filter(t => _related.sets[li] && _related.sets[li].has(t.id))
    : tokens[li];
  if (!visibleTokens.length) {
    const isProjectEmpty = tokens.every(arr => !arr.length);
    listEl.innerHTML = renderMappingEmptyState(li, levels[li]?.name || 'Collection', !!_related, isProjectEmpty);
    return;
  }
  listEl.innerHTML = renderGroupedList(visibleTokens, li, tok => renderTokenCard(tok, li, isFirst, isLast));
}

function renderTokenCard(tok, li, isFirst, isLast) {
  const resolvedColor = resolveColor(tok);
  const hasColor = !!resolvedColor;
  const swColor  = resolvedColor || 'transparent';
  const swLight  = hasColor && isLight(resolvedColor);
  // Warning: last column token has no parentId (hardcoded color or no color at all)
  const warn = isLast && !tok.parentId;
  const warnTitle = !hasColor ? '未设置色值' : '直接使用色值，建议关联 Variable';
  return `
  <div class="token${warn ? ' token-warn' : ''}" id="tok-${tok.id}" data-id="${tok.id}" data-li="${li}"
       oncontextmenu="tokenCtx(event,${li},'${tok.id}')"
       onmouseenter="highlightByToken('${tok.id}')" onmouseleave="clearHighlight()"
       onclick="${isFirst ? `editTokenColor(event,'${tok.id}')` : `openPickerForToken(event,'${tok.id}',${li})`}">
    ${!isFirst ? `<div class="port port-l" id="portl-${tok.id}" onmouseup="endDraw(event,'${tok.id}')"></div>` : ''}
    <div class="swatch${swLight ? ' light' : ''}${!hasColor ? ' swatch-none' : ''}"
         style="background:${swColor};border-color:rgba(0,0,0,${swLight ? '0.08' : '0.12'})"></div>
    <span class="tok-name">${tok.name}${warn ? `<span class="tok-warn-icon" title="${warnTitle}"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2L14 13H2L8 2z"/><line x1="8" y1="7" x2="8" y2="10"/><circle cx="8" cy="12" r="0.5" fill="currentColor" stroke="none"/></svg></span>` : ''}</span>
    ${hasColor ? `<span class="tok-hex">${resolvedColor.toUpperCase()}</span>` : ''}
    ${!isLast ? `<div class="port port-r" id="portr-${tok.id}" onmousedown="startDraw(event,'${tok.id}')" title="拖拽以连线"></div>` : ''}
  </div>`;
}

// ══════════════════════════════════════════════════════════════
//  SVG LINES
// ══════════════════════════════════════════════════════════════
function getPos(el) {
  if (!el) return null;
  const elR = el.getBoundingClientRect();
  if (!elR.width && !elR.height) return null;
  const lR  = document.getElementById('layout').getBoundingClientRect();
  return {
    x: elR.left + elR.width/2 - lR.left,
    y: elR.top  + elR.height/2 - lR.top
  };
}

function bezier(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1) * 0.5;
  return `M${x1},${y1} C${x1+dx},${y1} ${x2-dx},${y2} ${x2},${y2}`;
}

function updateSVGSize() {
  const layout = document.getElementById('layout');
  const svg = document.getElementById('lines');
  svg.setAttribute('height', layout.offsetHeight);
}

function drawLines() {
  const svg = document.getElementById('lines');
  svg.querySelectorAll('.line-conn').forEach(el => el.remove());
  for (let li = 1; li < levels.length; li++) {
    tokens[li].forEach(tok => {
      if (!tok.parentId) return;
      const fromEl = document.getElementById(`portr-${tok.parentId}`);
      const toEl   = document.getElementById(`portl-${tok.id}`);
      if (!fromEl || !toEl) return;
      const from = getPos(fromEl), to = getPos(toEl);
      if (!from || !to) return;
      const color = resolveColor(tok);
      const strokeColor = (color && !isLight(color)) ? color : '#94A3B8';
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', bezier(from.x, from.y, to.x, to.y));
      path.setAttribute('class', 'line-conn');
      path.setAttribute('stroke', strokeColor);
      path.setAttribute('data-from', tok.parentId);
      path.setAttribute('data-to', tok.id);
      path.addEventListener('contextmenu', e => { e.preventDefault(); connCtx(e, tok.id); });
      path.addEventListener('mouseenter', () => highlightConn(tok.parentId, tok.id));
      path.addEventListener('mouseleave', () => clearHighlight());
      svg.appendChild(path);
    });
  }
}

// ══════════════════════════════════════════════════════════════
//  HIGHLIGHT
// ══════════════════════════════════════════════════════════════
function highlightByToken(id) {
  document.querySelectorAll('.line-conn').forEach(el => {
    const match = el.getAttribute('data-from') === id || el.getAttribute('data-to') === id;
    el.classList.toggle('faded', !match);
    el.classList.toggle('highlighted', match);
  });
  document.querySelectorAll('.active-conn').forEach(el => el.classList.remove('active-conn'));
  document.getElementById(`tok-${id}`)?.classList.add('active-conn');
  document.querySelectorAll('.line-conn.highlighted').forEach(el => {
    document.getElementById(`tok-${el.getAttribute('data-from')}`)?.classList.add('active-conn');
    document.getElementById(`tok-${el.getAttribute('data-to')}`)?.classList.add('active-conn');
  });
}

function highlightConn(fromId, toId) {
  document.querySelectorAll('.line-conn').forEach(el => {
    const match = el.getAttribute('data-from') === fromId && el.getAttribute('data-to') === toId;
    el.classList.toggle('faded', !match);
    el.classList.toggle('highlighted', match);
  });
  document.querySelectorAll('.active-conn').forEach(el => el.classList.remove('active-conn'));
  document.getElementById(`tok-${fromId}`)?.classList.add('active-conn');
  document.getElementById(`tok-${toId}`)?.classList.add('active-conn');
}

function clearHighlight() {
  document.querySelectorAll('.line-conn').forEach(el => el.classList.remove('faded', 'highlighted'));
  document.querySelectorAll('.active-conn').forEach(el => el.classList.remove('active-conn'));
}

// ══════════════════════════════════════════════════════════════
//  FOCUS MODE
// ══════════════════════════════════════════════════════════════
function getRelatedIds() {
  if (!focusToken) return null;
  const { levelIdx, id } = focusToken;
  const sets = levels.map(() => new Set());
  sets[levelIdx].add(id);
  const allKnown = new Set([id]);

  // Upstream
  for (let li = levelIdx; li >= 1; li--) {
    tokens[li].forEach(t => {
      if (allKnown.has(t.id) && t.parentId) {
        const pli = getTokenLevelIdx(t.parentId);
        if (pli >= 0 && pli < li) {
          sets[pli].add(t.parentId);
          allKnown.add(t.parentId);
        }
      }
    });
  }
  // Downstream
  for (let li = levelIdx + 1; li < levels.length; li++) {
    tokens[li].forEach(t => {
      if (!t.parentId) return;
      const pli = getTokenLevelIdx(t.parentId);
      if (pli >= 0 && sets[pli] && sets[pli].has(t.parentId)) {
        sets[li].add(t.id);
        allKnown.add(t.id);
      }
    });
  }
  return { sets };
}

function setFocusToken(levelIdx, id, name) {
  focusToken = { levelIdx, id, name };
  document.getElementById('fb-token-name').textContent = name;
  document.getElementById('focus-banner').classList.add('active');
  closeCMenu();
  render();
}

function clearFocusToken() {
  focusToken = null;
  document.getElementById('focus-banner').classList.remove('active');
  render();
}

// ══════════════════════════════════════════════════════════════
//  DRAWING INTERACTION
// ══════════════════════════════════════════════════════════════
let drawState = { active: false, fromId: null };
let previewPath = null;

function startDraw(e, tokenId) {
  e.preventDefault(); e.stopPropagation();
  const portEl = document.getElementById(`portr-${tokenId}`);
  if (portEl) portEl.classList.add('drawing');
  drawState = { active: true, fromId: tokenId };
  document.body.classList.add('drawing-mode');
  const svg = document.getElementById('lines');
  let prev = document.getElementById('line-preview');
  if (!prev) {
    prev = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    prev.id = 'line-preview';
    prev.setAttribute('class', 'line-preview');
    svg.appendChild(prev);
  }
  previewPath = prev;
}

document.addEventListener('mousemove', e => {
  if (!drawState.active || !previewPath) return;
  const lR = document.getElementById('layout').getBoundingClientRect();
  const mx = e.clientX - lR.left;
  const my = e.clientY - lR.top;
  const fromEl = document.getElementById(`portr-${drawState.fromId}`);
  if (!fromEl) return;
  const from = getPos(fromEl);
  if (!from) return;
  previewPath.setAttribute('d', bezier(from.x, from.y, mx, my));
});

document.addEventListener('mouseup', e => {
  if (!drawState.active) return;
  if (!e.target.closest('.port-l')) cancelDraw();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (focusToken) { clearFocusToken(); e.stopPropagation(); return; }
    cancelDraw(); closeCMenu(); closeModal(); closePicker();
  }
});

function cancelDraw() {
  drawState.active = false;
  drawState.fromId = null;
  document.body.classList.remove('drawing-mode');
  document.querySelectorAll('.port.drawing').forEach(p => p.classList.remove('drawing'));
  if (previewPath) { previewPath.remove(); previewPath = null; }
}

function endDraw(e, targetId) {
  if (!drawState.active) return;
  e.stopPropagation();
  const fromId = drawState.fromId;
  cancelDraw();
  if (!fromId || fromId === targetId) return;
  const fromLi   = getTokenLevelIdx(fromId);
  const targetLi = getTokenLevelIdx(targetId);
  if (fromLi < 0 || targetLi <= fromLi) { toast('只能向下级连线'); return; }
  const target = getTokenById(targetId);
  if (!target) return;
  if (target.parentId === fromId) { toast('已连接'); return; }
  target.parentId = fromId;
  target.color = null;
  render();
  const src = getTokenById(fromId);
  toast(`${src?.name || fromId} → ${target.name} 已连接`);
}

// ══════════════════════════════════════════════════════════════
//  CONTEXT MENU
// ══════════════════════════════════════════════════════════════
function showCMenu(e) {
  const m = document.getElementById('cmenu');
  m.style.left = e.clientX + 'px';
  m.style.top  = e.clientY + 'px';
  m.classList.add('open');
}

function closeCMenu() { document.getElementById('cmenu').classList.remove('open'); }
document.addEventListener('click', e => { if (!e.target.closest('.cmenu')) closeCMenu(); });
document.addEventListener('click', e => {
  if (!e.target.closest('#tp-token-dd') && !e.target.closest('#tp-token-dd-btn') && !e.target.closest('#tp-linked-name')) {
    document.getElementById('tp-token-dd')?.classList.remove('open');
  }
});

function resetCMenuItems() {
  ['cmenu-focus','cmenu-focus-sep','cmenu-color','cmenu-color-sep','cmenu-detach','cmenu-detach-sep'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function tokenCtx(e, li, id) {
  e.preventDefault();
  resetCMenuItems();
  const tok = getTokenById(id);
  const focusEl = document.getElementById('cmenu-focus');
  const focusSep = document.getElementById('cmenu-focus-sep');
  if (focusEl) { focusEl.style.display = 'flex'; focusEl.onclick = () => setFocusToken(li, id, tok?.name || id); }
  if (focusSep) focusSep.style.display = 'block';
  const delEl = document.getElementById('cmenu-del');
  if (delEl) { delEl.textContent = `删除 ${levels[li]?.name || 'Token'}`; delEl.onclick = () => { deleteToken(li, id); closeCMenu(); }; }
  showCMenu(e);
}

function connCtx(e, childId) {
  resetCMenuItems();
  const detEl = document.getElementById('cmenu-detach');
  const detSep = document.getElementById('cmenu-detach-sep');
  if (detEl) { detEl.style.display = 'flex'; detEl.textContent = '断开连线'; detEl.onclick = () => { disconnectToken(childId); closeCMenu(); }; }
  if (detSep) detSep.style.display = 'block';
  const delEl = document.getElementById('cmenu-del');
  if (delEl) { delEl.style.display = 'none'; }
  showCMenu(e);
}

function levelCtx(e, li) {
  e.preventDefault();
  e.stopPropagation();
  resetCMenuItems();
  const detEl = document.getElementById('cmenu-detach');
  const detSep = document.getElementById('cmenu-detach-sep');
  if (detEl) {
    detEl.style.display = 'flex';
    detEl.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 2H5a1 1 0 00-1 1v10a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1z"/><line x1="8" y1="5" x2="8" y2="9"/><line x1="6" y1="7" x2="10" y2="7"/></svg> 重命名 Collection`;
    detEl.onclick = () => { renameLevel(li); closeCMenu(); };
  }
  if (detSep) detSep.style.display = 'block';
  const delEl = document.getElementById('cmenu-del');
  if (delEl) { delEl.textContent = `删除 Collection "${levels[li]?.name}"`; delEl.onclick = () => { deleteLevel(li); closeCMenu(); }; }
  showCMenu(e);
}

// ══════════════════════════════════════════════════════════════
//  CRUD OPERATIONS
// ══════════════════════════════════════════════════════════════
function disconnectToken(id) {
  const tok = getTokenById(id);
  if (!tok) return;
  tok.color = resolveColor(tok);
  tok.parentId = null;
  render();
  toast('连线已断开，颜色已继承');
}

function deleteToken(li, id) {
  for (let i = li + 1; i < levels.length; i++) {
    tokens[i].forEach(t => {
      if (t.parentId === id) { t.color = resolveColor(t); t.parentId = null; }
    });
  }
  tokens[li] = tokens[li].filter(t => t.id !== id);
  render();
  toast(`${levels[li]?.name || 'Token'} 已删除`);
}

let _levelModalCallback = null;

function openLevelModal(title, defaultValue, onConfirm) {
  _levelModalCallback = onConfirm;
  document.getElementById('level-modal-h').textContent = title;
  const inp = document.getElementById('level-modal-input');
  inp.value = defaultValue;
  document.getElementById('level-modal-bg').classList.add('open');
  requestAnimationFrame(() => { inp.focus(); inp.select(); });
}

function closeLevelModal() {
  document.getElementById('level-modal-bg').classList.remove('open');
  _levelModalCallback = null;
}

function submitLevelModal() {
  const name = document.getElementById('level-modal-input').value.trim();
  if (!name) return;
  const cb = _levelModalCallback;
  closeLevelModal();
  if (cb) cb(name);
}

document.getElementById('level-modal-bg').addEventListener('click', e => {
  if (e.target === document.getElementById('level-modal-bg')) closeLevelModal();
});

document.getElementById('level-modal-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') submitLevelModal();
  if (e.key === 'Escape') closeLevelModal();
});

function addLevel() {
  openLevelModal('新建 Collection', `Collection ${levels.length + 1}`, name => {
    levels.push({ id: `L${levels.length}`, name });
    tokens.push([]);
    collapsedGroups.push(new Set());
    renderedLevelCount = 0;
    render();
    scheduleSave();
  });
}

function renameLevel(li) {
  openLevelModal('重命名 Collection', levels[li]?.name || '', name => {
    if (name === levels[li].name) return;
    levels[li].name = name;
    const nameEl = document.querySelector(`#col-level-${li} .col-head-name`);
    if (nameEl) nameEl.textContent = name;
    const addBtn = document.querySelector(`#col-level-${li} .col-head-add`);
    if (addBtn) addBtn.title = `添加 ${name} Variable`;
    render();
    scheduleSave();
  });
}

function deleteLevel(li) {
  if (li === 0 && levels.length <= 1) { toast('至少保留一个 Collection'); return; }
  if (tokens[li] && tokens[li].length > 0) {
    if (!confirm(`Collection "${levels[li].name}" 有 ${tokens[li].length} 个 Variable，确认删除？`)) return;
  }
  const deletedIds = new Set((tokens[li] || []).map(t => t.id));
  for (let i = li + 1; i < levels.length; i++) {
    tokens[i].forEach(t => {
      if (deletedIds.has(t.parentId)) { t.color = resolveColor(t); t.parentId = null; }
    });
  }
  levels.splice(li, 1);
  tokens.splice(li, 1);
  collapsedGroups.splice(li, 1);
  renderedLevelCount = 0;
  render();
  scheduleSave();
  toast('Collection 已删除');
}

// ══════════════════════════════════════════════════════════════
//  MODAL
// ══════════════════════════════════════════════════════════════
let modalLevelIdx = null;

function openModal(li) {
  modalLevelIdx = li;
  const lev = levels[li];
  const isFirst = li === 0;
  document.getElementById('modal-h').textContent = `添加 Variable · ${lev.name}`;

  const existingGroups = [...new Set(tokens[li].map(t => t.group).filter(Boolean))];

  let body = `<div class="field"><label>名称</label><input class="fi" id="mi-name" placeholder="group.token-name" autocomplete="off"></div>`;

  if (isFirst) {
    body += `<div class="field"><label>颜色</label><div style="display:flex;gap:8px;align-items:center"><input type="color" id="mi-cpick" value="#6366F1"><div style="position:relative;flex:1;min-width:0"><input class="fi" id="mi-color" placeholder="#6366F1" style="width:100%;box-sizing:border-box"><div class="cpop-group-dd" id="mi-color-dd"></div></div></div></div>`;
  } else {
    let opts = `<option value="">— 直接填色值 —</option>`;
    for (let pli = 0; pli < li; pli++) {
      opts += `<optgroup label="${levels[pli].name}">` + tokens[pli].map(t => `<option value="${t.id}">${t.name}</option>`).join('') + `</optgroup>`;
    }
    body += `<div class="field"><label>引用 Variable（可选）</label><select class="fi" id="mi-parent" onchange="toggleModalColor()">${opts}</select></div>`;
    body += `<div class="field" id="mi-color-field"><label>颜色</label><div style="display:flex;gap:8px;align-items:center"><input type="color" id="mi-cpick" value="#6366F1"><div style="position:relative;flex:1;min-width:0"><input class="fi" id="mi-color" placeholder="#6366F1" style="width:100%;box-sizing:border-box"><div class="cpop-group-dd" id="mi-color-dd"></div></div></div></div>`;
  }

  document.getElementById('modal-body').innerHTML = body;

  document.getElementById('mi-cpick')?.addEventListener('input', e => { document.getElementById('mi-color').value = e.target.value; });
  document.getElementById('mi-color')?.addEventListener('input', e => { if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) document.getElementById('mi-cpick').value = e.target.value; });
  if (!isFirst) toggleModalColor();

  // Color dropdown for mi-color
  const miColorInput = document.getElementById('mi-color');
  const miColorDd = document.getElementById('mi-color-dd');
  const miColorCandidates = (tokens[isFirst ? 0 : Math.max(0, li - 1)] || []).filter(t => t.color).map(t => ({ name: t.name, color: t.color }));
  function renderMiColorDd(filter) {
    const matches = filter
      ? miColorCandidates.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()) || t.color.toLowerCase().includes(filter.toLowerCase()))
      : miColorCandidates;
    if (!matches.length) { miColorDd.classList.remove('open'); return; }
    miColorDd.innerHTML = matches.map(t =>
      `<div class="color-dd-item" onmousedown="event.preventDefault();document.getElementById('mi-color').value='${t.color}';document.getElementById('mi-cpick').value='${t.color}';document.getElementById('mi-color-dd').classList.remove('open')">
        <div class="color-dd-swatch" style="background:${t.color}"></div>
        <span class="color-dd-name">${t.name}</span>
        <span class="color-dd-hex">${t.color.toUpperCase()}</span>
      </div>`
    ).join('');
    miColorDd.classList.add('open');
  }
  if (miColorInput && miColorDd) {
    miColorInput.addEventListener('focus', () => renderMiColorDd(''));
    miColorInput.addEventListener('input', e => renderMiColorDd(e.target.value));
    miColorInput.addEventListener('blur', () => miColorDd.classList.remove('open'));
    miColorInput.addEventListener('keydown', e => { if (e.key === 'Escape' || e.key === 'Enter') miColorDd.classList.remove('open'); });
  }

  document.getElementById('modal-bg').classList.add('open');
  setTimeout(() => document.getElementById('mi-name')?.focus(), 150);
}

function toggleModalColor() {
  const parentSel = document.getElementById('mi-parent');
  const colorField = document.getElementById('mi-color-field');
  if (parentSel && colorField) colorField.style.display = parentSel.value ? 'none' : 'block';
}

function closeModal() { document.getElementById('modal-bg').classList.remove('open'); }
document.getElementById('modal-bg').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-bg')) closeModal();
});
document.getElementById('modal-bg').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) submitModal();
});

function submitModal() {
  if (modalLevelIdx === null) return;
  const li = modalLevelIdx;
  const fullName = document.getElementById('mi-name')?.value.trim();
  if (!fullName) return;
  let tokenName, tokenGroup;
  const lastDot = fullName.lastIndexOf('.');
  if (lastDot > 0) {
    tokenGroup = fullName.substring(0, lastDot);
    tokenName  = fullName.substring(lastDot + 1);
  } else {
    tokenGroup = levels[li]?.name || '';
    tokenName  = fullName;
  }
  const isFirst = li === 0;
  let parentId = null, color = null;
  if (isFirst) {
    color = document.getElementById('mi-color')?.value.trim() || document.getElementById('mi-cpick')?.value || '#6B7280';
  } else {
    parentId = document.getElementById('mi-parent')?.value || null;
    if (!parentId) color = document.getElementById('mi-color')?.value.trim() || document.getElementById('mi-cpick')?.value || null;
  }
  const prefix = (levels[li]?.id || `l${li}`).toLowerCase();
  tokens[li].push({ id: uid(prefix), name: tokenName, group: tokenGroup, color, parentId });
  closeModal();
  render();
  if (document.getElementById('be-overlay')?.classList.contains('open')) {
    if (li === batchEditorLevelIdx) renderBatchEditor();
    else { batchEditorLevelIdx = li; renderBatchEditor(); }
  }
  toast(`${levels[li].name} Token 已添加`);
}

// ══════════════════════════════════════════════════════════════
//  IMPORT
// ══════════════════════════════════════════════════════════════

function openImportModal() {
  document.getElementById('import-textarea').value = '';
  document.getElementById('import-preview').innerHTML = '';
  document.getElementById('import-modal-bg').classList.add('open');
  setTimeout(() => document.getElementById('import-textarea').focus(), 150);
}

function closeImportModal() {
  document.getElementById('import-modal-bg').classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('import-modal-bg').addEventListener('click', e => {
    if (e.target === document.getElementById('import-modal-bg')) closeImportModal();
  });
  document.getElementById('import-textarea').addEventListener('input', updateImportPreview);
});

// ── helpers ──────────────────────────────────────────────────
// Convert Figma API rgba float (0-1) → #RRGGBB
function figmaColorToHex(c) {
  const r = Math.round((c.r || 0) * 255).toString(16).padStart(2, '0');
  const g = Math.round((c.g || 0) * 255).toString(16).padStart(2, '0');
  const b = Math.round((c.b || 0) * 255).toString(16).padStart(2, '0');
  return '#' + r + g + b;
}

// Extract group from slash-prefixed name: "Blue/blue-500" → { group:"Blue", name:"blue-500" }
function splitSlashName(raw) {
  const parts = raw.split('/');
  const name  = parts.pop().trim();
  const group = parts.length ? parts.join('/').trim() : null;
  return { name, group };
}

// Is this a leaf token object? ({ value/.$value } or { $value })
function isLeafToken(obj) {
  return obj && typeof obj === 'object' && ('value' in obj || '$value' in obj);
}

// Flatten nested Token Studio object into our flat format
// e.g. { "Blue": { "blue-500": { "value": "#3B82F6", "type": "color" } } }
function flattenNestedTokens(obj, prefix, level) {
  const results = [];
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue; // skip $type/$extensions at group level
    if (!val || typeof val !== 'object') continue;
    const path = prefix ? `${prefix}/${key}` : key;
    if (isLeafToken(val)) {
      const raw   = val['$value'] ?? val['value'] ?? null;
      const value = raw != null ? String(raw).trim() : null;
      // Unwrap {ref} syntax → just the ref name (strip braces, use last segment)
      const resolvedValue = value && /^\{[^}]+\}$/.test(value)
        ? value.slice(1, -1).split('.').pop()   // {Primitive.Blue.blue-500} → blue-500
        : value;
      const { name, group } = splitSlashName(path);
      results.push({ level: level || null, name, group, value: resolvedValue });
    } else {
      results.push(...flattenNestedTokens(val, path, level));
    }
  }
  return results;
}

// ── main parser ───────────────────────────────────────────────
// Parse import text → array of { level, name, value, group }
// value is either '#hex' or a reference to another token name
function parseImportData(text) {
  text = text.trim();

  // ① JSON array  [{ level, name, value, group }, ...]  — our own format
  if (text.startsWith('[')) {
    try {
      const arr = JSON.parse(text);
      const items = arr.filter(i => i && i.name).map(i => {
        const raw = i.value != null ? String(i.value).trim() : (i.color || null);
        const { name, group } = i.name.includes('/')
          ? splitSlashName(String(i.name).trim())
          : { name: String(i.name).trim(), group: null };
        return {
          level: i.level ? String(i.level).trim() : null,
          name,
          value: raw,
          group: i.group ? String(i.group).trim() : group,
        };
      });
      if (items.length) return items;
    } catch (e) {}
  }

  if (text.startsWith('{')) {
    try {
      const obj = JSON.parse(text);

      // ② Figma Variables REST API format  { meta: { variables: { ... } } }
      if (obj.meta?.variables) {
        const vars = Object.values(obj.meta.variables);
        const items = vars
          .filter(v => v.resolvedType === 'COLOR' && v.valuesByMode)
          .map(v => {
            const { name, group } = splitSlashName(v.name);
            const modeVal = Object.values(v.valuesByMode)[0];
            const value = modeVal && typeof modeVal === 'object' && 'r' in modeVal
              ? figmaColorToHex(modeVal)
              : (typeof modeVal === 'string' ? modeVal : null);
            return { level: null, name, group, value };
          });
        if (items.length) return items;
      }

      // ③ Token Studio / W3C DTCG nested object
      //    Top-level keys that are plain objects (not $xxx) are treated as levels or groups.
      //    Heuristic: if ALL top-level object values contain only leaf tokens → flat (no level).
      //    If top-level values contain sub-objects with leaf tokens → top key = level.
      const topKeys = Object.keys(obj).filter(k => !k.startsWith('$'));
      if (topKeys.length) {
        // Check whether top-level keys look like level names (all children are group→leaf)
        const topValsAreGroups = topKeys.every(k => {
          const v = obj[k];
          return v && typeof v === 'object' && !isLeafToken(v);
        });

        if (topValsAreGroups) {
          // top key = level, children are groups/tokens
          const items = [];
          for (const lvName of topKeys) {
            items.push(...flattenNestedTokens(obj[lvName], '', lvName));
          }
          if (items.length) return items;
        } else {
          // flat: top key = group or first path segment
          const items = flattenNestedTokens(obj, '', null);
          if (items.length) return items;
        }
      }
    } catch (e) {}
  }

  // ④ CSS custom properties: --name: value;
  const cssMatches = [...text.matchAll(/--([^:;\s]+)\s*:\s*([^;]+);?/g)];
  if (cssMatches.length) {
    return cssMatches.map(m => {
      const { name, group } = splitSlashName(m[1].trim());
      return { level: null, name, group, value: m[2].trim() };
    });
  }
  return null;
}

// Summarize parsed items by level for preview
function summarizeImport(items) {
  // Collect level names in order of first appearance
  const levelOrder = [];
  const levelCounts = {};
  items.forEach(item => {
    const lv = item.level || '(第一个层级)';
    if (!levelCounts[lv]) { levelOrder.push(lv); levelCounts[lv] = 0; }
    levelCounts[lv]++;
  });
  return { levelOrder, levelCounts };
}

function updateImportPreview() {
  const text = document.getElementById('import-textarea').value;
  const el = document.getElementById('import-preview');
  if (!text.trim()) { el.innerHTML = ''; return; }
  const items = parseImportData(text);
  if (!items || !items.length) {
    el.innerHTML = `<span style="color:#DC2626">未识别到有效数据</span>`;
    return;
  }
  const { levelOrder, levelCounts } = summarizeImport(items);
  const refs  = items.filter(i => i.value && !/^#[0-9A-Fa-f]{3,8}$/.test(i.value)).length;
  const parts = levelOrder.map(lv => `<b>${lv}</b> ${levelCounts[lv]} 个`);
  const refTip = refs ? `，其中 ${refs} 个引用映射` : '';
  el.innerHTML = `<span style="color:var(--text-2)">识别到 ${items.length} 个 Token（${parts.join('、')}${refTip}）</span>`;
}

function submitImport() {
  const text = document.getElementById('import-textarea').value;
  const items = parseImportData(text);
  if (!items || !items.length) { toast('未识别到有效数据'); return; }

  // name → id map (across all levels) for resolving references
  const nameToId = {};

  // Process items in order — first pass creates/finds levels and tokens
  items.forEach(item => {
    const lvName = item.level || (levels[0]?.name) || 'Tokens';
    // Find or create level
    let li = levels.findIndex(l => l.name === lvName);
    if (li === -1) {
      levels.push({ id: uid('lv'), name: lvName });
      tokens.push([]);
      li = levels.length - 1;
    }

    const isHex = /^#[0-9A-Fa-f]{3,8}$/.test(item.value || '');
    const parentId = (!isHex && item.value) ? (nameToId[item.value] || null) : null;
    const color    = isHex ? item.value : null;

    const id = uid(levels[li].id.toLowerCase());
    nameToId[item.name] = id;

    tokens[li].push({
      id,
      name:     item.name,
      group:    item.group || lvName,
      color,
      parentId,
    });
  });

  closeImportModal();
  buildColumnsHTML();
  render();
  scheduleSave();
  const refs = items.filter(i => i.value && !/^#[0-9A-Fa-f]{3,8}$/.test(i.value)).length;
  toast(`已导入 ${items.length} 个 Token${refs ? `，${refs} 个映射已建立` : ''}`);
}

// ══════════════════════════════════════════════════════════════
//  COLOR POPOVER
// ══════════════════════════════════════════════════════════════
let colorPopTargetId = null;
const colorPop  = () => document.getElementById('color-pop');
const cpopPick  = () => document.getElementById('cpop-pick');
const cpopHex   = () => document.getElementById('cpop-hex');

function openColorPop(anchorEl, id, initialColor) {
  colorPopTargetId = id;
  const pop = colorPop();
  const pick = cpopPick();
  const hex  = cpopHex();

  pick.value = initialColor;
  hex.value  = initialColor;
  hex.classList.remove('invalid');

  // populate name field
  const tok = getTokenById(id);
  const fullName = tok?.group ? `${tok.group}.${tok.name}` : (tok?.name || '');
  document.getElementById('cpop-name').value = fullName;

  const r = anchorEl.getBoundingClientRect();
  const popW = 200, popH = 130;
  let left = r.left;
  let top  = r.bottom + 6;
  if (left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8;
  if (top  + popH > window.innerHeight - 8) top = r.top - popH - 6;
  pop.style.left = left + 'px';
  pop.style.top  = top  + 'px';
  pop.classList.add('open');
  requestAnimationFrame(() => { hex.focus(); hex.select(); });
}

function closeColorPop() {
  colorPop().classList.remove('open');
  colorPopTargetId = null;
}

function applyColorPop(hex) {
  if (!colorPopTargetId || !isValidHex(hex)) return;
  const tok = getTokenById(colorPopTargetId);
  if (!tok) return;
  tok.color = hex;
  render();
}

document.getElementById('cpop-pick').addEventListener('input', e => {
  const v = e.target.value;
  cpopHex().value = v;
  cpopHex().classList.remove('invalid');
  applyColorPop(v);
});

document.getElementById('cpop-hex').addEventListener('input', e => {
  let v = e.target.value.trim();
  if (!v.startsWith('#')) v = '#' + v;
  e.target.value = v;
  if (isValidHex(v)) {
    e.target.classList.remove('invalid');
    cpopPick().value = v;
    applyColorPop(v);
  } else {
    e.target.classList.toggle('invalid', v.length >= 4);
  }
});

document.getElementById('cpop-hex').addEventListener('keydown', e => {
  if (e.key === 'Enter') saveColorPop();
  if (e.key === 'Escape') closeColorPop();
});
document.getElementById('cpop-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') saveColorPop();
  if (e.key === 'Escape') closeColorPop();
});

function saveColorPop() {
  const tok = getTokenById(colorPopTargetId);
  if (tok) {
    const fullName = document.getElementById('cpop-name').value.trim();
    if (fullName) {
      const lastDot = fullName.lastIndexOf('.');
      if (lastDot > 0) {
        tok.group = fullName.substring(0, lastDot);
        tok.name  = fullName.substring(lastDot + 1);
      } else {
        tok.group = '';
        tok.name  = fullName;
      }
    }
    render();
    scheduleSave();
  }
  closeColorPop();
  toast('已保存');
}

document.addEventListener('mousedown', e => {
  if (!colorPop().classList.contains('open')) return;
  if (!e.target.closest('#color-pop')) closeColorPop();
}, true);

function editTokenColor(e, id) {
  if (e.target.closest && e.target.closest('.port')) return;
  e.stopPropagation();
  const tok = getTokenById(id);
  if (!tok) return;
  const currentColor = resolveColor(tok) || '#6366F1';
  tok.parentId = null;
  tok.color = currentColor;
  render();
  const swatchEl = document.querySelector(`#tok-${id} .swatch`);
  openColorPop(swatchEl || e.target, id, currentColor);
}

// ══════════════════════════════════════════════════════════════
//  TOKEN PICKER
// ══════════════════════════════════════════════════════════════
let pickerState = { targetId: null, targetLevelIdx: null };

function openPickerForToken(e, id, li) {
  if (li === 0) return;
  if (e.target.closest && (e.target.closest('.port') || e.target.closest('.swatch'))) return;
  e.stopPropagation();
  clearHighlight();
  const tok = getTokenById(id);
  if (!tok) return;
  openPicker(id, li, e.currentTarget);
}

function openPicker(targetId, targetLevelIdx, anchorEl) {
  pickerState = { targetId, targetLevelIdx };
  document.getElementById('tp-title').textContent = '编辑';
  document.getElementById('tp-search').value = '';
  // 关闭关联下拉
  document.getElementById('tp-token-dd').classList.remove('open');
  document.getElementById('tp-token-dd-btn').classList.remove('active');
  // Name field
  const _tok = getTokenById(targetId);
  const fullName = _tok?.group ? `${_tok.group}.${_tok.name}` : (_tok?.name || '');
  document.getElementById('tp-name').value = fullName;
  // Color state
  updatePickerColorMode(_tok);
  renderPickerList();
  positionPicker(anchorEl);
  document.getElementById('tpick').classList.add('open');
}

function updatePickerColorMode(tok) {
  if (!tok) return;
  const isLinked = !!tok.parentId;
  const resolved = resolveColor(tok) || '#6366F1';
  document.getElementById('tp-cpick').value = resolved;
  if (isLinked) {
    const parentTok = getTokenById(tok.parentId);
    document.getElementById('tp-linked-name').textContent = parentTok?.name || tok.parentId;
    document.getElementById('tpick').classList.add('tp-mode-linked');
    document.getElementById('tp-token-dd-btn').innerHTML =
      `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6.5 9.5 4 12a3 3 0 01-4.25-4.25L4.5 3A3 3 0 018.5 4"/><path d="M9.5 6.5 12 4a3 3 0 014.25 4.25L11.5 13A3 3 0 017.5 12"/><line x1="3" y1="13" x2="13" y2="3"/></svg>`;
  } else {
    document.getElementById('tp-chex').value = tok.color || resolved;
    document.getElementById('tp-chex').classList.remove('invalid');
    document.getElementById('tpick').classList.remove('tp-mode-linked');
    document.getElementById('tp-token-dd-btn').innerHTML =
      `<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><circle cx="3.5" cy="3.5" r="1.8"/><circle cx="10.5" cy="3.5" r="1.8"/><circle cx="3.5" cy="10.5" r="1.8"/><circle cx="10.5" cy="10.5" r="1.8"/></svg>`;
  }
}

function positionPicker(anchorEl) {
  const pop = document.getElementById('tpick');
  pop.style.visibility = 'hidden'; pop.style.display = 'flex';
  const r   = anchorEl.getBoundingClientRect();
  const popW = pop.offsetWidth || 264;
  const popH = pop.offsetHeight || 420;
  pop.style.visibility = ''; pop.style.display = '';
  let left = r.right + 10;
  let top  = r.top;
  if (left + popW > window.innerWidth - 8)  left = r.left - popW - 10;
  if (left < 8) left = 8;
  if (top  + popH > window.innerHeight - 8) top  = window.innerHeight - popH - 8;
  if (top < 8) top = 8;
  pop.style.left = left + 'px';
  pop.style.top  = top  + 'px';
}

function closePicker() {
  document.getElementById('tpick').classList.remove('open');
  document.getElementById('tp-token-dd').classList.remove('open');
  document.getElementById('tp-token-dd-btn')?.classList.remove('active');
  pickerState = { targetId: null, targetLevelIdx: null };
}


function renderPickerList() {
  const { targetId, targetLevelIdx } = pickerState;
  if (!targetId) return;
  const q = document.getElementById('tp-search').value.toLowerCase();
  const tok = getTokenById(targetId);
  const currentParentId = tok?.parentId;
  let html = '';

  for (let sourceLi = 0; sourceLi < targetLevelIdx; sourceLi++) {
    const items = (tokens[sourceLi] || []).filter(
      t => !q || t.name.toLowerCase().includes(q)
    );
    if (!items.length) continue;

    // 层级标题（有多个父层时显示）
    if (targetLevelIdx > 1) {
      html += `<div class="tp-group-head" style="background:#F7F5F2;padding:5px 10px 3px;font-size:10px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;border-top:1px solid var(--border)">${levels[sourceLi]?.name || ''}</div>`;
    }

    // 按 token group 二级分组
    const grouped = new Map();
    for (const it of items) {
      const g = it.group || 'Default';
      if (!grouped.has(g)) grouped.set(g, []);
      grouped.get(g).push(it);
    }
    for (const [gName, gItems] of grouped) {
      if (grouped.size > 1) html += `<div class="tp-group-head">${gName}</div>`;
      html += gItems.map(it => {
        const color = resolveColor(it);
        const selected = it.id === currentParentId;
        return `<div class="tp-item${selected ? ' selected' : ''}" onclick="selectPickerItem(${sourceLi},'${it.id}')">
          <div class="tp-item-sw" style="background:${color || 'transparent'}"></div>
          <span class="tp-item-name">${it.name}</span>
          <span class="tp-item-hex">${color ? color.toUpperCase() : ''}</span>
          <svg class="tp-item-chk" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="3,8 6.5,11.5 13,5"/></svg>
        </div>`;
      }).join('');
    }
  }

  document.getElementById('tp-list').innerHTML = html || `<div class="tp-empty">无可关联 token</div>`;
}

function selectPickerItem(sourceLi, sourceId) {
  const tok = getTokenById(pickerState.targetId);
  if (!tok) return;
  tok.parentId = sourceId;
  tok.color = null;
  updatePickerColorMode(tok);
  document.getElementById('tp-token-dd').classList.remove('open');
  document.getElementById('tp-token-dd-btn').classList.remove('active');
  render();
  renderPickerList();
}

function applyPickerColor(hex) {
  if (!isValidHex(hex)) return;
  const tok = getTokenById(pickerState.targetId);
  if (!tok) return;
  tok.parentId = null;
  tok.color = hex;
  render();
}

function handleTpActionBtn() {
  const tok = getTokenById(pickerState.targetId);
  if (!tok) return;
  if (tok.parentId) {
    // Unlink: revert to resolved color as direct color
    const resolved = resolveColor(tok) || '#6366F1';
    tok.parentId = null;
    tok.color = resolved;
    updatePickerColorMode(tok);
    render();
  } else {
    // Toggle token association dropdown
    const dd  = document.getElementById('tp-token-dd');
    const btn = document.getElementById('tp-token-dd-btn');
    const isOpen = dd.classList.contains('open');
    if (isOpen) {
      dd.classList.remove('open');
      btn.classList.remove('active');
    } else {
      renderPickerList();
      dd.classList.add('open');
      btn.classList.add('active');
      requestAnimationFrame(() => document.getElementById('tp-search').focus());
    }
  }
}

function openTpDropdown() {
  const dd = document.getElementById('tp-token-dd');
  renderPickerList();
  dd.classList.add('open');
  requestAnimationFrame(() => document.getElementById('tp-search').focus());
}

function savePickerChanges() {
  const tok = getTokenById(pickerState.targetId);
  if (!tok) return;
  const fullName = document.getElementById('tp-name').value.trim();
  if (fullName) {
    const lastDot = fullName.lastIndexOf('.');
    if (lastDot > 0) {
      tok.group = fullName.substring(0, lastDot);
      tok.name  = fullName.substring(lastDot + 1);
    } else {
      tok.group = '';
      tok.name  = fullName;
    }
  }
  if (!tok.parentId) {
    const hex = document.getElementById('tp-chex').value.trim();
    if (isValidHex(hex)) tok.color = hex;
  }
  render();
  scheduleSave();
  closePicker();
  toast('已保存');
}

function getPickerCurrentColor() {
  return resolveColor(getTokenById(pickerState.targetId));
}


// Picker input events
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('tp-cpick').addEventListener('input', e => {
    document.getElementById('tp-chex').value = e.target.value;
    document.getElementById('tp-chex').classList.remove('invalid');
    applyPickerColor(e.target.value);
  });
  document.getElementById('tp-chex').addEventListener('input', e => {
    let v = e.target.value.trim();
    if (!v.startsWith('#')) v = '#' + v;
    e.target.value = v;
    if (isValidHex(v)) {
      e.target.classList.remove('invalid');
      document.getElementById('tp-cpick').value = v;
      applyPickerColor(v);
    } else {
      e.target.classList.toggle('invalid', v.length >= 4);
    }
  });
  document.getElementById('tp-chex').addEventListener('keydown', e => {
    if (e.key === 'Enter') savePickerChanges();
    if (e.key === 'Escape') closePicker();
  });
  document.getElementById('tp-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') savePickerChanges();
    if (e.key === 'Escape') closePicker();
  });
  document.getElementById('tp-search').addEventListener('input', renderPickerList);

  // Create project modal keyboard support
  document.getElementById('create-project-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') submitCreateProject();
    if (e.key === 'Escape') closeCreateProjectModal();
  });
});

// Close picker on outside click
document.addEventListener('mousedown', e => {
  if (!document.getElementById('tpick').classList.contains('open')) return;
  if (!e.target.closest('#tpick') && !e.target.closest('.token')) closePicker();
}, true);

// ══════════════════════════════════════════════════════════════
//  STATS + RESIZE
// ══════════════════════════════════════════════════════════════
function updateStats() {
  levels.forEach((_, li) => {
    const el = document.getElementById(`col-count-${li}`);
    if (el) el.textContent = tokens[li].length;
  });
}

window.addEventListener('resize', () => {
  requestAnimationFrame(() => { updateSVGSize(); drawLines(); });
});
document.getElementById('workspace').addEventListener('scroll', () => {
  requestAnimationFrame(() => { drawLines(); });
});

// ══════════════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════════════
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

// ══════════════════════════════════════════════════════════════
//  EXPORT  (W3C DTCG / Token Studio / Figma 兼容格式)
// ══════════════════════════════════════════════════════════════
function buildExportJSON() {
  const idToPath = {};
  for (let li = 0; li < levels.length; li++) {
    const lvName = levels[li].name;
    tokens[li].forEach(tok => {
      idToPath[tok.id] = { lvName, group: tok.group, name: tok.name };
    });
  }
  const out = {};
  for (let li = 0; li < levels.length; li++) {
    const lvName = levels[li].name;
    out[lvName] = {};
    tokens[li].forEach(tok => {
      const grp = tok.group || lvName;
      if (!out[lvName][grp]) out[lvName][grp] = {};
      let dollarValue;
      if (tok.parentId && idToPath[tok.parentId]) {
        const p = idToPath[tok.parentId];
        dollarValue = `{${p.lvName}.${p.group}.${p.name}}`;
      } else {
        dollarValue = tok.color || resolveColor(tok) || null;
      }
      out[lvName][grp][tok.name] = { '$value': dollarValue, '$type': 'color' };
    });
    if (!Object.keys(out[lvName]).length) delete out[lvName];
  }
  return out;
}

function doExport() {
  const data = buildExportJSON();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'tokens.json';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('已导出 tokens.json');
}

// ══════════════════════════════════════════════════════════════
//  SUPABASE AUTH + DATA PERSISTENCE
// ══════════════════════════════════════════════════════════════
let _supabase = null;
let currentUserId = null;
let currentProjectId = null;
let currentProjectName = null;
let isLoaded = false;
let saveTimeout = null;

// ── Project Management ────────────────────────────────────────

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatRelativeDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 30) return `${diffDays} 天前`;
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function showProjectList() {
  isLoaded = false;
  currentProjectId = null;
  currentProjectName = null;
  document.getElementById('projects-overlay').style.display = 'flex';
  document.getElementById('tb-project-nav').style.display = 'none';
  document.getElementById('export-wrap').style.display = 'none';
  document.getElementById('tb-user').style.display = 'flex';
  document.getElementById('tb-sep-user').style.display = 'block';
  await renderProjectList();
}

async function renderProjectList() {
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = `<div class="projects-loading">加载中…</div>`;

  let data, error;
  try {
    // Session is already established by the time onLogin() calls us (from onAuthStateChange).
    // Do NOT call getSession() here — Supabase v2 awaits onAuthStateChange callbacks, so
    // calling getSession() inside would deadlock if a background token refresh is in progress.
    const res = await Promise.race([
      _supabase.from('projects').select('id, name, created_at, updated_at')
        .eq('user_id', currentUserId).order('updated_at', { ascending: false }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 10000))
    ]);
    data = res.data; error = res.error;
  } catch (e) {
    const msg = e.message === 'timeout' ? '加载超时' : `加载失败：${e.message}`;
    grid.innerHTML = `<div class="projects-empty">${msg}，<a href="javascript:renderProjectList()" style="color:inherit;text-decoration:underline">点击重试</a></div>`;
    return;
  }

  if (error) { grid.innerHTML = `<div class="projects-empty">加载失败：${error.message}</div>`; return; }

  if (!data || !data.length) {
    grid.innerHTML = `
      <div class="projects-empty-state">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="8" y="10" width="32" height="28" rx="4"/>
          <path d="M16 10V8a2 2 0 012-2h12a2 2 0 012 2v2"/>
          <line x1="18" y1="22" x2="30" y2="22"/><line x1="18" y1="28" x2="26" y2="28"/>
        </svg>
        <div class="pes-title">还没有项目</div>
        <div class="pes-desc">点击右上角"新建项目"开始</div>
      </div>`;
    return;
  }

  grid.innerHTML = `
    <div class="project-list-header">
      <div class="plh-name">项目名称</div>
      <div class="plh-meta">创建时间</div>
      <div class="plh-meta">更新时间</div>
      <div class="plh-actions"></div>
    </div>
    ${data.map(p => `
    <div class="project-row" onclick="openProject('${p.id}', '${escapeHtml(p.name).replace(/'/g,"\\'")}')">
      <div class="pr-name">
        <div class="pr-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="5" width="18" height="14" rx="2"/>
            <path d="M3 9h18"/>
            <circle cx="7" cy="7" r="1" fill="currentColor" stroke="none"/>
            <circle cx="10" cy="7" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </div>
        <span>${escapeHtml(p.name)}</span>
      </div>
      <div class="pr-meta">${formatRelativeDate(p.created_at)}</div>
      <div class="pr-meta">${formatRelativeDate(p.updated_at)}</div>
      <div class="pr-actions">
        <button class="pr-del" title="删除项目"
          onclick="event.stopPropagation(); confirmDeleteProject('${p.id}', '${escapeHtml(p.name).replace(/'/g,"\\'")}')">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <polyline points="3 4 4 4 13 4"/><path d="M12 4l-.7 9a1 1 0 01-1 .97H5.7a1 1 0 01-1-.97L4 4"/>
            <path d="M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1"/>
          </svg>
        </button>
      </div>
    </div>
    `).join('')}
  `;
}

async function openProject(projectId, projectName, { pushState = true } = {}) {
  currentProjectId = projectId;
  currentProjectName = projectName;
  if (pushState) history.pushState({ projectId, projectName }, '', `#/project/${projectId}`);
  document.getElementById('projects-overlay').style.display = 'none';
  document.getElementById('tb-project-nav').style.display = 'flex';
  document.getElementById('tb-project-name').textContent = projectName;
  document.getElementById('export-wrap').style.display = 'block';
  document.getElementById('tb-user').style.display = 'none';
  document.getElementById('tb-sep-user').style.display = 'none';
  await loadProjectData(projectId);
  isLoaded = true;
}

async function backToProjects() {
  history.pushState(null, '', location.pathname);
  await showProjectList();
}

function startRenameProject() {
  const span = document.getElementById('tb-project-name');
  const current = currentProjectName || span.textContent;
  const input = document.createElement('input');
  input.className = 'tb-project-name-input';
  input.value = current;
  input.style.width = Math.max(60, Math.min(240, current.length * 9 + 20)) + 'px';
  span.replaceWith(input);
  input.focus();
  input.select();

  async function commit() {
    const newName = input.value.trim();
    const el = document.createElement('span');
    el.className = 'tb-project-name';
    el.id = 'tb-project-name';
    el.title = '点击重命名';
    el.onclick = startRenameProject;
    if (!newName || newName === current) {
      el.textContent = current;
      input.replaceWith(el);
      return;
    }
    el.textContent = newName;
    input.replaceWith(el);
    currentProjectName = newName;
    const { error } = await _supabase.from('projects').update({ name: newName }).eq('id', currentProjectId);
    if (error) { toast('重命名失败'); el.textContent = current; currentProjectName = current; }
    else { toast('项目已重命名'); }
  }

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { input.value = current; input.blur(); }
  });
}

function openCreateProjectModal() {
  const bg = document.getElementById('create-project-modal-bg');
  bg.classList.add('open');
  const input = document.getElementById('create-project-input');
  input.value = '';
  setTimeout(() => input.focus(), 50);
}

function closeCreateProjectModal() {
  document.getElementById('create-project-modal-bg').classList.remove('open');
}

async function submitCreateProject() {
  const name = document.getElementById('create-project-input').value.trim();
  if (!name) { document.getElementById('create-project-input').focus(); return; }
  const { data, error } = await _supabase
    .from('projects')
    .insert({ user_id: currentUserId, name })
    .select('id, name')
    .single();
  if (error) { closeCreateProjectModal(); toast('创建失败：' + (error.message || error.code || JSON.stringify(error))); return; }
  closeCreateProjectModal();
  await openProject(data.id, data.name);
}

async function confirmDeleteProject(projectId, projectName) {
  if (!confirm(`确认删除项目「${projectName}」？此操作不可恢复。`)) return;
  await _supabase.from('projects').delete().eq('id', projectId);
  toast('项目已删除');
  await renderProjectList();
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  if (el) { el.textContent = msg; el.classList.add('show'); }
}

function showLoginOverlay() {
  if (currentUserId) return; // already logged in, never re-show
  const el = document.getElementById('login-overlay');
  if (el) el.style.display = 'flex';
}

function showUserInToolbar(user) {
  const tbUser = document.getElementById('tb-user');
  const tbSep  = document.getElementById('tb-sep-user');
  if (tbUser) tbUser.style.display = 'flex';
  if (tbSep)  tbSep.style.display  = 'block';

  const meta   = user.user_metadata || {};
  const avatar = meta.avatar_url || meta.picture || null;
  const name   = meta.full_name || meta.user_name || meta.name || user.email || '';

  const avatarEl = document.getElementById('tb-avatar');
  const avatarPh = document.getElementById('tb-avatar-ph');
  if (avatar && avatarEl) {
    avatarEl.src = avatar;
    avatarEl.style.display = 'block';
  } else if (avatarPh) {
    if (avatarEl) avatarEl.style.display = 'none';
    avatarPh.style.display = 'flex';
    avatarPh.textContent = (name || '?')[0].toUpperCase();
  }
  const usernameEl = document.getElementById('tb-username');
  if (usernameEl) usernameEl.textContent = name;
}

async function loadProjectData(projectId) {
  const { data } = await _supabase
    .from('token_mappings')
    .select('levels, tokens')
    .eq('project_id', projectId)
    .maybeSingle();

  if (data?.levels && data?.tokens) {
    levels = data.levels;
    tokens = data.tokens.map(arr => Array.isArray(arr) ? arr : []);
    collapsedGroups = levels.map(() => new Set());
    renderedLevelCount = 0;
    // 1. Sync idSeq first so dedup can safely generate new IDs
    tokens.flat().forEach(t => {
      const n = parseInt(String(t.id).replace(/\D+/, ''), 10);
      if (!isNaN(n) && n > idSeq) idSeq = n;
    });
    // 2. Fix any duplicate IDs that may exist from previous idSeq collision bugs
    let didDedup = false;
    const seenIds = new Set();
    tokens.forEach((arr, li) => {
      const prefix = (levels[li]?.id || `l${li}`).toLowerCase();
      arr.forEach(t => {
        if (seenIds.has(t.id)) { t.id = uid(prefix); didDedup = true; }
        seenIds.add(t.id);
      });
    });
    // 3. Drop any parentId that no longer refers to a valid token
    const allIds = new Set(tokens.flat().map(t => t.id));
    tokens.flat().forEach(t => {
      if (t.parentId && !allIds.has(t.parentId)) t.parentId = null;
    });
    // 4. Persist the fixed data if any IDs were reassigned
    if (didDedup) scheduleSave();
  } else {
    // new project: start blank
    levels = [
      { id: 'L0', name: 'Primitive' },
      { id: 'L1', name: 'Semantic' },
    ];
    tokens = [[], []];
    collapsedGroups = [new Set(), new Set()];
    renderedLevelCount = 0;
  }

  buildColumnsHTML();
  render();
}

function scheduleSave() {
  if (!currentProjectId || !isLoaded) return;
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveUserData, 1500);
}

async function saveUserData() {
  if (!currentProjectId || !_supabase) return;
  await _supabase
    .from('token_mappings')
    .upsert({
      project_id: currentProjectId,
      levels,
      tokens,
      updated_at: new Date().toISOString()
    });
  // Also bump project updated_at so the list sorts correctly
  await _supabase
    .from('projects')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', currentProjectId);
}

async function onLogin(user) {
  // Remove one-time OAuth code after successful exchange so refresh doesn't re-use it
  if (location.search.includes('code=')) {
    history.replaceState(null, '', location.pathname + location.hash);
  }
  document.getElementById('login-overlay').style.display = 'none';
  showUserInToolbar(user);
  currentUserId = user.id;

  // If URL has a project hash, restore directly into that project
  const hashMatch = location.hash.match(/^#\/project\/([^/]+)$/);
  if (hashMatch) {
    const projectId = hashMatch[1];
    const { data } = await _supabase.from('projects').select('id, name').eq('id', projectId).eq('user_id', user.id).maybeSingle();
    if (data) {
      await openProject(data.id, data.name, { pushState: false });
      return;
    }
  }
  await showProjectList();
}

// Handle browser back/forward navigation
window.addEventListener('popstate', async () => {
  if (!currentUserId) return;
  const hashMatch = location.hash.match(/^#\/project\/([^/]+)$/);
  if (hashMatch) {
    const projectId = hashMatch[1];
    const { data } = await _supabase.from('projects').select('id, name').eq('id', projectId).eq('user_id', currentUserId).maybeSingle();
    if (data) { await openProject(data.id, data.name, { pushState: false }); return; }
  }
  await showProjectList();
});

async function logout() {
  if (_supabase) {
    // Must await signOut so it clears the session from localStorage before reload.
    // Without await, reload fires first and the session is still there → user auto-logs back in.
    // 3s timeout prevents hanging if Supabase server is unreachable.
    await Promise.race([
      _supabase.auth.signOut().catch(() => {}),
      new Promise(r => setTimeout(r, 3000))
    ]);
  }
  location.reload();
}

// ══════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════
async function init() {
  const config = await fetch('/api/config').then(r => r.json()).catch(() => null);

  if (!config?.supabaseUrl || !config?.supabaseAnonKey) {
    showLoginError('Supabase 未配置，请先在 .env 中填写 SUPABASE_URL 和 SUPABASE_ANON_KEY。');
    return;
  }

  // On OAuth callback the URL has ?code= and Supabase needs the code_verifier
  // stored in localStorage — do NOT clear localStorage here or the exchange fails.
  // The PKCE exchange will overwrite any stale session automatically.
  const isOAuthCallback = location.search.includes('code=');

  _supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { flowType: 'pkce' }
  });

  const redirectTo = location.origin;

  // Set up login button handlers
  document.getElementById('login-btn-github')?.addEventListener('click', async e => {
    e.preventDefault();
    await _supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo }
    });
  });

  document.getElementById('login-btn-google')?.addEventListener('click', async e => {
    e.preventDefault();
    await _supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
  });

  // IMPORTANT: keep this callback synchronous (no async/await).
  // Supabase v2 awaits async onAuthStateChange callbacks, which would block
  // its internal auth state machine from firing TOKEN_REFRESHED etc.
  _supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'INITIAL_SESSION') {
      if (session?.user) onLogin(session.user).catch(console.error);
      else if (!isOAuthCallback) showLoginOverlay();
    } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user && !currentUserId) {
      onLogin(session.user).catch(console.error);
    } else if (event === 'SIGNED_OUT') {
      currentUserId = null;
      showLoginOverlay();
    }
  });
}



// ══════════════════════════════════════════════════════════════
//  BATCH EDITOR
// ══════════════════════════════════════════════════════════════
let batchEditorLevelIdx = 0;
let _beActiveCell = null; // { id, field, el, originalValue }
let _beSearchQuery = '';
let _beFocusedId = null;   // keyboard-focused row (non-editing)
let _beCopiedToken = null; // internal clipboard for copy/paste

function openBatchEditor() {
  batchEditorLevelIdx = 0;
  _beSearchQuery = '';
  _beFocusedId = null;
  document.getElementById('be-overlay').classList.add('open');
  renderBatchEditor();
}

function closeBatchEditor() {
  commitBeCell();
  document.getElementById('be-overlay').classList.remove('open');
}

function switchBatchLevel(li) {
  commitBeCell();
  batchEditorLevelIdx = li;
  _beSearchQuery = '';
  _beFocusedId = null;
  const inp = document.getElementById('be-search');
  if (inp) inp.value = '';
  renderBatchEditor();
}

function beOnSearch(q) {
  _beSearchQuery = q.trim().toLowerCase();
  const inp = document.getElementById('be-search');
  if (inp && inp.value !== q) inp.value = q;
  renderBatchEditor();
}

function renderBatchEditor() {
  const li = batchEditorLevelIdx;
  // Sidebar
  const sidebar = document.getElementById('be-sidebar');
  if (sidebar) {
    sidebar.innerHTML = levels.map((lev, i) =>
      `<div class="be-coll${i === li ? ' active' : ''}" onclick="switchBatchLevel(${i})">
        <span class="be-coll-name">${lev.name}</span>
        <span class="be-coll-count">${tokens[i].length}</span>
      </div>`
    ).join('');
  }
  // Table
  const body = document.getElementById('be-table-body');
  if (!body) return;
  const allArr = tokens[li] || [];
  const arr = _beSearchQuery
    ? allArr.filter(t => t.name.toLowerCase().includes(_beSearchQuery))
    : allArr;
  if (!allArr.length) {
    body.innerHTML = `<div class="be-empty">此 Collection 暂无 Variable</div>`;
    return;
  }
  if (!arr.length) {
    body.innerHTML = `<div class="be-empty">无匹配结果</div>`;
    return;
  }
  const isFirst = li === 0;
  const groups = groupTokens(arr);
  let html = '';
  for (const [groupName, items] of groups) {
    html += `<div class="be-group-row"><span class="be-group-name" onclick="beRenameGroup(event,${li},'${groupName.replace(/'/g, "\\'")}')">${groupName}</span></div>`;
    for (const tok of items) {
      const resolvedColor = resolveColor(tok);
      const swColor = resolvedColor || 'transparent';
      const swLight = resolvedColor && isLight(resolvedColor);
      let valueDisplay = '';
      if (tok.parentId) {
        const parentTok = getTokenById(tok.parentId);
        valueDisplay = parentTok ? parentTok.name : '';
      } else {
        valueDisplay = tok.color || '';
      }
      const isAlias = !!tok.parentId;
      html += `<div class="be-row${_beFocusedId === tok.id ? ' focused' : ''}" id="be-row-${tok.id}" data-id="${tok.id}" onclick="beFocusRow(event,'${tok.id}')">
        <div class="be-cell be-cell-name">
          <span class="be-cell-text" onclick="beFocusRow(event,'${tok.id}')" ondblclick="beEditCell(event,'${tok.id}','name')">${tok.name}</span>
        </div>
        <div class="be-cell be-cell-value" onclick="beEditValue(event,'${tok.id}',${li})">
          <div class="be-swatch${swLight ? ' light' : ''}${!resolvedColor ? ' none' : ''}"
               style="background:${swColor};cursor:pointer;flex-shrink:0"
               onclick="beEditColor(event,'${tok.id}',${li})"></div>
          <span class="be-cell-value-text${isFirst ? '' : ' alias'}">${valueDisplay}</span>
          ${isAlias
            ? `<button class="be-detach-btn" onmousedown="event.stopPropagation();event.preventDefault();beDetachAlias(event,'${tok.id}',${li})" title="解绑 token">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 8h2m4 0h-2M4 5l-1-1a2.83 2.83 0 0 0 0 4l2 2a2.83 2.83 0 0 0 4-4l-.5-.5M12 11l1 1a2.83 2.83 0 0 0 0-4l-2-2a2.83 2.83 0 0 0-4 4l.5.5"/></svg>
               </button>`
            : (li > 0 ? `<button class="be-link-btn" onmousedown="event.stopPropagation();event.preventDefault();beOpenVdd('${tok.id}',${li},document.querySelector('#be-row-${tok.id} .be-cell-value'))" title="关联 token">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6.5 9.5a3.54 3.54 0 0 0 5 0l2-2a3.54 3.54 0 0 0-5-5L7 4"/><path d="M9.5 6.5a3.54 3.54 0 0 0-5 0l-2 2a3.54 3.54 0 0 0 5 5L9 12"/></svg>
               </button>` : '')
          }
        </div>
        <div class="be-cell be-cell-group">
          <span class="be-cell-text" onclick="beEditCell(event,'${tok.id}','group')">${tok.group || ''}</span>
        </div>
        <div class="be-cell be-cell-del">
          <button class="be-dup-btn" onclick="beDuplicateToken(${li},'${tok.id}')" title="复制行">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="5" width="7" height="8" rx="1"/><path d="M4 11H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v1"/></svg>
          </button>
          <button class="be-del-btn" onclick="batchDeleteToken(${li},'${tok.id}')" title="删除">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>
          </button>
        </div>
      </div>`;
    }
  }
  body.innerHTML = html;
}

function commitBeCell() {
  if (!_beActiveCell) return;
  const { id, field, el, originalValue } = _beActiveCell;
  _beActiveCell = null;
  const input = el.querySelector('.be-cell-input');
  const newVal = input ? input.value.trim() : originalValue;
  const tok = getTokenById(id);
  if (tok && newVal && newVal !== originalValue) {
    tok[field] = newVal;
    scheduleSave();
    render();
  }
  // Restore cell display
  el.textContent = tok ? (tok[field] || '') : originalValue;
}

function beEditCell(e, id, field) {
  e.stopPropagation();
  if (_beActiveCell && _beActiveCell.id === id && _beActiveCell.field === field) return;
  commitBeCell();
  const tok = getTokenById(id);
  if (!tok) return;
  const rowEl = document.getElementById(`be-row-${id}`);
  if (!rowEl) return;
  const cellSelector = field === 'name' ? '.be-cell-name .be-cell-text' : '.be-cell-group .be-cell-text';
  const spanEl = rowEl.querySelector(cellSelector);
  if (!spanEl) return;
  const originalValue = tok[field] || '';
  _beActiveCell = { id, field, el: spanEl, originalValue };
  spanEl.innerHTML = '';
  const input = document.createElement('input');
  input.className = 'be-cell-input';
  input.value = originalValue;
  input.autocomplete = 'off';
  input.spellcheck = false;
  spanEl.appendChild(input);
  input.focus();
  input.select();
  input.addEventListener('blur', () => {
    if (_beActiveCell && _beActiveCell.id === id && _beActiveCell.field === field) commitBeCell();
  });
  input.addEventListener('keydown', e2 => {
    if (e2.key === 'Enter') { e2.preventDefault(); commitBeCell(); }
    else if (e2.key === 'Escape') {
      _beActiveCell = null;
      spanEl.textContent = originalValue;
    } else if (e2.key === 'Tab') {
      e2.preventDefault();
      const dir = e2.shiftKey ? -1 : 1;
      commitBeCell();
      beNavigateFrom(id, field, dir);
    }
  });
}

function beNavigateFrom(id, field, dir) {
  // Build ordered list of editable cells: [{ id, field }]
  const li = batchEditorLevelIdx;
  const baseArr = tokens[li] || [];
  const arr = _beSearchQuery ? baseArr.filter(t => t.name.toLowerCase().includes(_beSearchQuery)) : baseArr;
  const cells = [];
  for (const tok of arr) {
    cells.push({ id: tok.id, field: 'name' });
    cells.push({ id: tok.id, field: 'value' });
    cells.push({ id: tok.id, field: 'group' });
  }
  const idx = cells.findIndex(c => c.id === id && c.field === field);
  if (idx === -1) return;
  const next = cells[idx + dir];
  if (!next) {
    // End of list: Tab forward from last group cell → append new row
    if (dir === 1 && field === 'group') beAppendRow(li);
    return;
  }
  // Sync focused row when Tab moves to a different row
  if (next.id !== id) _beFocusedId = next.id;
  if (next.field === 'value') {
    beEditValue({ stopPropagation() {} }, next.id, li);
    return;
  }
  beEditCell({ stopPropagation() {} }, next.id, next.field);
}

function beAppendRow(li) {
  const prefix = (levels[li]?.id || `l${li}`).toLowerCase();
  const newId = uid(prefix);
  tokens[li].push({ id: newId, name: '', color: null, parentId: null, group: '' });
  scheduleSave(); render(); renderBatchEditor();
  requestAnimationFrame(() => {
    beEditCell({ stopPropagation() {} }, newId, 'name');
  });
}

function beFocusRow(e, id) {
  if (e.target.closest('input,button,span.be-cell-value-text,.be-swatch')) return;
  commitBeCell();
  _beFocusedId = id;
  renderBatchEditor();
}

function beAdjacentRow(id, dir) {
  const li = batchEditorLevelIdx;
  const baseArr = tokens[li] || [];
  const arr = _beSearchQuery ? baseArr.filter(t => t.name.toLowerCase().includes(_beSearchQuery)) : baseArr;
  const idx = arr.findIndex(t => t.id === id);
  if (idx === -1) return null;
  return arr[idx + dir] || null;
}

function beScrollToRow(id) {
  const el = document.getElementById(`be-row-${id}`);
  el?.scrollIntoView({ block: 'nearest' });
}

function beEditValue(e, id, li) {
  e.stopPropagation();
  beCloseVdd();
  const tok = getTokenById(id);
  if (!tok) return;
  if (!tok.parentId) {
    // No alias (primitive or detached): inline color picker + hex input
    commitBeCell();
    const rowEl = document.getElementById(`be-row-${id}`);
    if (!rowEl) return;
    const spanEl = rowEl.querySelector('.be-cell-value .be-cell-value-text');
    if (!spanEl) return;
    const originalValue = tok.color || '';
    _beActiveCell = { id, field: '_value_hex', el: spanEl, originalValue };
    spanEl.innerHTML = '';
    const input = document.createElement('input');
    input.className = 'be-val-hexinp'; input.value = originalValue;
    input.autocomplete = 'off'; input.spellcheck = false; input.maxLength = 9;
    input.addEventListener('input', () => {
      let v = input.value.trim();
      if (!v.startsWith('#')) v = '#' + v;
      if (input.value !== v) input.value = v;
      if (isValidHex(v)) { const t = getTokenById(id); if (t) { t.color = v; t.parentId = null; render(); } }
    });
    const commit = () => {
      if (!(_beActiveCell?.id === id && _beActiveCell?.field === '_value_hex')) return;
      _beActiveCell = null;
      const v = input.value.trim();
      const t = getTokenById(id);
      if (t && v && isValidHex(v)) { t.color = v; t.parentId = null; scheduleSave(); }
      render(); renderBatchEditor();
    };
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e2 => {
      if (e2.key === 'Enter') { e2.preventDefault(); commit(); }
      else if (e2.key === 'Escape') { _beActiveCell = null; renderBatchEditor(); }
      else if (e2.key === 'Tab') { e2.preventDefault(); commit(); beNavigateFrom(id, 'value', e2.shiftKey ? -1 : 1); }
    });
    spanEl.appendChild(input);
    input.focus(); input.select();
  } else {
    // Alias: open token picker to change the alias
    // (detach button → removes alias and enters hex edit)
    const rowEl = document.getElementById(`be-row-${id}`);
    if (!rowEl) return;
    beOpenVdd(id, li, rowEl.querySelector('.be-cell-value') || rowEl);
  }
}

function beDetachAlias(e, id, li) {
  e.stopPropagation();
  beCloseVdd();
  const tok = getTokenById(id);
  if (!tok) return;
  const hex = resolveColor(tok) || '#6366F1';
  tok.parentId = null;
  tok.color = hex;
  scheduleSave(); render(); renderBatchEditor();
  // Auto-enter inline hex edit
  requestAnimationFrame(() => beEditValue({ stopPropagation() {} }, id, li));
}

function beEditColor(e, id, li) {
  e.stopPropagation();
  beCloseVdd();
  commitBeCell();
  const tok = getTokenById(id);
  if (!tok) return;
  if (li === 0) {
    const currentColor = tok.color || resolveColor(tok) || '#6366F1';
    tok.parentId = null; tok.color = currentColor; render();
    const swEl = document.querySelector(`#be-row-${id} .be-swatch`);
    openColorPop(swEl || e.target, id, currentColor);
    const checkClose = () => {
      if (!document.getElementById('color-pop').classList.contains('open')) renderBatchEditor();
      else requestAnimationFrame(checkClose);
    };
    requestAnimationFrame(checkClose);
  } else {
    const rowEl = document.getElementById(`be-row-${id}`);
    if (rowEl) beOpenVdd(id, li, rowEl.querySelector('.be-cell-value') || rowEl);
  }
}

// ── Inline alias dropdown ──────────────────────────────────────
let _beVddState = null;

function beOpenVdd(id, li, anchorEl) {
  beCloseVdd();
  _beVddState = { id, li };
  const dd = document.getElementById('be-vdd');
  const r  = anchorEl.getBoundingClientRect();
  let top  = r.bottom + 3;
  let left = r.left;
  const W = 248;
  if (left + W > window.innerWidth  - 8) left = window.innerWidth  - W - 8;
  if (top  + 240 > window.innerHeight - 8) top  = r.top - 240 - 3;
  dd.style.top  = top  + 'px';
  dd.style.left = left + 'px';
  dd.classList.add('open');
  const inp = document.getElementById('be-vdd-search');
  inp.value = '';
  beRenderVddList('');
  requestAnimationFrame(() => inp.focus());
}

function beCloseVdd() {
  document.getElementById('be-vdd')?.classList.remove('open');
  _beVddState = null;
}

function beRenderVddList(q) {
  const { id, li } = _beVddState || {};
  if (!id) return;
  const tok = getTokenById(id);
  const currentParentId = tok?.parentId;
  const ql = q.toLowerCase();
  let html = ''; let total = 0;

  // If query looks like a hex color, show a "use this color" shortcut at top
  const isHexInput = /^#?[0-9a-fA-F]{0,8}$/.test(q) && q.length >= 2;
  let normalizedHex = q.startsWith('#') ? q : '#' + q;
  if (isHexInput) {
    const valid = isValidHex(normalizedHex);
    const preview = valid ? normalizedHex : 'transparent';
    const activeClass = (valid && tok?.color === normalizedHex && !tok?.parentId) ? ' selected' : '';
    html += `<div class="be-vdd-head">色值</div>
      <div class="be-vdd-item be-vdd-hex-row${activeClass}" onmousedown="beApplyVddHex('${normalizedHex}')">
        <div class="be-vdd-sw" style="background:${preview};${!valid ? 'border-style:dashed' : ''}"></div>
        <span class="be-vdd-name" style="color:${valid ? 'var(--text)' : 'var(--text-3)'}">
          ${valid ? normalizedHex.toUpperCase() : '输入完整色值…'}
        </span>
        ${valid ? '<span class="be-vdd-hex">直接使用</span>' : ''}
      </div>`;
    if (q.length > 1) {
      html += `<div class="be-vdd-sep"></div>`;
    }
  }

  // Token list (filter by name unless it looks like pure hex)
  const filterQ = isHexInput ? '' : ql;
  for (let srcLi = li - 1; srcLi >= 0; srcLi--) {
    const items = (tokens[srcLi] || []).filter(t => !filterQ || t.name.toLowerCase().includes(filterQ));
    if (!items.length) continue;
    total += items.length;
    if (li > 1) html += `<div class="be-vdd-head">${levels[srcLi]?.name || ''}</div>`;
    const grouped = new Map();
    for (const it of items) {
      const g = it.group || 'Default';
      if (!grouped.has(g)) grouped.set(g, []);
      grouped.get(g).push(it);
    }
    for (const [gName, gItems] of grouped) {
      if (grouped.size > 1) html += `<div class="be-vdd-head" style="padding-left:16px;font-weight:500">${gName}</div>`;
      html += gItems.map(it => {
        const color = resolveColor(it);
        const sel = it.id === currentParentId;
        return `<div class="be-vdd-item${sel ? ' selected' : ''}" onmousedown="beSelectVdd('${it.id}')">
          <div class="be-vdd-sw" style="background:${color || 'transparent'}"></div>
          <span class="be-vdd-name">${it.name}</span>
          <span class="be-vdd-hex">${color ? color.toUpperCase() : ''}</span>
          <svg class="be-vdd-chk" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3,8 6.5,11.5 13,5"/></svg>
        </div>`;
      }).join('');
    }
  }

  if (!isHexInput && !total) {
    html = `<div style="padding:14px;text-align:center;color:var(--text-3);font-size:12px">无可关联 token</div>`;
  }
  document.getElementById('be-vdd-list').innerHTML = html;
}

function beApplyVddHex(hex) {
  const { id } = _beVddState || {};
  if (!id || !isValidHex(hex)) return;
  const tok = getTokenById(id);
  if (!tok) return;
  tok.color = hex; tok.parentId = null;
  scheduleSave(); render(); renderBatchEditor(); beCloseVdd();
  toast('颜色已更新');
}

function beSelectVdd(sourceId) {
  const { id } = _beVddState || {};
  if (!id) return;
  const tok = getTokenById(id);
  if (!tok) return;
  tok.parentId = sourceId; tok.color = null;
  scheduleSave(); render(); renderBatchEditor(); beCloseVdd();
  toast('已更新');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('be-vdd-search').addEventListener('input', e => beRenderVddList(e.target.value));
  document.getElementById('be-vdd-search').addEventListener('keydown', e => {
    if (e.key === 'Escape') { beCloseVdd(); return; }
    if (e.key === 'Enter') {
      const q = e.target.value.trim();
      const hex = q.startsWith('#') ? q : '#' + q;
      if (isValidHex(hex)) { beApplyVddHex(hex); }
    }
  });
});
document.addEventListener('mousedown', e => {
  if (_beVddState && !e.target.closest('#be-vdd') && !e.target.closest('.be-cell-value') && !e.target.closest('.be-cell-swatch')) beCloseVdd();
}, true);

function beDuplicateToken(li, id) {
  commitBeCell();
  const arr = tokens[li];
  const idx = arr.findIndex(t => t.id === id);
  if (idx === -1) return;
  const src = arr[idx];
  const prefix = (levels[li]?.id || `l${li}`).toLowerCase();
  const copy = { ...src, id: uid(prefix), name: src.name + '-copy' };
  arr.splice(idx + 1, 0, copy);
  scheduleSave(); render(); renderBatchEditor();
  requestAnimationFrame(() => beEditCell({ stopPropagation() {} }, copy.id, 'name'));
}

function beRenameGroup(e, li, groupName) {
  e.stopPropagation();
  commitBeCell();
  const span = e.currentTarget;
  const originalName = groupName;
  span.innerHTML = '';
  const input = document.createElement('input');
  input.className = 'be-cell-input';
  input.value = originalName;
  input.autocomplete = 'off'; input.spellcheck = false;
  span.appendChild(input);
  input.focus(); input.select();
  const commit = () => {
    const newName = input.value.trim();
    if (newName && newName !== originalName) {
      tokens[li].forEach(t => { if (t.group === originalName) t.group = newName; });
      scheduleSave(); render();
    }
    renderBatchEditor();
  };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e2 => {
    if (e2.key === 'Enter') { e2.preventDefault(); commit(); }
    else if (e2.key === 'Escape') { renderBatchEditor(); }
  });
}

function batchDeleteToken(li, id) {
  deleteToken(li, id);
  renderBatchEditor();
}

function batchAddToken() {
  commitBeCell();
  openModal(batchEditorLevelIdx);
}

// Batch editor keyboard shortcuts
document.addEventListener('keydown', e => {
  const beOpen = document.getElementById('be-overlay').classList.contains('open');
  if (!beOpen) return;

  const isMod = e.metaKey || e.ctrlKey;
  const isEditing = !!_beActiveCell;
  const li = batchEditorLevelIdx;

  // Cmd/Ctrl+D — duplicate focused or active row (works even while editing)
  if (isMod && e.key === 'd') {
    e.preventDefault();
    const id = isEditing ? _beActiveCell.id : _beFocusedId;
    if (id) beDuplicateToken(li, id);
    return;
  }

  // Escape — close BE if not editing; otherwise cell handles it
  if (e.key === 'Escape') {
    if (isEditing) return; // let cell input handle it
    if (_beFocusedId) { _beFocusedId = null; renderBatchEditor(); e.stopPropagation(); return; }
    closeBatchEditor();
    e.stopPropagation();
    return;
  }

  // All remaining shortcuts only work when not editing
  if (isEditing) return;

  // Arrow Up/Down — move row focus
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const dir = e.key === 'ArrowDown' ? 1 : -1;
    if (_beFocusedId) {
      const next = beAdjacentRow(_beFocusedId, dir);
      if (next) { _beFocusedId = next.id; renderBatchEditor(); beScrollToRow(next.id); }
    } else {
      // Focus first/last row
      const baseArr = tokens[li] || [];
      const arr = _beSearchQuery ? baseArr.filter(t => t.name.toLowerCase().includes(_beSearchQuery)) : baseArr;
      const tok = dir === 1 ? arr[0] : arr[arr.length - 1];
      if (tok) { _beFocusedId = tok.id; renderBatchEditor(); beScrollToRow(tok.id); }
    }
    return;
  }

  // Enter — edit name of focused row
  if (e.key === 'Enter' && _beFocusedId) {
    e.preventDefault();
    beEditCell({ stopPropagation() {} }, _beFocusedId, 'name');
    return;
  }

  // Delete/Backspace — delete focused row
  if ((e.key === 'Delete' || e.key === 'Backspace') && _beFocusedId) {
    e.preventDefault();
    const next = beAdjacentRow(_beFocusedId, 1) || beAdjacentRow(_beFocusedId, -1);
    batchDeleteToken(li, _beFocusedId);
    _beFocusedId = next ? next.id : null;
    renderBatchEditor();
    return;
  }

  // Cmd/Ctrl+C — copy focused row
  if (isMod && e.key === 'c' && _beFocusedId) {
    e.preventDefault();
    const tok = getTokenById(_beFocusedId);
    if (tok) { _beCopiedToken = { ...tok }; toast('已复制'); }
    return;
  }

  // Cmd/Ctrl+X — cut focused row
  if (isMod && e.key === 'x' && _beFocusedId) {
    e.preventDefault();
    const tok = getTokenById(_beFocusedId);
    if (tok) {
      _beCopiedToken = { ...tok };
      const next = beAdjacentRow(_beFocusedId, 1) || beAdjacentRow(_beFocusedId, -1);
      batchDeleteToken(li, _beFocusedId);
      _beFocusedId = next ? next.id : null;
      renderBatchEditor();
      toast('已剪切');
    }
    return;
  }

  // Cmd/Ctrl+V — paste after focused row (or at end)
  if (isMod && e.key === 'v' && _beCopiedToken) {
    e.preventDefault();
    const prefix = (levels[li]?.id || `l${li}`).toLowerCase();
    const paste = { ..._beCopiedToken, id: uid(prefix) };
    const arr = tokens[li];
    const idx = _beFocusedId ? arr.findIndex(t => t.id === _beFocusedId) : arr.length - 1;
    arr.splice(idx + 1, 0, paste);
    _beFocusedId = paste.id;
    scheduleSave(); render(); renderBatchEditor();
    beScrollToRow(paste.id);
    toast('已粘贴');
    return;
  }
}, true);

// Close on overlay backdrop click
document.getElementById('be-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('be-overlay')) closeBatchEditor();
});

// Re-render batch editor when token picker closes (to reflect alias changes)
(function patchClosePicker() {
  const orig = window.closePicker;
  window.closePicker = function() {
    orig();
    if (document.getElementById('be-overlay').classList.contains('open')) {
      renderBatchEditor();
    }
  };
})();

init();
