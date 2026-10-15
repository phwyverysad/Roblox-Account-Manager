<div align="center">

# Roblox Account Manager (MultiRoblox)

**Manage and run multiple Roblox accounts simultaneously on Windows**

[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D6?style=flat-square&logo=windows&logoColor=white)](https://github.com/phwyverysad/Roblox-Account-Manager)
[![Built With](https://img.shields.io/badge/Built%20With-Electron-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Languages](https://img.shields.io/badge/Languages-TH%20%7C%20EN%20%7C%20JA%20%7C%20ZH%20%7C%20KO%20%7C%20ES-5c5ce0?style=flat-square)](https://github.com/phwyverysad/Roblox-Account-Manager)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Download](https://img.shields.io/badge/Download-Latest%20Release-brightgreen?style=flat-square)](https://github.com/phwyverysad/Roblox-Account-Manager/releases/latest)

</div>

---

## Overview

Roblox Account Manager (MultiRoblox) is an application designed to run and manage multiple Roblox accounts simultaneously on Windows. It bypasses the single-instance mutex constraint via a native C++ helper, featuring account security, an Anti-AFK engine, and comprehensive performance optimization tools.

---

## Key Features

* **Multi-Instance**: Run unlimited Roblox accounts simultaneously using a native C++ mutex helper.
* **WebSetup Installer**: Lightweight installer (~303 KB) that automatically downloads, installs, and creates desktop shortcuts.
* **Portable Executable**: Standalone portable build (~119 MB) ready to run without installation.
* **Anti-AFK System**: Prevents idle disconnects from the 20-minute inactivity kick across all game windows.
* **Multi-Language (i18n)**: Supports 6 languages (Thai, English, Japanese, Chinese, Korean, Spanish) with instant real-time switching.
* **Discord Rich Presence (RPC)**: Displays live gameplay activity on Discord with configurable templates and Privacy Mode.
* **Roblox Home Webview**: Embedded Roblox home window with a theme-adaptive account selector menu.
* **Voidstrap & FastFlags**: Fine-tune graphics, FPS cap, and one-click presets (Potato, PvP, Cinematic).
* **Window Grid Layout**: Automatically saves window coordinates and tiles Roblox game instances across multiple monitors.
* **Security & Privacy**: Cookie encryption with AES-256-GCM / DPAPI with strictly local on-device data storage.

---

## Downloads

Download the latest version from [GitHub Releases](https://github.com/phwyverysad/Roblox-Account-Manager/releases/latest):

| File | Size | Type |
| :--- | :---: | :--- |
| **`MultiRoblox-WebSetup.exe`** | **~303 KB** | **Lightweight Installer** Automatically installs into system and creates desktop shortcuts |
| **`MultiRoblox.exe`** | **~119 MB** | **Standalone Portable** Portable binary ready to run immediately without installation |

---

## Quick Start & Build

### Running from Source Code
```bash
# Clone repository and install dependencies
git clone https://github.com/phwyverysad/Roblox-Account-Manager.git
cd Roblox-Account-Manager
npm install

# Start application
npm start
```

### Build Commands
```bash
# Build both MultiRoblox.exe and WebSetup installer
npm run build

# Build only the lightweight WebSetup installer (~303 KB)
npm run build:websetup
```

---

## License

This project is licensed under the [MIT License](LICENSE) - Copyright (c) 2026 phwyverysad
