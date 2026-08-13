<div align="center">

# Roblox Account Manager

**โปรแกรมจัดการและรันหลายบัญชี Roblox พร้อมกันบนระบบปฏิบัติการ Windows**

[![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?style=flat-square&logo=windows&logoColor=white)](https://github.com/phwyverysad/Roblox-Account-Manager)
[![Built With](https://img.shields.io/badge/Built%20With-Electron-47848F?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/phwyverysad/Roblox-Account-Manager?style=flat-square&color=gold)](https://github.com/phwyverysad/Roblox-Account-Manager/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/phwyverysad/Roblox-Account-Manager?style=flat-square&color=orange)](https://github.com/phwyverysad/Roblox-Account-Manager/issues)

[ภาพรวม](#ภาพรวม) | [ฟีเจอร์หลัก](#ฟีเจอร์หลัก) | [การติดตั้งและการใช้งาน](#การติดตั้งและการใช้งาน) | [หลักการทำงาน](#หลักการทำงาน) | [ความปลอดภัย](#ความปลอดภัย) | [สัญญาอนุญาต](#สัญญาอนุญาต)

</div>

---

## ภาพรวม

Roblox Account Manager (MultiRoblox) คือแอปพลิเคชันสำหรับบริหารจัดการและรันหลายบัญชี Roblox พร้อมกันบนระบบปฏิบัติการ Windows ช่วยให้ผู้ใช้สามารถเปิดเล่นเกม Roblox ได้หลายหน้าต่างโดยไม่มีข้อจำกัด พร้อมระบบควบคุมประสิทธิภาพ เครื่องมือ Anti-AFK และระบบรักษาความปลอดภัยของข้อมูลบัญชี

---

## ฟีเจอร์หลัก

### การจัดการบัญชี
* **เปิดหลายหน้าต่างพร้อมกัน**: รองรับการเปิดใช้งานหลายบัญชี Roblox ได้ไม่จำกัด
* **การเข้าสู่ระบบ**: เข้าสู่ระบบผ่านเบราว์เซอร์ Chrome ในตัว หรือนำเข้าคุกกี้ `.ROBLOSECURITY` โดยตรง
* **เป้าหมายการเข้าเล่น**: กำหนด Game ID หรือลิงก์ Private Server แยกตามบัญชีเพื่อเปิดเข้าเกมได้ทันที
* **การจัดระเบียบบัญชี**: กำหนดชื่อเรียก (Nickname) ค้นหา และกรองรายการบัญชีได้สะดวก
* **การจัดเก็บข้อมูลแบบเข้ารหัส**: ข้อมูลคุกกี้ถูกเข้ารหัสด้วย AES-256-GCM หรือ Windows DPAPI และจัดเก็บไว้ในเครื่องของผู้ใช้เท่านั้น

### ระบบกลุ่มบัญชี
* จัดกลุ่มบัญชีสำหรับการใช้งานเฉพาะทาง เช่น กลุ่มฟาร์มไอเทม หรือกลุ่มบัญชีเทรด
* สั่งเปิดใช้งานบัญชีทั้งกลุ่มได้พร้อมกันในคำสั่งเดียว

### ระบบควบคุมประสิทธิภาพและมิกเซอร์
* **การจำกัด FPS เบื้องหลัง (FPS Capper)**: จำกัดอัตราเฟรมเรตของหน้าต่าง Roblox ที่ไม่ได้โฟกัส เพื่อลดการทำงานของ CPU, GPU และ RAM
* **การควบคุมระดับเสียง**: ปรับระดับเสียงของแต่ละหน้าต่าง Roblox ได้แบบเรียลไทม์ผ่านระดับระบบปฏิบัติการ
* **การปรับแต่ง FastFlags**: ปรับค่าคุณภาพกราฟิกและ FPS Limit ลงใน Roblox FastFlags บนดิสก์โดยตรง
* **การปิดกระบวนการแบบเร่งด่วน**: ปุ่มสำหรับปิด Process ของ Roblox ทั้งหมดได้ในคลิกเดียว

### ระบบป้องกันการถูกเตะออก (Anti-AFK)
* ส่งสัญญาณคีย์บอร์ดไปยังทุกหน้าต่าง Roblox ตามช่วงเวลาที่กำหนด เพื่อป้องกันการถูกระบบเตะออกจากเกมเนื่องจากการอยู่นิ่งนานเกิน 20 นาที

### ชาร์ตเกมและระบบสร้างบัญชี
* **ชาร์ตเกม Roblox**: เรียกดูอันดับเกมยอดนิยม เกมที่มีคะแนนสูง และเกมสร้างรายได้ พร้อมปุ่มเปิดเล่นเกมได้ทันที
* **ระบบสร้างบัญชี**: รองรับการเชื่อมต่อกับบริการ BloxGen.net ผ่าน API Key เพื่อสร้างบัญชีใหม่

### การปรับแต่งและการตั้งค่า
* รองรับการสลับธีม สว่าง (Light) และ มืด (Dark)
* รองรับการปรับแต่งไฟล์เสียงแจ้งเตือนของ UI และการอัปโหลดไฟล์เสียงของผู้ใช้เอง
* ระบบแสดง Log แบบเรียลไทม์ พร้อมฟังก์ชันค้นหาในหน้าต่าง (Ctrl+F)

---

## การติดตั้งและการใช้งาน

### สิ่งที่จำเป็นต้องมี
* ระบบปฏิบัติการ Windows 10 หรือ Windows 11 (64-bit)
* Node.js (เวอร์ชัน 18.0.0 ขึ้นไป) และ npm
* Roblox Player ที่ติดตั้งเรียบร้อยแล้วในเครื่อง

### ขั้นตอนการรันจาก Source Code

1. คลองน์คลังข้อมูล (Repository)
   ```bash
   git clone https://github.com/phwyverysad/Roblox-Account-Manager.git
   cd Roblox-Account-Manager
   ```

2. ติดตั้ง Dependencies
   ```bash
   npm install
   ```

3. เริ่มต้นใช้งานในโหมดพัฒนา
   ```bash
   npm start
   ```

4. สร้างไฟล์โปรแกรมสำเร็จรูป (.exe)
   ```bash
   npm run build
   ```
   *ไฟล์โปรแกรม MultiRoblox.exe จะถูกสร้างไว้ในโฟลเดอร์ dist/*

---

## หลักการทำงาน

โดยปกติ Roblox จะป้องกันไม่ให้เปิดใช้งานหลายหน้าต่างพร้อมกันผ่าน Windows Mutex (`ROBLOX_singletonEvent`) 

Roblox Account Manager ทำงานร่วมกับตัวช่วย Native ภาษา C++ (`AntiAFKNative.exe`) ในการจัดการ Mutex ดังกล่าว ทำให้สามารถเปิดกระบวนการ Roblox เพิ่มเติมได้ และแต่ละบัญชีจะได้รับตั๋วยืนยันตัวตน (Auth Ticket) แยกจากกันอย่างเป็นอิสระ

---

## ความปลอดภัย

* **จัดเก็บข้อมูลในเครื่องเท่านั้น**: ข้อมูลบัญชีและคุกกี้ทั้งหมดจะถูกจัดเก็บไว้บนอุปกรณ์ของผู้ใช้เท่านั้น ไม่มีระบบส่งข้อมูลไปยังเซิร์ฟเวอร์ภายนอก
* **การเข้ารหัสระดับสูง**: ข้อมูลสำคัญถูกเข้ารหัสด้วยมาตรฐาน AES-256-GCM หรือ Windows DPAPI Keychain

---

## สัญญาอนุญาต

โปรเจกต์นี้เผยแพร่ภายใต้สัญญาอนุญาต MIT License

```
MIT License - Copyright (c) 2026 phwyverysad
```
