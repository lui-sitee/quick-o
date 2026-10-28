'use strict';
const NA = '官方數據未提供';
const LIST_N = 30;
const $ = s => document.querySelector(s);
let DATA, map, layer, originMarker, origin = null, markers = new Map();

function haversine(a, b) {
  const R = 6371000, r = x => x * Math.PI / 180;
  const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const fmtDist = m => m < 1000 ? `${Math.round(m)} 米` : `${(m / 1000).toFixed(1)} 公里`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// 解析官方英文備註 "Suspension Period: 6 March 2024 - 2 December 2026"，判斷今日是否暫停
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
  const s = suspension(t);
  if (s) return s.active ? `⚠️ 現正暫停服務（官方備註：${s.text}）` : s.future ? `ℹ️ 將暫停服務（官方備註：${s.text}）` : '';
  const r = t.remarks_tc !== NA ? t.remarks_tc : (t.remarks_en !== NA ? t.remarks_en : '');
  return r ? `ℹ️ 官方備註：${r}` : '';
}

// ---- 本機示範評分（localStorage，未上載） ----
const RKEY = 'hktm_reviews_demo_v1';
const loadRev = () => { try { return JSON.parse(localStorage.getItem(RKEY)) || {}; } catch { return {}; } };
const saveRev = all => localStorage.setItem(RKEY, JSON.stringify(all));

function visible() {
  const d = $('#district').value, ty = $('#type').value, hide = $('#hideSuspended').checked;
  return DATA.toilets.filter(t => t.lat && t.lng && (!d || t.district === d) && (!ty || t.type === ty)
    && !(hide && suspension(t)?.active));
}

const LETTER = ['公', '流', '旱', '郊'];
const TYPES = ['公廁', '長期擺放的流動廁所', '旱廁', '郊野公園廁所'];
const SHORT = ['公廁', '流動廁所', '旱廁', '郊野公園廁所'];
const badge = t => { const i = Math.max(0, TYPES.indexOf(t.type)); return `<span class="badge t${i}">${LETTER[i]}｜${SHORT[i]}</span>`; };
function icon(t, susp) {
  const i = Math.max(0, TYPES.indexOf(t.type));
  return L.divIcon({ className: '', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -14],
    html: `<div class="mk t${i}${susp ? ' sus' : ''}" aria-hidden="true">${LETTER[i]}</div>` });
}
function drawMarkers() {
  layer.clearLayers(); markers.clear();
  const ms = [];
  for (const t of visible()) {
    const susp = suspension(t)?.active;
    const name = t.name_tc !== NA ? t.name_tc : t.name_en;
    const m = L.marker([t.lat, t.lng], { icon: icon(t, susp), title: `${name}（${t.type}${susp ? '，暫停服務' : ''}）`, alt: name, keyboard: true });
    m.bindPopup(`<b>${esc(name)}</b><br>${badge(t)}${susp ? ' <span class="badge sus">停｜暫停服務</span>' : ''}<br>開放時間：${esc(t.opening_hours)}<br>
      <a href="${gUrl(t)}" target="_blank" rel="noopener">Google 步行</a> · <a href="${aUrl(t)}" target="_blank" rel="noopener">Apple 步行</a>`);
    ms.push(m); markers.set(t.id, m);
  }
  layer.addLayers(ms);
}
function legend() {
  $('#legend').innerHTML = '<h2 class="vh">圖例</h2><ul>' + TYPES.map((t, i) => `<li><span class="mk t${i}" aria-hidden="true">${LETTER[i]}</span>${SHORT[i]}</li>`).join('')
    + '<li><span class="mk t0 sus" aria-hidden="true">公</span>紅框＝暫停服務</li><li><span class="cl" aria-hidden="true">9</span>多個廁所（點按放大）</li></ul>';
}
const gUrl = t => `https://www.google.com/maps/dir/?api=1&destination=${t.lat},${t.lng}&travelmode=walking`;
const aUrl = t => `https://maps.apple.com/?daddr=${t.lat},${t.lng}&dirflg=w`;

function renderList() {
  const list = $('#list'); list.innerHTML = '';
  let items = visible();
  if (origin) items = items.map(t => ({ t, d: haversine(origin, t) })).sort((a, b) => a.d - b.d).slice(0, LIST_N);
  else items = items.slice(0, 0);
  if (!origin) { list.innerHTML = '<li class="card">請先定位、選擇地區或點按地圖，即可列出最近的廁所。</li>'; return 0; }
  const revs = loadRev(), tpl = $('#card');
  for (const { t, d } of items) {
    const li = tpl.content.firstElementChild.cloneNode(true);
    const nm = t.name_tc !== NA ? t.name_tc : t.name_en;
    const nb = li.querySelector('.showOnMap'); nb.textContent = nm; nb.setAttribute('aria-label', `${nm}：在地圖上顯示`);
    li.querySelector('.dist').textContent = fmtDist(d);
    if (!list.children.length) li.classList.add('hero');
    li.classList.add('ty' + Math.max(0, TYPES.indexOf(t.type)));
    li.querySelector('.name-en').textContent = t.name_en !== NA && t.name_en !== nm ? t.name_en : '';
    li.querySelector('.meta').innerHTML = `${badge(t)} ${esc(t.district)}${t.source === 'AFCD' ? '（漁農自然護理署數據）' : ''}`;
    li.querySelector('.addr').textContent = t.address !== NA ? t.address : t.address_en;
    const w = remarkText(t); if (w) { const el = li.querySelector('.warn'); el.hidden = false; el.textContent = w; }
    const facts = [['開放時間', t.opening_hours], ...Object.entries(t.facilities)];
    li.querySelector('.facts').innerHTML = facts.map(([k, v]) =>
      `<dt>${esc(k)}</dt><dd class="${v === NA ? 'na' : ''}">${esc(v)}</dd>`).join('');
    const g = li.querySelector('.gmaps'), a = li.querySelector('.amaps');
    g.href = gUrl(t); a.href = aUrl(t);
    g.setAttribute('aria-label', `Google 地圖步行：前往${nm}（新視窗）`);
    a.setAttribute('aria-label', `Apple 地圖步行：前往${nm}（新視窗）`);
    nb.addEventListener('click', () => { const m = markers.get(t.id); if (m) layer.zoomToShowLayer(m, () => m.openPopup()); else map.setView([t.lat, t.lng], 18); document.getElementById('map').scrollIntoView({ behavior: 'smooth' }); });
    setupReview(li, t, revs);
    list.appendChild(li);
  }
  return items.length;
}

// 只限星級評分（1–5），每部裝置每個廁所一個評分，存於 localStorage，未上載
function setupReview(li, t, revs) {
  const r = revs[t.id], mine = r && r.stars ? r : Array.isArray(r) && r.length ? r[r.length - 1] : null;
  li.querySelector('.avg').textContent = mine ? `你的評分 ★${mine.stars}` : '';
  li.querySelector('.revs').textContent = mine ? `你在 ${mine.date} 給了 ${mine.stars} 星（只存於此裝置）` : '';
  let stars = mine ? mine.stars : 0; const box = li.querySelector('.stars');
  for (let i = 1; i <= 5; i++) {
    const lab = document.createElement('label'); if (i <= stars) lab.classList.add('on');
    lab.innerHTML = `<input type="radio" name="st-${t.id}" value="${i}"${i === stars ? ' checked' : ''}><span aria-hidden="true">★</span><span class="vh">${i} 星</span>`;
    lab.querySelector('input').onchange = () => { stars = i; [...box.querySelectorAll('label')].forEach((c, j) => c.classList.toggle('on', j < i)); };
    box.appendChild(lab);
  }
  li.querySelector('.save').onclick = () => {
    if (!stars) { $('#status').textContent = '請先揀星數，再儲存。'; box.querySelector('input').focus(); return; }
    const all = loadRev(); all[t.id] = { stars, date: new Date().toLocaleDateString('zh-HK') };
    saveRev(all); renderList(); $('#status').textContent = `已儲存 ${stars} 星評分在此裝置（本機示範，未上載）。`;
  };
}

function setOrigin(lat, lng, label, zoom = 16) {
  origin = { lat, lng };
  if (originMarker) originMarker.remove();
  originMarker = L.marker([lat, lng], { title: label }).addTo(map).bindPopup(label);
  map.setView([lat, lng], zoom);
  const n = renderList();
  $('#status').textContent = `位置：${label}。已列出最近 ${n} 個廁所，最近一個距離 ${$('#list .dist')?.textContent || '—'}。`;
}

function locate() {
  if (!navigator.geolocation) { $('#status').textContent = '此瀏覽器不支援定位，請選擇地區或點按地圖。'; return; }
  $('#status').textContent = '定位中…';
  navigator.geolocation.getCurrentPosition(
    p => setOrigin(p.coords.latitude, p.coords.longitude, `你的位置（±${Math.round(p.coords.accuracy)} 米）`),
    e => { $('#status').textContent = `未能定位（${e.code === 1 ? '已拒絕權限' : '定位失敗'}）。請選擇地區，或點按地圖設定位置。`; $('#district').focus(); },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
}

function districtCentre(d) { // 以該區官方座標平均值作為中心點
  const pts = DATA.toilets.filter(t => t.district === d && t.lat);
  return { lat: pts.reduce((s, t) => s + t.lat, 0) / pts.length, lng: pts.reduce((s, t) => s + t.lng, 0) / pts.length };
}

function footer() {
  const s = DATA.sources.map(x => `<a href="${esc(x.page)}" target="_blank" rel="noopener">${esc(x.name)}</a>（${esc(x.publisher)}；${esc(x.updated)}）`).join('<br>');
  $('#footer').innerHTML = `數據來源：DATA.GOV.HK — ${s}<br>共 ${DATA.count} 個廁所（${DATA.count_with_coords} 個有官方座標）；資料整理於 ${esc(DATA.generated)}。
    使用須遵守 <a href="${esc(DATA.terms)}" target="_blank" rel="noopener">DATA.GOV.HK 使用條款</a>；資料版權屬香港特區政府及相關部門，不保證準確或最新，前往前請留意現場告示。<br>
    無障礙、嬰兒護理等設施：${NA}。星級評分為<b>本機示範，未上載</b>（只存於此瀏覽器，其他用戶看不到）。<br>
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
async function init() {
  modeToggle();
  map = L.map('map', { preferCanvas: false, tap: true, touchZoom: true, keyboard: true, zoomControl: false }).fitBounds(HK_BOUNDS);
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> 貢獻者 | 數據：DATA.GOV.HK (FEHD, AFCD)' }).addTo(map);
  tiles.once('load', () => done('tiles'));
  setTimeout(() => done('tiles'), 8000); // 圖磚太慢亦不阻擋使用
  layer = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 50, chunkedLoading: true,
    iconCreateFunction: c => L.divIcon({ className: '', iconSize: [40, 40], html: `<div class="cl" aria-hidden="true">${c.getChildCount()}</div>` }) }).addTo(map);
  L.control.zoom({ zoomInTitle: '放大地圖', zoomOutTitle: '縮小地圖' }).addTo(map);
  legend();
  map.on('click', e => setOrigin(e.latlng.lat, e.latlng.lng, '地圖上選定的位置', map.getZoom() < 15 ? 16 : map.getZoom()));
  try {
    DATA = await (await fetch('data/toilets.json')).json();
  } catch (e) { $('#loadingText').textContent = '載入數據失敗，請重新整理頁面。'; $('#status').textContent = '載入數據失敗：' + e; return; }
  const ds = [...new Set(DATA.toilets.map(t => t.district))].sort((a, b) => a.startsWith('郊野') - b.startsWith('郊野') || a.localeCompare(b, 'zh-Hant'));
  for (const d of ds) $('#district').add(new Option(d, d));
  for (const ty of [...new Set(DATA.toilets.map(t => t.type))]) $('#type').add(new Option(ty, ty));
  $('#district').onchange = () => { drawMarkers(); const d = $('#district').value;
    if (d) { const c = districtCentre(d); setOrigin(c.lat, c.lng, `${d}（地區中心點）`, 14); } else renderList(); };
  $('#type').onchange = $('#hideSuspended').onchange = () => { drawMarkers(); if (origin) setOrigin(origin.lat, origin.lng, '目前位置', map.getZoom()); else renderList(); };
  $('#locate').onclick = locate;
  drawMarkers(); renderList(); footer();
  $('#status').textContent = `已載入 ${DATA.count} 個官方廁所位置。按「搵最近廁所」使用定位；或選擇地區／點按地圖。`;
  done('data');
  const q = new URLSearchParams(location.search); // 測試用：?lat=..&lng=..
  if (q.has('lat')) setOrigin(+q.get('lat'), +q.get('lng'), '網址指定位置');
}
init();
