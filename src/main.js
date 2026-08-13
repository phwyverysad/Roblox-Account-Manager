const { app, BrowserWindow, BrowserView, Menu, MenuItem, ipcMain, shell, net, session, safeStorage } = require('electron');

const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';
app.commandLine.appendSwitch('user-agent', CHROME_UA);
app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled');
app.commandLine.appendArgument('--no-sandbox');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const { spawn } = require('child_process');
const os = require('os');

process.on('uncaughtException', (err) => { console.error('Uncaught:', err); });
process.on('unhandledRejection', (reason) => { console.error('Unhandled rejection:', reason); });

let _mutexProc = null;
let _antiAfkProc = null;
const _accountPids = new Map(); // accountId -> pid of the RobloxPlayerBeta process we spawned for it

// ── Native helper (AntiAFKNative.exe) ───────────────────────────────────────
// C++ helper compiled from src/AntiAFKNative.cpp replacing RobloxNative.cs.
let _nativeHelperPromise = null;
let _fpsCapProc = null;

function nativeSrcPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'AntiAFKNative.cpp')
    : path.join(__dirname, 'AntiAFKNative.cpp');
}
function bundledNativeExePath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'AntiAFKNative.exe')
    : path.join(__dirname, 'AntiAFKNative.exe');
}

function ensureNativeHelper() {
  if (process.platform !== 'win32') return Promise.resolve(null);
  if (_nativeHelperPromise) return _nativeHelperPromise;
  _nativeHelperPromise = (async () => {
    try { const b = bundledNativeExePath(); if (fs.existsSync(b)) return b; } catch {}
    const src = nativeSrcPath();
    try { if (!fs.existsSync(src)) return null; } catch { return null; }
    const outExe = path.join(app.getPath('userData'), 'AntiAFKNative.exe');
    try {
      if (fs.existsSync(outExe) && fs.statSync(outExe).mtimeMs >= fs.statSync(src).mtimeMs) return outExe;
    } catch {}
    return null;
  })();
  return _nativeHelperPromise;
}

function isMultiInstanceEnabled() {
  return !!(loadSettings().multiInstance);
}

let _mutexReady = false;
let _mutexReadyPromise = null;

async function startMutexHolder() {
  if (_mutexProc) return _mutexReadyPromise || Promise.resolve();
  const nativeExe = await ensureNativeHelper();
  _mutexReadyPromise = new Promise((resolve) => {
    try {
      if (!nativeExe) { console.error('[mutex] native helper unavailable'); resolve(); return; }
      _mutexProc = spawn(nativeExe, ['mutex'], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
      _mutexProc.stdout.on('data', (data) => {
        if (data.toString().includes('MUTEX_HELD')) {
          _mutexReady = true;
          resolve();
        }
      });
      if (_mutexProc.stderr) _mutexProc.stderr.on('data', d => { const s = d.toString().trim(); if (s) console.error('[mutex]', s); });
      // Safety fallback only. The holder prints MUTEX_HELD right after it grabs
      // the mutex (before the slow handle scan), so this should normally never
      // win the race. Kept generous so a slow cold start can't resolve readiness
      // before the mutex is actually held.
      setTimeout(resolve, 8000);
      _mutexProc.on('exit', () => { _mutexProc = null; _mutexReady = false; });
      _mutexProc.on('error', () => { _mutexProc = null; _mutexReady = false; resolve(); });
    } catch (e) {
      _mutexProc = null;
      resolve();
    }
  });
  return _mutexReadyPromise;
}

function stopMutexHolder() {
  if (!_mutexProc) return;
  try { _mutexProc.kill(); } catch {}
  _mutexProc = null;
}

// ── Anti-AFK holder ─────────────────────────────────────────────────────────
// Runs the native helper's `antiafk` loop, which taps a benign key into every
// running Roblox window on an interval so the ~20-minute idle kick never fires.
// Requires the native exe (Windows). No-op elsewhere or if the helper is
// unavailable. intervalSec defaults to 10 min; kept under the 20-min threshold.
async function startAntiAfk() {
  if (process.platform !== 'win32') return;
  if (_antiAfkProc) return;
  const nativeExe = await ensureNativeHelper();
  if (!nativeExe) { console.error('[antiafk] ไม่มี native helper; ไม่สามารถรันกัน AFK ได้'); return; }
  const s = loadSettings();
  let deadline = parseInt(s.antiAfkInterval, 10);
  if (!Number.isFinite(deadline) || deadline < 30) deadline = 180; // 3 min fail-safe cycle
  let vk = parseInt(s.antiAfkVk, 10) || 16;
  let safeMode = parseInt(s.userSafeMode, 10) || 0;
  let actionType = parseInt(s.antiAfkAction, 10) || 0;

  try {
    _antiAfkProc = spawn(nativeExe, ['antiafk', String(deadline), String(vk), String(safeMode), String(actionType)], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    sendLog('ok', 'afk', `Anti-AFK started (interval: ${Math.round(deadline/60)} min)`, { intervalSec: deadline });
    if (_antiAfkProc.stdout) _antiAfkProc.stdout.on('data', d => {
      const lines = d.toString().trim().split('\n');
      for (const line of lines) {
        const t = line.trim(); if (!t) continue;
        const mw = t.match(/tapped\s+(\d+)\s+window/i);
        if (mw) sendLog('info', 'afk', `Anti-AFK: tapped ${mw[1]} Roblox window${mw[1]==='1'?'':'s'}`, { windows: parseInt(mw[1]) });
        else sendLog('info', 'afk', `Anti-AFK: ${t}`);
      }
    });
    if (_antiAfkProc.stderr) _antiAfkProc.stderr.on('data', d => {
      const t = d.toString().trim();
      if (t) { console.error('[antiafk]', t); sendLog('warn', 'afk', `Anti-AFK warning: ${t}`); }
    });
    _antiAfkProc.on('exit', (code) => { sendLog('warn', 'afk', `Anti-AFK process exited (code ${code})`); _antiAfkProc = null; stopFpsCap(); });
    _antiAfkProc.on('error', (e) => { sendLog('err', 'afk', `Anti-AFK process error: ${e.message}`); _antiAfkProc = null; stopFpsCap(); });
    
    // Spawn background FPS cap capper if configured
    if (s.fpsCapLimit > 0) {
      startFpsCap(s.fpsCapLimit);
    }
  } catch (e) { _antiAfkProc = null; console.error('[antiafk] เรียกโปรเซสไม่สำเร็จ:', e.message); }
}

function stopAntiAfk() {
  if (!_antiAfkProc) return;
  sendLog('warn', 'afk', 'Anti-AFK stopped');
  try { _antiAfkProc.kill(); } catch {}
  _antiAfkProc = null;
  stopFpsCap();
}

async function startFpsCap(targetFps) {
  if (process.platform !== 'win32') return;
  stopFpsCap();
  const fps = parseInt(targetFps, 10) || 0;
  if (fps <= 0) return;
  const nativeExe = await ensureNativeHelper();
  if (!nativeExe) return;
  try {
    _fpsCapProc = spawn(nativeExe, ['fpscap', String(fps)], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    _fpsCapProc.on('exit', () => { _fpsCapProc = null; });
  } catch {}
}

function stopFpsCap() {
  if (_fpsCapProc) {
    try { _fpsCapProc.kill(); } catch {}
    _fpsCapProc = null;
  }
}

// Fully re-squats the ROBLOX_singletonMutex / ROBLOX_singletonEvent pair
// instead of just confirming a holder is alive. Killing the old holder
// releases those kernel objects outright (Windows closes all of a process's
// handles when it dies), so the fresh one starts from a clean slate with no
// state left over from whatever session was running before.
//
// This is ONLY safe to call when we've just verified zero real Roblox
// processes are running -- see the big comment above _doLaunch for why
// respawning the holder while a real instance could be racing it is exactly
// what corrupts that instance's install pipeline. killAllRoblox is the one
// place that verification happens, which is why the restart lives there.
async function restartMutexHolder() {
  stopMutexHolder();
  await startMutexHolder();
}

// Polls tasklist until both RobloxPlayerBeta.exe and RobloxCrashHandler.exe
// are confirmed gone, or maxWaitMs elapses. taskkill returning just means the
// kill command was issued -- actual process teardown (and release of the
// handles/kernel objects those processes held) can lag a beat behind that.
// Treating "taskkill closed" as "fully gone" was the gap that let a relaunch
// race leftover state from the session that was just killed, which is what
// produced Roblox reinstalling itself and the new instances immediately
// glitching out.
function waitForRobloxFullyClosed(maxWaitMs = 5000) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const check = () => {
      let out = '';
      try {
        const proc = spawn('cmd', ['/c',
          'tasklist /FI "IMAGENAME eq RobloxPlayerBeta.exe" /NH & tasklist /FI "IMAGENAME eq RobloxCrashHandler.exe" /NH'
        ], { windowsHide: true });
        proc.stdout.on('data', d => { out += d.toString(); });
        proc.on('error', () => resolve());
        proc.on('close', () => {
          const stillRunning = /RobloxPlayerBeta\.exe|RobloxCrashHandler\.exe/i.test(out);
          if (!stillRunning || Date.now() - startedAt >= maxWaitMs) { resolve(); return; }
          setTimeout(check, 300);
        });
      } catch { resolve(); }
    };
    check();
  });
}

// ── Roblox session control (volume / kill / count) ──────────────────────────
// Applies an OS-level volume (0-100) to every running RobloxPlayerBeta session
// at once. Returns the number of sessions adjusted. No-op off Windows.
async function setRobloxVolume(percent) {
  if (process.platform !== 'win32') return { ok: false, count: 0, error: 'รองรับเฉพาะ Windows' };
  const pct = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
  const nativeExe = await ensureNativeHelper();
  return new Promise((resolve) => {
    let out = '';
    try {
      if (!nativeExe) { resolve({ ok: false, count: 0, error: 'ไม่มี native helper' }); return; }
      const proc = spawn(nativeExe, ['volume', String(pct)], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
      proc.stdout.on('data', d => { out += d.toString(); });
      if (proc.stderr) proc.stderr.on('data', d => { const s = d.toString().trim(); if (s) console.error('[volume]', s); });
      proc.on('error', () => resolve({ ok: false, count: 0, error: 'เรียกโปรเซสไม่สำเร็จ' }));
      proc.on('close', () => {
        const m = out.match(/SET:(\d+)/);
        resolve({ ok: true, count: m ? parseInt(m[1], 10) : 0 });
      });
      // safety timeout
      setTimeout(() => { try { proc.kill(); } catch {} resolve({ ok: true, count: 0 }); }, 12000);
    } catch (e) {
      resolve({ ok: false, count: 0, error: e.message });
    }
  });
}

// Count running Roblox clients (used to gate / inform the UI).
function countRobloxProcesses() {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') { resolve(0); return; }
    let out = '';
    try {
      const proc = spawn('cmd', ['/c', 'tasklist /FI "IMAGENAME eq RobloxPlayerBeta.exe" /NH'], { windowsHide: true });
      proc.stdout.on('data', d => { out += d.toString(); });
      proc.on('error', () => resolve(0));
      proc.on('close', () => {
        const matches = out.match(/RobloxPlayerBeta\.exe/gi);
        resolve(matches ? matches.length : 0);
      });
    } catch { resolve(0); }
  });
}

// Terminates every Roblox client. Clears all watchers and notifies the renderer
// so every account dot resets to "not launched".
function killAllRoblox() {
  return new Promise((resolve) => {
    // Stop watchers immediately and tell the UI which accounts went down.
    const watchedIds = Array.from(_watchedAccounts.keys());
    _watchedAccounts.clear();
    _missCounts.clear();
    _stopWatchPollIfIdle();

    const notify = () => {
      if (win && !win.isDestroyed()) {
        for (const id of watchedIds) win.webContents.send('roblox:closed', id);
        win.webContents.send('roblox:allClosed');
      }
    };

    if (process.platform !== 'win32') { notify(); resolve({ ok: false, error: 'รองรับเฉพาะ Windows' }); return; }

    try {
      const proc = spawn('cmd', ['/c',
        'taskkill /F /IM RobloxPlayerBeta.exe /T & taskkill /F /IM RobloxCrashHandler.exe /T'
      ], { windowsHide: true });
      _accountPids.clear();
      const hadRunning = watchedIds.length > 0;
      let settled = false;
      const finishUp = async () => {
        if (settled) return;
        settled = true;
        // Don't trust taskkill's return alone -- confirm the processes are
        // actually gone before doing anything else.
        await waitForRobloxFullyClosed();
        // We just verified there's no real Roblox process left to race, so
        // this is the one safe moment to fully refresh the mutex/event
        // holder instead of merely checking it's alive. That clears out any
        // stale singleton state tied to the session we just killed -- the
        // actual cause of relaunches right after "kill all" reinstalling
        // Roblox and then the new instances immediately glitching out.
        if (hadRunning) { try { await restartMutexHolder(); } catch {} }
        else { try { await startMutexHolder(); } catch {} }
        notify();
      };
      proc.on('error', () => { finishUp().then(() => resolve({ ok: false, error: 'ปิดโปรเซสไม่สำเร็จ' })); });
      proc.on('close', () => { finishUp().then(() => resolve({ ok: true })); });
      setTimeout(() => { finishUp().then(() => resolve({ ok: true })); }, 6000);
    } catch (e) {
      notify();
      resolve({ ok: false, error: e.message });
    }
  });
}

// Terminates just the Roblox instance launched for one account (by PID), and
// notifies the renderer so only that account's dot resets.
function killAccountRoblox(accountId) {
  return new Promise((resolve) => {
    const pid = _accountPids.get(accountId);
    if (pid) _positionedPids.delete(pid);
    _accountPids.delete(accountId);

    _watchedAccounts.delete(accountId);
    _missCounts.delete(accountId);
    _stopWatchPollIfIdle();

    const notify = () => { if (win && !win.isDestroyed()) win.webContents.send('roblox:closed', accountId); };

    if (process.platform !== 'win32') { notify(); resolve({ ok: false, error: 'รองรับเฉพาะ Windows' }); return; }
    if (!pid) { notify(); resolve({ ok: false, error: 'ไม่มีโปรเซสที่ติดตามสำหรับบัญชีนี้' }); return; }

    try {
      const proc = spawn('cmd', ['/c', `taskkill /F /PID ${pid} /T`], { windowsHide: true });
      proc.on('error', () => { notify(); resolve({ ok: false, error: 'ปิดโปรเซสไม่สำเร็จ' }); });
      proc.on('close', () => { notify(); resolve({ ok: true }); });
      setTimeout(() => { notify(); resolve({ ok: true }); }, 4000);
    } catch (e) {
      notify();
      resolve({ ok: false, error: e.message });
    }
  });
}


const settingsPath = path.join(app.getPath('userData'), 'settings.json');
function loadSettings() {
  try { if (!fs.existsSync(settingsPath)) return {}; return JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch { return {}; }
}
function saveSettings(s) { fs.writeFileSync(settingsPath, JSON.stringify(s, null, 2), { mode: 0o600 }); }

const SALT = 'multiroblox-v1-salt-2025';
const ITERATIONS = 210_000;
const KEY_LEN = 32;
const DIGEST = 'sha512';

// safeStorage encrypts with the OS keychain -- DPAPI on Windows, tied to the
// logged-in user account. Unlike the device-key path, no key is ever written to
// disk in plaintext, so this is the secure default when no passphrase is set.
function safeStorageReady() {
  try { return !!(safeStorage && safeStorage.isEncryptionAvailable()); } catch { return false; }
}

// Kept only so accounts encrypted by older builds (random key stored in
// settings.json) still decrypt. New writes never use this path.
function getOrCreateDeviceKey() {
  const s = loadSettings();
  if (s._deviceKey && s._deviceKey.length === 64) {
    return Buffer.from(s._deviceKey, 'hex');
  }
  const key = crypto.randomBytes(KEY_LEN);
  saveSettings({ ...s, _deviceKey: key.toString('hex') });
  return key;
}

// Passphrase key derivation.
// New writes use scrypt (memory-hard -> far stronger against GPU/ASIC cracking
// than PBKDF2). N=2^15 costs ~32MB and <100ms, derived once and cached, so there
// is no per-record or runtime cost. PBKDF2 is kept only to read data written by
// older builds (the gcm:/cbc: formats), which migrates forward on the next save.
const SCRYPT_PARAMS = { N: 65536, r: 8, p: 1, maxmem: 160 * 1024 * 1024 };
function deriveScryptKey(p) { return crypto.scryptSync(p, SALT, KEY_LEN, SCRYPT_PARAMS); }
function deriveLegacyKey(p) { return crypto.pbkdf2Sync(p, SALT, ITERATIONS, KEY_LEN, DIGEST); }

let _cachedKey = null, _cachedLegacyKey = null, _sessionPass = null;

// ---- Per-boot key session ----------------------------------------------------
// Passphrase mode stores only a verifier in settings (never a usable key). The
// unlocked passphrase is cached for the current OS boot session in a keychain-
// wrapped file tagged with the boot id, so the app remembers it across app
// restarts but forgets it after the computer reboots, prompting again next launch.
const sessionPath = path.join(app.getPath('userData'), '.keysession');
const VERIFY_TOKEN = 'multiroblox-verify-v1';
function bootId() { return Math.round(Date.now() / 1000 - os.uptime()); }
function passphraseMode() {
  const s = loadSettings();
  return !!(s.keyVerifier || s.customKeyEnc || (s.customKey && s.customKey.trim()));
}
function makeVerifier(pass) { return encryptGCM(VERIFY_TOKEN, deriveScryptKey(pass), 'gs'); }
function verifyPass(pass) {
  try {
    const v = loadSettings().keyVerifier;
    return !!v && decryptGCM(v, deriveScryptKey(pass), 'gs') === VERIFY_TOKEN;
  } catch { return false; }
}
function writeSessionKey(pass, remember = false) {
  if (!remember) {
    clearSessionKey();
    return;
  }
  try {
    if (safeStorageReady()) {
      const encrypted = safeStorage.encryptString(pass);
      fs.writeFileSync(sessionPath, encrypted);
    }
  } catch (e) {
    console.error('Failed to write session key:', e.message);
  }
}
function readSessionKey() {
  try {
    if (fs.existsSync(sessionPath) && safeStorageReady()) {
      const encrypted = fs.readFileSync(sessionPath);
      return safeStorage.decryptString(encrypted);
    }
  } catch (e) {
    console.error('Failed to read session key:', e.message);
  }
  return null;
}
function clearSessionKey() { try { if (fs.existsSync(sessionPath)) fs.unlinkSync(sessionPath); } catch {} }

// Runs once at startup: migrate older key formats to the verifier model, then try
// to restore the key from this boot's session cache (silent unlock).
function initEncryption() {
  try {
    const s = loadSettings();
    if (!s.keyVerifier) {
      let legacy = null;
      if (s.customKeyEnc && safeStorageReady()) { try { legacy = safeStorage.decryptString(Buffer.from(s.customKeyEnc, 'base64')); } catch {} }
      if (!legacy && s.customKey && s.customKey.trim()) legacy = s.customKey.trim();
      if (legacy) {
        const { customKey, customKeyEnc, ...rest } = s;
        saveSettings({ ...rest, keyVerifier: makeVerifier(legacy) });
        _sessionPass = legacy; writeSessionKey(legacy); // unlocked this boot; prompt after reboot
        return;
      }
    }
    if (passphraseMode()) {
      const cached = readSessionKey();
      if (cached && verifyPass(cached)) _sessionPass = cached;
    }
  } catch {}
}
function getStoredPassphrase() { return _sessionPass; }

// Primary key: scrypt-derived passphrase key (when unlocked), or the OS/device
// key in machine-bound mode. Returns null when passphrase mode is locked.
function getEncryptionKey() {
  if (_cachedKey) return _cachedKey;
  if (_sessionPass) { _cachedKey = deriveScryptKey(_sessionPass); return _cachedKey; }
  if (!passphraseMode()) { _cachedKey = getOrCreateDeviceKey(); return _cachedKey; }
  return null; // locked
}
// Legacy PBKDF2 key, derived lazily only when an old gcm:/cbc: record is read.
function getLegacyKey() {
  if (_cachedLegacyKey) return _cachedLegacyKey;
  if (_sessionPass) { _cachedLegacyKey = deriveLegacyKey(_sessionPass); return _cachedLegacyKey; }
  if (!passphraseMode()) { _cachedLegacyKey = getOrCreateDeviceKey(); return _cachedLegacyKey; }
  return null; // locked
}
function invalidateKeyCache() { _cachedKey = null; _cachedLegacyKey = null; }

// Pre-derive the unlocked passphrase key off the main thread so the first decrypt
// hits the cache instead of blocking on a ~340ms derive. No-op when locked or
// machine-bound.
function prewarmKey() {
  try {
    if (_cachedKey || !_sessionPass) return;
    crypto.scrypt(_sessionPass, SALT, KEY_LEN, SCRYPT_PARAMS, (err, dk) => {
      if (!err && dk && !_cachedKey) _cachedKey = dk;
    });
  } catch {}
}

// AES-256-GCM. `tag` carries the prefix so the reader knows which KDF produced
// the key: gs: = scrypt (current), gcm: = legacy PBKDF2.
function encryptGCM(p, k, tag) {
  const iv = crypto.randomBytes(12), c = crypto.createCipheriv('aes-256-gcm', k, iv);
  const enc = Buffer.concat([c.update(p, 'utf8'), c.final()]);
  return tag + ':' + [iv.toString('base64'), c.getAuthTag().toString('base64'), enc.toString('base64')].join(':');
}
function decryptGCM(ct, k, tag) {
  const s = ct.replace(new RegExp('^' + tag + ':'), '').split(':'); if (s.length < 3) return null;
  const iv = Buffer.from(s[0], 'base64'), at = Buffer.from(s[1], 'base64'), data = Buffer.from(s[2], 'base64');
  const d = crypto.createDecipheriv('aes-256-gcm', k, iv); d.setAuthTag(at);
  return d.update(data, undefined, 'utf8') + d.final('utf8');
}

// Legacy CBC reader -- unauthenticated, no longer produced. Kept so existing
// cbc: values from older builds still decrypt and migrate forward on next save.
function decryptCBC(ct, k) {
  const s = ct.replace(/^cbc:/, '').split(':'); if (s.length < 2) return null;
  const iv = Buffer.from(s[0], 'base64'), data = Buffer.from(s[1], 'base64');
  const d = crypto.createDecipheriv('aes-256-cbc', k, iv);
  return d.update(data, undefined, 'utf8') + d.final('utf8');
}

function encryptField(p) {
  if (_sessionPass) return encryptGCM(p, getEncryptionKey(), 'gs'); // unlocked passphrase
  if (passphraseMode()) throw new Error('locked'); // never write with the wrong key
  if (safeStorageReady()) return 'safe:' + safeStorage.encryptString(p).toString('base64');
  return encryptGCM(p, getEncryptionKey(), 'gs'); // machine-bound, no keychain
}
function decryptField(ct) {
  try {
    if (!ct) return null;
    if (ct.startsWith('safe:')) {
      if (!safeStorageReady()) return null;
      return safeStorage.decryptString(Buffer.from(ct.slice(5), 'base64'));
    }
    if (ct.startsWith('gs:')) return decryptGCM(ct, getEncryptionKey(), 'gs');
    if (ct.startsWith('gcm:')) return decryptGCM(ct, getLegacyKey(), 'gcm');
    if (ct.startsWith('cbc:')) return decryptCBC(ct, getLegacyKey());
    return ct;
  } catch { return null; }
}

function isEncrypted(v) {
  return typeof v === 'string' && (v.startsWith('safe:') || v.startsWith('gs:') || v.startsWith('gcm:') || v.startsWith('cbc:'));
}
function encryptAccount(a) {
  const o = { ...a };
  if (o.cookie && !isEncrypted(o.cookie)) o.cookie = encryptField(o.cookie);
  o._enc = true;
  return o;
}
function decryptAccount(a) {
  const o = { ...a };
  if (o.cookie) o.cookie = decryptField(o.cookie) ?? '';
  return o;
}

const dataPath = path.join(app.getPath('userData'), 'accounts.json');
function loadAccounts() {
  try { if (!fs.existsSync(dataPath)) return []; return JSON.parse(fs.readFileSync(dataPath, 'utf8')).map(decryptAccount); } catch { return []; }
}
function saveAccounts(a) { fs.writeFileSync(dataPath, JSON.stringify(a.map(encryptAccount), null, 2), { mode: 0o600 }); }

// One-time, best-effort upgrade: re-encrypt any legacy device-key (gcm:) or
// unauthenticated (cbc:) cookies to OS-keychain storage (safe:). Only runs when
// no passphrase is set and the keychain is available. Aborts untouched if any
// non-empty cookie fails to decrypt, so a bad read can never wipe data.
function migrateAccountEncryptionToKeychain() {
  try {
    if (passphraseMode()) return; // passphrase user: never touch (avoids wrong-key writes)
    if (!safeStorageReady()) return;
    if (!fs.existsSync(dataPath)) return;
    const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const needs = raw.some(a => a.cookie && (a.cookie.startsWith('gcm:') || a.cookie.startsWith('cbc:')));
    if (!needs) return;
    const plain = raw.map(decryptAccount);
    // Safety: if anything that had a cookie now reads empty, decryption failed.
    for (let i = 0; i < raw.length; i++) {
      if (raw[i].cookie && !plain[i].cookie) { console.error('[migrate] ถอดรหัสไม่สำเร็จ; จะไม่เปลี่ยนแปลงบัญชี'); return; }
    }
    saveAccounts(plain); // re-encrypts via encryptField -> safe:
    console.log('[migrate] upgraded account encryption to OS keychain');
  } catch (e) { console.error('[migrate] skipped:', e.message); }
}

// Packages: named groups of accounts that can be launched together with a
// single shared join-link. No secrets live here -- just names, account-id
// references, and the last-used link -- so no encryption is needed.
const packagesPath = path.join(app.getPath('userData'), 'packages.json');
function loadPackages() {
  try { if (!fs.existsSync(packagesPath)) return []; return JSON.parse(fs.readFileSync(packagesPath, 'utf8')); } catch { return []; }
}
function savePackages(p) { fs.writeFileSync(packagesPath, JSON.stringify(p, null, 2), { mode: 0o600 }); }

let win;

// ── Logging ───────────────────────────────────────────────────────────────
function sendLog(level, category, message, meta) {
  try {
    if (win && !win.isDestroyed())
      win.webContents.send('log:entry', { ts: Date.now(), level, category, message, meta: meta || {} });
  } catch {}
}

function createWindow() {
  win = new BrowserWindow({
    width: 980, height: 760, minWidth: 945, minHeight: 755,
    frame: false, backgroundColor: '#0e0e10',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false, backgroundThrottling: true, webviewTag: true },
    show: false,
  });
  win.loadFile(path.join(__dirname, 'index.html'));
  win.once('ready-to-show', () => win.show());
}
app.whenReady().then(async () => {
  if (process.platform === 'win32') app.setAppUserModelId('com.multiroblox.app');
  initEncryption(); // migrate key formats + restore this boot's session key (silent unlock)
  prewarmKey(); // non-blocking; derives the passphrase key off the main thread
  // Upgrade any legacy-encrypted accounts to OS-keychain storage (no-op if none).
  migrateAccountEncryptionToKeychain();
  startSysInfo();
  // Paint the UI immediately. The native-helper compile (first run only) and the
  // mutex grab used to block here, leaving the window hidden for seconds on a
  // cold start. The launch path independently awaits startMutexHolder() before
  // every launch, so the mutex is still guaranteed held before any instance is
  // launched -- moving window creation ahead of this removes startup latency
  // without ever letting a launch race an unheld mutex.
  createWindow();
  // Build/resolve the native helper once up front (compiles only if no prebuilt
  // exe shipped), then hold the mutex. startMutexHolder reuses the same memoized
  // result, so a launch fired before this resolves simply awaits the same promise.
  if (process.platform === 'win32') { await ensureNativeHelper(); await startMutexHolder(); }
  if (loadSettings().antiAfk) startAntiAfk();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('will-quit', () => { stopMutexHolder(); stopAntiAfk(); });

ipcMain.on('window-minimize', () => win.minimize());
ipcMain.on('window-maximize', () => win.isMaximized() ? win.unmaximize() : win.maximize());
ipcMain.on('window-close', () => win.close());
ipcMain.on('open-external', (_, url) => shell.openExternal(url));

// ---- Roblox Home Session & Webview IPC ----
let currentHomeAccountId = null;
let homeSession = null;

function getHomeSession() {
  if (!homeSession) {
    homeSession = session.fromPartition('persist:roblox-home', { cache: true });
    try {
      homeSession.webRequest.onBeforeSendHeaders((details, callback) => {
        details.requestHeaders['User-Agent'] = CHROME_UA;
        details.requestHeaders['sec-ch-ua'] = '"Google Chrome";v="136", "Chromium";v="136", "Not?A_Brand";v="24"';
        details.requestHeaders['sec-ch-ua-mobile'] = '?0';
        details.requestHeaders['sec-ch-ua-platform'] = '"Windows"';
        delete details.requestHeaders['X-Electron'];
        callback({ cancel: false, requestHeaders: details.requestHeaders });
      });
    } catch (e) {}

    // Auto Cookie Sync Listener
    homeSession.cookies.on('changed', (event, cookie, cause, removed) => {
      if (removed || !cookie || cookie.name !== '.ROBLOSECURITY') return;
      if (!cookie.domain || !cookie.domain.includes('roblox.com')) return;
      if (!currentHomeAccountId) return;

      const newCookie = cookie.value;
      if (!newCookie || !newCookie.trim()) return;

      const accounts = loadAccounts();
      const idx = accounts.findIndex(a => a.id === currentHomeAccountId);
      if (idx !== -1 && accounts[idx].cookie !== newCookie) {
        accounts[idx].cookie = newCookie;
        saveAccounts(accounts);
        sendLog('ok', 'cookie', `Auto-synced updated Roblox cookie for ${accounts[idx].username || currentHomeAccountId}`, { accountId: currentHomeAccountId });
        if (win && !win.isDestroyed()) {
          win.webContents.send('accounts:updated', accounts[idx]);
        }
      }
    });
  }
  return homeSession;
}

ipcMain.handle('home:prepare-session', async (_, accountId) => {
  const accountsList = loadAccounts();
  const acct = accountsList.find(a => a.id === accountId);
  if (!acct || !acct.cookie) return { ok: false, error: 'ไม่พบคุกกี้บัญชี' };

  currentHomeAccountId = accountId;
  const ses = getHomeSession();

  try {
    await ses.clearStorageData({ storages: ['cookies', 'localstorage', 'sessionstorage', 'indexdb'] });
    await ses.cookies.set({
      url: 'https://www.roblox.com',
      name: '.ROBLOSECURITY',
      value: acct.cookie.trim(),
      domain: '.roblox.com',
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'no_restriction'
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

let homeView = null;
ipcMain.handle('home:open', async (_, accountId, bounds) => {
  return { ok: true };
});

ipcMain.handle('home:hide', async () => {
  return { ok: true };
});

ipcMain.handle('home:resize', async (_, bounds) => {
  return { ok: true };
});

ipcMain.handle('home:go-back', async () => {
  return { ok: true };
});

ipcMain.handle('home:go-forward', async () => {
  return { ok: true };
});

ipcMain.handle('home:reload', async () => {
  return { ok: true };
});

let homeAccountPopupWin = null;

ipcMain.on('home:account-selected-from-popup', (_, accountId) => {
  if (homeAccountPopupWin && !homeAccountPopupWin.isDestroyed()) {
    homeAccountPopupWin.close();
    homeAccountPopupWin = null;
  }
  if (win && !win.isDestroyed()) {
    win.webContents.send('home:account-selected', accountId);
  }
});

ipcMain.handle('home:open-account-popup', async (_, data) => {
  if (!win) return { ok: false };
  if (homeAccountPopupWin && !homeAccountPopupWin.isDestroyed()) {
    homeAccountPopupWin.close();
    homeAccountPopupWin = null;
    return { ok: true };
  }

  const { x, y, width, accounts: accountsData, currentId } = data || {};
  const fallbackAccounts = loadAccounts();
  const accountsList = (accountsData && accountsData.length > 0) ? accountsData : fallbackAccounts.map(a => ({
    id: a.id,
    nickname: a.nickname || a.username || ('Account #' + a.id),
    username: a.username ? `@${a.username}` : '',
    avatarUrl: null
  }));

  if (!accountsList || accountsList.length === 0) return { ok: false };

  const windowContentBounds = win.getContentBounds();
  const posX = Math.round(windowContentBounds.x + x);
  const posY = Math.round(windowContentBounds.y + y);
  const popupWidth = Math.max(250, Math.round(width || 250));
  const popupHeight = Math.min(320, accountsList.length * 44 + 18);

  homeAccountPopupWin = new BrowserWindow({
    width: popupWidth,
    height: popupHeight,
    x: posX,
    y: posY,
    parent: win,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const optionsHtml = accountsList.map(a => {
    const isSelected = String(a.id) === String(currentId || currentHomeAccountId);
    const nickname = (a.nickname || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const usernameTag = a.username ? a.username.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';

    const avatarTag = a.avatarUrl
      ? `<img src="${a.avatarUrl}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0;" />`
      : `<div style="width:24px;height:24px;border-radius:50%;background:#2e2e38;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#656575;font-size:12px;">👤</div>`;

    return `
      <div class="cdd-option ${isSelected ? 'selected' : ''}" onclick="window.api.selectHomeAccountFromPopup('${a.id}')">
        ${avatarTag}
        <div class="cdd-opt-left">
          <div class="cdd-opt-name">${nickname}</div>
          ${usernameTag ? `<div class="cdd-opt-desc">${usernameTag}</div>` : ''}
        </div>
        <div class="cdd-check">✓</div>
      </div>
    `;
  }).join('');

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  :root {
    --bg: #0e0e10;
    --s1: #141418;
    --s2: #1c1c22;
    --s3: #24242c;
    --s4: #2e2e38;
    --bd: rgba(255, 255, 255, 0.08);
    --bd2: rgba(255, 255, 255, 0.16);
    --t1: #f0f0f5;
    --t2: #a0a0b0;
    --t3: #656575;
    --ac: #6366f1;
    --ac2: rgba(99, 102, 241, 0.18);
    --r2: 8px;
    --font-ui: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 2px;
    background: transparent;
    font-family: var(--font-ui);
    user-select: none;
    overflow: hidden;
  }
  .cdd-menu {
    background: var(--s2);
    border: 1px solid var(--bd2);
    border-radius: var(--r2);
    overflow: hidden;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.85);
    max-height: ${popupHeight - 4}px;
    overflow-y: auto;
  }
  .cdd-menu::-webkit-scrollbar { width: 4px; }
  .cdd-menu::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
  .cdd-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background 0.15s ease;
    border-bottom: 1px solid var(--bd);
  }
  .cdd-option:last-child { border-bottom: none; }
  .cdd-option:hover { background: var(--s3); }
  .cdd-option.selected { background: var(--ac2); }
  .cdd-opt-left { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .cdd-opt-name { font-size: 12px; font-weight: 600; color: var(--t1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cdd-opt-desc { font-size: 10px; color: var(--t3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cdd-option.selected .cdd-opt-name { color: var(--t1); }
  .cdd-check { font-size: 14px; font-weight: bold; color: var(--ac); flex-shrink: 0; opacity: 0; }
  .cdd-option.selected .cdd-check { opacity: 1; }
</style>
</head>
<body>
  <div class="cdd-menu">
    ${optionsHtml}
  </div>
</body>
</html>`;

  homeAccountPopupWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(fullHtml));

  homeAccountPopupWin.once('ready-to-show', () => {
    if (homeAccountPopupWin && !homeAccountPopupWin.isDestroyed()) {
      homeAccountPopupWin.show();
    }
  });

  homeAccountPopupWin.on('blur', () => {
    if (homeAccountPopupWin && !homeAccountPopupWin.isDestroyed()) {
      homeAccountPopupWin.close();
      homeAccountPopupWin = null;
    }
  });

  return { ok: true };
});

// ---- Encryption unlock IPC ----
ipcMain.handle('enc:status', () => {
  if (!passphraseMode()) {
    return { mode: 'unlocked' };
  }
  return { mode: _sessionPass ? 'unlocked' : 'locked' };
});
ipcMain.handle('enc:unlock', (_, pass, remember) => {
  if (!pass || !verifyPass(pass)) return { ok: false };
  _sessionPass = pass; invalidateKeyCache(); writeSessionKey(pass, remember);
  return { ok: true };
});
// Set, change, or clear the passphrase. Re-encrypts existing accounts with the
// new key in one step. Empty pass -> machine-bound mode.
ipcMain.handle('enc:setKey', (_, pass, remember) => {
  try {
    const np = (pass || '').trim();
    // Decrypt with the CURRENT key while we still can. Abort if any account that
    // had a stored cookie now reads empty (failed decrypt) so we never re-encrypt
    // garbage and lose data.
    const raw = fs.existsSync(dataPath) ? JSON.parse(fs.readFileSync(dataPath, 'utf8')) : [];
    const accts = raw.map(decryptAccount);
    for (let i = 0; i < raw.length; i++) {
      if (raw[i].cookie && !accts[i].cookie) return { ok: false, error: 'ถอดรหัสไม่สำเร็จ' };
    }
    if (np) {
      _sessionPass = np; invalidateKeyCache();
      const { customKey, customKeyEnc, ...rest } = loadSettings();
      saveSettings({ ...rest, keyVerifier: makeVerifier(np), encSetupDone: true });
      const shouldRemember = (remember !== undefined) ? remember : fs.existsSync(sessionPath);
      writeSessionKey(np, shouldRemember);
    } else {
      _sessionPass = null; invalidateKeyCache();
      const { customKey, customKeyEnc, keyVerifier, ...rest } = loadSettings();
      saveSettings({ ...rest, encSetupDone: true });
      clearSessionKey();
    }
    invalidateKeyCache();
    saveAccounts(accts); // re-encrypt with the new key (or machine-bound)
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('settings:load', () => {
  const s = loadSettings();
  const { customKeyEnc, customKey, keyVerifier, _deviceKey, ...rest } = s;
  let autoBoot = false;
  try { autoBoot = app.getLoginItemSettings().openAtLogin; } catch {}
  return { ...rest, autoLaunchOnBoot: autoBoot, language: rest.language || 'th', keySet: passphraseMode() };
});
ipcMain.handle('settings:save', (_, data) => {
  const { customKey, customKeyEnc, keyVerifier, ...rest } = data;
  saveSettings({ ...loadSettings(), ...rest });
  if ('encryptionType' in data) invalidateKeyCache();
  if ('multiInstance' in data) {
    if (data.multiInstance) startMutexHolder();
    else stopMutexHolder();
  }
  if ('autoLaunchOnBoot' in data) {
    try {
      app.setLoginItemSettings({ openAtLogin: !!data.autoLaunchOnBoot, path: process.execPath });
    } catch {}
  }
  if ('antiAfk' in data || 'autoStartAfk' in data) {
    const s = loadSettings();
    if (s.antiAfk || s.autoStartAfk) startAntiAfk();
    else stopAntiAfk();
  } else if ('antiAfkInterval' in data && _antiAfkProc) {
    stopAntiAfk(); startAntiAfk();
  }
  if ('fpsCapLimit' in data && _antiAfkProc) {
    const s = loadSettings();
    if (s.fpsCapLimit > 0) startFpsCap(s.fpsCapLimit);
    else stopFpsCap();
  }
  if ('doNotSleep' in data) {
    const exe = bundledNativeExePath();
    if (exe && fs.existsSync(exe)) {
      spawn(exe, ['dosleep', data.doNotSleep ? '1' : '0'], { windowsHide: true });
    }
  }
  return true;
});
ipcMain.handle('multiinstance:status', () => ({ enabled: isMultiInstanceEnabled(), active: !!_mutexProc }));
ipcMain.handle('antiafk:status', () => ({ enabled: !!loadSettings().antiAfk, active: !!_antiAfkProc }));
ipcMain.handle('roblox:capture-position', async (_, accountId) => {
  if (process.platform !== 'win32') return null;
  const pid = _accountPids.get(accountId);
  if (!pid) return null;
  const nativeExe = await ensureNativeHelper();
  if (!nativeExe) return null;
  return new Promise((resolve) => {
    try {
      const proc = spawn(nativeExe, ['getpos', String(pid)], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
      let out = '';
      proc.stdout.on('data', d => { out += d; });
      proc.on('close', () => {
        const match = out.trim().match(/GETPOS_DONE:(-?\d+),(-?\d+),(\d+),(\d+)/);
        if (match) {
          resolve({
            x: parseInt(match[1], 10),
            y: parseInt(match[2], 10),
            width: parseInt(match[3], 10),
            height: parseInt(match[4], 10)
          });
        } else {
          resolve(null);
        }
      });
    } catch { resolve(null); }
  });
});
ipcMain.handle('screen:primary-workarea', () => {
  const { screen } = require('electron');
  const primary = screen.getPrimaryDisplay();
  return primary.workArea;
});
ipcMain.handle('roblox:snap-grid', async () => {
  if (process.platform !== 'win32') return { ok: false };
  const exe = await ensureNativeHelper();
  if (!exe || !fs.existsSync(exe)) return { ok: false };
  const accounts = loadAccounts();
  let snappedCount = 0;
  for (const [accountId, pid] of _accountPids.entries()) {
    const acct = accounts.find(a => a.id === accountId);
    if (!acct) continue;
    if (acct.windowX === undefined || acct.windowY === undefined || acct.windowX === '' || acct.windowY === '') continue;
    const x = parseInt(acct.windowX, 10);
    const y = parseInt(acct.windowY, 10);
    const w = parseInt(acct.windowWidth, 10) || 800;
    const h = parseInt(acct.windowHeight, 10) || 600;
    spawn(exe, ['move', String(pid), String(x), String(y), String(w), String(h)], { windowsHide: true });
    snappedCount++;
  }
  return { ok: true, count: snappedCount };
});

ipcMain.handle('accounts:load', () => loadAccounts());
ipcMain.handle('accounts:add', (_, account) => {
  const accounts = loadAccounts();
  const a = { id: Date.now().toString(), ...account, createdAt: new Date().toISOString(), lastUsed: null };
  accounts.push(a); saveAccounts(accounts); return a;
});
ipcMain.handle('accounts:remove', (_, id) => { saveAccounts(loadAccounts().filter(a => a.id !== id)); return true; });
ipcMain.handle('accounts:update', (_, id, data) => {
  const accounts = loadAccounts(), idx = accounts.findIndex(a => a.id === id);
  if (idx !== -1) { accounts[idx] = { ...accounts[idx], ...data }; saveAccounts(accounts); return accounts[idx]; }
  return null;
});
ipcMain.handle('accounts:reorder', (_, ids) => {
  const accounts = loadAccounts();
  const reordered = ids.map(id => accounts.find(a => a.id === id)).filter(Boolean);
  const rest = accounts.filter(a => !ids.includes(a.id));
  saveAccounts([...reordered, ...rest]);
  return true;
});

ipcMain.handle('packages:load', () => loadPackages());
ipcMain.handle('packages:save', (_, packages) => {
  try { savePackages(packages); return true; } catch (e) { return false; }
});

function fetchUserInfo(cookie) {
  return new Promise(async (resolve) => {
    // Helper: GET request via Electron net with cookie + proper headers
    const netGet = (url, extraHeaders = {}) => new Promise((res) => {
      const req = net.request({
        method: 'GET', url, useSessionCookies: false,
        headers: {
          'Cookie': `.ROBLOSECURITY=${cookie}`,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          ...extraHeaders
        }
      });
      let body = '';
      req.on('response', r => { r.on('data', c => body += c); r.on('end', () => res({ status: r.statusCode, body })); });
      req.on('error', e => res({ status: 0, body: '', error: e.message }));
      req.end();
    });

    // 1. Primary: /v1/users/authenticated
    try {
      const r = await netGet('https://users.roblox.com/v1/users/authenticated');
      const d = JSON.parse(r.body);
      if (d && d.id) {
        return resolve({ ok: true, username: d.name, userId: String(d.id), displayName: d.displayName });
      }
      console.warn('fetchUserInfo primary failed:', r.body.slice(0, 200));
    } catch (e) {
      console.warn('fetchUserInfo primary error:', e.message);
    }

    // 2. Fallback: /my/settings/json (works even for some moderated accounts)
    try {
      const r2 = await netGet('https://www.roblox.com/my/settings/json', {
        'Referer': 'https://www.roblox.com/',
        'X-Requested-With': 'XMLHttpRequest',
      });
      if (r2.body && r2.body.trim().startsWith('{')) {
        const d2 = JSON.parse(r2.body);
        if (d2 && d2.UserId && d2.Name) {
          return resolve({ ok: true, username: d2.Name, userId: String(d2.UserId) });
        }
      }
    } catch (e) {
      console.warn('fetchUserInfo fallback1 error:', e.message);
    }

    // 3. Fallback: /mobileapi/userinfo
    try {
      const r3 = await netGet('https://www.roblox.com/mobileapi/userinfo', {
        'Referer': 'https://www.roblox.com/',
      });
      if (r3.body && r3.body.trim().startsWith('{')) {
        const d3 = JSON.parse(r3.body);
        if (d3 && d3.UserID) {
          return resolve({ ok: true, username: d3.UserName || 'Unknown', userId: String(d3.UserID) });
        }
      }
    } catch (e) {
      console.warn('fetchUserInfo fallback2 error:', e.message);
    }

    // 4. Last resort: extract userId from the ROBLOSECURITY cookie JWT-like payload
    // Cookie format: _|WARNING:-DO-NOT-SHARE-THIS.<base64payload>.<signature>
    try {
      const parts = cookie.split('.');
      if (parts.length >= 2) {
        // Try to decode each part as base64 and look for userId
        for (let i = 0; i < Math.min(parts.length, 3); i++) {
          try {
            const decoded = Buffer.from(parts[i], 'base64').toString('utf8');
            const parsed = JSON.parse(decoded);
            if (parsed && (parsed.sub || parsed.userId || parsed.id)) {
              const userId = String(parsed.sub || parsed.userId || parsed.id);
              return resolve({ ok: true, username: 'User_' + userId, userId });
            }
          } catch {}
        }
      }
    } catch {}

    resolve({ ok: false, reason: 'ไม่สามารถยืนยันบัญชีได้ คุกกี้อาจหมดอายุหรือถูกยกเลิก' });
  });
}


function httpsGet(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', e => resolve({ status: 0, body: '', error: e.message }));
    req.setTimeout(5000, () => { req.destroy(); resolve({ status: 0, body: '', error: 'หมดเวลา' }); });
  });
}

function httpsPost(hostname, urlPath, headers, body) {
  return new Promise((resolve) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body)) : Buffer.alloc(0);
    const req = https.request({
      hostname, path: urlPath, method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Content-Length': bodyBuf.length,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', e => resolve({ status: 0, headers: {}, body: '', error: e.message }));
    if (bodyBuf.length) req.write(bodyBuf);
    req.end();
  });
}

const _csrfCache = new Map();
const CSRF_TTL = 5 * 60_000; // 5 min -- tokens stay valid much longer than 90s

const _ticketCache = new Map();
const TICKET_TTL     = 25_000;
const TICKET_MIN_GAP = 8_000;

// Serializing launch queue -- prevents concurrent launches from all hammering
// auth.roblox.com at once and triggering 429s.
let _launchQueue = Promise.resolve();
let _lastLaunchTs = 0;
const LAUNCH_STAGGER = 4_000; // 4s between launches

async function getCSRFToken(cookie) {
  const cached = _csrfCache.get(cookie);
  if (cached && Date.now() - cached.ts < CSRF_TTL) return cached.token;

  const cookieHeader = `.ROBLOSECURITY=${cookie}`;
  for (const endpoint of ['/v2/logout', '/v1/logout']) {
    try {
      const res = await httpsPost('auth.roblox.com', endpoint, { 'Cookie': cookieHeader }, null);
      const token = res.headers['x-csrf-token'];
      if (token) {
        _csrfCache.set(cookie, { token, ts: Date.now() });
        return token;
      }
    } catch {}
  }
  return null;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getAuthTicket(cookie, csrfToken) {
  const now = Date.now();
  const cached = _ticketCache.get(cookie);

  if (cached && (now - cached.ts) < TICKET_TTL) {
    return { ok: true, ticket: cached.ticket };
  }

  if (cached && (now - cached.ts) < TICKET_MIN_GAP) {
    await sleep(TICKET_MIN_GAP - (now - cached.ts));
  }

  const baseHeaders = {
    'Cookie': `.ROBLOSECURITY=${cookie}`,
    'Referer': 'https://www.roblox.com',
    'Origin': 'https://www.roblox.com',
  };

  let token = csrfToken;
  const delays = [0, 2000, 5000];

  for (let attempt = 0; attempt < 3; attempt++) {
    if (delays[attempt] > 0) await sleep(delays[attempt]);

    const res = await httpsPost('auth.roblox.com', '/v1/authentication-ticket', {
      ...baseHeaders,
      'X-CSRF-TOKEN': token,
    }, null);

    const ticket = res.headers['rbx-authentication-ticket'];
    if (ticket) {
      _ticketCache.set(cookie, { ticket, ts: Date.now() });
      return { ok: true, ticket };
    }

    if (res.status === 429) {
      _csrfCache.delete(cookie);
      const retryAfter = parseInt(res.headers['retry-after'] || '8', 10);
      await sleep(retryAfter * 1000);
      token = await getCSRFToken(cookie);
      if (!token) return { ok: false, error: 'Rate limited and could not refresh token. Wait a moment and try again.' };
      continue;
    }

    if (res.status === 403) {
      _csrfCache.delete(cookie);
      token = await getCSRFToken(cookie);
      if (!token) return { ok: false, error: 'ยืนยันตัวตนไม่สำเร็จ (403) คุกกี้อาจหมดอายุแล้ว' };
      continue;
    }

    return { ok: false, error: `ขอ auth ticket ไม่สำเร็จ (HTTP ${res.status}) กรุณาลองอีกครั้งในสักครู่` };
  }

  return { ok: false, error: 'ยังติด rate limit หลังพยายาม 3 ครั้ง กรุณารอ 30 วินาทีแล้วลองใหม่' };
}

async function getRobloxVersion() {
  try {
    const r = await httpsGet('https://clientsettingscdn.roblox.com/v2/client-version/WindowsPlayer');
    if (r.status === 200) {
      const d = JSON.parse(r.body);
      if (d && d.clientVersionUpload) return d.clientVersionUpload;
      if (d && d.version) return d.version;
    }
  } catch {}
  return null;
}

ipcMain.handle('roblox:getVersion', async () => {
  try { return await getRobloxVersion(); } catch { return null; }
});


ipcMain.handle('roblox:validateCookie', async (_, cookie) => {
  return await fetchUserInfo(cookie);
});

ipcMain.handle('roblox:setVolume', async (_, percent) => {
  try { return await setRobloxVolume(percent); } catch (e) { return { ok: false, count: 0, error: e.message }; }
});
ipcMain.handle('roblox:killAll', async () => {
  try {
    const killAllAccts = loadAccounts();
    const runningNames = Array.from(_watchedAccounts.keys()).map(id => { const a = killAllAccts.find(x => x.id === id); return a ? (a.username || id) : id; });
    sendLog('warn', 'kill', `ปิด Roblox ทั้งหมดแล้ว (${_watchedAccounts.size} ที่กำลังรัน: ${runningNames.join(', ') || 'ไม่มี'})`, { count: _watchedAccounts.size, accounts: runningNames });
    return await killAllRoblox();
  } catch (e) { return { ok: false, error: e.message }; }
});
ipcMain.handle('roblox:killOne', async (_, accountId) => {
  try {
    const killAccts = loadAccounts(); const killAcct = killAccts.find(a => a.id === accountId) || {};
    sendLog('warn', 'kill', `Killed Roblox instance for ${killAcct.username || accountId}`, { accountId, username: killAcct.username || null, userId: killAcct.userId || null, pid: _accountPids.get(accountId) || null });
    return await killAccountRoblox(accountId);
  } catch (e) { return { ok: false, error: e.message }; }
});
ipcMain.handle('roblox:runningCount', async () => {
  try { return await countRobloxProcesses(); } catch { return 0; }
});

let puppeteerBrowserPath = null;

async function ensureChrome() {
  try {
    // Prefer any Chromium browser already on the machine so we don't download a
    // separate ~150MB Chrome. Puppeteer drives all of these over CDP identically
    // (same stealth args, same cookie extraction) -- Edge ships on every Win10/11
    // box and is non-removable, so for almost every user the download never runs.
    // Order: Google Chrome first (most "vanilla" fingerprint), then Edge, Brave.
    const home = os.homedir();
    const PF = process.env['ProgramFiles'] || 'C:\\Program Files';
    const PF86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    const LOCAL = process.env['LOCALAPPDATA'] || path.join(home, 'AppData', 'Local');
    const systemChromePaths = [
      path.join(PF, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(PF86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(LOCAL, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(PF86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      path.join(PF, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      path.join(PF, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
      path.join(LOCAL, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
    ];
    for (const p of systemChromePaths) {
      if (fs.existsSync(p)) return p;
    }

    const pb = (() => { try { return require('@puppeteer/browsers'); } catch { return null; } })();
    if (!pb) return null;
    const { install, Browser, detectBrowserPlatform, getInstalledBrowsers } = pb;
    const browserDir = path.join(app.getPath('userData'), 'chrome-for-login');

    if (fs.existsSync(browserDir)) {
      const installed = await getInstalledBrowsers({ cacheDir: browserDir });
      const chrome = installed.find(b => b.browser === Browser.CHROME);
      if (chrome && fs.existsSync(chrome.executablePath)) {
        return chrome.executablePath;
      }
    }

    if (win && !win.isDestroyed()) {
      win.webContents.send('chrome:download-progress', { status: 'downloading', percent: 0 });
    }

    const platform = detectBrowserPlatform();

    const buildId = await new Promise((resolve, reject) => {
      const req = net.request('https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json');
      let body = '';
      req.on('response', res => {
        res.on('data', d => body += d);
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            resolve(json.channels.Stable.version);
          } catch (e) { reject(e); }
        });
      });
      req.on('error', reject);
      req.end();
    });

    const result = await install({
      browser: Browser.CHROME,
      buildId,
      cacheDir: browserDir,
      platform,
      downloadProgressCallback: (downloaded, total) => {
        if (win && !win.isDestroyed()) {
          win.webContents.send('chrome:download-progress', {
            status: 'downloading',
            percent: total > 0 ? Math.round((downloaded / total) * 100) : 0
          });
        }
      }
    });

    if (win && !win.isDestroyed()) {
      win.webContents.send('chrome:download-progress', { status: 'done' });
    }

    return result.executablePath;
  } catch (e) {
    console.error('ensureChrome error:', e.message);
    return null;
  }
}

let loginBrowserView = null;

ipcMain.handle('roblox:openLogin', async (_, bounds) => {
  return electronEmbeddedLogin(bounds);
});

ipcMain.handle('roblox:updateLoginBounds', (_, bounds) => {
  if (loginBrowserView && bounds && bounds.width > 0 && bounds.height > 0) {
    try {
      loginBrowserView.setBounds({
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height)
      });
    } catch (e) {}
  }
});

ipcMain.handle('roblox:hideLoginView', () => {
  hideLoginViewInternal();
});

function hideLoginViewInternal() {
  if (loginBrowserView && win && !win.isDestroyed()) {
    try {
      win.removeBrowserView(loginBrowserView);
      try { win.setBrowserView(null); } catch(ex){}
      loginBrowserView.webContents.destroy();
    } catch (e) {}
    loginBrowserView = null;
    
    // Ensure the main window retains focus so it doesn't minimize when the BrowserView is destroyed
    if (!win.isFocused()) {
      win.focus();
    }
  }
}

async function electronEmbeddedLogin(bounds) {
  return new Promise((resolve) => {
    let resolved = false;
    let pollTimer = null;
    let loginTimeout = null;

    const cleanup = () => {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      if (loginTimeout) { clearTimeout(loginTimeout); loginTimeout = null; }
      hideLoginViewInternal();
    };

    const finish = (result) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(result);
    };

    try {
      hideLoginViewInternal();

      const loginSession = session.fromPartition('persist:roblox-login', { cache: true });
      loginSession.clearStorageData({ storages: ['cookies'] }).catch(() => {});

      loginBrowserView = new BrowserView({
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          session: loginSession,
        }
      });

      try {
        loginBrowserView.webContents.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
      } catch {}

      win.setBrowserView(loginBrowserView);

      if (bounds && bounds.width > 0 && bounds.height > 0) {
        loginBrowserView.setBounds({
          x: Math.round(bounds.x),
          y: Math.round(bounds.y),
          width: Math.round(bounds.width),
          height: Math.round(bounds.height)
        });
      }

      const injectCleanCSS = async () => {
        if (!loginBrowserView || loginBrowserView.webContents.isDestroyed()) return;
        try {
          await loginBrowserView.webContents.insertCSS(`
            #header, .navigation-container, .navbar-header, #footer-container, .footer-container, .banner-container, #navigation, .rbx-header, nav {
              display: none !important;
              visibility: hidden !important;
              height: 0 !important;
              min-height: 0 !important;
            }
            html, body, #rbx-body, #container-main, .content, .main-container {
              overflow: hidden !important;
              background: #191b1d !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            ::-webkit-scrollbar {
              display: none !important;
              width: 0 !important;
              height: 0 !important;
            }
            .login-container, .login-v2-container, #login-base, .login-card {
              margin: 0 auto !important;
              padding-top: 10px !important;
              float: none !important;
              box-shadow: none !important;
              border: none !important;
              max-width: 100% !important;
            }
          `);
        } catch (e) {}
      };

      loginBrowserView.webContents.on('dom-ready', () => {
        if (!loginBrowserView || loginBrowserView.webContents.isDestroyed()) return;
        loginBrowserView.webContents.executeJavaScript(`
          try { Object.defineProperty(navigator, 'webdriver', { get: () => false }); } catch(e) {}
        `).catch(() => {});
        injectCleanCSS();
      });

      loginBrowserView.webContents.on('did-finish-load', () => {
        injectCleanCSS();
      });

      loginBrowserView.webContents.loadURL('https://www.roblox.com/login', {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      });

      const checkCookie = async () => {
        if (resolved || !loginBrowserView || loginBrowserView.webContents.isDestroyed()) return;
        try {
          const authData = await loginBrowserView.webContents.executeJavaScript(`
            (async () => {
              try {
                const r1 = await fetch('https://users.roblox.com/v1/users/authenticated', { credentials: 'include' });
                if (r1.ok) {
                  const d1 = await r1.json();
                  if (d1 && d1.id) return { ok: true, userId: String(d1.id), username: d1.name, displayName: d1.displayName };
                }
                const r2 = await fetch('https://www.roblox.com/mobileapi/userinfo', { credentials: 'include' });
                if (r2.ok) {
                  const d2 = await r2.json();
                  if (d2 && d2.UserID) return { ok: true, userId: String(d2.UserID), username: d2.UserName || ('User_' + d2.UserID) };
                }
                const r3 = await fetch('https://www.roblox.com/my/settings/json', { credentials: 'include' });
                if (r3.ok) {
                  const d3 = await r3.json();
                  if (d3 && d3.UserId) return { ok: true, userId: String(d3.UserId), username: d3.Name };
                }
              } catch(e) {}
              return null;
            })()
          `).catch(() => null);

          if (authData && authData.ok && authData.userId) {
            const cookies = await loginSession.cookies.get({ domain: '.roblox.com', name: '.ROBLOSECURITY' });
            const rbxCookie = cookies.find(ck => ck.value && ck.value.length > 100);
            if (rbxCookie) {
              finish({
                success: true,
                cookie: rbxCookie.value,
                username: authData.username,
                userId: authData.userId,
                displayName: authData.displayName
              });
            }
          }
        } catch (e) {
          console.warn('login check error:', e.message);
        }
      };

      pollTimer = setInterval(checkCookie, 1000);

      loginTimeout = setTimeout(() => {
        finish({ success: false, error: 'หมดเวลารอเข้าสู่ระบบ กรุณาลองอีกครั้งหรือใช้ "วางคุกกี้"' });
      }, 10 * 60 * 1000);

      ipcMain.once('login:cancel', () => {
        finish({ success: false, error: 'หน้าต่างเข้าสู่ระบบถูกปิด' });
      });

    } catch (e) {
      console.error('electronEmbeddedLogin error:', e.message);
      if (!resolved) resolve({ success: false, error: 'เปิดเบราว์เซอร์เข้าสู่ระบบไม่สำเร็จ: ' + e.message });
    }
  });
}



const genHistoryPath = path.join(app.getPath('userData'), 'genhistory.json');

ipcMain.handle('genhistory:read', () => {
  try {
    if (!fs.existsSync(genHistoryPath)) return [];
    return JSON.parse(fs.readFileSync(genHistoryPath, 'utf8'));
  } catch { return []; }
});

ipcMain.handle('genhistory:write', (_, list) => {
  try {
    const capped = Array.isArray(list) ? list.slice(0, 500) : [];
    fs.writeFileSync(genHistoryPath, JSON.stringify(capped, null, 2), { mode: 0o600 });
    return true;
  } catch { return false; }
});

ipcMain.handle('genhistory:clear', () => {
  try {
    fs.writeFileSync(genHistoryPath, '[]', { mode: 0o600 });
    return true;
  } catch { return false; }
});

// Roblox version folders are named "version-<hash>". The hash has no
// chronological meaning, so alphabetically sorting folder names (the old
// approach) does NOT reliably find the most recently installed version --
// it can pick a stale leftover folder from a previous update. Instead we
// pick whichever RobloxPlayerBeta.exe was most recently written to disk,
// which is what Roblox's own updater touches when it installs a new build.
function getLatestRobloxVersionDir() {
  try {
    const versionsBase = path.join(os.homedir(), 'AppData', 'Local', 'Roblox', 'Versions');
    if (!fs.existsSync(versionsBase)) return null;
    const candidates = fs.readdirSync(versionsBase)
      .filter(d => d.startsWith('version-'))
      .map(d => {
        const exe = path.join(versionsBase, d, 'RobloxPlayerBeta.exe');
        if (!fs.existsSync(exe)) return null;
        try {
          return { dir: path.join(versionsBase, d), exe, mtime: fs.statSync(exe).mtimeMs };
        } catch { return null; }
      })
      .filter(Boolean)
      .sort((a, b) => b.mtime - a.mtime);
    return candidates.length ? candidates[0] : null;
  } catch { return null; }
}

function getFFlagPath() {
  const latest = getLatestRobloxVersionDir();
  if (!latest) return null;
  return path.join(latest.dir, 'ClientSettings', 'ClientAppSettings.json');
}

ipcMain.handle('fflag:read', () => {
  try {
    const p = getFFlagPath();
    if (!p || !fs.existsSync(p)) return {};
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch { return {}; }
});

ipcMain.handle('fflag:write', (_, flags) => {
  try {
    const p = getFFlagPath();
    if (!p) return false;
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(flags, null, 2), 'utf8');
    return true;
  } catch { return false; }
});

// -- GlobalBasicSettings_13.xml FPS cap (works after the Fast Flag allowlist) --
// The file lives at %LOCALAPPDATA%\Roblox\GlobalBasicSettings_13.xml and
// contains an <int name="FramerateCap"> element inside a UserGameSettings Item.
// 0 means unlimited. Roblox must not be running when you write it (it overwrites
// on exit), so we write it here and it takes effect on the next launch.

function getGlobalSettingsPath() {
  return path.join(os.homedir(), 'AppData', 'Local', 'Roblox', 'GlobalBasicSettings_13.xml');
}

ipcMain.handle('fps:read', () => {
  try {
    const p = getGlobalSettingsPath();
    if (!fs.existsSync(p)) return 60;
    const xml = fs.readFileSync(p, 'utf8');
    // Match <int name="FramerateCap">VALUE</int>
    const m = xml.match(/<int\s+name="FramerateCap"\s*>(\d+)<\/int>/i);
    return m ? parseInt(m[1], 10) : 60;
  } catch { return 60; }
});

ipcMain.handle('fps:write', (_, cap) => {
  try {
    const p = getGlobalSettingsPath();
    if (!fs.existsSync(p)) return { ok: false, error: 'ไม่พบ GlobalBasicSettings_13.xml - เปิด Roblox หนึ่งครั้งเพื่อสร้างไฟล์นี้ก่อน' };
    let xml = fs.readFileSync(p, 'utf8');
    const value = Math.max(0, Math.round(Number(cap) || 0));
    if (/<int\s+name="FramerateCap"\s*>\d+<\/int>/i.test(xml)) {
      // Update existing element
      xml = xml.replace(/<int\s+name="FramerateCap"\s*>\d+<\/int>/i, `<int name="FramerateCap">${value}</int>`);
    } else {
      // Insert before closing </Item> of the first Item block (UserGameSettings)
      xml = xml.replace(/(<\/Item>)/, `\t\t<int name="FramerateCap">${value}</int>\n$1`);
    }
    fs.writeFileSync(p, xml, 'utf8');
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
});

async function resolveShareLink(shareCode, cookie, csrfToken) {
  // Port of evanovar/RobloxAccountManager resolve_share_url:
  // POST to sharelinks/v1/resolve-link with {linkId, linkType}
  // On 403, grab fresh CSRF from response header and retry

  const makeRequest = (csrf) => new Promise((resolve) => {
    // Try first payload shape, fall back to the second if needed.
    const tryPayload = (payloadStr, csrfHeader, cb) => {
      const req = https.request({
        hostname: 'apis.roblox.com',
        path: '/sharelinks/v1/resolve-link',
        method: 'POST',
        headers: {
          'Cookie': `.ROBLOSECURITY=${cookie}`,
          'X-CSRF-TOKEN': csrfHeader || '',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payloadStr),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }, res => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          cb(res.statusCode, res.headers, body);
        });
      });
      req.on('error', e => cb(0, {}, ''));
      req.setTimeout(8000, () => { req.destroy(); cb(0, {}, ''); });
      req.write(payloadStr);
      req.end();
    };

    const payloads = [
      JSON.stringify({ linkId: shareCode, linkType: 'Server' }),
      JSON.stringify({ code: shareCode, type: 'Server' }),
    ];

    const tryNext = (i, currentCsrf) => {
      if (i >= payloads.length) return resolve({ ok: false });
      tryPayload(payloads[i], currentCsrf, (status, headers, body) => {
        if (status === 200) {
          const pidM = body.match(/"placeId"\s*:\s*(\d+)/);
          const lcM = body.match(/"(?:linkCode|privateServerLinkCode|accessCode|linkcode)"\s*:\s*"([A-Za-z0-9_\-]+)"/);
          if (pidM && lcM) {
            return resolve({ ok: true, placeId: pidM[1], linkCode: lcM[1] });
          }
        }
        if (status === 403 && headers['x-csrf-token']) {
          // Retry same payload with fresh CSRF from response
          tryPayload(payloads[i], headers['x-csrf-token'], (status2, headers2, body2) => {
            if (status2 === 200) {
              const pidM = body2.match(/"placeId"\s*:\s*(\d+)/);
              const lcM = body2.match(/"(?:linkCode|privateServerLinkCode|accessCode|linkcode)"\s*:\s*"([A-Za-z0-9_\-]+)"/);
              if (pidM && lcM) {
                return resolve({ ok: true, placeId: pidM[1], linkCode: lcM[1] });
              }
            }
            tryNext(i + 1, currentCsrf);
          });
        } else {
          tryNext(i + 1, currentCsrf);
        }
      });
    };

    tryNext(0, csrfToken || '');
  });

  const result = await makeRequest(csrfToken);
  if (!result.ok) {
    return { ok: false, error: 'ไม่สามารถแปลงลิงก์แชร์ได้ อาจหมดอายุหรือไม่ถูกต้อง' };
  }

  return { ok: true, placeId: result.placeId, linkCode: result.linkCode };
}

async function followRedirect(url) {
  return new Promise((resolve) => {
    const req = net.request({ method: 'GET', url, redirect: 'manual', useSessionCookies: false });
    req.on('response', res => {
      const loc = res.headers['location'];
      resolve(loc || url);
    });
    req.on('error', () => resolve(url));
    req.end();
  });
}

// Resolves the accessCode for a private server linkCode using the sharelinks API.
// This is the correct method -- linkCode != accessCode, they are different tokens.
async function getAccessCode(placeId, linkCode, cookie, csrfToken) {
  // Primary: sharelinks resolve API
  try {
    const bodyStr = JSON.stringify({ shareCode: linkCode, shareType: 'Server' });
    const req = net.request({
      method: 'POST',
      url: 'https://apis.roblox.com/sharelinks/v1/resolve',
      useSessionCookies: false,
      headers: {
        'Cookie': `.ROBLOSECURITY=${cookie}`,
        'X-CSRF-TOKEN': csrfToken || '',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        'Accept': 'application/json',
        'Origin': 'https://www.roblox.com',
        'Referer': 'https://www.roblox.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    const result = await new Promise((resolve) => {
      let body = '';
      req.on('response', res => {
        res.on('data', c => body += c);
        res.on('end', () => {
          try {
            const d = JSON.parse(body);
            const inv = d?.privateServerInviteData
              || d?.resolvedShareData?.privateServerInviteData
              || d?.experienceInviteData?.privateServerInviteData;
            if (inv && inv.accessCode) resolve(inv.accessCode);
            else resolve(null);
          } catch { resolve(null); }
        });
      });
      req.on('error', () => resolve(null));
      req.write(bodyStr);
      req.end();
    });
    if (result) return result;
  } catch {}

  // Fallback: redirect scrape
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'www.roblox.com',
      path: `/games/${placeId}?privateServerLinkCode=${linkCode}`,
      method: 'GET',
      headers: {
        'Cookie': `.ROBLOSECURITY=${cookie}`,
        'Referer': 'https://www.roblox.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    }, res => {
      const loc = res.headers['location'] || '';
      const match = loc.match(/[?&]accessCode=([^&]+)/);
      resolve(match ? match[1] : null);
      res.resume();
    });
    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => { req.destroy(); resolve(null); });
    req.end();
  });
}


ipcMain.handle('roblox:getGameName', async (_, placeIdOrTarget, cookie) => {
  try {
    // If given a full URL/link, extract placeId first
    let placeId = placeIdOrTarget;
    if (!/^\d+$/.test(String(placeIdOrTarget).trim())) {
      // Try to extract placeId from URL
      try {
        const u = new URL(placeIdOrTarget.startsWith('http') ? placeIdOrTarget : 'https://' + placeIdOrTarget);
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts[0] === 'games' && parts[1] && /^\d+$/.test(parts[1])) {
          placeId = parts[1];
        } else {
          const m = placeIdOrTarget.match(/[?&]placeId=(\d+)/);
          if (m) placeId = m[1];
        }
      } catch {}
      if (!/^\d+$/.test(String(placeId).trim())) return null;
    }
    const result = await new Promise((resolve) => {
      const req = https.request({
        hostname: 'games.roblox.com',
        path: '/v1/games/multiget-place-details?placeIds=' + placeId,
        method: 'GET',
        headers: {
          'Cookie': `.ROBLOSECURITY=${cookie}`,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }, res => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          try {
            const d = JSON.parse(body);
            const name = Array.isArray(d) ? d[0]?.name : null;
            resolve(name || null);
          } catch { resolve(null); }
        });
      });
      req.on('error', () => resolve(null));
      req.setTimeout(5000, () => { req.destroy(); resolve(null); });
      req.end();
    });
    if (result) return result;

    // Fallback: some places return nothing from multiget-place-details. Resolve
    // placeId -> universeId, then read the universe's name. Catches many IDs the
    // first call misses.
    const getJson = (hostname, urlPath) => new Promise((resolve) => {
      const req = https.request({
        hostname, path: urlPath, method: 'GET',
        headers: {
          'Cookie': `.ROBLOSECURITY=${cookie}`,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }, res => { let b = ''; res.on('data', c => b += c); res.on('end', () => { try { resolve(JSON.parse(b)); } catch { resolve(null); } }); });
      req.on('error', () => resolve(null));
      req.setTimeout(5000, () => { req.destroy(); resolve(null); });
      req.end();
    });
    try {
      const uni = await getJson('apis.roblox.com', '/universes/v1/places/' + placeId + '/universe');
      const universeId = uni && uni.universeId;
      if (universeId) {
        const games = await getJson('games.roblox.com', '/v1/games?universeIds=' + universeId);
        const name = games && Array.isArray(games.data) ? (games.data[0] && games.data[0].name) : null;
        if (name) return name;
      }
    } catch {}
    return null;
  } catch { return null; }
});


ipcMain.handle('roblox:fetchPublicJson', async (_, url) => {
  return new Promise((resolve) => {
    try {
      const req = net.request({ method: 'GET', url: url, useSessionCookies: false });
      req.setHeader('Accept', 'application/json');
      req.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      req.on('response', res => {
        let b = '';
        res.on('data', c => b += c);
        res.on('end', () => {
          try { resolve(JSON.parse(b)); } catch { resolve(null); }
        });
      });
      req.on('error', () => resolve(null));
      req.end();
    } catch { resolve(null); }
  });
});

ipcMain.handle('roblox:getAuthenticatedJson', async (_, hostname, urlPath, cookie) => {
  return new Promise((resolve) => {
    const req = https.request({
      hostname, path: urlPath, method: 'GET',
      headers: {
        'Cookie': `.ROBLOSECURITY=${cookie}`,
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try { resolve(JSON.parse(b)); } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => { req.destroy(); resolve(null); });
    req.end();
  });
});

ipcMain.handle('roblox:launch', async (_, accountId, cookie, target) => {
  const result = await (_launchQueue = _launchQueue.then(() => _doLaunch(accountId, cookie, target)));
  return result;
});

let _sysinfoProc = null;
let _currentCpu = 0;
let _currentRam = 0;

function startSysInfo() {
  if (_sysinfoProc) return;
  ensureNativeHelper().then(nativeExe => {
    if (!nativeExe) return;
    _sysinfoProc = spawn(nativeExe, ['sysinfo'], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    _sysinfoProc.stdout.on('data', d => {
      const lines = d.toString().trim().split('\n');
      for (const line of lines) {
        const m = line.trim().match(/^SYSINFO:(\d+):(\d+)/);
        if (m) {
          _currentCpu = parseInt(m[1], 10);
          _currentRam = parseInt(m[2], 10);
          console.log(`[SysInfo] CPU=${_currentCpu}% RAM=${_currentRam}%`);
        }
      }
    });
    _sysinfoProc.on('exit', () => { _sysinfoProc = null; });
  }).catch(() => {});
}

ipcMain.handle('roblox:downloadVersion', async (_, rawHash) => {
  return new Promise((resolve) => {
    try {
      let hash = (rawHash || '').trim();
      if (!hash) return resolve({ ok: false, error: 'ไม่ได้ระบุรหัส Hash ของเวอร์ชัน' });
      if (!hash.startsWith('version-')) hash = 'version-' + hash;

      const downloadUrl = `https://setup.rbxcdn.com/${hash}-RobloxPlayerLauncher.exe`;
      const tempPath = path.join(app.getPath('temp'), `${hash}-RobloxPlayerLauncher.exe`);

      const notify = (status, percent = 0) => {
        if (win && !win.isDestroyed()) {
          win.webContents.send('roblox:install-progress', { status, percent, hash });
        }
      };

      notify('downloading', 0);

      const req = https.get(downloadUrl, (res) => {
        if (res.statusCode !== 200) {
          notify('error');
          return resolve({ ok: false, error: `ไม่พบบิลด์ในระบบ CDN (HTTP ${res.statusCode})` });
        }

        const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
        let downloadedBytes = 0;
        const fileStream = fs.createWriteStream(tempPath);

        res.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          fileStream.write(chunk);
          if (totalBytes > 0) {
            const pct = Math.round((downloadedBytes / totalBytes) * 100);
            notify('downloading', pct);
          }
        });

        res.on('end', () => {
          fileStream.end();
          notify('installing', 100);

          try {
            const installer = spawn(tempPath, [], { detached: true, stdio: 'ignore' });
            installer.unref();
            notify('done', 100);
            resolve({ ok: true, path: tempPath });
          } catch (e) {
            notify('error');
            resolve({ ok: false, error: `ไม่สามารถรันตัวติดตั้งได้: ${e.message}` });
          }
        });
      });

      req.on('error', (err) => {
        notify('error');
        resolve({ ok: false, error: `ดาวน์โหลดไม่สำเร็จ: ${err.message}` });
      });

      req.setTimeout(60000, () => {
        req.destroy();
        notify('error');
        resolve({ ok: false, error: 'หมดเวลาดาวน์โหลด (Connection Timeout)' });
      });

    } catch (e) {
      resolve({ ok: false, error: e.message });
    }
  });
});

ipcMain.handle('system:status', () => {
  if (!_sysinfoProc) startSysInfo();
  return {
    cpu: _currentCpu,
    memory: _currentRam
  };
});

async function sendDiscordWebhook(eventType, title, description) {
  const s = loadSettings();
  if (!s.discordWebhookEnabled || !s.discordWebhookUrl) return false;
  if (eventType === 'start' && s.discordNotifyStart === false) return false;
  if (eventType === 'action' && s.discordNotifyAction === false) return false;
  if (eventType === 'reconnect' && s.discordNotifyReconnect === false) return false;
  if (eventType === 'error' && s.discordNotifyErrors === false) return false;
  if (eventType === 'reset' && s.discordNotifyReset === false) return false;

  try {
    const url = new URL(s.discordWebhookUrl);
    let payload = {};
    if (s.discordDisableEmbed) {
      payload = { content: `**[MultiRoblox] ${title}**\n${description}` };
    } else {
      let color = 0x5c5ce0;
      if (eventType === 'start') color = 0x2dd4bf;
      if (eventType === 'error') color = 0xef4444;
      if (eventType === 'reconnect') color = 0xf59e0b;

      let contentStr = '';
      if (eventType === 'error' && s.discordMentionOnErrors) {
        contentStr = '@everyone';
      }

      payload = {
        content: contentStr,
        embeds: [{
          title: title,
          description: description,
          color: color,
          timestamp: new Date().toISOString(),
          footer: { text: 'MultiRoblox AntiAFK' }
        }]
      };
    }

    const data = JSON.stringify(payload);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    });
    req.on('error', () => {});
    req.write(data);
    req.end();
    return true;
  } catch (e) {
    return false;
  }
}

ipcMain.handle('native:grid', async () => {
  const exe = await ensureNativeHelper();
  if (!exe) return { ok: false };
  return new Promise(resolve => {
    const p = spawn(exe, ['grid'], { windowsHide: true });
    p.on('close', () => resolve({ ok: true }));
  });
});
ipcMain.handle('native:showall', async () => {
  const exe = await ensureNativeHelper();
  if (!exe) return { ok: false };
  return new Promise(resolve => {
    const p = spawn(exe, ['showall'], { windowsHide: true });
    p.on('close', () => resolve({ ok: true }));
  });
});
ipcMain.handle('native:hideall', async () => {
  const exe = await ensureNativeHelper();
  if (!exe) return { ok: false };
  return new Promise(resolve => {
    const p = spawn(exe, ['hideall'], { windowsHide: true });
    p.on('close', () => resolve({ ok: true }));
  });
});
ipcMain.handle('native:opacity', async (_, pct) => {
  const exe = await ensureNativeHelper();
  if (!exe) return { ok: false };
  return new Promise(resolve => {
    const p = spawn(exe, ['opacity', String(pct)], { windowsHide: true });
    p.on('close', () => resolve({ ok: true }));
  });
});
ipcMain.handle('native:dosleep', async (_, enable) => {
  const exe = await ensureNativeHelper();
  if (!exe) return { ok: false };
  return new Promise(resolve => {
    const p = spawn(exe, ['dosleep', enable ? '1' : '0'], { windowsHide: true });
    p.on('close', () => resolve({ ok: true }));
  });
});
ipcMain.handle('native:resetall', async () => {
  const exe = await ensureNativeHelper();
  if (!exe) return { ok: false };
  return new Promise(resolve => {
    const p = spawn(exe, ['resetall'], { windowsHide: true });
    p.on('close', () => resolve({ ok: true }));
  });
});
ipcMain.handle('native:testaction', async (_, actionType) => {
  const exe = await ensureNativeHelper();
  if (!exe) return { ok: false };
  return new Promise(resolve => {
    const p = spawn(exe, ['testaction', String(actionType || 0)], { windowsHide: true });
    p.on('close', () => resolve({ ok: true }));
  });
});
ipcMain.handle('discord:test', async () => {
  return await sendDiscordWebhook('test', 'ทดสอบ Discord Webhook', 'ระบบแจ้งเตือน MultiRoblox AntiAFK ทำงานเรียบร้อยแล้ว!');
});

ipcMain.handle('window:setAlwaysOnTop', (_, flag) => {
  if (win && !win.isDestroyed()) {
    win.setAlwaysOnTop(flag);
    return true;
  }
  return false;
});

const _positionedPids = new Set();

async function applyAccountWindowPosition(accountId, pid) {
  if (process.platform !== 'win32') return;
  const accounts = loadAccounts();
  const acct = accounts.find(a => a.id === accountId);
  if (!acct) return;
  if (acct.windowX === undefined || acct.windowY === undefined || acct.windowX === '' || acct.windowY === '') return;
  const x = parseInt(acct.windowX, 10);
  const y = parseInt(acct.windowY, 10);
  const w = parseInt(acct.windowWidth, 10) || 800;
  const h = parseInt(acct.windowHeight, 10) || 600;
  await new Promise(r => setTimeout(r, 1500));
  const exe = await ensureNativeHelper();
  if (exe && fs.existsSync(exe)) {
    console.log(`[windowpos] moving window for account ${accountId} (pid: ${pid}) to ${x},${y} (${w}x${h})`);
    spawn(exe, ['move', String(pid), String(x), String(y), String(w), String(h)], { windowsHide: true });
  }
}

const _watchedAccounts = new Map(); // accountId -> readyAt (epoch ms; not evaluated until then)
const _missCounts = new Map();      // consecutive "not found" counts per account
const MISS_THRESHOLD = 8;      // require 4 consecutive misses (~20s) before declaring closed
const POLL_INTERVAL  = 5000;   // poll every 5s
const LAUNCH_DELAY   = 35000;  // grace after launch before first evaluation (launcher->game gap)
let _watchTimer = null;

// One shared poll covering every watched account. Previously each account ran
// its own tasklist on its own timer, so N launched instances meant N tasklist
// spawns every POLL_INTERVAL. This runs a single tasklist per tick and applies
// the same per-account grace + miss/threshold logic, so behaviour is identical
// while process spawns drop from O(N) to O(1).
function _startWatchPoll() {
  if (_watchTimer) return;
  _watchTimer = setInterval(_watchTick, POLL_INTERVAL);
}
function _stopWatchPollIfIdle() {
  if (_watchedAccounts.size === 0 && _watchTimer) { clearInterval(_watchTimer); _watchTimer = null; }
}

function _watchRoblox(accountId) {
  // (Re)arm watching with a fresh post-launch grace period.
  _watchedAccounts.set(accountId, Date.now() + LAUNCH_DELAY);
  _missCounts.set(accountId, 0);
  _startWatchPoll();
}

function _watchTick() {
  if (_watchedAccounts.size === 0) { _stopWatchPollIfIdle(); return; }
  const isWin = process.platform === 'win32';
  // Windows: enumerate live RobloxPlayerBeta PIDs (CSV) so each watched account
  // can be evaluated against ITS OWN process. A single global "any roblox
  // running" flag (the old approach) meant closing one of several instances was
  // never noticed until the last one exited.
  const cmd = isWin
    ? 'tasklist /FI "IMAGENAME eq RobloxPlayerBeta.exe" /FO CSV /NH'
    : 'pgrep -x RobloxPlayer';
  const proc = spawn(isWin ? 'cmd' : 'sh',
    isWin ? ['/c', cmd] : ['-c', cmd],
    { windowsHide: true });
  let out = '';
  proc.stdout.on('data', d => { out += d; });
  proc.on('error', () => {}); // failed enumeration this tick -> skip, retry next tick
  proc.on('close', () => {
    // Set of currently-alive Roblox PIDs (Windows). On other platforms we only
    // have a coarse "something is running" signal.
    const alivePids = new Set();
    let anyRunning = false;
    if (isWin) {
      for (const m of out.matchAll(/"RobloxPlayerBeta\.exe","(\d+)"/gi)) alivePids.add(Number(m[1]));
      anyRunning = alivePids.size > 0;
    } else {
      anyRunning = out.trim().length > 0;
    }
    const now = Date.now();
    const closed = [];
    // PIDs currently claimed by watched accounts.
    const claimed = new Set();
    for (const id of _watchedAccounts.keys()) { const p = _accountPids.get(id); if (p) claimed.add(p); }
    // An "orphan" is a live RobloxPlayerBeta with no watched account claiming it.
    // These show up when Roblox hands a launch off from the process we spawned to
    // a new one (launcher -> game client). Adopting the orphan instead of counting
    // a miss is what stops a still-running instance being reported as closed.
    const orphans = isWin ? [...alivePids].filter(p => !claimed.has(p)) : [];
    for (const [accountId, readyAt] of _watchedAccounts) {
      if (now < readyAt) continue; // still in post-launch grace window
      const pid = _accountPids.get(accountId);
      // Per-account liveness: prefer the tracked PID; fall back to the coarse
      // signal only for accounts launched without one (openExternal path).
      let running = (isWin && pid) ? alivePids.has(pid) : anyRunning;
      if (isWin && pid && !running && orphans.length) {
        const adopted = orphans.shift();   // our process exited but Roblox is still up under a new PID
        _accountPids.set(accountId, adopted);
        running = true;
      }
      if (!running) {
        const misses = (_missCounts.get(accountId) || 0) + 1;
        _missCounts.set(accountId, misses);
        if (misses >= MISS_THRESHOLD) closed.push(accountId);
      } else {
        _missCounts.set(accountId, 0); // reset on any successful detection
        const currentPid = _accountPids.get(accountId);
        if (isWin && currentPid && !_positionedPids.has(currentPid)) {
          _positionedPids.add(currentPid);
          applyAccountWindowPosition(accountId, currentPid);
        }
      }
    }
    for (const accountId of closed) {
      _watchedAccounts.delete(accountId);
      _missCounts.delete(accountId);
      const closedAccts = loadAccounts();
      const closedAcct = closedAccts.find(a => a.id === accountId) || {};
      sendLog('warn', 'crash', `Roblox closed unexpectedly for ${closedAcct.username || accountId} (missed ${MISS_THRESHOLD} consecutive checks)`, {
        accountId, username: closedAcct.username || null, userId: closedAcct.userId || null, pid: _accountPids.get(accountId) || null
      });
      const p = _accountPids.get(accountId);
      if (p) _positionedPids.delete(p);
      _accountPids.delete(accountId);
      if (win && !win.isDestroyed()) win.webContents.send('roblox:closed', accountId);
    }
    // already listed every Roblox PID above, so hand the count to the renderer
    // here -- saves it running its own tasklist poll while we're watching.
    if (isWin && win && !win.isDestroyed()) win.webContents.send('roblox:count', alivePids.size);
    _stopWatchPollIfIdle();
  });
}

// IMPORTANT: this used to kill+respawn the persistent mutex holder on every
// single launch. That respawn isn't instant (powershell start + Add-Type JIT
// compile), and during that gap nobody owns ROBLOX_singletonMutex -- if a
// real RobloxPlayerBeta process grabs it in that window, our script silently
// "succeeds" (HoldMutex doesn't check the `created` flag) while actually NOT
// owning the mutex. Every launch after that closes the singleton-event handle
// of that real, legitimate first instance, which corrupts its install/update
// pipeline and produces the "Installer encountered a critical error" dialog.
//
// Fix: keep ONE long-lived mutex holder for the whole app session (started in
// app.whenReady / restarted only if it died) and, per launch, just run the
// lightweight `closehandles` native subcommand that closes the singleton-event
// handles on whatever Roblox processes currently exist. It never touches the
// mutex.
function closeSingletonHandlesOnly() {
  return ensureNativeHelper().then((nativeExe) => new Promise((resolve) => {
    try {
      if (!nativeExe) { resolve(); return; }
      const proc = spawn(nativeExe, ['closehandles'], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      proc.stdout.on('data', (d) => { if (d.toString().includes('HANDLES_DONE')) finish(); });
      if (proc.stderr) proc.stderr.on('data', d => { const s = d.toString().trim(); if (s) console.error('[closehandles]', s); });
      proc.on('exit', finish);
      proc.on('error', finish);
      setTimeout(finish, 4000); // safety timeout
    } catch (e) {
      resolve();
    }
  }));
}

async function closeSingletonAndHoldMutex() {
  // Make sure our persistent mutex holder is alive (e.g. it may have died,
  // or multi-instance mode was just toggled on). This NEVER kills a holder
  // that's already running, so the mutex is never released/re-grabbed here.
  if (process.platform === 'win32') await startMutexHolder();
  // Then close any singleton-event handles on currently-running Roblox
  // processes so the new instance won't get redirected into an existing one.
  await closeSingletonHandlesOnly();
}

async function _doLaunch(accountId, cookie, target) {
  try {
    // Close ROBLOX_singletonEvent from any running Roblox process before each launch
    await closeSingletonAndHoldMutex();

    // Enforce stagger between launches to avoid 429
    const sinceLastLaunch = Date.now() - _lastLaunchTs;
    if (_lastLaunchTs > 0 && sinceLastLaunch < LAUNCH_STAGGER) {
      await sleep(LAUNCH_STAGGER - sinceLastLaunch);
    }
    const csrfToken = await getCSRFToken(cookie);
    if (!csrfToken) {
      const fa = (loadAccounts().find(a => a.id === accountId) || {});
      sendLog('err', 'launch', `เปิดไม่สำเร็จสำหรับ ${fa.username || accountId}: ไม่สามารถขอ CSRF token ได้ (คุกกี้อาจหมดอายุ)`, { accountId, username: fa.username || null });
      return { success: false, error: 'ไม่สามารถขอ CSRF token ได้ คุกกี้ของบัญชียังใช้ได้อยู่หรือไม่' };
    }

    const ticketResult = await getAuthTicket(cookie, csrfToken);
    if (!ticketResult.ok) {
      const fa2 = (loadAccounts().find(a => a.id === accountId) || {});
      sendLog('err', 'launch', `เปิดไม่สำเร็จสำหรับ ${fa2.username || accountId}: auth ticket ผิดพลาด - ${ticketResult.error}`, { accountId, username: fa2.username || null });
      return { success: false, error: `ไม่สามารถขอ auth ticket ได้: ${ticketResult.error}` };
    }
    const { ticket } = ticketResult;

    const t = (target || '').trim();
    let launcherUrl = '';

    if (t) {
      if (/^\d+:[0-9a-fA-F\-]+$/.test(t)) {
        const [pid, jid] = t.split(':');
        launcherUrl = `https://assetgame.roblox.com/game/PlaceLauncher.ashx?request=RequestGameJob&placeId=${pid}&gameId=${jid}&isPlayTogetherGame=false`;
      } else if (/^\d+$/.test(t)) {
        launcherUrl = `https://assetgame.roblox.com/game/placelauncher.ashx?request=RequestGame&placeId=${t}&isPlayTogetherGame=false`;
      } else {
        let rawUrl = t.startsWith('http') ? t : 'https://' + t;

        try {
          const parsed0 = new URL(rawUrl);
          if (parsed0.hostname === 'ro.blox.com' || parsed0.hostname.endsWith('.ro.blox.com')) {
            rawUrl = await followRedirect(rawUrl);
          }
        } catch {}

        let parsedUrl;
        try { parsedUrl = new URL(rawUrl); } catch {}

        if (parsedUrl) {
          const privateCode = parsedUrl.searchParams.get('privateServerLinkCode');
          const shareCode = parsedUrl.searchParams.get('code');
          const shareType = parsedUrl.searchParams.get('type');
          const placeId = parsedUrl.pathname.match(/\/games\/(\d+)/)?.[1]
            || parsedUrl.pathname.match(/\/(\d+)/)?.[1];

          if (privateCode && placeId) {
            const accessCode = await getAccessCode(placeId, privateCode, cookie, csrfToken);
            if (!accessCode) return { success: false, error: 'ไม่สามารถแปลง access code ของ private server ได้ ลิงก์อาจหมดอายุหรือคุณไม่มีสิทธิ์' };
            launcherUrl = `https://assetgame.roblox.com/game/PlaceLauncher.ashx?request=RequestPrivateGame&placeId=${placeId}&accessCode=${accessCode}&linkCode=${privateCode}`;

          } else if (parsedUrl.pathname === '/share' || (shareCode && shareType)) {
            const code = shareCode;
            if (!code) return { success: false, error: 'ลิงก์แชร์ไม่ถูกต้อง - ไม่พบโค้ด' };
            // Resolve the share link to get placeId + accessCode so we can
            // launch via the auth-ticket launcher (same as every other path).
            // Opening a bare roblox://navigation/share_links URI bypasses the
            // auth ticket and lets Roblox use whatever account is logged in on
            // the system -- which is the wrong account.
            const resolved = await resolveShareLink(code, cookie, csrfToken);
            if (!resolved.ok) return { success: false, error: resolved.error || 'ไม่สามารถแปลงลิงก์แชร์ได้ อาจหมดอายุหรือไม่ถูกต้อง' };
            launcherUrl = `https://assetgame.roblox.com/game/PlaceLauncher.ashx?request=RequestGameJob&placeId=${resolved.placeId}&isPlayTogetherGame=false&linkCode=${resolved.linkCode}`;

          } else if (placeId) {
            launcherUrl = `https://assetgame.roblox.com/game/placelauncher.ashx?request=RequestGame&placeId=${placeId}&isPlayTogetherGame=false`;

          } else {
            return { success: false, error: 'ไม่พบ Place ID ใน URL' };
          }
        } else {
          return { success: false, error: 'ข้อมูลที่กรอกไม่ถูกต้อง กรุณาใส่ Place ID, URL เกม หรือ ลิงก์ private server' };
        }
      }
    }

    const launchTime = Date.now();
    const browserId = String(Math.floor(Math.random() * 9e12 + 1e12));
    let robloxUri;
    if (launcherUrl) {
      robloxUri = `roblox-player:1+launchmode:play+gameinfo:${ticket}+launchtime:${launchTime}+placelauncherurl:${encodeURIComponent(launcherUrl)}+browsertrackerid:${browserId}+robloxLocale:en_us+gameLocale:en_us+channel:+LaunchExp:InBrowser`;
    } else {
      robloxUri = `roblox-player:1+launchmode:app+gameinfo:${ticket}+launchtime:${launchTime}+browsertrackerid:${browserId}+robloxLocale:en_us+gameLocale:en_us+channel:+LaunchExp:InBrowser`;
    }

    // Find RobloxPlayerBeta.exe (most recently installed build, not just alphabetically last folder)
    let robloxExe = null;
    try {
      const latest = getLatestRobloxVersionDir();
      if (latest) robloxExe = latest.exe;
    } catch {}

    if (robloxExe && fs.existsSync(robloxExe)) {
      // Spawn directly -- bypasses the singleton URI handler that kills existing instances
      const child = spawn(robloxExe, [robloxUri], {
        cwd: path.dirname(robloxExe),
        detached: true,
        stdio: 'ignore',
        windowsHide: false,
      });
      if (child && child.pid) _accountPids.set(accountId, child.pid);
      child.unref();
    } else {
      // Fallback to URI if exe not found
      await shell.openExternal(robloxUri);
    }

    _lastLaunchTs = Date.now();
    _ticketCache.delete(cookie);

    const accounts = loadAccounts();
    const idx = accounts.findIndex(a => a.id === accountId);
    const acct = accounts[idx] || {};
    if (idx !== -1) { accounts[idx].lastUsed = new Date().toISOString(); saveAccounts(accounts); }

    sendLog('ok', 'launch', `เปิด Roblox สำหรับ ${acct.username || accountId} แล้ว`, {
      accountId, username: acct.username || null, userId: acct.userId || null,
      target: (target || '').trim() || 'Roblox home', pid: _accountPids.get(accountId) || null
    });

    _watchRoblox(accountId);

    // If the user has set a master volume, apply it to the new instance once its
    // audio session has spun up (a few seconds after the window appears).
    try {
      const s = loadSettings();
      if (typeof s.masterVolume === 'number' && s.masterVolume !== 100) {
        setTimeout(() => { setRobloxVolume(s.masterVolume).catch(() => {}); }, 9000);
      }
    } catch {}

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
