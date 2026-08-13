<div align="center">

# 🎮 Roblox Account Manager

**Manage and run multiple Roblox accounts simultaneously on Windows with full control and maximum performance.**

[![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/phwyverysad/Roblox-Account-Manager)
[![Built With](https://img.shields.io/badge/Built%20With-Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/phwyverysad/Roblox-Account-Manager?style=for-the-badge&color=gold)](https://github.com/phwyverysad/Roblox-Account-Manager/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/phwyverysad/Roblox-Account-Manager?style=for-the-badge&color=orange)](https://github.com/phwyverysad/Roblox-Account-Manager/issues)

[✨ Features](#-key-features--ฟีเจอร์หลัก) • [🚀 Getting Started](#-getting-started--วิธีการใช้งาน) • [🛠️ How It Works](#%EF%B8%8F-how-it-works--หลักการทำงาน) • [🔒 Security](#-security--privacy--ความปลอดภัย) • [📜 License](#-license)

</div>

---

## 🌟 Overview / ภาพรวม

**Roblox Account Manager (MultiRoblox)** คือโปรแกรมรันหลายบัญชี Roblox บนระบบปฏิบัติการ Windows ช่วยให้คุณสามารถเข้าเล่นเกม Roblox หลายบัญชีพร้อมกันได้โดยไม่มีขีดจำกัด พร้อมระบบควบคุมประสิทธิภาพ (Mixer), ระบบจำกัด FPS, Anti-AFK และระบบความปลอดภัยขั้นสูง

---

## ✨ Key Features / ฟีเจอร์หลัก

### 👤 Account Management / การจัดการบัญชี
- **Multi-Instance Launch**: เปิดใช้งานหลายบัญชี Roblox พร้อมกันได้ไม่จำกัด
- **Seamless Login**: เข้าสู่ระบบผ่าน Built-in Chrome Browser หรือใส่ Cookie `.ROBLOSECURITY` โดยตรง
- **Custom Target**: ตั้งค่า Game ID หรือ Private Server Link สำหรับแต่ละบัญชีเพื่อเปิดเข้าเกมโดยตรง
- **Account Organization**: ตั้งชื่อเล่น (Nicknames), ค้นหา และกรองบัญชีได้อย่างรวดเร็ว
- **Secure Encrypted Storage**: บันทึกข้อมูลด้วยการเข้ารหัส **AES-256-GCM** หรือ **Windows DPAPI** ข้อมูลทั้งหมดเก็บไว้ในเครื่องของคุณเท่านั้น

### 📦 Account Groups & Packages / ระบบกลุ่มบัญชี
- จัดกลุ่มบัญชี (เช่น Squad ฟาร์มของ, บัญชีเทรด)
- สั่งรันบัญชีทั้งกลุ่มได้พร้อมกันในคลิกเดียว

### 🎛️ Instance Mixer & Performance Control / ระบบควบคุมประสิทธิภาพ
- **FPS Capper**: จำกัด FPS ของหน้าต่าง Roblox ที่อยู่เบื้องหลัง เพื่อประหยัดทรัพยากร CPU, GPU และ RAM
- **Audio Control**: ปรับระดับเสียง (Volume) ของ Roblox แต่ละจอได้แบบ Real-time ที่ระดับ OS
- **FastFlags Tweaks**: ปรับแต่งค่า Render Quality และ FPS Limit ลงใน Roblox FastFlags โดยตรง
- **One-Click Kill**: ปุ่มสำหรับปิด Process Roblox ทั้งหมดได้ทันที

### 🛡️ Anti-AFK System / ระบบป้องกันการถูกเตะออก
- ระบบจำลองการกดปุ่มคีย์บอร์ดตามช่วงเวลาที่กำหนด ส่งสัญญาณไปยังทุกหน้าต่าง Roblox เพื่อป้องกันการหลุดจากการอยู่นิ่ง (20-minute idle kick)

### 📊 Game Charts & Generator / ชาร์ตเกมและระบบสร้างบัญชี
- **Roblox Charts**: ดูอันดับเกมยอดนิยม, คะแนนสูง และเกมสร้างรายได้ พร้อมปุ่มเปิดเล่นเกมได้ทันที
- **Account Generator**: รองรับการเชื่อมต่อ API กับ [BloxGen.net](https://bloxgen.net/) เพื่อสร้างบัญชีใหม่

### 🎨 Customization & Settings / การปรับแต่ง
- รองรับการเปลี่ยนธีม Light / Dark Theme
- ปรับแต่งโปรไฟล์เสียงแจ้งเตือน (UI Sound Profiles) หรืออัปโหลดเสียงของตัวเองได้
- Real-time Log Viewer พร้อมระบบค้นหาในหน้าต่าง (Ctrl+F)

---

## 🚀 Getting Started / วิธีการใช้งาน

### Prerequisites / สิ่งที่จำเป็นต้องมี
- **Windows 10 / 11** (64-bit)
- **Node.js** (v18 ขึ้นไป) และ **npm**
- **Roblox Player** ติดตั้งอยู่ในเครื่อง

### Installation & Run from Source / ขั้นตอนการติดตั้งและรันโปรแกรม

1. **Clone Repository**
   ```bash
   git clone https://github.com/phwyverysad/Roblox-Account-Manager.git
   cd Roblox-Account-Manager
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Application (Development Mode)**
   ```bash
   npm start
   ```

4. **Build Executable (.exe)**
   ```bash
   npm run build
   ```
   *ไฟล์ Portable Executable (`MultiRoblox.exe`) จะถูกสร้างไว้ในโฟลเดอร์ `dist/`*

---

## 🛠️ How It Works / หลักการทำงาน

Roblox ปกติจะไม่อนุญาตให้เปิดหลายหน้าต่างโดยใช้ **Windows Mutex (`ROBLOX_singletonEvent`)** 

**Roblox Account Manager** แก้ปัญหานี้โดยใช้ Helper Native C++ (`AntiAFKNative.exe`) ในการจัดการปลดล็อก Mutex ดังกล่าว ทำให้สามารถรัน Roblox หลาย Process พร้อมกันได้ โดยแต่ละบัญชีจะได้รับ Auth Ticket แยกกันอย่างเป็นอิสระ

---

## 🔒 Security & Privacy / ความปลอดภัย

- 🔐 **Local Data Only**: ข้อมูลและ Cookie ทั้งหมดถูกจัดเก็บไว้ในเครื่องของคุณเท่านั้น ไม่มีการส่งออกไปยัง Server ภายนอก
- 🛡️ **Strong Encryption**: ข้อมูลสำคัญถูกเข้ารหัสด้วยมาตรฐาน **AES-256-GCM** หรือ **Windows DPAPI Keychain**

---

## 📜 License

Project นี้อยู่ภายใต้สัญญาอนุญาต [MIT License](LICENSE)

```
MIT License - Copyright (c) 2026 phwyverysad
```
