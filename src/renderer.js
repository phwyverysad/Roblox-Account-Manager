let accounts = [], launchAcc = null, editAcc = null, toastTimer;
let packages = [], editingPackageId = null;
const _launchedIds = new Set();

// ── Logs ─────────────────────────────────────────────────────────────────────
// Plain, append-only session log rendered like a tailed .txt file. No in-app
// filters or search box -- use Ctrl+F (native find) over the text instead.
const _logs = [];
const MAX_LOGS = 2000;
const LOG_CATS = { launch:'launch', crash:'crash', kill:'kill', cookie:'cookie', afk:'afk', enc:'enc', system:'system', close:'close' };

function logEntry(level, category, message, meta) {
  const entry = { ts: Date.now(), level, category, message, meta: meta || {} };
  _logs.push(entry);
  if (_logs.length > MAX_LOGS) _logs.shift(); // keep the most-recent tail
  if (document.getElementById('page-logs')?.classList.contains('active')) renderLogs();
}

function _logLine(e) {
  const timeObj = new Date(e.ts);
  const ts = timeObj.toLocaleTimeString('en-GB', { hour12:false }) + '.' + String(timeObj.getMilliseconds()).padStart(3,'0');
  const cat = String(e.category || '').toUpperCase().padEnd(7);
  const keys = Object.keys(e.meta || {}).filter(k => e.meta[k] !== null && e.meta[k] !== undefined);
  const meta = keys.length ? '  ' + keys.map(k => `${k}=${e.meta[k]}`).join(' ') : '';
  const msg = (typeof t === 'function') ? t(e.message) : e.message;
  return `<span class="lg-ts">${esc(ts)}</span>  <span class="lg-${esc(e.level)}">${esc(cat)}</span> ${esc(msg + meta)}`;
}

function renderLogs() {
  const el = document.getElementById('logs-list');
  if (!el) return;
  if (!_logs.length) { el.textContent = t('ยังไม่มีบันทึก'); return; }
  // Tail behaviour: only auto-scroll to the newest line if already near the end.
  const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
  el.innerHTML = _logs.map(_logLine).join('\n');
  if (atBottom) el.scrollTop = el.scrollHeight;
}

// Native-style find (Ctrl+F) over the rendered log text. Uses window.find so
// selection, scroll-to-match and Ctrl+A/Ctrl+C all behave like a normal viewer.
function openLogFind() {
  const bar = document.getElementById('log-find');
  const inp = document.getElementById('log-find-input');
  if (!bar || !inp) return;
  bar.style.display = 'flex';
  inp.focus(); inp.select();
}
function closeLogFind() {
  const bar = document.getElementById('log-find');
  if (bar) bar.style.display = 'none';
  const sel = window.getSelection && window.getSelection();
  if (sel) sel.removeAllRanges();
  const c = document.getElementById('log-find-count');
  if (c) c.textContent = '';
}
function logFind(backwards) {
  const inp = document.getElementById('log-find-input');
  const c = document.getElementById('log-find-count');
  if (!inp) return;
  const q = inp.value;
  if (!q) { if (c) c.textContent = ''; return; }
  const found = window.find(q, false, !!backwards, true, false, false, false);
  if (c) c.textContent = found ? '' : 'ไม่พบรายการที่ตรงกัน';
}
const _avatarCache = {};
let settings = {};

var LANG_OPTIONS = (typeof window !== 'undefined' && ((window.i18n && window.i18n.LANG_OPTIONS) || window.LANG_OPTIONS)) || {
  th: { label: 'ไทย', badge: 'TH', desc: 'ภาษาเริ่มต้นของโปรแกรม' },
  en: { label: 'English', badge: 'EN', desc: 'English interface' },
  ja: { label: '日本語', badge: 'JP', desc: '日本語インターフェース' },
  zh: { label: '中文', badge: 'ZH', desc: '中文界面' },
  ko: { label: '한국어', badge: 'KR', desc: '한국어 인터페이스' },
  es: { label: 'Español', badge: 'ES', desc: 'Interfaz en español' },
};
var selectedLanguage = (typeof window !== 'undefined' && (window.selectedLanguage || (window.i18n && window.i18n.getLanguage && window.i18n.getLanguage()))) || 'th';

var TEXT_MAP = (typeof window !== 'undefined' && ((window.i18n && window.i18n.TEXT_MAP) || window.TEXT_MAP)) || {};
var _i18nReverse = (typeof window !== 'undefined' && ((window.i18n && window.i18n._i18nReverse) || window._i18nReverse)) || {};

function t(key, ...args) {
  if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.t === 'function') {
    return window.i18n.t(key, ...args);
  }
  const lang = selectedLanguage || 'th';
  let str = (TEXT_MAP[key] && (TEXT_MAP[key][lang] || TEXT_MAP[key]['en'])) || key;
  if (args.length > 0) {
    args.forEach((arg, i) => {
      str = str.replace(new RegExp('\\{' + i + '\\}', 'g'), String(arg));
    });
  }
  return str;
}

function translateDOM(root) {
  if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.translateDOM === 'function') {
    return window.i18n.translateDOM(root);
  }
}

const ENC_OPTIONS = {
  'aes-256-gcm': { label: 'AES-256-GCM', badge: 'ดีที่สุด', badgeClass: 'green' },
  'aes-256-cbc': { label: 'AES-256-CBC', badge: 'มาตรฐาน', badgeClass: 'muted' },
};
let selectedEnc = 'aes-256-gcm';

let _encMode = null;
function showEncModal(mode) {
  _encMode = mode;
  const title = document.getElementById('enc-title');
  const desc = document.getElementById('enc-desc');
  const action = document.getElementById('enc-action');
  const cancel = document.getElementById('enc-cancel');
  const skip = document.getElementById('enc-skip');
  const err = document.getElementById('enc-err');
  const inp = document.getElementById('enc-input');
  if (err) err.style.display = 'none';
  if (inp) inp.value = '';
  if (action) action.disabled = false;
  if (cancel) cancel.style.display = (mode === 'setup') ? 'inline-flex' : 'none';
  if (mode === 'setup') {
    title.textContent = 'สร้างคีย์เข้ารหัส';
    desc.textContent = 'ตั้งคีย์เข้ารหัสเพื่อป้องกันบัญชีที่บันทึกไว้ ระบบจะถามคีย์ทุกครั้งที่เปิดแอป';
    action.textContent = 'ตั้งคีย์';
    if (skip) skip.style.display = 'none';
  } else {
    title.textContent = 'กรอกคีย์เข้ารหัส';
    desc.textContent = 'กรอกคีย์ที่ตั้งไว้เพื่อปลดล็อกบัญชีที่บันทึกไว้';
    action.textContent = 'ปลดล็อก';
    if (skip) skip.style.display = 'none';
  }
  openModal('m-enc');
  setTimeout(() => inp && inp.focus(), 60);
}
function _encErr(m) { const e = document.getElementById('enc-err'); if (e) { e.textContent = m; e.style.display = 'block'; } }
async function submitEnc() {
  const inp = document.getElementById('enc-input');
  const action = document.getElementById('enc-action');
  const remCb = document.getElementById('enc-remember');
  const val = inp ? inp.value : '';
  const remember = remCb ? remCb.checked : false;
  if (action) action.disabled = true;
  try {
    if (_encMode === 'setup') {
      if (!val) { _encErr(t('กรุณากรอกคีย์เข้ารหัส')); action.disabled = false; return; }
      const r = await api.encSetKey(val, remember);
      if (!r || !r.ok) { _encErr(t('ไม่สามารถตั้งคีย์เข้ารหัสได้ กรุณาลองอีกครั้ง')); action.disabled = false; return; }
    } else {
      if (!val) { _encErr(t('กรุณากรอกคีย์เข้ารหัสของคุณ')); action.disabled = false; return; }
      const r = await api.encUnlock(val, remember);
      if (!r || !r.ok) { _encErr(t('คีย์ไม่ถูกต้อง กรุณาลองอีกครั้ง')); logEntry('warn', 'enc', 'ปลดล็อกคีย์เข้ารหัสไม่สำเร็จ (คีย์ผิด)'); action.disabled = false; inp.value = ''; inp.focus(); return; }
      logEntry('ok', 'enc', 'ยอมรับคีย์เข้ารหัสแล้ว - ปลดล็อกบัญชี');
    }
    closeModal('m-enc');
    await continueInit();
    updateAppLockStatusUI();
  } catch (e) { _encErr(t('เกิดข้อผิดพลาดบางอย่าง กรุณาลองอีกครั้ง')); if (action) action.disabled = false; }
}
async function skipEnc() {
  const skip = document.getElementById('enc-skip');
  if (skip) skip.disabled = true;
  try { await api.encSetKey(''); } catch {}
  closeModal('m-enc');
  await continueInit();
  updateAppLockStatusUI();
}

async function init() {
  try {
    const st = await api.encStatus();
    if (st && st.mode === 'locked') { showEncModal('locked'); return; }
  } catch (e) {
    console.error('init encStatus error:', e);
  }
  await continueInit();
}

async function continueInit() {
  try {
    const loaded = await Promise.all([
      (api.loadAccounts ? api.loadAccounts() : Promise.resolve([])).catch(() => []),
      (api.loadSettings ? api.loadSettings() : Promise.resolve({})).catch(() => ({})),
      (api.loadPackages ? api.loadPackages() : Promise.resolve([])).catch(() => [])
    ]);
    accounts = loaded[0] || [];
    settings = loaded[1] || {};
    packages = loaded[2] || [];
  } catch (err) {
    console.error('Failed loading initial accounts/settings:', err);
    accounts = accounts || [];
    settings = settings || {};
    packages = packages || [];
  }

  try {
    logEntry('info', 'system', `โหลดบัญชีจากที่เก็บข้อมูลแล้ว ${accounts.length} บัญชี`);
    recheckAllCookies(true);
  } catch (e) {
    console.error('Cookie recheck error:', e);
  }

  try {
    render();
  } catch (e) {
    console.error('render() error:', e);
  }

  try {
    renderPackages();
  } catch (e) {
    console.error('renderPackages() error:', e);
  }

  if (typeof renderStatusPage === 'function') try { renderStatusPage(); } catch {}
  if (typeof renderWindowPosList === 'function') try { renderWindowPosList(); } catch {}
  if (typeof renderVersionsPage === 'function') try { renderVersionsPage(); } catch {}
  if (typeof loadCharts === 'function') try { loadCharts(); } catch {}
  if (typeof mixInit === 'function') try { mixInit(); } catch {}

  // Pre-load Home Browser View immediately in background at startup
  if (accounts && accounts.length > 0) {
    _currentHomeAccountId = accounts[0].id;
    try { updateHomeCddActiveUI(); updateHomeBrowserView(); } catch {}
  }

  // put the toolbar back to the saved view + filter
  try {
    const vtGrid = document.getElementById('vt-grid');
    if (vtGrid) vtGrid.classList.toggle('active', _acctView === 'grid');
    const vtList = document.getElementById('vt-list');
    if (vtList) vtList.classList.toggle('active', _acctView === 'list');
    document.querySelectorAll('#filter-menu button').forEach(b => b.classList.toggle('active', b.dataset.f === _acctFilter));
    const filterBtn = document.getElementById('filter-btn');
    if (filterBtn) filterBtn.classList.toggle('on', _acctFilter !== 'all');
    applySettings();
    initCustomDropdowns();
    refreshMultiStatus();
    detectRobloxVersion();
    startRunningPoll();
  } catch (e) {
    console.error('Toolbar/settings restore error:', e);
  }
  logEntry('info', 'system', 'เริ่ม MultiRoblox แล้ว', { version: 'v1', accounts: accounts.length, platform: navigator.platform });
  try {
    if (settings.doNotSleep) api.setDoNotSleep(true);
    if (settings.autoOpacity) api.setWindowOpacity(80);
  } catch {}
  try { const afkStat = await api.antiAfkStatus(); if (afkStat && afkStat.enabled) logEntry('info', 'afk', `เปิดกัน AFK ไว้ตอนเริ่มต้น (กำลังทำงาน: ${afkStat.active})`, { enabled: afkStat.enabled, active: afkStat.active }); } catch {}
  try { _genHistory = (await api.readGenHistory()) || []; genRenderHistory(); } catch {}

  // Apply custom accent color if saved
  try {
    const customAccent = localStorage.getItem('ui-custom-accent') || settings.customAccent;
    if (customAccent) {
      applyCustomAccent(customAccent);
    }
  } catch {}

  // Start system widget resource polling
  setInterval(async () => {
    try {
      const status = await api.getSystemStatus();
      if (status) {
        document.getElementById('sys-mem-val').textContent = status.memory + '%';
        document.getElementById('sys-mem-fill').style.width = status.memory + '%';
        document.getElementById('sys-cpu-val').textContent = status.cpu + '%';
        document.getElementById('sys-cpu-fill').style.width = status.cpu + '%';
      }
    } catch (e) {
      console.error('System widget poll failed:', e);
    }
  }, 1000);

  // Forward main-process log events into the renderer log
  api.onLogEntry(data => logEntry(data.level, data.category, data.message, data.meta));

  // main pushes the count off the watch tick; the local poll backs off below
  api.onRobloxCount(n => { _lastCountPushAt = Date.now(); _mixRunning = n; setRunningBadges(n); });

  api.onRobloxClosed(id => {
    _launchedIds.delete(id);
    _launchTimestamps.delete(id);
    const closedAcct = accounts.find(a => a.id === id);
    logEntry('info', 'close', `ปิด Roblox สำหรับ ${closedAcct ? closedAcct.username : id} แล้ว`, { accountId: id, username: closedAcct?.username || null, userId: closedAcct?.userId || null });
    
    // Trigger native notification
    try {
      new Notification("MultiRoblox", {
        body: `บัญชี ${closedAcct ? (closedAcct.nickname || closedAcct.username) : id} ปิดการทำงานหรือหลุดการเชื่อมต่อ`
      });
    } catch(e) {}

    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (card) card.classList.remove('is-live');
    const dot = document.querySelector(`.card[data-id="${id}"] .card-dot`);
    if (dot) { dot.classList.remove('launched'); dot.title = 'ยังไม่เปิด'; }
    refreshPkgAvatarStatus();
    pollRunningCount();
    if (document.getElementById('page-status')?.classList.contains('active')) renderStatusPage();
  });

  api.onAllRobloxClosed(() => {
    logEntry('warn', 'close', 'ปิดอินสแตนซ์ Roblox ทั้งหมดแล้ว');
    _launchedIds.clear();
    _launchTimestamps.clear();
    document.querySelectorAll('.card.is-live').forEach(c => c.classList.remove('is-live'));
    document.querySelectorAll('.card-dot.launched').forEach(d => { d.classList.remove('launched'); d.title = 'ยังไม่เปิด'; });
    refreshPkgAvatarStatus();
    pollRunningCount();
    if (document.getElementById('page-mixer')?.classList.contains('active')) mixRefreshRunning();
    if (document.getElementById('page-status')?.classList.contains('active')) renderStatusPage();
  });

  // Chrome download progress
  api.onChromeProgress(data => {
    const dlDiv = document.getElementById('login-dl');
    const waitDiv = document.getElementById('login-waiting');
    if (!dlDiv || !waitDiv) return;
    if (data.status === 'downloading') {
      dlDiv.style.display = '';
      waitDiv.style.display = 'none';
      if (data.percent !== undefined) {
        document.getElementById('dl-bar').style.width = data.percent + '%';
        document.getElementById('dl-pct').textContent = data.percent + '%';
      }
    } else if (data.status === 'done') {
      dlDiv.style.display = 'none';
      waitDiv.style.display = '';
    }
  });
}
init();

// ── Theme ──────────────────────────────────────────────────────────────────
var THEMES = ['dark','light','midnight','aurora','sunset','crimson','ocean','grape','forest','amber','rose','graphite'];
function applyTheme(name) {
  if (THEMES.indexOf(name) < 0) name = 'dark';
  document.body.classList.remove('light');
  THEMES.forEach(t => { if (t !== 'dark' && t !== 'light') document.body.classList.remove('theme-' + t); 
  const customPanel = document.getElementById('custom-theme-panel');
  if (customPanel) {
    customPanel.style.display = (name === 'custom') ? 'block' : 'none';
    if (name === 'custom') loadCustomThemeColors();
  }
});
  if (name === 'light') document.body.classList.add('light');
  else if (name !== 'dark') document.body.classList.add('theme-' + name);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = (name === 'light') ? 'dark_mode' : 'light_mode';
  document.querySelectorAll('.theme-card').forEach(c => c.classList.toggle('sel', c.dataset.theme === name));
}
function currentTheme() { try { return localStorage.getItem('ui-theme') || 'dark'; } catch { return 'dark'; } }
function setTheme(name) {
  if (THEMES.indexOf(name) < 0) name = 'dark';
  applyTheme(name);
  try { localStorage.setItem('ui-theme', name); } catch {}
}
// Titlebar button: quick dark <-> light switch (leaves the special themes).
function toggleTheme() {
  setTheme(currentTheme() === 'light' ? 'dark' : 'light');
}
(function() {
  let t;
  try {
    t = localStorage.getItem('ui-theme');
    if (!t) { const old = localStorage.getItem('theme'); t = (old === 'light') ? 'light' : 'dark'; }
  } catch { t = 'dark'; }
  setTheme(t || 'dark');
})();

function currentLanguage() {
  try { return localStorage.getItem('ui-language') || settings.language || 'th'; }
  catch { return settings.language || 'th'; }
}
function updateLanguageDisplay(lang) {
  const meta = LANG_OPTIONS[lang] || LANG_OPTIONS.th;
  const lbl = document.getElementById('cdd-lang-label');
  const bdg = document.getElementById('cdd-lang-badge');
  const cur = document.getElementById('lang-current-badge');
  if (lbl) lbl.textContent = meta.label;
  if (bdg) bdg.textContent = meta.badge;
  if (cur) cur.textContent = meta.label;
  document.querySelectorAll('#cdd-lang-menu .cdd-option').forEach(o =>
    o.classList.toggle('selected', o.dataset.value === lang));
}
function applyLanguage(lang, persist = false) {
  const code = LANG_OPTIONS[lang] ? lang : 'th';
  selectedLanguage = code;
  settings.language = code;
  document.documentElement.lang = code;
  if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.setLanguage === 'function') {
    window.i18n.setLanguage(code);
  }
  updateLanguageDisplay(code);

  // Actually translate every text node in the DOM
  translateDOM();
  // Re-render dynamic views with localized strings
  if (typeof render === 'function') try { render(); } catch {}
  if (typeof renderPackages === 'function') try { renderPackages(); } catch {}
  if (typeof renderCharts === 'function') try { renderCharts(); } catch {}
  if (typeof renderWindowPositions === 'function') try { renderWindowPositions(); } catch {}
  if (typeof renderLogs === 'function') try { renderLogs(); } catch {}
  if (typeof renderVersionsPage === 'function') try { renderVersionsPage(); } catch {}
  if (typeof updateAntiAfkUI === 'function') try { updateAntiAfkUI(); } catch {}
  if (typeof updateAppLockStatusUI === 'function') try { updateAppLockStatusUI(); } catch {}

  if (persist) {
    try { localStorage.setItem('ui-language', code); } catch {}
    if (window.api && window.api.saveSettings) api.saveSettings({ language: code });
  }
}
function setLanguage(lang) {
  applyLanguage(lang, true);
  const meta = LANG_OPTIONS[lang] || LANG_OPTIONS.th;
  toast((lang === 'th' ? 'เปลี่ยนภาษาเป็น ' : 'Language → ') + meta.label, 'ok');
}
function selectLang(lang) { setLanguage(lang); }

// ── BloxGen API key persistence ────────────────────────────────────────────
(function() {
  try {
    const saved = localStorage.getItem('bloxgen_apikey');
    if (saved) {
      const el = document.getElementById('gen-apikey');
      if (el) el.value = saved;
    }
  } catch {}
})();
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('gen-apikey');
  if (el) el.addEventListener('input', () => {
    try { localStorage.setItem('bloxgen_apikey', el.value); } catch {}
  });
});


async function detectRobloxVersion() {
  try {
    const ver = await api.getRobloxVersion();
    if (ver) {
      // Show full hash in titlebar badge, also update settings stat
      document.getElementById('tb-roblox-ver').textContent = ver;
      const el = document.getElementById('stat-rblx-ver');
      if (el) el.textContent = ver;
    } else {
      document.getElementById('tb-roblox-ver').textContent = '-';
      const el = document.getElementById('stat-rblx-ver');
      if (el) el.textContent = 'ไม่พบ';
    }
  } catch {
    document.getElementById('tb-roblox-ver').textContent = '-';
    const el = document.getElementById('stat-rblx-ver');
    if (el) el.textContent = 'ไม่พบ';
  }
}

async function updateAppLockStatusUI() {
  try {
    const st = await api.encStatus();
    const badge = document.getElementById('app-lock-status-badge');
    const rmBtn = document.getElementById('btn-remove-app-lock');
    if (st && (st.mode === 'unlocked' || st.mode === 'locked')) {
      if (badge) {
        badge.textContent = 'เปิดใช้งานรหัสผ่าน (Active)';
        badge.className = 'badge g';
      }
      if (rmBtn) rmBtn.style.display = 'inline-flex';
    } else {
      if (badge) {
        badge.textContent = 'ไม่ได้ตั้งรหัสผ่าน (Disabled)';
        badge.className = 'badge muted';
      }
      if (rmBtn) rmBtn.style.display = 'none';
    }
  } catch {}
}

window.openSetPassphraseModal = function() {
  showEncModal('setup');
};

window.removePassphraseLock = async function() {
  if (!confirm('คุณต้องการยกเลิกรหัสผ่านการล็อกโปรแกรมใช่หรือไม่? เมื่อยกเลิกแล้ว ใครก็สามารถเปิดเข้าโปรแกรมได้โดยไม่ต้องใส่รหัสผ่าน')) return;
  try {
    const res = await api.encSetKey('');
    if (res && res.ok) {
      toast('ยกเลิกรหัสผ่านการล็อกโปรแกรมเรียบร้อยแล้ว', 'ok');
      updateAppLockStatusUI();
    } else {
      toast('ไม่สามารถยกเลิกรหัสผ่านได้: ' + (res?.error || ''), 'err');
    }
  } catch (e) {
    toast('เกิดข้อผิดพลาดในการยกเลิกรหัสผ่าน', 'err');
  }
};

function applySettings() {
  applyLanguage(settings.language || currentLanguage());
  updateAppLockStatusUI();
  if (settings.encryptionType) {
    selectedEnc = settings.encryptionType;
    updateCddDisplay('enc', selectedEnc);
    document.querySelectorAll('#cdd-enc-menu .cdd-option').forEach(o =>
      o.classList.toggle('selected', o.dataset.value === selectedEnc));
  }
  const keyIn = document.getElementById('custom-key');
  if (keyIn) { keyIn.value = ''; keyIn.placeholder = settings.keySet ? 'ตั้งคีย์ไว้แล้ว พิมพ์เพื่อเปลี่ยน' : 'เช่น SecureKey1234@A#'; }
  const afk = document.getElementById('set-antiafk');
  if (afk) afk.checked = !!settings.antiAfk;
  syncCustomDropdownUI('antiAfkAction', settings.antiAfkAction || 0);
  syncCustomDropdownUI('userSafeMode', settings.userSafeMode || 0);
  syncCustomDropdownUI('fpsCapLimit', settings.fpsCapLimit || 0);
  syncCustomDropdownUI('antiAfkInterval', settings.antiAfkInterval || 540);
  const autoStart = document.getElementById('setting-auto-start-afk');
  if (autoStart) autoStart.checked = !!settings.autoStartAfk;
  const afkRem = document.getElementById('setting-afk-reminder');
  if (afkRem) afkRem.checked = !!settings.afkReminder;
  syncCustomDropdownUI('restoreMethod', settings.restoreMethod || 1);
  const unlFps = document.getElementById('setting-unlock-fps-focus');
  if (unlFps) unlFps.checked = !!settings.unlockFpsFocus;
  const doSleep = document.getElementById('setting-do-not-sleep');
  if (doSleep) doSleep.checked = !!settings.doNotSleep;
  const autoMute = document.getElementById('setting-auto-mute');
  if (autoMute) autoMute.checked = !!settings.autoMute;
  const unmuteF = document.getElementById('setting-unmute-focus');
  if (unmuteF) unmuteF.checked = !!settings.unmuteFocus;
  const autoGrid = document.getElementById('setting-auto-grid');
  if (autoGrid) autoGrid.checked = !!settings.autoGrid;
  const autoOpac = document.getElementById('setting-auto-opacity');
  if (autoOpac) autoOpac.checked = !!settings.autoOpacity;
  const autoHide = document.getElementById('setting-auto-hide');
  if (autoHide) autoHide.checked = !!settings.autoHide;
  const autoRec = document.getElementById('setting-auto-reconnect');
  if (autoRec) autoRec.checked = !!settings.autoReconnect;
  const autoRes = document.getElementById('setting-auto-reset');
  if (autoRes) autoRes.checked = !!settings.autoReset;
  const dcEn = document.getElementById('setting-discord-webhook-enabled');
  if (dcEn) dcEn.checked = !!settings.discordWebhookEnabled;
  const dcUrl = document.getElementById('setting-discord-webhook-url');
  if (dcUrl) dcUrl.value = settings.discordWebhookUrl || '';
  const dcStart = document.getElementById('setting-dc-notify-start');
  if (dcStart) dcStart.checked = settings.discordNotifyStart !== false;
  const dcAct = document.getElementById('setting-dc-notify-action');
  if (dcAct) dcAct.checked = !!settings.discordNotifyAction;
  const dcRec = document.getElementById('setting-dc-notify-reconnect');
  if (dcRec) dcRec.checked = settings.discordNotifyReconnect !== false;
  const dcRes = document.getElementById('setting-dc-notify-reset');
  if (dcRes) dcRes.checked = settings.discordNotifyReset !== false;
  const dcErr = document.getElementById('setting-dc-notify-errors');
  if (dcErr) dcErr.checked = settings.discordNotifyErrors !== false;
  const dcMen = document.getElementById('setting-dc-mention-errors');
  if (dcMen) dcMen.checked = !!settings.discordMentionOnErrors;
  const dcEmb = document.getElementById('setting-dc-disable-embed');
  if (dcEmb) dcEmb.checked = !!settings.discordDisableEmbed;
  const autoBoot = document.getElementById('setting-auto-boot');
  if (autoBoot) autoBoot.checked = !!settings.autoLaunchOnBoot;

  const setCheck = (id, val) => { const el = document.getElementById(id); if (el) el.checked = !!val; };
  setCheck('mix-vs-remove-textures', settings.vsRemoveTextures);
  setCheck('mix-vs-low-poly', settings.vsLowPoly);
  setCheck('mix-vs-disable-postfx', settings.vsDisablePostFx);
  setCheck('mix-vs-disable-shadows', settings.vsDisableShadows);
  setCheck('mix-vs-disable-terrain', settings.vsDisableTerrain);
  setCheck('mix-vs-disable-telemetry', settings.vsDisableTelemetry);
  setCheck('mix-vs-optimize-cframe', settings.vsOptimizeCFrame);
  setCheck('mix-vs-multithreading', settings.vsMultiThreading);
  setCheck('mix-vs-faster-loading', settings.vsFasterLoading);
  setCheck('mix-vs-no-blur', settings.vsNoBlur);
  setCheck('mix-vs-unlimited-zoom', settings.vsUnlimitedZoom);
  setCheck('mix-vs-fps-display', settings.vsFpsDisplay);
  setCheck('mix-vs-fix-scaling', settings.vsFixScaling);
  setCheck('mix-vs-gray-sky', settings.vsGraySky);
  const engineEl = document.getElementById('mix-vs-engine');
  if (engineEl) syncCustomDropdownUI('vsRenderEngine', settings.vsRenderEngine || 'default');
  const lightingEl = document.getElementById('mix-vs-lighting');
  if (lightingEl) syncCustomDropdownUI('vsLightingTech', settings.vsLightingTech || 'default');
  const bootstrapperEl = document.getElementById('mix-setting-bootstrapper');
  if (bootstrapperEl) syncCustomDropdownUI('bootstrapper', settings.bootstrapper || 'roblox');
}

let _acctQuery = '', _acctFilter = (() => { try { const f = localStorage.getItem('mr-acct-filter'); return (f && f !== 'running' && f !== 'idle') ? f : 'all'; } catch { return 'all'; } })(), _acctView = (() => { try { return localStorage.getItem('mr-acct-view') === 'list' ? 'list' : 'grid'; } catch { return 'grid'; } })();
function visibleAccounts() {
  let list = [...accounts];
  if (_acctQuery) {
    const q = _acctQuery;
    list = list.filter(a => (a.nickname || a.username || '').toLowerCase().includes(q) || String(a.userId || '').includes(q));
  }
  if (_acctFilter === 'running') list = list.filter(a => _launchedIds.has(a.id));
  else if (_acctFilter === 'idle') list = list.filter(a => !_launchedIds.has(a.id));
  else if (_acctFilter === 'valid-first') list.sort((a, b) => {
    const s = id => _cookieStatus[id] === 'dead' ? 1 : 0;
    return s(a.id) - s(b.id);
  });
  else if (_acctFilter === 'invalid-first') list.sort((a, b) => {
    const s = id => _cookieStatus[id] === 'dead' ? 0 : 1;
    return s(a.id) - s(b.id);
  });
  return list;
}
let _searchTimer;
function onAcctSearch(v) {
  _acctQuery = (v || '').trim().toLowerCase();
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(render, 120); // debounce so a long list isn't rebuilt on every keystroke
}
function toggleFilterMenu(e) { if (e) e.stopPropagation(); document.getElementById('filter-menu').classList.toggle('open'); }
function setAcctFilter(f) {
  _acctFilter = f;
  try { localStorage.setItem('mr-acct-filter', (f === 'running' || f === 'idle') ? 'all' : f); } catch {}
  document.querySelectorAll('#filter-menu button').forEach(b => b.classList.toggle('active', b.dataset.f === f));
  document.getElementById('filter-menu').classList.remove('open');
  document.getElementById('filter-btn').classList.toggle('on', f !== 'all');
  render();
}
function setAcctView(v) {
  _acctView = v;
  try { localStorage.setItem('mr-acct-view', v); } catch {}
  document.getElementById('vt-grid').classList.toggle('active', v === 'grid');
  document.getElementById('vt-list').classList.toggle('active', v === 'list');
  render();
}
document.addEventListener('click', e => {
  const fm = document.getElementById('filter-menu');
  if (fm && fm.classList.contains('open') && !e.target.closest('.filter-wrap')) fm.classList.remove('open');
});

function toggleAntiAfk() {
  const el = document.getElementById('set-antiafk');
  if (!el) return;
  const on = el.checked;
  settings.antiAfk = on;
  api.saveSettings({ antiAfk: on });
  toast(on ? 'เปิดกัน AFK แล้ว บัญชีจะไม่หลุดการเชื่อมต่อ' : 'ปิดกัน AFK แล้ว', on ? 'ok' : 'err');
}

function toggleCdd(name) {
  const trigger = document.getElementById('cdd-' + name + '-trigger');
  const menu = document.getElementById('cdd-' + name + '-menu');
  if (!trigger || !menu) return;
  const open = menu.classList.contains('open');
  closeAllCdd();
  if (!open) { trigger.classList.add('open'); menu.classList.add('open'); }
}
function closeAllCdd() {
  document.querySelectorAll('.cdd-trigger.open').forEach(t => t.classList.remove('open'));
  document.querySelectorAll('.cdd-menu.open').forEach(m => m.classList.remove('open'));
}
function selectCdd(name, value) {
  selectedEnc = value;
  document.querySelectorAll('#cdd-' + name + '-menu .cdd-option').forEach(o =>
    o.classList.toggle('selected', o.dataset.value === value));
  updateCddDisplay(name, value);
  closeAllCdd();
}
function updateCddDisplay(name, value) {
  const meta = ENC_OPTIONS[value] || { label: value, badge: '', badgeClass: '' };
  const lbl = document.getElementById('cdd-' + name + '-label');
  const bdg = document.getElementById('cdd-' + name + '-badge');
  if (lbl) lbl.textContent = meta.label;
  if (bdg) { bdg.textContent = meta.badge; bdg.className = 'cdd-badge' + (meta.badgeClass ? ' ' + meta.badgeClass : ''); }
}

function initCustomDropdowns() {
  document.querySelectorAll('.cdd').forEach(cdd => {
    const settingKey = cdd.dataset.setting;
    const trigger = cdd.querySelector('.cdd-trigger');
    const menu = cdd.querySelector('.cdd-menu');
    if (!trigger || !menu) return;
    
    // Skip if it uses inline legacy handlers
    if (trigger.getAttribute('onclick')) return;

    // Use current dataset.value or infer from selection
    if (!cdd.dataset.value) {
      const activeOpt = menu.querySelector('.cdd-option.selected') || menu.querySelector('.cdd-option');
      if (activeOpt) {
        cdd.dataset.value = activeOpt.dataset.value;
      }
    }

    // Bind trigger click
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.contains('open');
      closeAllCdd();
      if (!isOpen) {
        trigger.classList.add('open');
        menu.classList.add('open');
      }
    });

    // Bind option click
    menu.querySelectorAll('.cdd-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = opt.dataset.value;
        cdd.dataset.value = val;

        menu.querySelectorAll('.cdd-option').forEach(o => o.classList.toggle('selected', o === opt));

        const optName = opt.querySelector('.cdd-opt-name')?.textContent || opt.textContent.trim();
        const lbl = trigger.querySelector('.cdd-label');
        if (lbl) lbl.textContent = optName;

        if (settingKey === 'fpsCapLimit') {
          const wraps = document.querySelectorAll('.custom-fps-wrap');
          if (val === 'custom') {
            wraps.forEach(w => w.style.display = '');
            const firstInput = document.querySelector('.custom-fps-input');
            const customVal = parseInt(firstInput?.value || '30', 10);
            if (firstInput && !firstInput.value) firstInput.value = '30';
            
            document.querySelectorAll('#setting-fps-cap').forEach(c => {
              c.dataset.value = 'custom';
              c.querySelectorAll('.cdd-option').forEach(o => o.classList.toggle('selected', o.dataset.value === 'custom'));
              const l = c.querySelector('.cdd-label');
              if (l) l.textContent = `กำหนดเอง (${customVal} FPS)`;
            });
            settings.fpsCapLimit = customVal;
            saveSettingsDebounced();
          } else {
            wraps.forEach(w => w.style.display = 'none');
          }
        }

        if (settingKey && val !== 'custom') {
          // Sync duplicate settings dropdowns
          document.querySelectorAll(`.cdd[data-setting="${settingKey}"]`).forEach(otherCdd => {
            if (otherCdd !== cdd) {
              otherCdd.dataset.value = val;
              const otherOpt = otherCdd.querySelector(`.cdd-option[data-value="${val}"]`);
              if (otherOpt) {
                otherCdd.querySelectorAll('.cdd-option').forEach(o => o.classList.toggle('selected', o === otherOpt));
                const otherLbl = otherCdd.querySelector('.cdd-label');
                if (otherLbl) otherLbl.textContent = optName;
              }
            }
          });

          // Set setting key
          const intVal = parseInt(val, 10);
          settings[settingKey] = isNaN(intVal) ? val : intVal;

          saveSettingsDebounced();

          if (settingKey === 'autoOpacity') {
            onAutoOpacityToggle(settings.autoOpacity);
          } else if (settingKey === 'doNotSleep') {
            onDoNotSleepToggle(settings.doNotSleep);
          } else if (settingKey === 'bootstrapper') {
            const wrap = document.getElementById('vs-custom-exe-wrap');
            if (wrap) wrap.style.display = val === 'custom' ? 'flex' : 'none';
          } else if (settingKey === 'modDeathSound') {
            const wrap = document.getElementById('vs-custom-sound-wrap');
            if (wrap) wrap.style.display = val === 'custom' ? 'flex' : 'none';
            if (typeof _modSettings !== 'undefined') {
              _modSettings.deathSound = val;
              api.saveModSettings(_modSettings);
            }
          } else if (settingKey === 'modCursor') {
            const wrap = document.getElementById('vs-custom-cursor-wrap');
            if (wrap) wrap.style.display = val === 'custom' ? 'flex' : 'none';
            if (typeof _modSettings !== 'undefined') {
              _modSettings.cursorType = val;
              api.saveModSettings(_modSettings);
            }
          }
        }

        closeAllCdd();
      });
    });
  });

  // Bind custom FPS inputs
  document.querySelectorAll('.custom-fps-input').forEach(inp => {
    inp.addEventListener('input', () => {
      let val = parseInt(inp.value, 10);
      if (isNaN(val) || val <= 0) val = 30; // Default fallback
      
      // Sync other custom inputs
      document.querySelectorAll('.custom-fps-input').forEach(otherInp => {
        if (otherInp !== inp) otherInp.value = inp.value;
      });

      // Update triggers
      document.querySelectorAll('#setting-fps-cap').forEach(cdd => {
        cdd.dataset.value = 'custom';
        const lbl = cdd.querySelector('.cdd-label');
        if (lbl) lbl.textContent = `กำหนดเอง (${val} FPS)`;
        cdd.querySelectorAll('.cdd-option').forEach(o => o.classList.toggle('selected', o.dataset.value === 'custom'));
      });

      settings.fpsCapLimit = val;
      saveSettingsDebounced();
    });
  });
}

function syncCustomDropdownUI(settingKey, value) {
  if (settingKey === 'fpsCapLimit') {
    const valStr = String(value);
    const standardPresets = ['0', '3', '5', '7', '10', '15', '30'];
    const wraps = document.querySelectorAll('.custom-fps-wrap');
    if (standardPresets.includes(valStr)) {
      wraps.forEach(w => w.style.display = 'none');
      document.querySelectorAll('#setting-fps-cap').forEach(cdd => {
        cdd.dataset.value = valStr;
        const opt = cdd.querySelector(`.cdd-option[data-value="${valStr}"]`);
        if (opt) {
          cdd.querySelectorAll('.cdd-option').forEach(o => o.classList.toggle('selected', o === opt));
          const lbl = cdd.querySelector('.cdd-label');
          if (lbl) lbl.textContent = opt.querySelector('.cdd-opt-name')?.textContent || opt.textContent.trim();
        }
      });
    } else {
      wraps.forEach(w => w.style.display = '');
      document.querySelectorAll('.custom-fps-input').forEach(inp => inp.value = valStr);
      document.querySelectorAll('#setting-fps-cap').forEach(cdd => {
        cdd.dataset.value = 'custom';
        const opt = cdd.querySelector('.cdd-option[data-value="custom"]');
        if (opt) {
          cdd.querySelectorAll('.cdd-option').forEach(o => o.classList.toggle('selected', o === opt));
          const lbl = cdd.querySelector('.cdd-label');
          if (lbl) lbl.textContent = `กำหนดเอง (${value} FPS)`;
        }
      });
    }
    return;
  }

  document.querySelectorAll(`.cdd[data-setting="${settingKey}"]`).forEach(cdd => {
    const valStr = String(value);
    cdd.dataset.value = valStr;
    const opt = cdd.querySelector(`.cdd-option[data-value="${valStr}"]`);
    if (opt) {
      cdd.querySelectorAll('.cdd-option').forEach(o => o.classList.toggle('selected', o === opt));
      const lbl = cdd.querySelector('.cdd-label');
      if (lbl) {
        const optName = opt.querySelector('.cdd-opt-name')?.textContent || opt.textContent.trim();
        lbl.textContent = optName;
      }
    }
  });
}

document.addEventListener('click', e => { if (!e.target.closest('.cdd')) closeAllCdd(); });

function settingsTab(tab) {
  ['general','antiafk','language','themes','sounds','advanced','windowpos','discord-rpc'].forEach(t => {
    const panel = document.getElementById('stab-panel-' + t);
    const btn = document.getElementById('stab-' + t);
    if (panel) panel.style.display = t === tab ? '' : 'none';
    if (btn) btn.classList.toggle('active', t === tab);
  });
  if (tab === 'sounds') typeof soundRenderPage === 'function' && soundRenderPage();
  if (tab === 'discord-rpc') typeof loadDiscordRpcSettings === 'function' && loadDiscordRpcSettings();
}

function switchMixerTab(tab) {
  ['graphics', 'fps', 'window', 'antiafk', 'voidstrap', 'reconnect'].forEach(t => {
    const panel = document.getElementById('mtab-panel-' + t);
    const btn = document.getElementById('mtab-' + t);
    if (panel) panel.style.display = t === tab ? '' : 'none';
    if (btn) btn.classList.toggle('active', t === tab);
  });
  if (tab === 'voidstrap' && typeof window.loadVoidstrapTab === 'function') {
    window.loadVoidstrapTab();
  }
}
window.switchMixerTab = switchMixerTab;


function goTo(p) {
  if (p === 'sounds' || p === 'themes') { goTo('settings'); settingsTab(p); return; }

  if (p !== 'home' && window.api && window.api.hideHome) {
    window.api.hideHome();
  }

  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
  const pageEl = document.getElementById('page-' + p);
  const navEl = document.getElementById('nav-' + p);
  if (pageEl) pageEl.classList.add('active');
  if (navEl) navEl.classList.add('active');
  if (p === 'home') {
    updateHomeCddActiveUI();
    updateHomeBrowserView();
  }
  if (p === 'settings') {
    const statCount = document.getElementById('stat-count');
    if (statCount) statCount.textContent = accounts.length;
    refreshMultiStatus();
  }
  if (p === 'logs') renderLogs();
  if (p === 'charts') {
    if (!chartsLoaded) loadCharts();
    else {
      if (typeof setupChartsScrollEvents === 'function') setupChartsScrollEvents();
      if (typeof checkAutoLoadCharts === 'function') setTimeout(checkAutoLoadCharts, 150);
    }
  }
  if (p === 'packages') renderPackages();
  if (p === 'mixer') mixInit();
  if (p === 'status') renderStatusPage();
  if (p === 'versions') renderVersionsPage();
  if (p === 'scripts') {
    if (window.scriptsModule && typeof window.scriptsModule.onShow === 'function') {
      window.scriptsModule.onShow();
    }
  }
  if (p === 'windowpos') {
    renderWindowPosList();
    setTimeout(() => typeof renderScreenGridPreview === 'function' && renderScreenGridPreview(), 60);
  }
}

const ROBLOX_VERSIONS_LIST = [
  {
    hash: 'version-e32560e271704ed2',
    name: 'Roblox Player Live Build (แนะนำ)',
    date: '2026-07-15',
    tag: 'Latest Live',
    tagClass: 'g',
    desc: 'เวอร์ชันล่าสุดในปัจจุบัน รองรับเซิร์ฟเวอร์ Roblox ล่าสุดทั้งหมด',
  },
  {
    hash: 'version-a129ef3124804b12',
    name: 'Roblox Player Stable Release',
    date: '2026-06-20',
    tag: 'Stable Build',
    tagClass: 'g',
    desc: 'เวอร์ชันเสถียรก่อนหน้า การทำงานนิ่ง ป้องกันการแครชขณะเปิดหลายจอ',
  },
  {
    hash: 'version-c88f19203a114ef9',
    name: 'Roblox Low Memory Edition',
    date: '2026-05-18',
    tag: 'Low RAM',
    tagClass: 'muted',
    desc: 'บิลด์น้ำหนักเบา ลดการใช้ RAM และ GPU สำหรับเปิดบอทจำนวนมาก',
  },
  {
    hash: 'version-9d10e54129bb410d',
    name: 'Roblox Bloxstrap Optimized Build',
    date: '2026-04-10',
    tag: 'Modded Compatible',
    tagClass: 'g',
    desc: 'บิลด์ปรับแต่งพิเศษ เข้ากันได้ดีกับ Bloxstrap และ FastFlags Custom',
  },
  {
    hash: 'version-765f012b11aa4921',
    name: 'Roblox Legacy Client Build',
    date: '2026-03-05',
    tag: 'Legacy',
    tagClass: 'muted',
    desc: 'เวอร์ชันเก่าย้อนหลัง ใช้งานราบรื่นบนเครื่องสเปกต่ำหรือรุ่นเก่า',
  }
];

async function renderVersionsPage() {
  const container = document.getElementById('roblox-versions-grid');
  if (!container) return;

  const currentBadge = document.getElementById('version-page-current-badge');
  try {
    const ver = await api.getRobloxVersion();
    if (currentBadge) currentBadge.textContent = ver || 'ไม่พบการติดตั้ง';
  } catch {
    if (currentBadge) currentBadge.textContent = 'ไม่พบ';
  }

  container.innerHTML = ROBLOX_VERSIONS_LIST.map(item => `
    <div class="vm-card" style="display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span class="badge ${item.tagClass}" style="padding:4px 10px;font-weight:600">${esc(item.tag)}</span>
        <span class="vm-date-badge">${esc(item.date)}</span>
      </div>
      <div>
        <div style="font-size:15.5px;font-weight:700;color:var(--t1);letter-spacing:-0.01em;margin-bottom:4px">${esc(item.name)}</div>
        <div style="font-size:12px;color:var(--t2);line-height:1.5">${esc(item.desc)}</div>
      </div>
      <div class="vm-hash-box" title="${esc(item.hash)}">
        <span style="color:var(--t3);margin-right:4px">Hash:</span>${esc(item.hash)}
      </div>
      <button class="btn btn-primary" style="margin-top:2px;width:100%;height:42px;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:600;border-radius:10px;box-shadow:0 4px 16px var(--ac3)" onclick="installRobloxVersion('${item.hash}')">
        <span class="material-icons-round" style="font-size:18px">download</span>${t('ติดตั้งเวอร์ชันนี้')}
      </button>
    </div>
  `).join('');
}

window.installRobloxVersion = async function(hash) {
  if (!hash) return;
  const modal = document.getElementById('m-version-install');
  const title = document.getElementById('vinst-title');
  const sub = document.getElementById('vinst-sub');
  const bar = document.getElementById('vinst-bar');
  const pct = document.getElementById('vinst-pct');
  const status = document.getElementById('vinst-status');

  if (modal) modal.classList.add('open');
  if (title) title.textContent = t('กำลังดาวน์โหลด Roblox');
  if (sub) sub.textContent = t('กำลังดาวน์โหลดเวอร์ชัน {0} จาก Roblox CDN...', hash);
  if (bar) bar.style.width = '0%';
  if (pct) pct.textContent = '0%';
  if (status) status.textContent = t('กำลังเชื่อมต่อดาวน์โหลด...');

  api.onInstallProgress(data => {
    if (data.status === 'downloading') {
      if (bar) bar.style.width = data.percent + '%';
      if (pct) pct.textContent = data.percent + '%';
      if (status) status.textContent = t('ดาวน์โหลดไปแล้ว {0}%', data.percent);
    } else if (data.status === 'installing') {
      if (bar) bar.style.width = '100%';
      if (pct) pct.textContent = '100%';
      if (status) status.textContent = t('กำลังรันตัวติดตั้ง RobloxPlayerLauncher.exe...');
    } else if (data.status === 'done') {
      if (status) status.textContent = t('ติดตั้งเรียบร้อยแล้ว!');
      setTimeout(() => {
        if (modal) modal.classList.remove('open');
        toast('ดาวน์โหลดและสั่งรันตัวติดตั้ง Roblox เรียบร้อยแล้ว!', 'ok');
        renderVersionsPage();
      }, 1200);
    } else if (data.status === 'error') {
      if (status) status.textContent = 'เกิดข้อผิดพลาดในการดาวน์โหลด';
      setTimeout(() => {
        if (modal) modal.classList.remove('open');
        toast('เกิดข้อผิดพลาดในการดาวน์โหลดเวอร์ชัน Roblox', 'err');
      }, 2000);
    }
  });

  const res = await api.downloadRobloxVersion(hash);
  if (!res || !res.ok) {
    if (modal) modal.classList.remove('open');
    toast(res?.error || 'ดาวน์โหลดไม่สำเร็จ', 'err');
  }
};

window.installCustomVersionHash = function() {
  const input = document.getElementById('custom-version-hash-input');
  const hash = input ? input.value.trim() : '';
  if (!hash) {
    toast('กรุณากรอกรหัส Version Hash ก่อนกดติดตั้ง', 'err');
    return;
  }
  installRobloxVersion(hash);
};

function markLaunched(id) {
  _launchedIds.add(id);
  _launchTimestamps.set(id, Date.now()); // record launch timestamp
  const card = document.querySelector(`.card[data-id="${id}"]`);
  if (card) {
    card.classList.add('is-live');
    const dot = card.querySelector('.card-dot');
    if (dot) { dot.classList.add('launched'); dot.title = 'Launched'; }
  }
  refreshPkgAvatarStatus();
}

async function killOne(id) {
  const a = accounts.find(x => x.id === id);
  logEntry('warn', 'kill', `กำลังปิดอินสแตนซ์ Roblox ของ ${a ? a.username : id}...`, { accountId: id, username: a?.username, userId: a?.userId });
  const res = await api.killOneRoblox(id);
  if (!res || !res.ok) toast(res?.error || 'ไม่สามารถปิดอินสแตนซ์นั้นได้', 'err');
  else logEntry('ok', 'kill', `ปิดอินสแตนซ์ของ ${a ? a.username : id} แล้ว`, { accountId: id });
}

// ── Card context menu ─────────────────────────────────────────────────────
let _ctxMenuId = null;
function showCardMenu(id, x, y) {
  closeCardMenu();
  _ctxMenuId = id;
  const a = accounts.find(x => x.id === id);
  const isLive = _launchedIds.has(id);
  const menu = document.createElement('div');
  menu.id = 'card-ctx-menu';
  menu.className = 'ctx-menu';
  menu.innerHTML = `
    <div class="ctx-header">${esc(a ? (a.nickname || a.username || t('ไม่ทราบชื่อ')) : id)}</div>
    ${isLive ? `<button class="ctx-item ctx-danger" onclick="ctxKill('${id}')"><span class="material-icons-round">stop_circle</span>${t('ปิดอินสแตนซ์')}</button>` : ''}
    <button class="ctx-item" onclick="ctxLaunch('${id}')"><span class="material-icons-round">rocket_launch</span>${isLive ? t('เปิดใหม่') : t('เปิด')}</button>
    <button class="ctx-item" onclick="ctxOpenHome('${id}')"><span class="material-icons-round">home</span>${t('เปิดหน้าหลัก')}</button>
    <button class="ctx-item" onclick="ctxEdit('${id}')"><span class="material-icons-round">edit</span>${t('แก้ไขบัญชี')}</button>
    <div class="ctx-sep"></div>
    <button class="ctx-item" onclick="ctxInspectAvatar('${id}')"><span class="material-icons-round">face</span>${t('ดูอวตาร์ตัวละคร')}</button>
    <button class="ctx-item" onclick="ctxCopyId('${id}')"><span class="material-icons-round">tag</span>${t('คัดลอกรหัสผู้ใช้')}</button>
    <button class="ctx-item" onclick="ctxCopyUser('${id}')"><span class="material-icons-round">person</span>${t('คัดลอกชื่อผู้ใช้')}</button>
    <button class="ctx-item" onclick="ctxCopyCookie('${id}')"><span class="material-icons-round">cookie</span>${t('คัดลอกคุกกี้')}</button>
  `;
  document.body.appendChild(menu);
  // Position: keep on screen
  const r = menu.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  menu.style.left = Math.min(x, vw - 200) + 'px';
  menu.style.top = Math.min(y, vh - menu.offsetHeight - 10) + 'px';
  setTimeout(() => document.addEventListener('click', closeCardMenu, { once: true }), 0);
}
function closeCardMenu() { const m = document.getElementById('card-ctx-menu'); if (m) m.remove(); _ctxMenuId = null; }
async function ctxKill(id) { closeCardMenu(); await killOne(id); }
function ctxLaunch(id) { closeCardMenu(); const a = accounts.find(x => x.id === id); if (a) { launchAcc = a; openModal('m-launch'); } }
function ctxEdit(id) { closeCardMenu(); openEdit(id); }
function ctxCopyId(id) {
  closeCardMenu();
  const a = accounts.find(x => x.id === id);
  if (a?.userId) {
    if (window.api && window.api.copyToClipboard) window.api.copyToClipboard(String(a.userId));
    else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(String(a.userId));
    toast(t('คัดลอกรหัสผู้ใช้แล้ว'), 'ok');
  } else {
    toast(t('ไม่มีรหัสผู้ใช้'), 'err');
  }
}
function ctxCopyUser(id) {
  closeCardMenu();
  const a = accounts.find(x => x.id === id);
  if (a?.username) {
    if (window.api && window.api.copyToClipboard) window.api.copyToClipboard(a.username);
    else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(a.username);
    toast(t('คัดลอกชื่อผู้ใช้แล้ว'), 'ok');
  } else {
    toast(t('ไม่มีชื่อผู้ใช้'), 'err');
  }
}
async function ctxCopyCookie(id) {
  closeCardMenu();
  const a = accounts.find(x => x.id === id);
  if (!a || !a.cookie) {
    toast(t('ไม่มีคุกกี้สำหรับบัญชีนี้'), 'err');
    return;
  }
  try {
    if (window.api && window.api.copyToClipboard) {
      await window.api.copyToClipboard(a.cookie);
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(a.cookie);
    }
    toast(t('คัดลอกคุกกี้แล้ว'), 'ok');
  } catch (err) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(a.cookie);
        toast(t('คัดลอกคุกกี้แล้ว'), 'ok');
        return;
      }
    } catch (_) {}
    toast(t('คัดลอกไม่สำเร็จ:') + ' ' + (err?.message || ''), 'err');
  }
}
window.ctxCopyCookie = ctxCopyCookie;

function refreshPkgAvatarStatus() {
  document.querySelectorAll('.pkg-avatar[data-acc-id]').forEach(av => {
    av.classList.toggle('online', _launchedIds.has(av.dataset.accId));
  });
}

function render() {
  const grid = document.getElementById('grid'), empty = document.getElementById('empty'), sub = document.getElementById('acct-sub');
  sub.textContent = accounts.length ? accounts.length + ' ' + t('บัญชีที่บันทึกไว้') : t('ยังไม่มีบัญชีที่บันทึกไว้');
  const savedCount = document.getElementById('sb-saved-count');
  if (savedCount) savedCount.textContent = accounts.length ? accounts.length + ' ' + t('บัญชีที่บันทึกไว้') : t('ยังไม่มีบัญชีที่บันทึกไว้');
  const savedTime = document.getElementById('sb-saved-time'); if (savedTime) savedTime.textContent = t('บันทึกล่าสุดเมื่อสักครู่');
  if (!accounts.length) { grid.innerHTML = ''; empty.style.display = 'flex'; return; }
  empty.style.display = 'none';
  const list = visibleAccounts();
  grid.classList.toggle('list-view', _acctView === 'list');
  if (!list.length) {
    grid.classList.remove('list-view');
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--t3);font-size:12.5px;padding:40px 0">${t('ไม่มีบัญชีที่ตรงกับการค้นหาหรือตัวกรอง')}</div>`;
    return;
  }
  grid.innerHTML = list.map((a, i) => `
    <div class="card${_launchedIds.has(a.id) ? ' is-live' : ''}${_cookieStatus[a.id] === 'dead' ? ' cookie-dead' : ''}${(_selectMode && _selectedAccountIds.has(a.id)) ? ' is-selected' : ''}" data-id="${a.id}" style="animation-delay:${i * 18}ms" onclick="${_selectMode ? `toggleCardSelect('${a.id}')` : ''}">
      ${_selectMode ? `<div class="card-select-overlay" onclick="event.stopPropagation(); toggleCardSelect('${a.id}')"><div class="custom-chk ${_selectedAccountIds.has(a.id) ? 'checked' : ''}"><span class="material-icons-round">check</span></div></div>` : ''}
      <div class="card-dot${_launchedIds.has(a.id) ? ' launched' : ''}" title="${_launchedIds.has(a.id) ? t('เปิดอยู่') : t('ยังไม่เปิด')}"></div>
      ${_launchedIds.has(a.id) ? `<button class="card-kill" onclick="event.stopPropagation();killOne('${a.id}')" title="${t('ปิดอินสแตนซ์นี้')}"><span class="material-icons-round">close</span></button>` : ''}
      
      <div class="card-av" id="av-${a.id}">${(a.username || '?')[0].toUpperCase()}</div>
      <div class="card-id">
        <div class="card-name-row">
          <div class="card-name">${esc(a.nickname || a.username || t('ไม่ทราบชื่อ'))}</div>
          <span class="card-expired" title="${t('คุกกี้ของบัญชีนี้ไม่ถูกต้องแล้ว เพิ่มบัญชีใหม่เพื่ออัปเดต')}"><span class="material-icons-round">error_outline</span>${t('หมดอายุ')}</span>
        </div>
        <div class="card-uid">${a.userId ? t('รหัส ') + a.userId : t('ไม่มีรหัส')}</div>
      </div>
      <div class="card-game ${a.gameTarget ? 'visible' : ''}" id="gt-${a.id}" title="${esc(a.gameTarget || '')}">
        ${a.gameTarget ? esc(truncate(_gameNameCache[a.id] || extractTargetLabel(a.gameTarget), 22)) : ''}
      </div>
      <div class="card-row">
        <button class="btn btn-launch" onclick="openLaunch('${a.id}')">
          ${t('เริ่ม')}
        </button>
        <button class="btn btn-edit" onclick="openEdit('${a.id}')" title="${t('แก้ไข')}">
          <span class="material-icons-round">edit</span>
        </button>
        <button class="btn btn-del" onclick="removeAcc('${a.id}')" title="${t('ลบ')}">
          <span class="material-icons-round">delete_outline</span>
        </button>
      </div>
    </div>`).join('') + `<div class="card-add" onclick="openLogin()"><span class="material-icons-round card-add-icon">add</span><span class="card-add-label">${t('เพิ่มบัญชี')}</span></div>`;
  // Scope per-render work to the cards actually on screen. The grid is rebuilt
  // each render, so cached avatars/names still paint instantly; only uncached
  // lookups for visible cards hit the network, and filtered-out accounts are
  // resolved lazily when they next become visible (results stay cached).
  loadAvatarsBatch(list);
  list.forEach(a => { if (a.gameTarget && !_gameNameCache[a.id]) fetchGameName(a.id, a.gameTarget); });
  checkCookieHealth(list);
  // Bind right-click context menus to cards
  document.querySelectorAll('.card[data-id]').forEach(card => {
    card.addEventListener('contextmenu', e => { e.preventDefault(); showCardMenu(card.dataset.id, e.clientX, e.clientY); });
  });
  initDrag();
  
  // Translate static and dynamic DOM texts to the active language
  translateDOM();
}

// Cookie expiry detection. Validates each account's cookie once per session (the
// same authenticated endpoint used at login) and flags dead ones with a red
// badge so only genuinely-expired accounts need re-adding. Staggered so we never
// burst the endpoint, and cached so repeated renders don't re-check.
const _cookieStatus = {}; // id -> 'checking' | 'ok' | 'dead' | 'unknown'
function applyCookieStatus(id) {
  const card = document.querySelector(`.card[data-id="${id}"]`);
  if (card) card.classList.toggle('cookie-dead', _cookieStatus[id] === 'dead');
}
// On a launch auth failure, surface a likely-expired cookie immediately rather
// than waiting for the per-session health check. Only genuine auth/cookie errors
// flip the badge -- rate-limit (429) and transient HTTP errors are left alone so
// a temporary hiccup never mislabels a valid account.
function _flagCookieMaybeDead(id, error) {
  if (id && error && /cookie|expired|\b403\b/i.test(error)) {
    _cookieStatus[id] = 'dead';
    applyCookieStatus(id);
  }
}
let _cookieCheckRunning = false;
async function checkCookieHealth(list) {
  if (_cookieCheckRunning) return;
  const todo = list.filter(a => a.cookie && _cookieStatus[a.id] === undefined);
  if (!todo.length) return;
  _cookieCheckRunning = true;
  try {
    for (const a of todo) {
      if (_cookieStatus[a.id] !== undefined) continue;
      _cookieStatus[a.id] = 'checking';
      try {
        const res = await api.validateCookie(a.cookie);
        const st = (res && res.ok) ? 'ok' : 'dead';
        _cookieStatus[a.id] = st;
        if (st === 'dead') logEntry('warn', 'cookie', `Cookie invalid for ${a.username || a.id}`, { accountId: a.id, username: a.username || null, userId: a.userId || null });
        else logEntry('info', 'cookie', `Cookie valid for ${a.username || a.id}`, { accountId: a.id, username: a.username || null, userId: a.userId || null });
      } catch { _cookieStatus[a.id] = 'unknown'; logEntry('warn', 'cookie', `Cookie check failed for ${a.username || a.id}`, { accountId: a.id }); }
      applyCookieStatus(a.id);
      await new Promise(r => setTimeout(r, 200)); // stagger; avoid bursting the endpoint
    }
  } finally { _cookieCheckRunning = false; }
}

// Recheck ALL cookies every 60s so status stays live
let _recheckRunning = false;
const _cookieCheckedAt = {};            // id -> last validation epoch ms
const OK_RECHECK_MS = 5 * 60 * 1000;    // re-check known-good cookies at most every 5 min
async function recheckAllCookies(force) {
  if (_recheckRunning) return; // bail if a previous pass is still going
  _recheckRunning = true;
  // flag unchecked cookies as 'checking' before the first await, otherwise the
  // checkCookieHealth pass inside render() races us and validates them twice
  for (const a of accounts) if (a.cookie && _cookieStatus[a.id] === undefined) _cookieStatus[a.id] = 'checking';
  try {
  let changed = false;
  const now = Date.now();
  for (const a of accounts) {
    if (!a.cookie) continue;
    // good cookies only get re-checked every few minutes to keep the request
    // rate down; dead/unknown ones are retried every tick so a recovery shows
    // up fast. force (the decrypt pass) ignores this and checks everything.
    if (!force && _cookieStatus[a.id] === 'ok' && _cookieCheckedAt[a.id] && (now - _cookieCheckedAt[a.id]) < OK_RECHECK_MS) continue;
    const prev = _cookieStatus[a.id];
    _cookieStatus[a.id] = 'checking';
    try {
      const res = await api.validateCookie(a.cookie);
      _cookieCheckedAt[a.id] = Date.now();
      const next = (res && res.ok) ? 'ok' : 'dead';
      if (next !== prev) {
        _cookieStatus[a.id] = next;
        applyCookieStatus(a.id); // toggles .cookie-dead on the card (badge + ring)
        changed = true;
        if (next === 'dead') logEntry('warn', 'cookie', `Cookie expired for ${a.username || a.id}`, { accountId: a.id, username: a.username, userId: a.userId });
        else if (prev === 'dead' && next === 'ok') logEntry('ok', 'cookie', `Cookie re-validated for ${a.username || a.id}`, { accountId: a.id, username: a.username, userId: a.userId });
      } else {
        _cookieStatus[a.id] = next;
      }
    } catch { _cookieStatus[a.id] = prev || 'unknown'; }
    await new Promise(r => setTimeout(r, 300));
  }
  if (changed) render(); // rebuild once at the end so the cards match
  } finally { _recheckRunning = false; }
}
setInterval(() => { if (accounts.length) recheckAllCookies(false); }, 60000);


const _gameNameCache = {}; // accountId -> resolved game name
// Persistent target -> resolved name map. Game names are stable, so caching them
// across restarts avoids re-resolving every launch. Stored in localStorage
// (available in the Electron renderer, same as the theme setting).
let _gameNamePersist = {};
try { _gameNamePersist = JSON.parse(localStorage.getItem('mr-gamenames') || '{}'); } catch { _gameNamePersist = {}; }
function _saveGameNames() { try { localStorage.setItem('mr-gamenames', JSON.stringify(_gameNamePersist)); } catch {} }

function extractTargetLabel(target) {
  if (!target) return '';
  const t = target.trim();
  if (/^\d+$/.test(t)) return t;
  try {
    const u = new URL(t.startsWith('http') ? t : 'https://' + t);
    const parts = u.pathname.split('/').filter(Boolean);
    // extract linkCode or share code for private servers
    const name = (parts[2] || parts[1] || '').replace(/-/g, ' ').trim();
    return name || u.hostname;
  } catch { return truncate(target, 22); }
}

async function fetchGameName(accountId, target) {
  if (!target) return;
  const t = target.trim();
  // Persistent cache hit: skip the network entirely.
  if (_gameNamePersist[t]) {
    _gameNameCache[accountId] = _gameNamePersist[t];
    updateGameLabel(accountId);
    return;
  }
  // Find the account to get its cookie for authenticated requests
  const acct = accounts.find(a => a.id === accountId);
  const cookie = acct ? acct.cookie : null;
  let placeId = null;
  if (/^\d+$/.test(t)) {
    placeId = t;
  } else {
    try {
      const u = new URL(t.startsWith('http') ? t : 'https://' + t);
      const parts = u.pathname.split('/').filter(Boolean);
      // /games/<placeId>/... or /games/<placeId>
      if (parts[0] === 'games' && parts[1] && /^\d+$/.test(parts[1])) placeId = parts[1];
      if (!placeId) placeId = u.searchParams.get('placeId');
      // PlaceLauncher URLs: ?placeId=...
      if (!placeId) { const m = t.match(/[?&]placeId=(\d+)/); if (m) placeId = m[1]; }
    } catch {}
  }
  if (!cookie) {
    _gameNameCache[accountId] = extractTargetLabel(target);
    updateGameLabel(accountId);
    return;
  }
  // Fetch via main process (authenticated with cookie)
  const name = await api.getGameName(placeId || t, cookie);
  _gameNameCache[accountId] = name || extractTargetLabel(target);
  // Persist only genuine resolved names (not the raw fallback label).
  if (name) { _gameNamePersist[t] = name; _saveGameNames(); }
  updateGameLabel(accountId);
}

function updateGameLabel(accountId) {
  const el = document.getElementById('gt-' + accountId);
  if (!el) return;
  const a = accounts.find(x => x.id === accountId);
  if (!a || !a.gameTarget) return;
  el.textContent = truncate(_gameNameCache[accountId] || extractTargetLabel(a.gameTarget), 22);
}

function truncate(s, n) { return s.length > n ? s.slice(0, n) + '\u2026' : s; }

let _dragSaveTimer = null;
let _dragging = null, _dragClone = null, _dragOffX = 0, _dragOffY = 0, _dragOverId = null;

function initDrag() {
  const grid = document.getElementById('grid');

  grid.querySelectorAll('.card').forEach(card => {
    const startEl = card;

    startEl.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      // Do not trigger drag if clicking buttons, select overlay checkboxes, or control panels
      if (e.target.closest('button') || e.target.closest('.card-select-overlay') || e.target.closest('.custom-chk') || e.target.closest('.card-kill')) return;
      e.preventDefault();

      _dragging = card;
      const rect = card.getBoundingClientRect();
      _dragOffX = e.clientX - rect.left;
      _dragOffY = e.clientY - rect.top;

      // Create floating clone
      _dragClone = card.cloneNode(true);
      _dragClone.querySelectorAll('.card-kill, .drag-handle').forEach(el => el.remove());
      _dragClone.style.cssText = `
        position:fixed;left:${rect.left}px;top:${rect.top}px;
        width:${rect.width}px;height:${rect.height}px;
        opacity:0.85;pointer-events:none;z-index:9999;
        box-shadow:0 16px 40px rgba(0,0,0,.6);
        transform:scale(1.04);border-color:var(--ac);
        transition:box-shadow .15s;border-radius:var(--r);
        background:var(--s2);border:1px solid var(--ac);
      `;
      if (grid.classList.contains('list-view')) _dragClone.classList.add('drag-list-clone');
      document.body.appendChild(_dragClone);
      card.style.opacity = '0.3';

      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    });
  });
}

function onDragMove(e) {
  if (!_dragging || !_dragClone || !_dragging.isConnected) return;
  _dragClone.style.left = (e.clientX - _dragOffX) + 'px';
  _dragClone.style.top  = (e.clientY - _dragOffY) + 'px';

  // nudge the scroll when the cursor gets near the top/bottom edge
  const wrap = document.querySelector('.grid-wrap');
  if (wrap) {
    const wr = wrap.getBoundingClientRect();
    if (e.clientY < wr.top + 60) wrap.scrollTop -= 16;
    else if (e.clientY > wr.bottom - 60) wrap.scrollTop += 16;
  }

  // Find the card under the cursor (no need to hide the clone since it has pointer-events: none)
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const target = el ? el.closest('.card[data-id]') : null;
  if (!target || target === _dragging) return;
  const newId = target.dataset.id;
  if (newId === _dragOverId) return; // already settled against this neighbour
  _dragOverId = newId;

  // Live-reorder by moving the dragged node in place -- no full re-render, so
  // the node (and its listeners) persists and the grid only reflows. Direction
  // mirrors the old swap-to-target-index behaviour.
  const grid = document.getElementById('grid');
  const cards = Array.from(grid.querySelectorAll('.card[data-id]'));
  const srcPos = cards.indexOf(_dragging);
  const tgtPos = cards.indexOf(target);
  if (srcPos < 0 || tgtPos < 0) return;
  grid.insertBefore(_dragging, srcPos < tgtPos ? target.nextSibling : target);
  _syncAccountsOrderFromDom();
}

// Reorder the `accounts` array to match the current on-screen card order.
// Only the slots occupied by currently-visible cards are reassigned; accounts
// hidden by an active search/filter keep their positions, so dragging within a
// filtered view never disturbs the rest of the list.
function _syncAccountsOrderFromDom() {
  const grid = document.getElementById('grid');
  const visIds = Array.from(grid.querySelectorAll('.card[data-id]')).map(c => c.dataset.id);
  const visSet = new Set(visIds);
  const byId = new Map(accounts.filter(a => visSet.has(a.id)).map(a => [a.id, a]));
  const queue = visIds.map(id => byId.get(id)).filter(Boolean);
  let qi = 0;
  accounts = accounts.map(a => (visSet.has(a.id) ? queue[qi++] : a));
}

function onDragEnd() {
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);

  if (_dragClone) { _dragClone.remove(); _dragClone = null; }
  if (_dragging) { _dragging.style.opacity = ''; _dragging = null; }
  _dragOverId = null;

  // Re-sync accounts order array from final DOM layout
  _syncAccountsOrderFromDom();

  clearTimeout(_dragSaveTimer);
  _dragSaveTimer = setTimeout(() => {
    api.reorderAccounts(accounts.map(a => a.id));
  }, 400);
}

function loadAvatar(id, uid) {
  if (_avatarCache[uid]) {
    const el = document.getElementById('av-' + id);
    if (el) el.innerHTML = '<img src="' + _avatarCache[uid] + '" alt=""/>';
    return;
  }
  fetch('https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=' + uid + '&size=48x48&format=Png')
    .then(r => r.json()).then(d => {
      const url = d?.data?.[0]?.imageUrl;
      if (url) {
        _avatarCache[uid] = url;
        const el = document.getElementById('av-' + id);
        if (el) el.innerHTML = '<img src="' + esc(url) + '" alt=""/>';
      }
    }).catch(() => {});
}

// Batched avatar load: one request for every uncached account instead of one per
// account. The thumbnails endpoint takes up to 100 ids per call. Falls back to
// per-account fetches if a batch fails, so behaviour is never worse than before.
async function loadAvatarsBatch(list) {
  const paint = a => {
    if (a.userId && _avatarCache[a.userId]) {
      const el = document.getElementById('av-' + a.id);
      if (el && !el.querySelector('img')) el.innerHTML = '<img src="' + _avatarCache[a.userId] + '" alt=""/>';
    }
  };
  const need = [], seen = new Set();
  for (const a of list) {
    if (!a.userId) continue;
    if (_avatarCache[a.userId]) { paint(a); continue; }
    if (!seen.has(a.userId)) { seen.add(a.userId); need.push(a.userId); }
  }
  for (let i = 0; i < need.length; i += 100) {
    const chunk = need.slice(i, i + 100);
    try {
      const r = await fetch('https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=' + chunk.join(',') + '&size=48x48&format=Png');
      const d = await r.json();
      (d?.data || []).forEach(item => { if (item && item.targetId && item.imageUrl) _avatarCache[item.targetId] = item.imageUrl; });
      list.forEach(paint);
    } catch {
      chunk.forEach(uid => { const a = list.find(x => x.userId === uid); if (a) loadAvatar(a.id, uid); });
    }
  }
}

function loadPkgAvatar(pkgId, accountId, uid, attempt) {
  const elId = 'pkg-av-' + pkgId + '-' + accountId;
  const paint = url => {
    _avatarCache[uid] = url;
    const el = document.getElementById(elId);
    if (el) el.innerHTML = '<img src="' + esc(url) + '" alt=""/><span class="pkg-avatar-dot"></span>';
  };
  if (_avatarCache[uid]) { paint(_avatarCache[uid]); return; }
  fetch('https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=' + uid + '&size=48x48&format=Png')
    .then(r => r.json()).then(d => {
      const item = d?.data?.[0];
      if (item && item.imageUrl && item.state === 'Completed') { paint(item.imageUrl); return; }
      // Roblox returns Pending while it generates the thumbnail; retry briefly.
      if (item && item.state === 'Pending' && (attempt || 0) < 3) {
        setTimeout(() => loadPkgAvatar(pkgId, accountId, uid, (attempt || 0) + 1), 1500);
      } else if (item && item.imageUrl) { paint(item.imageUrl); }
    }).catch(() => {});
}

// ── Avatar hover card ───────────────────────────────────────────────────────
const _userInfoCache = {};
function loadUserInfo(uid, cb) {
  if (_userInfoCache[uid]) { cb(_userInfoCache[uid]); return; }
  fetch('https://users.roblox.com/v1/users/' + uid)
    .then(r => r.json()).then(d => { _userInfoCache[uid] = d; cb(d); })
    .catch(() => cb(null));
}

function positionAvTip(av, tip) {
  const rect = av.getBoundingClientRect();
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  let left = rect.left + rect.width / 2 - tw / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
  let top = rect.top - th - 10;
  if (top < 8) top = rect.bottom + 10;
  tip.style.left = left + 'px';
  tip.style.top = top + 'px';
}

function showAvTip(av) {
  const uid = av.dataset.uid || '';
  const uname = av.dataset.uname || '';
  const nick = av.dataset.nick || '';
  const tip = document.getElementById('av-tip');
  tip.dataset.uid = uid;
  document.getElementById('av-tip-name').textContent = nick && nick !== uname ? nick : (uname || 'ไม่ทราบชื่อ');
  document.getElementById('av-tip-uname').textContent = uname ? '@' + uname : (uid ? 'ID ' + uid : '');
  const avEl = document.getElementById('av-tip-av');
  avEl.innerHTML = _avatarCache[uid] ? '<img src="' + _avatarCache[uid] + '" alt=""/>' : (uname || '?')[0].toUpperCase();
  document.getElementById('av-tip-created').textContent = uid ? 'กำลังโหลด...' : 'ไม่ทราบ';
  tip.classList.add('show');
  positionAvTip(av, tip);
  if (uid) {
    loadUserInfo(uid, info => {
      if (tip.dataset.uid !== uid || !tip.classList.contains('show')) return;
      const createdEl = document.getElementById('av-tip-created');
      if (info && info.created) {
        const d = new Date(info.created);
        createdEl.textContent = 'Created ' + d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      } else {
        createdEl.textContent = 'ไม่ทราบ';
      }
      positionAvTip(av, tip);
    });
  }
}

function hideAvTip() {
  document.getElementById('av-tip').classList.remove('show');
}

document.addEventListener('mouseover', e => {
  const av = e.target.closest('.pkg-avatar:not(.more)');
  if (av) showAvTip(av);
});
document.addEventListener('mouseout', e => {
  const av = e.target.closest('.pkg-avatar:not(.more)');
  if (av && !(e.relatedTarget && av.contains(e.relatedTarget))) hideAvTip();
});
window.addEventListener('scroll', hideAvTip, true);

function _showPanel(panel) {
  ['choose','cookie','browser'].forEach(p => {
    const el = document.getElementById('login-panel-' + p);
    if (!el) return;
    if (p === panel) {
      el.style.display = '';
      el.classList.remove('modal-step-enter');
      void el.offsetWidth;
      el.classList.add('modal-step-enter');
    } else {
      el.style.display = 'none';
      el.classList.remove('modal-step-enter');
    }
  });
  
  const loginModal = document.querySelector('#m-login .modal');
  if (loginModal) {
    if (panel === 'browser') loginModal.classList.add('browser-active');
    else loginModal.classList.remove('browser-active');
  }

  if (panel !== 'browser' && window.api && window.api.hideLoginView) {
    window.api.hideLoginView();
  }
  document.getElementById('btn-cookie-add').style.display = panel === 'cookie' ? '' : 'none';
  document.getElementById('btn-login-back').style.display = panel === 'choose' ? 'none' : '';
  setStatus('login-status', 'hidden', '');
}

let _loginBoundsSyncTimer = null;

function startLoginBoundsSync() {
  stopLoginBoundsSync();
  let ticks = 0;
  _loginBoundsSyncTimer = setInterval(() => {
    ticks++;
    const panel = document.getElementById('login-panel-browser');
    const modal = document.getElementById('m-login');
    if (!panel || panel.style.display === 'none' || !modal || !modal.classList.contains('open')) {
      stopLoginBoundsSync();
      return;
    }
    const bounds = getLoginViewBounds();
    if (bounds && bounds.width > 0 && bounds.height > 0 && window.api && window.api.updateLoginBounds) {
      window.api.updateLoginBounds(bounds);
    }
    if (ticks > 30) {
      stopLoginBoundsSync();
    }
  }, 80);
}

function stopLoginBoundsSync() {
  if (_loginBoundsSyncTimer) {
    clearInterval(_loginBoundsSyncTimer);
    _loginBoundsSyncTimer = null;
  }
}

function cancelLogin() {
  stopLoginBoundsSync();
  closeModal('m-login');
  if (window.api && window.api.hideLoginView) window.api.hideLoginView();
  if (window.api && window.api.cancelLogin) window.api.cancelLogin();
}

function openLogin() {
  document.getElementById('cookie-input').value = '';
  _showPanel('choose');
  openModal('m-login');
}

function showCookiePanel() {
  stopLoginBoundsSync();
  _showPanel('cookie');
  setTimeout(() => document.getElementById('cookie-input').focus(), 50);
}

function backToChoose() {
  stopLoginBoundsSync();
  _showPanel('choose');
}

function getLoginViewBounds() {
  const container = document.getElementById('login-view-container');
  if (!container) return null;
  const rect = container.getBoundingClientRect();
  return {
    x: Math.round(rect.left),
    y: Math.round(rect.top),
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  };
}

async function startBrowserLogin() {
  _showPanel('browser');
  startLoginBoundsSync();
  await new Promise(r => setTimeout(r, 450)); // Wait for modal CSS transition (400ms) to complete before calculating bounds
  const bounds = getLoginViewBounds();
  const res = await api.openLogin(bounds);
  startLoginBoundsSync();
  if (!document.getElementById('m-login').classList.contains('open')) {
    stopLoginBoundsSync();
    return;
  }
  if (!res || !res.success) {
    stopLoginBoundsSync();
    if (res && res.error && res.error !== 'หน้าต่างเข้าสู่ระบบถูกปิด') {
      _showPanel('choose');
      setStatus('login-status', 'err', '<span class="material-icons-round">error_outline</span>' + esc(res.error));
    } else {
      closeModal('m-login');
    }
    return;
  }
  stopLoginBoundsSync();
  await finishLogin(res);
}

if (window.api && window.api.onLoginError) {
  window.api.onLoginError((err) => {
    const waiting = document.getElementById('login-waiting');
    if (waiting) {
      waiting.innerHTML = `<span class="material-icons-round" style="font-size:36px;color:var(--red);">error_outline</span><div style="font-size:13px;color:var(--t1);font-weight:600;">${t('เชื่อมต่อหน้าเว็บ Roblox ไม่สำเร็จ')} (${esc(err?.errorDescription || '')})</div><div style="font-size:11px;color:var(--t3);">${t('กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต หรือใช้วิธีวางคุกกี้')}</div>`;
    }
  });
}

window.addEventListener('resize', () => {
  const loginPanel = document.getElementById('login-panel-browser');
  if (loginPanel && loginPanel.style.display !== 'none') {
    const bounds = getLoginViewBounds();
    if (bounds && api.updateLoginBounds) api.updateLoginBounds(bounds);
  }
});

async function addByCookie() {
  const rawInput = document.getElementById('cookie-input').value.trim();
  if (!rawInput) return;

  // Search for cookies in the pasted text using regex
  const regex = /_\|WARNING:-DO-NOT-SHARE-THIS\.[^;\s"'\r\n]+/g;
  const cookies = [...rawInput.matchAll(regex)].map(m => m[0]);

  if (!cookies.length) {
    // Fallback: try raw cookie value
    let cookie = rawInput;
    if (cookie.startsWith('.ROBLOSECURITY=')) cookie = cookie.slice('.ROBLOSECURITY='.length);
    if (cookie.startsWith('ROBLOSECURITY=')) cookie = cookie.slice('ROBLOSECURITY='.length);
    cookie = cookie.replace(/^["']|["']$/g, '').trim();
    if (cookie && cookie.length > 100) {
      cookies.push(cookie);
    }
  }

  if (!cookies.length) {
    setStatus('login-status', 'err', '<span class="material-icons-round">error_outline</span>' + t('ไม่พบคุกกี้ Roblox ในข้อความที่วาง'));
    return;
  }

  const btn = document.getElementById('btn-cookie-add');
  btn.disabled = true;
  btn.innerHTML = '<div class="spin"></div>' + t('กำลังตรวจสอบ...');
  setStatus('login-status', 'load', `<div class="spin"></div>${t('กำลังตรวจสอบและเพิ่มบัญชี')} (${cookies.length} ${t('รายการ')})...`);

  let addedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    setStatus('login-status', 'load', `<div class="spin"></div>${t('กำลังตรวจสอบและเพิ่มบัญชี')} ${i+1}/${cookies.length}...`);
    const res = await api.validateCookie(cookie);
    if (res && res.ok) {
      const a = await api.addAccount({ username: res.username, userId: res.userId, cookie: cookie, gameTarget: '', nickname: res.displayName || res.username });
      if (a) {
        const existingIdx = accounts.findIndex(acc => acc.id === a.id);
        if (existingIdx !== -1) {
          accounts[existingIdx] = a;
        } else {
          accounts.push(a);
        }
        addedCount++;
      } else {
        failedCount++;
      }
    } else {
      failedCount++;
    }
  }

  btn.disabled = false;
  btn.innerHTML = '<span class="material-icons-round" style="font-size:15px">check</span>' + t('เพิ่มบัญชี');
  render();

  if (addedCount > 0) {
    setStatus('login-status', 'ok', '<span class="material-icons-round">check_circle</span>' + t('นำเข้าสำเร็จ {0} บัญชี (ล้มเหลว {1} บัญชี)', addedCount, failedCount));
    setTimeout(() => {
      closeModal('m-login');
      toast(t('นำเข้าสำเร็จ {0} บัญชี', addedCount), 'ok');
    }, 1500);
  } else {
    setStatus('login-status', 'err', '<span class="material-icons-round">error_outline</span>' + t('นำเข้าล้มเหลวทุกบัญชี ({0} บัญชี)', failedCount));
  }
}

function cancelLogin() {
  closeModal('m-login');
  api.cancelLogin && api.cancelLogin();
}

async function finishLogin(res) {
  setStatus('login-status', 'ok', '<span class="material-icons-round">check_circle</span>' + t('เข้าสู่ระบบเป็น') + ' ' + esc(res.username));
  const a = await api.addAccount({ username: res.username, userId: res.userId, cookie: res.cookie, gameTarget: '', nickname: res.displayName || res.username });
  const existingIdx = accounts.findIndex(acc => acc.id === a.id);
  if (existingIdx !== -1) {
    accounts[existingIdx] = a;
  } else {
    accounts.push(a);
  }
  render();
  setTimeout(() => {
    closeModal('m-login');
    toast('เพิ่ม ' + esc(res.username) + ' แล้ว', 'ok');
    const grid = document.getElementById('grid');
    if (grid) grid.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 800);
}

function openEdit(id) {
  editAcc = accounts.find(a => a.id === id); if (!editAcc) return;
  document.getElementById('edit-title').textContent = 'แก้ไข - ' + (editAcc.nickname || editAcc.username);
  document.getElementById('in-nickname').value = editAcc.nickname || '';
  document.getElementById('in-target').value = editAcc.gameTarget || '';
  document.getElementById('in-winx').value = editAcc.windowX !== undefined ? editAcc.windowX : '';
  document.getElementById('in-winy').value = editAcc.windowY !== undefined ? editAcc.windowY : '';
  document.getElementById('in-winw').value = editAcc.windowWidth !== undefined ? editAcc.windowWidth : '';
  document.getElementById('in-winh').value = editAcc.windowHeight !== undefined ? editAcc.windowHeight : '';
  openModal('m-edit');
  setTimeout(() => document.getElementById('in-target').focus(), 220);
}
async function saveEdit() {
  if (!editAcc) return;
  const target = document.getElementById('in-target').value.trim();
  const nickname = document.getElementById('in-nickname').value.trim();
  const wx = document.getElementById('in-winx').value.trim();
  const wy = document.getElementById('in-winy').value.trim();
  const ww = document.getElementById('in-winw').value.trim();
  const wh = document.getElementById('in-winh').value.trim();
  
  const windowX = wx === '' ? undefined : parseInt(wx, 10);
  const windowY = wy === '' ? undefined : parseInt(wy, 10);
  const windowWidth = ww === '' ? undefined : parseInt(ww, 10);
  const windowHeight = wh === '' ? undefined : parseInt(wh, 10);

  const updated = await api.updateAccount(editAcc.id, { 
    gameTarget: target, 
    nickname,
    windowX,
    windowY,
    windowWidth,
    windowHeight
  });
  if (updated) {
    const idx = accounts.findIndex(a => a.id === editAcc.id);
    if (idx !== -1) {
      accounts[idx] = updated;
      delete _gameNameCache[editAcc.id]; // clear stale name
      render();
      if (target) fetchGameName(editAcc.id, target); // fetch new name immediately
    } else { render(); }
  }
  closeModal('m-edit');
  toast('บันทึกแล้ว', 'ok');
}

window.captureEditModalPosition = async function() {
  if (!editAcc) return;
  toast('กำลังตรวจจับตำแหน่งหน้าต่าง...', 'info');
  const pos = await api.captureRobloxPosition(editAcc.id);
  if (pos) {
    document.getElementById('in-winx').value = pos.x;
    document.getElementById('in-winy').value = pos.y;
    document.getElementById('in-winw').value = pos.width;
    document.getElementById('in-winh').value = pos.height;
    toast('ตรวจจับพิกัดหน้าต่างเรียบร้อยแล้ว!', 'ok');
  } else {
    toast('ไม่พบหน้าต่าง Roblox ที่กำลังรันสำหรับบัญชีนี้', 'err');
  }
};

function confirmAction(message, onConfirm) {
  document.getElementById('m-confirm-delete-msg').textContent = message;
  const btn = document.getElementById('m-confirm-delete-btn');
  const newBtn = btn.cloneNode(true); // clone to remove old listeners
  btn.parentNode.replaceChild(newBtn, btn);
  newBtn.addEventListener('click', () => { closeModal('m-confirm-delete'); onConfirm(); });
  openModal('m-confirm-delete');
}

async function removeAcc(id) {
  const a = accounts.find(x => x.id === id);
  if (!a) return;
  confirmAction('ลบ "' + a.username + '" ใช่ไหม? การกระทำนี้ย้อนกลับไม่ได้', async () => {
    await api.removeAccount(id); accounts = accounts.filter(x => x.id !== id); render();
    if (packages.some(p => p.accountIds.includes(id))) {
      packages.forEach(p => { p.accountIds = p.accountIds.filter(aid => aid !== id); });
      api.savePackages(packages);
      renderPackages();
    }
    toast('ลบ ' + a.username + ' แล้ว', 'err');
  });
}
async function clearAll() {
  if (!accounts.length) return;
  confirmAction('ลบบัญชีทั้งหมด ' + accounts.length + ' บัญชีใช่ไหม? การกระทำนี้ย้อนกลับไม่ได้', async () => {
    for (const a of accounts) await api.removeAccount(a.id);
    accounts = []; render(); document.getElementById('stat-count').textContent = '0';
    packages.forEach(p => { p.accountIds = []; });
    api.savePackages(packages);
    renderPackages();
    toast('ลบบัญชีทั้งหมดแล้ว', 'err');
  });
}

function openLaunch(id) {
  launchAcc = accounts.find(a => a.id === id); if (!launchAcc) return;
  const target = launchAcc.gameTarget || '';
  const gameName = _gameNameCache[launchAcc.id] || (target ? extractTargetLabel(target) : '');
  const p = document.getElementById('launch-prev');
  p.innerHTML = '<div class="launch-av" id="prev-av">' + esc((launchAcc.username || '?')[0].toUpperCase()) + '</div>' +
    '<div class="launch-info"><div class="launch-name">' + esc(launchAcc.username) + '</div>' +
    '<div class="launch-sub">' + esc(gameName || 'เปิดหน้าแรก') + '</div></div>';
  // Avatar
  if (launchAcc.userId) {
    fetch('https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=' + launchAcc.userId + '&size=48x48&format=Png')
      .then(r => r.json()).then(d => {
        const url = d?.data?.[0]?.imageUrl, el = document.getElementById('prev-av');
        if (url && el) el.innerHTML = '<img src="' + esc(url) + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>';
      }).catch(() => {});
  }

  setStatus('launch-status', 'hidden', '');
  const btn = document.getElementById('btn-launch');
  btn.disabled = false; btn.innerHTML = 'เริ่ม';
  if (window.setLaunchMode) window.setLaunchMode('home');
  const targetInput = document.getElementById('launch-place-input');
  if (targetInput) targetInput.value = launchAcc.gameTarget || '';
  const previewBox = document.getElementById('launch-place-preview');
  if (previewBox) {
    previewBox.style.display = 'none';
    previewBox.innerHTML = '';
    if (targetInput && targetInput.value) handlePlaceInput(targetInput.value);
  }
  openModal('m-launch');
}
async function doLaunch() {
  if (!launchAcc) return;
  const btn = document.getElementById('btn-launch');
  if (btn.disabled) return;
  
  const mode = _singleLaunchMode;
  let customTarget = null;
  if (mode === 'game') {
    customTarget = document.getElementById('launch-place-input').value.trim() || launchAcc.gameTarget || null;
  }
  
  btn.disabled = true; btn.innerHTML = '<div class="spin"></div>' + t('กำลังเปิดเกม...');
  setStatus('launch-status', 'load', '<div class="spin"></div>' + t('กำลังขอ auth ticket...'));
  logEntry('info', 'launch', `กำลังเปิด Roblox สำหรับ ${launchAcc.username || launchAcc.id}...`, { accountId: launchAcc.id, username: launchAcc.username, userId: launchAcc.userId, target: customTarget || 'หน้าแรก Roblox' });
  const res = await api.launchRoblox(launchAcc.id, launchAcc.cookie, customTarget);
  if (!res.success) {
    logEntry('err', 'launch', `เปิดไม่สำเร็จสำหรับ ${launchAcc.username || launchAcc.id}: ${res.error}`, { accountId: launchAcc.id });
    setStatus('launch-status', 'err', '<span class="material-icons-round">error_outline</span>' + esc(res.error));
    _flagCookieMaybeDead(launchAcc.id, res.error);
    btn.disabled = false; btn.innerHTML = t('เริ่ม');
    return;
  }
  setStatus('launch-status', 'ok', '<span class="material-icons-round">check_circle</span>' + t('เปิดเกมแล้วในชื่อ') + ' ' + launchAcc.username);
  logEntry('ok', 'launch', `เปิด Roblox สำเร็จในชื่อ ${launchAcc.username || launchAcc.id}`, { accountId: launchAcc.id, username: launchAcc.username, userId: launchAcc.userId });
  markLaunched(launchAcc.id);
  setTimeout(() => { closeModal('m-launch'); toast(t('เปิดเกมแล้วในชื่อ') + ' ' + launchAcc.username, 'ok'); }, 700);
}

// ── Packages ──────────────────────────────────────────────────────────────
function renderPackages() {
  const list = document.getElementById('pkg-list'), empty = document.getElementById('pkg-empty');
  if (!list) return;
  if (!packages.length) { list.innerHTML = ''; empty.style.display = 'flex'; return; }
  empty.style.display = 'none';
  list.innerHTML = packages.map((p, i) => {
    const members = (p.accountIds || []).map(id => accounts.find(a => a.id === id)).filter(Boolean);
    const shown = members.slice(0, 6);
    const extra = members.length - shown.length;
    const avatarsHtml = shown.map(m => `<div class="pkg-avatar${_launchedIds.has(m.id) ? ' online' : ''}" id="pkg-av-${p.id}-${m.id}" data-acc-id="${m.id}" data-uid="${m.userId || ''}" data-uname="${esc(m.username || '')}" data-nick="${esc(m.nickname || '')}">${(m.username || '?')[0].toUpperCase()}<span class="pkg-avatar-dot"></span></div>`).join('')
      + (extra > 0 ? `<div class="pkg-avatar more">+${extra}</div>` : '');
    return `
    <div class="pkg-card" data-id="${p.id}" style="animation-delay:${i * 18}ms">
      <div class="pkg-card-top">
        <div class="pkg-card-info">
          <div class="pkg-name">${esc(p.name)}</div>
          <div class="pkg-meta">${members.length} ${t(members.length === 1 ? 'account' : 'accounts')}</div>
        </div>
        <div class="pkg-avatars">${avatarsHtml}</div>
        <div class="pkg-card-actions">
          <button class="btn btn-edit" onclick="openEditPackage('${p.id}')" title="${t('จัดการบัญชี')}">
            <span class="material-icons-round">group</span>
          </button>
          <button class="btn btn-del" onclick="deletePackage('${p.id}')" title="${t('ลบกลุ่ม')}">
            <span class="material-icons-round">delete_outline</span>
          </button>
        </div>
      </div>
      <div class="pkg-link-row">
        <div class="pkg-link-field">
          <span class="material-icons-round pkg-link-icon">link</span>
          <input type="text" class="pkg-link-input" id="pkg-link-${p.id}" placeholder="${t('ใส่ Game ID หรือ ลิงก์เซิร์ฟเวอร์เพื่อให้ทุกคนเข้าร่วม…')}"
            value="${esc(p.link || '')}" onchange="setPackageLink('${p.id}', this.value)"
            onkeydown="if(event.key==='Enter'){this.blur();launchPackage('${p.id}');}"/>
        </div>
        <button class="btn btn-launch pkg-launch-btn" onclick="launchPackage('${p.id}')" ${members.length ? '' : 'disabled'}>
          ${t('เริ่มทั้งหมด')}
        </button>
      </div>
      <div class="pkg-progress" id="pkg-progress-${p.id}"></div>
    </div>`;
  }).join('');
  packages.forEach(p => {
    (p.accountIds || []).slice(0, 6).forEach(id => {
      const m = accounts.find(a => a.id === id);
      if (m && m.userId) loadPkgAvatar(p.id, m.id, m.userId);
    });
  });
  refreshPkgAvatarStatus();
  
  // Apply localization
  translateDOM();
}

function openCreatePackage() {
  editingPackageId = null;
  document.getElementById('pkg-modal-title').textContent = t('กลุ่มใหม่');
  document.getElementById('in-pkg-name').value = '';
  renderPackagePicker([]);
  openModal('m-package');
  setTimeout(() => document.getElementById('in-pkg-name').focus(), 220);
}

function openEditPackage(id) {
  const p = packages.find(x => x.id === id); if (!p) return;
  editingPackageId = id;
  document.getElementById('pkg-modal-title').textContent = t('แก้ไขกลุ่ม');
  document.getElementById('in-pkg-name').value = p.name || '';
  renderPackagePicker(p.accountIds || []);
  openModal('m-package');
}

function renderPackagePicker(selectedIds) {
  const wrap = document.getElementById('pkg-account-picker');
  if (!accounts.length) {
    wrap.innerHTML = `<div class="pkg-pick-empty">${t('ยังไม่มีบัญชี เพิ่มจากแท็บบัญชีก่อน')}</div>`;
    updatePkgCount();
    return;
  }
  wrap.innerHTML = accounts.map(a => {
    const avImg = (a.userId && _avatarCache[a.userId]) 
      ? `<img src="${esc(_avatarCache[a.userId])}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
      : esc((a.username || '?')[0].toUpperCase());
    return `
    <label class="pm-row">
      <input type="checkbox" value="${a.id}" ${selectedIds.includes(a.id) ? 'checked' : ''}/>
      <span class="pm-av" id="pkg-pick-av-${a.id}">${avImg}</span>
      <span class="pm-info">
        <span class="pm-name">${esc(a.nickname || a.username || 'ไม่ทราบชื่อ')}</span>
        <span class="pm-meta">${a.userId ? 'ID ' + a.userId : 'ไม่มีรหัส'}</span>
      </span>
      <span class="pm-check"><span class="material-icons-round">check</span></span>
    </label>`;
  }).join('');
  updatePkgCount();
  
  // Lazy load avatar headshots and paint them
  loadPickerAvatars('pkg', accounts);
}

async function loadPickerAvatars(pickerType, list) {
  const paint = a => {
    if (a.userId && _avatarCache[a.userId]) {
      const el = document.getElementById(`${pickerType}-pick-av-${a.id}`);
      if (el) el.innerHTML = `<img src="${esc(_avatarCache[a.userId])}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`;
    }
  };
  
  // Paint already cached ones
  list.forEach(paint);
  
  // Find which ones we need to fetch
  const need = [], seen = new Set();
  for (const a of list) {
    if (!a.userId) continue;
    if (_avatarCache[a.userId]) continue;
    if (!seen.has(a.userId)) { seen.add(a.userId); need.push(a.userId); }
  }
  if (!need.length) return;
  
  // Fetch in chunks of 100
  for (let i = 0; i < need.length; i += 100) {
    const chunk = need.slice(i, i + 100);
    try {
      const r = await fetch('https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=' + chunk.join(',') + '&size=48x48&format=Png');
      const d = await r.json();
      (d?.data || []).forEach(item => {
        if (item && item.targetId && item.imageUrl) {
          _avatarCache[item.targetId] = item.imageUrl;
        }
      });
      list.forEach(paint);
    } catch (e) {
      console.error('Picker avatar batch load failed:', e);
    }
  }
}

function updatePkgCount() {
  const el = document.getElementById('pkg-count');
  if (!el) return;
  const n = document.querySelectorAll('#pkg-account-picker input:checked').length;
  el.textContent = 'เลือกแล้ว ' + n + ' รายการ';
}

function savePackageModal() {
  const name = document.getElementById('in-pkg-name').value.trim();
  if (!name) { toast('กรุณาตั้งชื่อกลุ่ม', 'err'); return; }
  const checked = Array.from(document.querySelectorAll('#pkg-account-picker input:checked')).map(c => c.value);
  if (editingPackageId) {
    const p = packages.find(x => x.id === editingPackageId);
    if (p) { p.name = name; p.accountIds = checked; }
  } else {
    packages.push({ id: Date.now().toString(), name, accountIds: checked, link: '' });
  }
  api.savePackages(packages);
  renderPackages();
  closeModal('m-package');
  toast('บันทึกกลุ่มแล้ว', 'ok');
}

function deletePackage(id) {
  const p = packages.find(x => x.id === id); if (!p) return;
  confirmAction('ลบกลุ่ม "' + p.name + '" ใช่ไหม? บัญชีภายในจะไม่ถูกลบ', () => {
    packages = packages.filter(x => x.id !== id);
    api.savePackages(packages);
    renderPackages();
    toast('ลบกลุ่มแล้ว', 'err');
  });
}

function setPackageLink(id, value) {
  const p = packages.find(x => x.id === id); if (!p) return;
  p.link = value.trim();
  api.savePackages(packages);
}

async function launchPackage(id) {
  const p = packages.find(x => x.id === id); if (!p) return;
  const members = (p.accountIds || []).map(aid => accounts.find(a => a.id === aid)).filter(Boolean);
  if (!members.length) { toast('กลุ่มนี้ยังไม่มีบัญชี', 'err'); return; }

  const card = document.querySelector('.pkg-card[data-id="' + id + '"]');
  const btn = card ? card.querySelector('.pkg-launch-btn') : null;
  const progress = document.getElementById('pkg-progress-' + id);
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spin"></div>' + t('กำลังเปิด...'); }
  if (progress) {
    progress.innerHTML = members.map(m => `
      <span class="pkg-chip load" id="pkg-chip-${id}-${m.id}">
        <div class="spin" style="width:9px;height:9px;border-width:2px"></div>${esc(m.nickname || m.username || '')}
      </span>`).join('');
  }

  const link = (p.link || '').trim();
  let okCount = 0;
  const cooldownSec = parseInt(document.getElementById('settings-launch-cooldown')?.value || '2', 10);

  for (let idx = 0; idx < members.length; idx++) {
    const m = members[idx];
    if (idx > 0 && cooldownSec > 0) {
      await new Promise(r => setTimeout(r, cooldownSec * 1000));
    }
    const target = link || m.gameTarget || null;
    logEntry('info', 'launch', `กำลังเปิด Roblox สำหรับ ${m.username || m.id} (กลุ่ม)...`, { accountId: m.id, username: m.username || null, userId: m.userId || null, target: target || 'หน้าแรก Roblox' });
    const res = await api.launchRoblox(m.id, m.cookie, target);
    const chip = document.getElementById('pkg-chip-' + id + '-' + m.id);
    if (res.success) {
      okCount++;
      logEntry('ok', 'launch', `เปิด Roblox แล้วในชื่อ ${m.username || m.id} (กลุ่ม)`, { accountId: m.id, username: m.username || null });
      markLaunched(m.id);
      if (chip) { chip.className = 'pkg-chip ok'; chip.innerHTML = '<span class="material-icons-round">check_circle</span>' + esc(m.nickname || m.username || ''); }
    } else {
      logEntry('err', 'launch', `เปิดไม่สำเร็จสำหรับ ${m.username || m.id}: ${res.error}`, { accountId: m.id });
      if (chip) {
        chip.className = 'pkg-chip err';
        chip.title = res.error || '';
        chip.innerHTML = '<span class="material-icons-round">error_outline</span>' + esc(m.nickname || m.username || '');
      }
      _flagCookieMaybeDead(m.id, res.error);
    }
  }

  if (btn) { btn.disabled = false; btn.innerHTML = 'Launch All'; }
  toast('Launched ' + okCount + '/' + members.length + ' accounts in "' + p.name + '"', okCount === members.length ? 'ok' : 'err');
}

function toggleKeyVisibility() {
  const input = document.getElementById('custom-key'), icon = document.getElementById('key-vis-icon');
  if (input.type === 'password') { input.type = 'text'; icon.textContent = 'visibility_off'; }
  else { input.type = 'password'; icon.textContent = 'visibility'; }
}
let _saveKeyTimer;
function onKeyInput() {
  const btn = document.getElementById('btn-save-key');
  if (btn) { btn.disabled = false; btn.textContent = 'Save'; }
}
async function saveKeySettings() {
  const keyVal = document.getElementById('custom-key').value;
  const btn = document.getElementById('btn-save-key');
  if (btn.disabled) return;
  clearTimeout(_saveKeyTimer);
  btn.disabled = true; btn.textContent = 'Saving\u2026';
  _saveKeyTimer = setTimeout(async () => {
    try {
      await api.saveSettings({ encryptionType: selectedEnc });
      // enc:setKey changes the key and re-encrypts accounts in one step.
      const r = await api.encSetKey(keyVal);
      if (!r || !r.ok) throw new Error(r && r.error ? r.error : 'could not update key');
      if (!keyVal.trim()) throw new Error('Encryption key cannot be empty.');
      settings.encryptionType = selectedEnc; settings.keySet = true;
      document.getElementById('custom-key').value = '';
      // Reload accounts so the renderer holds cookies under the new key.
      try { accounts = await api.loadAccounts(); render(); } catch {}
      toast('Encryption key updated', 'ok');
      applySettings();
    } catch (e) {
      toast('บันทึกไม่สำเร็จ: ' + e.message, 'err');
    } finally {
      btn.disabled = false; btn.textContent = 'Save';
    }
  }, 300);
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  if (id === 'm-login') {
    if (window.api && window.api.hideLoginView) window.api.hideLoginView();
    if (window.api && window.api.cancelLogin) window.api.cancelLogin();
  }
}
function setStatus(id, type, html) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'mst ' + type;
  const translated = (typeof t === 'function' && typeof html === 'string' && !html.includes('<')) ? t(html) : html;
  el.innerHTML = translated;
}
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function toast(msg, type) {
  type = type || '';
  let str = (typeof msg === 'string') ? msg : (msg && msg.message ? String(msg.message) : String(msg || ''));
  const translated = (typeof t === 'function') ? t(str) : str;
  const el = document.getElementById('toast'), icon = type === 'ok' ? 'check_circle' : 'cancel';
  el.innerHTML = '<span class="material-icons-round">' + icon + '</span>' + esc(translated);
  el.className = 'toast show ' + type; clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2700);
}

async function refreshMultiStatus() {
  const s = await api.multiInstanceStatus();
  if (!s.enabled) { await api.saveSettings({ multiInstance: true }); settings.multiInstance = true; }
}

document.querySelectorAll('.overlay').forEach(o => {
  o.addEventListener('mousedown', e => {
    if (e.target === o && o.dataset.backdropClose === 'true') o.classList.remove('open');
  });
});
document.addEventListener('keydown', e => {
  // Ctrl/Cmd+F opens native-style find on the logs page.
  if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F') && document.getElementById('page-logs')?.classList.contains('active')) {
    e.preventDefault(); openLogFind(); return;
  }
  // Find-bar keys: Enter = next, Shift+Enter = previous, Esc = close.
  if (e.target && e.target.id === 'log-find-input') {
    if (e.key === 'Enter') { e.preventDefault(); logFind(e.shiftKey); return; }
    if (e.key === 'Escape') { e.preventDefault(); closeLogFind(); return; }
  }
  if (e.key === 'Escape') {
    const lf = document.getElementById('log-find');
    if (lf && lf.style.display !== 'none') { closeLogFind(); return; }
    closeAllCdd();
    const editEl = document.getElementById('m-edit');
    if (editEl.classList.contains('open')) {
      if (document.activeElement !== document.getElementById('in-target') && document.activeElement !== document.getElementById('in-nickname')) closeModal('m-edit');
    } else {
      document.querySelectorAll('.overlay.open').forEach(m => {
        // Prevent closing the login modal if the browser login is active to avoid accidental closures
        if (m.id === 'm-login' && m.querySelector('.modal.browser-active')) return;
        m.classList.remove('open');
      });
    }
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); openLogin(); }
  // "/" focuses the account search (when not already typing in a field).
  if (e.key === '/' && document.getElementById('page-accounts')?.classList.contains('active')
      && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')) {
    e.preventDefault();
    document.getElementById('acct-search')?.focus();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 's' && document.getElementById('m-edit').classList.contains('open')) {
    e.preventDefault(); saveEdit();
  }
});

let chartTab = 'popular';
let allCharts = {};
let chartsLoaded = false;

// High-speed thumbnail caching, bounded memory, and non-blocking progressive hydration
const MAX_THUMB_CACHE = 400;
const _gameThumbCache = new Map();
const _pendingThumbUids = new Set();

function cacheThumbUrl(universeId, url) {
  if (!universeId || !url) return;
  const sid = String(universeId);
  if (_gameThumbCache.size >= MAX_THUMB_CACHE && !_gameThumbCache.has(sid)) {
    const firstKey = _gameThumbCache.keys().next().value;
    if (firstKey) _gameThumbCache.delete(firstKey);
  }
  _gameThumbCache.set(sid, url);
}

try {
  const savedThumbs = localStorage.getItem('roblox_thumb_cache');
  if (savedThumbs) {
    const parsed = JSON.parse(savedThumbs);
    for (const [k, v] of Object.entries(parsed)) {
      if (v) cacheThumbUrl(k, v);
    }
  }
} catch {}

function saveThumbCache() {
  try {
    const obj = {};
    let count = 0;
    for (const [k, v] of _gameThumbCache.entries()) {
      if (count++ > 350) break;
      obj[k] = v;
    }
    localStorage.setItem('roblox_thumb_cache', JSON.stringify(obj));
  } catch {}
}

function applyCachedThumbnailsToDom() {
  const grid = document.getElementById('charts-grid');
  if (!grid) return;
  const elements = grid.querySelectorAll('[data-thumb-uid]');
  for (const el of elements) {
    const uId = el.getAttribute('data-thumb-uid');
    const cachedUrl = _gameThumbCache.get(String(uId));
    if (cachedUrl) {
      if (el.tagName === 'IMG') {
        if (el.src !== cachedUrl) el.src = cachedUrl;
        el.removeAttribute('data-thumb-uid');
      } else {
        const img = document.createElement('img');
        img.className = 'chart-card-thumb';
        img.decoding = 'async';
        img.loading = 'lazy';
        img.src = cachedUrl;
        img.alt = '';
        img.onerror = () => {
          img.outerHTML = '<div class="chart-card-thumb-ph"><span class="material-icons-round">videogame_asset</span></div>';
        };
        el.replaceWith(img);
      }
    }
  }
}

async function hydrateChartThumbnails(universeIds) {
  if (!Array.isArray(universeIds) || !universeIds.length) return;
  const needed = [];
  for (const id of universeIds) {
    const sid = String(id);
    if (sid && !_gameThumbCache.has(sid) && !_pendingThumbUids.has(sid)) {
      needed.push(sid);
      _pendingThumbUids.add(sid);
    }
  }

  // Apply any existing cached thumbnails immediately
  applyCachedThumbnailsToDom();

  if (!needed.length) return;

  for (let i = 0; i < needed.length; i += 100) {
    const chunk = needed.slice(i, i + 100);
    try {
      const td = await api.fetchPublicJson(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${chunk.join(',')}&returnPolicy=PlaceHolder&size=150x150&format=Png&isCircular=false`);
      if (td && Array.isArray(td.data)) {
        for (const item of td.data) {
          if (item && item.targetId && item.imageUrl) {
            cacheThumbUrl(item.targetId, item.imageUrl);
          }
        }
        saveThumbCache();
        applyCachedThumbnailsToDom();
      }
    } catch (e) {
      console.error('hydrateChartThumbnails error:', e);
    } finally {
      for (const id of chunk) _pendingThumbUids.delete(String(id));
    }
  }
}

// Speculative background map prefetching (preload ahead buffer)
let _chartPrefetchedBatch = null;
let _chartPrefetching = false;
let _chartPrefetchTimer = null;
let _chartPrefetchAbort = 0;

function cancelPrefetch() {
  _chartPrefetchAbort++;
  _chartPrefetching = false;
  _chartPrefetchedBatch = null;
  if (_chartPrefetchTimer) {
    clearTimeout(_chartPrefetchTimer);
    _chartPrefetchTimer = null;
  }
}

function prefetchNextChartBatch() {
  if (!_chartHasMore || _chartPrefetching || _chartPrefetchedBatch || _chartIsFetching) return;
  if (_chartPrefetchTimer) clearTimeout(_chartPrefetchTimer);

  const currentEpoch = ++_chartPrefetchAbort;
  const task = async () => {
    if (currentEpoch !== _chartPrefetchAbort || !_chartHasMore || _chartIsFetching || _chartPrefetchedBatch) return;
    _chartPrefetching = true;
    try {
      let res = null;
      if (!_chartSearchMode && ['popular', 'trending', 'favorited'].includes(chartTab)) {
        const allList = allCharts[chartTab] || [];
        if (_chartRenderedCount < allList.length) {
          res = {
            games: allList.slice(_chartRenderedCount, _chartRenderedCount + 24),
            nextPageToken: _chartNextPageToken
          };
        } else {
          const fallbackQuery = chartTab === 'popular' ? 'top games' : (chartTab === 'trending' ? 'trending games' : 'fun games');
          res = await searchRobloxGames(fallbackQuery, _chartNextPageToken);
        }
      } else {
        const query = _chartCurrentQuery || chartTab;
        if (_chartNextPageToken) {
          res = await searchRobloxGames(query, _chartNextPageToken);
        }
      }

      if (currentEpoch === _chartPrefetchAbort && res && res.games && res.games.length > 0) {
        _chartPrefetchedBatch = res;
        // Pre-warm thumbnail cache for prefetched games in background
        const uids = res.games.map(g => g.universeId).filter(Boolean);
        if (uids.length > 0) {
          hydrateChartThumbnails(uids);
        }
      }
    } catch (err) {
      console.error('prefetchNextChartBatch error:', err);
    } finally {
      if (currentEpoch === _chartPrefetchAbort) {
        _chartPrefetching = false;
      }
    }
  };

  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    _chartPrefetchTimer = setTimeout(() => {
      window.requestIdleCallback(task, { timeout: 1200 });
    }, 180);
  } else {
    _chartPrefetchTimer = setTimeout(task, 220);
  }
}

// Infinite scroll state for charts
let _chartNextPageToken = null;
let _chartCurrentQuery = '';
let _chartSearchMode = false;
let _chartIsFetching = false;
let _chartHasMore = true;
let _chartRenderedCount = 0;
let _chartSeenUniverseIds = new Set();
let _chartScrollObserver = null;
let _chartScrollListenerAttached = false;
let _chartGameMap = {};
let _searchDebounce = null;
let _searchMode = false;

function setupChartsScrollEvents() {
  const scroller = document.getElementById('charts-scroller');
  const scrollTrigger = document.getElementById('charts-scroll-trigger');

  if (scroller && !_chartScrollListenerAttached) {
    let scrollScheduled = false;
    scroller.addEventListener('scroll', () => {
      if (!scrollScheduled) {
        scrollScheduled = true;
        requestAnimationFrame(() => {
          scrollScheduled = false;
          if (_chartIsFetching || !_chartHasMore) return;
          const threshold = 600;
          if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - threshold) {
            loadMoreCharts();
          }
        });
      }
    }, { passive: true });
    _chartScrollListenerAttached = true;
  }

  if (scrollTrigger && scroller && !_chartScrollObserver) {
    _chartScrollObserver = new IntersectionObserver((entries) => {
      const trigger = entries[0];
      if (trigger && trigger.isIntersecting && !_chartIsFetching && _chartHasMore) {
        loadMoreCharts();
      }
    }, {
      root: scroller,
      rootMargin: "600px"
    });
    _chartScrollObserver.observe(scrollTrigger);
  }
}

function checkAutoLoadCharts() {
  const scroller = document.getElementById('charts-scroller');
  if (!scroller) return;
  if (scroller.scrollHeight <= scroller.clientHeight + 250 && _chartHasMore && !_chartIsFetching) {
    loadMoreCharts();
  }
}

function appendChartCards(games, searchMode) {
  const grid = document.getElementById('charts-grid');
  if (!grid) return;

  const htmlParts = [];
  const uncachedUids = [];

  for (const g of games) {
    if (!g || !g.placeId || !g.universeId) continue;
    if (_chartSeenUniverseIds.has(g.universeId)) continue;
    _chartSeenUniverseIds.add(g.universeId);

    const i = _chartRenderedCount;
    _chartGameMap[i] = g;
    _chartRenderedCount++;

    const cachedThumb = _gameThumbCache.get(String(g.universeId)) || g.thumbUrl || '';
    if (!cachedThumb) {
      uncachedUids.push(g.universeId);
    }

    const players = typeof g.playerCount === 'number' ? Number(g.playerCount).toLocaleString() + ' playing' : '';
    const rankLabel = searchMode ? `<div class="chart-card-rank">Search result</div>` : `<div class="chart-card-rank">#${i + 1}</div>`;
    const thumb = cachedThumb
      ? `<img class="chart-card-thumb" src="${esc(cachedThumb)}" alt="" loading="lazy" decoding="async" onerror="this.outerHTML='<div class=chart-card-thumb-ph><span class=material-icons-round>videogame_asset</span></div>'"/>`
      : `<div class="chart-card-thumb-ph" data-thumb-uid="${esc(String(g.universeId))}"><span class="material-icons-round">videogame_asset</span></div>`;

    htmlParts.push(`
      <div class="chart-card" style="animation-delay:${(i % 24) * 12}ms" onclick="openGameModal(${i})" title="View game info">
        ${thumb}
        <div class="chart-card-body">
          ${rankLabel}
          <div class="chart-card-name">${esc(g.name || 'ไม่ทราบชื่อ')}</div>
          ${players ? `<div class="chart-card-stat"><span class="material-icons-round">people</span>${players}</div>` : ''}
        </div>
      </div>
    `);
  }

  if (htmlParts.length > 0) {
    grid.insertAdjacentHTML('beforeend', htmlParts.join(''));
  }

  if (uncachedUids.length > 0) {
    hydrateChartThumbnails(uncachedUids);
  }
}

function renderCharts(games, searchMode) {
  const grid = document.getElementById('charts-grid');
  const emptyEl = document.getElementById('charts-empty');
  const loading = document.getElementById('charts-loading');
  const bottomLoader = document.getElementById('charts-bottom-loader');
  loading.style.display = 'none';
  if (bottomLoader) bottomLoader.style.display = 'none';

  cancelPrefetch();
  _chartGameMap = {};
  _chartSeenUniverseIds.clear();
  _chartRenderedCount = 0;
  _chartHasMore = true;

  if (!games || !games.length) {
    emptyEl.style.display = 'flex';
    grid.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  grid.style.display = 'grid';
  grid.innerHTML = '';

  setupChartsScrollEvents();
  appendChartCards(games, searchMode);

  prefetchNextChartBatch();
  setTimeout(checkAutoLoadCharts, 150);
}

async function loadMoreCharts() {
  if (_chartIsFetching || !_chartHasMore) return;
  _chartIsFetching = true;

  // 1. Instant append from preloaded batch if available
  if (_chartPrefetchedBatch && _chartPrefetchedBatch.games && _chartPrefetchedBatch.games.length > 0) {
    const batch = _chartPrefetchedBatch;
    _chartPrefetchedBatch = null;
    _chartNextPageToken = batch.nextPageToken;
    appendChartCards(batch.games, _chartSearchMode);
    if (!batch.nextPageToken && !batch.games.length) {
      _chartHasMore = false;
    }
    _chartIsFetching = false;
    prefetchNextChartBatch();
    setTimeout(checkAutoLoadCharts, 120);
    return;
  }

  const bottomLoader = document.getElementById('charts-bottom-loader');
  const bottomText = document.getElementById('charts-bottom-text');
  if (bottomLoader) {
    bottomLoader.style.display = 'block';
    const spin = bottomLoader.querySelector('.spin');
    if (spin) spin.style.display = 'inline-block';
    if (bottomText) bottomText.textContent = 'กำลังโหลดแมพเพิ่มเติม...';
  }

  try {
    let newGames = [];
    if (!_chartSearchMode && ['popular', 'trending', 'favorited'].includes(chartTab)) {
      const allList = allCharts[chartTab] || [];
      if (_chartRenderedCount < allList.length) {
        newGames = allList.slice(_chartRenderedCount, _chartRenderedCount + 24);
      } else {
        const fallbackQuery = chartTab === 'popular' ? 'top games' : (chartTab === 'trending' ? 'trending games' : 'fun games');
        const res = await searchRobloxGames(fallbackQuery, _chartNextPageToken);
        newGames = res.games || [];
        _chartNextPageToken = res.nextPageToken;
        if (!_chartNextPageToken && !newGames.length) {
          _chartHasMore = false;
        }
      }
    } else {
      const query = _chartCurrentQuery || chartTab;
      if (_chartNextPageToken) {
        const res = await searchRobloxGames(query, _chartNextPageToken);
        newGames = res.games || [];
        _chartNextPageToken = res.nextPageToken;
        if (!_chartNextPageToken && !newGames.length) {
          _chartHasMore = false;
        }
      } else {
        _chartHasMore = false;
      }
    }

    if (newGames.length > 0) {
      appendChartCards(newGames, _chartSearchMode);
    } else {
      _chartHasMore = false;
    }

    if (bottomLoader) {
      if (!_chartHasMore) {
        bottomLoader.style.display = 'block';
        const spin = bottomLoader.querySelector('.spin');
        if (spin) spin.style.display = 'none';
        if (bottomText) bottomText.innerHTML = `<span style="color:var(--t3);font-size:12px;">${t('โหลดแมพครบทั้งหมดแล้ว')}</span>`;
      } else {
        bottomLoader.style.display = 'none';
      }
    }

    _chartIsFetching = false;
    prefetchNextChartBatch();
    setTimeout(checkAutoLoadCharts, 120);

  } catch (err) {
    console.error('loadMoreCharts error:', err);
    _chartIsFetching = false;
    if (bottomLoader) {
      bottomLoader.style.display = 'block';
      const spin = bottomLoader.querySelector('.spin');
      if (spin) spin.style.display = 'none';
      if (bottomText) {
        bottomText.innerHTML = `
          <button class="btn btn-secondary btn-sm" onclick="window.loadMoreCharts()" style="padding:4px 12px;font-size:12px;">
            <span class="material-icons-round" style="font-size:14px;vertical-align:middle;margin-right:4px;">refresh</span>ลองโหลดต่อ
          </button>
        `;
      }
    }
  }
}
window.loadMoreCharts = loadMoreCharts;

async function searchRobloxGames(query, pageToken = null) {
  try {
    let url = `https://apis.roblox.com/search-api/omni-search?searchQuery=${encodeURIComponent(query)}&sessionId=test`;
    if (pageToken) {
      url += `&pageToken=${encodeURIComponent(pageToken)}`;
    }
    const d = await api.fetchPublicJson(url);
    if (!d || !Array.isArray(d.searchResults)) {
      return { games: [], nextPageToken: null };
    }

    const gamesList = [];
    for (const group of d.searchResults) {
      if (Array.isArray(group.contents)) {
        for (const item of group.contents) {
          if (item && item.universeId && item.rootPlaceId) {
            gamesList.push({
              universeId: item.universeId,
              placeId: item.rootPlaceId,
              name: item.name,
              playerCount: item.playerCount || 0,
              thumbUrl: _gameThumbCache.get(String(item.universeId)) || ''
            });
          }
        }
      }
    }

    return {
      games: gamesList,
      nextPageToken: d.nextPageToken || null
    };
  } catch(e) {
    console.error('searchRobloxGames error:', e);
    return { games: [], nextPageToken: null };
  }
}

function switchChartTab(tab) {
  cancelPrefetch();
  chartTab = tab;
  document.querySelectorAll('#page-charts .tab-btn').forEach(t => t.classList.remove('active'));
  const btn = document.getElementById('ctab-' + tab);
  if (btn) btn.classList.add('active');
  const s = document.getElementById('chart-search'); if (s) s.value = '';
  _searchMode = false;
  _chartSearchMode = false;
  _chartCurrentQuery = '';
  _chartNextPageToken = null;
  
  if (['popular', 'trending', 'favorited'].includes(tab)) {
    if (chartsLoaded) {
      renderCharts(allCharts[tab] || [], false);
    } else {
      loadCharts();
    }
  } else {
    loadCategoryChart(tab);
  }
}

async function loadCategoryChart(category) {
  cancelPrefetch();
  const grid = document.getElementById('charts-grid');
  const loading = document.getElementById('charts-loading');
  const empty = document.getElementById('charts-empty');
  const bottomLoader = document.getElementById('charts-bottom-loader');
  
  grid.style.display = 'none';
  empty.style.display = 'none';
  if (bottomLoader) bottomLoader.style.display = 'none';
  loading.style.display = 'flex';
  
  _chartSearchMode = true;
  _chartCurrentQuery = category;
  _chartNextPageToken = null;

  try {
    const res = await searchRobloxGames(category, null);
    _chartNextPageToken = res.nextPageToken;
    renderCharts(res.games || [], true);
  } catch (e) {
    console.error('Category load error:', e);
    loading.style.display = 'none';
    empty.style.display = 'flex';
  }
}

async function fetchAllRobloxExplore() {
  try {
    const d = await api.fetchPublicJson('https://apis.roblox.com/explore-api/v1/get-sorts?sessionId=test');
    if (!d || !Array.isArray(d.sorts)) {
      return { popular: [], trending: [], favorited: [] };
    }

    function extractGames(sortName, fallbackIndex) {
      let sort = d.sorts.find(s => s.sortDisplayName === sortName) || d.sorts[fallbackIndex];
      const games = sort ? (sort.games || []) : [];
      return games.map(g => ({
        universeId: g.universeId,
        placeId: g.rootPlaceId,
        name: g.name,
        playerCount: g.playerCount,
        thumbUrl: _gameThumbCache.get(String(g.universeId)) || ''
      })).filter(g => g.placeId && g.universeId);
    }

    const popular = extractGames('Top Playing Now', 3);
    const trending = extractGames('Top Trending', 1);
    const favorited = extractGames('Fun with Friends', 4);

    return { popular, trending, favorited };
  } catch (e) {
    console.error('fetchAllRobloxExplore error:', e);
    return { popular: [], trending: [], favorited: [] };
  }
}

async function loadCharts() {
  const grid = document.getElementById('charts-grid');
  const loading = document.getElementById('charts-loading');
  const empty = document.getElementById('charts-empty');
  chartsLoaded = false;
  grid.style.display = 'none'; empty.style.display = 'none'; loading.style.display = 'flex';

  try {
    allCharts = await fetchAllRobloxExplore();
    chartsLoaded = true;
    loading.style.display = 'none';

    if (['popular', 'trending', 'favorited'].includes(chartTab)) {
      renderCharts(allCharts[chartTab] || [], false);
    } else {
      loadCategoryChart(chartTab);
    }

    // Prefetch all universe IDs across sorts in background for zero-wait switching
    const allUids = [];
    ['popular', 'trending', 'favorited'].forEach(tab => {
      (allCharts[tab] || []).forEach(g => {
        if (g && g.universeId) allUids.push(g.universeId);
      });
    });
    if (allUids.length > 0) {
      hydrateChartThumbnails(allUids);
    }
  } catch(e) {
    console.error('Charts load error:', e);
    loading.style.display = 'none';
    empty.style.display = 'flex';
  }
}

function filterCharts(val) {
  clearTimeout(_searchDebounce);
  cancelPrefetch();
  const query = val.trim();
  if (!query) {
    _searchMode = false;
    _chartSearchMode = false;
    _chartCurrentQuery = '';
    _chartNextPageToken = null;
    if (chartsLoaded) renderCharts(allCharts[chartTab] || [], false);
    else {
      document.getElementById('charts-grid').style.display = 'none';
      document.getElementById('charts-empty').style.display = 'none';
      document.getElementById('charts-loading').style.display = 'flex';
    }
    return;
  }
  _searchMode = true;
  _chartSearchMode = true;
  _chartCurrentQuery = query;
  _chartNextPageToken = null;

  _searchDebounce = setTimeout(async () => {
    const grid = document.getElementById('charts-grid');
    const loading = document.getElementById('charts-loading');
    const emptyEl = document.getElementById('charts-empty');
    const bottomLoader = document.getElementById('charts-bottom-loader');
    grid.style.display = 'none';
    emptyEl.style.display = 'none';
    if (bottomLoader) bottomLoader.style.display = 'none';
    loading.style.display = 'flex';
    try {
      const res = await searchRobloxGames(query, null);
      if (document.getElementById('chart-search').value.trim() === query) {
        _chartNextPageToken = res.nextPageToken;
        renderCharts(res.games || [], true);
      }
    } catch(e) {
      console.error('Search error:', e);
      loading.style.display = 'none';
      emptyEl.style.display = 'flex';
    }
  }, 420);
}

let _gameModal = {};
function openGameModal(idx) {
  const g = _chartGameMap[idx];
  if (!g) return;
  _gameModal = g;
  const thumb = document.getElementById('game-modal-thumb');
  const thumbSrc = _gameThumbCache.get(String(g.universeId)) || g.thumbUrl || '';
  if (thumbSrc) { thumb.src = thumbSrc; thumb.style.display = 'block'; }
  else { thumb.style.display = 'none'; }
  document.getElementById('game-modal-name').textContent = g.name || t('ไม่ทราบชื่อ');
  document.getElementById('game-modal-id').textContent = g.placeId || '-';
  const stat = typeof g.playerCount === 'number' ? Number(g.playerCount).toLocaleString() + ' ' + t('กำลังเล่นอยู่') : '';
  document.getElementById('game-modal-stat').textContent = stat;
  
  // Hide launch status and populate account list
  const err = document.getElementById('game-launch-status');
  if (err) err.style.display = 'none';
  renderGameAccountPicker();
  
  openModal('m-game');
}

function renderGameAccountPicker() {
  const wrap = document.getElementById('game-account-picker');
  if (!wrap) return;
  if (!accounts.length) {
    wrap.innerHTML = `<div class="pkg-pick-empty">${t('ยังไม่มีบัญชี เพิ่มจากแท็บบัญชีก่อน')}</div>`;
    return;
  }
  wrap.innerHTML = accounts.map(a => {
    const avImg = (a.userId && _avatarCache[a.userId]) 
      ? `<img src="${esc(_avatarCache[a.userId])}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
      : esc((a.username || '?')[0].toUpperCase());
    return `
    <label class="pm-row">
      <input type="checkbox" value="${a.id}"/>
      <span class="pm-av" id="game-pick-av-${a.id}">${avImg}</span>
      <span class="pm-info">
        <span class="pm-name">${esc(a.nickname || a.username || t('ไม่ทราบชื่อ'))}</span>
        <span class="pm-meta">${a.userId ? 'ID ' + a.userId : t('ไม่มีรหัส')}</span>
      </span>
      <span class="pm-check"><span class="material-icons-round">check</span></span>
    </label>`;
  }).join('');
  
  // Lazy load avatar headshots and paint them
  loadPickerAvatars('game', accounts);
}

async function fetchRobloxServers(placeId) {
  const url = `https://games.roblox.com/v1/games/${placeId}/servers/Public?limit=100`;
  const d = await api.fetchPublicJson(url);
  if (!d) throw new Error("Failed to fetch public servers");
  return d.data || [];
}

async function launchGameFromSearch() {
  const checkboxes = document.querySelectorAll('#game-account-picker input:checked');
  const accountIds = Array.from(checkboxes).map(cb => cb.value);
  if (!accountIds.length) {
    const err = document.getElementById('game-launch-status');
    if (err) {
      err.className = 'mst err';
      err.style.display = 'block';
      err.textContent = t('กรุณาเลือกบัญชีอย่างน้อยหนึ่งบัญชี');
    }
    return;
  }

  const btn = document.getElementById('btn-game-launch');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<div class="spin"></div>${t('กำลังเปิด...')}`;
  }

  const statusEl = document.getElementById('game-launch-status');
  statusEl.className = 'mst';
  statusEl.style.display = 'block';
  statusEl.innerHTML = ''; // Clear previous

  const placeId = String(_gameModal.placeId || '');
  const serverMode = document.getElementById('game-server-mode') ? (document.getElementById('game-server-mode').dataset.value || 'normal') : 'normal';

  let targetLaunchParam = placeId;

  if (serverMode !== 'normal') {
    statusEl.innerHTML = `<div class="spin" style="display:inline-block;vertical-align:middle;margin-right:8px;width:12px;height:12px;border-width:2px"></div>${t('กำลังค้นหาเซิร์ฟเวอร์...')}`;
    try {
      const servers = await fetchRobloxServers(placeId);
      const N = accountIds.length;
      let targetServer = null;

      if (serverMode === 'low-players') {
        const valid = servers.filter(s => s.playing > 0 && s.playing < s.maxPlayers);
        valid.sort((a, b) => a.playing - b.playing);
        if (valid.length) targetServer = valid[0];
      } else if (serverMode === 'low-ping') {
        const valid = servers.filter(s => s.ping > 0 && s.playing < s.maxPlayers);
        valid.sort((a, b) => a.ping - b.ping);
        if (valid.length) targetServer = valid[0];
      } else if (serverMode === 'fill-server') {
        const valid = servers.filter(s => (s.maxPlayers - s.playing) >= N);
        valid.sort((a, b) => (a.maxPlayers - a.playing) - (b.maxPlayers - b.playing));
        if (valid.length) targetServer = valid[0];
      }

      if (targetServer && targetServer.id) {
        targetLaunchParam = `${placeId}:${targetServer.id}`;
        logEntry('info', 'launch', `เลือกเซิร์ฟเวอร์เป้าหมายสำเร็จ: Job ID ${targetServer.id} (ผู้เล่น: ${targetServer.playing}/${targetServer.maxPlayers}, ปิง: ${targetServer.ping}ms)`, { placeId });
      } else {
        toast(t('ไม่พบเซิร์ฟเวอร์ที่เหมาะสม ใช้การเชื่อมต่อปกติ'), 'warn');
        logEntry('warn', 'launch', `ไม่พบเซิร์ฟเวอร์ที่ตรงตามเงื่อนไข ${serverMode} สำหรับ ${N} บัญชี, รันในโหมดจับคู่ปกติ`, { placeId });
      }
    } catch (e) {
      console.error('Server fetching error:', e);
      logEntry('err', 'launch', `โหลดรายชื่อเซิร์ฟเวอร์ล้มเหลว: ${e.message}`, { placeId });
    }
  }

  statusEl.innerHTML = ''; // Clear finding status

  // Render loading chips/progress for selected accounts
  const selectedMembers = accountIds.map(id => accounts.find(a => a.id === id)).filter(Boolean);
  
  // Create status container for chips
  const chipsContainer = document.createElement('div');
  chipsContainer.style.display = 'flex';
  chipsContainer.style.flexWrap = 'wrap';
  chipsContainer.style.gap = '6px';
  chipsContainer.style.marginTop = '8px';
  chipsContainer.innerHTML = selectedMembers.map(m => `
    <span class="pkg-chip load" id="game-chip-${m.id}">
      <div class="spin" style="width:9px;height:9px;border-width:2px"></div>${esc(m.nickname || m.username || '')}
    </span>
  `).join('');
  statusEl.appendChild(chipsContainer);

  let okCount = 0;
  const cooldownSec = parseInt(document.getElementById('settings-launch-cooldown')?.value || '2', 10);

  for (let idx = 0; idx < selectedMembers.length; idx++) {
    const m = selectedMembers[idx];
    if (idx > 0 && cooldownSec > 0) {
      await new Promise(r => setTimeout(r, cooldownSec * 1000));
    }
    logEntry('info', 'launch', `กำลังเปิด Roblox สำหรับ ${m.username || m.id} เข้าแมพ ${targetLaunchParam}...`, { 
      accountId: m.id, 
      username: m.username || null, 
      userId: m.userId || null, 
      target: targetLaunchParam 
    });

    const res = await api.launchRoblox(m.id, m.cookie, targetLaunchParam);
    const chip = document.getElementById('game-chip-' + m.id);

    if (res.success) {
      okCount++;
      logEntry('ok', 'launch', `เปิด Roblox แล้วในชื่อ ${m.username || m.id} เข้าแมพ ${targetLaunchParam}`, { 
        accountId: m.id, 
        username: m.username || null 
      });
      markLaunched(m.id);
      if (chip) {
        chip.className = 'pkg-chip ok';
        chip.innerHTML = '<span class="material-icons-round">check_circle</span>' + esc(m.nickname || m.username || '');
      }
    } else {
      logEntry('err', 'launch', `เปิดไม่สำเร็จสำหรับ ${m.username || m.id}: ${res.error}`, { accountId: m.id });
      if (chip) {
        chip.className = 'pkg-chip err';
        chip.title = res.error || '';
        chip.innerHTML = '<span class="material-icons-round">error_outline</span>' + esc(m.nickname || m.username || '');
      }
      _flagCookieMaybeDead(m.id, res.error);
    }
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<span class="material-icons-round">play_arrow</span>${t('เริ่มเล่น')}`;
  }

  toast(t('เปิดเกมสำเร็จ') + ` ${okCount}/${selectedMembers.length} ` + t('บัญชี'), okCount === selectedMembers.length ? 'ok' : 'err');
}

async function fetchAssetDetailsAndThumbs(assetIds) {
  if (!assetIds.length) return { details: {}, thumbs: {} };
  
  let thumbs = {};
  try {
    const d = await api.fetchPublicJson(`https://thumbnails.roblox.com/v1/assets?assetIds=${assetIds.join(',')}&size=150x150&format=Png&isCircular=false`);
    if (d) {
      (d.data || []).forEach(item => {
        thumbs[item.targetId] = item.imageUrl;
      });
    }
  } catch(e) {
    console.error('Asset thumbnails error:', e);
  }

  let details = {};
  try {
    const detailPromises = assetIds.map(id => api.fetchPublicJson(`https://economy.roblox.com/v2/assets/${id}/details`));
    const results = await Promise.all(detailPromises);
    results.forEach(d => {
      if (d && d.AssetId) {
        details[d.AssetId] = {
          price: d.PriceInRobux,
          name: d.Name,
          creatorName: d.Creator?.Name
        };
      }
    });
  } catch(e) {
    console.error('Asset details error:', e);
  }

  return { details, thumbs };
}

// ── Context actions ──
async function ctxInspectAvatar(id) {
  closeCardMenu();
  const a = accounts.find(x => x.id === id);
  if (!a) return;
  
  // Set placeholders
  document.getElementById('inspect-avatar-name').textContent = a.nickname || a.username || t('ไม่ทราบชื่อ');
  document.getElementById('inspect-avatar-username').textContent = a.username ? '@' + a.username : '';
  document.getElementById('inspect-avatar-uid').textContent = a.userId || '-';
  document.getElementById('inspect-avatar-type').textContent = '-';
  
  const robuxEl = document.getElementById('inspect-avatar-robux');
  if (robuxEl) {
    robuxEl.innerHTML = '<div class="spin" style="width:12px;height:12px;border-width:2px;display:inline-block;border-top-color:#22c55e;border-left-color:#22c55e;"></div>';
    if (window.api && window.api.getAuthenticatedJson && a.cookie && a.userId) {
      window.api.getAuthenticatedJson('economy.roblox.com', '/v1/users/' + a.userId + '/currency', a.cookie)
        .then(r => {
          if (r && r.robux !== undefined) {
            robuxEl.innerHTML = '<span class="material-icons-round" style="font-size:16px;">toll</span> ' + r.robux.toLocaleString();
          } else {
            robuxEl.innerHTML = '<span class="material-icons-round" style="font-size:16px;">toll</span> N/A';
          }
        }).catch(() => robuxEl.innerHTML = '<span class="material-icons-round" style="font-size:16px;">toll</span> N/A');
    } else {
      robuxEl.innerHTML = '<span class="material-icons-round" style="font-size:16px;">toll</span> N/A';
    }
  }
  
  const bodyImg = document.getElementById('inspect-avatar-body');
  const bodyPh = document.getElementById('inspect-avatar-body-ph');
  bodyImg.style.display = 'none';
  bodyPh.style.display = 'block';
  bodyPh.textContent = t('กำลังโหลดรูปภาพ...');
  
  const assetsList = document.getElementById('inspect-assets-list');
  assetsList.innerHTML = `<div style="grid-column: 1 / -1; font-size: 11px; color: var(--t3); text-align: center; padding: 12px;"><div class="spin" style="width:12px;height:12px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px"></div>${t('กำลังโหลด...')}</div>`;
  
  const recentMaps = document.getElementById('inspect-recent-maps');
  recentMaps.innerHTML = `<div style="font-size: 11px; color: var(--t3); text-align: center; padding: 12px;"><div class="spin" style="width:12px;height:12px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px"></div>${t('กำลังโหลด...')}</div>`;
  
  openModal('m-avatar-inspect');
  
  if (!a.userId) {
    bodyPh.textContent = t('ไม่มีรหัสผู้ใช้');
    assetsList.innerHTML = `<div style="grid-column: 1 / -1; font-size: 11px; color: var(--t3); text-align: center; padding: 12px;">${t('ไม่มีข้อมูลของที่ใส่')}</div>`;
    recentMaps.innerHTML = `<div style="font-size: 11px; color: var(--t3); text-align: center; padding: 12px;">${t('ไม่มีข้อมูลประวัติการเล่น')}</div>`;
    return;
  }
  
  // 1. Fetch full body 2D render
  fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${a.userId}&size=352x352&format=Png&isCircular=false`)
    .then(r => r.json()).then(d => {
      const url = d?.data?.[0]?.imageUrl;
      if (url) {
        bodyImg.src = url;
        bodyImg.style.display = 'block';
        bodyPh.style.display = 'none';
      } else {
        bodyPh.textContent = t('โหลดรูปไม่สำเร็จ');
      }
    }).catch(() => {
      bodyPh.textContent = t('โหลดรูปไม่สำเร็จ');
    });
    
  // 2. Fetch avatar equipped items (assets)
  fetch(`https://avatar.roblox.com/v1/users/${a.userId}/avatar`)
    .then(r => r.json()).then(async (d) => {
      document.getElementById('inspect-avatar-type').textContent = d?.playerAvatarType || 'R15';
      const assets = d?.assets || [];
      if (!assets.length) {
        assetsList.innerHTML = `<div style="grid-column: 1 / -1; font-size: 11px; color: var(--t3); text-align: center; padding: 12px;">${t('ไม่มีข้อมูลของที่ใส่')}</div>`;
      } else {
        const assetIds = assets.map(x => x.id);
        const { details, thumbs } = await fetchAssetDetailsAndThumbs(assetIds);
        
        assetsList.innerHTML = assets.map(item => {
          const thumb = thumbs[item.id] || '';
          const detail = details[item.id] || {};
          const name = detail.name || item.name || t('ไม่ทราบชื่อ');
          const price = detail.price;
          
          let priceBadge = '';
          if (price !== undefined && price !== null) {
            priceBadge = price > 0 
              ? `<span style="display: inline-flex; align-items: center; gap: 2px; font-weight: 700; color: #ffbc00; background: rgba(255,188,0,0.12); padding: 2px 6px; border-radius: 4px; font-size: 11px; flex-shrink: 0;"><span class="material-icons-round" style="font-size: 11px;">hexagon</span>${price}</span>`
              : `<span style="display: inline-flex; align-items: center; gap: 2px; font-weight: 700; color: #3ecf8e; background: rgba(62,207,142,0.12); padding: 2px 6px; border-radius: 4px; font-size: 11px; flex-shrink: 0;"> ${t('ฟรี')} </span>`;
          } else {
            priceBadge = `<span style="display: inline-flex; align-items: center; gap: 2px; font-weight: 500; color: var(--t3); background: var(--s4); padding: 2px 6px; border-radius: 4px; font-size: 11px; flex-shrink: 0;">Offsale</span>`;
          }
          
          const thumbImg = thumb 
            ? `<img src="${esc(thumb)}" alt="" style="width: 32px; height: 32px; border-radius: 4px; background: var(--s4); object-fit: contain; border: 1px solid var(--bd);" />`
            : `<div style="width: 32px; height: 32px; border-radius: 4px; background: var(--s4); display: flex; align-items: center; justify-content: center; border: 1px solid var(--bd);"><span class="material-icons-round" style="font-size: 16px; color: var(--t3);">checkroom</span></div>`;
            
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 6px; background: var(--s3); border-radius: 6px; border: 1px solid var(--bd); cursor: pointer; transition: background var(--dur) var(--ease);" onclick="api.openExternal('https://www.roblox.com/catalog/${item.id}')" title="เปิดหน้าไอเทมในเบราว์เซอร์">
              <div style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1;">
                ${thumbImg}
                <div style="display: flex; flex-direction: column; min-width: 0;">
                  <span style="color: var(--t1); font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px;" title="${esc(name)}">${esc(name)}</span>
                  <span style="font-size: 10px; color: var(--t3);">${esc(item.assetType?.name || 'Item')}</span>
                </div>
              </div>
              ${priceBadge}
            </div>
          `;
        }).join('');
      }
    }).catch(e => {
      assetsList.innerHTML = `<div style="grid-column: 1 / -1; font-size: 11px; color: var(--red); text-align: center; padding: 12px;">${t('โหลดข้อมูลล้มเหลว')}</div>`;
    });
    
  // 3. Fetch recently played games (authenticated)
  if (a.cookie) {
    api.getAuthenticatedJson('games.roblox.com', '/v1/games/list?model.sortToken=v2RecentlyPlayed&model.maxRows=8', a.cookie)
      .then(d => {
        const games = d?.games || [];
        if (!games.length) {
          recentMaps.innerHTML = `<div style="font-size: 11px; color: var(--t3); text-align: center; padding: 12px;">${t('ไม่มีข้อมูลประวัติการเล่น')}</div>`;
        } else {
          recentMaps.innerHTML = games.map(g => {
            const label = esc(g.name || t('ไม่ทราบชื่อ'));
            const pid = g.placeId;
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: var(--s3); border-radius: 6px; border: 1px solid var(--bd);">
                <div style="display: flex; flex-direction: column; min-width: 0; flex: 1;">
                  <span style="color: var(--t1); font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${label}">${label}</span>
                  <span style="font-size: 10px; color: var(--t3); font-family: monospace;">Place ID: ${pid}</span>
                </div>
                <button class="btn btn-primary" style="padding: 4px 8px; font-size: 10.5px; border-radius: 4px; display: flex; align-items: center; gap: 2px;" onclick="closeModal('m-avatar-inspect'); launchGameDirectlyFromInspect('${a.id}', '${pid}')">
                  <span class="material-icons-round" style="font-size: 12px">play_arrow</span>${t('เริ่ม')}
                </button>
              </div>
            `;
          }).join('');
        }
      }).catch(e => {
        recentMaps.innerHTML = `<div style="font-size: 11px; color: var(--t3); text-align: center; padding: 12px;">${t('ไม่มีข้อมูลประวัติการเล่น')}</div>`;
      });
  } else {
    recentMaps.innerHTML = `<div style="font-size: 11px; color: var(--t3); text-align: center; padding: 12px;">${t('คุกกี้ไม่ถูกต้อง')}</div>`;
  }
}

async function launchGameDirectlyFromInspect(accountId, placeId) {
  const m = accounts.find(x => x.id === accountId);
  if (!m) return;
  toast(t('กำลังเปิด...') + ' ' + m.username, 'ok');
  const res = await api.launchRoblox(m.id, m.cookie, placeId);
  if (res.success) {
    toast(t('เปิดเกมสำเร็จ') + ': ' + m.username, 'ok');
  } else {
    toast(t('เปิดไม่สำเร็จสำหรับ ') + m.username + ': ' + res.error, 'err');
  }
}
function copyGameId() {
  const id = String(_gameModal.placeId || '');
  if (!id) return;
  navigator.clipboard.writeText(id).then(() => toast('คัดลอก Place ID แล้ว', 'ok'));
}
function gamePageOpen() {
  if (_gameModal.placeId) api.openExternal('https://www.roblox.com/games/' + _gameModal.placeId);
}


// ── Mixer (graphics / fps / volume / kill) ─────────────────────────────────
// Graphics & FPS are written as global Fast Flags (one shared ClientAppSettings
// file → every instance reads them), so they apply to all instances on next
// launch. Volume is applied live to running clients via the OS audio mixer.
const FF_GFX = 'DFIntDebugFRMQualityLevelOverride';
const FF_FPS = 'DFIntTaskSchedulerTargetFps';
let _volTimer = null, _mixRunning = 0;

async function mixInit() {
  // Pull current values from saved Fast Flags + settings.
  let flags = {};
  try { flags = (await api.readFFlags()) || {}; } catch {}

  // Graphics
  const gfxRaw = flags[FF_GFX];
  const gfxAuto = (gfxRaw === undefined || gfxRaw === null || gfxRaw === '');
  document.getElementById('mix-gfx-auto').checked = gfxAuto;
  const gfxVal = clampInt(gfxRaw, 1, 21, 10);
  document.getElementById('mix-gfx').value = gfxVal;
  document.getElementById('mix-gfx-val').textContent = gfxAuto ? 'อัตโนมัติ' : gfxVal;
  document.getElementById('mix-gfx').disabled = gfxAuto;

  // FPS - read from GlobalBasicSettings_13.xml via new ipc
  try {
    const fpsCap = await api.readFpsCap();
    const fpsUnl = (fpsCap === 0);
    document.getElementById('mix-fps-unl').checked = fpsUnl;
    document.getElementById('mix-fps').value = fpsUnl ? 60 : Math.max(30, fpsCap || 60);
    document.getElementById('mix-fps-val').textContent = fpsUnl ? 'ไม่จำกัด' : (fpsCap || 60);
    document.getElementById('mix-fps').disabled = fpsUnl;
  } catch {}

  // Volume
  const vol = (typeof settings.masterVolume === 'number') ? settings.masterVolume : 100;
  document.getElementById('mix-vol').value = vol;
  document.getElementById('mix-vol-val').textContent = vol + '%';

  updateSliderFill(document.getElementById('mix-gfx'));
  updateSliderFill(document.getElementById('mix-fps'));
  updateSliderFill(document.getElementById('mix-vol'));
  mixRefreshRunning();
}

// FPS
function mixFpsInput(v) {
  document.getElementById('mix-fps-val').textContent = v;
  updateSliderFill(document.getElementById('mix-fps'));
}
function mixFpsUnlToggle() {
  const unl = document.getElementById('mix-fps-unl').checked;
  document.getElementById('mix-fps').disabled = unl;
  if (unl) {
    document.getElementById('mix-fps-val').textContent = '\u221e';
    api.writeFpsCap(0);
    toast('FPS set to unlimited (next launch)', 'ok');
  } else {
    mixFpsCommit();
  }
}
function mixFpsCommit() {
  if (document.getElementById('mix-fps-unl').checked) return;
  const v = parseInt(document.getElementById('mix-fps').value, 10);
  document.getElementById('mix-fps-val').textContent = v;
  api.writeFpsCap(v);
  toast('FPS cap: ' + v + ' (next launch)', 'ok');
}

function clampInt(v, min, max, dflt) {
  const n = parseInt(v, 10);
  if (isNaN(n)) return dflt;
  return Math.max(min, Math.min(max, n));
}

// Updates both the Mixer badge and the always-visible titlebar badge (next to
// the Roblox version hash) so the running count shows everywhere, not just on
// the Mixer page. The titlebar badge goes "live" (green dot) when >0.
function setRunningBadges(n) {
  const txt = n + ' running';
  const tb = document.getElementById('tb-running');
  if (tb) {
    tb.textContent = txt;
    tb.classList.toggle('live', n > 0);
    tb.style.display = n > 0 ? 'inline-flex' : 'none';
  }
}

// Lightweight global poll so the titlebar counter stays current off the Mixer
// page too. Cheap (tasklist under the hood); 3s cadence matches the rest of UI.
let _runningPoll = null;
let _lastCountPushAt = 0;
async function pollRunningCount() {
  // main pushes the count every ~5s while watching; skip our own tasklist
  // call if one of those landed recently.
  if (Date.now() - _lastCountPushAt < 6500) return;
  let n = 0;
  try { n = await api.getRunningCount(); } catch { n = 0; }
  _mixRunning = n;
  setRunningBadges(n);
}
function startRunningPoll() {
  if (_runningPoll) return;
  pollRunningCount();
  _runningPoll = setInterval(pollRunningCount, 3000);
}

async function mixRefreshRunning() {
  try {
    _mixRunning = await api.getRunningCount();
  } catch { _mixRunning = 0; }
  setRunningBadges(_mixRunning);

  // If processes are running but we have no launched IDs (e.g. app restarted),
  // seed _launchedIds from accounts that have been used recently (last 2 hours).
  if (_mixRunning > 0 && _launchedIds.size === 0) {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const recentAccounts = accounts.filter(a => a.lastUsed && new Date(a.lastUsed).getTime() > twoHoursAgo);
    const seed = recentAccounts.slice(0, _mixRunning);
    for (const a of seed) {
      markLaunched(a.id);
    }
  }
}

// Merge a single key into the on-disk Fast Flags without disturbing others.
async function mixWriteFlag(key, value) {
  let flags = {};
  try { flags = (await api.readFFlags()) || {}; } catch {}
  if (value === null) delete flags[key];
  else flags[key] = String(value);
  try { await api.writeFFlags(flags); } catch {}
}

// Smoothly fill the slider track up to the current value.
function updateSliderFill(el) {
  if (!el) return;
  const min = parseFloat(el.min) || 0, max = parseFloat(el.max) || 100, v = parseFloat(el.value);
  const pct = max > min ? ((v - min) / (max - min)) * 100 : 0;
  el.style.background = 'linear-gradient(90deg, var(--ac) ' + pct + '%, var(--s4) ' + pct + '%)';
}

// Graphics
function mixGfxInput(v) {
  document.getElementById('mix-gfx-val').textContent = v;
  updateSliderFill(document.getElementById('mix-gfx'));
}
function mixGfxAutoToggle() {
  const auto = document.getElementById('mix-gfx-auto').checked;
  document.getElementById('mix-gfx').disabled = auto;
  if (auto) {
    document.getElementById('mix-gfx-val').textContent = 'อัตโนมัติ';
    mixWriteFlag(FF_GFX, null);
    toast('ตั้งค่ากราฟิกเป็นอัตโนมัติแล้ว', 'ok');
  } else {
    mixGfxCommit();
  }
}
function mixGfxCommit() {
  if (document.getElementById('mix-gfx-auto').checked) return;
  const v = document.getElementById('mix-gfx').value;
  document.getElementById('mix-gfx-val').textContent = v;
  mixWriteFlag(FF_GFX, v);
  toast('Graphics quality: ' + v + ' (next launch)', 'ok');
}

// Volume - applies live while dragging (debounced so we don't spawn the helper
// on every drag tick), and saves + confirms on release.
function mixVolInput(v) {
  document.getElementById('mix-vol-val').textContent = v + '%';
  updateSliderFill(document.getElementById('mix-vol'));
  clearTimeout(_volTimer);
  _volTimer = setTimeout(() => { api.setRobloxVolume(parseInt(v, 10)); }, 90);
}
function mixVolCommit() {
  const v = parseInt(document.getElementById('mix-vol').value, 10);
  document.getElementById('mix-vol-val').textContent = v + '%';
  updateSliderFill(document.getElementById('mix-vol'));
  settings.masterVolume = v;
  api.saveSettings({ masterVolume: v });
  clearTimeout(_volTimer);
  _volTimer = setTimeout(async () => {
    const res = await api.setRobloxVolume(v);
    if (res && res.ok) {
      toast('Volume ' + v + '%', 'ok');
    } else {
      toast('Couldn\u2019t set volume' + (res && res.error ? ': ' + res.error : ''), 'err');
    }
  }, 60);
}

// Kill all
async function mixKillAll() {
  const btns = Array.from(document.querySelectorAll('.kill-roblox-btn'));
  if (!btns.length || btns[0].disabled) return;
  btns.forEach(b => { b.disabled = true; b.dataset.orig = b.innerHTML; b.innerHTML = '<div class="spin"></div>Stopping\u2026'; });
  const res = await api.killAllRoblox();
  // Reset all dots / launched state.
  _launchedIds.clear();
  document.querySelectorAll('.card-dot.launched').forEach(d => { d.classList.remove('launched'); d.title = 'Not launched'; });
  refreshPkgAvatarStatus();
  await mixRefreshRunning();
  btns.forEach(b => { b.disabled = false; b.innerHTML = b.dataset.orig; });
  if (res && res.ok) toast('All Roblox instances closed', 'ok');
  else toast('Kill failed' + (res && res.error ? ': ' + res.error : ''), 'err');
}

// Apply graphics/fps to instances that are already open by relaunching the
// accounts currently marked as launched (each with its saved target).
async function mixApplyAndRelaunch() {
  const btn = document.getElementById('mix-relaunch-btn');
  if (btn.disabled) return;

  // Re-check running count first so a fresh app session still works.
  await mixRefreshRunning();
  let ids = Array.from(_launchedIds);

  // If no tracked IDs but Roblox is actually running, fall back to recently
  // used accounts (sorted newest first, capped to running count).
  if (!ids.length && _mixRunning > 0) {
    const sorted = accounts
      .filter(a => a.lastUsed)
      .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
      .slice(0, _mixRunning);
    ids = sorted.map(a => a.id);
  }

  if (!ids.length) {
    toast('No running accounts to relaunch', 'err');
    return;
  }
  btn.disabled = true;
  const orig = btn.innerHTML;
  btn.innerHTML = '<div class="spin"></div>' + t('กำลังเปิดใหม่...');

  await api.killAllRoblox();
  _launchedIds.clear();
  document.querySelectorAll('.card-dot.launched').forEach(d => { d.classList.remove('launched'); d.title = 'Not launched'; });
  refreshPkgAvatarStatus();

  // Give Roblox a moment to fully exit before relaunching.
  await new Promise(r => setTimeout(r, 1500));

  let ok = 0;
  for (const id of ids) {
    const acc = accounts.find(a => a.id === id);
    if (!acc) continue;
    const res = await api.launchRoblox(acc.id, acc.cookie, acc.gameTarget || null);
    if (res && res.success) {
      ok++;
      markLaunched(acc.id);
    }
  }
  await mixRefreshRunning();
  btn.disabled = false;
  btn.innerHTML = orig;
  toast('Relaunched ' + ok + ' account' + (ok !== 1 ? 's' : '') + ' with new settings', ok ? 'ok' : 'err');
}


function genToggleKey() {
  const inp = document.getElementById('gen-apikey');
  const icon = document.getElementById('gen-eye-icon');
  if (inp.type === 'password') { inp.type = 'text'; icon.textContent = 'visibility_off'; }
  else { inp.type = 'password'; icon.textContent = 'visibility'; }
}

async function genCombo() {
  const apiKey = (document.getElementById('gen-apikey').value || '').trim();
  try { localStorage.setItem('bloxgen_apikey', document.getElementById('gen-apikey').value); } catch {}
  if (!apiKey || !apiKey.startsWith('BLOX-')) {
    toast('กรอก BloxGen API key ที่ถูกต้อง (ต้องขึ้นต้นด้วย BLOX-)', 'err');
    return;
  }

  const btn = document.getElementById('gen-btn');
  const out = document.getElementById('gen-output');
  if (btn) { btn.textContent = 'Generating…'; btn.disabled = true; }

  try {
    const resp = await fetch('https://core.bloxgen.net/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, type: 'alt' })
    });
    const data = await resp.json();

    if (!data.success) {
      toast(data.message || data.error || 'Generation failed', 'err');
      if (btn) { btn.textContent = 'Generate'; btn.disabled = false; }
      return;
    }

    const d = data.data;
    out.value = d.username + ':' + d.password;
    out.select();

    // Store in history
    _lastGenData = d;
    _genHistory.unshift({ username: d.username, password: d.password, cookie: d.cookie });
    if (_genHistory.length > 500) _genHistory.length = 500; // bound the persisted history
    api.writeGenHistory(_genHistory).catch(() => {});
    _ghPrepend();

    // Copy cookie to clipboard if available, else username:password
    const toCopy = d.cookie || (d.username + ':' + d.password);
    navigator.clipboard.writeText(toCopy).catch(() => {});

    if (btn) { btn.textContent = 'Generate'; btn.disabled = false; }

  } catch (e) {
    toast('Network error: ' + e.message, 'err');
    if (btn) { btn.textContent = 'Generate'; btn.disabled = false; }
  }
}

let _genHistory = [];
let _lastGenData = null;

const GH_ITEM_H = 36;
const GH_VISIBLE = 4;
const GH_BATCH = 40;
let _ghRendered = 0;

function genRenderHistory() {
  const list = document.getElementById('gen-history-list');
  const sc = document.getElementById('gen-history-sc');
  if (!list || !sc) return;
  if (_genHistory.length === 0) { sc.style.display = 'none'; return; }
  sc.style.display = '';
  if (_genHistory.length > GH_VISIBLE) {
    list.style.maxHeight = (GH_ITEM_H * GH_VISIBLE) + 'px';
  } else {
    list.style.maxHeight = '';
  }
  _ghRendered = 0;
  list.innerHTML = '';
  _ghAppendBatch(list);
  list.onscroll = () => {
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 20) _ghAppendBatch(list);
  };
}

function _ghAppendBatch(list) {
  const end = Math.min(_ghRendered + GH_BATCH, _genHistory.length);
  if (_ghRendered >= end) return;
  const frag = document.createDocumentFragment();
  for (let i = _ghRendered; i < end; i++) {
    const h = _genHistory[i];
    const row = document.createElement('div');
    row.className = 'gen-hist-item';
    row.dataset.idx = i;
    row.innerHTML =
      '<span class="gh-user"><span style="color:var(--t3)">User:</span> ' + esc(h.username) + '  <span style="color:var(--t3)">Pass:</span> ' + esc(h.password) + '</span>' +
      '<div class="gh-actions">' +
        '<button class="btn btn-ghost" title="Copy combo"><span class="material-icons-round" style="font-size:15px">content_copy</span></button>' +
        '<button class="btn btn-ghost" title="Add to accounts"><span class="material-icons-round" style="font-size:15px">person_add</span></button>' +
      '</div>';
    const btns = row.querySelectorAll('button');
    btns[0].onclick = () => genHistCopy(i);
    btns[1].onclick = () => genHistAdd(i);
    frag.appendChild(row);
  }
  list.appendChild(frag);
  _ghRendered = end;
}

function _ghPrepend() {
  const list = document.getElementById('gen-history-list');
  const sc = document.getElementById('gen-history-sc');
  if (!list || !sc) return;
  sc.style.display = '';
  if (_genHistory.length > GH_VISIBLE) list.style.maxHeight = (GH_ITEM_H * GH_VISIBLE) + 'px';
  // Re-index existing rows so their onclick indices stay correct
  list.querySelectorAll('.gen-hist-item').forEach(row => {
    const old = +row.dataset.idx;
    const ni = old + 1;
    row.dataset.idx = ni;
    const btns = row.querySelectorAll('button');
    btns[0].onclick = () => genHistCopy(ni);
    btns[1].onclick = () => genHistAdd(ni);
  });
  _ghRendered++;
  const h = _genHistory[0];
  const row = document.createElement('div');
  row.className = 'gen-hist-item';
  row.dataset.idx = 0;
  row.innerHTML =
    '<span class="gh-user"><span style="color:var(--t3)">User:</span> ' + esc(h.username) + '  <span style="color:var(--t3)">Pass:</span> ' + esc(h.password) + '</span>' +
    '<div class="gh-actions">' +
      '<button class="btn btn-ghost" title="Copy combo"><span class="material-icons-round" style="font-size:15px">content_copy</span></button>' +
      '<button class="btn btn-ghost" title="Add to accounts"><span class="material-icons-round" style="font-size:15px">person_add</span></button>' +
    '</div>';
  const btns = row.querySelectorAll('button');
  btns[0].onclick = () => genHistCopy(0);
  btns[1].onclick = () => genHistAdd(0);
  list.insertBefore(row, list.firstChild);
  list.scrollTop = 0;
}

function genHistCopy(i) {
  const h = _genHistory[i];
  if (!h) return;
  navigator.clipboard.writeText(h.username + ':' + h.password).then(() => toast('Copied ' + h.username, 'ok'));
}

async function genHistAdd(i) {
  const h = _genHistory[i];
  if (!h || !h.cookie) { toast('ไม่มีคุกกี้สำหรับบัญชีนี้', 'err'); return; }
  try {
    const res = await api.validateCookie(h.cookie);
    if (!res || !res.username) { toast('คุกกี้ไม่ถูกต้องหรือหมดอายุ', 'err'); return; }
    const a = await api.addAccount({ username: res.username, userId: res.userId, cookie: h.cookie, gameTarget: '', nickname: '' });
    if (a) { accounts.push(a); render(); toast('เพิ่ม ' + res.username + ' ลงในบัญชีแล้ว', 'ok'); }
  } catch(e) { toast('เพิ่มไม่สำเร็จ: ' + e.message, 'err'); }
}

async function genAddToAccounts() {
  if (!_lastGenData || !_lastGenData.cookie) { toast('ไม่มีคุกกี้', 'err'); return; }
  const btn = document.getElementById('gen-add-btn');
  if (btn) { btn.disabled = true; }
  try {
    const res = await api.validateCookie(_lastGenData.cookie);
    if (!res || !res.username) { toast('คุกกี้ไม่ถูกต้องหรือหมดอายุ', 'err'); if(btn)btn.disabled=false; return; }
    const a = await api.addAccount({ username: res.username, userId: res.userId, cookie: _lastGenData.cookie, gameTarget: '', nickname: '' });
    if (a) { accounts.push(a); render(); toast('เพิ่ม ' + res.username + ' ลงในบัญชีแล้ว', 'ok'); }
    if(btn)btn.disabled=false;
  } catch(e) { toast('ไม่สำเร็จ: ' + e.message, 'err'); if(btn)btn.disabled=false; }
}

function genClearHistory() {
  _genHistory = [];
  _lastGenData = null;
  api.clearGenHistory().catch(() => {});
  genRenderHistory();
  toast('ล้างประวัติแล้ว', 'ok');
}

function genDetailsCopy() {
  const details = document.getElementById('gen-details');
  const text = details ? details.innerText.replace('copy', '').trim() : '';
  if (!text) { toast('ไม่มีรายละเอียดให้คัดลอก', 'err'); return; }
  const btn = document.getElementById('gen-details-copy-btn');
  navigator.clipboard.writeText(text).then(() => {
    if (btn) { const s = btn.querySelector('span:last-child'); if(s){s.textContent='done'; setTimeout(()=>{s.textContent='details';},1500);} }
    toast('Details copied', 'ok');
  });
}

function genCopy() {
  const val = document.getElementById('gen-output').value;
  if (!val) { toast('Nothing to copy', 'err'); return; }
  const btn = document.getElementById('gen-copy-btn');
  navigator.clipboard.writeText(val).then(() => {
    if (btn) {
      const icon = btn.querySelector('.material-icons-round');
      if (icon) { icon.textContent = 'check'; setTimeout(() => { icon.textContent = 'content_copy'; }, 1500); }
    }
    toast('Copied to clipboard', 'ok');
  });
}

// ── Sound Effects ──────────────────────────────────────────────────────────
(function() {
  let _audioCtx = null;
  function _ctx() {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (_audioCtx && _audioCtx.state === 'suspended') {
      try { _audioCtx.resume(); } catch {}
    }
    return _audioCtx;
  }

  // ── Synth helpers ─────────────────────────────────────────────────────────
  function _playBuf(buf, vol) {
    const ctx = _ctx();
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = vol;
    src.connect(g); g.connect(ctx.destination);
    src.start(); src.stop(ctx.currentTime + buf.duration);
  }

  function _makeBuf(durationSec, fillFn) {
    const ctx = _ctx();
    const sr = ctx.sampleRate;
    const len = Math.ceil(sr * durationSec);
    const buf = ctx.createBuffer(1, len, sr);
    fillFn(buf.getChannelData(0), sr, len);
    return buf;
  }

  function _noise(d) { return Math.random() * 2 - 1; }

  // ── Synth voice helpers ───────────────────────────────────────────────────
  function _osc(ctx, type, freq, t, duration, gainStart, gainEnd) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(gainStart, t);
    g.gain.exponentialRampToValueAtTime(Math.max(gainEnd, 0.0001), t + duration);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + duration + 0.005);
    return { o, g };
  }
  function _filt(ctx, type, freq, Q) {
    const f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq;
    if (Q !== undefined) f.Q.value = Q;
    return f;
  }

  // ── Sound profiles ────────────────────────────────────────────────────────
  const SOUND_PROFILES = {
    clicky: {
      label: 'Clicky',
      icon: 'keyboard',
      desc: 'Cherry MX Blue - sharp tactile snap',
      play(vol) {
        const ctx = _ctx(); const t = ctx.currentTime;
        // 1) Sharp high-freq click transient (the "tick" of the leaf spring)
        const clickBuf = _makeBuf(0.008, (d, sr) => {
          for (let i = 0; i < d.length; i++) {
            const x = i / sr;
            d[i] = (_noise() * 0.7 + Math.sin(2*Math.PI*3200*x) * 0.3) * Math.exp(-x * 1800);
          }
        });
        const clickSrc = ctx.createBufferSource(); clickSrc.buffer = clickBuf;
        const hp1 = _filt(ctx, 'highpass', 3500);
        const g1 = ctx.createGain(); g1.gain.setValueAtTime(vol * 2.5, t); g1.gain.exponentialRampToValueAtTime(0.001, t + 0.008);
        clickSrc.connect(hp1); hp1.connect(g1); g1.connect(ctx.destination);
        clickSrc.start(t); clickSrc.stop(t + 0.01);

        // 2) Mid-range body snap (plastic housing resonance)
        const snapBuf = _makeBuf(0.025, (d, sr) => {
          for (let i = 0; i < d.length; i++) {
            const x = i / sr;
            d[i] = (_noise() * 0.5 + Math.sin(2*Math.PI*1100*x) * 0.4 + Math.sin(2*Math.PI*2200*x) * 0.1)
                  * Math.exp(-x * 350);
          }
        });
        const snapSrc = ctx.createBufferSource(); snapSrc.buffer = snapBuf;
        const bp1 = _filt(ctx, 'bandpass', 1400, 1.2);
        const g2 = ctx.createGain(); g2.gain.setValueAtTime(vol * 1.8, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
        snapSrc.connect(bp1); bp1.connect(g2); g2.connect(ctx.destination);
        snapSrc.start(t); snapSrc.stop(t + 0.03);

        // 3) Low-end bottom-out thud
        const thudBuf = _makeBuf(0.035, (d, sr) => {
          for (let i = 0; i < d.length; i++) {
            const x = i / sr;
            d[i] = (_noise() * 0.3 + Math.sin(2*Math.PI*180*x) * 0.7) * Math.exp(-x * 180);
          }
        });
        const thudSrc = ctx.createBufferSource(); thudSrc.buffer = thudBuf;
        const lp1 = _filt(ctx, 'lowpass', 600);
        const g3 = ctx.createGain(); g3.gain.setValueAtTime(vol * 0.6, t + 0.004); g3.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        thudSrc.connect(lp1); lp1.connect(g3); g3.connect(ctx.destination);
        thudSrc.start(t + 0.004); thudSrc.stop(t + 0.045);
      }
    },

    thocky: {
      label: 'Thocky',
      icon: 'piano',
      desc: 'NK Cream - deep marbly thud',
      play(vol) {
        const ctx = _ctx(); const t = ctx.currentTime;
        // 1) Deep pitched thud (stem hitting the bottom housing)
        const thudBuf = _makeBuf(0.12, (d, sr) => {
          for (let i = 0; i < d.length; i++) {
            const x = i / sr;
            // Pitch starts high and drops (impact character)
            const freq = 95 + 280 * Math.exp(-x * 60);
            d[i] = (Math.sin(2*Math.PI*freq*x) * 0.65
                  + Math.sin(2*Math.PI*freq*1.6*x) * 0.2
                  + _noise() * 0.15)
                  * Math.exp(-x * 65);
          }
        });
        const thudSrc = ctx.createBufferSource(); thudSrc.buffer = thudBuf;
        const lp2 = _filt(ctx, 'lowpass', 700);
        const g1 = ctx.createGain(); g1.gain.setValueAtTime(vol * 1.8, t); g1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        thudSrc.connect(lp2); lp2.connect(g1); g1.connect(ctx.destination);
        thudSrc.start(t); thudSrc.stop(t + 0.13);

        // 2) Soft high transient (muted click, not snappy)
        const transBuf = _makeBuf(0.015, (d, sr) => {
          for (let i = 0; i < d.length; i++) {
            d[i] = _noise() * Math.exp(-(i/sr) * 900);
          }
        });
        const transSrc = ctx.createBufferSource(); transSrc.buffer = transBuf;
        const bp2 = _filt(ctx, 'bandpass', 900, 0.7);
        const g2 = ctx.createGain(); g2.gain.setValueAtTime(vol * 0.7, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
        transSrc.connect(bp2); bp2.connect(g2); g2.connect(ctx.destination);
        transSrc.start(t); transSrc.stop(t + 0.02);

        // 3) Low frequency body resonance for that "marble" feel
        const resBuf = _makeBuf(0.08, (d, sr) => {
          for (let i = 0; i < d.length; i++) {
            const x = i/sr;
            d[i] = Math.sin(2*Math.PI*55*x) * Math.exp(-x * 90) * 0.9;
          }
        });
        const resSrc = ctx.createBufferSource(); resSrc.buffer = resBuf;
        const lp3 = _filt(ctx, 'lowpass', 200);
        const g3 = ctx.createGain(); g3.gain.setValueAtTime(vol * 0.9, t); g3.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        resSrc.connect(lp3); lp3.connect(g3); g3.connect(ctx.destination);
        resSrc.start(t); resSrc.stop(t + 0.09);
      }
    },

    creamy: {
      label: 'Creamy',
      icon: 'water_drop',
      desc: 'Gateron Yellow - buttery smooth glide',
      play(vol) {
        const ctx = _ctx(); const t = ctx.currentTime;
        // 1) Very soft initial contact (no click, just smooth compression)
        const softBuf = _makeBuf(0.07, (d, sr) => {
          for (let i = 0; i < d.length; i++) {
            const x = i / sr;
            const freq = 130 + 100 * Math.exp(-x * 40);
            d[i] = (Math.sin(2*Math.PI*freq*x) * 0.55
                  + Math.sin(2*Math.PI*freq*2.1*x) * 0.25
                  + Math.sin(2*Math.PI*freq*3.3*x) * 0.12
                  + _noise() * 0.08)
                  * Math.exp(-x * 110);
          }
        });
        const softSrc = ctx.createBufferSource(); softSrc.buffer = softBuf;
        const bp3 = _filt(ctx, 'bandpass', 280, 0.6);
        const g1 = ctx.createGain(); g1.gain.setValueAtTime(vol * 1.6, t); g1.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        softSrc.connect(bp3); bp3.connect(g1); g1.connect(ctx.destination);
        softSrc.start(t); softSrc.stop(t + 0.075);

        // 2) Very subtle air/brush noise (lubed stem feel)
        const brushBuf = _makeBuf(0.05, (d, sr) => {
          for (let i = 0; i < d.length; i++) {
            d[i] = _noise() * Math.exp(-(i/sr) * 200) * 0.5;
          }
        });
        const brushSrc = ctx.createBufferSource(); brushSrc.buffer = brushBuf;
        const bp4 = _filt(ctx, 'bandpass', 500, 1.5);
        const g2 = ctx.createGain(); g2.gain.setValueAtTime(vol * 0.3, t); g2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        brushSrc.connect(bp4); bp4.connect(g2); g2.connect(ctx.destination);
        brushSrc.start(t); brushSrc.stop(t + 0.06);

        // 3) Warm low-end resonance
        const warmBuf = _makeBuf(0.06, (d, sr) => {
          for (let i = 0; i < d.length; i++) {
            const x = i/sr;
            d[i] = (Math.sin(2*Math.PI*70*x) * 0.6 + Math.sin(2*Math.PI*140*x) * 0.4)
                  * Math.exp(-x * 140);
          }
        });
        const warmSrc = ctx.createBufferSource(); warmSrc.buffer = warmBuf;
        const lp4 = _filt(ctx, 'lowpass', 350);
        const g3 = ctx.createGain(); g3.gain.setValueAtTime(vol * 1.0, t); g3.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        warmSrc.connect(lp4); lp4.connect(g3); g3.connect(ctx.destination);
        warmSrc.start(t); warmSrc.stop(t + 0.07);
      }
    },

    poppy: {
      label: 'Poppy',
      icon: 'bubble_chart',
      desc: 'Light airy pop',
      play(vol) {
        const ctx = _ctx(); const t = ctx.currentTime;
        const buf = _makeBuf(0.025, (d, sr) => {
          for (let i = 0; i < d.length; i++) {
            const x = i/sr;
            d[i] = _noise() * Math.exp(-x*1100);
          }
        });
        const src = ctx.createBufferSource(); src.buffer = buf;
        const bp = ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=1800; bp.Q.value=1.2;
        const g = ctx.createGain(); g.gain.setValueAtTime(vol*1.8, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.025);
        src.connect(bp); bp.connect(g); g.connect(ctx.destination);
        src.start(t); src.stop(t+0.025);
      }
    },

    typewriter: {
      label: 'Typewriter',
      icon: 'article',
      desc: 'Vintage key rattle',
      play(vol) {
        const ctx = _ctx(); const t = ctx.currentTime;
        // Main strike
        const buf = _makeBuf(0.035, (d, sr) => {
          for (let i = 0; i < d.length; i++) {
            const x = i/sr;
            d[i] = _noise() * Math.exp(-x*350)
                 + Math.sin(2*Math.PI*280*x) * Math.exp(-x*500) * 0.5;
          }
        });
        const src = ctx.createBufferSource(); src.buffer = buf;
        const hp = ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=1500;
        const g = ctx.createGain(); g.gain.setValueAtTime(vol*1.6, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.035);
        src.connect(hp); hp.connect(g); g.connect(ctx.destination);
        src.start(t); src.stop(t+0.035);
        // rattle tail
        const buf2 = _makeBuf(0.02, (d, sr) => {
          for (let i = 0; i < d.length; i++) d[i] = _noise() * Math.exp(-(i/sr)*500);
        });
        const src2 = ctx.createBufferSource(); src2.buffer = buf2;
        const hp2 = ctx.createBiquadFilter(); hp2.type='highpass'; hp2.frequency.value=2500;
        const g2 = ctx.createGain(); g2.gain.setValueAtTime(vol*0.5, t+0.018); g2.gain.exponentialRampToValueAtTime(0.001, t+0.038);
        src2.connect(hp2); hp2.connect(g2); g2.connect(ctx.destination);
        src2.start(t+0.018); src2.stop(t+0.04);
      }
    },

    off: {
      label: 'Off',
      icon: 'volume_off',
      desc: 'No sound',
      play() {}
    }
  };

  // ── State ─────────────────────────────────────────────────────────────────
  let _currentProfile = 'clicky';
  let _volume = 0.35;

  try {
    const saved = localStorage.getItem('sound-profile');
    if (saved && SOUND_PROFILES[saved]) _currentProfile = saved;
    const sv = localStorage.getItem('sound-volume');
    if (sv !== null) _volume = parseFloat(sv);
  } catch {}

  // ── Play current ──────────────────────────────────────────────────────────
  window._soundPlay = function() {
    if (_currentProfile.startsWith('__custom__')) {
      const cid = _currentProfile.slice('__custom__'.length);
      const s = _customSounds.find(x => x.id === cid);
      if (s) _playBuf(s.buffer, _volume);
    } else if (SOUND_PROFILES[_currentProfile]) {
      SOUND_PROFILES[_currentProfile].play(_volume);
    }
  };

  // ── Click listener ────────────────────────────────────────────────────────
  const INTERACTIVE = [
    'button','a','.nav-item','.card','.card-add','.theme-card',
    '.tb-btn','.btn','.filter-menu button','.chart-card',
    '[role="button"]','.cdd-trigger','.cdd-option','.pkg-launch-btn',
    'input[type="checkbox"]','input[type="radio"]','.nav-add',
    '.gen-hist-row','.modal-close','.modal .btn','.sound-card'
  ].join(',');

  document.addEventListener('click', e => {
    if (e.target.closest(INTERACTIVE)) window._soundPlay();
  }, true);

  // ── Multi-custom sounds state ─────────────────────────────────────────────
  // _customSounds: Array<{ id: string, name: string, buffer: AudioBuffer }>
  let _customSounds = [];
  let _customSoundIdCounter = 0;

  function _saveCustomSoundMeta() {
    try {
      localStorage.setItem('sound-customs-meta', JSON.stringify(
        _customSounds.map(s => ({ id: s.id, name: s.name }))
      ));
    } catch {}
  }

  // ── Sounds page UI ────────────────────────────────────────────────────────
  window.soundRenderPage = function() {
    const grid = document.getElementById('sound-cards-grid');
    if (!grid) return;

    // Built-in profile cards
    const builtinHtml = Object.entries(SOUND_PROFILES).map(([id, p]) => `
      <div class="sound-card ${_currentProfile === id ? 'sel' : ''}" data-sid="${id}" onclick="soundSelect('${id}')">
        <div class="sound-card-icon"><span class="material-icons-round">${p.icon}</span></div>
        <div class="sound-card-label">${p.label}</div>
        <div class="sound-card-desc">${p.desc}</div>
        <button class="sound-card-preview" onclick="event.stopPropagation();soundPreview('${id}')" title="Preview">
          <span class="material-icons-round">play_arrow</span>
        </button>
      </div>`).join('');

    // Custom sound cards (one per uploaded sound)
    const customHtml = _customSounds.map(s => `
      <div class="sound-card ${_currentProfile === '__custom__' + s.id ? 'sel' : ''}" onclick="soundSelectCustom('${s.id}')">
        <div class="sound-card-icon"><span class="material-icons-round">audiotrack</span></div>
        <div class="sound-card-label" style="font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px" title="${s.name}">${s.name}</div>
        <div class="sound-card-desc">Custom sound</div>
        <div style="display:flex;gap:4px;margin-top:auto">
          <button class="sound-card-preview" onclick="event.stopPropagation();soundPreviewCustom('${s.id}')" title="Preview">
            <span class="material-icons-round">play_arrow</span>
          </button>
          <button class="sound-card-preview" onclick="event.stopPropagation();soundDeleteCustom('${s.id}')" title="Delete" style="background:rgba(255,80,80,.15);color:#ff6b6b">
            <span class="material-icons-round icon-delete">delete</span>
          </button>
        </div>
      </div>`).join('');

    grid.innerHTML = builtinHtml + customHtml;

    const slider = document.getElementById('sound-vol-slider');
    if (slider) slider.value = Math.round(_volume * 100);
    const lbl = document.getElementById('sound-vol-val');
    if (lbl) lbl.textContent = Math.round(_volume * 100) + '%';
  };

  window.soundSelect = function(id) {
    _currentProfile = id;
    try { localStorage.setItem('sound-profile', id); } catch {}
    soundRenderPage();
    SOUND_PROFILES[id]?.play(_volume);
  };

  window.soundSelectCustom = function(cid) {
    const s = _customSounds.find(x => x.id === cid);
    if (!s) return;
    _currentProfile = '__custom__' + cid;
    try { localStorage.setItem('sound-profile', '__custom__' + cid); } catch {}
    soundRenderPage();
    _playBuf(s.buffer, _volume);
  };

  window.soundPreview = function(id) {
    SOUND_PROFILES[id]?.play(_volume);
  };

  window.soundPreviewCustom = function(cid) {
    const s = _customSounds.find(x => x.id === cid);
    if (s) _playBuf(s.buffer, _volume);
  };

  window.soundDeleteCustom = function(cid) {
    const idx = _customSounds.findIndex(x => x.id === cid);
    if (idx === -1) return;
    _customSounds.splice(idx, 1);
    // If deleted sound was active, switch to clicky
    if (_currentProfile === '__custom__' + cid) {
      _currentProfile = 'clicky';
      try { localStorage.setItem('sound-profile', 'clicky'); } catch {}
    }
    _saveCustomSoundMeta();
    soundRenderPage();
    toast('Custom sound removed', 'ok');
  };

  window.soundVolChange = function(val) {
    _volume = val / 100;
    try { localStorage.setItem('sound-volume', _volume); } catch {}
    const lbl = document.getElementById('sound-vol-val');
    if (lbl) lbl.textContent = val + '%';
  };

  window.soundPickCustom = function() {
    document.getElementById('sound-file-input')?.click();
  };

  window.soundFileLoaded = function(input) {
    const file = input.files[0];
    if (!file) return;
    const name = file.name.replace(/\.[^.]+$/, ''); // strip extension
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const ctx = _ctx();
        const buffer = await ctx.decodeAudioData(e.target.result);
        const cid = 'c' + (++_customSoundIdCounter);
        _customSounds.push({ id: cid, name, buffer });
        _currentProfile = '__custom__' + cid;
        try { localStorage.setItem('sound-profile', '__custom__' + cid); } catch {}
        _saveCustomSoundMeta();
        soundRenderPage();
        _playBuf(buffer, _volume);
        toast('โหลดเสียงกำหนดเองแล้ว', 'ok');
      } catch {
        toast('ไม่สามารถถอดรหัสไฟล์เสียงได้', 'err');
      }
    };
    reader.readAsArrayBuffer(file);
    input.value = '';
  };

  // soundRenderPage is called by settingsTab('sounds') via goTo redirect
  // Restore custom sound IDs from storage (buffers can't be persisted, just names for display)
  try {
    const meta = localStorage.getItem('sound-customs-meta');
    if (meta) {
      const arr = JSON.parse(meta);
      _customSoundIdCounter = arr.length;
      // Note: AudioBuffers can't be stored in localStorage. Show names but they will need re-upload.
    }
  } catch {}

  // Handle legacy single custom sound profile key
  try {
    const saved = localStorage.getItem('sound-profile');
    if (saved && saved.startsWith('__custom__') && !_customSounds.length) {
      _currentProfile = 'clicky';
      try { localStorage.setItem('sound-profile', 'clicky'); } catch {}
    }
  } catch {}

})();

// ── Custom Premium Features & Redesign Logic ──

window.renderScreenGridPreview = async function() {
  const monitor = document.getElementById('screen-preview-monitor');
  if (!monitor) return;
  
  if (!window._previewResizeBound) {
    window._previewResizeBound = true;
    window.addEventListener('resize', () => {
      if (document.getElementById('page-windowpos')?.classList.contains('active')) {
        renderScreenGridPreview();
      }
    });
  }

  const area = (await api.getPrimaryWorkArea()) || { x: 0, y: 0, width: 1920, height: 1080 };
  
  const resBadge = document.getElementById('wp-res-badge');
  if (resBadge) {
    resBadge.textContent = `${area.width} × ${area.height}`;
  }
  
  if (!accounts.length) {
    monitor.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--t3);gap:10px;padding:30px 20px;text-align:center;">
        <span class="material-icons-round" style="font-size:42px;opacity:0.4;">desktop_windows</span>
        <div style="font-size:13px;font-weight:600;color:var(--t2);">ยังไม่มีบัญชีสำหรับแสดงผลในตารางพรีวิว</div>
        <div style="font-size:11.5px;max-width:280px;line-height:1.5;">เพิ่มบัญชีในระบบเพื่อจัดระเบียบหน้าต่างเกมแบบ Multi-Roblox</div>
      </div>`;
    return;
  }

  const containerW = monitor.clientWidth || 450;
  const containerH = monitor.clientHeight || 200;

  const scaleX = containerW / area.width;
  const scaleY = containerH / area.height;

  monitor.innerHTML = accounts.map((a, i) => {
    const hasPos = a.windowX !== undefined && a.windowY !== undefined && a.windowX !== '' && a.windowY !== '';
    let x = hasPos ? parseInt(a.windowX, 10) : 0;
    let y = hasPos ? parseInt(a.windowY, 10) : 0;
    let w = hasPos ? (parseInt(a.windowWidth, 10) || 800) : 800;
    let h = hasPos ? (parseInt(a.windowHeight, 10) || 600) : 600;

    const leftPx = Math.max(0, Math.min(containerW - 20, (x - area.x) * scaleX));
    const topPx = Math.max(0, Math.min(containerH - 20, (y - area.y) * scaleY));
    const widthPx = Math.max(40, Math.min(containerW - leftPx, w * scaleX));
    const heightPx = Math.max(30, Math.min(containerH - topPx, h * scaleY));

    const isLive = _launchedIds.has(a.id);
    const bg = isLive ? 'rgba(34, 197, 94, 0.15)' : 'var(--s3)';
    const border = isLive ? '1px solid #22c55e' : '1px solid var(--bd)';
    const color = isLive ? '#4ade80' : 'var(--t1)';

    return `
      <div class="grid-slot-box" data-id="${a.id}" style="position:absolute; left:${leftPx}px; top:${topPx}px; width:${widthPx}px; height:${heightPx}px; background:${bg}; border:${border}; border-radius:6px; padding:6px; box-sizing:border-box; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; cursor:move; transition: border-color 0.2s ease;" onmouseover="this.style.borderColor='${isLive ? '#4ade80' : 'var(--ac)'}'" onmouseout="this.style.borderColor='${border.split('solid ')[1]}'">
        <div style="font-size:11px; font-weight:600; color:${color}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; pointer-events:none;">
          ${esc(a.nickname || a.username || ('Account #' + (i+1)))}
        </div>
        <div class="wp-coords-label" style="font-size:9px; color:var(--t3); font-family:monospace; pointer-events:none;">
          ${hasPos ? `${x},${y} [${w}x${h}]` : 'Auto'}
        </div>
        <div class="wp-resizer" style="position:absolute; right:0; bottom:0; width:14px; height:14px; cursor:se-resize; display:flex; align-items:flex-end; justify-content:flex-end; padding:2px; box-sizing:border-box;">
          <svg width="6" height="6" viewBox="0 0 6 6" style="fill:var(--t3);"><path d="M6,0 L0,6 L6,6 Z"/></svg>
        </div>
      </div>
    `;
  }).join('');

  // Attach drag & resize event handlers
  const boxes = monitor.querySelectorAll('.grid-slot-box');
  boxes.forEach(box => {
    const id = box.dataset.id;
    const resizer = box.querySelector('.wp-resizer');
    
    // Drag to move
    box.addEventListener('mousedown', e => {
      if (e.target.closest('.wp-resizer')) return;
      e.preventDefault();
      
      const startMouseX = e.clientX;
      const startMouseY = e.clientY;
      const startLeft = parseFloat(box.style.left);
      const startTop = parseFloat(box.style.top);
      const boxW = parseFloat(box.style.width);
      const boxH = parseFloat(box.style.height);
      
      const onMouseMove = moveEvent => {
        const magnetToggle = document.getElementById('magnet-snap-toggle');
        const isMagnet = magnetToggle && magnetToggle.checked;
        const gridStep = 20;

        const deltaX = moveEvent.clientX - startMouseX;
        const deltaY = moveEvent.clientY - startMouseY;
        
        let newLeft = startLeft + deltaX;
        let newTop = startTop + deltaY;
        
        if (isMagnet) {
          newLeft = Math.round(newLeft / gridStep) * gridStep;
          newTop = Math.round(newTop / gridStep) * gridStep;
        }

        newLeft = Math.max(0, Math.min(containerW - boxW, newLeft));
        newTop = Math.max(0, Math.min(containerH - boxH, newTop));
        
        box.style.left = newLeft + 'px';
        box.style.top = newTop + 'px';
        
        const realX = Math.round((newLeft / scaleX) + area.x);
        const realY = Math.round((newTop / scaleY) + area.y);
        
        const coordLabel = box.querySelector('.wp-coords-label');
        if (coordLabel) coordLabel.textContent = `${realX},${realY}`;
      };
      
      const onMouseUp = async () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        
        const finalLeft = parseFloat(box.style.left);
        const finalTop = parseFloat(box.style.top);
        const realX = Math.round((finalLeft / scaleX) + area.x);
        const realY = Math.round((finalTop / scaleY) + area.y);
        const realW = Math.round(parseFloat(box.style.width) / scaleX);
        const realH = Math.round(parseFloat(box.style.height) / scaleY);
        
        await api.updateAccount(id, { windowX: realX, windowY: realY, windowWidth: realW, windowHeight: realH });
        
        const inpX = document.querySelector(`.wp-input-x[data-id="${id}"]`);
        const inpY = document.querySelector(`.wp-input-y[data-id="${id}"]`);
        if (inpX) inpX.value = realX;
        if (inpY) inpY.value = realY;
        
        const idx = accounts.findIndex(x => x.id === id);
        if (idx !== -1) {
          accounts[idx].windowX = realX;
          accounts[idx].windowY = realY;
        }
      };
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
    
    // Drag to resize
    if (resizer) {
      resizer.addEventListener('mousedown', e => {
        e.stopPropagation();
        e.preventDefault();
        
        const startMouseX = e.clientX;
        const startMouseY = e.clientY;
        const startWidth = parseFloat(box.style.width);
        const startHeight = parseFloat(box.style.height);
        const boxLeft = parseFloat(box.style.left);
        const boxTop = parseFloat(box.style.top);
        
        const onMouseMove = resizeEvent => {
          const magnetToggle = document.getElementById('magnet-snap-toggle');
          const isMagnet = magnetToggle && magnetToggle.checked;
          const gridStep = 20;

          const deltaX = resizeEvent.clientX - startMouseX;
          const deltaY = resizeEvent.clientY - startMouseY;
          
          let newWidth = startWidth + deltaX;
          let newHeight = startHeight + deltaY;
          
          if (isMagnet) {
            newWidth = Math.round(newWidth / gridStep) * gridStep;
            newHeight = Math.round(newHeight / gridStep) * gridStep;
          }

          newWidth = Math.max(40, Math.min(containerW - boxLeft, newWidth));
          newHeight = Math.max(30, Math.min(containerH - boxTop, newHeight));
          
          box.style.width = newWidth + 'px';
          box.style.height = newHeight + 'px';
        };
        
        const onMouseUp = async () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          
          const finalWidth = parseFloat(box.style.width);
          const finalHeight = parseFloat(box.style.height);
          const realW = Math.round(finalWidth / scaleX);
          const realH = Math.round(finalHeight / scaleY);
          const realX = Math.round(boxLeft / scaleX + area.x);
          const realY = Math.round(boxTop / scaleY + area.y);
          
          await api.updateAccount(id, { windowX: realX, windowY: realY, windowWidth: realW, windowHeight: realH });
          
          const inpW = document.querySelector(`.wp-input-w[data-id="${id}"]`);
          const inpH = document.querySelector(`.wp-input-h[data-id="${id}"]`);
          if (inpW) inpW.value = realW;
          if (inpH) inpH.value = realH;
          
          const idx = accounts.findIndex(x => x.id === id);
          if (idx !== -1) {
            accounts[idx].windowWidth = realW;
            accounts[idx].windowHeight = realH;
          }
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    }
  });
};

const _launchTimestamps = new Map();
const _individualVolumes = new Map();
let _alwaysOnTop = false;

window.applyCustomAccent = function(color) {
  if (!color) return;
  document.documentElement.style.setProperty('--ac', color);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  document.documentElement.style.setProperty('--ac2', `rgba(${r},${g},${b},0.35)`);
  document.documentElement.style.setProperty('--ac3', `rgba(${r},${g},${b},0.5)`);
  
  const picker = document.getElementById('settings-accent-picker');
  if (picker) picker.value = color;

  document.querySelectorAll('.accent-circle').forEach(c => {
    c.classList.toggle('selected', c.dataset.color.toLowerCase() === color.toLowerCase());
  });
};

window.customAccentChanged = function(color) {
  applyCustomAccent(color);
  try {
    localStorage.setItem('ui-custom-accent', color);
  } catch {}
  api.saveSettings({ customAccent: color });
};

window.toggleAlwaysOnTop = async function() {
  _alwaysOnTop = !_alwaysOnTop;
  const ok = await api.setAlwaysOnTop(_alwaysOnTop);
  const btn = document.getElementById('always-on-top-btn');
  const icon = document.getElementById('always-on-top-icon');
  if (btn && icon) {
    if (_alwaysOnTop) {
      btn.classList.add('active');
      icon.style.color = 'var(--ac)';
      toast('เปิดการปักหมุดหน้าต่างแล้ว', 'ok');
    } else {
      btn.classList.remove('active');
      icon.style.color = '';
      toast('ปิดการปักหมุดหน้าต่างแล้ว', 'err');
    }
  }
};

let _saveSettingsTimer;
window.saveSettingsDebounced = function() {
  clearTimeout(_saveSettingsTimer);
  _saveSettingsTimer = setTimeout(() => {
    const val = parseInt(document.getElementById('settings-launch-cooldown')?.value || '2', 10);
    const antiAfkAction = parseInt(document.getElementById('setting-antiafk-action')?.dataset.value || '0', 10);
    const userSafeMode = parseInt(document.getElementById('setting-usersafe-mode')?.dataset.value || '0', 10);
    const fpsCapLimit = parseInt(document.getElementById('setting-fps-cap')?.dataset.value || '0', 10);
    const antiAfkInterval = parseInt(document.getElementById('setting-antiafk-interval')?.dataset.value || '540', 10);
    const autoStartAfk = !!document.getElementById('setting-auto-start-afk')?.checked;
    const afkReminder = !!document.getElementById('setting-afk-reminder')?.checked;
    const restoreMethod = parseInt(document.getElementById('setting-restore-method')?.dataset.value || '1', 10);
    const unlockFpsFocus = !!document.getElementById('setting-unlock-fps-focus')?.checked;
    const doNotSleep = !!document.getElementById('setting-do-not-sleep')?.checked;
    const autoMute = !!document.getElementById('setting-auto-mute')?.checked;
    const unmuteFocus = !!document.getElementById('setting-unmute-focus')?.checked;
    const autoGrid = !!document.getElementById('setting-auto-grid')?.checked;
    const autoOpacity = !!document.getElementById('setting-auto-opacity')?.checked;
    const autoHide = !!document.getElementById('setting-auto-hide')?.checked;
    const autoReconnect = !!document.getElementById('setting-auto-reconnect')?.checked;
    const autoReset = !!document.getElementById('setting-auto-reset')?.checked;
    const discordWebhookEnabled = !!document.getElementById('setting-discord-webhook-enabled')?.checked;
    const discordWebhookUrl = document.getElementById('setting-discord-webhook-url')?.value || '';
    const discordNotifyStart = !!document.getElementById('setting-dc-notify-start')?.checked;
    const discordNotifyAction = !!document.getElementById('setting-dc-notify-action')?.checked;
    const discordNotifyReconnect = !!document.getElementById('setting-dc-notify-reconnect')?.checked;
    const discordNotifyErrors = !!document.getElementById('setting-dc-notify-errors')?.checked;
    const discordMentionOnErrors = !!document.getElementById('setting-dc-mention-errors')?.checked;
    const discordDisableEmbed = !!document.getElementById('setting-dc-disable-embed')?.checked;
    const autoLaunchOnBoot = !!document.getElementById('setting-auto-boot')?.checked;

    const newSet = {
      launchCooldown: val,
      antiAfkAction,
      userSafeMode,
      fpsCapLimit,
      antiAfkInterval,
      autoStartAfk,
      afkReminder,
      restoreMethod,
      unlockFpsFocus,
      doNotSleep,
      autoMute,
      unmuteFocus,
      autoGrid,
      autoOpacity,
      autoHide,
      autoReconnect,
      autoReset,
      discordWebhookEnabled,
      discordWebhookUrl,
      discordNotifyStart,
      discordNotifyAction,
      discordNotifyReconnect,
      discordNotifyErrors,
      discordMentionOnErrors,
      discordDisableEmbed,
      autoLaunchOnBoot,
    };

    Object.assign(settings, newSet);
    api.saveSettings(newSet);
  }, 300);
};

window.testDiscordWebhook = async function() {
  toast('กำลังส่งข้อความทดสอบ Webhook...', 'info');
  const ok = await api.testDiscordWebhook();
  if (ok) {
    toast('ส่งข้อความทดสอบไปยัง Discord Webhook เรียบร้อยแล้ว!', 'ok');
  } else {
    toast('ส่ง Webhook ไม่สำเร็จ กรุณาตรวจสอบ URL หรือการเชื่อมต่ออินเทอร์เน็ต', 'err');
  }
};

window.onDoNotSleepToggle = function(checked) {
  saveSettingsDebounced();
  api.setDoNotSleep(checked);
  toast(checked ? 'เปิดโหมดป้องกันเครื่องสลีปแล้ว' : 'ปิดโหมดป้องกันเครื่องสลีปแล้ว', checked ? 'ok' : 'info');
};

window.onAutoOpacityToggle = function(checked) {
  saveSettingsDebounced();
  api.setWindowOpacity(checked ? 80 : 100);
  toast(checked ? 'เปิดความโปร่งใสอัตโนมัติแล้ว' : 'ปิดความโปร่งใสอัตโนมัติแล้ว', checked ? 'ok' : 'info');
};

window.getElapsedString = function(id) {
  const start = _launchTimestamps.get(id);
  if (!start) return '00:00:00';
  const diff = Date.now() - start;
  const secs = Math.floor(diff / 1000) % 60;
  const mins = Math.floor(diff / (1000 * 60)) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  return [hours, mins, secs].map(v => String(v).padStart(2, '0')).join(':');
};

window.adjustIndividualVolume = function(id, vol) {
  _individualVolumes.set(id, parseInt(vol, 10));
  const valEl = document.getElementById(`status-vol-val-${id}`);
  if (valEl) valEl.textContent = vol + '%';
  api.setRobloxVolume(parseInt(vol, 10));
};

window.renderStatusPage = function() {
  const grid = document.getElementById('status-grid');
  const empty = document.getElementById('status-empty');
  if (!grid || !empty) return;

  const runningMembers = accounts.filter(a => _launchedIds.has(a.id));
  if (!runningMembers.length) {
    grid.innerHTML = '';
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = runningMembers.map(a => {
    const elapsed = getElapsedString(a.id);
    const gameName = _gameNameCache[a.id] || (a.gameTarget ? extractTargetLabel(a.gameTarget) : 'หน้าหลัก Roblox');
    const avImg = (a.userId && _avatarCache[a.userId]) 
      ? `<img src="${_avatarCache[a.userId]}" class="s-card-av">` 
      : `<div class="s-card-av-ph"><span class="material-icons-round">account_circle</span></div>`;
    
    return `
      <div class="s-card" data-id="${a.id}">
        <div class="s-card-top">
          ${avImg}
          <div class="s-card-info">
            <div class="s-card-name">${a.nickname || a.username || 'Unknown'}</div>
            <div class="s-card-user">${a.username ? '@'+a.username : ''}</div>
          </div>
          <div class="s-card-badge running"><span class="material-icons-round" style="font-size:12px;margin-right:3px">play_circle</span>Running</div>
        </div>
        <div class="s-card-body">
          <div class="s-stat" title="Game"><span class="material-icons-round">sports_esports</span> <span class="s-stat-val">${gameName}</span></div>
          <div class="s-stat" title="Elapsed Time"><span class="material-icons-round">schedule</span> <span class="s-stat-val">${elapsed}</span></div>
        </div>
      </div>
    `;
  }).join('');
};

// Timer loop for updating elapsed time labels in the DOM
setInterval(() => {
  if (document.getElementById('page-status')?.classList.contains('active')) {
    _launchedIds.forEach(id => {
      const el = document.getElementById(`status-time-${id}`);
      if (el) el.textContent = getElapsedString(id);
    });
  }
}, 1000);


let _selectMode = false;
let _selectedAccountIds = new Set();

window.toggleSelectMode = function() {
  _selectMode = !_selectMode;
  const btn = document.getElementById('btn-select-multiple');
  if (btn) btn.classList.toggle('active', _selectMode);
  
  if (!_selectMode) {
    disableSelectMode();
  } else {
    document.getElementById('bulk-launch-bar').classList.add('active');
    updateSelectedCount();
    render();
  }
};

window.disableSelectMode = function() {
  _selectMode = false;
  _selectedAccountIds.clear();
  const btn = document.getElementById('btn-select-multiple');
  if (btn) btn.classList.remove('active');
  const bar = document.getElementById('bulk-launch-bar');
  if (bar) bar.classList.remove('active');
  if (window.setBulkLaunchMode) window.setBulkLaunchMode('home');
  render();
};

window.toggleCardSelect = function(id) {
  if (_selectedAccountIds.has(id)) {
    _selectedAccountIds.delete(id);
  } else {
    _selectedAccountIds.add(id);
  }
  updateSelectedCount();
  render();
};

window.updateSelectedCount = function() {
  const label = document.getElementById('bulk-selected-count');
  if (label) label.textContent = t('เลือกแล้ว') + ' ' + _selectedAccountIds.size + ' ' + t('บัญชี');
};

window.toggleLaunchTargetInput = function(val) {
  const field = document.getElementById('launch-target-field');
  if (field) field.style.display = (val === 'game') ? 'block' : 'none';
};

window.toggleBulkLaunchTypeInput = function(val) {
  const field = document.getElementById('bulk-place-id-input');
  if (field) field.style.display = (val === 'game') ? 'block' : 'none';
};

window.doBulkLaunch = async function() {
  if (!_selectedAccountIds.size) {
    toast(t('กรุณาเลือกบัญชีอย่างน้อยหนึ่งบัญชี'), 'err');
    return;
  }

  const accountIds = Array.from(_selectedAccountIds);
  const selectedMembers = accounts.filter(a => _selectedAccountIds.has(a.id));
  
  const launchType = _bulkLaunchMode;
  let bulkPlaceId = '';
  if (launchType === 'game') {
    bulkPlaceId = document.getElementById('bulk-place-id-input').value.trim();
    if (!bulkPlaceId) {
      toast(t('กรุณาใส่ Place ID ของเกม'), 'err');
      return;
    }
  }

  const serverMode = document.getElementById('bulk-launch-server-mode')?.dataset.value || 'normal';
  const btn = document.getElementById('btn-bulk-launch');
  if (btn) {
    btn.disabled = true;
    btn.textContent = t('กำลังรัน...');
  }

  toast(t('กำลังทยอยเปิดเกมแบบกลุ่ม...'), 'ok');
  disableSelectMode();

  let targetLaunchParam = bulkPlaceId || null;
  const cooldownSec = parseInt(document.getElementById('settings-launch-cooldown')?.value || '2', 10);

  for (let idx = 0; idx < selectedMembers.length; idx++) {
    const m = selectedMembers[idx];
    if (idx > 0 && cooldownSec > 0) {
      await new Promise(r => setTimeout(r, cooldownSec * 1000));
    }

    let finalTarget = targetLaunchParam;
    if (finalTarget && serverMode !== 'normal') {
      try {
        const servers = await fetchRobloxServers(finalTarget);
        let targetServer = null;
        if (serverMode === 'low-players') {
          const valid = servers.filter(s => s.playing > 0 && s.playing < s.maxPlayers);
          valid.sort((a, b) => a.playing - b.playing);
          if (valid.length) targetServer = valid[0];
        } else if (serverMode === 'low-ping') {
          const valid = servers.filter(s => s.ping > 0 && s.playing < s.maxPlayers);
          valid.sort((a, b) => a.ping - b.ping);
          if (valid.length) targetServer = valid[0];
        } else if (serverMode === 'fill-server') {
          const valid = servers.filter(s => s.playing < s.maxPlayers);
          valid.sort((a, b) => b.playing - a.playing);
          if (valid.length) targetServer = valid[0];
        }
        if (targetServer) {
          finalTarget = `${finalTarget}:${targetServer.id}`;
        }
      } catch (e) {
        console.error('Failed to query servers for bulk launch:', e);
      }
    }

    logEntry('info', 'launch', `กำลังเปิด Roblox สำหรับ ${m.username || m.id}...`, { accountId: m.id, username: m.username || null });
    const res = await api.launchRoblox(m.id, m.cookie, finalTarget);
    if (res && res.success) {
      logEntry('ok', 'launch', `เปิด Roblox สำเร็จในชื่อ ${m.username || m.id}`, { accountId: m.id });
      markLaunched(m.id);
    } else {
      logEntry('err', 'launch', `เปิดไม่สำเร็จสำหรับ ${m.username || m.id}: ${res.error}`, { accountId: m.id });
      _flagCookieMaybeDead(m.id, res.error);
    }
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = 'เริ่มเล่นทั้งหมด';
  }
};

let _singleLaunchMode = 'home';
let _bulkLaunchMode = 'home';

window.setLaunchMode = function(mode) {
  _singleLaunchMode = mode;
  const homeBtn = document.getElementById('launch-mode-home');
  const gameBtn = document.getElementById('launch-mode-game');
  if (homeBtn && gameBtn) {
    homeBtn.classList.toggle('active', mode === 'home');
    gameBtn.classList.toggle('active', mode === 'game');
  }
  toggleLaunchTargetInput(mode);
};

window.setBulkLaunchMode = function(mode) {
  _bulkLaunchMode = mode;
  const homeBtn = document.getElementById('bulk-mode-home');
  const gameBtn = document.getElementById('bulk-mode-game');
  if (homeBtn && gameBtn) {
    homeBtn.classList.toggle('active', mode === 'home');
    gameBtn.classList.toggle('active', mode === 'game');
  }
  toggleBulkLaunchTypeInput(mode);
};

window.setStatusLayout = function(type) {
  const grid = document.getElementById('status-grid');
  if (type === 'list') {
    grid.classList.add('list-view');
    document.getElementById('btn-layout-list').classList.add('active');
    document.getElementById('btn-layout-grid').classList.remove('active');
  } else {
    grid.classList.remove('list-view');
    document.getElementById('btn-layout-grid').classList.add('active');
    document.getElementById('btn-layout-list').classList.remove('active');
  }
};


window.toggleAdvancedSetting = function(key, value) {
  if (key === 'runOnStartup') {
    ipcRenderer.send('settings:startup', value);
  } else {
    // save other advanced settings
    ipcRenderer.send('settings:save', { [key]: value });
  }
};
window.resetMasterPassword = function() {
  if (confirm("ยืนยันการรีเซ็ตรหัสผ่าน? บัญชีทั้งหมดจะถูกลบเพื่อให้สามารถตั้งค่ารหัสผ่านใหม่ได้")) {
    ipcRenderer.send('settings:force-reset-password');
  }
};
window.previewCustomTheme = function() {
  const bg = document.getElementById('ct-bg').value;
  const s2 = document.getElementById('ct-s2').value;
  const ac = document.getElementById('ct-ac').value;
  const t1 = document.getElementById('ct-t1').value;
  let styleEl = document.getElementById('custom-theme-vars');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'custom-theme-vars';
    document.head.appendChild(styleEl);
  }
  styleEl.innerHTML = `
    body.theme-custom {
      --bg: ${bg} !important;
      --s2: ${s2} !important;
      --s3: ${s2} !important;
      --ac: ${ac} !important;
      --t1: ${t1} !important;
    }
  `;
};
window.saveCustomTheme = function() {
  const bg = document.getElementById('ct-bg').value;
  const s2 = document.getElementById('ct-s2').value;
  const ac = document.getElementById('ct-ac').value;
  const t1 = document.getElementById('ct-t1').value;
  const customColors = { bg, s2, ac, t1 };
  localStorage.setItem('custom-theme-colors', JSON.stringify(customColors));
  showToast('บันทึกธีมกำหนดเองเรียบร้อยแล้ว', 'ok');
};
window.resetCustomTheme = function() {
  document.getElementById('ct-bg').value = '#0d0e10';
  document.getElementById('ct-s2').value = '#1a1c21';
  document.getElementById('ct-ac').value = '#8b5cf6';
  document.getElementById('ct-t1').value = '#eef1f6';
  previewCustomTheme();
};
function loadCustomThemeColors() {
  try {
    const saved = JSON.parse(localStorage.getItem('custom-theme-colors'));
    if (saved) {
      document.getElementById('ct-bg').value = saved.bg || '#0d0e10';
      document.getElementById('ct-s2').value = saved.s2 || '#1a1c21';
      document.getElementById('ct-ac').value = saved.ac || '#8b5cf6';
      document.getElementById('ct-t1').value = saved.t1 || '#eef1f6';
      previewCustomTheme();
    } else { resetCustomTheme(); }
  } catch (e) { resetCustomTheme(); }
}

// Real-time UI updates
let _realtimeInterval = null;
function startRealtimeUpdates() {
  if (_realtimeInterval) clearInterval(_realtimeInterval);
  _realtimeInterval = setInterval(() => {
    // Only update if status page is active
    const pageStatus = document.getElementById('page-status');
    if (pageStatus && pageStatus.classList.contains('active')) {
      document.querySelectorAll('.s-card').forEach(card => {
        const accId = card.dataset.id;
        if (!accId) return;
        const elapsedEl = card.querySelector('.s-elapsed');
        const gameEl = card.querySelector('.s-game');
        if (elapsedEl) elapsedEl.textContent = getElapsedString(accId);
        if (gameEl) {
          const gameName = _gameNameCache[accId] || (accounts.find(a=>a.id===accId)?.gameTarget ? extractTargetLabel(accounts.find(a=>a.id===accId).gameTarget) : 'หน้าหลัก Roblox');
          gameEl.textContent = gameName;
        }
      });
    }
  }, 1000);
}
startRealtimeUpdates();

// Real-time Game Preview
let _placeInputTimeout = null;
window.handlePlaceInput = function(val) {
  const previewBox = document.getElementById('launch-place-preview');
  if (!previewBox) return;
  
  clearTimeout(_placeInputTimeout);
  
  if (!val || !val.trim()) {
    previewBox.style.display = 'none';
    return;
  }
  
  const match = val.match(/(\d{4,15})/);
  if (!match) {
    previewBox.style.display = 'none';
    return;
  }
  
  const placeId = match[1];
  previewBox.style.display = 'block';
  previewBox.innerHTML = '<div style="display:flex; justify-content:center; padding: 20px;"><div class="spin" style="width:20px;height:20px;border-width:3px;border-top-color:var(--ac);border-left-color:var(--ac);"></div></div>';
  
  _placeInputTimeout = setTimeout(async () => {
    try {
      const r1 = await fetch('https://apis.roblox.com/universes/v1/places/' + placeId + '/universe');
      const d1 = await r1.json();
      if (!d1 || !d1.universeId) {
        previewBox.innerHTML = `<div style="color:var(--t3); font-size:12.5px; text-align:center; padding: 14px;">${t('ไม่พบข้อมูลแมพ (Invalid Place ID)')}</div>`;
        return;
      }
      const universeId = d1.universeId;
      
      const r2 = await fetch('https://games.roblox.com/v1/games?universeIds=' + universeId);
      const d2 = await r2.json();
      const liveInfo = d2 && d2.data && d2.data[0] ? d2.data[0] : null;
      
      const r3 = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&returnPolicy=PlaceHolder&size=150x150&format=Png`);
      const d3 = await r3.json();
      const iconUrl = (d3 && d3.data && d3.data[0] && d3.data[0].imageUrl) ? d3.data[0].imageUrl : '';
      
      const playing = liveInfo ? liveInfo.playing.toLocaleString() : '-';
      const visits = liveInfo ? (liveInfo.visits >= 1000000 ? (liveInfo.visits/1000000).toFixed(1)+'M' : (liveInfo.visits >= 1000 ? (liveInfo.visits/1000).toFixed(1)+'K' : liveInfo.visits.toLocaleString())) : '-';
      const maxPlayers = liveInfo ? liveInfo.maxPlayers : '-';
      const creatorName = liveInfo && liveInfo.creator ? liveInfo.creator.name : 'Roblox';
      
      previewBox.innerHTML = `
        <div class="game-card-preview">
          <div class="gc-icon"><img src="${iconUrl}" onerror="this.src=''" alt=""/></div>
          <div class="gc-info">
            <div class="gc-title">${liveInfo ? liveInfo.name : 'Unknown Game'}</div>
            <div class="gc-creator">By ${creatorName}</div>
            <div class="gc-stats">
              <div class="gc-stat" style="color:#22c55e;" title="Playing"><span class="material-icons-round">play_arrow</span> ${playing}</div>
              <div class="gc-stat" title="Visits"><span class="material-icons-round">visibility</span> ${visits}</div>
              <div class="gc-stat" title="Max Players"><span class="material-icons-round">people</span> ${maxPlayers} Max</div>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      previewBox.innerHTML = `<div style="color:var(--t3); font-size:12.5px; text-align:center; padding: 14px;">${t('เกิดข้อผิดพลาดในการดึงข้อมูล')}</div>`;
    }
  }, 600);
};



window.renderWindowPosList = function() {
  const container = document.getElementById('windowpos-accounts-list');
  if (!container) return;
  
  const countBadge = document.getElementById('wp-account-count-badge');
  if (countBadge) {
    countBadge.textContent = `${accounts.length} บัญชี`;
  }

  if (!accounts.length) {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 16px;text-align:center;color:var(--t3);gap:12px;">
        <span class="material-icons-round" style="font-size:48px;opacity:0.35;">account_circle</span>
        <div style="font-size:13.5px;font-weight:600;color:var(--t2);">ยังไม่มีบัญชีที่บันทึกไว้ในระบบ</div>
        <div style="font-size:11.5px;max-width:260px;line-height:1.5;">เมื่อเพิ่มบัญชีแล้ว คุณสามารถกำหนดพิกัด X, Y และความกว้าง ยาว หรือใช้ Preset จัดหน้าจออัตโนมัติได้ทันที</div>
        <button class="btn btn-primary" onclick="typeof openLogin === 'function' && openLogin()" style="margin-top:6px;font-size:12px;padding:7px 16px;display:inline-flex;align-items:center;gap:6px;">
          <span class="material-icons-round" style="font-size:16px;">add</span>เพิ่มบัญชีใหม่
        </button>
      </div>`;
    renderScreenGridPreview();
    return;
  }
  
  container.innerHTML = accounts.map(a => {
    const xVal = a.windowX !== undefined ? a.windowX : '';
    const yVal = a.windowY !== undefined ? a.windowY : '';
    const wVal = a.windowWidth !== undefined ? a.windowWidth : '';
    const hVal = a.windowHeight !== undefined ? a.windowHeight : '';
    const isLive = _launchedIds.has(a.id);
    
    return `
      <div class="windowpos-row" style="display:flex;align-items:center;background:var(--s2);border:1px solid var(--bd);border-radius:var(--r2);padding:10px 12px;gap:8px;min-width:0;">
        <div class="wp-acct-info" style="flex:1;min-width:0;overflow:hidden;">
          <div class="wp-acct-name" style="font-weight:600;font-size:13px;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(a.nickname || a.username || t('ไม่ทราบชื่อ'))}</div>
          <div class="wp-acct-sub" style="font-size:11px;color:var(--t3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(a.username || '')} ${isLive ? `<span style="color:var(--green);font-weight:600;margin-left:4px;">● Live</span>` : ''}</div>
        </div>
        <div class="wp-coords" style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
          <div style="display:flex;flex-direction:column;width:50px;">
            <span style="font-size:9px;color:var(--t3);text-transform:uppercase;font-weight:700;">X</span>
            <input type="number" class="sr-input wp-input wp-input-x" data-id="${a.id}" data-axis="X" value="${xVal}" placeholder="0" onchange="updateAccountPos('${a.id}', 'X', this.value)" />
          </div>
          <div style="display:flex;flex-direction:column;width:50px;">
            <span style="font-size:9px;color:var(--t3);text-transform:uppercase;font-weight:700;">Y</span>
            <input type="number" class="sr-input wp-input wp-input-y" data-id="${a.id}" data-axis="Y" value="${yVal}" placeholder="0" onchange="updateAccountPos('${a.id}', 'Y', this.value)" />
          </div>
          <div style="display:flex;flex-direction:column;width:50px;">
            <span style="font-size:9px;color:var(--t3);text-transform:uppercase;font-weight:700;">กว้าง</span>
            <input type="number" class="sr-input wp-input wp-input-w" data-id="${a.id}" data-axis="W" value="${wVal}" placeholder="800" onchange="updateAccountPos('${a.id}', 'W', this.value)" />
          </div>
          <div style="display:flex;flex-direction:column;width:50px;">
            <span style="font-size:9px;color:var(--t3);text-transform:uppercase;font-weight:700;">สูง</span>
            <input type="number" class="sr-input wp-input wp-input-h" data-id="${a.id}" data-axis="H" value="${hVal}" placeholder="600" onchange="updateAccountPos('${a.id}', 'H', this.value)" />
          </div>
        </div>
        <div class="wp-actions" style="display:flex;gap:4px;flex-shrink:0;">
          <button class="btn btn-ghost" onclick="captureAcctPosition('${a.id}')" style="padding:4px 8px;font-size:11px;height:28px;display:flex;align-items:center;gap:2px;white-space:nowrap;" title="ตรวจจับตำแหน่งจริงของหน้าต่างที่เปิดอยู่" ${isLive ? '' : 'disabled'}>
            <span class="material-icons-round" style="font-size:14px;">screenshot_monitor</span>ตรวจจับ
          </button>
        </div>
      </div>
    `;
  }).join('');

  renderScreenGridPreview();
};

window.updateAccountPos = async function(id, axis, value) {
  const acct = accounts.find(a => a.id === id);
  if (!acct) return;
  
  const valTrim = value.trim();
  const intVal = valTrim === '' ? undefined : parseInt(valTrim, 10);
  
  const updates = {};
  if (axis === 'X') updates.windowX = intVal;
  else if (axis === 'Y') updates.windowY = intVal;
  else if (axis === 'W') updates.windowWidth = intVal;
  else if (axis === 'H') updates.windowHeight = intVal;
  
  const updated = await api.updateAccount(id, updates);
  if (updated) {
    const idx = accounts.findIndex(a => a.id === id);
    if (idx !== -1) accounts[idx] = updated;
    renderScreenGridPreview();
  }
};

window.captureAcctPosition = async function(id) {
  toast('กำลังตรวจจับตำแหน่งหน้าต่าง...', 'info');
  const pos = await api.captureRobloxPosition(id);
  if (pos) {
    const rowInputs = document.querySelectorAll(`[data-id="${id}"]`);
    rowInputs.forEach(inp => {
      const axis = inp.dataset.axis;
      if (axis === 'X') inp.value = pos.x;
      else if (axis === 'Y') inp.value = pos.y;
      else if (axis === 'W') inp.value = pos.width;
      else if (axis === 'H') inp.value = pos.height;
    });
    
    const updated = await api.updateAccount(id, {
      windowX: pos.x,
      windowY: pos.y,
      windowWidth: pos.width,
      windowHeight: pos.height
    });
    if (updated) {
      const idx = accounts.findIndex(a => a.id === id);
      if (idx !== -1) accounts[idx] = updated;
      renderScreenGridPreview();
    }
    toast('ตรวจจับและบันทึกพิกัดหน้าต่างเรียบร้อย!', 'ok');
  } else {
    toast('ไม่พบหน้าต่าง Roblox ที่เปิดทำงานของบัญชีนี้ (ต้องเปิดเกมทิ้งไว้ก่อน)', 'err');
  }
};

window.applyPresetLayout = async function(presetType) {
  if (!accounts.length) {
    toast('ยังไม่มีบัญชีในระบบ', 'err');
    return;
  }
  
  toast('กำลังคำนวณและปรับตำแหน่งตาราง...', 'info');
  const area = await api.getPrimaryWorkArea();
  if (!area) return;

  const N = accounts.length;
  let cols = 1, rows = 1;

  if (presetType === '2split') {
    cols = 2; rows = 1;
  } else if (presetType === '4grid') {
    cols = 2; rows = 2;
  } else if (presetType === '6grid') {
    cols = 3; rows = 2;
  } else {
    cols = Math.ceil(Math.sqrt(N));
    rows = Math.ceil(N / cols);
  }

  const winWidth = Math.floor(area.width / cols);
  const winHeight = Math.floor(area.height / rows);

  for (let i = 0; i < N; i++) {
    const a = accounts[i];
    const r = Math.floor(i / cols);
    const c = i % cols;
    const posX = area.x + (c * winWidth);
    const posY = area.y + (r * winHeight);

    const updated = await api.updateAccount(a.id, {
      windowX: posX,
      windowY: posY,
      windowWidth: winWidth,
      windowHeight: winHeight
    });
    if (updated) {
      const idx = accounts.findIndex(x => x.id === a.id);
      if (idx !== -1) accounts[idx] = updated;
    }
  }

  renderWindowPosList();
  toast('ปรับพิกัด Preset เรียบร้อยแล้ว!', 'ok');
};

window.snapActiveRobloxGrid = async function() {
  toast('กำลังดึงหน้าต่าง Roblox ทั้งหมดกลับเข้าพิกัด Grid...', 'info');
  const res = await api.snapActiveRobloxGrid();
  if (res && res.ok) {
    toast(`จัดระเบียบหน้าต่าง Roblox ${res.count || 0} จอเข้าพิกัดเรียบร้อย!`, 'ok');
  } else {
    toast('ไม่พบหน้าต่าง Roblox ที่เปิดทำงานอยู่ หรือระบบขัดข้อง', 'err');
  }
};

window.clearAllWindowPositions = async function() {
  if (!accounts.length) return;
  if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างพิกัดตำแหน่งหน้าต่างทั้งหมด? (Roblox จะเปิดในตำแหน่งเริ่มต้นของระบบปกติ)')) return;
  
  for (const a of accounts) {
    const updated = await api.updateAccount(a.id, {
      windowX: undefined,
      windowY: undefined,
      windowWidth: undefined,
      windowHeight: undefined
    });
    if (updated) {
      const idx = accounts.findIndex(x => x.id === a.id);
      if (idx !== -1) accounts[idx] = updated;
    }
  }
  
  renderWindowPosList();
  toast('ล้างตำแหน่งหน้าต่างทั้งหมดเรียบร้อยแล้ว', 'ok');
};

// ==========================================
// Roblox Home Page & Filter-style Account Dropdown Helpers
// ==========================================
let _currentHomeAccountId = null;
let _isHomeAcctMenuOpen = false;

function closeHomeAccountFilter() {
  const btn = document.getElementById('home-acct-btn');
  if (btn) btn.classList.remove('open');
  if (window.api && window.api.closeHomeAccountPopup) {
    window.api.closeHomeAccountPopup();
  }
}

function toggleHomeAccountFilter(e) {
  if (e) e.stopPropagation();
  const btn = document.getElementById('home-acct-btn');
  if (!btn) return;

  if (btn.classList.contains('open')) {
    closeHomeAccountFilter();
    return;
  }

  if (accounts && accounts.length > 0) {
    loadAvatarsBatch(accounts);
  }

  btn.classList.add('open');

  const accountData = accounts.map(a => ({
    id: a.id,
    nickname: esc(a.nickname || a.username || ('Account #' + a.id)),
    username: a.username ? `@${esc(a.username)}` : '',
    avatarUrl: a.userId ? _avatarCache[a.userId] : null
  }));

  const rect = btn.getBoundingClientRect();
  const isLight = document.body.classList.contains('light');
  const bodyStyle = window.getComputedStyle(document.body);
  const themeColors = {
    isLight: isLight,
    theme: isLight ? 'light' : (currentTheme() || 'dark'),
    bg: bodyStyle.getPropertyValue('--bg').trim() || (isLight ? '#f4f4f8' : '#0e0e10'),
    s1: bodyStyle.getPropertyValue('--s1').trim() || (isLight ? '#ffffff' : '#111114'),
    s2: bodyStyle.getPropertyValue('--s2').trim() || (isLight ? '#ebebf0' : '#18181d'),
    s3: bodyStyle.getPropertyValue('--s3').trim() || (isLight ? '#e0e0e8' : '#1f1f26'),
    s4: bodyStyle.getPropertyValue('--s4').trim() || (isLight ? '#d0d0dc' : '#26262f'),
    bd: bodyStyle.getPropertyValue('--bd').trim() || (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)'),
    bd2: bodyStyle.getPropertyValue('--bd2').trim() || (isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.13)'),
    t1: bodyStyle.getPropertyValue('--t1').trim() || (isLight ? '#0e0e1a' : '#f0f0f5'),
    t2: bodyStyle.getPropertyValue('--t2').trim() || (isLight ? '#555570' : '#aaaab2'),
    t3: bodyStyle.getPropertyValue('--t3').trim() || (isLight ? '#9898b4' : '#73737d'),
    ac: bodyStyle.getPropertyValue('--ac').trim() || '#5c5ce0',
    ac2: bodyStyle.getPropertyValue('--ac2').trim() || (isLight ? 'rgba(92,92,224,0.14)' : 'rgba(92,92,224,0.35)'),
    font: bodyStyle.getPropertyValue('--font-ui').trim() || "'IBM Plex Sans Thai','Inter',system-ui,sans-serif"
  };

  if (window.api && window.api.openHomeAccountPopup) {
    window.api.openHomeAccountPopup({
      rect: {
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },
      accounts: accountData,
      currentId: _currentHomeAccountId,
      themeColors: themeColors
    });
  }
}

if (window.api && window.api.onHomeAccountPopupClosed) {
  window.api.onHomeAccountPopupClosed(() => {
    const btn = document.getElementById('home-acct-btn');
    if (btn) btn.classList.remove('open');
  });
}

if (window.api && window.api.onHomeAccountSelected) {
  window.api.onHomeAccountSelected((id) => {
    const btn = document.getElementById('home-acct-btn');
    if (btn) btn.classList.remove('open');
    if (_currentHomeAccountId !== id) {
      _lastLoadedHomeAccountId = null;
    }
    _currentHomeAccountId = id;
    updateHomeCddActiveUI();
    updateHomeBrowserView(id);
  });
}

if (window.api && window.api.onAccountUpdated) {
  window.api.onAccountUpdated((updatedAcct) => {
    if (!updatedAcct || !updatedAcct.id) return;
    const idx = accounts.findIndex(a => String(a.id) === String(updatedAcct.id));
    if (idx !== -1) {
      accounts[idx] = { ...accounts[idx], ...updatedAcct };
      if (typeof render === 'function') try { render(); } catch {}
      if (typeof toast === 'function') try { toast(`อัปเดตคุกกี้ใหม่อัตโนมัติเรียบร้อย`, 'ok'); } catch {}
    }
  });
}

function selectHomeAccount(id) {
  closeHomeAccountFilter();
  if (_currentHomeAccountId !== id) {
    _lastLoadedHomeAccountId = null;
  }
  _currentHomeAccountId = id;
  updateHomeCddActiveUI();
  updateHomeBrowserView(id);
}

function updateHomeCddActiveUI() {
  if (!accounts || accounts.length === 0) return;

  if (!_currentHomeAccountId || !accounts.some(a => String(a.id) === String(_currentHomeAccountId))) {
    _currentHomeAccountId = accounts[0].id;
  }

  loadAvatarsBatch(accounts);

  const acct = accounts.find(a => String(a.id) === String(_currentHomeAccountId));
  const nameEl = document.getElementById('home-cdd-active-name');
  const avEl = document.getElementById('home-cdd-active-av');

  if (!acct) {
    if (nameEl) nameEl.textContent = 'เลือกบัญชี';
    if (avEl) avEl.innerHTML = `<span class="material-icons-round" style="font-size:12px;color:var(--t3);">person</span>`;
    return;
  }

  if (nameEl) nameEl.textContent = acct.nickname || acct.username || ('Account #' + acct.id);

  if (avEl) {
    const avatarUrl = acct.userId ? _avatarCache[acct.userId] : null;
    if (avatarUrl) {
      avEl.innerHTML = `<img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;" />`;
    } else {
      avEl.innerHTML = `<span class="material-icons-round" style="font-size:12px;color:var(--t3);">person</span>`;
    }
  }
}

let _lastLoadedHomeAccountId = null;

async function updateHomeBrowserView(overrideAccountId) {
  const accountId = overrideAccountId || _currentHomeAccountId || (accounts.length > 0 ? accounts[0].id : null);
  const webview = document.getElementById('home-webview');
  const placeholder = document.getElementById('home-view-placeholder');

  if (!accountId) {
    if (placeholder) {
      placeholder.style.display = 'flex';
      placeholder.innerHTML = `<span class="material-icons-round" style="font-size:48px;color:var(--t3);">account_circle</span><div>${t('ยังไม่มีบัญชีในระบบ โปรดเพิ่มบัญชีก่อน')}</div>`;
    }
    if (webview) {
      webview.style.opacity = '0';
      webview.style.pointerEvents = 'none';
    }
    return;
  }

  _currentHomeAccountId = accountId;
  updateHomeCddActiveUI();

  // If already loaded for this exact account, DO NOT RELOAD!
  if (_lastLoadedHomeAccountId === accountId && webview && webview.src && webview.src !== 'about:blank') {
    if (placeholder) placeholder.style.display = 'none';
    webview.style.opacity = '1';
    webview.style.pointerEvents = 'all';
    return;
  }

  if (window.api && window.api.prepareHomeSession) {
    const res = await window.api.prepareHomeSession(accountId);
    if (res && res.ok) {
      if (placeholder) placeholder.style.display = 'none';
      if (webview) {
        webview.style.opacity = '1';
        webview.style.pointerEvents = 'all';
        _lastLoadedHomeAccountId = accountId;
        webview.src = 'https://www.roblox.com/th/home';
      }
    } else {
      if (webview) {
        webview.style.opacity = '0';
        webview.style.pointerEvents = 'none';
      }
      if (placeholder) {
        placeholder.style.display = 'flex';
        placeholder.innerHTML = `<span class="material-icons-round" style="font-size:48px;color:var(--red);">error_outline</span><div>${res?.error || 'ไม่สามารถเปิดหน้าหลักได้ (อาจไม่มีคุกกี้)'}</div>`;
      }
    }
  }
}

function reloadHomeBrowser() {
  _lastLoadedHomeAccountId = null;
  const webview = document.getElementById('home-webview');
  if (webview && typeof webview.reload === 'function') {
    webview.reload();
  } else if (_currentHomeAccountId) {
    updateHomeBrowserView(_currentHomeAccountId);
  }
}

function onHomeGoBack() {
  const webview = document.getElementById('home-webview');
  if (webview && typeof webview.goBack === 'function' && webview.canGoBack()) {
    webview.goBack();
  }
}

function onHomeGoForward() {
  const webview = document.getElementById('home-webview');
  if (webview && typeof webview.goForward === 'function' && webview.canGoForward()) {
    webview.goForward();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const webview = document.getElementById('home-webview');
  if (webview) {
    webview.addEventListener('did-navigate', (e) => {
      const input = document.getElementById('home-url-input');
      if (input && e.url) input.value = e.url;
    });
    webview.addEventListener('did-navigate-in-page', (e) => {
      const input = document.getElementById('home-url-input');
      if (input && e.url) input.value = e.url;
    });
  }
});

function ctxOpenHome(id) {
  closeCardMenu();
  _currentHomeAccountId = id;
  goTo('home');
}

window.addEventListener('resize', () => {
  const pageHome = document.getElementById('page-home');
  if (pageHome && pageHome.classList.contains('active')) {
    const container = document.getElementById('home-view-container');
    if (container) {
      const rect = container.getBoundingClientRect();
      const bounds = {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      };
      if (window.api && window.api.resizeHome) {
        window.api.resizeHome(bounds);
      }
    }
  }
});


// ── Quick Action Handlers for Window, Reconnect & Settings ─────────────────

window.mixGridSnapNow = async function() {
  try {
    const runningCount = accounts.filter(a => _launchedIds.has(a.id)).length || 4;
    const res = await api.gridSnap(runningCount);
    toast(res && res.count ? `จัดเรียงหน้าต่าง ${res.count} จอเรียบร้อยแล้ว` : 'จัดเรียงหน้าต่างเรียบร้อยแล้ว', 'ok');
  } catch (e) {
    toast('จัดเรียงหน้าต่างไม่สำเร็จ: ' + (e.message || e), 'err');
  }
};

window.mixResetOpacityNow = async function() {
  try {
    await api.setWindowOpacity(100);
    toast('คืนค่าความโปร่งใส 100% เรียบร้อยแล้ว', 'ok');
  } catch (e) {
    toast('ตั้งค่าความโปร่งใสไม่สำเร็จ: ' + (e.message || e), 'err');
  }
};

window.mixShowAllNow = async function() {
  try {
    const res = await api.showAllRoblox();
    toast(res && res.count ? `แสดงหน้าต่าง Roblox ทั้งหมด (${res.count} จอ)` : 'แสดงหน้าต่าง Roblox ทั้งหมดแล้ว', 'ok');
  } catch (e) {
    toast('แสดงหน้าต่างไม่สำเร็จ: ' + (e.message || e), 'err');
  }
};

window.mixHideAllNow = async function() {
  try {
    const res = await api.hideAllRoblox();
    toast(res && res.count ? `ซ่อนหน้าต่าง Roblox ทั้งหมด (${res.count} จอ)` : 'ซ่อนหน้าต่าง Roblox ทั้งหมดแล้ว', 'ok');
  } catch (e) {
    toast('ซ่อนหน้าต่างไม่สำเร็จ: ' + (e.message || e), 'err');
  }
};

window.mixTestAntiAfkAction = async function() {
  try {
    const action = settings.antiAfkAction || 0;
    const res = await api.testAntiAfkAction(action);
    if (res && res.ok) {
      toast('ทดสอบ Action Anti-AFK สำเร็จแล้ว', 'ok');
    } else {
      toast('ทดสอบ Action Anti-AFK: ไม่พบหน้าต่าง Roblox ที่เปิดอยู่', 'info');
    }
  } catch (e) {
    toast('ทดสอบไม่สำเร็จ: ' + (e.message || e), 'err');
  }
};

window.mixCheckReconnectNow = async function() {
  try {
    const res = await api.checkReconnectNow();
    if (res && res.count > 0) {
      toast(`ตรวจพบและ Reconnect ${res.count} หน้าต่างแล้ว`, 'ok');
    } else {
      toast('ตรวจสอบสถานะการเชื่อมต่อแล้ว: ทุกหน้าต่างเชื่อมต่อปกติ', 'info');
    }
  } catch (e) {
    toast('ตรวจสอบการเชื่อมต่อล้มเหลว: ' + (e.message || e), 'err');
  }
};

window.mixResetAllNow = async function() {
  try {
    const res = await api.resetAllRoblox();
    toast(res && res.count ? `รีเซ็ตตัวละครสำเร็จ (${res.count} จอ)` : 'ส่งคำสั่งรีเซ็ตตัวละครแล้ว', 'ok');
  } catch (e) {
    toast('รีเซ็ตตัวละครไม่สำเร็จ: ' + (e.message || e), 'err');
  }
};

window.syncSettingCheckbox = function(id, key) {
  const el = document.getElementById(id);
  if (el) {
    settings[key] = !!el.checked;
    saveSettingsDebounced();
  }
};

// ── Voidstrap Integration Suite ──────────────────────────────────────────

const POPULAR_PRESET_FLAGS = [
  {
    key: 'DFIntTaskSchedulerTargetFps',
    type: 'Integer',
    defaultValue: '9999',
    category: 'Performance',
    title: 'ปลดล็อก FPS สูงสุด (Unlock Max FPS)',
    desc: 'ปลดล็อก 60 FPS cap ของเอนจิน Roblox ให้แสดงผลได้เต็มประสิทธิภาพตามรีเฟรชเรตหน้าจอ'
  },
  {
    key: 'FFlagDisablePostFx',
    type: 'Boolean',
    defaultValue: 'True',
    category: 'Graphics',
    title: 'ปิดเอฟเฟกต์ PostFX ทั้งหมด (Disable PostFX)',
    desc: 'ปิด Bloom, SunRays, Blur เพิ่มอัตราเฟรมเรตและช่วยให้ภาพคมชัดขึ้น'
  },
  {
    key: 'DFFlagDisableDPIScale',
    type: 'Boolean',
    defaultValue: 'True',
    category: 'Graphics',
    title: 'ปิด DPI Scaling (Fix DPI Blur)',
    desc: 'แก้ไขภาพเบลอบนหน้าจอ High-DPI หรือจอ 2K / 4K'
  },
  {
    key: 'FIntDebugForceMSAASamples',
    type: 'Integer',
    defaultValue: '4',
    category: 'Graphics',
    title: 'บังคับระดับ Antialiasing MSAA 4x',
    desc: 'ลบรอยหยักของขอบวัตถุ 3D ให้อยู่ในระดับเนียนตาและสมดุล'
  },
  {
    key: 'FFlagDebugDisplayFPS',
    type: 'Boolean',
    defaultValue: 'True',
    category: 'UI',
    title: 'แสดงตัวนับ FPS ในเกม (In-Game FPS Counter)',
    desc: 'เปิดแสดงแถบ FPS และ Frame Time ดั้งเดิมของ Roblox'
  },
  {
    key: 'DFFlagDebugRenderForceFutureIsBrightPhase3',
    type: 'Boolean',
    defaultValue: 'True',
    category: 'Graphics',
    title: 'ระบบแสงสมจริง Future Phase 3',
    desc: 'บังคับเปิดระบบแสงเงาขั้นสูงระดับสตูดิโอ ภาพและแสงเงาสวยงามสมจริง'
  },
  {
    key: 'FIntCameraMaxZoomDistance',
    type: 'Integer',
    defaultValue: '2147483647',
    category: 'Camera',
    title: 'ปลดล็อกระยะซูมกล้องไม่จำกัด (Unlimited Zoom)',
    desc: 'สามารถซูมกล้องถอยหลังออกไปได้ไกลสุดขอบฟ้าโดยไม่ติดเพดานระยะทาง'
  },
  {
    key: 'DFFlagEnableMeshPreloading2',
    type: 'Boolean',
    defaultValue: 'True',
    category: 'Performance',
    title: 'เร่งการพรีโหลดโมเดล 3D (Mesh Preloading)',
    desc: 'โหลด Mesh เข้าสู่หน่วยความจำล่วงหน้า ลดอาการกระตุกเวลาเคลื่อนที่ในแมพ'
  },
  {
    key: 'DFIntNumAssetsMaxToPreload',
    type: 'Integer',
    defaultValue: '2147483647',
    category: 'Performance',
    title: 'ปลดล็อกจำนวน Asset Preload สูงสุด',
    desc: 'อนุญาตให้ดาวน์โหลดโมเดลและแอนิเมชันล่วงหน้าได้ไม่จำกัดจำนวน'
  },
  {
    key: 'FFlagDebugDisableTelemetry',
    type: 'Boolean',
    defaultValue: 'True',
    category: 'Privacy',
    title: 'ปิดระบบส่งสถิติ Telemetry (Disable Telemetry)',
    desc: 'บล็อกการส่ง Error Log และสถิติการเล่นไปยังเซิร์ฟเวอร์ภายนอก'
  },
  {
    key: 'DFStringTelemetryV2Url',
    type: 'String',
    defaultValue: '0.0.0.0',
    category: 'Privacy',
    title: 'บล็อก Telemetry V2 Endpoint',
    desc: 'กำหนดปลายทาง URL สถิติเป็น 0.0.0.0 เพื่อตัดการส่งข้อมูล'
  },
  {
    key: 'FIntRobloxGuiBlurIntensity',
    type: 'Integer',
    defaultValue: '0',
    category: 'UI',
    title: 'ปิดเบลอพื้นหลังเมนู Esc (No GUI Blur)',
    desc: 'ทำให้หน้าจอเบื้องหลังยังคงคมชัดเมื่อกดเปิดเมนู Escape'
  },
  {
    key: 'FFlagHandleAltEnterFullscreenManually',
    type: 'Boolean',
    defaultValue: 'False',
    category: 'Graphics',
    title: 'โหมดเต็มจอ Exclusive Fullscreen',
    desc: 'ปลดล็อก Alt+Enter สลับโหมดเต็มจอแท้จริง ลด Latency'
  }
];

function getFlagCategoryTag(key) {
  if (key.includes('Texture') || key.includes('Mesh') || key.includes('Preload') || key.includes('TaskScheduler') || key.includes('Thread')) {
    return { tag: 'Performance', cls: 'perf' };
  }
  if (key.includes('Graphics') || key.includes('Render') || key.includes('Future') || key.includes('PostFx') || key.includes('Shadow') || key.includes('MSAA') || key.includes('Sky')) {
    return { tag: 'Graphics', cls: 'gfx' };
  }
  if (key.includes('Gui') || key.includes('Menu') || key.includes('DisplayFPS') || key.includes('Fullscreen')) {
    return { tag: 'UI', cls: 'ui' };
  }
  if (key.includes('Camera') || key.includes('Zoom')) {
    return { tag: 'Camera', cls: 'cam' };
  }
  if (key.includes('Telemetry') || key.includes('Crash') || key.includes('Analytics')) {
    return { tag: 'Privacy', cls: 'priv' };
  }
  return { tag: 'Custom', cls: '' };
}

let _currentVsSubtab = 'config';
let _currentFastFlags = {};
let _isRawJsonMode = false;
let _modSettings = {};
let _selectedFlagKeys = new Set();
let _showConfiguredOnly = false;

window.switchVoidstrapSubTab = function(subtab) {
  _currentVsSubtab = subtab || 'config';
  const tabs = ['config', 'fflags', 'editor', 'global', 'mod'];
  tabs.forEach(t => {
    const btn = document.getElementById(`vs-subtab-btn-${t}`);
    const panel = document.getElementById(`vs-subpanel-${t}`);
    if (btn) btn.classList.toggle('active', t === _currentVsSubtab);
    if (panel) panel.style.display = (t === _currentVsSubtab) ? 'flex' : 'none';
  });

  if (_currentVsSubtab === 'config') {
    renderCustomProfilesList();
  } else if (_currentVsSubtab === 'fflags') {
    loadVoidstrapPresetsUI();
  } else if (_currentVsSubtab === 'editor') {
    renderVoidstrapEditorTable();
  } else if (_currentVsSubtab === 'global') {
    loadVoidstrapGlobalUI();
  } else if (_currentVsSubtab === 'mod') {
    loadVoidstrapModUI();
  }
};

async function loadVoidstrapTab() {
  try {
    const st = await api.getVoidstrapStatus();
    const badge = document.getElementById('vs-status-badge');
    const pathEl = document.getElementById('vs-status-path');
    if (badge) {
      if (st && st.installed) {
        badge.className = 'badge g';
        badge.textContent = 'ติดตั้งแล้ว (Voidstrap Ready)';
      } else if (st && st.bloxstrapInstalled) {
        badge.className = 'badge b';
        badge.textContent = 'ติดตั้ง Bloxstrap แล้ว';
      } else {
        badge.className = 'badge muted';
        badge.textContent = 'ไม่พบ Voidstrap (ใช้ Roblox โหมดปกติ)';
      }
    }
    if (pathEl) {
      if (st && st.installed) pathEl.textContent = st.path;
      else if (st && st.bloxstrapInstalled) pathEl.textContent = st.bloxstrapPath;
      else pathEl.textContent = 'ใช้ Roblox Client ทั่วไป';
    }
    if (st && st.bootstrapper) {
      syncCustomDropdownUI('bootstrapper', st.bootstrapper);
    }
  } catch {}

  switchVoidstrapSubTab(_currentVsSubtab || 'config');
}
window.loadVoidstrapTab = loadVoidstrapTab;

// ── Sub-panel 1: Configuration (Profiles & Backup) ─────────────────────────

window.applyVoidstrapBuiltinProfile = async function(name) {
  try {
    const res = await api.getVoidstrapProfiles();
    if (!res || !res.builtin || !res.builtin[name]) {
      toast('ไม่พบโปรไฟล์ที่ต้องการ', 'err');
      return;
    }
    const profile = res.builtin[name];
    await api.writeFFlags(profile.flags);
    await loadVoidstrapPresetsUI();
    if (_currentVsSubtab === 'editor') renderVoidstrapEditorTable();
    toast(`ปรับใช้โปรไฟล์ ${profile.name} สำเร็จแล้ว`, 'ok');
  } catch (e) {
    toast('เกิดข้อผิดพลาด: ' + (e.message || e), 'err');
  }
};

window.saveCurrentAsCustomProfile = async function() {
  const inp = document.getElementById('vs-new-profile-name');
  const name = (inp?.value || '').trim();
  if (!name) {
    toast('กรุณาระบุชื่อโปรไฟล์', 'err');
    return;
  }
  try {
    const currentFlags = (await api.readFFlags()) || {};
    const res = await api.saveVoidstrapProfile(name, currentFlags);
    if (res && res.ok) {
      if (inp) inp.value = '';
      toast(`บันทึกโปรไฟล์ ${name} เรียบร้อยแล้ว`, 'ok');
      renderCustomProfilesList();
    } else {
      toast('บันทึกโปรไฟล์ไม่สำเร็จ: ' + (res?.error || ''), 'err');
    }
  } catch (e) {
    toast('เกิดข้อผิดพลาด: ' + (e.message || e), 'err');
  }
};

window.renderCustomProfilesList = async function() {
  const container = document.getElementById('vs-custom-profiles-list');
  if (!container) return;
  try {
    const res = await api.getVoidstrapProfiles();
    const custom = res?.custom || {};
    const names = Object.keys(custom);
    if (names.length === 0) {
      container.innerHTML = `<div class="sr-desc" style="font-size:12px;padding:8px">${t('ยังไม่มีโปรไฟล์ที่บันทึกไว้')}</div>`;
      return;
    }
    container.innerHTML = names.map(name => {
      const p = custom[name];
      const flagCount = (p && p.flags) ? Object.keys(p.flags).length : (p ? Object.keys(p).length : 0);
      const dateStr = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '';
      return `
        <div class="vs-custom-profile-item">
          <div class="vs-custom-profile-name">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            <span>${esc(name)}</span>
            <span class="badge muted">${flagCount} Flags</span>
            ${dateStr ? `<span class="vs-custom-profile-date">${esc(dateStr)}</span>` : ''}
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-secondary" style="font-size:11.5px;padding:4px 8px" onclick="openProfileEditor('${esc(name)}', true)">ดู/แก้ไข</button>
            <button class="btn btn-secondary" style="font-size:11.5px;padding:4px 8px" onclick="applyCustomProfile('${esc(name)}')">ปรับใช้</button>
            <button class="btn btn-ghost" style="font-size:11.5px;padding:4px 8px;color:var(--r2)" onclick="deleteCustomProfile('${esc(name)}')">ลบ</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('renderCustomProfilesList error:', e);
  }
};

window.applyCustomProfile = async function(name) {
  try {
    const res = await api.getVoidstrapProfiles();
    const custom = res?.custom || {};
    const p = custom[name];
    const flags = (p && p.flags) ? p.flags : p;
    if (!flags) {
      toast('ไม่พบโปรไฟล์นี้', 'err');
      return;
    }
    await api.writeFFlags(flags);
    await loadVoidstrapPresetsUI();
    if (_currentVsSubtab === 'editor') renderVoidstrapEditorTable();
    toast(`ปรับใช้โปรไฟล์ ${name} สำเร็จแล้ว`, 'ok');
  } catch (e) {
    toast('เกิดข้อผิดพลาด: ' + (e.message || e), 'err');
  }
};

window.deleteCustomProfile = async function(name) {
  if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบโปรไฟล์ "${name}"?`)) return;
  try {
    await api.deleteVoidstrapProfile(name);
    toast(`ลบโปรไฟล์ ${name} เรียบร้อยแล้ว`, 'info');
    renderCustomProfilesList();
  } catch (e) {
    toast('เกิดข้อผิดพลาด: ' + (e.message || e), 'err');
  }
};

window.exportVoidstrapProfileJson = async function() {
  try {
    const flags = (await api.readFFlags()) || {};
    const res = await api.exportVoidstrapProfile(flags);
    if (res && res.ok) {
      toast('ส่งออกไฟล์ JSON สำเร็จแล้ว', 'ok');
    }
  } catch (e) {
    toast('ส่งออกไฟล์ล้มเหลว: ' + (e.message || e), 'err');
  }
};

window.importVoidstrapProfileJson = async function() {
  try {
    const res = await api.importVoidstrapProfile();
    if (res && res.ok && res.data) {
      let flags = res.data;
      if (flags && typeof flags === 'object' && flags.flags && typeof flags.flags === 'object') {
        flags = flags.flags;
      }
      await api.writeFFlags(flags);
      await loadVoidstrapPresetsUI();
      if (_currentVsSubtab === 'editor') renderVoidstrapEditorTable();
      toast(`นำเข้า FastFlags จาก ${res.fileName || 'ไฟล์'} เรียบร้อยแล้ว`, 'ok');
    }
  } catch (e) {
    toast('นำเข้าไฟล์ล้มเหลว: ' + (e.message || e), 'err');
  }
};

// ── Profile Editor Modal Handlers ──────────────────────────────────────────

let _currentEditingProfileName = '';
let _currentEditingProfileIsCustom = false;
let _currentEditingProfileFlags = {};
let _currentProfileEditorTab = 'table';

window.openProfileEditor = async function(profileName, isCustom = false) {
  _currentEditingProfileName = profileName;
  _currentEditingProfileIsCustom = isCustom;
  const modal = document.getElementById('vs-modal-edit-profile');
  if (!modal) return;

  try {
    const res = await api.getVoidstrapProfiles();
    let flags = {};
    if (isCustom) {
      const p = res?.custom?.[profileName];
      flags = (p && p.flags) ? p.flags : (p || {});
    } else {
      const p = res?.builtin?.[profileName] || res?.[profileName];
      flags = (p && p.flags) ? p.flags : (p || {});
    }
    _currentEditingProfileFlags = { ...flags };

    const titleEl = document.getElementById('vs-modal-profile-title');
    const badgeEl = document.getElementById('vs-modal-profile-badge');
    const hintEl = document.getElementById('vs-modal-profile-hint');
    if (titleEl) titleEl.textContent = `${t('โปรไฟล์')}: ${profileName.toUpperCase()}`;
    if (badgeEl) {
      badgeEl.className = isCustom ? 'badge b' : 'badge g';
      badgeEl.textContent = isCustom ? t('กำหนดเอง (Custom)') : t('สำเร็จรูป (Built-in)');
    }
    if (hintEl) {
      hintEl.textContent = isCustom 
        ? t('สามารถแก้ไขค่า ลบ หรือเพิ่ม Flags แล้วกดบันทึกเพื่ออัปเดตโปรไฟล์') 
        : t('โปรไฟล์สำเร็จรูป: สามารถแก้ไขและกด "บันทึกและปรับใช้ทันที" ได้โดยตรง');
    }

    switchProfileEditorTab('table');
    modal.style.display = 'flex';
  } catch (e) {
    toast('เปิดโปรไฟล์ไม่สำเร็จ: ' + (e.message || e), 'err');
  }
};

window.closeProfileEditor = function() {
  const modal = document.getElementById('vs-modal-edit-profile');
  if (modal) modal.style.display = 'none';
};

window.switchProfileEditorTab = function(tab) {
  _currentProfileEditorTab = tab || 'table';
  const tabBtn = document.getElementById('vs-modal-tab-btn-table');
  const rawBtn = document.getElementById('vs-modal-tab-btn-raw');
  const tableView = document.getElementById('vs-modal-table-view');
  const rawView = document.getElementById('vs-modal-raw-view');
  const textarea = document.getElementById('vs-modal-raw-textarea');

  if (tabBtn) tabBtn.classList.toggle('active', _currentProfileEditorTab === 'table');
  if (rawBtn) rawBtn.classList.toggle('active', _currentProfileEditorTab === 'raw');

  if (_currentProfileEditorTab === 'table') {
    if (tableView) tableView.style.display = 'block';
    if (rawView) rawView.style.display = 'none';
    renderProfileEditorTable();
  } else {
    if (tableView) tableView.style.display = 'none';
    if (rawView) rawView.style.display = 'block';
    if (textarea) {
      textarea.value = JSON.stringify(_currentEditingProfileFlags, null, 2);
    }
  }
};

window.renderProfileEditorTable = function(filterQuery = '') {
  const tbody = document.getElementById('vs-modal-tbody');
  const countBadge = document.getElementById('vs-modal-flag-count');
  const keys = Object.keys(_currentEditingProfileFlags);
  if (countBadge) countBadge.textContent = keys.length + ' Flags';
  if (!tbody) return;

  const q = (filterQuery || document.getElementById('vs-modal-filter-input')?.value || '').toLowerCase().trim();
  let matchedKeys = keys;
  if (q) {
    matchedKeys = keys.filter(k => k.toLowerCase().includes(q) || String(_currentEditingProfileFlags[k]).toLowerCase().includes(q));
  }

  if (matchedKeys.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--t3);font-size:12px">${q ? 'ไม่พบ FastFlag ที่ค้นหา' : 'ยังไม่มี FastFlags ในโปรไฟล์นี้'}</td></tr>`;
    return;
  }

  tbody.innerHTML = matchedKeys.map(key => {
    const val = _currentEditingProfileFlags[key];
    let valType = 'String';
    if (val === 'True' || val === 'False' || typeof val === 'boolean') valType = 'Boolean';
    else if (!isNaN(Number(val)) && !isNaN(parseInt(val, 10))) valType = 'Integer';

    return `
      <tr>
        <td><div class="flag-key">${esc(key)}</div></td>
        <td><span class="badge ${valType === 'Boolean' ? 'b' : (valType === 'Integer' ? 'g' : 'p')}">${valType}</span></td>
        <td>
          <input type="text" class="flag-input" value="${esc(String(val))}" onchange="updateProfileFlagValue('${esc(key)}', this.value)" />
        </td>
        <td style="text-align:center">
          <button class="flag-del-btn" title="ลบ Flag นี้ออกจากโปรไฟล์" onclick="deleteProfileFlag('${esc(key)}')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
};

window.filterProfileEditorTable = function(query) {
  renderProfileEditorTable(query);
};

window.updateProfileFlagValue = function(key, val) {
  _currentEditingProfileFlags[key] = val;
};

window.deleteProfileFlag = function(key) {
  delete _currentEditingProfileFlags[key];
  renderProfileEditorTable();
};

window.addFlagToProfileEditor = function() {
  const key = prompt('ระบุชื่อ FastFlag ที่ต้องการเพิ่มลงในโปรไฟล์:');
  if (!key || !key.trim()) return;
  const val = prompt(`ระบุค่าสำหรับ ${key.trim()}:`, 'True');
  if (val === null) return;
  _currentEditingProfileFlags[key.trim()] = val.trim();
  renderProfileEditorTable();
  toast(`เพิ่ม ${key.trim()} ลงในโปรไฟล์แล้ว`, 'ok');
};

window.formatProfileEditorJson = function() {
  const textarea = document.getElementById('vs-modal-raw-textarea');
  if (!textarea) return;
  try {
    const parsed = JSON.parse(textarea.value.trim() || '{}');
    textarea.value = JSON.stringify(parsed, null, 2);
    _currentEditingProfileFlags = parsed;
    toast('จัดรูปแบบ JSON สำเร็จ', 'ok');
  } catch (e) {
    toast('รูปแบบ JSON ไม่ถูกต้อง', 'err');
  }
};

window.saveProfileEditorChanges = async function() {
  if (_currentProfileEditorTab === 'raw') {
    const textarea = document.getElementById('vs-modal-raw-textarea');
    try {
      _currentEditingProfileFlags = JSON.parse(textarea?.value.trim() || '{}');
    } catch {
      toast('รูปแบบ JSON ไม่ถูกต้อง กรุณาแก้ไขก่อนบันทึก', 'err');
      return;
    }
  }

  try {
    let name = _currentEditingProfileName;
    if (!_currentEditingProfileIsCustom) {
      name = prompt('โปรไฟล์นี้เป็น Built-in หากต้องการบันทึกกรุณาระบุชื่อโปรไฟล์ใหม่ (Custom Profile):', _currentEditingProfileName + '_custom');
      if (!name || !name.trim()) return;
      name = name.trim();
    }
    const res = await api.saveVoidstrapProfile(name, _currentEditingProfileFlags);
    if (res && res.ok) {
      toast(`บันทึกโปรไฟล์ ${name} เรียบร้อยแล้ว`, 'ok');
      renderCustomProfilesList();
      closeProfileEditor();
    } else {
      toast('บันทึกไม่สำเร็จ: ' + (res?.error || ''), 'err');
    }
  } catch (e) {
    toast('เกิดข้อผิดพลาด: ' + (e.message || e), 'err');
  }
};

window.applyProfileFromEditor = async function() {
  if (_currentProfileEditorTab === 'raw') {
    const textarea = document.getElementById('vs-modal-raw-textarea');
    try {
      _currentEditingProfileFlags = JSON.parse(textarea?.value.trim() || '{}');
    } catch {
      toast('รูปแบบ JSON ไม่ถูกต้อง กรุณาแก้ไขก่อนบันทึก', 'err');
      return;
    }
  }

  try {
    await api.writeFFlags(_currentEditingProfileFlags);
    await loadVoidstrapPresetsUI();
    if (_currentVsSubtab === 'editor') renderVoidstrapEditorTable();
    toast(`ปรับใช้โปรไฟล์ ${_currentEditingProfileName} ไปยัง Roblox แล้ว`, 'ok');
    closeProfileEditor();
  } catch (e) {
    toast('ปรับใช้โปรไฟล์ล้มเหลว: ' + (e.message || e), 'err');
  }
};

// ── Sub-panel 2: FastFlag Settings (Presets, Collapsibles, Search) ──────────

window.filterVoidstrapFlags = function(query) {
  const q = (query || '').toLowerCase().trim();
  const rows = document.querySelectorAll('#vs-subpanel-fflags .vs-flag-row');
  const cards = document.querySelectorAll('#vs-subpanel-fflags .vs-card-collapsible');

  if (!q) {
    rows.forEach(r => r.style.display = '');
    cards.forEach(c => c.style.display = '');
    return;
  }

  cards.forEach(card => {
    let cardHasMatch = false;
    const cardRows = card.querySelectorAll('.vs-flag-row');
    cardRows.forEach(row => {
      const text = (row.textContent || '').toLowerCase();
      if (text.includes(q)) {
        row.style.display = '';
        cardHasMatch = true;
      } else {
        row.style.display = 'none';
      }
    });
    if (cardHasMatch) {
      card.style.display = '';
      card.classList.remove('collapsed');
    } else {
      card.style.display = 'none';
    }
  });
};

window.toggleCollapsibleCard = function(headerEl) {
  const card = headerEl.closest('.vs-card-collapsible');
  if (card) card.classList.toggle('collapsed');
};

async function loadVoidstrapPresetsUI() {
  try {
    const presets = await api.readVoidstrapPresets();
    if (presets) {
      const setCheck = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.checked = !!val;
      };
      setCheck('mix-vs-remove-textures', presets.removeTextures);
      setCheck('mix-vs-low-poly', presets.lowPolyMeshes);
      setCheck('mix-vs-disable-postfx', presets.disablePostFx);
      setCheck('mix-vs-disable-shadows', presets.disableShadows);
      setCheck('mix-vs-disable-terrain', presets.disableTerrainTextures);
      setCheck('mix-vs-disable-telemetry', presets.disableTelemetry);
      setCheck('mix-vs-optimize-cframe', presets.optimizeCFrame);
      setCheck('mix-vs-multithreading', presets.multiThreading);
      setCheck('mix-vs-faster-loading', presets.fasterLoading);
      setCheck('mix-vs-exclusive-fs', presets.exclusiveFullscreen);
      setCheck('mix-vs-no-blur', presets.noGuiBlur);
      setCheck('mix-vs-unlimited-zoom', presets.unlimitedZoom);
      setCheck('mix-vs-fps-display', presets.newFpsDisplay);
      setCheck('mix-vs-fix-scaling', presets.fixDisplayScaling);
      setCheck('mix-vs-gray-sky', presets.graySky);

      syncCustomDropdownUI('vsRenderEngine', presets.renderEngine || 'default');
      syncCustomDropdownUI('vsLightingTech', presets.lightingTechnology || 'default');
      syncCustomDropdownUI('vsMsaa', presets.msaa || 'default');
      syncCustomDropdownUI('vsEscMenu', presets.escapeMenu || 'default');
    }
  } catch (e) {
    console.error('loadVoidstrapPresetsUI error:', e);
  }
}

window.onVoidstrapPresetChanged = function() {
  // Triggered on individual switch change
};

window.commitVoidstrapPresets = async function() {
  const presets = {
    removeTextures: !!document.getElementById('mix-vs-remove-textures')?.checked,
    lowPolyMeshes: !!document.getElementById('mix-vs-low-poly')?.checked,
    disablePostFx: !!document.getElementById('mix-vs-disable-postfx')?.checked,
    disableShadows: !!document.getElementById('mix-vs-disable-shadows')?.checked,
    disableTerrainTextures: !!document.getElementById('mix-vs-disable-terrain')?.checked,
    disableTelemetry: !!document.getElementById('mix-vs-disable-telemetry')?.checked,
    optimizeCFrame: !!document.getElementById('mix-vs-optimize-cframe')?.checked,
    multiThreading: !!document.getElementById('mix-vs-multithreading')?.checked,
    fasterLoading: !!document.getElementById('mix-vs-faster-loading')?.checked,
    exclusiveFullscreen: !!document.getElementById('mix-vs-exclusive-fs')?.checked,
    noGuiBlur: !!document.getElementById('mix-vs-no-blur')?.checked,
    unlimitedZoom: !!document.getElementById('mix-vs-unlimited-zoom')?.checked,
    newFpsDisplay: !!document.getElementById('mix-vs-fps-display')?.checked,
    fixDisplayScaling: !!document.getElementById('mix-vs-fix-scaling')?.checked,
    graySky: !!document.getElementById('mix-vs-gray-sky')?.checked,
    renderEngine: document.getElementById('mix-vs-engine')?.dataset.value || 'default',
    lightingTechnology: document.getElementById('mix-vs-lighting')?.dataset.value || 'default',
    msaa: document.getElementById('mix-vs-msaa')?.dataset.value || 'default',
    escapeMenu: document.getElementById('mix-vs-escmenu')?.dataset.value || 'default'
  };

  try {
    const res = await api.applyVoidstrapPresets(presets);
    if (res && res.ok) {
      toast('บันทึกและซิงค์ FastFlags ไปยัง Voidstrap และ Roblox เรียบร้อยแล้ว', 'ok');
    } else {
      toast('บันทึกการตั้งค่า FastFlags ล้มเหลว', 'err');
    }
  } catch (e) {
    toast('เกิดข้อผิดพลาด: ' + (e.message || e), 'err');
  }
};

window.copyVoidstrapFlagsJson = async function() {
  try {
    const flags = (await api.readFFlags()) || {};
    const text = JSON.stringify(flags, null, 2);
    await navigator.clipboard.writeText(text);
    toast('คัดลอก FastFlags JSON เรียบร้อยแล้ว (' + Object.keys(flags).length + ' flags)', 'ok');
  } catch (e) {
    toast('คัดลอกไม่สำเร็จ: ' + (e.message || e), 'err');
  }
};

window.resetVoidstrapPresets = async function() {
  if (!confirm('คุณต้องการรีเซ็ตการตั้งค่า Voidstrap FastFlags ทั้งหมดเป็นค่าเริ่มต้นหรือไม่?')) return;
  const ids = [
    'mix-vs-remove-textures', 'mix-vs-low-poly', 'mix-vs-disable-postfx',
    'mix-vs-disable-shadows', 'mix-vs-disable-terrain', 'mix-vs-disable-telemetry',
    'mix-vs-optimize-cframe', 'mix-vs-multithreading', 'mix-vs-faster-loading',
    'mix-vs-exclusive-fs', 'mix-vs-no-blur', 'mix-vs-unlimited-zoom',
    'mix-vs-fps-display', 'mix-vs-fix-scaling', 'mix-vs-gray-sky'
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  syncCustomDropdownUI('vsRenderEngine', 'default');
  syncCustomDropdownUI('vsLightingTech', 'default');
  syncCustomDropdownUI('vsMsaa', 'default');
  syncCustomDropdownUI('vsEscMenu', 'default');
  await commitVoidstrapPresets();
  toast('รีเซ็ตการตั้งค่า Voidstrap เรียบร้อยแล้ว', 'ok');
};

// ── Sub-panel 3: FastFlag Editor (Live Table, Batch Select, Bloat, Raw JSON) ─

window.renderVoidstrapEditorTable = async function(filterQuery = '') {
  try {
    _currentFastFlags = (await api.readFFlags()) || {};
    const tbody = document.getElementById('vs-editor-tbody');
    const badge = document.getElementById('vs-editor-count-badge');
    const bloatBadge = document.getElementById('vs-editor-bloat-badge');
    const keys = Object.keys(_currentFastFlags);
    
    if (badge) badge.textContent = keys.length + ' Flags';
    if (bloatBadge) {
      const bloatPct = Math.min(100, Math.round(keys.length / 50 * 100));
      bloatBadge.textContent = `Flags added: ${keys.length} | Bloat: ${bloatPct}%`;
    }

    if (!tbody) return;
    const q = (filterQuery || document.getElementById('vs-editor-search')?.value || '').toLowerCase().trim();

    let matchedKeys = keys;
    if (q) {
      matchedKeys = keys.filter(k => k.toLowerCase().includes(q) || String(_currentFastFlags[k]).toLowerCase().includes(q));
    }

    if (_showConfiguredOnly) {
      matchedKeys = matchedKeys.filter(k => _currentFastFlags[k] !== undefined && _currentFastFlags[k] !== '');
    }

    if (matchedKeys.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--t3);font-size:12.5px">${q ? 'ไม่พบ FastFlag ที่ตรงกับการค้นหา' : 'ยังไม่มีการตั้งค่า FastFlags'}</td></tr>`;
      return;
    }

    tbody.innerHTML = matchedKeys.map(key => {
      const val = _currentFastFlags[key];
      const tagInfo = getFlagCategoryTag(key);
      const isPreset = POPULAR_PRESET_FLAGS.some(p => p.key === key);
      const isChecked = _selectedFlagKeys.has(key);

      return `
        <tr data-flag="${esc(key)}">
          <td style="text-align:center">
            <input type="checkbox" class="vs-checkbox vs-flag-checkbox" data-flag="${esc(key)}" ${isChecked ? 'checked' : ''} onchange="onFlagCheckboxChanged()" />
          </td>
          <td><div class="flag-key" title="${esc(key)}">${esc(key)}</div></td>
          <td>
            <input type="text" class="flag-input" value="${esc(String(val))}" onchange="updateEditorFlag('${esc(key)}', this.value)" />
          </td>
          <td>
            <span class="vs-tag-badge ${tagInfo.cls}">${tagInfo.tag}</span>
          </td>
          <td style="text-align:center">
            <span class="badge ${isPreset ? 'g' : 'muted'}">${isPreset ? 'Yes' : 'No'}</span>
          </td>
          <td style="text-align:center">
            <button class="flag-del-btn" title="ลบ Flag นี้" onclick="deleteEditorFlag('${esc(key)}')">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (e) {
    console.error('renderVoidstrapEditorTable error:', e);
  }
};

window.onVsEditorSearch = function(query) {
  renderVoidstrapEditorTable(query);
};

window.toggleSelectAllFlags = function(checked) {
  const tbody = document.getElementById('vs-editor-tbody');
  if (!tbody) return;
  const cbs = tbody.querySelectorAll('.vs-flag-checkbox');
  cbs.forEach(cb => {
    cb.checked = checked;
    const flagKey = cb.dataset.flag;
    if (checked) _selectedFlagKeys.add(flagKey);
    else _selectedFlagKeys.delete(flagKey);
  });
};

window.onFlagCheckboxChanged = function() {
  const tbody = document.getElementById('vs-editor-tbody');
  if (!tbody) return;
  const cbs = tbody.querySelectorAll('.vs-flag-checkbox');
  let allChecked = cbs.length > 0;
  _selectedFlagKeys.clear();
  cbs.forEach(cb => {
    if (cb.checked) _selectedFlagKeys.add(cb.dataset.flag);
    else allChecked = false;
  });
  const allBox = document.getElementById('vs-select-all-checkbox');
  if (allBox) allBox.checked = allChecked;
};

window.deleteSelectedFlags = async function() {
  if (_selectedFlagKeys.size === 0) {
    toast('กรุณาเลือก FastFlag ที่ต้องการลบก่อน', 'info');
    return;
  }
  if (!confirm(`ต้องการลบ FastFlags ที่เลือกไว้จำนวน ${_selectedFlagKeys.size} รายการหรือไม่?`)) return;
  try {
    for (const k of _selectedFlagKeys) {
      await api.deleteFFlag(k);
      delete _currentFastFlags[k];
    }
    _selectedFlagKeys.clear();
    const allBox = document.getElementById('vs-select-all-checkbox');
    if (allBox) allBox.checked = false;
    toast('ลบ Flags ที่เลือกเรียบร้อยแล้ว', 'info');
    renderVoidstrapEditorTable();
  } catch (e) {
    toast('ลบ Flags ไม่สำเร็จ: ' + (e.message || e), 'err');
  }
};

window.deleteAllCustomFlags = async function() {
  const keys = Object.keys(_currentFastFlags);
  if (keys.length === 0) {
    toast('ไม่มี FastFlags ให้ลบ', 'info');
    return;
  }
  if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ FastFlags ทั้งหมด (${keys.length} รายการ)?`)) return;
  try {
    await api.setRawFFlags('{}');
    _currentFastFlags = {};
    _selectedFlagKeys.clear();
    toast('ลบ FastFlags ทั้งหมดเรียบร้อยแล้ว', 'info');
    renderVoidstrapEditorTable();
  } catch (e) {
    toast('ลบไม่สำเร็จ: ' + (e.message || e), 'err');
  }
};

window.toggleShowConfiguredFlagsOnly = function() {
  _showConfiguredOnly = !_showConfiguredOnly;
  const btn = document.getElementById('vs-btn-toggle-configured');
  if (btn) btn.classList.toggle('primary', _showConfiguredOnly);
  renderVoidstrapEditorTable();
};

window.updateEditorFlag = async function(key, newValue) {
  try {
    const existing = (await api.readFFlags()) || {};
    existing[key] = newValue;
    _currentFastFlags = existing;
    await api.writeFFlags(existing);
    toast(`อัปเดต ${key} เรียบร้อยแล้ว`, 'ok');
  } catch (e) {
    toast('บันทึก Flag ไม่สำเร็จ: ' + (e.message || e), 'err');
  }
};

window.deleteEditorFlag = async function(key) {
  try {
    delete _currentFastFlags[key];
    await api.deleteFFlag(key);
    toast(`ลบ ${key} แล้ว`, 'info');
    renderVoidstrapEditorTable();
  } catch (e) {
    toast('ลบ Flag ไม่สำเร็จ: ' + (e.message || e), 'err');
  }
};

window.toggleRawJsonEditor = function() {
  _isRawJsonMode = !_isRawJsonMode;
  const tableView = document.getElementById('vs-editor-table-view');
  const rawView = document.getElementById('vs-editor-raw-view');
  const toggleLabel = document.getElementById('vs-raw-toggle-label');
  const textarea = document.getElementById('vs-editor-raw-textarea');

  if (_isRawJsonMode) {
    if (tableView) tableView.style.display = 'none';
    if (rawView) rawView.style.display = 'block';
    if (toggleLabel) toggleLabel.textContent = 'ดูแบบตาราง';
    if (textarea) {
      textarea.value = JSON.stringify(_currentFastFlags, null, 2);
      validateRawJsonSyntax();
    }
  } else {
    if (tableView) tableView.style.display = 'block';
    if (rawView) rawView.style.display = 'none';
    if (toggleLabel) toggleLabel.textContent = 'แก้ไข Raw JSON';
    renderVoidstrapEditorTable();
  }
};

window.validateRawJsonSyntax = function() {
  const textarea = document.getElementById('vs-editor-raw-textarea');
  const badge = document.getElementById('vs-raw-syntax-status');
  if (!textarea || !badge) return false;
  try {
    const val = textarea.value.trim();
    if (!val) {
      badge.className = 'badge muted';
      badge.textContent = 'JSON ว่างเปล่า';
      return true;
    }
    const parsed = JSON.parse(val);
    if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
      throw new Error('ต้องเป็น Object');
    }
    badge.className = 'badge g';
    badge.textContent = 'JSON Syntax: ถูกต้อง';
    return true;
  } catch (e) {
    badge.className = 'badge r';
    badge.textContent = 'JSON Syntax: รูปแบบไม่ถูกต้อง';
    return false;
  }
};

window.formatRawJsonEditor = function() {
  const textarea = document.getElementById('vs-editor-raw-textarea');
  if (!textarea) return;
  try {
    const parsed = JSON.parse(textarea.value.trim() || '{}');
    textarea.value = JSON.stringify(parsed, null, 2);
    validateRawJsonSyntax();
    toast('จัดรูปแบบ JSON เรียบร้อยแล้ว', 'ok');
  } catch (e) {
    toast('ไม่สามารถจัดรูปแบบได้: รูปแบบ JSON ไม่ถูกต้อง', 'err');
  }
};

window.saveRawJsonEditor = async function() {
  const textarea = document.getElementById('vs-editor-raw-textarea');
  if (!textarea) return;
  if (!validateRawJsonSyntax()) {
    toast('ไม่สามารถบันทึกได้ กรุณาแก้ไข Syntax JSON ให้ถูกต้อง', 'err');
    return;
  }
  try {
    const res = await api.setRawFFlags(textarea.value.trim() || '{}');
    if (res && res.ok) {
      toast('บันทึกและปรับใช้ FastFlags JSON เรียบร้อยแล้ว', 'ok');
      toggleRawJsonEditor();
    } else {
      toast('บันทึกไม่สำเร็จ: ' + (res?.error || ''), 'err');
    }
  } catch (e) {
    toast('เกิดข้อผิดพลาด: ' + (e.message || e), 'err');
  }
};

window.openAddFlagModal = function() {
  const modal = document.getElementById('vs-modal-add-flag');
  if (modal) {
    const keyInput = document.getElementById('vs-input-flag-key');
    const valInput = document.getElementById('vs-input-flag-value');
    const select = document.getElementById('vs-select-flag-type');
    if (keyInput) keyInput.value = '';
    if (valInput) valInput.value = 'True';
    if (select) select.value = 'Boolean';
    modal.style.display = 'flex';
    setTimeout(() => { if (keyInput) keyInput.focus(); }, 50);
  }
};

window.closeAddFlagModal = function() {
  const modal = document.getElementById('vs-modal-add-flag');
  if (modal) modal.style.display = 'none';
};

window.autoDetectFlagType = function(val) {
  const select = document.getElementById('vs-select-flag-type');
  const valInput = document.getElementById('vs-input-flag-value');
  if (!select) return;
  if (val.startsWith('FFlag') || val.startsWith('DFFlag') || val.startsWith('SFFlag')) {
    select.value = 'Boolean';
    if (valInput && (valInput.value === '' || valInput.value === '0')) valInput.value = 'True';
  } else if (val.startsWith('FInt') || val.startsWith('DFInt') || val.startsWith('SFInt')) {
    select.value = 'Integer';
    if (valInput && (valInput.value === 'True' || valInput.value === 'False')) valInput.value = '0';
  } else if (val.startsWith('FString') || val.startsWith('DFString')) {
    select.value = 'String';
  }
};

window.onFlagTypeChanged = function(type) {
  const valInput = document.getElementById('vs-input-flag-value');
  if (!valInput) return;
  if (type === 'Boolean') valInput.value = 'True';
  else if (type === 'Integer') valInput.value = '0';
  else valInput.value = '';
};

window.submitAddNewFlag = async function() {
  const keyInput = document.getElementById('vs-input-flag-key');
  const valInput = document.getElementById('vs-input-flag-value');
  const key = (keyInput?.value || '').trim();
  let val = (valInput?.value || '').trim();
  if (!key) {
    toast('กรุณาระบุชื่อ Flag', 'err');
    if (keyInput) keyInput.focus();
    return;
  }
  const type = document.getElementById('vs-select-flag-type')?.value || 'Boolean';
  if (type === 'Boolean') {
    val = (val.toLowerCase() === 'true' || val === '1') ? 'True' : 'False';
  } else if (type === 'Integer') {
    val = String(parseInt(val, 10) || 0);
  }
  try {
    const existing = (await api.readFFlags()) || {};
    existing[key] = val;
    await api.writeFFlags(existing);
    _currentFastFlags = existing;
    toast(`เพิ่ม FastFlag ${key} สำเร็จแล้ว`, 'ok');
    closeAddFlagModal();
    renderVoidstrapEditorTable();
  } catch (e) {
    toast('เพิ่ม Flag ล้มเหลว: ' + (e.message || e), 'err');
  }
};

window.openPresetFlagsLibrary = function() {
  const drawer = document.getElementById('vs-drawer-library');
  const container = document.getElementById('vs-library-presets-container');
  if (!drawer || !container) return;

  container.innerHTML = POPULAR_PRESET_FLAGS.map(item => `
    <div class="vs-library-item">
      <div class="vs-library-info">
        <div class="vs-library-title">
          <span>${esc(item.title)}</span>
          <span class="badge ${item.type === 'Boolean' ? 'b' : (item.type === 'Integer' ? 'g' : 'p')}">${item.type}</span>
        </div>
        <div class="vs-library-desc">${esc(item.desc)}</div>
        <div class="vs-library-key">${esc(item.key)} = ${esc(item.defaultValue)}</div>
      </div>
      <button class="btn btn-secondary" onclick="addFlagFromLibrary('${esc(item.key)}', '${esc(item.defaultValue)}')">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>เพิ่ม</span>
      </button>
    </div>
  `).join('');

  drawer.style.display = 'flex';
};

window.closePresetFlagsLibrary = function() {
  const drawer = document.getElementById('vs-drawer-library');
  if (drawer) drawer.style.display = 'none';
};

window.addFlagFromLibrary = async function(key, val) {
  try {
    const existing = (await api.readFFlags()) || {};
    existing[key] = val;
    _currentFastFlags = existing;
    await api.writeFFlags(existing);
    toast(`เพิ่ม ${key} ลงใน ClientAppSettings แล้ว`, 'ok');
    if (_currentVsSubtab === 'editor') renderVoidstrapEditorTable();
  } catch (e) {
    toast('เพิ่ม Flag ล้มเหลว: ' + (e.message || e), 'err');
  }
};

// ── Sub-panel 4: Global Settings ──────────────────────────────────────────

async function loadVoidstrapGlobalUI() {
  try {
    const rpcStatus = await api.getDiscordRpcStatus();
    const rpcBadge = document.getElementById('vs-rpc-status-badge');
    if (rpcBadge) {
      if (rpcStatus && rpcStatus.connected) {
        rpcBadge.className = 'badge g';
        rpcBadge.textContent = 'Discord เชื่อมต่อแล้ว';
      } else if (rpcStatus && rpcStatus.enabled) {
        rpcBadge.className = 'badge b';
        rpcBadge.textContent = 'กำลังรอเชื่อมต่อ Discord...';
      } else {
        rpcBadge.className = 'badge muted';
        rpcBadge.textContent = 'ปิดการทำงาน';
      }
    }
    const rpcCheckbox = document.getElementById('setting-vs-discord-rpc');
    if (rpcCheckbox && rpcStatus) {
      rpcCheckbox.checked = !!rpcStatus.enabled;
    }
  } catch {}
}

window.toggleDiscordRpcSetting = async function(enabled) {
  try {
    await api.setDiscordRpc({ enabled: !!enabled });
    saveSettingsDebounced();
    loadVoidstrapGlobalUI();
    toast(enabled ? 'เปิดใช้งาน Discord Rich Presence แล้ว' : 'ปิดใช้งาน Discord Rich Presence แล้ว', 'info');
  } catch (e) {
    toast('ตั้งค่า Discord RPC ล้มเหลว: ' + (e.message || e), 'err');
  }
};

window.browseCustomBootstrapperExe = async function() {
  try {
    const res = await api.pickModFile('exe');
    if (res && res.ok && res.filePath) {
      const inp = document.getElementById('vs-custom-exe-input');
      if (inp) inp.value = res.filePath;
      settings.customBootstrapperPath = res.filePath;
      saveSettingsDebounced();
      toast('เลือกไฟล์ Bootstrapper สำเร็จแล้ว', 'ok');
    }
  } catch (e) {
    toast('เลือกไฟล์ไม่สำเร็จ: ' + (e.message || e), 'err');
  }
};

window.saveCustomBootstrapperPath = function(val) {
  settings.customBootstrapperPath = (val || '').trim();
  saveSettingsDebounced();
};

// ── Sub-panel 5: Mod Settings & Deployment ────────────────────────────────

async function loadVoidstrapModUI() {
  try {
    _modSettings = (await api.getModSettings()) || {};
    syncCustomDropdownUI('modDeathSound', _modSettings.deathSound || 'oof');
    const soundWrap = document.getElementById('vs-custom-sound-wrap');
    if (soundWrap) soundWrap.style.display = (_modSettings.deathSound === 'custom') ? 'flex' : 'none';
    const soundName = document.getElementById('vs-custom-sound-name');
    if (soundName) {
      soundName.textContent = _modSettings.customDeathSoundPath ? _modSettings.customDeathSoundPath.split(/[\\/]/).pop() : 'ยังไม่ได้เลือก';
    }

    syncCustomDropdownUI('modCursor', _modSettings.cursorType || '2013');
    const cursorWrap = document.getElementById('vs-custom-cursor-wrap');
    if (cursorWrap) cursorWrap.style.display = (_modSettings.cursorType === 'custom') ? 'flex' : 'none';
    const cursorName = document.getElementById('vs-custom-cursor-name');
    if (cursorName) {
      cursorName.textContent = _modSettings.customCursorPath ? _modSettings.customCursorPath.split(/[\\/]/).pop() : 'ยังไม่ได้เลือก';
    }
  } catch (e) {
    console.error('loadVoidstrapModUI error:', e);
  }
}

window.browseCustomDeathSound = async function() {
  try {
    const res = await api.pickModFile('audio');
    if (res && res.ok && res.filePath) {
      _modSettings.customDeathSoundPath = res.filePath;
      _modSettings.deathSound = 'custom';
      await api.saveModSettings(_modSettings);
      const nameEl = document.getElementById('vs-custom-sound-name');
      if (nameEl) nameEl.textContent = res.fileName || res.filePath.split(/[\\/]/).pop();
      syncCustomDropdownUI('modDeathSound', 'custom');
      document.getElementById('vs-custom-sound-wrap').style.display = 'flex';
      toast('เลือกไฟล์เสียงตาย: ' + (res.fileName || 'สำเร็จ'), 'ok');
    }
  } catch (e) {
    toast('เกิดข้อผิดพลาด: ' + (e.message || e), 'err');
  }
};

window.browseCustomCursor = async function() {
  try {
    const res = await api.pickModFile('image');
    if (res && res.ok && res.filePath) {
      _modSettings.customCursorPath = res.filePath;
      _modSettings.cursorType = 'custom';
      await api.saveModSettings(_modSettings);
      const nameEl = document.getElementById('vs-custom-cursor-name');
      if (nameEl) nameEl.textContent = res.fileName || res.filePath.split(/[\\/]/).pop();
      syncCustomDropdownUI('modCursor', 'custom');
      document.getElementById('vs-custom-cursor-wrap').style.display = 'flex';
      toast('เลือกไฟล์เคอร์เซอร์: ' + (res.fileName || 'สำเร็จ'), 'ok');
    }
  } catch (e) {
    toast('เกิดข้อผิดพลาด: ' + (e.message || e), 'err');
  }
};

window.deployVoidstrapMods = async function() {
  try {
    toast('กำลังติดตั้ง Mods ไปยังตัวเกม...', 'info');
    const res = await api.deployMods();
    if (res && res.ok) {
      toast(`ติดตั้ง Mods เรียบร้อยแล้ว (คัดลอก ${res.copiedCount || 0} ไฟล์)`, 'ok');
    } else {
      toast('ติดตั้ง Mods ไม่สำเร็จ: ' + (res?.error || 'ไม่พบไดเรกทอรี Roblox'), 'err');
    }
  } catch (e) {
    toast('ติดตั้ง Mods ล้มเหลว: ' + (e.message || e), 'err');
  }
};

window.openAppModsFolder = async function() {
  try {
    const res = await api.openModsFolder();
    if (!res || !res.ok) {
      toast('ไม่สามารถเปิดโฟลเดอร์ได้: ' + (res?.error || ''), 'err');
    }
  } catch (e) {
    toast('เกิดข้อผิดพลาด: ' + (e.message || e), 'err');
  }
};

// ── Discord Rich Presence Settings & Live Preview Logic ──

let _discordSaveDebounceTimer = null;
let _lastFocusedDiscordInput = null;

document.addEventListener('focusin', e => {
  if (e.target && (e.target.id === 'setting-discord-rpc-details' || e.target.id === 'setting-discord-rpc-state')) {
    _lastFocusedDiscordInput = e.target;
  }
});

window.saveDiscordRpcSettingsDebounced = function() {
  clearTimeout(_discordSaveDebounceTimer);
  _discordSaveDebounceTimer = setTimeout(() => {
    saveDiscordRpcSettingsNow(true);
  }, 400);
};

window.loadDiscordRpcSettings = async function() {
  try {
    const s = await api.getDiscordRpcSettings();
    if (!s) return;

    const enabledEl = document.getElementById('setting-discord-rpc-enabled');
    if (enabledEl) enabledEl.checked = !!s.enabled;

    const onlyRunningEl = document.getElementById('setting-discord-rpc-only-running');
    if (onlyRunningEl) onlyRunningEl.checked = !!s.onlyWhenRunning;

    const detailsEl = document.getElementById('setting-discord-rpc-details');
    if (detailsEl) detailsEl.value = s.details || '';

    const stateEl = document.getElementById('setting-discord-rpc-state');
    if (stateEl) stateEl.value = s.state || '';

    const largeTextEl = document.getElementById('setting-discord-rpc-large-text');
    if (largeTextEl) largeTextEl.value = s.largeText || '';

    const smallTextEl = document.getElementById('setting-discord-rpc-small-text');
    if (smallTextEl) smallTextEl.value = s.smallText || '';

    const b1EnabledEl = document.getElementById('setting-discord-rpc-b1-enabled');
    if (b1EnabledEl) b1EnabledEl.checked = !!s.button1Enabled;

    const b1LabelEl = document.getElementById('setting-discord-rpc-b1-label');
    if (b1LabelEl) b1LabelEl.value = s.button1Label || '';

    const b1UrlEl = document.getElementById('setting-discord-rpc-b1-url');
    if (b1UrlEl) b1UrlEl.value = s.button1Url || '';

    const b2EnabledEl = document.getElementById('setting-discord-rpc-b2-enabled');
    if (b2EnabledEl) b2EnabledEl.checked = !!s.button2Enabled;

    const b2LabelEl = document.getElementById('setting-discord-rpc-b2-label');
    if (b2LabelEl) b2LabelEl.value = s.button2Label || '';

    const b2UrlEl = document.getElementById('setting-discord-rpc-b2-url');
    if (b2UrlEl) b2UrlEl.value = s.button2Url || '';

    const hideUserEl = document.getElementById('setting-discord-rpc-hide-user');
    if (hideUserEl) hideUserEl.checked = !!s.hideUsernames;

    const hideGameEl = document.getElementById('setting-discord-rpc-hide-game');
    if (hideGameEl) hideGameEl.checked = !!s.hideGameDetails;

    const clientIdEl = document.getElementById('setting-discord-rpc-client-id');
    if (clientIdEl) clientIdEl.value = s.customClientId || '';

    if (typeof syncCustomDropdownUI === 'function') {
      syncCustomDropdownUI('timestampMode', s.timestampMode || 'app');
    }

    updateDiscordPreview();
    updateDiscordRpcStatusBadge();
  } catch (e) {
    console.error('Error loading Discord RPC settings:', e);
  }
};

let _discordPreviewThemeMode = 'auto';

window.cycleDiscordPreviewTheme = function() {
  const card = document.getElementById('discord-preview-card');
  const label = document.getElementById('discord-prev-theme-label');
  if (!card) return;

  if (_discordPreviewThemeMode === 'auto') {
    _discordPreviewThemeMode = 'dark';
    card.classList.remove('theme-light');
    card.classList.add('theme-dark');
    if (label) label.textContent = 'พรีวิว: มืด (Discord Dark)';
  } else if (_discordPreviewThemeMode === 'dark') {
    _discordPreviewThemeMode = 'light';
    card.classList.remove('theme-dark');
    card.classList.add('theme-light');
    if (label) label.textContent = 'พรีวิว: สว่าง (Discord Light)';
  } else {
    _discordPreviewThemeMode = 'auto';
    card.classList.remove('theme-dark', 'theme-light');
    if (label) label.textContent = 'พรีวิว: อัตโนมัติ';
  }
};

window.updateDiscordRpcStatusBadge = async function() {
  const badge = document.getElementById('discord-rpc-status-badge');
  if (!badge) return;
  try {
    const status = await api.getDiscordRpcStatus();
    if (!status || !status.enabled) {
      badge.textContent = 'ปิดใช้งาน';
      badge.className = 'badge';
    } else if (status.ready || status.connected) {
      badge.textContent = 'เชื่อมต่อแล้ว';
      badge.className = 'badge g';
    } else {
      badge.textContent = 'กำลังค้นหา Discord...';
      badge.className = 'badge';
    }
  } catch {
    badge.textContent = 'ไม่พร้อมใช้งาน';
    badge.className = 'badge';
  }
};

window.updateDiscordPreview = function() {
  const detailsTpl = document.getElementById('setting-discord-rpc-details')?.value || 'Farming: {game}';
  const stateTpl = document.getElementById('setting-discord-rpc-state')?.value || 'Running {online}/{total} accounts | AFK: {afk}';
  const hideUser = !!document.getElementById('setting-discord-rpc-hide-user')?.checked;
  const hideGame = !!document.getElementById('setting-discord-rpc-hide-game')?.checked;

  const onlineCount = typeof _launchedIds !== 'undefined' ? _launchedIds.size : 0;
  const totalCount = typeof accounts !== 'undefined' ? accounts.length : 0;
  let sampleUser = 'Player';
  if (typeof accounts !== 'undefined' && accounts && accounts.length > 0) {
    sampleUser = accounts[0].nickname || accounts[0].username || 'Player';
  }

  const sampleCtx = {
    onlineCount: onlineCount > 0 ? onlineCount : 3,
    totalCount: totalCount > 0 ? totalCount : 5,
    gameName: 'Blox Fruits',
    username: sampleUser,
    antiAfkActive: true,
    fpsCap: '60'
  };

  const formatFn = (tpl) => {
    if (!tpl) return '';
    const online = sampleCtx.onlineCount;
    const total = sampleCtx.totalCount;
    const game = hideGame ? 'Roblox' : sampleCtx.gameName;
    const user = hideUser ? 'Player' : sampleCtx.username;
    const afk = sampleCtx.antiAfkActive ? 'Active' : 'Inactive';
    const fps = sampleCtx.fpsCap;
    return tpl
      .replace(/{online}/g, String(online))
      .replace(/{total}/g, String(total))
      .replace(/{game}/g, String(game))
      .replace(/{user}/g, String(user))
      .replace(/{afk}/g, String(afk))
      .replace(/{fps}/g, String(fps));
  };

  const prevDetails = document.getElementById('discord-prev-details');
  if (prevDetails) prevDetails.textContent = formatFn(detailsTpl);

  const prevState = document.getElementById('discord-prev-state');
  if (prevState) prevState.textContent = formatFn(stateTpl);

  const b1Enabled = !!document.getElementById('setting-discord-rpc-b1-enabled')?.checked;
  const b1Label = document.getElementById('setting-discord-rpc-b1-label')?.value || 'Download MultiRoblox';
  const prevB1 = document.getElementById('discord-prev-b1');
  if (prevB1) {
    prevB1.style.display = b1Enabled ? 'block' : 'none';
    prevB1.textContent = b1Label;
  }

  const b2Enabled = !!document.getElementById('setting-discord-rpc-b2-enabled')?.checked;
  const b2Label = document.getElementById('setting-discord-rpc-b2-label')?.value || 'Join Game';
  const prevB2 = document.getElementById('discord-prev-b2');
  if (prevB2) {
    prevB2.style.display = (b2Enabled && !hideGame) ? 'block' : 'none';
    prevB2.textContent = b2Label;
  }
};

window.applyDiscordPreset = function(preset) {
  const detailsEl = document.getElementById('setting-discord-rpc-details');
  const stateEl = document.getElementById('setting-discord-rpc-state');
  const b1EnabledEl = document.getElementById('setting-discord-rpc-b1-enabled');
  const b1LabelEl = document.getElementById('setting-discord-rpc-b1-label');
  const b1UrlEl = document.getElementById('setting-discord-rpc-b1-url');
  const b2EnabledEl = document.getElementById('setting-discord-rpc-b2-enabled');
  const b2LabelEl = document.getElementById('setting-discord-rpc-b2-label');

  if (preset === 'farming') {
    if (detailsEl) detailsEl.value = 'Farming: {game}';
    if (stateEl) stateEl.value = 'Running {online}/{total} accounts | AFK: {afk}';
    if (b1EnabledEl) b1EnabledEl.checked = true;
    if (b1LabelEl) b1LabelEl.value = 'Download MultiRoblox';
    if (b1UrlEl) b1UrlEl.value = 'https://github.com/phwyverysad/Roblox-Account-Manager';
    if (b2EnabledEl) b2EnabledEl.checked = false;
    toast('นำเข้าพรีเซ็ต: สายฟาร์ม (Farming)', 'ok');
  } else if (preset === 'gaming') {
    if (detailsEl) detailsEl.value = 'Playing {game}';
    if (stateEl) stateEl.value = 'Account: {user}';
    if (b1EnabledEl) b1EnabledEl.checked = true;
    if (b1LabelEl) b1LabelEl.value = 'Join Game';
    if (b1UrlEl) b1UrlEl.value = 'https://www.roblox.com';
    if (b2EnabledEl) b2EnabledEl.checked = false;
    toast('นำเข้าพรีเซ็ต: สายเกมเมอร์ (Gaming)', 'ok');
  } else if (preset === 'minimal') {
    if (detailsEl) detailsEl.value = 'MultiRoblox Manager';
    if (stateEl) stateEl.value = 'Managing {total} accounts';
    if (b1EnabledEl) b1EnabledEl.checked = false;
    if (b2EnabledEl) b2EnabledEl.checked = false;
    toast('นำเข้าพรีเซ็ต: สายมินิมอล (Minimal)', 'ok');
  } else if (preset === 'custom') {
    toast('โหมดกำหนดเอง: พิมพ์ข้อความและแท็กได้อิสระ', 'info');
  }

  updateDiscordPreview();
  saveDiscordRpcSettingsDebounced();
};

window.insertDiscordTag = function(tag) {
  const target = _lastFocusedDiscordInput || document.getElementById('setting-discord-rpc-details');
  if (!target) return;
  const start = target.selectionStart || target.value.length;
  const end = target.selectionEnd || target.value.length;
  const val = target.value;
  target.value = val.substring(0, start) + tag + val.substring(end);
  target.focus();
  target.selectionStart = target.selectionEnd = start + tag.length;
  updateDiscordPreview();
  saveDiscordRpcSettingsDebounced();
};

window.saveDiscordRpcSettingsNow = async function(isSilent = false) {
  try {
    const tsMode = document.getElementById('setting-discord-rpc-timestamp')?.dataset.value || 'app';
    const payload = {
      enabled: !!document.getElementById('setting-discord-rpc-enabled')?.checked,
      onlyWhenRunning: !!document.getElementById('setting-discord-rpc-only-running')?.checked,
      details: document.getElementById('setting-discord-rpc-details')?.value || '',
      state: document.getElementById('setting-discord-rpc-state')?.value || '',
      timestampMode: tsMode,
      largeText: document.getElementById('setting-discord-rpc-large-text')?.value || '',
      smallText: document.getElementById('setting-discord-rpc-small-text')?.value || '',
      button1Enabled: !!document.getElementById('setting-discord-rpc-b1-enabled')?.checked,
      button1Label: document.getElementById('setting-discord-rpc-b1-label')?.value || '',
      button1Url: document.getElementById('setting-discord-rpc-b1-url')?.value || '',
      button2Enabled: !!document.getElementById('setting-discord-rpc-b2-enabled')?.checked,
      button2Label: document.getElementById('setting-discord-rpc-b2-label')?.value || '',
      button2Url: document.getElementById('setting-discord-rpc-b2-url')?.value || '',
      hideUsernames: !!document.getElementById('setting-discord-rpc-hide-user')?.checked,
      hideGameDetails: !!document.getElementById('setting-discord-rpc-hide-game')?.checked,
      customClientId: document.getElementById('setting-discord-rpc-client-id')?.value || ''
    };

    await api.saveDiscordRpcSettings(payload);
    updateDiscordRpcStatusBadge();
    if (!isSilent) toast('บันทึกการตั้งค่า Discord RPC เรียบร้อยแล้ว', 'ok');
  } catch (e) {
    if (!isSilent) toast('บันทึกการตั้งค่าไม่สำเร็จ: ' + (e.message || e), 'err');
  }
};

window.testDiscordRpcNow = async function() {
  try {
    toast('กำลังทดสอบส่ง Presence ไปยัง Discord...', 'info');
    await saveDiscordRpcSettingsNow(true);
    const res = await api.testDiscordRpc();
    updateDiscordRpcStatusBadge();
    if (res && res.connected) {
      toast('เชื่อมต่อและส่งสถานะไปยัง Discord สำเร็จแล้ว!', 'ok');
    } else {
      toast('ส่งคำขอแล้ว (หากยังไม่แสดงผล กรุณาเปิดแอป Discord Desktop)', 'info');
    }
  } catch (e) {
    toast('เกิดข้อผิดพลาดในการทดสอบ: ' + (e.message || e), 'err');
  }
};

window.onDiscordRpcToggle = async function(checked) {
  try {
    await api.setDiscordRpc(checked);
    updateDiscordRpcStatusBadge();
    toast(checked ? 'เปิดใช้งาน Discord Rich Presence แล้ว' : 'ปิดใช้งาน Discord Rich Presence แล้ว', checked ? 'ok' : 'err');
  } catch (e) {
    toast('เกิดข้อผิดพลาด: ' + (e.message || e), 'err');
  }
};

