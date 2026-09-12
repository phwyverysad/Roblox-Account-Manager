# Voidstrap Suite Integration Design Specification

## Overview
Integration of Voidstrap / Bloxstrap advanced client management capabilities into MultiRoblox. This specification defines five modules embedded within the "ปรับแต่ง (Mixer)" page under the "Voidstrap & FastFlags" section:
1. Configuration (Profiles, JSON Import/Export, Multi-target synchronization)
2. FastFlag Settings (Categorized collapsible cards for presets, rendering, performance, and UI)
3. FastFlag Editor (Live searchable table, inline editor, add flag modal, raw JSON editor, and preset flag library)
4. Global (Bootstrapper selection, Launch arguments, GlobalBasicSettings_13.xml editor, Discord Rich Presence, telemetry blocking)
5. Mod (Client modifications: Death Sound, Mouse Cursor, Custom Font, Old Avatar Background, custom asset deployment, and mods folder management)

### Visual and UI Constraint
- Zero emojis across all UI elements, labels, buttons, and badges.
- All iconography must strictly use inline SVG or Material Icons (`<span class="material-icons-round">` or `<svg>`).
- UI must follow MultiRoblox's glassmorphism dark aesthetic: CSS variables (`--bg`, `--s1` through `--s4`, `--bd`, `--t1` through `--t3`, `--accent`, `--r1` through `--r3`).

---

## 1. UI Architecture & Layout

### Tab Hierarchy
Under `page-mixer`:
- Primary Tabs:
  - `mtab-graphics` (กราฟิกและเสียง)
  - `mtab-fps` (ประสิทธิภาพ FPS)
  - `mtab-window` (หน้าต่าง)
  - `mtab-antiafk` (Anti-AFK)
  - `mtab-voidstrap` (Voidstrap & FastFlags) - Active Hub
  - `mtab-reconnect` (เชื่อมต่อ & แจ้งเตือน)

- Inside `mtab-panel-voidstrap`, a sub-navigation bar (`vs-sub-tabs`):
  1. `vs-sub-config`: Configuration
  2. `vs-sub-fflags`: FastFlag Settings
  3. `vs-sub-editor`: FastFlag Editor
  4. `vs-sub-global`: Global
  5. `vs-sub-mods`: Mod

Each sub-tab button uses an SVG icon with crisp vector lines:
- Configuration: Slider/tune icon SVG
- FastFlag Settings: Toggle/switch icon SVG
- FastFlag Editor: Code/table editor icon SVG
- Global: Globe/terminal icon SVG
- Mod: Extension/palette icon SVG

---

## 2. Module 1: Configuration (การจัดการโปรไฟล์และการซิงค์)

### Functional Requirements
1. **Built-in Profiles**:
   - `potato`: Max FPS & Minimum VRAM/CPU for botting and multiple accounts. Disables all textures, enforces LOD distance 0, disables shadows, postfx, terrain textures, and caps FPS to 30/60.
   - `pvp`: Low latency, uncapped FPS, CFrame updates optimized, render multi-threading, no GUI blur, Alt+Enter exclusive fullscreen enabled.
   - `cinematic`: Future is Bright Phase 3 lighting, MSAA 4x, full textures, uncapped FPS, unlimited camera zoom.
   - `default`: Clean Roblox defaults with standard telemetry blocks.
2. **Custom User Profiles**:
   - Save current FastFlags + Global settings as a named custom profile.
   - Profile manager dropdown / card grid allowing instant activation, rename, or deletion.
   - Stored in `config/voidstrap_profiles.json` or within Electron's persistent `settings.json`.
3. **Import / Export**:
   - `Export Profile`: Saves current profile or all custom profiles as `.json`.
   - `Import Profile`: Loads `.json` configuration with schema validation.
4. **Sync Target Controller**:
   - Checkboxes with visual indicator badges:
     - Target 1: Roblox ClientSettings (`%localappdata%\Roblox\Versions\<latest>\ClientSettings\ClientAppSettings.json`)
     - Target 2: Voidstrap (`%localappdata%\Voidstrap\ClientSettings\...` & `VoidstrapMods\...`)
     - Target 3: Bloxstrap (`%localappdata%\Bloxstrap\Modifications\ClientSettings\...`)
   - Auto-sync toggle: Ensures target files are written synchronously before an account launches.

---

## 3. Module 2: FastFlag Settings (การตั้งค่าสวิตช์และพรีเซ็ต)

### Layout & Behavior
Searchable, collapsible card containers with expand/collapse SVG arrows and quick-filter text input.

### Categories & Flags

#### A. Rendering & Graphics
- **Graphic API Engine**: Dropdown (Automatic, Direct3D 11, Vulkan, OpenGL, Direct3D 10).
  - Flags: `FFlagDebugGraphicsDisableDirect3D11`, `FFlagDebugGraphicsPreferVulkan`, `FFlagDebugGraphicsPreferOpenGL`, `FFlagDebugGraphicsPreferD3D11`.
- **Lighting Technology**: Dropdown (Map Default, Future is Bright Phase 3, ShadowMap Phase 2, Voxel Phase 1, Compatibility).
  - Flags: `DFFlagDebugRenderForceFutureIsBrightPhase3`, `FFlagDebugForceFutureIsBrightPhase2`, `DFFlagDebugRenderForceTechnologyVoxel`.
- **Antialiasing (MSAA)**: Dropdown (Automatic, Off 1x, 2x, 4x, 8x).
  - Flags: `FIntDebugForceMSAASamples`.
- **Texture ACR (Remove Textures)**: Switch (`FFlagTextureUseACR3`, `FIntTextureUseACRHundredthPercent: 10000`).
- **Low Poly Meshes (CSG LOD Switch)**: Switch (`DFIntCSGLevelOfDetailSwitchingDistance: 0`, etc.).
- **Disable PostFX**: Switch (`FFlagDisablePostFx: True`).
- **Disable Player Shadows**: Switch (`FIntRenderShadowIntensity: 0`, `FIntRenderShadowmapBias: -1`).
- **Disable Terrain Textures**: Switch (`FIntTerrainArraySliceSize: 0`).
- **Gray Sky**: Switch (`FFlagDebugSkyGray: True`).

#### B. Framerate & Performance
- **Target FPS Cap**: Number input + Quick preset buttons (0 Unlimited, 30, 60, 120, 144, 165, 240, 360).
  - Flags & XML: `DFIntTaskSchedulerTargetFps` and `GlobalBasicSettings_13.xml` `<int name="FramerateCap">`.
- **Multi-threaded CPU Rendering**: Switch (`FFlagDebugCheckRenderThreading`, `FFlagRenderDebugCheckThreading2`, `DFIntRuntimeConcurrency: 64`).
- **CFrame Optimization**: Switch (`FFlagOptimizeCFrameUpdates4`, `FFlagOptimizeCFrameUpdatesIC4`).
- **Fast Asset Preloading**: Switch (`DFFlagEnableMeshPreloading2`, `DFIntNumAssetsMaxToPreload: 2147483647`).

#### C. User Interface & Experience
- **Escape Menu Version**: Dropdown (Default, Version 1 2015, Version 2 2020, Version 4 2023, Chrome UI).
  - Flags: `FStringUIBloxInGameMenuV4Rollout`, `FFlagEnableInGameMenuV3`, `FFlagEnableInGameMenuChrome`.
- **Disable GUI Blur on Esc**: Switch (`FIntRobloxGuiBlurIntensity: 0`).
- **Unlimited Camera Zoom**: Switch (`FIntCameraMaxZoomDistance: 2147483647`).
- **In-Game FPS & Frame Time Display**: Switch (`FFlagEnableFPSAndFrameTime: True`).
- **Disable DPI Scaling**: Switch (`DFFlagDisableDPIScale: True`).
- **Exclusive Fullscreen (Alt+Enter)**: Switch (`FFlagHandleAltEnterFullscreenManually: False`).

#### D. Privacy & Network
- **Disable Telemetry & Analytics**: Switch (`DFStringTelemetryV2Url: 0.0.0.0`, `FFlagDebugDisableTelemetry: True`, `DFFlagEnableTelemetryV2Points: False`).

---

## 4. Module 3: FastFlag Editor (ตัวแก้ไขและจัดการ Flags)

### Components
1. **Header Toolbar**:
   - Search filter input for instantaneous matching of flag names and values.
   - Filter by Flag Type (All, Boolean, Integer, String).
   - Action buttons: "Add Flag", "View Raw JSON", "Import JSON", "Export JSON", "Clear All".
2. **Interactive Data Table**:
   - Columns: Status indicator, Flag Name, Type tag, Live Value Editor, Delete Action.
   - Inline Editing:
     - Boolean: Interactive switch component.
     - Integer/String: Editable input cell with auto-save debounce or commit checkmark.
3. **Add Flag Modal / Drawer**:
   - Name input with autocomplete suggestions for popular FastFlags.
   - Type selector: Boolean (`True`/`False`), Integer (`number`), String (`text`).
   - Value input.
   - Validation preventing empty or duplicate flag keys.
4. **Raw JSON Editor Mode**:
   - Code-style monospace textarea with syntax validation indicator.
   - Shows formatted JSON representation of current flags.
   - Validates JSON format before applying changes.
5. **Preset Flags Library Drawer / Panel**:
   - Curated community presets categorized by purpose (Performance, Visuals, Mechanics, Debugging).
   - 1-Click "Add" button next to each preset with status tag if already added.

---

## 5. Module 4: Global (การตั้งค่าสากลและระบบ)

### Components
1. **Bootstrapper Selector & Executables**:
   - Choice: Roblox Official (`RobloxPlayerBeta.exe`), Voidstrap (`Voidstrap.exe`), Bloxstrap (`Bloxstrap.exe`).
   - Custom executable path picker with "Browse" button.
   - Detected version and path status badge with "Open Folder" button.
   - Additional Custom Launch Arguments text box (e.g. `--app`, `-silent`).
2. **Roblox GlobalBasicSettings_13.xml Integration**:
   - Direct read/write to `%localappdata%\Roblox\GlobalBasicSettings_13.xml`.
   - Settings: FramerateCap, GraphicsQualityLevel (1-21), MasterVolume (0-100), Fullscreen toggle.
3. **Discord Rich Presence (RPC)**:
   - Built-in lightweight Discord IPC client using Node.js `net` socket connection to `\\?\pipe\discord-ipc-0` (zero external dependencies).
   - Rich Presence status toggles:
     - Show active game title and place ID.
     - Show account username (optional privacy toggle).
     - Show elapsed play time.
     - Display custom MultiRoblox / Voidstrap artwork icon.
4. **Security & System Behavior**:
   - Telemetry and Crash reporting blocker.
   - Multi-Instance Mutex synchronization.

---

## 6. Module 5: Mod (Client Modifications)

### Components & Mod Engine
1. **Mod Storage Structure**:
   - Root Mod Directory: `userData/mods` or `src/assets/mods` with subdirectories:
     - `sounds/` -> `ouch.ogg` (Death Sound)
     - `textures/Cursors/KeyboardMouse/` -> ArrowFarCursor, ArrowCursor (Mouse Cursor)
     - `fonts/` -> Custom font files
     - `extra/` -> Custom user assets
2. **Preset Mod Switchers**:
   - **Death Sound**:
     - Modern (Roblox default)
     - Classic "Oof" (Bundled asset)
     - Silence (0-byte/muted audio asset)
     - Custom audio upload (Browse `.ogg`, `.mp3`, `.wav` - automatically converted or copied to `ouch.ogg`)
   - **Mouse Cursor**:
     - Modern 2021 (Roblox default)
     - 2006 Classic Pointer (Bundled assets)
     - 2013 Angled Arrow (Bundled assets)
     - Custom cursor upload (Browse `.png`, `.cur`)
   - **Custom Font**:
     - Roblox Default font
     - Bundled clean fonts
     - Custom Font upload (`.ttf`, `.otf`)
   - **Old Avatar Background**:
     - Switch to apply classic avatar editor background texture.
3. **Deployment Engine**:
   - Deploys assets directly to target directories depending on selected bootstrapper:
     - Roblox Official: `%localappdata%\Roblox\Versions\<latest>\content\`
     - Voidstrap: `%localappdata%\Voidstrap\VoidstrapMods\`
     - Bloxstrap: `%localappdata%\Bloxstrap\Modifications\`
   - "Open Mods Folder" button to open the local mod directory directly in Windows Explorer.
   - "Deploy Mods" action button and auto-deploy upon launch.

---

## Verification & Quality Standards
- Strict zero-emoji policy across all HTML templates, JavaScript notifications, and SVG icons.
- JSON schema validation for all FastFlag exports and imports.
- Robust error handling for file permissions and missing directories.
- Full verification through local test suite and manual UI inspection.
