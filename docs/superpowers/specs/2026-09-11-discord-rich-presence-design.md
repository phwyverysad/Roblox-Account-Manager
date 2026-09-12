# Design Document: Discord Rich Presence (RPC) Integration

- Author: Antigravity Assistant & phwyverysad
- Date: 2026-09-11
- Status: Approved
- Scope: Architectural subsystem for Discord RPC connection, customization settings, dynamic template tags, and live preview.

---

## 1. Executive Summary

Integrate a zero-dependency, high-performance Discord Rich Presence (RPC) subsystem into MultiRoblox. This subsystem communicates with local Discord desktop clients via Windows Named Pipes (`\\?\pipe\discord-ipc-0` through `9`), displaying real-time gaming activity, active account counts, game places, and custom templates with privacy/streamer protection.

---

## 2. Architecture & Components

Main Process:
- DiscordRpcClient in `src/discordRpc.js`
- Handshake (Opcode 0), SetActivity (Opcode 1), ClearActivity (Opcode 1 args null), Close (Opcode 2)
- Dynamic variable tags parser: `{online}`, `{total}`, `{game}`, `{user}`, `{afk}`, `{fps}`
- Streamer / Privacy mode masking

Renderer Frontend:
- Tab in Settings: Discord RPC (`#stab-panel-discord-rpc`)
- Live Interactive Discord Activity Card Preview
- Presets: Farming, Gaming, Minimal, Custom
- Action buttons configuration (up to 2 buttons)

---

## 3. Verification
- Test-Driven Development with Suite 17 in `test_customization.js`
- Zero emojis compliance across all files
