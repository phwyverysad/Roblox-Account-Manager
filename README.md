<div align="center">

# Roblox Account Manager (MultiRoblox)

**โปรแกรมจัดการและรันหลายบัญชี Roblox พร้อมกันบน Windows**

[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D6?style=flat-square&logo=windows&logoColor=white)](https://github.com/phwyverysad/Roblox-Account-Manager)
[![Built With](https://img.shields.io/badge/Built%20With-Electron-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Languages](https://img.shields.io/badge/Languages-TH%20%7C%20EN%20%7C%20JA%20%7C%20ZH%20%7C%20KO%20%7C%20ES-5c5ce0?style=flat-square)](https://github.com/phwyverysad/Roblox-Account-Manager)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Download](https://img.shields.io/badge/Download-Latest%20Release-brightgreen?style=flat-square)](https://github.com/phwyverysad/Roblox-Account-Manager/releases/latest)
[![Tests](https://img.shields.io/badge/Tests-103%2F103%20Passing-brightgreen?style=flat-square)](https://github.com/phwyverysad/Roblox-Account-Manager)

</div>

---

## ภาพรวม (Overview)

Roblox Account Manager (MultiRoblox) คือโปรแกรมสำหรับรันและจัดการหลายบัญชี Roblox พร้อมกันบน Windows ปลดล็อกขีดจำกัด Singleton Mutex ด้วยตัวช่วย Native C++ พร้อมระบบรักษาความปลอดภัย ป้องกันการหลุด (Anti-AFK) และเครื่องมือปรับแต่งประสิทธิภาพครบวงจร

---

## ฟีเจอร์เด่น (Key Features)

* **Multi-Instance**: เปิดใช้งานหลายบัญชี Roblox พร้อมกันได้ไม่จำกัดด้วยตัวช่วย C++ Mutex
* **WebSetup Installer**: ตัวติดตั้งขนาดเล็กเพียง ~303 KB สร้างช็อตคัทและดาวน์โหลดติดตั้งให้อัตโนมัติ
* **Portable Executable**: ตัวโปรแกรมตัวเต็มแบบพกพา (~119 MB) ใช้งานได้ทันทีโดยไม่ต้องติดตั้ง
* **Anti-AFK System**: ระบบป้องกันการถูกเตะออกจากการอยู่นิ่งเกิน 20 นาทีในทุกหน้าต่างเกม
* **Multi-Language (i18n)**: รองรับ 6 ภาษา (ไทย, อังกฤษ, ญี่ปุ่น, จีน, เกาหลี, สเปน) สลับได้ทันทีแบบเรียลไทม์
* **Discord Rich Presence (RPC)**: แสดงสถานะการเล่นเกมสดบน Discord พร้อมโหมดความเป็นส่วนตัว (Privacy Mode)
* **Roblox Home Webview**: หน้าต่างหน้าหลัก Roblox ในตัว พร้อมเมนูเลือกบัญชีที่ปรับสีตามธีมอัตโนมัติ
* **Voidstrap & FastFlags**: ปรับแต่งค่ากราฟิก, FPS Cap และโปรไฟล์สำเร็จรูป (Potato, PvP, Cinematic)
* **Window Grid Layout**: บันทึกพิกัดและจัดเรียงหน้าต่าง Roblox เข้ากริดหลายจอภาพอัตโนมัติ
* **Security & Privacy**: เข้ารหัสคุกกี้ด้วย AES-256-GCM / DPAPI จัดเก็บข้อมูลเฉพาะในเครื่องเท่านั้น

---

## ดาวน์โหลด (Downloads)

ดาวน์โหลดเวอร์ชันล่าสุดได้ที่ [GitHub Releases](https://github.com/phwyverysad/Roblox-Account-Manager/releases/latest):

| ไฟล์ | ขนาด | รูปแบบการใช้งาน |
| :--- | :---: | :--- |
| **`MultiRoblox-WebSetup.exe`** | **~303 KB** | **ตัวติดตั้งขนาดเล็ก** ติดตั้งลงระบบและสร้างช็อตคัทบนเดสก์ท็อปให้อัตโนมัติ |
| **`MultiRoblox.exe`** | **~119 MB** | **โปรแกรมตัวเต็มแบบ Portable** พกพาเปิดใช้งานได้ทันทีไม่ต้องติดตั้ง |

---

## การเริ่มต้นใช้งานและการคอมไพล์ (Quick Start & Build)

### รันจาก Source Code
```bash
# โคลนและติดตั้ง Dependencies
git clone https://github.com/phwyverysad/Roblox-Account-Manager.git
cd Roblox-Account-Manager
npm install

# เริ่มต้นใช้งานโปรแกรม
npm start
```

### คำสั่งคอมไพล์ (Build Commands)
```bash
# คอมไพล์ทั้ง MultiRoblox.exe และ WebSetup พร้อมกัน
npm run build

# คอมไพล์เฉพาะตัวติดตั้ง WebSetup ขนาดเล็ก (~303 KB)
npm run build:websetup

# รันชุดทดสอบอัตโนมัติ (103/103 Tests Passing)
npm test
```

---

## สัญญาอนุญาต (License)

โปรเจกต์นี้เผยแพร่ภายใต้สัญญาอนุญาต [MIT License](LICENSE) - Copyright (c) 2026 phwyverysad
