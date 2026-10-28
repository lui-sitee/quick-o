'use strict';
const NA = '官方數據未提供';
const HRS_UNKNOWN = '開放時間未知（官方數據未提供）';
const LIST_N = 30;
const $ = s => document.querySelector(s);
let DATA, BABY = null, HAD = null, map, layer, originMarker, origin = null, markers = new Map(), ALL = [];

function haversine(a, b) {
  const R = 6371000, r = x => x * Math.PI / 180;
  const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const fmtDist = m => m < 1000 ? `${Math.round(m)} 米` : `${(m / 1000).toFixed(1)} 公里`;
const walkMin = m => Math.max(1, Math.round(m / 75)); // 步速約每分鐘 75 米（直線距離估算）
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nameOf = t => t.name_tc !== NA ? t.name_tc : t.name_en;

// ---- 暫停服務（官方英文備註 "Suspension Period: 6 March 2024 - 2 December 2026"） ----
const MONTHS = {january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11};
function suspension(t) {
  const m = /Suspension Period:\s*(\d{1,2}) (\w+) (\d{4})\s*-\s*(\d{1,2}) (\w+) (\d{4})/i.exec(t.remarks_en || '');
  if (!m) return null;
  const a = new Date(+m[3], MONTHS[m[2].toLowerCase()], +m[1]);
  const b = new Date(+m[6], MONTHS[m[5].toLowerCase()], +m[4], 23, 59);
  const now = new Date();
  return { active: now >= a && now <= b, future: now < a, text: t.remarks_tc !== NA ? t.remarks_tc : t.remarks_en };
}
function remarkText(t) {
  if (t.kind !== 'toilet') return '';
  const s = suspension(t);
  if (s) return s.active ? `⚠️ 現正暫停服務（官方備註：${s.text}）` : s.future ? `ℹ️ 將暫停服務（官方備註：${s.text}）` : '';
  const r = t.remarks_tc !== NA ? t.remarks_tc : (t.remarks_en !== NA ? t.remarks_en : '');
  return r ? `ℹ️ 官方備註：${r}` : '';
}

// ---- 開放時間：只解讀官方文字中清楚的格式（24 小時，或 HH:MM–HH:MM）；其他一律「未知」，不作猜測 ----
function hkMinutes() {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Hong_Kong', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  return +p.find(x => x.type === 'hour').value * 60 + +p.find(x => x.type === 'minute').value;
}
function hours(t) {
  const h = (t.opening_hours || '').trim();
  if (!h || h === NA) return { known: false };
  if (/^(24\s*小時|二十四小時|24\s*hours?)$/i.test(h)) return { known: true, open: true, label: '24 小時開放' };
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(?:-|–|—|至|to)\s*(\d{1,2}):(\d{2})(?::\d{2})?$/i.exec(h);
  if (m) {
    const a = +m[1] * 60 + +m[2], b = +m[3] * 60 + +m[4], n = hkMinutes();
    if (a > 1440 || b > 1440) return { known: false };
    const open = a <= b ? n >= a && n < b : n >= a || n < b;
    return { known: true, open, label: open ? `開放中（${h}）` : `現已關閉（${h}）` };
  }
  return { known: false };
}
const hoursLabel = t => { const s = hours(t); return s.known ? s.label : HRS_UNKNOWN; };

// ---- 本機資料（localStorage，不上載）：問題回報標籤 ----
const PKEY = 'qo_reports_v1';
try { localStorage.removeItem('hktm_reviews_demo_v1'); } catch (e) {} // 清理已移除功能的舊本機資料（2026-10-28）
const loadJ = k => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } };
const saveJ = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const TAGS = ['已關閉', '位置不對', '很髒'];

// ---- 篩選 ----
const pressed = id => $('#' + id).getAttribute('aria-pressed') === 'true';
function visible() {
  const d = $('#district').value, ty = $('#type').value, hide = $('#hideSuspended').checked;
  const onlyOpen = pressed('fOpen'), acc = pressed('fAccess'), baby = pressed('fBaby');
  const dOk = t => !d || t.district === d || (t.kind !== 'toilet' && t.district === '油尖旺區' && (d === '油尖區' || d === '旺角區'));
  return ALL.filter(t => {
    if (!t.lat || !t.lng || !dOk(t)) return false;
    if (t.kind === 'baby') { if (!(baby || $('#showBabycare').checked)) return false; if (ty && !baby) return false; }
    else if (t.kind === 'had') { // 民政署：只收錄官方標明有暢通易達洗手間的場地
      if (!(acc || $('#showHad').checked)) return false; if (ty && !acc) return false;
      if (baby && t.facilities['嬰兒護理'] !== '有') return false;
    } else {
      if (baby && t.facilities['嬰兒護理'] !== '有') return false; // 官方數據有「有」才算；現時官方未提供
      if (ty && t.type !== ty) return false;
      if (hide && suspension(t)?.active) return false;
    }
    if (acc && !String(t.facilities['無障礙']).startsWith('有')) return false; // 只用官方無障礙欄位（現時只有民政署數據）
    if (onlyOpen) { const h = hours(t); if (h.known && !h.open) return false; } // 未知時間保留並標示
    return true;
  });
}

// ---- 標記：地圖針形狀＋單一中文字（顏色＋文字雙重提示） ----
const CAT = { '公廁': ['t0', '公', '公廁'], '長期擺放的流動廁所': ['t1', '流', '流動廁所'], '旱廁': ['t2', '旱', '旱廁'], '郊野公園廁所': ['t3', '郊', '郊野公園廁所'], '育嬰間': ['tb', '嬰', '育嬰間'], '社區會堂無障礙洗手間': ['th', '會', '社區會堂無障礙洗手間'] };
const cat = t => CAT[t.type] || CAT['公廁'];
const pinSVG = (cls, letter, extra = '') => `<span class="pin ${cls}${extra}" aria-hidden="true"><svg viewBox="0 0 32 40" width="32" height="40" focusable="false"><path d="M16 38.5C10 30 2.5 24 2.5 15.5a13.5 13.5 0 0 1 27 0C29.5 24 22 30 16 38.5Z"/></svg><b>${letter}</b></span>`;
const badge = t => { const [c, l, n] = cat(t); return `<span class="badge ${c}">${l}｜${n}</span>`; };
function icon(t, susp) {
  const [c, l] = cat(t);
  return L.divIcon({ className: 'pinwrap', iconSize: [32, 40], iconAnchor: [16, 39], popupAnchor: [0, -36], html: pinSVG(c, l, susp ? ' sus' : '') });
}
const gUrl = t => `https://www.google.com/maps/dir/?api=1&destination=${t.lat},${t.lng}&travelmode=walking`;
const aUrl = t => `https://maps.apple.com/?daddr=${t.lat},${t.lng}&dirflg=w`;
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const navUrl = t => isIOS() ? aUrl(t) : gUrl(t);

function reportHTML(t) {
  const mine = (loadJ(PKEY)[t.id] || {}).tags || [];
  return `<div class="report"><b>回報問題</b><br>
    <a class="tel" href="tel:1823">致電 1823 政府熱線</a>
    <span class="rtags" role="group" aria-label="快速標記（只存在這部手機）">${TAGS.map(g => `<button type="button" class="rtag" data-id="${esc(t.id)}" data-tag="${g}" aria-pressed="${mine.includes(g)}">${g}</button>`).join('')}</span>
    <small class="rnote">標記<b>只存在這部手機</b>，不會上載，亦不會更改官方數據。</small></div>`;
}
function popup(t) {
  const name = nameOf(t), susp = t.kind === 'toilet' && suspension(t)?.active;
  const na = v => v === NA ? `<span class="na">${NA}</span>` : esc(v);
  const dist = origin ? `${fmtDist(haversine(origin, t))}（步行約 ${walkMin(haversine(origin, t))} 分鐘，直線估算）` : '請先定位或點按地圖以計算距離';
  const en = t.name_en !== NA && t.name_en !== name ? `<br><span lang="en">${esc(t.name_en)}</span>` : '';
  let body;
  if (t.kind === 'baby') {
    const s = BABY.source;
    const web = /^https?:\/\//.test(t.website) ? `<a class="plink" href="${esc(t.website)}" target="_blank" rel="noopener">官方場地網頁（新視窗）</a>` : '';
    body = `地址：${na(t.address)}<br>開放時間：<span class="na">${HRS_UNKNOWN}</span><br>管理部門：${na(t.department_tc)}；育嬰設施數量：${na(String(t.amount))}<br>
      <span class="nav pnav"><a class="btn gmaps" href="${gUrl(t)}" target="_blank" rel="noopener">Google 地圖步行</a><a class="btn amaps" href="${aUrl(t)}" target="_blank" rel="noopener">Apple 地圖步行</a></span>${web}
      <small class="psrc">來源：<a href="${esc(s.page)}" target="_blank" rel="noopener">${esc(s.publisher)}「${esc(s.name)}」</a>（DATA.GOV.HK；${esc(s.updated)}）</small>`;
  } else if (t.kind === 'had') {
    const s = HAD.source;
    body = `<span class="ploc">📍 位置為所在建築，非洗手間本身</span><br>地址：${na(t.address)}<br>開放時間：<span class="na">${HRS_UNKNOWN}</span><br>
      官方無障礙設施：${t.official_facilities.length ? esc(t.official_facilities.join('、')) : `<span class="na">${NA}</span>`}<br>
      <span class="nav pnav"><a class="btn gmaps" href="${gUrl(t)}" target="_blank" rel="noopener">Google 地圖步行</a><a class="btn amaps" href="${aUrl(t)}" target="_blank" rel="noopener">Apple 地圖步行</a></span>
      <small class="psrc">來源：<a href="${esc(s.page)}" target="_blank" rel="noopener">${esc(s.publisher)}「${esc(s.name)}」</a>（DATA.GOV.HK／CSDI；記錄更新 ${esc(t.updated)}；數據集元數據更新 ${esc(s.modified)}）</small>`;
  } else {
    const src = DATA.sources.find(x => x.key === t.source) || {};
    const h = hours(t), w = remarkText(t);
    body = `地址：${na(t.address !== NA ? t.address : t.address_en)}<br>開放時間：${h.known ? esc(h.label) : `<span class="na">${HRS_UNKNOWN}</span>`}${w ? `<br><span class="pwarn">${esc(w)}</span>` : ''}
      <span class="nav pnav"><a class="btn gmaps" href="${gUrl(t)}" target="_blank" rel="noopener">Google 地圖步行</a><a class="btn amaps" href="${aUrl(t)}" target="_blank" rel="noopener">Apple 地圖步行</a></span>
      <small class="psrc">來源：<a href="${esc(src.page || DATA.terms)}" target="_blank" rel="noopener">${esc(src.name || t.source)}</a>（DATA.GOV.HK；${esc(t.updated !== NA ? '記錄更新 ' + t.updated.slice(0, 10) : src.updated || '')}）</small>`;
  }
  return `<b>${esc(name)}</b>${en}<br>${badge(t)}${susp ? ' <span class="badge sus">停｜暫停服務</span>' : ''} ${esc(t.district)}<br>距離：${dist}<br>${body}${reportHTML(t)}`;
}
function drawMarkers() {
  layer.clearLayers(); markers.clear();
  const ms = [];
  for (const t of visible()) {
    const susp = t.kind === 'toilet' && suspension(t)?.active, name = nameOf(t);
    const m = L.marker([t.lat, t.lng], { icon: icon(t, susp), title: `${name}（${cat(t)[2]}${susp ? '，暫停服務' : ''}）`, alt: name, keyboard: true });
    m.bindPopup(() => popup(t), { maxWidth: 300 });
    ms.push(m); markers.set(t.id, m);
  }
  layer.addLayers(ms);
}
function legend() {
  $('#legend').innerHTML = '<h2 class="vh">圖例</h2><ul>' + Object.values(CAT).map(([c, l, n]) => `<li>${pinSVG(c, l)}${n}${c === 'tb' ? '（政府處所）' : c === 'th' ? '（位置為所在建築）' : ''}</li>`).join('')
    + `<li>${pinSVG('t0', '公', ' sus')}紅框＝暫停服務</li><li><span class="cl" aria-hidden="true">9</span>多個地點（點按放大）</li>`
    + '<li><img class="me" src="assets/logo-2-light.svg" alt="" width="20" height="25">你的位置</li></ul>';
}

// ---- 即時答案：最近 3 個＋「急」按鈕 ----
function ranked() { return origin ? visible().map(t => ({ t, d: haversine(origin, t) })).sort((a, b) => a.d - b.d) : []; }
function urgentTarget() {
  const r = ranked().filter(x => x.t.kind === 'toilet' || (x.t.kind === 'baby' && pressed('fBaby')) || (x.t.kind === 'had' && pressed('fAccess')));
  return r.find(x => hours(x.t).known && hours(x.t).open) || r[0] || null;
}
function renderQuick() {
  const ol = $('#nearest3'); ol.innerHTML = '';
  const sub = $('#urgentSub');
  if (!origin) {
    ol.innerHTML = '<li class="n3empty">未有你的位置：請允許定位，或選擇地區／點按地圖。地圖仍可照常使用。</li>';
    sub.textContent = '按下會先定位，再開啟步行導航'; return;
  }
  const top = ranked().slice(0, 3);
  if (!top.length) ol.innerHTML = '<li class="n3empty">沒有符合篩選條件的地點。</li>';
  for (const { t, d } of top) {
    const li = document.createElement('li'), nm = nameOf(t);
    li.innerHTML = `<div class="n3info"><span class="n3name">${esc(nm)}</span><span class="n3meta">${badge(t)} ${esc(hoursLabel(t))}</span></div>
      <span class="n3dist">${fmtDist(d)}<small>步行約 ${walkMin(d)} 分鐘</small></span>
      <a class="n3go" href="${navUrl(t)}" target="_blank" rel="noopener" aria-label="一按導航 前往${esc(nm)}，${fmtDist(d)}（${isIOS() ? 'Apple' : 'Google'} 地圖，新視窗）">一按導航</a>`;
    ol.appendChild(li);
  }
  const u = urgentTarget();
  sub.textContent = u ? `${nameOf(u.t)}・${fmtDist(u.d)}・${hours(u.t).known ? hours(u.t).label : '開放時間未知（附近沒有確定開放中的廁所）'}` : '附近沒有符合條件的廁所';
}
function goUrgent() {
  const u = urgentTarget();
  if (!u) { $('#status').textContent = '沒有符合條件的廁所，請取消部分篩選。'; return; }
  $('#status').textContent = `正開啟步行導航：${nameOf(u.t)}（${fmtDist(u.d)}，${hours(u.t).known ? hours(u.t).label : HRS_UNKNOWN}）`;
  window.__lastNav = navUrl(u.t);
  if (!window.__noNav) location.href = window.__lastNav;
}

// ---- 完整列表（最近 30 個） ----
function renderList() {
  renderQuick();
  const list = $('#list'); list.innerHTML = '';
  if (!origin) { list.innerHTML = '<li class="card">請先定位、選擇地區或點按地圖，即可列出最近的地點。</li>'; return 0; }
  const items = ranked().slice(0, LIST_N);
  const tpl = $('#card');
  for (const { t, d } of items) {
    const li = tpl.content.firstElementChild.cloneNode(true), nm = nameOf(t);
    const nb = li.querySelector('.showOnMap'); nb.textContent = nm; nb.setAttribute('aria-label', `${nm}：在地圖上顯示`);
    li.querySelector('.dist').textContent = fmtDist(d);
    if (!list.children.length) li.classList.add('hero');
    li.querySelector('.name-en').textContent = t.name_en !== NA && t.name_en !== nm ? t.name_en : '';
    li.querySelector('.meta').innerHTML = `${badge(t)} ${esc(t.district)}${t.source === 'AFCD' ? '（漁農自然護理署數據）' : t.source === 'DH' ? '（衞生署數據）' : t.source === 'HAD' ? '（民政事務總署數據）' : ''}`;
    li.querySelector('.addr').textContent = t.address !== NA ? t.address : (t.address_en && t.address_en !== NA ? t.address_en : `地址：${NA}`);
    const w = t.kind === 'had' ? '📍 位置為所在建築，非洗手間本身' : remarkText(t); if (w) { const el = li.querySelector('.warn'); el.hidden = false; el.textContent = w; }
    const facts = [['開放時間', hours(t).known ? hours(t).label : NA], ...Object.entries(t.facilities)];
    li.querySelector('.facts').innerHTML = facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd class="${v === NA ? 'na' : ''}">${esc(v)}</dd>`).join('');
    const g = li.querySelector('.gmaps'), a = li.querySelector('.amaps');
    g.href = gUrl(t); a.href = aUrl(t);
    nb.addEventListener('click', () => { const m = markers.get(t.id); if (m) layer.zoomToShowLayer(m, () => m.openPopup()); else map.setView([t.lat, t.lng], 18); document.getElementById('map').scrollIntoView({ behavior: 'smooth' }); });
    list.appendChild(li);
  }
  return items.length;
}

function setOrigin(lat, lng, label, zoom = 16) {
  origin = { lat, lng };
  if (originMarker) originMarker.remove();
  originMarker = L.marker([lat, lng], { title: label, alt: label, zIndexOffset: 1000, icon: L.divIcon({ className: 'pinwrap', iconSize: [32, 40], iconAnchor: [16, 39], popupAnchor: [0, -36],
    html: '<img class="me lg-l" src="assets/logo-2-light.svg" alt="" width="32" height="40"><img class="me lg-d" src="assets/logo-2-dark.svg" alt="" width="32" height="40">' }) }).addTo(map).bindPopup(esc(label));
  map.setView([lat, lng], zoom);
  const n = renderList();
  $('#status').textContent = `位置：${label}。已列出最近 ${n} 個地點，最近一個距離 ${$('#list .dist')?.textContent || '—'}。`;
}
function locate(then) {
  if (!navigator.geolocation) { $('#status').textContent = '此瀏覽器不支援定位，請選擇地區或點按地圖；地圖仍可照常使用。'; return; }
  $('#status').textContent = '定位中…';
  navigator.geolocation.getCurrentPosition(
    p => { setOrigin(p.coords.latitude, p.coords.longitude, `你的位置（±${Math.round(p.coords.accuracy)} 米）`); if (typeof then === 'function') then(); },
    e => { $('#status').textContent = `未能定位（${e.code === 1 ? '已拒絕定位權限，可在瀏覽器設定重新允許' : '定位失敗'}）。請選擇地區，或點按地圖設定位置；地圖仍可照常使用。`; renderQuick(); },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
}
function districtCentre(d) {
  const pts = DATA.toilets.filter(t => t.district === d && t.lat);
  return { lat: pts.reduce((s, t) => s + t.lat, 0) / pts.length, lng: pts.reduce((s, t) => s + t.lng, 0) / pts.length };
}
function footer() {
  const s = DATA.sources.map(x => `<a href="${esc(x.page)}" target="_blank" rel="noopener">${esc(x.name)}</a>（${esc(x.publisher)}；${esc(x.updated)}）`).join('<br>');
  const bs = BABY ? `<br><a href="${esc(BABY.source.page)}" target="_blank" rel="noopener">${esc(BABY.source.name)}</a>（${esc(BABY.source.publisher)}；${esc(BABY.source.updated)}）— 育嬰間 ${BABY.count} 個，官方未提供地址及開放時間` : '';
  const hs = HAD ? `<br><a href="${esc(HAD.source.page)}" target="_blank" rel="noopener">${esc(HAD.source.name)}</a>（${esc(HAD.source.publisher)}；${esc(HAD.source.updated)}）— 只收錄官方標明有暢通易達洗手間的社區會堂／社區中心 ${HAD.count} 個；位置為所在建築，非洗手間本身；官方未提供開放時間` : '';
  $('#footer').innerHTML = `<h2 class="foot-h">數據來源</h2>DATA.GOV.HK — ${s}${bs}${hs}<br>共 ${DATA.count} 個廁所（${DATA.count_with_coords} 個有官方座標）；資料整理於 ${esc(DATA.generated)}。
    使用須遵守 <a href="${esc(DATA.terms)}" target="_blank" rel="noopener">DATA.GOV.HK 使用條款</a>；資料版權屬香港特區政府及相關部門，不保證準確或最新，前往前請留意現場告示。<br>
    開放時間只採用官方文字（24 小時或明確時段）；其他顯示「${HRS_UNKNOWN}」。食環署／漁護署廁所的無障礙、嬰兒護理等設施：${NA}；「無障礙」篩選只顯示官方標明有暢通易達洗手間的地點。問題標記只存於此裝置，未上載。<br>
    地圖 © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> 貢獻者`;
}

const HK_BOUNDS = [[22.15, 113.83], [22.56, 114.41]];
function done(what) {
  done.s = done.s || new Set(); done.s.add(what);
  if (done.s.has('data') && done.s.has('tiles')) {
    $('#loading').hidden = true;
    performance.mark('app-ready'); window.__appReady = performance.now(); window.__tilesLoaded = document.querySelectorAll('.leaflet-tile-loaded').length;
  }
}
function modeToggle() {
  const cur = document.documentElement.getAttribute('data-mode-pref') || 'auto';
  document.querySelectorAll('.mode input').forEach(r => {
    r.checked = r.value === cur;
    r.onchange = () => { try { localStorage.setItem('qo_mode', r.value); } catch (e) {}
      window.__applyMode(r.value);
      $('#status').textContent = `顏色模式：${r.parentElement.textContent}${r.value === 'auto' ? '（跟隨裝置設定）' : ''}`; };
  });
}
function offlineNotice() {
  const el = $('#offline'), upd = () => {
    el.hidden = navigator.onLine;
    if (!navigator.onLine) el.textContent = `離線模式：顯示已儲存的官方數據（資料整理於 ${DATA ? DATA.generated : '—'}）。地圖底圖可能無法顯示，導航需要網絡。`;
  };
  addEventListener('online', upd); addEventListener('offline', upd); upd();
}
function refresh(msg) { drawMarkers(); renderList(); if (msg) $('#status').textContent = msg; }
function quickFilters() {
  const notes = {
    fOpen: on => on ? '只顯示開放中：已隱藏官方開放時間顯示現已關閉的地點；開放時間未知的仍會顯示並標明。' : '已顯示全部（包括現已關閉）。',
    fAccess: on => on ? `無障礙：只顯示官方標明有暢通易達洗手間的地點——民政事務總署社區會堂／社區中心 ${HAD ? HAD.count : 0} 個（位置為所在建築，非洗手間本身）。食環署、漁護署廁所官方未提供無障礙欄位，所以不會顯示。` : '',
    fBaby: on => on ? `育嬰：只顯示衞生署「政府處所育嬰設施」${BABY ? BABY.count : 0} 個育嬰間（廁所數據官方未提供育嬰欄位）。` : '',
  };
  for (const id of Object.keys(notes)) $('#' + id).onclick = () => {
    const b = $('#' + id), on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on);
    const n = notes[id](on); const q = $('#qnote'); q.hidden = !n; q.textContent = n;
    refresh(`${b.textContent}：${on ? '已開啟' : '已關閉'}。顯示 ${visible().length} 個地點。`);
  };
}
document.addEventListener('click', e => { // 彈出視窗內的本機問題標記
  const b = e.target.closest('.rtag'); if (!b) return;
  const all = loadJ(PKEY), id = b.dataset.id, tag = b.dataset.tag, cur = new Set((all[id] || {}).tags || []);
  cur.has(tag) ? cur.delete(tag) : cur.add(tag);
  if (cur.size) all[id] = { tags: [...cur], date: new Date().toLocaleDateString('zh-HK') }; else delete all[id];
  saveJ(PKEY, all); b.setAttribute('aria-pressed', cur.has(tag));
  $('#status').textContent = `已${cur.has(tag) ? '加上' : '移除'}標記「${tag}」（只存在這部手機）。如需政府跟進，請致電 1823。`;
});

async function init() {
  modeToggle(); quickFilters();
  map = L.map('map', { preferCanvas: false, tap: true, touchZoom: true, keyboard: true, zoomControl: false }).fitBounds(HK_BOUNDS);
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> 貢獻者 | 數據：DATA.GOV.HK (FEHD, AFCD, DH, HAD)' }).addTo(map);
  tiles.once('load', () => done('tiles'));
  setTimeout(() => done('tiles'), 8000); // 圖磚太慢（或離線）亦不阻擋使用
  layer = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 50, chunkedLoading: true,
    iconCreateFunction: c => L.divIcon({ className: '', iconSize: [40, 40], html: `<div class="cl"><span aria-hidden="true">${c.getChildCount()}</span><span class="vh">${c.getChildCount()} 個地點，點按放大</span></div>` }) }).addTo(map);
  L.control.zoom({ zoomInTitle: '放大地圖', zoomOutTitle: '縮小地圖' }).addTo(map);
  legend();
  map.on('click', e => setOrigin(e.latlng.lat, e.latlng.lng, '地圖上選定的位置', map.getZoom() < 15 ? 16 : map.getZoom()));
  try {
    const bp = fetch('data/babycare.json').then(r => r.json()).catch(() => null); // 育嬰間載入失敗不阻擋廁所
    const hp = fetch('data/had_accessible.json').then(r => r.json()).catch(() => null); // 同上
    DATA = await (await fetch('data/toilets.json')).json();
    BABY = await bp; HAD = await hp;
  } catch (e) { $('#loadingText').textContent = '載入數據失敗，請重新整理頁面。'; $('#status').textContent = '載入數據失敗：' + e; return; }
  ALL = DATA.toilets.map(t => ({ ...t, kind: 'toilet' })).concat(BABY ? BABY.items.map(b => ({ ...b, kind: 'baby' })) : [], HAD ? HAD.items.map(h => ({ ...h, kind: 'had' })) : []);
  const ds = [...new Set(DATA.toilets.map(t => t.district))].sort((a, b) => a.startsWith('郊野') - b.startsWith('郊野') || a.localeCompare(b, 'zh-Hant'));
  for (const d of ds) $('#district').add(new Option(d, d));
  for (const ty of [...new Set(DATA.toilets.map(t => t.type))]) $('#type').add(new Option(ty, ty));
  $('#district').onchange = () => { drawMarkers(); const d = $('#district').value;
    if (d) { const c = districtCentre(d); setOrigin(c.lat, c.lng, `${d}（地區中心點）`, 14); } else renderList(); };
  $('#type').onchange = $('#hideSuspended').onchange = () => refresh();
  $('#showBabycare').onchange = () => refresh($('#showBabycare').checked ? `已顯示 ${BABY ? BABY.count : 0} 個育嬰間。` : '已隱藏育嬰間。');
  $('#showHad').onchange = () => refresh($('#showHad').checked ? `已顯示 ${HAD ? HAD.count : 0} 個社區會堂無障礙洗手間。` : '已隱藏社區會堂無障礙洗手間（按「無障礙」仍會顯示）。');
  $('#locate').onclick = () => locate();
  $('#urgent').onclick = () => origin ? goUrgent() : locate(goUrgent);
  drawMarkers(); renderList(); footer(); offlineNotice();
  $('#status').textContent = `已載入 ${DATA.count} 個官方廁所位置${BABY ? `、${BABY.count} 個育嬰間` : ''}${HAD ? `及 ${HAD.count} 個社區會堂無障礙洗手間` : ''}。`;
  done('data');
  const q = new URLSearchParams(location.search); // 測試用：?lat=..&lng=..
  if (q.has('lat')) setOrigin(+q.get('lat'), +q.get('lng'), '網址指定位置');
  else if (navigator.geolocation) locate(); // 開啟即定位，以便即時列出最近 3 個
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost'))
    navigator.serviceWorker.register('sw.js').catch(() => {});
}
init();
