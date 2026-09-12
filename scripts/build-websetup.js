const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function findCsc() {
  const candidates = [
    'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe',
    'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe'
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function buildWebSetup() {
  if (process.platform !== 'win32') {
    console.log('[build-websetup] Non-Windows host, skipping WebSetup compilation.');
    return;
  }

  const csc = findCsc();
  if (!csc) {
    console.error('[build-websetup] csc.exe (.NET C# compiler) not found.');
    process.exit(1);
  }

  const rootDir = path.resolve(__dirname, '..');
  const distDir = path.join(rootDir, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const sourceFile = path.join(rootDir, 'src', 'installer', 'WebSetup.cs');
  const iconFile = path.join(rootDir, 'src', 'icon.ico');
  const outFile = path.join(distDir, 'MultiRoblox-WebSetup.exe');

  if (!fs.existsSync(sourceFile)) {
    console.error('[build-websetup] Source file missing:', sourceFile);
    process.exit(1);
  }

  console.log('[build-websetup] Compiling MultiRoblox-WebSetup.exe using csc.exe ...');

  const args = [
    '/nologo',
    '/target:winexe',
    '/optimize+',
    '/platform:anycpu',
    '/r:System.dll,System.Windows.Forms.dll,System.Drawing.dll,Microsoft.CSharp.dll,System.Core.dll',
    `/out:${outFile}`
  ];

  if (fs.existsSync(iconFile)) {
    args.push(`/win32icon:${iconFile}`);
  }

  args.push(sourceFile);

  const res = spawnSync(csc, args, { stdio: 'inherit', cwd: rootDir });
  if (res.status !== 0) {
    console.error('[build-websetup] Compilation failed with status:', res.status);
    process.exit(1);
  }

  if (fs.existsSync(outFile)) {
    const stats = fs.statSync(outFile);
    const kb = (stats.size / 1024).toFixed(1);
    console.log(`[build-websetup] SUCCESS -> ${outFile} (${kb} KB)`);
  } else {
    console.error('[build-websetup] Output executable not found after compile.');
    process.exit(1);
  }
}

buildWebSetup();
