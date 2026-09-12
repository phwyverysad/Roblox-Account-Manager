<div align="center">

# Roblox Account Manager (MultiRoblox)

**โปรแกรมจัดการและรันหลายบัญชี Roblox พร้อมกันบนระบบปฏิบัติการ Windows**

[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D6?style=flat-square&logo=windows&logoColor=white)](https://github.com/phwyverysad/Roblox-Account-Manager)
[![Built With](https://img.shields.io/badge/Built%20With-Electron-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Languages](https://img.shields.io/badge/Languages-TH%20%7C%20EN%20%7C%20JA%20%7C%20ZH%20%7C%20KO%20%7C%20ES-5c5ce0?style=flat-square)](https://github.com/phwyverysad/Roblox-Account-Manager)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Download](https://img.shields.io/badge/Download-Latest%20Release-brightgreen?style=flat-square)](https://github.com/phwyverysad/Roblox-Account-Manager/releases/latest)
[![Tests](https://img.shields.io/badge/Tests-103%2F103%20Passing-brightgreen?style=flat-square)](https://github.com/phwyverysad/Roblox-Account-Manager)

[ภาพรวม](#ภาพรวม) | [ฟีเจอร์หลัก](#ฟีเจอร์หลัก) | [รูปแบบไฟล์ติดตั้งและการดาวน์โหลด](#รูปแบบไฟล์ติดตั้งและการดาวน์โหลด) | [การติดตั้งและการรันงาน](#การติดตั้งและการรันงาน) | [การทดสอบระบบ](#การทดสอบระบบ) | [หลักการทำงาน](#หลักการทำงาน) | [ความปลอดภัย](#ความปลอดภัย) | [สัญญาอนุญาต](#สัญญาอนุญาต)

</div>

---

## ภาพรวม

Roblox Account Manager (MultiRoblox) คือแอปพลิเคชันสำหรับบริหารจัดการและรันหลายบัญชี Roblox พร้อมกันบนระบบปฏิบัติการ Windows ช่วยให้ผู้ใช้สามารถเปิดเล่นเกม Roblox ได้หลายหน้าต่างโดยไม่มีข้อจำกัดเรื่อง Mutex พร้อมระบบควบคุมประสิทธิภาพ เครื่องมือ Anti-AFK การปรับแต่ง FastFlags ระบบ Discord Rich Presence และระบบรักษาความปลอดภัยของข้อมูลบัญชีขั้นสูง

---

## ฟีเจอร์หลัก

### 1. การจัดการหลายบัญชี (Multi-Account Management)
* **เปิดหลายหน้าต่างพร้อมกัน**: ปลดล็อกขีดจำกัดของระบบ ทำให้สามารถรัน Roblox ได้หลายบัญชีพร้อมกันบนเครื่องเดียว
* **การเข้าสู่ระบบ**: เข้าสู่ระบบผ่านเบราว์เซอร์ Chrome ในตัว หรือนำเข้าคุกกี้ `.ROBLOSECURITY` โดยตรง
* **การเปิดเข้าเกมอัตโนมัติ**: กำหนด Game ID หรือลิงก์ Private Server แยกตามแต่ละบัญชีเพื่อเปิดเข้าเกมได้ทันที
* **การจัดกลุ่มบัญชี**: จัดกลุ่มบัญชีสำหรับการใช้งานเฉพาะทาง เช่น กลุ่มฟาร์มไอเทม หรือกลุ่มเทรด พร้อมสั่งเปิดทั้งกลุ่มได้ในคลิกเดียว
* **การจัดเก็บข้อมูลแบบเข้ารหัส**: ข้อมูลคุกกี้และบัญชีทั้งหมดถูกเข้ารหัสด้วย AES-256-GCM หรือ Windows DPAPI Keychain ภายในเครื่องเท่านั้น

### 2. ตัวติดตั้งขนาดเล็กพิเศษ (Lightweight WebSetup Installer)
* **ไฟล์ติดตั้งขนาดเล็กเพียง ~303 KB**: สะดวกต่อการดาวน์โหลดและส่งต่อ
* **สร้างด้วย C# (.NET 4.0 Client Profile)**: ทำงานได้ทันทีบน Windows 10 และ Windows 11 ทุกเครื่องโดยไม่ต้องติดตั้งโปรแกรมเสริม
* **ระบบติดตั้งครบวงจร**: 
  * เลือกโฟลเดอร์ติดตั้งได้ตามต้องการ (ค่าเริ่มต้น `%LocalAppData%\Programs\MultiRoblox`)
  * สร้างทางลัดบนเดสก์ท็อปและ Start Menu อัตโนมัติ
  * ลงทะเบียนใน Windows Add/Remove Programs (Programs and Features) พร้อมคำสั่งถอนการติดตั้ง
  * รองรับการติดตั้งแบบออฟไลน์ (เมื่อมีไฟล์แพ็กเกจอยู่ด้วยกัน) และแบบออนไลน์ (ดาวน์โหลดเวอร์ชันล่าสุดจาก GitHub Releases)
  * รองรับ Silent Install แบบอัตโนมัติผ่านพารามิเตอร์ `/S`

### 3. ระบบหลายภาษา (Multi-Language Engine - i18n)
* รองรับภาษาถึง 6 ภาษา: ภาษาไทย (Thai), อังกฤษ (English), ญี่ปุ่น (Japanese), จีน (Chinese Simplified), เกาหลี (Korean) และ สเปน (Spanish)
* แปลภาษาครอบคลุมทั้งหน้าจอ รวมถึงข้อความสถานะ กล่องโต้ตอบ และการแสดงผลเวลาสัมพัทธ์ (`formatTimeAgo`)
* สลับภาษาได้ทันทีแบบเรียลไทม์โดยไม่ต้องรีสตาร์ตโปรแกรม

### 4. Discord Rich Presence (RPC)
* แสดงสถานะการเล่นเกม Roblox บนโปรไฟล์ Discord ของผู้ใช้แบบเรียลไทม์
* แสดงชื่อเกม เวลาที่เล่น และบัญชีที่ใช้งาน
* มีโหมดความเป็นส่วนตัว (Privacy Mode) สำหรับซ่อนชื่อบัญชีหรือรายละเอียดเมื่อไม่ต้องการเปิดเผย
* การ์ดแสดงตัวอย่างสถานะสด (Live Activity Preview) ในหน้าการตั้งค่า

### 5. หน้าต่างหน้าหลัก Roblox และตัวเลือกบัญชี (Roblox Home Webview)
* เชื่อมต่อหน้าหลัก Roblox (`https://www.roblox.com/th/home`) ในตัวผ่าน Webview ที่แยก Session ชัดเจน (`persist:roblox-home`)
* กล่องเลือกบัญชีหน้าหลัก (Home Account Selector Dropdown) ปรับสีตามธีมของโปรแกรมอัตโนมัติ (Light / Dark Mode และ Custom Accent)
* ระบบแสดงผลเงาตกกระทบแบบนุ่มนวล ไร้รอยตัดขอบสี่เหลี่ยม และจัดแนวพิกัดตรงกับปุ่มหลักอย่างแม่นยำ

### 6. ชุดปรับแต่งกราฟิกและ FastFlags (Voidstrap Tuning Suite)
* ตัวแก้ไข FastFlags พร้อมโปรไฟล์สำเร็จรูป: Potato (เน้นประสิทธิภาพสูงสุด), PvP, Cinematic และ Default
* ปรับแต่งเอนจินกราฟิก (D3D11, Vulkan ฯลฯ) และเทคโนโลยีแสงเงา
* ควบคุมและจำกัด Framerate (FPS Capper) ลงใน `GlobalBasicSettings_13.xml` และ `ClientAppSettings.json` โดยตรง
* ติดตั้ง Mod เสียงและ Cursor ย้อนยุคเข้าสู่ Roblox ได้ในคลิกเดียว

### 7. ระบบจัดเรียงหน้าต่าง (Window Layout Workspace)
* กำหนดตำแหน่งและขนาดของแต่ละหน้าต่าง Roblox ได้อย่างอิสระ
* รองรับการจัดระเบียบหน้าต่างเข้าสู่ Grid แบบหลายหน้าจออัตโนมัติเมื่อเปิดเกม (Auto-Grid on Launch)

### 8. ระบบป้องกันการถูกตัดการเชื่อมต่อ (Anti-AFK)
* ควบคุมผ่านโมดูล Native ภาษา C++ (`AntiAFKNative.exe`)
* ส่งสัญญาณคีย์บอร์ดระดับฮาร์ดแวร์จำลองไปยังทุกหน้าต่าง Roblox ตามรอบเวลาที่กำหนด เพื่อป้องกันการถูกตัดออกจากเซิร์ฟเวอร์เนื่องจากการอยู่นิ่งเกิน 20 นาที

---

## รูปแบบไฟล์ติดตั้งและการดาวน์โหลด

สามารถดาวน์โหลดไฟล์เวอร์ชันล่าสุดได้จาก [GitHub Releases](https://github.com/phwyverysad/Roblox-Account-Manager/releases/latest):

| ไฟล์ | ขนาด | คำอธิบาย |
| :--- | :---: | :--- |
| **`MultiRoblox-WebSetup.exe`** | **~303 KB** | **ตัวติดตั้งออนไลน์ขนาดเล็กพิเศษ** ดาวน์โหลดเร็ว ติดตั้งและสร้างช็อตคัทให้อัตโนมัติ |
| **`MultiRoblox.exe`** | **~119 MB** | **โปรแกรมตัวเต็มแบบ Portable** เปิดใช้งานได้ทันทีโดยไม่ต้องผ่านกระบวนการติดตั้ง |

---

## การติดตั้งและการรันงาน

### สิ่งที่จำเป็นต้องมี
* ระบบปฏิบัติการ: Windows 10 หรือ Windows 11 (64-bit)
* สภาพแวดล้อมการพัฒนา: Node.js (เวอร์ชัน 18.0.0 ขึ้นไป) และ npm
* ตัวเกม: Roblox Player ที่ติดตั้งเรียบร้อยแล้วในเครื่อง

### การรันในโหมดพัฒนา (Development)

1. คลอนคลังข้อมูล (Clone Repository)
   ```bash
   git clone https://github.com/phwyverysad/Roblox-Account-Manager.git
   cd Roblox-Account-Manager
   ```

2. ติดตั้ง Dependencies
   ```bash
   npm install
   ```

3. เริ่มต้นใช้งานโปรแกรม
   ```bash
   npm start
   ```

### การคอมไพล์โปรแกรม (Build)

* คอมไพล์โปรแกรมตัวเต็ม (`MultiRoblox.exe`) และตัวติดตั้งขนาดเล็ก (`MultiRoblox-WebSetup.exe`) พร้อมกัน:
  ```bash
  npm run build
  ```
  *ไฟล์ผลลัพธ์ทั้งหมดจะถูกสร้างไว้ในโฟลเดอร์ `dist/`*

* คอมไพล์เฉพาะตัวติดตั้ง WebSetup ขนาดเล็ก:
  ```bash
  npm run build:websetup
  ```

* คอมไพล์ตัวช่วย Native C++ (`AntiAFKNative.exe`):
  ```bash
  node scripts/build-native.js
  ```

---

## การทดสอบระบบ

โปรเจกต์นี้มีชุดทดสอบอัตโนมัติครอบคลุมทั้งสถาปัตยกรรม การทำงาน และความถูกต้องของ UI รวม 23 Test Suites:

```bash
npm test
```

ผลการทดสอบ: **103/103 รายการทดสอบสำเร็จสมบูรณ์ 100% (All Passed)**

---

## หลักการทำงาน

โดยปกติระบบปฏิบัติการ Windows และ Roblox Client จะป้องกันไม่ให้เปิดใช้งานตัวเกมหลายหน้าต่างพร้อมกันผ่าน Windows Mutex (`ROBLOX_singletonEvent`)

Roblox Account Manager ใช้ตัวช่วย Native ภาษา C++ (`AntiAFKNative.exe`) ในการจัดการ Mutex ดังกล่าวในช่วงเวลาที่เหมาะสม ทำให้กระบวนการ Roblox ใหม่สามารถเริ่มต้นทำงานได้ จากนั้นจึงส่งมอบ Auth Ticket ที่เป็นอิสระต่อกันของแต่ละบัญชีเพื่อเข้าสู่เซิร์ฟเวอร์

---

## ความปลอดภัย

* **จัดเก็บข้อมูลในเครื่องเท่านั้น**: ข้อมูลบัญชี รหัส และคุกกี้ทั้งหมดถูกจัดเก็บอยู่บนอุปกรณ์ของผู้ใช้เท่านั้น ไม่มีการส่งข้อมูลใดๆ ออกไปยังเซิร์ฟเวอร์ภายนอก
* **การเข้ารหัสระดับความปลอดภัยสูง**: ข้อมูลสำคัญถูกเข้ารหัสด้วยมาตรฐาน AES-256-GCM หรือ Windows DPAPI
* **การแยก Session ปลอดภัย**: แต่ละบัญชีจะใช้คอนเทนเนอร์และแคชที่แยกจากกันอย่างเด็ดขาด

---

## สัญญาอนุญาต

โปรเจกต์นี้เผยแพร่ภายใต้สัญญาอนุญาต MIT License

```
MIT License - Copyright (c) 2026 phwyverysad
```
