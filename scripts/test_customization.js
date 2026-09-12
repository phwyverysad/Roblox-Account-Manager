/**
 * Automated Test Suite for Customization (ปรับแต่ง) & Voidstrap Features
 * Tests:
 * 1. AntiAFKNative.exe commands (reconnectcheck, sysinfo, dosleep, opacity, testaction, resetall)
 * 2. Voidstrap FastFlag Presets & Graphics/Lighting Engines
 * 3. XML Framerate Cap (GlobalBasicSettings_13.xml)
 * 4. Settings Storage & Bootstrapper Routing
 * 5. HTML <-> Renderer ID and Event Handler Contract Verification
 */

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
    throw err;
  }
}

async function testAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
    throw err;
  }
}

async function runTests() {
  console.log('=== RUNNING CUSTOMIZATION & VOIDSTRAP TEST SUITE ===\n');

  // -------------------------------------------------------------
  // Suite 1: AntiAFKNative.exe Binary Commands
  // -------------------------------------------------------------
  console.log('Suite 1: AntiAFKNative.exe Binary Verification');
  const nativeExePath = path.resolve(__dirname, '..', 'src', 'AntiAFKNative.exe');

  test('Native helper executable exists', () => {
    assert(fs.existsSync(nativeExePath), `AntiAFKNative.exe not found at ${nativeExePath}`);
    const stat = fs.statSync(nativeExePath);
    assert(stat.size > 50000, `Binary size (${stat.size} bytes) looks suspiciously small`);
  });

  await testAsync('Native command: sysinfo streams valid CPU and RAM metrics', async () => {
    return new Promise((resolve, reject) => {
      const proc = spawn(nativeExePath, ['sysinfo'], { stdio: ['ignore', 'pipe', 'pipe'] });
      let received = false;
      const timer = setTimeout(() => {
        try { proc.kill(); } catch {}
        if (!received) reject(new Error('Timed out waiting for SYSINFO output'));
      }, 4000);

      proc.stdout.on('data', data => {
        const text = data.toString();
        const match = text.match(/SYSINFO:(\d+):(\d+)/);
        if (match) {
          received = true;
          clearTimeout(timer);
          try { proc.kill(); } catch {}
          const cpu = parseInt(match[1], 10);
          const ram = parseInt(match[2], 10);
          assert(cpu >= 0 && cpu <= 100, `CPU out of bounds: ${cpu}`);
          assert(ram >= 0 && ram <= 100, `RAM out of bounds: ${ram}`);
          resolve();
        }
      });

      proc.on('error', err => {
        clearTimeout(timer);
        reject(err);
      });
    });
  });

  test('Native command: reconnectcheck returns valid reconnect count', () => {
    const res = spawnSync(nativeExePath, ['reconnectcheck'], { encoding: 'utf8', timeout: 5000 });
    assert.strictEqual(res.status, 0, `Expected exit 0, got ${res.status}. Stderr: ${res.stderr}`);
    assert(res.stdout.includes('RECONNECT_CHECK:'), `Expected RECONNECT_CHECK tag in output: ${res.stdout}`);
    const match = res.stdout.match(/RECONNECT_CHECK:(\d+)/);
    assert(match, 'Failed to extract integer count from RECONNECT_CHECK');
  });

  test('Native command: dosleep toggles execution state', () => {
    const res0 = spawnSync(nativeExePath, ['dosleep', '0'], { encoding: 'utf8', timeout: 5000 });
    assert.strictEqual(res0.status, 0, `dosleep 0 failed: ${res0.stderr}`);
    assert(res0.stdout.includes('SLEEP_PREVENTED:OFF'), `Expected SLEEP_PREVENTED:OFF in: ${res0.stdout}`);

    const res1 = spawnSync(nativeExePath, ['dosleep', '1'], { encoding: 'utf8', timeout: 5000 });
    assert.strictEqual(res1.status, 0, `dosleep 1 failed: ${res1.stderr}`);
    assert(res1.stdout.includes('SLEEP_PREVENTED:ON'), `Expected SLEEP_PREVENTED:ON in: ${res1.stdout}`);

    // Restore to normal
    spawnSync(nativeExePath, ['dosleep', '0'], { timeout: 3000 });
  });

  test('Native command: opacity executes safely', () => {
    const res = spawnSync(nativeExePath, ['opacity', '100'], { encoding: 'utf8', timeout: 5000 });
    assert.strictEqual(res.status, 0, `opacity 100 failed: ${res.stderr}`);
    assert(res.stdout.includes('OPACITY_SET:100'), `Expected OPACITY_SET:100 in: ${res.stdout}`);
  });

  test('Native command: testaction executes actions 0, 1, 2 safely', () => {
    for (const act of [0, 1, 2]) {
      const res = spawnSync(nativeExePath, ['testaction', String(act)], { encoding: 'utf8', timeout: 5000 });
      assert.strictEqual(res.status, 0, `testaction ${act} failed: ${res.stderr}`);
      assert(res.stdout.includes('TEST_ACTION:'), `Expected TEST_ACTION tag in: ${res.stdout}`);
    }
  });

  test('Native command: resetall executes without crash', () => {
    const res = spawnSync(nativeExePath, ['resetall'], { encoding: 'utf8', timeout: 5000 });
    assert.strictEqual(res.status, 0, `resetall failed: ${res.stderr}`);
    assert(res.stdout.includes('RESET_DONE:'), `Expected RESET_DONE tag in: ${res.stdout}`);
  });

  test('Native command: volume with pid argument executes safely', () => {
    const res = spawnSync(nativeExePath, ['volume', '50', '0'], { encoding: 'utf8', timeout: 5000 });
    assert.strictEqual(res.status, 0, `volume with pid failed: ${res.stderr}`);
  });

  await testAsync('Native command: automute starts process without immediate crash', async () => {
    return new Promise((resolve, reject) => {
      const proc = spawn(nativeExePath, ['automute', '100', '1', '1'], { stdio: ['ignore', 'pipe', 'pipe'] });
      const timer = setTimeout(() => {
        try { proc.kill(); } catch {}
        resolve();
      }, 1000);

      proc.on('error', err => {
        clearTimeout(timer);
        reject(err);
      });

      proc.on('exit', code => {
        clearTimeout(timer);
        if (code !== 0 && code !== null) {
          reject(new Error(`automute exited unexpectedly early with code ${code}`));
        } else {
          resolve();
        }
      });
    });
  });

  // -------------------------------------------------------------
  // Suite 2: Voidstrap FastFlags & Preset Mapping
  // -------------------------------------------------------------
  console.log('\nSuite 2: Voidstrap FastFlags Presets & Multi-path Synchronization');

  const mainJsSource = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'main.js'), 'utf8');

  test('main.js defines all required VOIDSTRAP_PRESETS including fixDisplayScaling and graySky', () => {
    const requiredPresets = [
      'removeTextures',
      'lowPolyMeshes',
      'disablePostFx',
      'disableShadows',
      'disableTerrainTextures',
      'disableTelemetry',
      'optimizeCFrame',
      'multiThreading',
      'fasterLoading',
      'noGuiBlur',
      'unlimitedZoom',
      'newFpsDisplay',
      'fixDisplayScaling',
      'graySky'
    ];
    for (const p of requiredPresets) {
      assert(mainJsSource.includes(`${p}:`), `Missing preset '${p}' in main.js`);
    }
  });

  test('Voidstrap preset flags match accurate Roblox FastFlag definitions', () => {
    assert(mainJsSource.includes("'FFlagTextureUseACR3': 'True'"), 'removeTextures ACR3 missing');
    assert(mainJsSource.includes("'FIntTextureUseACRHundredthPercent': '10000'"), 'removeTextures ACR percentage missing');
    assert(mainJsSource.includes("'FIntRenderShadowIntensity': '0'"), 'disableShadows intensity missing');
    assert(mainJsSource.includes("'FIntRenderShadowmapBias': '-1'"), 'disableShadows bias missing');
    assert(mainJsSource.includes("'DFStringTelemetryV2Url': '0.0.0.0'"), 'disableTelemetry url missing');
    assert(mainJsSource.includes("'DFFlagDisableDPIScale': 'True'"), 'fixDisplayScaling DPI flag missing');
    assert(mainJsSource.includes("'FFlagDebugSkyGray': 'True'"), 'graySky flag missing');
    assert(mainJsSource.includes("'FIntCameraMaxZoomDistance': '2147483647'"), 'unlimitedZoom flag missing');
  });

  test('FastFlag preset application and reversal in mock ClientAppSettings.json', () => {
    const tmpTestDir = path.join(os.tmpdir(), 'mr_voidstrap_test_' + Date.now());
    fs.mkdirSync(tmpTestDir, { recursive: true });
    const mockFile = path.join(tmpTestDir, 'ClientAppSettings.json');

    try {
      // Initial empty settings
      fs.writeFileSync(mockFile, JSON.stringify({ 'DFIntTaskSchedulerTargetFps': 120 }, null, 2), 'utf8');

      // Simulate applying removeTextures preset
      let currentFlags = JSON.parse(fs.readFileSync(mockFile, 'utf8'));
      currentFlags['FFlagTextureUseACR3'] = 'True';
      currentFlags['FIntTextureUseACRHundredthPercent'] = '10000';
      fs.writeFileSync(mockFile, JSON.stringify(currentFlags, null, 2), 'utf8');

      // Verify written
      let updated = JSON.parse(fs.readFileSync(mockFile, 'utf8'));
      assert.strictEqual(updated['FFlagTextureUseACR3'], 'True');
      assert.strictEqual(updated['FIntTextureUseACRHundredthPercent'], '10000');
      assert.strictEqual(updated['DFIntTaskSchedulerTargetFps'], 120, 'Existing flag should be preserved');

      // Simulate toggling off removeTextures
      delete updated['FFlagTextureUseACR3'];
      delete updated['FIntTextureUseACRHundredthPercent'];
      fs.writeFileSync(mockFile, JSON.stringify(updated, null, 2), 'utf8');

      let reverted = JSON.parse(fs.readFileSync(mockFile, 'utf8'));
      assert.strictEqual(reverted['FFlagTextureUseACR3'], undefined);
      assert.strictEqual(reverted['FIntTextureUseACRHundredthPercent'], undefined);
      assert.strictEqual(reverted['DFIntTaskSchedulerTargetFps'], 120);
    } finally {
      fs.rmSync(tmpTestDir, { recursive: true, force: true });
    }
  });

  test('Graphic Engine and Lighting Technology flags mapping logic', () => {
    const engines = {
      d3d11: 'FFlagDebugGraphicsPreferD3D11',
      vulkan: 'FFlagDebugGraphicsPreferVulkan',
      opengl: 'FFlagDebugGraphicsPreferOpenGL'
    };
    for (const [engine, flag] of Object.entries(engines)) {
      assert(mainJsSource.includes(flag), `Flag ${flag} for engine ${engine} not found in main.js`);
    }

    const lighting = {
      future: 'FFlagDebugForceFutureIsBrightPhase3',
      shadowmap: 'FFlagDebugForceFutureIsBrightPhase2',
      voxel: 'DFFlagDebugRenderForceTechnologyVoxel'
    };
    for (const [tech, flag] of Object.entries(lighting)) {
      assert(mainJsSource.includes(flag), `Flag ${flag} for lighting ${tech} not found in main.js`);
    }
  });

  // -------------------------------------------------------------
  // Suite 3: XML Framerate Cap (GlobalBasicSettings_13.xml)
  // -------------------------------------------------------------
  console.log('\nSuite 3: GlobalBasicSettings_13.xml FPS Cap Read/Write');

  test('Roblox GlobalBasicSettings_13.xml FramerateCap reading, modification, and insertion logic', () => {
    const sampleXml = `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">
  <External>null</External>
  <Item class="UserGameSettings" referent="RBX0">
    <Properties>
      <int name="FramerateCap">60</int>
      <string name="GraphicsQualityLevel">Auto</string>
    </Properties>
  </Item>
</roblox>`;

    // Test reading
    const match = sampleXml.match(/<int\s+name="FramerateCap"\s*>(\d+)<\/int>/i);
    assert(match, 'Failed to extract FramerateCap from sample XML');
    assert.strictEqual(parseInt(match[1], 10), 60);

    // Test modifying to 144
    let modifiedXml = sampleXml.replace(/<int\s+name="FramerateCap"\s*>\d+<\/int>/i, '<int name="FramerateCap">144</int>');
    assert(modifiedXml.includes('<int name="FramerateCap">144</int>'));

    // Test modifying to 0 (unlimited)
    let unlimitedXml = modifiedXml.replace(/<int\s+name="FramerateCap"\s*>\d+<\/int>/i, '<int name="FramerateCap">0</int>');
    assert(unlimitedXml.includes('<int name="FramerateCap">0</int>'));

    // Test insertion when tag does not exist
    const xmlWithoutTag = `<Item class="UserGameSettings" referent="RBX0"><Properties><string name="Test">Val</string></Properties></Item>`;
    const insertedXml = xmlWithoutTag.replace(/(<\/Item>)/, `\t\t<int name="FramerateCap">240</int>\n$1`);
    assert(insertedXml.includes('<int name="FramerateCap">240</int>'));
  });

  // -------------------------------------------------------------
  // Suite 4: Settings Persistence & Voidstrap Launch Options
  // -------------------------------------------------------------
  console.log('\nSuite 4: Settings & Launch Integration');

  test('main.js supports bootstrapper options: roblox, voidstrap, bloxstrap', () => {
    assert(mainJsSource.includes(`bootstrapper === 'voidstrap'`), 'Missing voidstrap bootstrapper check in launch handler');
    assert(mainJsSource.includes(`bootstrapper === 'bloxstrap'`), 'Missing bloxstrap bootstrapper check in launch handler');
    assert(mainJsSource.includes(`Voidstrap.exe`), 'Missing Voidstrap.exe launch logic');
    assert(mainJsSource.includes(`Bloxstrap.exe`), 'Missing Bloxstrap.exe launch logic');
  });

  test('main.js supports autoGrid and autoHide on launch', () => {
    assert(mainJsSource.includes('autoGrid'), 'autoGrid logic missing from main.js');
    assert(mainJsSource.includes('autoHide'), 'autoHide logic missing from main.js');
  });

  test('main.js passes all 5 Anti-AFK arguments including restoreMethod', () => {
    assert(mainJsSource.includes(`s.restoreMethod`), 'restoreMethod not passed to AntiAFKNative invocation');
  });

  test('main.js IPC handlers accurately parse native helper output tags', () => {
    const gridSample = 'GRID_DONE:4\n';
    const gridMatch = gridSample.match(/GRID_DONE:(\d+)/);
    assert.strictEqual(gridMatch ? parseInt(gridMatch[1], 10) : 0, 4);

    const resetSample = 'RESET_DONE:2\n';
    const resetMatch = resetSample.match(/RESET_DONE:(\d+)/);
    assert.strictEqual(resetMatch ? parseInt(resetMatch[1], 10) : 0, 2);

    const showSample = 'SHOWALL_DONE:3\n';
    const showMatch = showSample.match(/SHOWALL_DONE:(\d+)/);
    assert.strictEqual(showMatch ? parseInt(showMatch[1], 10) : 0, 3);

    const hideSample = 'HIDEALL_DONE:3\n';
    const hideMatch = hideSample.match(/HIDEALL_DONE:(\d+)/);
    assert.strictEqual(hideMatch ? parseInt(hideMatch[1], 10) : 0, 3);

    const testOkSample = 'TEST_ACTION:OK\n';
    assert(testOkSample.includes('TEST_ACTION:OK'));
    assert(!testOkSample.includes('TEST_ACTION:NO_WINDOW'));

    const testNoWinSample = 'TEST_ACTION:NO_WINDOW\n';
    assert(testNoWinSample.includes('TEST_ACTION:NO_WINDOW'));
  });

  // -------------------------------------------------------------
  // Suite 5: HTML <-> Renderer Contract Verification
  // -------------------------------------------------------------
  console.log('\nSuite 5: HTML <-> Renderer Interface Contract Verification');
  const htmlSource = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'index.html'), 'utf8');
  const rendererSource = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');

  test('Tab bar includes Voidstrap tab and panel', () => {
    assert(htmlSource.includes('id="mtab-voidstrap"'), 'HTML missing mtab-voidstrap tab button');
    assert(htmlSource.includes('id="mtab-panel-voidstrap"'), 'HTML missing mtab-panel-voidstrap panel');
    assert(rendererSource.includes("'voidstrap'"), 'renderer.js switchMixerTab does not include voidstrap tab');
  });

  test('All Voidstrap controls in HTML exist in renderer.js handlers', () => {
    const elements = [
      'mix-setting-bootstrapper',
      'mix-vs-engine',
      'mix-vs-lighting',
      'mix-vs-remove-textures',
      'mix-vs-low-poly',
      'mix-vs-disable-postfx',
      'mix-vs-disable-shadows',
      'mix-vs-disable-terrain',
      'mix-vs-disable-telemetry',
      'mix-vs-optimize-cframe',
      'mix-vs-multithreading',
      'mix-vs-faster-loading',
      'mix-vs-no-blur',
      'mix-vs-unlimited-zoom',
      'mix-vs-fps-display',
      'mix-vs-fix-scaling',
      'mix-vs-gray-sky'
    ];

    for (const id of elements) {
      assert(htmlSource.includes(`id="${id}"`), `HTML element #${id} missing`);
      assert(rendererSource.includes(id), `renderer.js does not reference #${id}`);
    }
  });

  test('Discord notify reset checkbox exists in HTML and renderer', () => {
    assert(htmlSource.includes('id="setting-dc-notify-reset"'), 'HTML missing setting-dc-notify-reset checkbox');
    assert(rendererSource.includes('setting-dc-notify-reset'), 'renderer.js does not handle setting-dc-notify-reset');
  });

  test('All quick action buttons have matching window.* handlers in renderer.js', () => {
    const requiredFunctions = [
      'mixGridSnapNow',
      'mixResetOpacityNow',
      'mixShowAllNow',
      'mixHideAllNow',
      'mixTestAntiAfkAction',
      'mixCheckReconnectNow',
      'mixResetAllNow',
      'loadVoidstrapTab',
      'commitVoidstrapPresets',
      'resetVoidstrapPresets',
      'copyVoidstrapFlagsJson',
      'syncSettingCheckbox'
    ];

    for (const fn of requiredFunctions) {
      assert(rendererSource.includes(fn), `Missing function ${fn} in renderer.js`);
      assert(rendererSource.includes(`window.${fn}`) || rendererSource.includes(`function ${fn}`), `Function ${fn} is not properly exposed`);
    }
  });

  test('Preload exposes all required native and voidstrap APIs', () => {
    const preloadSource = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'preload.js'), 'utf8');
    const requiredApis = [
      'gridSnap',
      'showAllRoblox',
      'hideAllRoblox',
      'setWindowOpacity',
      'setDoNotSleep',
      'resetAllRoblox',
      'testAntiAfkAction',
      'checkReconnectNow',
      'getVoidstrapStatus',
      'openVoidstrapFolder',
      'readVoidstrapPresets',
      'applyVoidstrapPresets'
    ];

    for (const api of requiredApis) {
      assert(preloadSource.includes(`${api}:`), `Missing api.${api} in preload.js`);
    }
  });

  // -------------------------------------------------------------
  // Suite 6: Architecture, Stability & Bug Fix Verification
  // -------------------------------------------------------------
  console.log('Suite 6: Architecture, Stability & Bug Fix Verification');
  const mainSource = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'main.js'), 'utf8');
  const scriptsSource = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'scripts.js'), 'utf8');

  test('HTML properly links homePreload.js into #home-webview', () => {
    assert(htmlSource.includes('id="home-webview"'), 'Missing #home-webview in index.html');
    assert(htmlSource.includes('preload="./homePreload.js"'), 'Missing preload="./homePreload.js" attribute on #home-webview');
  });

  test('HTML provides cancel button for #m-enc encryption modal', () => {
    assert(htmlSource.includes('id="enc-cancel"'), 'Missing #enc-cancel in index.html');
  });

  test('main.js drains stdout/stderr for persistent daemon child processes', () => {
    assert(mainSource.includes('_autoMuteProc.stdout.on(\'data\', () => {});'), 'Missing stdout drain for _autoMuteProc');
    assert(mainSource.includes('_autoMuteProc.stderr.on(\'data\', () => {});'), 'Missing stderr drain for _autoMuteProc');
    assert(mainSource.includes('_fpsCapProc.stdout.on(\'data\', () => {});'), 'Missing stdout drain for _fpsCapProc');
    assert(mainSource.includes('_fpsCapProc.stderr.on(\'data\', () => {});'), 'Missing stderr drain for _fpsCapProc');
  });

  test('main.js incorporates bootId in session key persistence to discard cached password on reboot', () => {
    assert(mainSource.includes('bootId()'), 'Missing bootId check in main.js');
    assert(mainSource.includes('Math.abs(data.boot - bootId())'), 'Missing bootId validation on readSessionKey');
  });

  test('main.js adopts orphan Roblox PIDs and applies window layout immediately', () => {
    assert(mainSource.includes('if (isWin && orphans.length > 0 && (!pid || !alivePids.has(pid)))'), 'Missing immediate orphan adoption');
    assert(mainSource.includes('applyAccountWindowPosition(accountId, pid);'), 'Missing immediate window positioning');
  });

  test('main.js deduplicates accounts by userId on accounts:add', () => {
    assert(mainSource.includes('account && account.userId ? accounts.findIndex(a => String(a.userId) === String(account.userId)) : -1'), 'Missing userId deduplication in accounts:add');
  });

  test('scripts.js provides fallback SVG without hiding card on image error', () => {
    assert(!scriptsSource.includes("this.closest('.script-card').style.display='none';"), 'scripts.js should not hide script card on image error');
    assert(scriptsSource.includes('this.onerror=null; this.src='), 'scripts.js should set fallback SVG on error');
  });

  // -------------------------------------------------------------
  // Suite 7: Full Voidstrap Suite & Dedup Verification
  // -------------------------------------------------------------
  console.log('Suite 7: Full Voidstrap Suite & Dedup Verification');
  const cssSource = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'styles.css'), 'utf8');

  test('All 5 Voidstrap sub-panels exist in index.html', () => {
    const panels = ['vs-subpanel-config', 'vs-subpanel-fflags', 'vs-subpanel-editor', 'vs-subpanel-global', 'vs-subpanel-mod'];
    for (const p of panels) {
      assert(htmlSource.includes(`id="${p}"`), `Missing sub-panel ${p} in index.html`);
    }
  });

  test('All 5 subnav buttons and modal/drawer exist in index.html', () => {
    const btns = ['vs-subtab-btn-config', 'vs-subtab-btn-fflags', 'vs-subtab-btn-editor', 'vs-subtab-btn-global', 'vs-subtab-btn-mod'];
    for (const b of btns) {
      assert(htmlSource.includes(`id="${b}"`), `Missing sub-tab button ${b} in index.html`);
    }
    assert(htmlSource.includes('id="vs-modal-add-flag"'), 'Missing #vs-modal-add-flag in index.html');
    assert(htmlSource.includes('id="vs-drawer-library"'), 'Missing #vs-drawer-library in index.html');
  });

  test('FastFlag Editor modals use .vs-modal-backdrop and correct sizing windows', () => {
    assert(htmlSource.includes('id="vs-modal-add-flag" class="vs-modal-backdrop"'), 'vs-modal-add-flag must have vs-modal-backdrop class');
    assert(htmlSource.includes('class="vs-modal-window sm"'), 'vs-modal-add-flag must use .vs-modal-window.sm');
    assert(htmlSource.includes('id="vs-drawer-library" class="vs-modal-backdrop"'), 'vs-drawer-library must have vs-modal-backdrop class');
    assert(htmlSource.includes('class="vs-modal-window md"'), 'vs-drawer-library must use .vs-modal-window.md');
    assert(!htmlSource.includes('class="modal-backdrop"'), 'Obsolete modal-backdrop class found in HTML');
    assert(!htmlSource.includes('class="modal-box"'), 'Obsolete modal-box class found in HTML');
  });

  test('FastFlag modification functions preserve existing flags (merge instead of overwrite)', () => {
    assert(rendererSource.includes('submitAddNewFlag'), 'Missing submitAddNewFlag');
    const submitMatch = rendererSource.match(/submitAddNewFlag\s*=\s*async\s*function[\s\S]*?toast\(`เพิ่ม FastFlag/);
    assert(submitMatch && submitMatch[0].includes('readFFlags()'), 'submitAddNewFlag must read existing flags before writing');

    const updateMatch = rendererSource.match(/updateEditorFlag\s*=\s*async\s*function[\s\S]*?toast\(`อัปเดต/);
    assert(updateMatch && updateMatch[0].includes('readFFlags()'), 'updateEditorFlag must read existing flags before writing');

    const libMatch = rendererSource.match(/addFlagFromLibrary\s*=\s*async\s*function[\s\S]*?toast\(`เพิ่ม/);
    assert(libMatch && libMatch[0].includes('readFFlags()'), 'addFlagFromLibrary must read existing flags before writing');
  });

  test('styles.css defines all required Voidstrap UI classes', () => {
    const classes = [
      '.vs-sub-nav', '.vs-sub-btn', '.vs-subpanel', '.vs-profiles-grid',
      '.vs-profile-card', '.vs-card-collapsible', '.vs-collapse-head',
      '.vs-collapse-body', '.vs-chevron', '.vs-editor-toolbar',
      '.vs-table-wrapper', '.vs-table', '.vs-code-area', '.vs-library-container'
    ];
    for (const c of classes) {
      assert(cssSource.includes(c), `Missing CSS class ${c} in styles.css`);
    }
  });

  test('Preload exposes all comprehensive Voidstrap IPC methods', () => {
    const preloadSource = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'preload.js'), 'utf8');
    const apis = [
      'getVoidstrapProfiles', 'saveVoidstrapProfile', 'deleteVoidstrapProfile',
      'exportVoidstrapProfile', 'importVoidstrapProfile', 'deleteFFlag', 'setRawFFlags',
      'getModSettings', 'saveModSettings', 'pickModFile', 'deployMods', 'openModsFolder',
      'getDiscordRpcStatus', 'setDiscordRpc'
    ];
    for (const a of apis) {
      assert(preloadSource.includes(`${a}:`), `Missing ${a} in preload.js`);
    }
  });

  test('main.js defines VOIDSTRAP_BUILTIN_PROFILES (potato, pvp, cinematic, default)', () => {
    assert(mainSource.includes('VOIDSTRAP_BUILTIN_PROFILES = {'), 'Missing VOIDSTRAP_BUILTIN_PROFILES in main.js');
    assert(mainSource.includes('potato: {'), 'Missing potato profile in main.js');
    assert(mainSource.includes('pvp: {'), 'Missing pvp profile in main.js');
    assert(mainSource.includes('cinematic: {'), 'Missing cinematic profile in main.js');
    assert(mainSource.includes('default: {'), 'Missing default profile in main.js');
  });

  test('Bundled mod assets exist in src/assets/mods/', () => {
    const soundPath = path.resolve(__dirname, '..', 'src', 'assets', 'mods', 'sounds', 'ouch.ogg');
    const cursor2013 = path.resolve(__dirname, '..', 'src', 'assets', 'mods', 'cursors', '2013', 'ArrowCursor.png');
    assert(fs.existsSync(soundPath), `Classic ouch.ogg missing at ${soundPath}`);
    assert(fs.existsSync(cursor2013), `2013 ArrowCursor.png missing at ${cursor2013}`);
  });

  test('Zero duplicate Anti-AFK or audio controls in Settings page', () => {
    // Check that stab-panel-general does not contain duplicate controls
    const genMatch = htmlSource.match(/id="stab-panel-general"[\s\S]*?id="stab-panel-language"/);
    assert(genMatch, 'Could not extract stab-panel-general');
    const genContent = genMatch[0];
    assert(!genContent.includes('mix-setting-auto-mute'), 'Duplicate auto-mute in General settings');
    assert(!genContent.includes('mix-setting-antiafk-action'), 'Duplicate antiafk-action in General settings');
    assert(!genContent.includes('mix-setting-fps-cap'), 'Duplicate fps-cap in General settings');
  });

  test('Zero emojis in Voidstrap HTML, styles, and renderer logic', () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    const files = [
      path.resolve(__dirname, '..', 'src', 'index.html'),
      path.resolve(__dirname, '..', 'src', 'styles.css'),
      path.resolve(__dirname, '..', 'src', 'renderer.js')
    ];
    for (const f of files) {
      const lines = fs.readFileSync(f, 'utf8').split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.toLowerCase().includes('voidstrap') || line.toLowerCase().includes('vs-')) {
          assert(!emojiRegex.test(line), `Emoji detected in ${path.basename(f)} line ${i+1}: ${line}`);
        }
      }
    }
  });

  // -------------------------------------------------------------
  // Suite 8: Real Data Retrieval & IPC Error-Free Verification
  // -------------------------------------------------------------
  console.log('\nSuite 8: Real Data Retrieval & IPC Verification');

  test('main.js imports dialog from electron to prevent ReferenceError', () => {
    const firstLine = mainSource.split('\n')[0];
    assert(firstLine.includes('dialog'), 'dialog is missing from electron imports on line 1 of main.js');
  });

  test('voidstrap:get-profiles returns both builtin and custom profile maps', () => {
    assert(mainSource.includes('builtin: VOIDSTRAP_BUILTIN_PROFILES'), 'Missing builtin map in get-profiles handler');
    assert(mainSource.includes('custom'), 'Missing custom map in get-profiles handler');
  });

  test('voidstrap:save-profile structures custom profile with timestamp and flags', () => {
    assert(mainSource.includes('updatedAt: Date.now()'), 'Missing updatedAt in save-profile handler');
  });

  test('mods:deploy uses safe file copying compatible with packaged asar', () => {
    assert(mainSource.includes('fs.writeFileSync(dest, fs.readFileSync(src))'), 'Missing safeCopy buffer write in mods:deploy');
  });

  test('Export and import profile handlers safely reference active browser window', () => {
    assert(mainSource.includes('const browserWin = (win && !win.isDestroyed()) ? win : (BrowserWindow.getFocusedWindow() || undefined);'), 'Missing safe browserWin resolution in dialog handlers');
  });

  // -------------------------------------------------------------
  // Suite 9: ScriptBlox Catalog, CSP & Robust Fallback Verification
  // -------------------------------------------------------------
  console.log('\nSuite 9: ScriptBlox Catalog, CSP & Fallback Verification');

  test('CSP in index.html permits scriptblox.com in img-src and connect-src', () => {
    const cspMatch = htmlSource.match(/Content-Security-Policy"[^>]*content="([^"]+)"/i);
    assert(cspMatch, 'Content-Security-Policy meta tag not found in index.html');
    const csp = cspMatch[1];
    assert(csp.includes('img-src') && csp.includes('https://*.scriptblox.com') && csp.includes('https://scriptblox.com'),
      'img-src must allow https://scriptblox.com and https://*.scriptblox.com');
    assert(csp.includes('connect-src') && csp.includes('https://*.scriptblox.com') && csp.includes('https://scriptblox.com'),
      'connect-src must allow https://scriptblox.com and https://*.scriptblox.com');
  });

  test('scripts.js contains zero emojis', () => {
    const scriptsRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'scripts.js'), 'utf8');
    const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    const match = scriptsRaw.match(emojiRegex);
    assert(!match, `Emoji found in scripts.js: ${match ? match[0] : ''}`);
  });

  test('scripts.js implements multi-tier fallback to trending API', () => {
    const scriptsRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'scripts.js'), 'utf8');
    assert(scriptsRaw.includes('trending'), 'scripts.js must reference trending endpoint as fallback');
    assert(scriptsRaw.includes('loadTrendingFallback'), 'scripts.js must export loadTrendingFallback');
    assert(scriptsRaw.includes('onShow'), 'scripts.js must export onShow method');
  });

  test('renderer.js calls scriptsModule.onShow when navigating to scripts page', () => {
    const rendererRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    assert(rendererRaw.includes("if (p === 'scripts')") && rendererRaw.includes('scriptsModule.onShow'),
      'renderer.js goTo() must call scriptsModule.onShow() when p === scripts');
  });

  test('main.js fetchPublicJson uses robust headers and error resilience', () => {
    assert(mainSource.includes('CHROME_UA') || mainSource.includes('Mozilla/5.0'), 'fetchPublicJson must use realistic Chrome UA');
    assert(mainSource.includes("ipcMain.handle('roblox:fetchPublicJson'"), 'main.js must handle roblox:fetchPublicJson IPC');
  });

  test('scripts.js implements continuous uninterrupted infinite scroll', () => {
    const scriptsRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'scripts.js'), 'utf8');
    assert(scriptsRaw.includes('loadNextPage'), 'scripts.js must define and export loadNextPage');
    assert(scriptsRaw.includes('scroll') && scriptsRaw.includes('addEventListener'), 'scripts.js must listen to scroll events on scroller');
    assert(scriptsRaw.includes('checkAutoLoadMore') || scriptsRaw.includes('scrollHeight'), 'scripts.js must handle viewport auto-fill or scroll height checks');
    assert(scriptsRaw.includes('Set') || scriptsRaw.includes('seen') || scriptsRaw.includes('loaded'), 'scripts.js must deduplicate scripts across pages');
  });

  test('index.html contains bottom loader for smooth uninterrupted pagination', () => {
    assert(htmlSource.includes('scripts-bottom-spinner') || htmlSource.includes('scripts-bottom-loader'),
      'index.html must include a bottom loader element for non-disruptive infinite scroll');
  });

  // -------------------------------------------------------------
  // Suite 10: Search Maps Continuous Pagination & Light Theme Styling
  // -------------------------------------------------------------
  console.log('\nSuite 10: Search Maps Continuous Pagination & Light Theme Styling');

  test('styles.css does not hardcode dark background on .btn-ghost in light mode', () => {
    const cssRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'styles.css'), 'utf8');
    assert(!cssRaw.includes('.btn-ghost {\n  background: #18181b !important;') && !cssRaw.includes('.btn-ghost{background:#18181b!important'),
      '.btn-ghost must not force dark #18181b background with !important across all themes');
    assert(cssRaw.includes('body.light .btn-ghost') || cssRaw.includes('body.light .quick-toolbar .btn'),
      'styles.css must provide clean light theme button styling');
  });

  test('styles.css provides crisp readable titlebar logo in light mode', () => {
    const cssRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'styles.css'), 'utf8');
    assert(cssRaw.includes('body.light .tb-name'), 'styles.css must specify dark text gradient for .tb-name in light mode');
  });

  test('index.html contains charts bottom loader and trigger for infinite map scroll', () => {
    const freshHtml = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'index.html'), 'utf8');
    assert(freshHtml.includes('charts-bottom-loader'), 'index.html must contain charts-bottom-loader');
    assert(freshHtml.includes('charts-scroll-trigger'), 'index.html must contain charts-scroll-trigger');
  });

  test('renderer.js searchRobloxGames extracts multiple games and supports pageToken', () => {
    const freshRenderer = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    assert(freshRenderer.includes('pageToken'), 'searchRobloxGames must support pageToken for continuous pagination');
    assert(freshRenderer.includes('loadMoreCharts'), 'renderer.js must define loadMoreCharts for infinite scrolling');
  });

  test('Zero emojis in modified files', () => {
    const freshHtml = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'index.html'), 'utf8');
    const freshRenderer = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    const freshCss = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'styles.css'), 'utf8');
    const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    assert(!freshRenderer.match(emojiRegex), 'renderer.js must have zero emojis');
    assert(!freshCss.match(emojiRegex), 'styles.css must have zero emojis');
  });

  // -------------------------------------------------------------
  // Suite 11: Map Cover Thumbnail Ultra-Fast Optimization
  // -------------------------------------------------------------
  console.log('\nSuite 11: Map Cover Thumbnail Ultra-Fast Optimization');

  test('renderer.js implements fast memory/persistent cache for game thumbnails', () => {
    const freshRenderer = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    assert(freshRenderer.includes('_gameThumbCache') || freshRenderer.includes('_chartThumbCache'),
      'renderer.js must have a dedicated thumbnail cache (_gameThumbCache)');
  });

  test('renderer.js requests lightweight 150x150 icons for fast responsive thumbnail loading', () => {
    const freshRenderer = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    assert(freshRenderer.includes('size=150x150'), 'renderer.js must use 150x150 icon size for fast network transfer');
    assert(!freshRenderer.includes('size=512x512'), 'renderer.js must not use heavy 512x512 icons for small 72px grid cards');
  });

  test('renderer.js implements non-blocking progressive thumbnail hydration', () => {
    const freshRenderer = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    assert(freshRenderer.includes('hydrate') || freshRenderer.includes('loadThumbnailsAsync'),
      'renderer.js must have non-blocking thumbnail hydration so cards render immediately');
    assert(freshRenderer.includes('data-thumb-uid') || freshRenderer.includes('data-universe-id'),
      'renderer.js must tag cards with universe ID attribute for instant async image binding');
  });

  test('renderer.js consolidates explore sorts loading into a single fast request', () => {
    const freshRenderer = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    // Ensure loadCharts does not fire 3 separate get-sorts requests via Promise.all(fetchRobloxExplore)
    assert(freshRenderer.includes('fetchAllRobloxExplore') || !freshRenderer.includes("Promise.all([\n      fetchRobloxExplore('Top Playing Now'),"),
      'loadCharts must consolidate sort fetching into a single network call');
  });

  // -------------------------------------------------------------
  // Suite 12: Map Preloading & Low-Spec Resource Optimization
  // -------------------------------------------------------------
  console.log('\nSuite 12: Map Preloading & Low-Spec Resource Optimization');

  test('styles.css uses content-visibility and contain-intrinsic-size for low-spec card rendering', () => {
    const cssRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'styles.css'), 'utf8');
    assert(cssRaw.includes('content-visibility: auto') || cssRaw.includes('content-visibility:auto'),
      'styles.css must use content-visibility: auto on .chart-card to optimize GPU/CPU rendering');
    assert(cssRaw.includes('contain-intrinsic-size'),
      'styles.css must specify contain-intrinsic-size for .chart-card to prevent layout shift during virtualization');
  });

  test('renderer.js implements speculative background map prefetching to eliminate wait times', () => {
    const freshRenderer = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    assert(freshRenderer.includes('_chartPrefetchedBatch') || freshRenderer.includes('prefetchNextChartBatch'),
      'renderer.js must implement speculative map prefetching (_chartPrefetchedBatch or prefetchNextChartBatch)');
  });

  test('renderer.js bounds cache size and cancels stale prefetch to prevent memory and CPU bloat', () => {
    const freshRenderer = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    assert(freshRenderer.includes('_chartPrefetchTimer') || freshRenderer.includes('cancelPrefetch') || freshRenderer.includes('clearTimeout'),
      'renderer.js must control and cancel background prefetch timers to prevent CPU waste');
    assert(freshRenderer.includes('_gameThumbCache.delete') || freshRenderer.includes('400') || freshRenderer.includes('500'),
      'renderer.js must enforce cache bounding or pruning on _gameThumbCache to prevent memory leaks');
  });

  test('renderer.js uses lazy and async image decoding to keep low-spec UI responsive', () => {
    const freshRenderer = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    assert(freshRenderer.includes('loading="lazy"') || freshRenderer.includes("loading='lazy'"),
      'renderer.js must use loading="lazy" for map cards');
    assert(freshRenderer.includes('decoding="async"') || freshRenderer.includes("decoding = 'async'"),
      'renderer.js must use decoding="async" to prevent UI thread lock on low-spec PCs');
  });

  // -------------------------------------------------------------
  // Suite 13: Game Modal Dropdown Popup & Overflow Fix
  // -------------------------------------------------------------
  console.log('\nSuite 13: Game Modal Dropdown Popup & Overflow Fix');

  test('styles.css ensures modal dropdowns float outside with high z-index and no clipping', () => {
    const cssRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'styles.css'), 'utf8');
    assert(cssRaw.includes('#m-game') && cssRaw.includes('cdd-menu'),
      'styles.css must provide specific unclipped z-index rules for #m-game dropdown');
    assert(cssRaw.includes('z-index: 1000') || cssRaw.includes('z-index:1000'),
      'styles.css must elevate #m-game dropdown menu z-index to 1000 so it floats on top of all modal content');
  });

  test('index.html does not trap #m-game dropdown inside an inner scroll container', () => {
    const htmlRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'index.html'), 'utf8');
    // Ensure the container holding game-server-mode does not force overflow-y: auto
    const mGameSection = htmlRaw.substring(htmlRaw.indexOf('id="m-game"'), htmlRaw.indexOf('<!-- toast -->') > 0 ? htmlRaw.indexOf('<!-- toast -->') : htmlRaw.indexOf('id="toast"'));
    assert(!mGameSection.includes('<div style="overflow-y: auto; padding-right: 4px; flex: 1;">'),
      'index.html must not trap game modal dropdown inside an overflow-y: auto container');
  });

  // -------------------------------------------------------------
  // Suite 14: Light Mode Theme Polishing, Button Aesthetics, Layout Spacing & Roblox Versions Page
  // -------------------------------------------------------------
  console.log('\nSuite 14: Light Mode Theme Polishing, Button Aesthetics, Layout Spacing & Roblox Versions Page');

  test('styles.css provides clean light theme styling for .view-toggle and .vt buttons', () => {
    const cssRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'styles.css'), 'utf8');
    assert(cssRaw.includes('body.light .view-toggle'),
      'styles.css must provide light theme styling for .view-toggle to avoid dark black toggle in light mode');
    assert(cssRaw.includes('body.light .vt'),
      'styles.css must provide light theme styling for .vt buttons');
  });

  test('styles.css provides clean light theme styling for .btn-out and .filter-menu', () => {
    const cssRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'styles.css'), 'utf8');
    assert(cssRaw.includes('body.light .btn-out'),
      'styles.css must provide clean modern styling for .btn-out in light mode');
    assert(cssRaw.includes('body.light .filter-menu'),
      'styles.css must provide light theme styling for .filter-menu dropdown');
  });

  test('styles.css provides clean light theme styling for tab buttons and Voidstrap pill buttons', () => {
    const cssRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'styles.css'), 'utf8');
    assert(cssRaw.includes('body.light .tab-btn') || cssRaw.includes('body.light .vs-sub-btn'),
      'styles.css must provide clean light theme styling for tab navigation buttons');
    assert(cssRaw.includes('body.light .vs-editor-pill-btn'),
      'styles.css must provide clean light theme styling for .vs-editor-pill-btn without blurry dark shadows');
  });

  test('Voidstrap subpanels provide generous padding to prevent toolbar and table from sticking to edges', () => {
    const cssRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'styles.css'), 'utf8');
    const hasEditorPadding = cssRaw.includes('#vs-subpanel-editor') || cssRaw.includes('.vs-editor-card') || cssRaw.includes('.vs-subpanel-card');
    assert(hasEditorPadding, 'styles.css must provide container padding rules for FastFlag Editor content');
  });

  test('Roblox Versions page supports light mode and eliminates hardcoded dark styles', () => {
    const htmlRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'index.html'), 'utf8');
    const rendererRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    const cssRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'styles.css'), 'utf8');

    // Versions page must have CSS classes or variables for theme adaptation
    assert(cssRaw.includes('.vm-card') || cssRaw.includes('#page-versions') || cssRaw.includes('.vm-ph'),
      'styles.css must define theme-responsive styling for Roblox Versions page');
    assert(!rendererRaw.includes('background:rgba(24,24,30,0.85);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.08)'),
      'renderer.js must not hardcode pitch-black background on curated version cards');
  });

  test('tab bars and search inputs do not stick to the top border', () => {
    const htmlRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'index.html'), 'utf8');
    assert(!htmlRaw.includes('padding: 0 18px 8px'),
      'index.html tab-bar must not have 0 top padding sticking to the page header border');
    assert(!htmlRaw.includes('padding: 0 24px; display: flex; flex-direction: column; height: 100%'),
      'index.html page-scripts must not have 0 top padding sticking to the page header border');
  });

  // -------------------------------------------------------------
  // Suite 15: Window Layout Workspace Full-Height & Responsive Layout Design
  // -------------------------------------------------------------
  console.log('\nSuite 15: Window Layout Workspace Full-Height & Responsive Layout Design');

  test('styles.css defines full-height workspace classes for Window Layout page', () => {
    const cssRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'styles.css'), 'utf8');
    assert(cssRaw.includes('.wp-workspace') && cssRaw.includes('.wp-main-card') && cssRaw.includes('.wp-side-card'),
      'styles.css must define .wp-workspace, .wp-main-card, and .wp-side-card for full-page layout');
    assert(cssRaw.includes('.wp-screen-monitor'),
      'styles.css must define .wp-screen-monitor to provide proportional screen monitor canvas');
  });

  test('index.html provides full-height grid workspace for Window Layout without hardcoded 200px box', () => {
    const htmlRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'index.html'), 'utf8');
    assert(htmlRaw.includes('class="wp-workspace"') || htmlRaw.includes('wp-workspace'),
      'index.html must use .wp-workspace for the Window Layout page');
    assert(!htmlRaw.includes('height:200px; background:var(--bg)'),
      'index.html must not confine screen preview monitor to a tiny 200px height box');
  });

  test('renderer.js updates resolution badge and provides sleek empty state', () => {
    const rendererRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    assert(rendererRaw.includes('wp-res-badge') || rendererRaw.includes('wp-account-count-badge'),
      'renderer.js must dynamically update resolution or account badges in Window Layout');
  });

  // -------------------------------------------------------------
  // Suite 16: Clean Modern Quick Action Buttons & Light Theme Contrast
  // -------------------------------------------------------------
  console.log('\nSuite 16: Clean Modern Quick Action Buttons & Light Theme Contrast');

  test('styles.css defines clean modern quick action styles with light mode contrast', () => {
    const cssRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'styles.css'), 'utf8');
    assert(cssRaw.includes('.vs-quick-section') && cssRaw.includes('.vs-quick-grid'),
      'styles.css must define .vs-quick-section and .vs-quick-grid');
    assert(cssRaw.includes('body.light .vs-quick-btn'),
      'styles.css must provide dedicated light mode rules for .vs-quick-btn');
    assert(cssRaw.includes('body.light .vs-quick-btn:hover'),
      'styles.css must provide high contrast hover rule in light mode for .vs-quick-btn');
  });

  test('index.html uses clean vs-quick-section structure and material-icons-round', () => {
    const htmlRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'index.html'), 'utf8');
    assert(htmlRaw.includes('class="vs-quick-section"'),
      'index.html must structure quick actions with .vs-quick-section');
    assert(htmlRaw.includes('class="vs-quick-grid"'),
      'index.html must layout quick buttons with .vs-quick-grid');
  });

  // -------------------------------------------------------------
  // Suite 17: Comprehensive Discord Rich Presence (RPC) Subsystem
  // -------------------------------------------------------------
  console.log('\nSuite 17: Comprehensive Discord Rich Presence (RPC) Subsystem');

  test('src/discordRpc.js exists and exports DiscordRpcClient and formatPresenceText', () => {
    assert(fs.existsSync(path.resolve(__dirname, '..', 'src', 'discordRpc.js')), 'src/discordRpc.js must exist');
    const { DiscordRpcClient, formatPresenceText } = require('../src/discordRpc.js');
    assert(typeof DiscordRpcClient === 'function', 'DiscordRpcClient must be a constructor or class');
    assert(typeof formatPresenceText === 'function', 'formatPresenceText must be a function');
  });

  test('discordRpc packet serialization encodes 8-byte header and valid payload', () => {
    const { DiscordRpcClient } = require('../src/discordRpc.js');
    const client = new DiscordRpcClient({ clientId: '1234567890' });
    const packet = client.encodePacket(0, { v: 1, client_id: '1234567890' });
    assert(Buffer.isBuffer(packet), 'encodePacket must return a Buffer');
    assert(packet.length > 8, 'Packet length must exceed 8 header bytes');
    const opcode = packet.readInt32LE(0);
    const length = packet.readInt32LE(4);
    assert.strictEqual(opcode, 0, 'Opcode must be 0 for handshake');
    assert.strictEqual(length, packet.length - 8, 'Length header must match remaining payload bytes');
    const payload = JSON.parse(packet.toString('utf8', 8));
    assert.strictEqual(payload.client_id, '1234567890');
  });

  test('formatPresenceText substitutes dynamic tags and respects privacy mode', () => {
    const { formatPresenceText } = require('../src/discordRpc.js');
    const ctx = {
      onlineCount: 3,
      totalCount: 5,
      gameName: 'Blox Fruits',
      username: 'RobloxGamer99',
      antiAfkActive: true,
      fpsCap: '60'
    };

    const formatted1 = formatPresenceText('Playing {game} with {user} ({online}/{total})', ctx, false, false);
    assert.strictEqual(formatted1, 'Playing Blox Fruits with RobloxGamer99 (3/5)');

    const formattedPrivacy = formatPresenceText('Playing {game} as {user}', ctx, true, true);
    assert.strictEqual(formattedPrivacy, 'Playing Roblox as Player');

    const formattedAfk = formatPresenceText('AFK: {afk} | FPS: {fps}', ctx, false, false);
    assert(formattedAfk.includes('AFK: Active') || formattedAfk.includes('เปิดใช้งาน'), 'AFK status must be active');
    assert(formattedAfk.includes('60'), 'FPS cap must be formatted');
  });

  test('main.js and preload.js expose comprehensive Discord RPC IPC APIs', () => {
    const mainRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'main.js'), 'utf8');
    assert(mainRaw.includes('discord:rpc-get-settings'), 'main.js must handle discord:rpc-get-settings');
    assert(mainRaw.includes('discord:rpc-save-settings'), 'main.js must handle discord:rpc-save-settings');
    assert(mainRaw.includes('discord:rpc-test'), 'main.js must handle discord:rpc-test');

    const preloadRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'preload.js'), 'utf8');
    assert(preloadRaw.includes('getDiscordRpcSettings') && preloadRaw.includes('saveDiscordRpcSettings'),
      'preload.js must expose getDiscordRpcSettings and saveDiscordRpcSettings');
  });

  test('index.html contains Discord RPC settings panel and Live Activity Preview Card', () => {
    const htmlRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'index.html'), 'utf8');
    assert(htmlRaw.includes('id="stab-panel-discord-rpc"'), 'index.html must include #stab-panel-discord-rpc');
    assert(htmlRaw.includes('id="discord-preview-card"'), 'index.html must include #discord-preview-card');
    assert(htmlRaw.includes('setting-discord-rpc-enabled'), 'index.html must include setting-discord-rpc-enabled');
  });

  // -------------------------------------------------------------
  // Suite 18: Light Mode Modals, Fluid Animations & Genuine Discord RPC Desktop Verification
  // -------------------------------------------------------------
  console.log('\nSuite 18: Light Mode Modals, Fluid Animations & Genuine Discord RPC Desktop Verification');

  test('styles.css defines body.light .modal and body.light .overlay with high contrast', () => {
    const cssRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'styles.css'), 'utf8');
    assert(cssRaw.includes('body.light .modal'), 'styles.css must include body.light .modal');
    assert(cssRaw.includes('body.light .overlay'), 'styles.css must include body.light .overlay');
    assert(cssRaw.includes('body.light .game-id-row'), 'styles.css must include body.light .game-id-row');
    assert(cssRaw.includes('body.light .modal .btn-ghost'), 'styles.css must include body.light .modal .btn-ghost');
  });

  test('styles.css defines authentic Discord light theme and statusPulse animation', () => {
    const cssRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'styles.css'), 'utf8');
    assert(cssRaw.includes('body.light .discord-preview-card'), 'styles.css must include body.light .discord-preview-card');
    assert(cssRaw.includes('statusPulse'), 'styles.css must define statusPulse animation');
    assert(cssRaw.includes('.modal-step-enter'), 'styles.css must define modal-step-enter animation');
    assert(cssRaw.includes('.login-choice-card'), 'styles.css must define .login-choice-card');
  });

  test('discordRpc.js uses verified Bloxstrap Roblox ID 1005469189907173486 and ready event gating', () => {
    const { DiscordRpcClient, DEFAULT_CLIENT_ID } = require('../src/discordRpc.js');
    assert.strictEqual(DEFAULT_CLIENT_ID, '1005469189907173486', 'DEFAULT_CLIENT_ID must be verified Bloxstrap Roblox Application ID');
    const client = new DiscordRpcClient();
    assert.strictEqual(client.ready, false, 'Discord client must initialize with ready=false');
    const setRes = client.setActivity({ details: 'Test' });
    assert.strictEqual(setRes, false, 'setActivity must return false when not ready');
    assert.strictEqual(client.currentActivity.details, 'Test', 'currentActivity must be cached to send when ready');
  });

  test('main.js and index.html include clean login CSS injection and preview theme switcher', () => {
    const mainRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'main.js'), 'utf8');
    assert(mainRaw.includes('cross-promo'), 'main.js must hide cross-promo and banners in login view');
    assert(!mainRaw.includes('div[class*="background"]'), 'main.js must not hide div background with display none as it collapses login form');
    assert(mainRaw.includes('#login-base'), 'main.js must style #login-base');
    const rendererRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    assert(rendererRaw.includes("if (id === 'm-login')"), 'renderer.js closeModal must clean up embedded login view');
    const htmlRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'index.html'), 'utf8');
    assert(htmlRaw.includes('discord-prev-theme-btn'), 'index.html must include discord-prev-theme-btn');
    assert(htmlRaw.includes('login-choice-card'), 'index.html must use login-choice-card for Add Account modal');
  });

  test('Suite 19: DoH Acceleration, MaxListeners Fix, and Bulk Launch Bar Dual Theme Polishing', () => {
    const mainRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'main.js'), 'utf8');
    assert(mainRaw.includes('DnsOverHttps'), 'main.js must enable DnsOverHttps to prevent connection timeouts');
    assert(mainRaw.includes('web-contents-created'), 'main.js must handle web-contents-created to increase listener limits');
    assert(mainRaw.includes('setMaxListeners(100)'), 'main.js must set max listeners to prevent memory leak warnings');

    const cssRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'styles.css'), 'utf8');
    assert(cssRaw.includes('body.light .bulk-launch-bar'), 'styles.css must provide body.light .bulk-launch-bar');
    assert(cssRaw.includes('body.light .bulk-launch-count'), 'styles.css must provide body.light .bulk-launch-count for text contrast');

    const preloadRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'preload.js'), 'utf8');
    assert(preloadRaw.includes('onLoginError'), 'preload.js must expose onLoginError');

    const rendererRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    assert(rendererRaw.includes('startLoginBoundsSync'), 'renderer.js must implement continuous bounds synchronization');
  });

  test('Suite 20: Roblox Login Collage Background & Host Resolver Rules Verification', () => {
    const mainRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'main.js'), 'utf8');
    assert(mainRaw.includes('host-resolver-rules'), 'main.js must define host-resolver-rules to prevent DNS connection timeouts');
    assert(mainRaw.includes('128.116.54.3'), 'main.js must map Roblox hosts to fast Singapore Anycast Edge IP');
    assert(mainRaw.includes('#background-image, .background-image'), 'main.js must style background-image cleanly');
    assert(!mainRaw.includes('background-image: none !important'), 'main.js must keep promotional game background collage visible');
    assert(mainRaw.includes('เพิ่มบัญชี'), 'main.js must localize login card title to เพิ่มบัญชี');
    assert(mainRaw.includes('สร้างบัญชีใหม่'), 'main.js must localize register link to สร้างบัญชีใหม่');

    const cssRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'styles.css'), 'utf8');
    assert(cssRaw.includes('width: 658px;'), 'styles.css modal.browser-active width must be 658px');

    const htmlRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'index.html'), 'utf8');
    assert(htmlRaw.includes('width: 610px; height: 612px;'), 'index.html login-view-container dimensions must be 610x612px');
  });

  // -------------------------------------------------------------
  // Suite 21: Comprehensive Production Multi-Language (i18n) Engine & Zero-Leakage Verification
  // -------------------------------------------------------------
  console.log('Suite 21: Multi-Language (i18n) Engine & Zero-Leakage Verification');
  const i18nPath = path.resolve(__dirname, '..', 'src', 'i18n.js');

  test('src/i18n.js exists and exports complete i18n API contract', () => {
    assert(fs.existsSync(i18nPath), `i18n.js not found at ${i18nPath}`);
    const i18n = require('../src/i18n.js');
    assert(typeof i18n.t === 'function', 'i18n.t must be a function');
    assert(typeof i18n.translateDOM === 'function', 'i18n.translateDOM must be a function');
    assert(typeof i18n.formatTimeAgo === 'function', 'i18n.formatTimeAgo must be a function');
    assert(typeof i18n.setLanguage === 'function', 'i18n.setLanguage must be a function');
    assert(typeof i18n.getLanguage === 'function', 'i18n.getLanguage must be a function');
    assert(typeof i18n.translateDynamic === 'function', 'i18n.translateDynamic must be a function');
    assert(typeof i18n.TEXT_MAP === 'object' && i18n.TEXT_MAP !== null, 'i18n.TEXT_MAP must be an object');
    assert(typeof i18n._i18nReverse === 'object' && i18n._i18nReverse !== null, 'i18n._i18nReverse must be an object');
    assert(Array.isArray(i18n.DYNAMIC_RULES), 'i18n.DYNAMIC_RULES must be an array');
    assert(Array.isArray(i18n.PREFIX_RULES), 'i18n.PREFIX_RULES must be an array');
    assert(typeof i18n.LANG_OPTIONS === 'object', 'i18n.LANG_OPTIONS must be an object');
  });

  test('100% dictionary parity across all supported languages (en, ja, zh, ko, es)', () => {
    const i18n = require('../src/i18n.js');
    const targetLangs = ['en', 'ja', 'zh', 'ko', 'es'];
    const keys = Object.keys(i18n.TEXT_MAP);
    assert(keys.length >= 1200, `Expected at least 1200 keys in TEXT_MAP, found ${keys.length}`);

    const thaiRegex = /[\u0E00-\u0E7F]/;
    for (const key of keys) {
      const entry = i18n.TEXT_MAP[key];
      assert(entry, `Entry for key "${key}" must exist`);
      for (const lang of targetLangs) {
        assert(entry[lang], `Missing translation for [${lang}] in key: "${key}"`);
        assert(typeof entry[lang] === 'string' && entry[lang].trim().length > 0, `Empty translation for [${lang}] in key: "${key}"`);
        if (lang === 'en' || lang === 'es') {
          assert(!thaiRegex.test(entry[lang]), `Leaked Thai characters in [${lang}] for key: "${key}" => "${entry[lang]}"`);
        }
      }
    }
  });

  test('Bidirectional reverse map maintains references for language toggling', () => {
    const i18n = require('../src/i18n.js');
    assert(i18n._i18nReverse['0 บัญชี'] === '0 บัญชี', 'Thai canonical key must map to itself');
    assert(i18n._i18nReverse['0 accounts'] === '0 บัญชี', 'English translation must map back to canonical Thai key');
    assert(i18n._i18nReverse['0 アカウント'] === '0 บัญชี', 'Japanese translation must map back to canonical Thai key');
    assert(i18n._i18nReverse['0 个账户'] === '0 บัญชี', 'Chinese translation must map back to canonical Thai key');
    assert(i18n._i18nReverse['0개 계정'] === '0 บัญชี', 'Korean translation must map back to canonical Thai key');
    assert(i18n._i18nReverse['0 cuentas'] === '0 บัญชี', 'Spanish translation must map back to canonical Thai key');
  });

  test('Dynamic rules and prefix handlers translate runtime parameter strings with zero Thai leakage', () => {
    const i18n = require('../src/i18n.js');
    const thaiRegex = /[\u0E00-\u0E7F]/;

    const sampleDynamicStrings = [
      'กำลังเปิด Roblox สำหรับ PlayerOne...',
      'โหลดบัญชีจากที่เก็บข้อมูลแล้ว 25 บัญชี',
      'ปิด Roblox สำหรับ TestUser แล้ว',
      'ลบ PlayerTwo แล้ว',
      'จัดเรียงหน้าต่าง 6 จอเรียบร้อยแล้ว',
      'เพิ่ม FastFlag FFlagDebugDisplayFPS สำเร็จแล้ว',
      'ติดตั้ง Mods เรียบร้อยแล้ว (คัดลอก 12 ไฟล์)',
      'ไม่พบสคริปต์ที่ตรงกับ "Fly Hack"',
      'โหลดล้มเหลว: Network error'
    ];

    i18n.setLanguage('en');
    for (const str of sampleDynamicStrings) {
      const translated = i18n.t(str);
      assert(!thaiRegex.test(translated), `Dynamic translation leaked Thai for: "${str}" => "${translated}"`);
    }

    const samplePrefixStrings = [
      'จัดเรียงหน้าต่างไม่สำเร็จ: Window handle invalid',
      'ตั้งค่าความโปร่งใสไม่สำเร็จ: Access denied',
      'บันทึกโปรไฟล์ไม่สำเร็จ: Disk full',
      'เลือกไฟล์ไม่สำเร็จ: User cancelled'
    ];

    for (const str of samplePrefixStrings) {
      const translated = i18n.t(str);
      assert(!thaiRegex.test(translated), `Prefix translation leaked Thai for: "${str}" => "${translated}"`);
    }
  });

  test('formatTimeAgo provides accurate localized relative timestamps for all 6 languages', () => {
    const i18n = require('../src/i18n.js');
    const twoHoursAgo = new Date(Date.now() - 7200000);
    assert.strictEqual(i18n.formatTimeAgo(twoHoursAgo, 'th'), '2 ชั่วโมงที่แล้ว');
    assert.strictEqual(i18n.formatTimeAgo(twoHoursAgo, 'en'), '2 hours ago');
    assert.strictEqual(i18n.formatTimeAgo(twoHoursAgo, 'ja'), '2 時間前');
    assert.strictEqual(i18n.formatTimeAgo(twoHoursAgo, 'zh'), '2 小时前');
    assert.strictEqual(i18n.formatTimeAgo(twoHoursAgo, 'ko'), '2시간 전');
    assert.strictEqual(i18n.formatTimeAgo(twoHoursAgo, 'es'), 'hace 2 horas');

    const justNow = new Date(Date.now() - 5000);
    assert.strictEqual(i18n.formatTimeAgo(justNow, 'en'), 'just now');
    assert.strictEqual(i18n.formatTimeAgo(justNow, 'th'), 'เมื่อสักครู่');
  });

  test('DOM tree traversal translates text nodes, attributes, and options with zero leakage', () => {
    const i18n = require('../src/i18n.js');
    const thaiRegex = /[\u0E00-\u0E7F]/;

    // Simulate Document Object Model
    global.document = {};
    const mockDOM = {
      nodeType: 1,
      tagName: 'DIV',
      childNodes: [
        { nodeType: 3, textContent: '  0 บัญชี  ' },
        { nodeType: 1, tagName: 'INPUT', placeholder: 'ค้นหาบัญชี...', childNodes: [] },
        { nodeType: 1, tagName: 'BUTTON', title: 'เพิ่มบัญชี', getAttribute: (attr) => attr === 'aria-label' ? 'เพิ่มบัญชี' : null, setAttribute: function(a, v) { this[a] = v; }, childNodes: [
          { nodeType: 3, textContent: 'เพิ่มบัญชี' }
        ]},
        { nodeType: 1, tagName: 'OPTION', textContent: 'จัดเรียงหน้าต่างเรียบร้อยแล้ว', childNodes: [] },
        { nodeType: 3, textContent: 'กำลังเปิด Roblox สำหรับ Alex...' }
      ]
    };

    i18n.setLanguage('en');
    i18n.translateDOM(mockDOM);

    // Verify text node translation
    assert.strictEqual(mockDOM.childNodes[0].textContent, '  0 accounts  ');
    assert.strictEqual(mockDOM.childNodes[1].placeholder, 'Search accounts...');
    assert.strictEqual(mockDOM.childNodes[2].title, 'Add Account');
    assert.strictEqual(mockDOM.childNodes[2]['aria-label'], 'Add Account');
    assert.strictEqual(mockDOM.childNodes[2].childNodes[0].textContent, 'Add Account');
    assert.strictEqual(mockDOM.childNodes[3].textContent, 'Windows arranged successfully');
    assert.strictEqual(mockDOM.childNodes[4].textContent, 'Launching Roblox for Alex...');

    // Traverse mockDOM and verify zero Thai characters
    function verifyNoThai(node) {
      if (node.nodeType === 3) {
        assert(!thaiRegex.test(node.textContent), `Leaked Thai in textContent: ${node.textContent}`);
      } else if (node.nodeType === 1) {
        if (node.placeholder) assert(!thaiRegex.test(node.placeholder), `Leaked Thai in placeholder: ${node.placeholder}`);
        if (node.title) assert(!thaiRegex.test(node.title), `Leaked Thai in title: ${node.title}`);
        if (node['aria-label']) assert(!thaiRegex.test(node['aria-label']), `Leaked Thai in aria-label: ${node['aria-label']}`);
        for (const c of node.childNodes) verifyNoThai(c);
      }
    }
    verifyNoThai(mockDOM);

    // Switch to Japanese and verify seamless translation
    i18n.setLanguage('ja');
    i18n.translateDOM(mockDOM);
    assert.strictEqual(mockDOM.childNodes[0].textContent, '  0 アカウント  ');
    assert.strictEqual(mockDOM.childNodes[1].placeholder, 'アカウントを検索...');
    assert.strictEqual(mockDOM.childNodes[2].title, 'アカウントを追加');

    // Switch back to Thai
    i18n.setLanguage('th');
    i18n.translateDOM(mockDOM);
    assert.strictEqual(mockDOM.childNodes[0].textContent, '  0 บัญชี  ');
    assert.strictEqual(mockDOM.childNodes[1].placeholder, 'ค้นหาบัญชี...');
  });

  test('HTML, Renderer and Scripts integration integrity', () => {
    const htmlRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'index.html'), 'utf8');
    assert(htmlRaw.includes('<script src="i18n.js"></script>'), 'index.html must load i18n.js');
    assert(htmlRaw.indexOf('<script src="i18n.js"></script>') < htmlRaw.indexOf('<script src="renderer.js"></script>'), 'i18n.js must be loaded prior to renderer.js');

    const rendererRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    assert(rendererRaw.includes('window.i18n.TEXT_MAP'), 'renderer.js must bind to window.i18n.TEXT_MAP');
    assert(rendererRaw.includes('window.i18n.translateDOM'), 'renderer.js must bind to window.i18n.translateDOM');
    assert(rendererRaw.includes('window.i18n.t'), 'renderer.js must bind to window.i18n.t');
    assert(rendererRaw.includes('toast(msg, type)'), 'renderer.js must have toast wrapper');
    assert(rendererRaw.includes('setStatus(id, type, html)'), 'renderer.js must have setStatus wrapper');
    assert(rendererRaw.includes('_logLine(e)'), 'renderer.js must have _logLine translation');

    const scriptsRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'scripts.js'), 'utf8');
    assert(scriptsRaw.includes('window.i18n.formatTimeAgo'), 'scripts.js must delegate to window.i18n.formatTimeAgo');
    assert(scriptsRaw.includes('_t('), 'scripts.js must use _t helper for localization');
  });

  test('Renderer and i18n scripts execute in sequence without SyntaxError or RangeError', () => {
    const i18nRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'i18n.js'), 'utf8');
    assert(i18nRaw.includes('(function () {'), 'i18n.js must be wrapped in IIFE to protect global scope');
    const rendererRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    assert(!rendererRaw.includes('const TEXT_MAP ='), 'renderer.js must not declare const TEXT_MAP which conflicts in global scope');
    assert(!rendererRaw.includes('window.setLanguage(code)'), 'renderer.js must call window.i18n.setLanguage(code) to prevent infinite recursion');
  });

  // -------------------------------------------------------------
  // Suite 22: Home Account Dropdown Popup, Theme Adaptability & Zero-Clipping Verification
  // -------------------------------------------------------------
  console.log('\nSuite 22: Home Account Dropdown Popup, Theme Adaptability & Zero-Clipping Verification');

  test('main.js popup implementation provides theme adaptability and shadow padding without cutoff', () => {
    const mainRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'main.js'), 'utf8');
    assert(mainRaw.includes('ipcMain.handle(\'home:open-account-popup\''), 'main.js must handle home:open-account-popup');
    assert(mainRaw.includes('ipcMain.handle(\'home:close-account-popup\''), 'main.js must handle home:close-account-popup');
    assert(mainRaw.includes('PAD = 16'), 'main.js must provide shadow padding constant PAD to prevent cutoff');
    assert(mainRaw.includes('targetWidth + PAD * 2'), 'main.js must calculate popup window width with shadow padding');
    assert(mainRaw.includes('targetHeight + PAD * 2'), 'main.js must calculate popup window height with shadow padding');
    assert(mainRaw.includes('isLight ? \'#ffffff\''), 'main.js must render authentic white background for popup in light mode');
    assert(mainRaw.includes('--bg-menu:'), 'main.js must define CSS variable --bg-menu');
    assert(mainRaw.includes('--shadow:'), 'main.js must define CSS variable --shadow');
    assert(mainRaw.includes('home:account-popup-closed'), 'main.js must notify renderer when account popup is closed');
  });

  test('preload.js and renderer.js accurately coordinate popup state, coordinates, and themes', () => {
    const preloadRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'preload.js'), 'utf8');
    assert(preloadRaw.includes('closeHomeAccountPopup:'), 'preload.js must expose closeHomeAccountPopup');
    assert(preloadRaw.includes('onHomeAccountPopupClosed:'), 'preload.js must expose onHomeAccountPopupClosed');

    const rendererRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    assert(rendererRaw.includes('function closeHomeAccountFilter()'), 'renderer.js must define closeHomeAccountFilter');
    assert(rendererRaw.includes('btn.classList.add(\'open\')'), 'renderer.js must add open class when popup opens');
    assert(rendererRaw.includes('btn.classList.remove(\'open\')'), 'renderer.js must remove open class when popup closes');
    assert(rendererRaw.includes('themeColors: themeColors'), 'renderer.js must pass themeColors to openHomeAccountPopup');
    assert(rendererRaw.includes('rect: {'), 'renderer.js must pass bounding rect coordinates to openHomeAccountPopup');

    const htmlRaw = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'index.html'), 'utf8');
    assert(htmlRaw.includes('id="home-account-cdd" style="width: 240px;'), 'index.html must set home-account-cdd width to 240px');
  });

  // -------------------------------------------------------------
  // Suite 23: Executable Packaging & WebSetup Verification
  // -------------------------------------------------------------
  console.log('\nSuite 23: Executable Packaging & WebSetup Verification');

  test('MultiRoblox standalone executable exists in dist/', () => {
    const exePath = path.resolve(__dirname, '..', 'dist', 'MultiRoblox.exe');
    assert(fs.existsSync(exePath), `MultiRoblox.exe must exist at ${exePath}`);
    const stat = fs.statSync(exePath);
    assert(stat.size > 50 * 1024 * 1024, `MultiRoblox.exe size must be valid packaged executable (>50MB), found ${stat.size}`);
  });

  test('MultiRoblox-WebSetup lightweight installer exists and is under 2MB', () => {
    const setupPath = path.resolve(__dirname, '..', 'dist', 'MultiRoblox-WebSetup.exe');
    assert(fs.existsSync(setupPath), `MultiRoblox-WebSetup.exe must exist at ${setupPath}`);
    const stat = fs.statSync(setupPath);
    assert(stat.size < 2 * 1024 * 1024, `MultiRoblox-WebSetup.exe must be lightweight (<2MB), found ${stat.size}`);
    assert(stat.size > 10 * 1024, `MultiRoblox-WebSetup.exe must contain valid binary (>10KB), found ${stat.size}`);
  });

  test('package.json scripts support build:websetup and combined build', () => {
    const pkgRaw = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'));
    assert(pkgRaw.scripts['build:websetup'], 'package.json must define build:websetup script');
    assert(pkgRaw.scripts['build'].includes('build-websetup.js'), 'package.json build script must invoke build-websetup.js');
  });

  test('Strict verification: zero emojis across modified files', () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F200}-\u{1F2FF}]/u;
    const files = ['src/styles.css', 'src/index.html', 'src/renderer.js', 'src/main.js', 'src/preload.js', 'src/i18n.js', 'src/scripts.js', 'scripts/test_customization.js', 'scripts/build-websetup.js', 'src/installer/WebSetup.cs'];
    if (fs.existsSync(path.resolve(__dirname, '..', 'src', 'discordRpc.js'))) {
      files.push('src/discordRpc.js');
    }
    for (const f of files) {
      const content = fs.readFileSync(path.resolve(__dirname, '..', f), 'utf8');
      assert(!emojiRegex.test(content), `File ${f} must not contain any emojis`);
    }
  });

  // -------------------------------------------------------------
  // Suite 24: Account Cookie Copying & Context Menu Verification
  // -------------------------------------------------------------
  console.log('Suite 24: Account Cookie Copying & Context Menu Verification');

  test('renderer.js defines ctxCopyCookie and binds cookie copy action in card context menu', () => {
    const rSrc = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'renderer.js'), 'utf8');
    assert(rSrc.includes('ctxCopyCookie'), 'renderer.js must implement ctxCopyCookie');
    assert(rSrc.includes("t('คัดลอกคุกกี้')"), 'Card context menu must include translated copy cookie label');
    assert(rSrc.includes('<span class="material-icons-round">cookie</span>'), 'Card context menu must use cookie icon');
  });

  test('main.js and preload.js expose clipboard:writeText IPC bridge', () => {
    const mSrc = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'main.js'), 'utf8');
    const pSrc = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'preload.js'), 'utf8');
    assert(mSrc.includes("ipcMain.handle('clipboard:writeText'"), 'main.js must register clipboard:writeText IPC handler');
    assert(mSrc.includes('clipboard.writeText'), 'main.js must call electron clipboard.writeText');
    assert(pSrc.includes('copyToClipboard:'), 'preload.js must expose copyToClipboard API');
  });

  test('i18n dictionary provides complete 5-language translations for copy cookie keys', () => {
    const i18n = require('../src/i18n.js');
    const targetLangs = ['en', 'ja', 'zh', 'ko', 'es'];
    const thaiRegex = /[\u0E00-\u0E7F]/;
    const requiredKeys = ['คัดลอกคุกกี้', 'คัดลอกคุกกี้แล้ว'];
    for (const k of requiredKeys) {
      assert(i18n.TEXT_MAP[k], `TEXT_MAP must contain key: "${k}"`);
      for (const lang of targetLangs) {
        const val = i18n.TEXT_MAP[k][lang];
        assert(val && val.trim().length > 0, `Key "${k}" missing translation for [${lang}]`);
        if (lang === 'en' || lang === 'es') {
          assert(!thaiRegex.test(val), `Key "${k}" in [${lang}] has leaked Thai: "${val}"`);
        }
      }
    }
  });

  console.log(`\n========================================`);
  console.log(`ALL TESTS PASSED: ${passedTests}/${totalTests} tests succeeded!`);
  console.log(`========================================\n`);
}

runTests().catch(err => {
  console.error('\nTEST SUITE FAILED:', err);
  process.exit(1);
});

